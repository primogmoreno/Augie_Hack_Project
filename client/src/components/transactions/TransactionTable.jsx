import TransactionRow from './TransactionRow';
import Button from '../ui/Button';

const COL_HEADERS = [
  { label: 'Transaction',   width: '35%' },
  { label: 'Category',      width: '16%' },
  { label: 'Amount',        width: '18%' },
  { label: '% of Spending', width: '20%' },
  { label: 'Type',          width: '11%' },
];

function SkeletonRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '35% 16% 18% 20% 11%', gap: 8, padding: '13px 0', borderBottom: '1px solid var(--border-1)' }}>
      {[140, 80, 60, 100, 50].map((w, i) => (
        <div key={i} style={{ height: 14, width: w, borderRadius: 6, background: 'var(--ink-100)', animation: 'pulse 1.4s ease-in-out infinite' }} />
      ))}
    </div>
  );
}

export default function TransactionTable({ transactions, totalSpent, loading, onResetFilters }) {
  const maxAmount = transactions.length > 0 ? Math.max(...transactions.map(t => Math.abs(t.amount))) : 0;

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border-1)', borderRadius: 12, padding: '0 20px' }}>
      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '35% 16% 18% 20% 11%',
        gap: 8, padding: '12px 0', borderBottom: '1px solid var(--border-1)',
      }}>
        {COL_HEADERS.map(h => (
          <div key={h.label} style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)' }}>
            {h.label}
          </div>
        ))}
      </div>

      {/* Count */}
      {!loading && (
        <div style={{ fontSize: 12, color: 'var(--fg-3)', padding: '8px 0 4px' }}>
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

      {/* Empty state */}
      {!loading && transactions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--fg-3)' }}>
          <div style={{ fontSize: 15, marginBottom: 12 }}>No transactions match your filters.</div>
          <Button variant="secondary" size="sm" onClick={onResetFilters}>Reset filters</Button>
        </div>
      )}

      {/* Rows */}
      {!loading && transactions.map((tx, i) => (
        <TransactionRow
          key={tx.id ?? i}
          tx={tx}
          totalSpent={totalSpent}
          maxAmount={maxAmount}
          isLast={i === transactions.length - 1}
        />
      ))}
    </div>
  );
}
