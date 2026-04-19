import CategoryIcon from '../ui/CategoryIcon';

function StatCard({ label, value, sub, valueColor }) {
  return (
    <div style={{ background: 'var(--ink-50)', border: '1px solid var(--border-1)', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 8 }}>
        {label}
      </div>
      <div className="money" style={{ fontSize: 22, fontWeight: 500, color: valueColor, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{sub}</div>
    </div>
  );
}

export default function MetricCards({ summary }) {
  const { total_spent, total_income, savings_invested = 0, recurring_total, recurring_count, savings_rate, national_savings_rate, period_days } = summary;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatCard
          label="Total Spent"
          value={`$${total_spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub={`Last ${period_days} days`}
          valueColor="var(--danger)"
        />
        <StatCard
          label="Total Income"
          value={`$${total_income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub={`Last ${period_days} days`}
          valueColor="var(--success)"
        />
        <StatCard
          label="Recurring Charges"
          value={`$${recurring_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub={`${recurring_count} active subscription${recurring_count !== 1 ? 's' : ''}`}
          valueColor="var(--warning)"
        />
        <StatCard
          label="Savings Rate"
          value={`${savings_rate}%`}
          sub={`National avg: ${national_savings_rate}%`}
          valueColor={savings_rate >= national_savings_rate ? 'var(--success)' : 'var(--danger)'}
        />
      </div>

      {savings_invested > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, var(--teal-50), #fff)',
          border: '1px solid var(--teal-100)',
          borderRadius: 12,
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'var(--teal-500)',
            display: 'grid', placeItems: 'center',
          }}>
            <CategoryIcon iconKey="savings" size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-600)', marginBottom: 4 }}>
              Amount Saved / Invested
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
              <span className="money" style={{ fontSize: 28, fontWeight: 500, color: 'var(--teal-700)' }}>
                ${savings_invested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span style={{ fontSize: 13, color: 'var(--teal-600)' }}>
                in the last {period_days} days — this money is working for your future, not being spent.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
