import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import api from '../api';
import { useClaimsFeedStore, type AdminClaimUpdate } from '../stores/claimsFeed';
import { useFraudQueueStore, type AdminFraudAlert } from '../stores/fraudQueue';
import { usePoolHealthStore } from '../stores/poolHealth';

type AdminKpiResponse = {
  active_workers: number;
  claims_today: number;
  approval_rate_pct: number;
  fraud_blocked: number;
  pool_utilization_pct: number;
  pool_risk_level: string;
  loss_ratio_actual_pct: number;
  loss_ratio_target_low: number;
  loss_ratio_target_high: number;
};

type ClaimDrawerState = {
  open: boolean;
  selected: AdminClaimUpdate | null;
};

function statusToChip(status: string) {
  const norm = status.toLowerCase();
  if (norm.includes('approved')) return { bg: '#dcfce7', fg: '#166534', label: 'Approved' };
  if (norm.includes('fraud')) return { bg: '#fee2e2', fg: '#991b1b', label: 'Fraud' };
  if (norm.includes('flagged')) return { bg: '#fef3c7', fg: '#854d0e', label: 'Flagged' };
  if (norm.includes('rejected')) return { bg: '#fef3c7', fg: '#854d0e', label: 'Rejected' };
  if (norm.includes('processing')) return { bg: '#dbeafe', fg: '#1d4ed8', label: 'Processing' };
  return { bg: '#e5e7eb', fg: '#374151', label: status || '—' };
}

function KpiCard({
  title,
  value,
  delta,
}: {
  title: string;
  value: string;
  delta?: { label: string; direction: 'up' | 'down' | 'flat' };
}) {
  const deltaColor =
    delta?.direction === 'up' ? '#16a34a' : delta?.direction === 'down' ? '#dc2626' : '#6b7280';
  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiTitle}>{title}</div>
      <div style={styles.kpiValue}>{value}</div>
      {delta ? (
        <div style={{ ...styles.kpiDelta, color: deltaColor }}>
          {delta.direction === 'up' ? '▲' : delta.direction === 'down' ? '▼' : '•'} {delta.label}
        </div>
      ) : (
        <div style={styles.kpiDeltaPlaceholder} />
      )}
    </div>
  );
}

export default function Dashboard() {
  const wsClaims = useClaimsFeedStore((s) => s.items);
  const fraudItems = useFraudQueueStore((s) => s.items);
  const poolHealthByZone = usePoolHealthStore((s) => s.latestByZone);

  const [localDrawer, setLocalDrawer] = useState<ClaimDrawerState>({ open: false, selected: null });
  const [feedUpdatedAt, setFeedUpdatedAt] = useState<number | null>(null);
  const [flashRowId, setFlashRowId] = useState<string | null>(null);
  const [fraudToast, setFraudToast] = useState<AdminFraudAlert | null>(null);
  const prevWsTopRef = useRef<string | undefined>(undefined);
  const lastFraudClusterRef = useRef<string | null>(null);

  useEffect(() => {
    const topId = wsClaims[0] ? String(wsClaims[0].claim_id) : undefined;
    if (prevWsTopRef.current === undefined) {
      prevWsTopRef.current = topId;
      return;
    }
    if (topId && topId !== prevWsTopRef.current) {
      setFlashRowId(topId);
      const t = window.setTimeout(() => setFlashRowId(null), 400);
      prevWsTopRef.current = topId;
      return () => window.clearTimeout(t);
    }
  }, [wsClaims]);

  useEffect(() => {
    if (!fraudItems.length) return;
    const latest = fraudItems[0];
    if (lastFraudClusterRef.current === latest.cluster_id) return;
    lastFraudClusterRef.current = latest.cluster_id;
    setFraudToast(latest);
    const t = window.setTimeout(() => setFraudToast(null), 7000);
    return () => window.clearTimeout(t);
  }, [fraudItems]);

  const kpiQuery = useQuery({
    queryKey: ['admin', 'kpis'],
    queryFn: async (): Promise<AdminKpiResponse> => (await api.get('/admin/kpis')).data,
    refetchInterval: 30_000,
  });

  const simulationsFeedQuery = useQuery({
    queryKey: ['admin', 'simulations', 'feed'],
    queryFn: async () => (await api.get('/admin/simulations?limit=20&skip=0')).data as any[],
    refetchInterval: 30_000,
  });

  const earningsDnaAnalyticsQuery = useQuery({
    queryKey: ['admin', 'earnings-dna-analytics'],
    queryFn: async () => (await api.get('/admin/earnings-dna-analytics', { params: { days: 14 } })).data,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    const t = Math.max(simulationsFeedQuery.dataUpdatedAt ?? 0, 0);
    if (t) setFeedUpdatedAt(t);
  }, [simulationsFeedQuery.dataUpdatedAt, simulationsFeedQuery.data]);

  const kpis = kpiQuery.data;

  const activeWorkers = kpis?.active_workers ?? 0;
  const claimsProcessedToday = kpis?.claims_today ?? 0;
  const approvalRatePct = kpis?.approval_rate_pct ?? 0;
  const fraudBlocked = kpis?.fraud_blocked ?? 0;
  const poolUtilizationPct = kpis?.pool_utilization_pct ?? 0;

  const mergedFeed = useMemo(() => {
    const fromApi: AdminClaimUpdate[] = (simulationsFeedQuery.data ?? []).map((s: any) => ({
      claim_id: s.claim_id ?? s.id,
      worker_id: s.user_id,
      status: String(s.status ?? s.decision ?? ''),
      message: String(s.message ?? s.reason ?? ''),
      timestamp: s.created_at ? new Date(s.created_at).getTime() : Date.now(),
      zone_id: s.zone_id,
      fraud_score: typeof s.fraud_score === 'number' ? s.fraud_score : undefined,
      disruption_type: s.disruption_type,
      confidence_level: s.confidence_level,
    }));
    const byId = new Map<string, AdminClaimUpdate>();
    for (const r of fromApi) byId.set(String(r.claim_id), r);
    for (const w of wsClaims) {
      const k = String(w.claim_id);
      const prev = byId.get(k);
      if (!prev || w.timestamp >= prev.timestamp) byId.set(k, w);
    }
    return Array.from(byId.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
  }, [wsClaims, simulationsFeedQuery.data]);

  /** Remaining headroom under 20% ⇒ utilization over 80%. */
  const poolStressZones = useMemo(() => {
    return Object.values(poolHealthByZone).filter((z: any) => {
      const u = Number(z?.utilization_pct ?? 0);
      return 100 - u < 20;
    });
  }, [poolHealthByZone]);

  const lossRatio = useMemo(() => {
    const actual = kpis?.loss_ratio_actual_pct ?? 60;
    return {
      targetLow: kpis?.loss_ratio_target_low ?? 60,
      targetHigh: kpis?.loss_ratio_target_high ?? 75,
      actual,
    };
  }, [kpis]);

  const kpiCards = (
    <div style={styles.kpiGrid}>
      <KpiCard
        title="Total Active Workers"
        value={String(activeWorkers)}
        delta={{ label: '24h', direction: 'flat' }}
      />
      <KpiCard
        title="Claims Processed Today"
        value={String(claimsProcessedToday)}
        delta={{ label: `${approvalRatePct.toFixed(1)}% approval`, direction: 'up' }}
      />
      <KpiCard title="Fraud Attempts Blocked" value={String(fraudBlocked)} />
      <KpiCard
        title="Pool Utilization % (All Zones)"
        value={`${poolUtilizationPct}%`}
        delta={{ label: 'risk-based', direction: poolUtilizationPct > 80 ? 'down' : 'flat' }}
      />
    </div>
  );

  const zones = useMemo(() => {
    const arr = Object.values(poolHealthByZone).filter(Boolean);
    // Keep stable order (timestamp desc)
    return [...arr].sort((a: any, b: any) => Number(b.timestamp ?? 0) - Number(a.timestamp ?? 0)).slice(0, 6) as any[];
  }, [poolHealthByZone]);

  const lossRatioChartData = useMemo(() => {
    const actual = lossRatio.actual;
    const trend = [actual - 6, actual - 3, actual, actual + 2, actual - 1, actual + 1];
    return {
      actual,
      trend,
    };
  }, [lossRatio]);

  const fleetDnaBarData = useMemo(() => {
    type Row = { hour: number; avg_payout: number; samples: number };
    const rows = (earningsDnaAnalyticsQuery.data?.fleet_hourly_avg_payout ?? []) as Row[];
    const fmt = (h: number) => {
      if (h === 0) return '12A';
      if (h < 12) return `${h}A`;
      if (h === 12) return '12P';
      return `${h - 12}P`;
    };
    return rows
      .filter((r) => r.hour >= 6 && r.hour <= 22)
      .map((r) => ({
        hourLabel: fmt(r.hour),
        avgPayout: Number(r.avg_payout) || 0,
        samples: r.samples,
      }));
  }, [earningsDnaAnalyticsQuery.data]);

  const openDrawerForClaim = (claim: AdminClaimUpdate) => {
    setLocalDrawer({ open: true, selected: claim });
  };

  const drawerClaim = localDrawer.selected;

  const closeDrawer = () => {
    setLocalDrawer({ open: false, selected: null });
  };

  const loading = kpiQuery.isLoading;
  if (loading) {
    return (
      <div style={styles.loading}>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (kpiQuery.error || !kpis) {
    return (
      <div style={styles.loading}>
        <span>Dashboard unavailable.</span>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>
        {`
          @keyframes claimRowEnter {
            from { transform: translateY(-14px); opacity: 0.55; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>

      {fraudToast ? (
        <div style={styles.fraudToast} role="status">
          ⚠️ Fraud ring detected in {fraudToast.zone_id} — {fraudToast.worker_ids?.length ?? 0} workers frozen
        </div>
      ) : null}

      {poolStressZones.length ? (
        <div style={styles.poolWarnBanner}>
          {poolStressZones.map((z: any) => {
            const pct = Number(z.utilization_pct ?? 0);
            const health = Math.max(0, 100 - pct);
            return (
              <div key={String(z.zone_id)} style={styles.poolWarnLine}>
                ⚠️ {z.zone_id} pool health at {health.toFixed(0)}% (utilization {pct.toFixed(0)}%) — reinsurance may
                trigger
              </div>
            );
          })}
        </div>
      ) : null}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.sub}>Live operational overview (updates via WebSocket + periodic KPIs)</p>
        </div>
      </div>

      {kpiCards}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Earnings DNA · workforce</div>
          <div style={styles.cardSub}>IST peak hours + simulation income (last 14d)</div>
        </div>
        {earningsDnaAnalyticsQuery.isLoading ? (
          <div style={styles.empty}>Loading earnings analytics…</div>
        ) : earningsDnaAnalyticsQuery.error ? (
          <div style={styles.empty}>Analytics unavailable.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 800 }}>Avg expected / claim</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>
                  ₹{Number(earningsDnaAnalyticsQuery.data?.avg_expected ?? 0).toFixed(0)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 800 }}>Avg actual / claim</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>
                  ₹{Number(earningsDnaAnalyticsQuery.data?.avg_actual ?? 0).toFixed(0)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 800 }}>Simulations in window</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>
                  {earningsDnaAnalyticsQuery.data?.simulations_in_window ?? 0}
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#334155', marginBottom: 8 }}>
                Peak hours (IST) across workers
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(earningsDnaAnalyticsQuery.data?.peak_hours_ist ?? []).slice(0, 5).map((row: any) => (
                  <span key={row.hour_ist} style={styles.dnaPeakChip}>
                    {row.hour_ist}:00 · ₹{row.avg_slot_proxy}/h · n={row.samples}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Fleet DNA Insights</div>
          <div style={styles.cardSub}>
            Fleet earning patterns — when your workers earn most. Lunch (~12–2 PM) and dinner (~7–10 PM) peaks
            highlight when coverage events cluster — actuarial signal for costly hours.
          </div>
        </div>
        {earningsDnaAnalyticsQuery.isLoading ? (
          <div style={styles.empty}>Loading fleet hourly pattern…</div>
        ) : earningsDnaAnalyticsQuery.error ? (
          <div style={styles.empty}>Fleet DNA chart unavailable.</div>
        ) : fleetDnaBarData.length === 0 ? (
          <div style={styles.empty}>No approved simulation payouts in this window yet.</div>
        ) : (
          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetDnaBarData} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hourLabel" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `₹${v}`}
                  label={{ value: 'Avg payout (₹)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value ?? 0).toFixed(0)}`, 'Avg payout']}
                  labelFormatter={(label) => `${label} IST`}
                />
                <Bar dataKey="avgPayout" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg payout" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>Live Claim Feed</div>
            <div style={styles.cardSub}>
              {mergedFeed.length} rows
              {feedUpdatedAt ? (
                <span style={{ marginLeft: 8, fontWeight: 600 }}>
                  · Last updated {new Date(feedUpdatedAt).toLocaleTimeString()}
                </span>
              ) : null}
            </div>
          </div>

          {mergedFeed.length === 0 ? (
            <div style={styles.empty}>No simulations yet. WebSocket + 30s refresh will populate this list.</div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Worker ID</th>
                    <th style={styles.th}>Zone</th>
                    <th style={styles.th}>Disruption</th>
                    <th style={styles.th}>Confidence</th>
                    <th style={styles.th}>Fraud Score</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {mergedFeed.map((c) => {
                    const chip = statusToChip(c.status);
                    const rowId = String(c.claim_id);
                    const animate = flashRowId === rowId;
                    return (
                      <tr
                        key={rowId}
                        style={{
                          ...styles.tr,
                          animation: animate ? 'claimRowEnter 0.3s ease' : undefined,
                        }}
                        onClick={() => openDrawerForClaim(c)}
                      >
                        <td style={styles.td}>{c.worker_id ?? '—'}</td>
                        <td style={styles.td}>{c.zone_id ?? '—'}</td>
                        <td style={styles.td}>{c.disruption_type ?? '—'}</td>
                        <td style={styles.td}>{c.confidence_level ?? '—'}</td>
                        <td style={styles.td}>{typeof c.fraud_score === 'number' ? c.fraud_score.toFixed(2) : '—'}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.chip, backgroundColor: chip.bg, color: chip.fg }}>{chip.label}</span>
                        </td>
                        <td style={styles.td}>{new Date(c.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={styles.sideColumn}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>Loss Ratio Gauge</div>
              <div style={styles.cardSub}>Target 60-75% band</div>
            </div>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart data={[{ name: 'loss', value: lossRatioChartData.actual }]} cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" barSize={18}>
                  <RadialBar dataKey="value" minAngle={15} background={{ fill: '#e5e7eb' }} />
                  <Tooltip />
                  <Legend />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div style={styles.lossText}>
              <div>
                Current actual: <b>{Math.round(lossRatioChartData.actual)}%</b>
              </div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Target: {lossRatio.targetLow}-{lossRatio.targetHigh}%</div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>Weekly Earnings Summary</div>
              <div style={styles.cardSub}>Tap to expand</div>
            </div>
            <WeeklyEarningsDrawer />
          </div>
        </div>
      </div>

      <div style={styles.card} />
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Zone Health Grid</div>
          <div style={styles.cardSub}>Based on pool health snapshots</div>
        </div>

        {zones.length === 0 ? (
          <div style={styles.empty}>No pool health data yet.</div>
        ) : (
          <div style={styles.zoneGrid}>
            {zones.map((z) => {
              const risk = String(z.risk_level ?? 'MEDIUM').toUpperCase();
              const bg = risk === 'HIGH' ? '#fee2e2' : risk === 'LOW' ? '#dcfce7' : '#fef3c7';
              const fg = risk === 'HIGH' ? '#991b1b' : risk === 'LOW' ? '#166534' : '#854d0e';
              return (
                <div key={String(z.zone_id)} style={{ ...styles.zoneCard, borderColor: fg }}>
                  <div style={styles.zoneTitle}>{z.zone_id}</div>
                  <div style={styles.zoneMetric}>Balance: ₹{Number(z.balance ?? 0).toFixed(0)}</div>
                  <div style={styles.zoneMetric}>Utilization: {Number(z.utilization_pct ?? 0).toFixed(1)}%</div>
                  <div style={{ ...styles.chip, backgroundColor: bg, color: fg, display: 'inline-block' }}>
                    Risk: {risk}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {localDrawer.open && drawerClaim ? (
        <div style={styles.drawerOverlay} onClick={closeDrawer} role="presentation">
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div style={styles.drawerHeader}>
              <div style={styles.drawerTitle}>Claim Details</div>
              <button style={styles.drawerClose} onClick={closeDrawer}>
                Close
              </button>
            </div>

            <div style={styles.drawerBody}>
              <div style={styles.detailRow}>
                <span style={styles.detailKey}>Claim ID</span>
                <span style={styles.detailVal}>{drawerClaim.claim_id}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailKey}>Status</span>
                <span style={styles.detailVal}>{drawerClaim.status}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailKey}>Worker</span>
                <span style={styles.detailVal}>{drawerClaim.worker_id ?? '—'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailKey}>Zone</span>
                <span style={styles.detailVal}>{drawerClaim.zone_id ?? '—'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailKey}>Disruption</span>
                <span style={styles.detailVal}>{drawerClaim.disruption_type ?? '—'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailKey}>Confidence</span>
                <span style={styles.detailVal}>{drawerClaim.confidence_level ?? '—'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailKey}>Fraud Score</span>
                <span style={styles.detailVal}>
                  {typeof drawerClaim.fraud_score === 'number' ? drawerClaim.fraud_score.toFixed(2) : '—'}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailKey}>Message</span>
                <span style={styles.detailVal}>{drawerClaim.message}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailKey}>Time</span>
                <span style={styles.detailVal}>{new Date(drawerClaim.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  function WeeklyEarningsDrawer() {
    const [expanded, setExpanded] = useState(false);
    const weeklyQuery = useQuery({
      queryKey: ['admin', 'weekly-earnings'],
      queryFn: async () => (await api.get('/admin/weekly-earnings?days=7')).data,
      refetchInterval: 120_000,
      retry: 1,
    });

    return (
      <div>
        <button
          style={styles.weeklyButton}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <span>₹ {weeklyQuery.data?.protected_this_week ?? '—'} protected this week</span>
          <span style={{ color: '#6b7280', fontWeight: 700 }}>{expanded ? '▲' : '▼'}</span>
        </button>

        {!expanded ? null : (
          <div style={styles.weeklyExpanded}>
            {weeklyQuery.isLoading ? (
              <div style={styles.empty}>Loading weekly breakdown...</div>
            ) : weeklyQuery.error ? (
              <div style={styles.empty}>No weekly breakdown available.</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {(weeklyQuery.data?.breakdown ?? []).map((row: any) => (
                  <div key={String(row.day)} style={styles.weeklyRow}>
                    <div style={styles.weeklyDay}>{row.day}</div>
                    <div style={styles.weeklyAmount}>₹{Number(row.protected_amount ?? 0).toFixed(0)}</div>
                    <div style={styles.weeklyReason}>{row.reason ?? ''}</div>
                  </div>
                ))}
                {(weeklyQuery.data?.breakdown ?? []).length === 0 ? (
                  <div style={styles.empty}>No breakdown rows.</div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 0, position: 'relative' },
  fraudToast: {
    position: 'fixed',
    top: 16,
    right: 16,
    zIndex: 200,
    maxWidth: 420,
    padding: '12px 16px',
    borderRadius: 12,
    backgroundColor: '#991b1b',
    color: '#fff',
    fontWeight: 800,
    fontSize: 13,
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  },
  poolWarnBanner: {
    marginBottom: 12,
    padding: '10px 14px',
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    border: '1px solid #fdba74',
  },
  poolWarnLine: { fontSize: 13, fontWeight: 800, color: '#9a3412', marginBottom: 4 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 900, margin: 0, color: '#0f172a' },
  sub: { color: '#6b7280', margin: 0, fontSize: 13, marginTop: 6 },
  loading: { textAlign: 'center', padding: 60, color: '#888' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 },
  kpiCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  kpiTitle: { fontSize: 12, color: '#6b7280', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' },
  kpiValue: { fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 6 },
  kpiDelta: { fontSize: 12, fontWeight: 800 },
  kpiDeltaPlaceholder: { height: 16 },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 430px', gap: 14 },
  sideColumn: { display: 'grid', gap: 14 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: 900, color: '#0f172a' },
  cardSub: { fontSize: 12, color: '#6b7280', fontWeight: 700 },
  tableWrap: { overflowX: 'auto', borderRadius: 10 },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 820 },
  th: { textAlign: 'left', padding: '10px 10px', fontSize: 12, color: '#6b7280', fontWeight: 900, borderBottom: '1px solid #f1f5f9' },
  tr: { cursor: 'pointer' },
  td: { padding: '10px 10px', fontSize: 13, color: '#0f172a', borderBottom: '1px solid #f1f5f9' },
  chip: { padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 900 },
  empty: { padding: 18, color: '#6b7280', fontSize: 13 },
  dnaPeakChip: {
    fontSize: 12,
    fontWeight: 800,
    padding: '6px 10px',
    borderRadius: 999,
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
  },
  lossText: { marginTop: 6, fontSize: 13, color: '#0f172a', fontWeight: 700 },
  weeklyButton: {
    width: '100%',
    border: '1px solid #e5e7eb',
    backgroundColor: '#f8fafc',
    padding: '10px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontWeight: 900,
    color: '#0f172a',
  },
  weeklyExpanded: { marginTop: 10, paddingTop: 10, borderTop: '1px solid #e5e7eb' },
  weeklyRow: { display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: 10, alignItems: 'center', padding: '8px 0' },
  weeklyDay: { fontSize: 12, fontWeight: 900, color: '#334155' },
  weeklyAmount: { fontSize: 13, fontWeight: 900, color: '#0f172a' },
  weeklyReason: { fontSize: 12, color: '#6b7280', fontWeight: 700 },
  zoneGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 },
  zoneCard: { borderRadius: 12, padding: 14, border: '2px solid transparent', backgroundColor: '#f8fafc' },
  zoneTitle: { fontSize: 13, fontWeight: 900, marginBottom: 6, color: '#0f172a' },
  zoneMetric: { fontSize: 12, color: '#334155', fontWeight: 800, marginBottom: 4 },
  drawerOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    zIndex: 50,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawer: { width: 520, height: '100%', backgroundColor: '#fff', padding: 18, boxShadow: '-8px 0 24px rgba(0,0,0,0.2)' },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  drawerTitle: { fontSize: 16, fontWeight: 900, color: '#0f172a' },
  drawerClose: { border: '1px solid #e5e7eb', backgroundColor: '#fff', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontWeight: 900, color: '#0f172a' },
  drawerBody: { display: 'grid', gap: 10 },
  detailRow: { display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid #f1f5f9', paddingBottom: 8 },
  detailKey: { color: '#6b7280', fontWeight: 900, fontSize: 12 },
  detailVal: { color: '#0f172a', fontWeight: 800, fontSize: 13, textAlign: 'right' },
  // Unused fields reserved for future UI refinements
};

