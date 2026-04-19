const CATEGORY_COLORS = {
  'Food & Dining':       { primary: '#185FA5', light: '#E6F1FB' },
  'Shopping':            { primary: '#639922', light: '#EAF3DE' },
  'Transport':           { primary: '#BA7517', light: '#FAEEDA' },
  'Entertainment':       { primary: '#533AB7', light: '#EEEDFE' },
  'Utilities':           { primary: '#5F5E5A', light: '#F1EFE8' },
  'Income':              { primary: '#3B6D11', light: '#EAF3DE' },
  'Healthcare':          { primary: '#993556', light: '#FBEAF0' },
  'Savings & Investing': { primary: '#1F7A6B', light: '#EAF5F3' },
  'Other':               { primary: '#888780', light: '#F1EFE8' },
};

export default function TransactionRow({ tx, totalSpent, maxAmount, isLast }) {
  const colors = CATEGORY_COLORS[tx.category] ?? CATEGORY_COLORS['Other'];
  const isIncome = tx.type === 'credit';
  const absAmt = Math.abs(tx.amount);
  const pct = totalSpent > 0 ? (absAmt / totalSpent * 100).toFixed(1) : 0;
  const barWidth = maxAmount > 0 ? Math.round(absAmt / maxAmount * 100) : 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '35% 16% 18% 20% 11%',
      alignItems: 'center',
      padding: '11px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--border-1)',
      gap: 8,
    }}>
      {/* Merchant */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: colors.light,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15,
        }}>
          {tx.merchant_icon}
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

      {/* % of spending bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isIncome ? (
          <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>—</span>
        ) : (
          <>
            <div style={{ flex: 1, height: 6, background: 'var(--ink-100)', borderRadius: 999 }}>
              <div style={{ width: `${barWidth}%`, height: '100%', background: colors.primary, borderRadius: 999 }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--fg-3)', width: 36, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
          </>
        )}
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
