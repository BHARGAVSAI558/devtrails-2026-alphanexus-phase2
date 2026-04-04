import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';

import api from '../api';

type WorkerRow = {
  worker_id: number;
  phone: string;
  phone_masked: string;
  zone: string;
  trust_score: number;
  coverage_tier: string;
  weekly_premium: number;
  claims_total: number;
  fraud_flags: number;
  status: string;
};

type WorkerListResponse = {
  data: WorkerRow[];
  total_count: number;
  page_size: number;
  next_cursor?: string | null;
};

const WorkerTableRow = React.memo(function WorkerTableRow({
  row,
}: {
  row: WorkerRow;
}) {
  return (
    <>
      <td style={styles.td}>{row.phone_masked}</td>
      <td style={styles.td}>{row.zone}</td>
      <td style={styles.td}>{row.trust_score.toFixed(2)}</td>
      <td style={styles.td}>{row.coverage_tier}</td>
      <td style={styles.td}>₹{row.weekly_premium.toFixed(0)}</td>
      <td style={styles.td}>{row.claims_total}</td>
      <td style={styles.td}>{row.fraud_flags}</td>
      <td style={styles.td}>{row.status}</td>
    </>
  );
});

export default function Workers() {
  const [q, setQ] = useState('');
  const [zone, setZone] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [debouncedZone, setDebouncedZone] = useState('');
  const [page, setPage] = useState(1);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedZone(zone), 300);
    return () => clearTimeout(t);
  }, [zone]);

  const workersQuery = useQuery({
    queryKey: ['admin', 'workers', debouncedQ, debouncedZone, page],
    queryFn: async (): Promise<WorkerListResponse> =>
      (await api.get('/admin/workers', { params: { q: debouncedQ, zone: debouncedZone, page, page_size: 200 } })).data,
    keepPreviousData: true,
  });

  const detailQuery = useQuery({
    queryKey: ['admin', 'workers', 'detail', selectedWorkerId],
    queryFn: async () => (await api.get(`/admin/workers/${selectedWorkerId}`)).data,
    enabled: selectedWorkerId !== null,
  });

  const rows = workersQuery.data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((workersQuery.data?.total_count ?? 0) / (workersQuery.data?.page_size ?? 12)));
  const parentRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 46,
    overscan: 8,
  });
  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div>
      <h1 style={styles.title}>Workers</h1>
      <p style={styles.sub}>Searchable, filterable and paginated worker registry</p>

      <div style={styles.filters}>
        <input style={styles.input} placeholder="Search phone or worker id" value={q} onChange={(e) => setQ(e.target.value)} />
        <input style={styles.input} placeholder="Filter zone (e.g. hyd)" value={zone} onChange={(e) => setZone(e.target.value)} />
        <button style={styles.btn} onClick={() => setPage(1)}>Apply</button>
      </div>

      <div style={{ ...styles.tableWrap, height: 460, overflow: 'auto' }} ref={parentRef}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Zone</th>
              <th style={styles.th}>Trust Score</th>
              <th style={styles.th}>Coverage Tier</th>
              <th style={styles.th}>Weekly Premium</th>
              <th style={styles.th}>Claims</th>
              <th style={styles.th}>Fraud Flags</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody style={{ position: 'relative', height: virtualizer.getTotalSize() }}>
            {virtualItems.map((vi) => {
              const r = rows[vi.index];
              if (!r) return null;
              return (
                <tr key={r.worker_id} style={{ ...styles.tr, position: 'absolute', transform: `translateY(${vi.start}px)`, width: '100%' }} onClick={() => setSelectedWorkerId(r.worker_id)}>
                  <WorkerTableRow row={r} />
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan={8}>No workers found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div style={styles.pagination}>
        <button style={styles.btn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
        <span style={{ color: '#334155', fontWeight: 700 }}>Page {page} / {totalPages}</span>
        <button style={styles.btn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>

      {selectedWorkerId ? (
        <div style={styles.drawerOverlay} onClick={() => setSelectedWorkerId(null)}>
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <h3 style={{ margin: 0 }}>Worker #{selectedWorkerId}</h3>
              <button style={styles.btn} onClick={() => setSelectedWorkerId(null)}>Close</button>
            </div>

            {detailQuery.isLoading ? <p>Loading details...</p> : detailQuery.error ? <p>Failed to load details.</p> : (
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <b>Profile</b>
                  <pre style={styles.pre}>{JSON.stringify(detailQuery.data?.profile ?? {}, null, 2)}</pre>
                </div>
                <div>
                  <b>Claim history</b>
                  <pre style={styles.pre}>{JSON.stringify(detailQuery.data?.claim_history ?? [], null, 2)}</pre>
                </div>
                <div>
                  <b>GPS trail map data</b>
                  <pre style={styles.pre}>{JSON.stringify(detailQuery.data?.gps_trail ?? [], null, 2)}</pre>
                </div>
                <div>
                  <b>Trust timeline</b>
                  <pre style={styles.pre}>{JSON.stringify(detailQuery.data?.trust_timeline ?? [], null, 2)}</pre>
                </div>
                <div>
                  <b>Device fingerprint</b>
                  <pre style={styles.pre}>{JSON.stringify(detailQuery.data?.device_fingerprint ?? {}, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 },
  sub: { color: '#6b7280', marginTop: 6, marginBottom: 14 },
  filters: { display: 'flex', gap: 10, marginBottom: 12 },
  input: { flex: 1, border: '1px solid #cbd5e1', borderRadius: 8, padding: '9px 12px' },
  btn: { border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', padding: '8px 12px', cursor: 'pointer', fontWeight: 700 },
  tableWrap: { border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px', background: '#f8fafc', color: '#475569', fontSize: 12 },
  td: { padding: '10px', borderTop: '1px solid #f1f5f9', fontSize: 13, color: '#0f172a' },
  tr: { cursor: 'pointer' },
  pagination: { marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 },
  drawerOverlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 },
  drawer: { width: 560, background: '#fff', height: '100%', padding: 16, overflowY: 'auto' },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pre: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, fontSize: 12, overflow: 'auto' },
};

