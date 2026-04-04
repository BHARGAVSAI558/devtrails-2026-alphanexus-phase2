import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

import api from '../api';
import { useFraudQueueStore } from '../stores/fraudQueue';

export default function FraudInsights() {
  const wsQueue = useFraudQueueStore((s) => s.items);

  const alertsQuery = useQuery({
    queryKey: ['admin', 'fraud-alerts'],
    queryFn: async () => (await api.get('/admin/fraud-alerts')).data,
    refetchInterval: 30_000,
  });
  const analyticsQuery = useQuery({
    queryKey: ['admin', 'fraud-analytics'],
    queryFn: async () => (await api.get('/admin/fraud/analytics')).data,
    refetchInterval: 30_000,
  });

  const rows = wsQueue.length ? wsQueue : (alertsQuery.data ?? []).map((x: any) => ({
    cluster_id: `sim-${x.id}`,
    ring_confidence: x.fraud_score > 0.85 ? 'CONFIRMED' : 'PROBABLE',
    workers_in_ring: [x.user_id],
    zone: 'unknown',
    timestamp: new Date(x.created_at).getTime(),
    freeze_status: x.fraud_score > 0.85 ? 'FROZEN' : 'PENDING',
  }));

  const doAction = async (clusterId: string, action: string) => {
    await api.post(`/admin/fraud/${clusterId}/action`, { action });
  };

  return (
    <div>
      <h1 style={styles.title}>Fraud Insights</h1>
      <p style={styles.sub}>Queue + analytics for fraud operations</p>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Cluster ID</th>
              <th style={styles.th}>Ring Confidence</th>
              <th style={styles.th}>Workers in Ring</th>
              <th style={styles.th}>Zone</th>
              <th style={styles.th}>Timestamp</th>
              <th style={styles.th}>Freeze Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={String(r.cluster_id)} style={styles.tr}>
                <td style={styles.td}>{r.cluster_id}</td>
                <td style={styles.td}>{r.ring_confidence}</td>
                <td style={styles.td}>{(r.worker_ids ?? r.workers_in_ring ?? []).length}</td>
                <td style={styles.td}>{r.zone_id ?? r.zone ?? '—'}</td>
                <td style={styles.td}>{new Date(r.timestamp).toLocaleString()}</td>
                <td style={styles.td}>{r.freeze_status ?? (r.ring_confidence === 'CONFIRMED' ? 'FROZEN' : 'PENDING')}</td>
                <td style={styles.td}>
                  <button style={styles.btn} onClick={() => doAction(r.cluster_id, 'CONFIRM_FRAUD')}>Confirm Fraud</button>{' '}
                  <button style={styles.btn} onClick={() => doAction(r.cluster_id, 'CLEAR_CLUSTER')}>Clear Cluster</button>{' '}
                  <button style={styles.btn} onClick={() => doAction(r.cluster_id, 'MANUAL_REVIEW')}>Manual Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.charts}>
        <div style={styles.chartCard}>
          <h3>Fraud score distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analyticsQuery.data?.fraud_score_histogram ?? []}>
              <XAxis dataKey="bucket" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.chartCard}>
          <h3>Enrollment anomaly timeline</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analyticsQuery.data?.enrollment_timeline ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line dataKey="enrollments" stroke="#1d4ed8" />
              <Line dataKey="weather_alert" stroke="#f59e0b" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 },
  sub: { color: '#6b7280', marginTop: 6, marginBottom: 14 },
  tableWrap: { border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: 10, background: '#f8fafc', fontSize: 12, color: '#475569' },
  td: { padding: 10, borderTop: '1px solid #f1f5f9', fontSize: 13, color: '#0f172a' },
  tr: {},
  btn: { border: '1px solid #cbd5e1', borderRadius: 6, background: '#fff', padding: '4px 8px', cursor: 'pointer', fontSize: 12 },
  charts: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 },
  chartCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 },
};

