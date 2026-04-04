import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GeoJSON, MapContainer, Popup, TileLayer } from 'react-leaflet';
import type { FeatureCollection } from 'geojson';
import 'leaflet/dist/leaflet.css';

import api from '../api';
import { useZoneEventsStore } from '../stores/zoneEvents';

type ZoneSummary = {
  zone_id: string;
  city: string;
  active_workers: number;
  pool_balance: number;
  utilization_pct: number;
  last_disruption: string;
  claim_density_per_hr: number;
};

export default function ZoneHeatmap() {
  const [showWeather, setShowWeather] = useState(true);
  const [showAqi, setShowAqi] = useState(true);
  const [showFraudClusters, setShowFraudClusters] = useState(true);
  const zoneEvents = useZoneEventsStore((s) => s.latestByZone);

  const geoQuery = useQuery({
    queryKey: ['admin', 'zones', 'geojson'],
    queryFn: async (): Promise<FeatureCollection> => (await api.get('/admin/zones/geojson')).data,
  });

  const summaryQuery = useQuery({
    queryKey: ['admin', 'zones', 'summary'],
    queryFn: async (): Promise<ZoneSummary[]> => (await api.get('/admin/zones/summary')).data,
    refetchInterval: 30_000,
  });

  const summaryByZone = useMemo(() => {
    const by: Record<string, ZoneSummary> = {};
    for (const row of summaryQuery.data ?? []) by[row.zone_id] = row;
    return by;
  }, [summaryQuery.data]);

  /** GeoJSON includes risk_level + claim_count from API. */
  const fillForFeature = (feature: any) => {
    const p = feature?.properties ?? {};
    const risk = String(p.risk_level ?? '').toUpperCase();
    if (risk === 'HIGH') return '#dc2626';
    if (risk === 'MEDIUM') return '#f59e0b';
    if (risk === 'LOW') return '#16a34a';
    const cc = Number(p.claim_count ?? summaryByZone[String(p.zone_id)]?.claim_density_per_hr ?? 0);
    if (cc > 15) return '#dc2626';
    if (cc >= 5) return '#f59e0b';
    return '#16a34a';
  };

  if (geoQuery.isLoading || summaryQuery.isLoading) return <div style={styles.loading}>Loading map...</div>;
  if (geoQuery.error || summaryQuery.error || !geoQuery.data) return <div style={styles.loading}>Failed to load heatmap.</div>;

  return (
    <div>
      <h1 style={styles.title}>Zone Heatmap</h1>
      <p style={styles.sub}>Hyderabad-centered live operational map</p>

      <div style={styles.toggles}>
        <Toggle label="Weather layer" checked={showWeather} onChange={setShowWeather} />
        <Toggle label="AQI layer" checked={showAqi} onChange={setShowAqi} />
        <Toggle label="Fraud ring clusters" checked={showFraudClusters} onChange={setShowFraudClusters} />
      </div>

      <div style={styles.mapWrap}>
        <MapContainer center={[17.385, 78.4867]} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <GeoJSON
            data={geoQuery.data as any}
            style={(feature: any) => {
              return {
                color: '#1e293b',
                weight: 1.5,
                fillColor: fillForFeature(feature),
                fillOpacity: 0.45,
              };
            }}
            onEachFeature={(feature: any, layer: any) => {
              const p = feature?.properties ?? {};
              const zoneId = String(p.zone_id ?? '');
              const zname = String(p.zone_name ?? zoneId);
              const workers = p.active_workers ?? summaryByZone[zoneId]?.active_workers ?? '—';
              const bal = p.pool_balance ?? summaryByZone[zoneId]?.pool_balance ?? 0;
              const last = p.last_disruption ?? summaryByZone[zoneId]?.last_disruption ?? '—';
              const cc = p.claim_count ?? '—';
              const liveEvent = zoneEvents[zoneId];
              layer.bindPopup(
                `<div style="font-family:system-ui;font-size:13px;line-height:1.45;">
                  <b>${zname}</b> <span style="color:#64748b">(${zoneId})</span><br/>
                  Claims (zone): <b>${cc}</b><br/>
                  Active workers: <b>${workers}</b><br/>
                  Pool balance: <b>₹${Number(bal).toFixed(0)}</b><br/>
                  Last disruption: <b>${last}</b><br/>
                  Live event: ${liveEvent?.event_type ?? 'none'}
                </div>`
              );
            }}
          />
        </MapContainer>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label style={styles.toggle}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 },
  sub: { color: '#6b7280', marginTop: 6, marginBottom: 14 },
  toggles: { display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' },
  toggle: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', fontWeight: 700 },
  mapWrap: { height: '70vh', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' },
  loading: { textAlign: 'center', padding: 60, color: '#888' },
};

