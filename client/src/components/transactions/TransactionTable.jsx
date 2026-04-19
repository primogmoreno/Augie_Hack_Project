import CategoryIcon from '../ui/CategoryIcon';
import Button from '../ui/Button';

const CATEGORY_COLORS = {
  'Food & Dining':       { primary: '#173124', light: 'rgba(23,49,36,0.06)' },
  'Shopping':            { primary: '#2F8F5A', light: '#E4F2EA' },
  'Transport':           { primary: '#A8631A', light: '#FBEBD3' },
  'Entertainment':       { primary: '#4f1b08', light: 'rgba(79,27,8,0.08)' },
  'Utilities':           { primary: '#57534e', light: '#f3f1eb' },
  'Income':              { primary: '#2F8F5A', light: '#E4F2EA' },
  'Healthcare':          { primary: '#B83A2E', light: '#F6DDD8' },
  'Savings & Investing': { primary: '#173124', light: 'rgba(23,49,36,0.06)' },
  'Other':               { primary: '#a09a93', light: '#f3f1eb' },
};

function SkeletonRow() {
  return (
    <tr>
      {[60, 180, 100, 70].map((w, i) => (
        <td key={i} style={{ padding: '18px 24px' }}>
          <div style={{ height: 13, width: w, borderRadius: 4, background: 'var(--surface-low)', animation: 'pulse 1.4s ease-in-out infinite' }} />
        </td>
      ))}
    </tr>
  );
}

export default function TransactionTable({ transactions, loading, onResetFilters }) {
  const thStyle = {
    padding: '14px 24px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: 'var(--fg-3)',
    fontFamily: 'var(--font-sans)',
    background: 'var(--surface-low)',
    borderBottom: '1px solid var(--border-1)',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-1)', background: 'var(--surface-card)' }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--primary)', margin: 0 }}>All Entries</h4>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Category</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && transactions.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--fg-3)' }}>
                  <div style={{ fontSize: 15, marginBottom: 12 }}>No transactions match your filters.</div>
                  <Button variant="secondary" size="sm" onClick={onResetFilters}>Reset filters</Button>
                </td>
              </tr>
            )}

            {!loading && transactions.map((tx, i) => {
              const colors  = CATEGORY_COLORS[tx.category] ?? CATEGORY_COLORS['Other'];
              const isIncome = tx.type === 'credit';
              const absAmt  = Math.abs(tx.amount);
              return (
                <tr
                  key={tx.id ?? i}
                  style={{ borderBottom: '1px solid var(--border-1)', transition: 'background var(--dur-fast) var(--ease-out)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-low)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Date */}
                  <td style={{ padding: '18px 24px', fontSize: 13, color: 'var(--fg-3)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>
                    {tx.date_formatted || tx.date}
                  </td>

                  {/* Description */}
                  <td style={{ padding: '18px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background var(--dur-fast), color var(--dur-fast)' }}>
                        <CategoryIcon iconKey={tx.merchant_icon} size={18} color={colors.primary} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-sans)' }}>
                          {tx.merchant}
                          {tx.is_recurring && (
                            <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 6px', borderRadius: 10, background: '#FBEBD3', color: '#A8631A' }}>
                              recurring
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category badge */}
                  <td style={{ padding: '18px 24px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 11, padding: '4px 10px', borderRadius: 999,
                      background: colors.light, color: colors.primary, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {tx.category}
                    </span>
                  </td>

                  {/* Amount */}
                  <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: isIncome ? 'var(--success)' : 'var(--primary)' }}>
                      {isIncome ? '+' : '−'}${absAmt.toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
