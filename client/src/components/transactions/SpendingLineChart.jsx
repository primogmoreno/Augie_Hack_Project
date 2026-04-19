import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';

export default function SpendingLineChart({ weeklySpending }) {
  return (
    <Card style={{ padding: 20, flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 4 }}>
        Weekly Spending
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, margin: '0 0 16px' }}>
        Spending trend
      </h3>
      <div style={{ height: 160, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeklySpending} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--fg-3)', fontFamily: 'var(--font-sans)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }} tickFormatter={v => `$${v}`} />
            <Tooltip
              formatter={v => [`$${v.toFixed(2)}`, 'Spending']}
              contentStyle={{ fontFamily: 'var(--font-sans)', fontSize: 13, border: '1px solid var(--border-1)', borderRadius: 10, boxShadow: 'var(--shadow-md)' }}
            />
            <Line type="monotone" dataKey="total" stroke="#185FA5" strokeWidth={2} dot={{ r: 3, fill: '#185FA5' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
