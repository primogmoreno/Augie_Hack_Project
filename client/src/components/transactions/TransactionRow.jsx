import CategoryIcon from '../ui/CategoryIcon';

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

export default function TransactionRow({ tx, isLast }) {
  const colors = CATEGORY_COLORS[tx.category] ?? CATEGORY_COLORS['Other'];
  const isIncome = tx.type === 'credit';
  const absAmt = Math.abs(tx.amount);

  return (
    <div className="tx-row" style={{
      display: 'grid',
      gridTemplateColumns: '45% 25% 18% 12%',
      alignItems: 'center',
      padding: '11px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--border-1)',
      gap: 8,
    }}>
      {/* Merchant */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="category-icon-box" style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: colors.light,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CategoryIcon iconKey={tx.merchant_icon} size={16} color={colors.primary} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            {tx.merchant}
            {tx.is_recurring && (
              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: '#FAEEDA', color: '#854F0B' }}>
                recurring
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 1 }}>{tx.date_formatted}</div>
        </div>
      </div>

      {/* Category badge */}
      <div>
        <span style={{
          fontSize: 11, padding: '3px 8px', borderRadius: 999,
          background: colors.light, color: colors.primary, fontWeight: 600,
        }}>
          {tx.category}
        </span>
      </div>

      {/* Amount */}
      <div className="money" style={{ fontSize: 13, fontWeight: 500, color: isIncome ? '#3B6D11' : '#A32D2D' }}>
        {isIncome ? '+' : '−'}${absAmt.toFixed(2)}
      </div>

      {/* Type badge */}
      <div>
        <span style={{
          fontSize: 11, padding: '3px 8px', borderRadius: 999, fontWeight: 600,
          background: isIncome ? '#EAF3DE' : 'var(--ink-50)',
          color: isIncome ? '#3B6D11' : 'var(--fg-2)',
        }}>
          {isIncome ? 'credit' : 'debit'}
        </span>
      </div>
    </div>
  );
}
