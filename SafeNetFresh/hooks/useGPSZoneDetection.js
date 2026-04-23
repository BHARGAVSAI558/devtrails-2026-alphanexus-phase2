import { useState } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { zones } from '../services/api';
import { formatShortLocation } from '../utils/locationDisplay';

// ─── Constants ────────────────────────────────────────────────────────────────
// Accept a fix only if accuracy is within this threshold (metres).
// If the first fix is worse, we retry / watch for a better one.
const ACCURACY_THRESHOLD_M = 200;
const WATCH_TIMEOUT_MS = 8000;   // max time to watch for a better fix
const GPS_TIMEOUT_MS = 15000;    // timeout for getCurrentPositionAsync

// ─── Dev logging ──────────────────────────────────────────────────────────────
function _log(msg, data) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log(`[GPS] ${msg}`, data !== undefined ? data : '');
  }
}

// ─── Reverse geocode ──────────────────────────────────────────────────────────
/**
 * Reverse geocode using Nominatim (OSM) — returns locality-level name,
 * not just city center. Falls back to Open-Meteo proxy if Nominatim fails.
 */
async function reverseGeocodeNominatim(latitude, longitude) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(String(latitude))}` +
      `&lon=${encodeURIComponent(String(longitude))}&format=json&addressdetails=1&zoom=16`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'SafeNet-App/1.0' },
    });
    if (!res.ok) throw new Error('nominatim_failed');
    const data = await res.json();
    const addr = data?.address || {};
    // Prefer the most specific locality name available
    const placeName =
      addr.neighbourhood ||
      addr.suburb ||
      addr.quarter ||
      addr.hamlet ||
      addr.village ||
      addr.town ||
      addr.city_district ||
      addr.district ||
      data?.name ||
      null;
    const cityName =
      addr.city ||
      addr.town ||
      addr.county ||
      addr.state_district ||
      addr.state ||
      null;
    _log('Nominatim reverse geocode', { placeName, cityName });
    return { placeName, cityName };
  } catch {
    return { placeName: null, cityName: null };
  }
}

/** Fallback: Open-Meteo via backend proxy */
async function reverseGeocodeOpenMeteo(latitude, longitude) {
  try {
    const proxy = zones.reverseGeocodeURL?.(latitude, longitude);
    const u =
      proxy ||
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${encodeURIComponent(
        String(latitude)
      )}&longitude=${encodeURIComponent(String(longitude))}&language=en`;
    const res = await fetch(u);
    if (!res.ok) return { placeName: null, cityName: null };
    const data = await res.json();
    if (data && typeof data === 'object' && ('placeName' in data || 'cityName' in data)) {
      return { placeName: data.placeName || null, cityName: data.cityName || null };
    }
    const r = data?.results?.[0];
    if (!r) return { placeName: null, cityName: null };
    return {
      placeName: r.name || r.admin4 || r.admin3 || null,
      cityName: r.admin2 || r.admin1 || r.name || null,
    };
  } catch {
    return { placeName: null, cityName: null };
  }
}

async function reverseGeocode(latitude, longitude) {
  // Try Nominatim first (more precise locality names)
  const nom = await reverseGeocodeNominatim(latitude, longitude);
  if (nom.placeName) return nom;
  // Fallback to Open-Meteo
  return reverseGeocodeOpenMeteo(latitude, longitude);
}

// ─── Web high-accuracy geolocation ───────────────────────────────────────────
function getWebPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator?.geolocation) {
      reject(new Error('geolocation_unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

// ─── Native GPS: warm-up + high-accuracy fix + watch refinement ───────────────
async function getNativePosition(onProgress) {
  // Step 1: Quick last-known position as placeholder (warms GPS chip)
  let lastKnown = null;
  try {
    lastKnown = await Location.getLastKnownPositionAsync({ maxAge: 30000 });
    if (lastKnown?.coords) {
      _log('Last known position', {
        lat: lastKnown.coords.latitude.toFixed(5),
        lng: lastKnown.coords.longitude.toFixed(5),
        accuracy: lastKnown.coords.accuracy,
      });
      // Notify caller of placeholder so UI can show something immediately
      onProgress?.({ coords: lastKnown.coords, isPlaceholder: true });
    }
  } catch (_) {}

  // Step 2: Request fresh high-accuracy fix
  _log('Requesting fresh high-accuracy GPS fix');
  onProgress?.({ status: 'improving' });

  let fix = null;
  try {
    fix = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        mayShowUserSettingsDialog: true,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('gps_timeout')), GPS_TIMEOUT_MS)
      ),
    ]);
    _log('Fresh GPS fix', {
      lat: fix.coords.latitude.toFixed(5),
      lng: fix.coords.longitude.toFixed(5),
      accuracy: `${Math.round(fix.coords.accuracy)}m`,
    });
  } catch (e) {
    _log('Fresh GPS fix failed', e?.message);
    // If we have a last-known, use it rather than failing completely
    if (lastKnown?.coords) {
      _log('Falling back to last-known position');
      return lastKnown;
    }
    throw e;
  }

  // Step 3: If accuracy is poor, watch for a better fix for up to WATCH_TIMEOUT_MS
  if (fix.coords.accuracy > ACCURACY_THRESHOLD_M) {
    _log(`Accuracy ${Math.round(fix.coords.accuracy)}m > ${ACCURACY_THRESHOLD_M}m threshold — watching for better fix`);
    onProgress?.({ status: 'refining' });

    fix = await new Promise((resolve) => {
      let best = fix;
      let sub = null;
      const timer = setTimeout(() => {
        sub?.remove?.();
        _log(`Watch timeout — best accuracy: ${Math.round(best.coords.accuracy)}m`);
        resolve(best);
      }, WATCH_TIMEOUT_MS);

      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 0 },
        (loc) => {
          _log(`Watch update: accuracy ${Math.round(loc.coords.accuracy)}m`);
          if (loc.coords.accuracy < best.coords.accuracy) {
            best = loc;
          }
          if (loc.coords.accuracy <= ACCURACY_THRESHOLD_M) {
            clearTimeout(timer);
            sub?.remove?.();
            _log(`Good fix achieved: ${Math.round(loc.coords.accuracy)}m`);
            resolve(loc);
          }
        }
      ).then((s) => { sub = s; }).catch(() => {
        clearTimeout(timer);
        resolve(best);
      });
    });
  }

  _log(`Final accuracy: ${Math.round(fix.coords.accuracy)}m`);
  return fix;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useGPSZoneDetection() {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [gpsStatus, setGpsStatus] = useState(''); // 'detecting' | 'improving' | 'refining'

  const detectZone = async (input = null) => {
    setGpsLoading(true);
    setGpsError('');
    setGpsStatus('detecting');
    try {
      let latitude = Number(input?.lat);
      let longitude = Number(input?.lng);
      let placeName = input?.placeName || null;
      let cityName = null;
      let accuracyM = null;

      // ── Use provided coordinates (from search) ──────────────────────────
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        _log('Using provided coordinates', { lat: latitude, lng: longitude });
      } else {
        // ── Request GPS ───────────────────────────────────────────────────
        if (Platform.OS === 'web') {
          _log('Web: requesting high-accuracy geolocation');
          try {
            const pos = await getWebPosition();
            latitude = pos.coords.latitude;
            longitude = pos.coords.longitude;
            accuracyM = pos.coords.accuracy;
            _log('Web GPS success', { lat: latitude.toFixed(5), lng: longitude.toFixed(5), accuracy: `${Math.round(accuracyM)}m` });
          } catch (e) {
            const code = e?.code;
            if (code === 1) {
              setGpsError('Location permission needed for accurate coverage pricing. Please allow location access.');
              return null;
            }
            if (code === 2) {
              setGpsError('Move near a window or outside for better GPS signal.');
              return null;
            }
            setGpsError('Could not detect location. Please search manually.');
            return null;
          }
        } else {
          // Native
          _log('Native: requesting foreground permission');
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            _log('Permission denied');
            setGpsError('Location permission needed for accurate coverage pricing. Please enable it in Settings.');
            return null;
          }
          _log('Permission granted');

          try {
            const fix = await getNativePosition((progress) => {
              if (progress?.status === 'improving') setGpsStatus('improving');
              if (progress?.status === 'refining') setGpsStatus('refining');
            });
            latitude = fix.coords.latitude;
            longitude = fix.coords.longitude;
            accuracyM = fix.coords.accuracy;
            _log(`Using fix: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (±${Math.round(accuracyM)}m)`);
          } catch (e) {
            _log('GPS failed', e?.message);
            if (e?.message === 'gps_timeout') {
              setGpsError('Move near a window or outside for better GPS signal.');
            } else {
              setGpsError('Could not detect location. Please search manually.');
            }
            return null;
          }
        }
      }

      // ── Reverse geocode using exact coordinates ────────────────────────
      _log('Reverse geocoding', { lat: latitude.toFixed(5), lng: longitude.toFixed(5) });
      const geocoded = await reverseGeocode(latitude, longitude);
      if (geocoded.placeName) placeName = placeName || geocoded.placeName;
      if (geocoded.cityName) cityName = geocoded.cityName;

      // Expo native reverse geocode as additional fallback
      if (Platform.OS !== 'web' && !placeName) {
        try {
          const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (Array.isArray(reverse) && reverse.length > 0) {
            const row = reverse[0];
            placeName =
              row?.district ||
              row?.subregion ||
              row?.street ||
              row?.name ||
              null;
            cityName = cityName || row?.city || row?.subregion || row?.region || null;
          }
        } catch (_) {}
      }

      // ── Zone detection ────────────────────────────────────────────────
      _log('Detecting zone from GPS');
      const detected = await zones.detectFromGPS(latitude, longitude);
      if (!detected?.zone_id) throw new Error('Zone detection failed');

      const zoneId = String(detected.zone_id);
      const svcCity = detected?.city ? String(detected.city) : null;
      const svcName = detected?.zone_name ? String(detected.zone_name) : null;
      const rawLabel =
        [placeName, cityName || svcCity].filter(Boolean).join(', ') ||
        svcName ||
        svcCity ||
        zoneId;
      const displayName = formatShortLocation(rawLabel) || rawLabel;
      const riskRaw = String(
        detected?.risk_label || detected?.risk_level || 'MEDIUM'
      ).toUpperCase();

      const accuracyLabel =
        accuracyM != null
          ? accuracyM <= 20
            ? 'Within 20m'
            : accuracyM <= 50
            ? 'Within 50m'
            : accuracyM <= 200
            ? `Within ${Math.round(accuracyM)}m`
            : null
          : null;

      _log('Zone matched', { zoneId, displayName, riskRaw, accuracyLabel });
      setGpsError('');
      return {
        id: zoneId,
        label: displayName,
        badge: riskRaw,
        score: riskRaw === 'HIGH' ? 80 : riskRaw === 'LOW' ? 50 : 65,
        riskLevel: riskRaw === 'HIGH' ? 'high' : riskRaw === 'LOW' ? 'low' : 'medium',
        city: cityName || svcCity || displayName,
        lat: latitude,
        lng: longitude,
        placeName:
          formatShortLocation(placeName || displayName) || placeName || displayName,
        zone_name: svcName,
        accuracyLabel,
      };
    } catch (e) {
      _log('detectZone error', e?.message);
      setGpsError(e?.message || 'GPS detection failed. Please search manually.');
    } finally {
      setGpsLoading(false);
      setGpsStatus('');
    }
    return null;
  };

  return { detectZone, gpsLoading, gpsError, gpsStatus };
}
