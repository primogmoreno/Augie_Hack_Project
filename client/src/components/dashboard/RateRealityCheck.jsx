import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import Card from '../ui/Card';
import api from '../../services/api';

const FALLBACK_DATA = [
  { date: 'Q1 2022', creditUnion: 10.8, bank: 14.1 },
  { date: 'Q2 2022', creditUnion: 11.0, bank: 14.4 },
  { date: 'Q3 2022', creditUnion: 11.3, bank: 14.9 },
  { date: 'Q4 2022', creditUnion: 11.6, bank: 15.3 },
  { date: 'Q1 2023', creditUnion: 11.8, bank: 15.7 },
  { date: 'Q2 2023', creditUnion: 12.0, bank: 16.0 },
  { date: 'Q3 2023', creditUnion: 12.2, bank: 16.3 },
  { date: 'Q4 2023', creditUnion: 12.1, bank: 16.1 },
  { date: 'Q1 2024', creditUnion: 12.0, bank: 16.0 },
  { date: 'Q2 2024', creditUnion: 11.9, bank: 15.8 },
];

export default function RateRealityCheck({ userApr = 21.99, userBalance = 1284.55 }) {
  const [series, setSeries] = useState(FALLBACK_DATA);
  const [latest, setLatest] = useState(FALLBACK_DATA.at(-1));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rates')
      .then(({ data }) => {
        if (data.series?.length) {
          setSeries(data.series);
          setLatest(data.latest ?? data.series.at(-1));
        }
      })
      .catch(() => { /* silent fallback — state already has FALLBACK_DATA */ })
      .finally(() => setLoading(false));
  }, []);

  const annualSavings = (((userApr - latest.creditUnion) / 100) * userBalance).toFixed(2);
  const yMax = Math.ceil(Math.max(userApr, latest.bank) / 5) * 5 + 5;

  if (loading) {
    return (
      <Card style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--fg-3)' }}>
        <div style={{ width: 20, height: 20, border: '2px solid var(--primary-muted)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        Loading rate data…
      </Card>
    );
  }

  return (
    <Card style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-2)', marginBottom: 4 }}>
          Rate Reality Check
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: 0 }}>
          Your rate vs. national averages
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Your APR"        value={`${userApr}%`}             tone="danger"  />
        <StatCard label="Credit Union Avg" value={`${latest.creditUnion}%`} tone="success" />
        <StatCard label="Bank Avg"         value={`${latest.bank}%`}        tone="neutral" />
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-1)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--fg-3)', fontFamily: 'var(--font-sans)' }} />
          <YAxis unit="%" domain={[8, yMax]} tick={{ fontSize: 11, fill: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }} />
          <Tooltip
            formatter={(v) => [`${v}%`]}
            contentStyle={{ fontFamily: 'var(--font-sans)', fontSize: 13, border: '1px solid var(--border-1)', borderRadius: 10, boxShadow: 'var(--shadow-md)' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'var(--font-sans)' }} />
          <ReferenceLine
            y={userApr}
            stroke="var(--danger)"
            strokeDasharray="6 3"
            label={{ value: 'Your rate', fill: 'var(--danger)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
          />
          <Line type="monotone" dataKey="creditUnion" name="Credit Union Avg" stroke="#173124" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="bank"        name="Bank Avg"         stroke="#a09a93" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <div style={{
        marginTop: 20,
        background: 'var(--primary-muted)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        fontSize: 13,
        color: 'var(--primary)',
        lineHeight: 1.55,
      }}>
        At your current rate vs. the credit union average, you could save roughly{' '}
        <strong className="money">${annualSavings}/year</strong> on your current balance.{' '}
        <em>Ask your credit union: "Can I qualify for your current credit card rate?"</em>
      </div>
    </Card>
  );
}

function StatCard({ label, value, tone }) {
  const colors = {
    danger:  { bg: 'var(--danger-bg)',  fg: 'var(--danger)'  },
    success: { bg: 'var(--success-bg)', fg: 'var(--success)' },
    neutral: { bg: 'var(--surface-low)', fg: 'var(--fg-2)'   },
  };
  const c = colors[tone];
  return (
    <div style={{ background: c.bg, borderRadius: 'var(--radius-lg)', padding: '14px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 6 }}>
        {label}
      </div>
      <div className="money" style={{ fontSize: 26, fontWeight: 500, color: c.fg }}>
        {value}
      </div>
    </div>
  );
}
