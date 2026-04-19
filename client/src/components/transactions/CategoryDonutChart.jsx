import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';

export default function CategoryDonutChart({ categoryTotals }) {
  const total = categoryTotals.reduce((s, c) => s + c.total, 0);

  return (
    <Card style={{ padding: 20, flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 4 }}>
        By Category
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, margin: '0 0 16px' }}>
        Spending breakdown
      </h3>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ height: 160, width: 160, flexShrink: 0, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryTotals} dataKey="total" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={2}>
                {categoryTotals.map((entry, i) => (
                  <Cell key={i} fill={entry.color?.primary ?? '#888'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`$${v.toFixed(2)}`]}
                contentStyle={{ fontFamily: 'var(--font-sans)', fontSize: 13, border: '1px solid var(--border-1)', borderRadius: 10 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {categoryTotals.map(c => (
            <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: c.color?.primary ?? '#888', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12, color: 'var(--fg-2)' }}>{c.category}</span>
              <span className="money" style={{ fontSize: 12, color: 'var(--fg-1)', fontWeight: 500 }}>
                ${c.total.toFixed(2)}
              </span>
              <span style={{ fontSize: 11, color: 'var(--fg-3)', width: 36, textAlign: 'right' }}>
                {total > 0 ? Math.round(c.total / total * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
