import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import api from '../api';
import { adminUi } from '../theme/adminUi';
import { useClaimsFeedStore } from '../stores/claimsFeed';

type ClaimRow = {
  claim_id?: number | string;
  id?: number | string;
  user_id?: number;
  worker_name?: string;
  status?: string;
  decision?: string;
  zone_id?: string;
  zone_name?: string;
  disruption_type?: string;
  fraud_score?: number;
  final_payout?: number;
  payout?: number;
  payout_amount?: number;
  created_at?: string;
};

/** Safely extract a display string, falling back to a placeholder. */
function safe(val: unknown, fallback = '—'): string {
  if (val === null || val === undefined || val === '') return fallback;
  return String(val);
}

/** Safely extract a number, returning null if absent/zero. */
function safeNum(val: unknown): number | null {
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function statusColor(s: string): string {
  const v = s.toLowerCase();
  if (v === 'approved' || v === 'payout' || v === 'payout_credited') return '#059669';
  if (v === 'fraud') return '#dc2626';
  if (v === 'rejected') return '#d97706';
  if (v === 'processing' || v === 'flagged') return '#2563eb';
  return '#64748b';
}

function statusBg(s: string): string {
  const v = s.toLowerCase();
  if (v === 'approved' || v === 'payout' || v === 'payout_credited') return '#ecfdf5';
  if (v === 'fraud') return '#fef2f2';
  if (v === 'rejected') return '#fffbeb';
  if (v === 'processing' || v === 'flagged') return '#eff6ff';
  return '#f8fafc';
}

/** Normalise a raw API/WS object into a consistent ClaimRow. */
function normalise(r: Record<string, unknown>, isLive = false): ClaimRow & { _live: boolean } {
  return {
    claim_id: r.claim_id ?? r.id,
    user_id: r.user_id as number | undefined,
    worker_name: (r.worker_name as string | undefined) ?? (r.user_id ? `Worker ${r.user_id}` : undefined),
    status: (r.status as string | undefined) ?? (r.decision as string | undefined),
    zone_id: r.zone_id as string | undefined,
    zone_name: (r.zone_name as string | undefined) ?? (r.zone_id as string | undefined),
    disruption_type: r.disruption_type as string | undefined,
    fraud_score: r.fraud_score as number | undefined,
    final_payout: (r.final_payout ?? r.payout_amount ?? r.payout) as number | undefined,
    created_at: r.created_at as string | undefined,
    _live: isLive,
  } as ClaimRow & { _live: boolean };
}

export default function Claims() {
  const qc = useQueryClient();
  const wsFeed = useClaimsFeedStore((s) => s.items);

  const q = useQuery({
    queryKey: ['admin', 'claims', 'live'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/claims/live', { params: { page: 1, limit: 50 } });
        const data = res.data?.data;
        if (Array.isArray(data) && data.length > 0) return data as Record<string, unknown>[];
      } catch (_) { /* fall through to simulations */ }
      // Fallback: simulations endpoint always has data
      const fb = await api.get('/admin/simulations', { params: { skip: 0, limit: 50 } });
      return Array.isArray(fb.data) ? (fb.data as Record<string, unknown>[]) : [];
    },
    refetchInterval: 20_000,
    retry: 2,
    staleTime: 10_000,
  });

  // WS live rows
  const wsNorm = wsFeed
    .filter((e) => e.claim_id != null)
    .slice(0, 10)
    .map((e) =>
      normalise(
        {
          claim_id: e.claim_id,
          user_id: e.worker_id,
          status: e.status,
          zone_id: e.zone_id,
          fraud_score: e.fraud_score,
          final_payout: e.payout_amount,
          disruption_type: e.disruption_type,
          created_at: new Date(e.timestamp).toISOString(),
        },
        true
      )
    );

  const dbNorm = (q.data ?? []).map((r) => normalise(r, false));

  // Deduplicate: WS rows take priority
  const wsIds = new Set(wsNorm.map((r) => String(r.claim_id ?? '')));
  const merged = [
    ...wsNorm,
    ...dbNorm.filter((r) => !wsIds.has(String(r.claim_id ?? r.id ?? ''))),
  ];

  const isLoading = q.isLoading;
  const isError = q.isError && !isLoading;

  return (
    <div style={adminUi.page}>
      <div style={{ ...adminUi.pageHeader, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 12 }}>
        <div>
          <h1 style={adminUi.h1}>Claims Feed</h1>
          <p style={{ ...adminUi.sub, marginTop: 4 }}>
            Live claim events — auto-refreshes every 20 s.
          </p>
        </div>
        <button
          type="button"
          onClick={() => qc.invalidateQueries({ queryKey: ['admin', 'claims', 'live'] })}
          style={adminUi.btn}
        >
          ↻ Refresh
        </button>
      </div>

      <div style={{ ...adminUi.card, padding: 0, overflow: 'hidden' }}>
        {/* Card header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={adminUi.cardTitle}>Claims</div>
            <div style={{ ...adminUi.cardSub, marginBottom: 0 }}>
              {isLoading
                ? 'Loading…'
                : `${merged.length} record${merged.length === 1 ? '' : 's'}`}
              {wsNorm.length > 0 && (
                <span style={{ marginLeft: 8, color: '#059669', fontWeight: 700 }}>
                  · {wsNorm.length} live
                </span>
              )}
            </div>
          </div>
          {isLoading && (
            <div style={{ width: 18, height: 18, border: '2px solid var(--admin-border)', borderTopColor: 'var(--admin-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          )}
        </div>

        {/* Error banner */}
        {isError && (
          <div style={{ padding: '14px 20px', color: '#b91c1c', fontWeight: 700, fontSize: 13, background: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>Unable to reach server right now.</span>
            <button type="button" onClick={() => q.refetch()} style={{ ...adminUi.btn, padding: '4px 10px', fontSize: 12 }}>
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <div style={{ ...adminUi.tableScroll, maxHeight: 'min(640px, 65vh)', border: 'none', borderRadius: 0 }}>
          <table style={{ ...adminUi.table, minWidth: 960 }}>
            <thead>
              <tr>
                <th style={adminUi.th}>ID</th>
                <th style={adminUi.th}>Worker</th>
                <th style={adminUi.th}>Status</th>
                <th style={adminUi.th}>Disruption</th>
                <th style={adminUi.th}>Zone</th>
                <th style={adminUi.th}>Amount</th>
                <th style={adminUi.th}>Fraud</th>
                <th style={adminUi.th}>Time</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && merged.length === 0 && (
                <tr>
                  <td colSpan={8} style={adminUi.td}>
                    <div style={adminUi.empty}>Loading claims…</div>
                  </td>
                </tr>
              )}

              {!isLoading && merged.length === 0 && (
                <tr>
                  <td colSpan={8} style={adminUi.td}>
                    <div style={adminUi.empty}>
                      No claims yet. Run a simulation from the Simulations page to generate data.
                    </div>
                  </td>
                </tr>
              )}

              {merged.map((r, idx) => {
                const id = safe(r.claim_id ?? r.id);
                const worker = safe(r.worker_name);
                const status = safe(r.status ?? r.decision);
                const zone = safe(r.zone_name ?? r.zone_id);
                const amount = safeNum(r.final_payout ?? r.payout_amount ?? r.payout);
                const fraud = typeof r.fraud_score === 'number' ? r.fraud_score : null;
                const ts = r.created_at
                  ? (() => { try { return new Date(r.created_at).toLocaleString('en-IN'); } catch { return r.created_at; } })()
                  : '—';
                const live = (r as ClaimRow & { _live: boolean })._live;

                return (
                  <tr
                    key={`${id}-${idx}`}
                    style={{ background: live ? 'rgba(5,150,105,0.04)' : undefined }}
                  >
                    <td style={{ ...adminUi.td, fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>
                      {live && (
                        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#059669', marginRight: 6, verticalAlign: 'middle' }} />
                      )}
                      {id}
                    </td>
                    <td style={adminUi.td}>{worker}</td>
                    <td style={adminUi.td}>
                      {status !== '—' ? (
                        <span style={{ background: statusBg(status), color: statusColor(status), borderRadius: 6, padding: '3px 8px', fontSize: 12, fontWeight: 700 }}>
                          {status}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={adminUi.td}>{safe(r.disruption_type)}</td>
                    <td style={adminUi.td}>{zone}</td>
                    <td style={adminUi.td}>
                      {amount !== null ? (
                        <span style={{ color: '#059669', fontWeight: 700 }}>
                          {'\u20b9'}{amount.toFixed(0)}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={adminUi.td}>
                      {fraud !== null ? (
                        <span style={{ color: fraud > 0.7 ? '#dc2626' : fraud > 0.4 ? '#d97706' : '#059669', fontWeight: 700 }}>
                          {fraud.toFixed(2)}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ ...adminUi.td, whiteSpace: 'nowrap' as const, fontSize: 12 }}>{ts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
