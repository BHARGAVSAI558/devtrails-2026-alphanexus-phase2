import React, { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import api from '../api';

const SimulationRow = React.memo(function SimulationRow({ s }: { s: any }) {
  return (
    <>
      <td style={styles.td}>{s.id}</td>
      <td style={styles.td}>{s.user_id}</td>
      <td style={styles.td}>{s.decision}</td>
      <td style={styles.td}>₹{Number(s.payout).toFixed(0)}</td>
      <td style={styles.td}>{Number(s.fraud_score).toFixed(2)}</td>
      <td style={styles.td}>{new Date(s.created_at).toLocaleString()}</td>
    </>
  );
});

export default function Simulations() {
  const [zoneId, setZoneId] = useState('hyd_central');
  const [disruptionType, setDisruptionType] = useState('Heavy Rain');
  const [fraudScenario, setFraudScenario] = useState('none');
  const [workers, setWorkers] = useState(10);
  const [running, setRunning] = useState(false);

  const simulationsQuery = useQuery({
    queryKey: ['admin', 'simulations'],
    queryFn: async () => (await api.get('/admin/simulations?limit=100')).data,
    refetchInterval: 20_000,
  });

  const runSimulation = async () => {
    setRunning(true);
    try {
      await api.post('/admin/simulations/run', {
        zone_id: zoneId,
        disruption_type: disruptionType,
        fraud_scenario: fraudScenario,
        workers,
      });
      await simulationsQuery.refetch();
    } finally {
      setRunning(false);
    }
  };

  const sims = useMemo(() => simulationsQuery.data ?? [], [simulationsQuery.data]);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: sims.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 46,
    overscan: 8,
  });

  return (
    <div>
      <h1 style={styles.title}>Simulations</h1>
      <p style={styles.sub}>Run scenario simulations and track outcomes</p>

      <div style={styles.form}>
        <input style={styles.input} value={zoneId} onChange={(e) => setZoneId(e.target.value)} placeholder="Zone ID" />
        <select style={styles.input} value={disruptionType} onChange={(e) => setDisruptionType(e.target.value)}>
          <option>Heavy Rain</option>
          <option>Extreme Heat</option>
          <option>AQI Spike</option>
          <option>Curfew</option>
          <option>Platform Outage</option>
        </select>
        <select style={styles.input} value={fraudScenario} onChange={(e) => setFraudScenario(e.target.value)}>
          <option value="none">none</option>
          <option value="gps_spoof">GPS spoof</option>
          <option value="ring_fraud">ring fraud</option>
        </select>
        <input style={styles.input} type="number" min={1} max={100} value={workers} onChange={(e) => setWorkers(Number(e.target.value))} />
        <button style={styles.btn} disabled={running} onClick={runSimulation}>{running ? 'Running...' : 'Run Simulation'}</button>
      </div>

      <div style={{ ...styles.tableWrap, height: 460, overflow: 'auto' }} ref={parentRef}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>User ID</th>
              <th style={styles.th}>Decision</th>
              <th style={styles.th}>Payout</th>
              <th style={styles.th}>Fraud Score</th>
              <th style={styles.th}>Created</th>
            </tr>
          </thead>
          <tbody style={{ position: 'relative', height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((vi) => {
              const s = sims[vi.index];
              if (!s) return null;
              return (
                <tr key={s.id} style={{ position: 'absolute', transform: `translateY(${vi.start}px)`, width: '100%' }}>
                  <SimulationRow s={s} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 },
  sub: { color: '#6b7280', marginTop: 6, marginBottom: 14 },
  form: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 120px auto', gap: 10, marginBottom: 12 },
  input: { border: '1px solid #cbd5e1', borderRadius: 8, padding: '9px 12px' },
  btn: { border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', padding: '8px 12px', cursor: 'pointer', fontWeight: 700 },
  tableWrap: { border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: 10, background: '#f8fafc', fontSize: 12, color: '#475569' },
  td: { padding: 10, borderTop: '1px solid #f1f5f9', fontSize: 13, color: '#0f172a' },
};

