import { useState, useEffect, useMemo } from 'react';
import TopBar from '../components/layout/TopBar';
import MetricCards from '../components/transactions/MetricCards';
import SpendingLineChart from '../components/transactions/SpendingLineChart';
import CategoryDonutChart from '../components/transactions/CategoryDonutChart';
import FilterBar from '../components/transactions/FilterBar';
import TransactionTable from '../components/transactions/TransactionTable';
import Button from '../components/ui/Button';
import api from '../services/api';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [dateRange, setDateRange]       = useState(90);

  // Filter/sort state
  const [activeCat, setActiveCat]     = useState('all');
  const [activeType, setActiveType]   = useState('all');
  const [searchTerm, setSearchTerm]   = useState('');
  const [sortKey, setSortKey]         = useState('date-desc');

  const fetchData = async (days) => {
    setLoading(true);
    setError(null);
    try {
      const [txRes, sumRes] = await Promise.all([
        api.get(`/transactions?days=${days}`),
        api.get(`/summary?days=${days}`),
      ]);
      if (!txRes.data.pending) setTransactions(txRes.data.transactions ?? []);
      if (!sumRes.data.pending) setSummary(sumRes.data);
    } catch {
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(dateRange); }, [dateRange]);

  // Derive category list from current transactions
  const categories = useMemo(() =>
    [...new Set(transactions.map(t => t.category))].sort(),
  [transactions]);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (activeCat !== 'all')       result = result.filter(t => t.category === activeCat);
    if (activeType === 'debit')    result = result.filter(t => t.type === 'debit');
    if (activeType === 'credit')   result = result.filter(t => t.type === 'credit');
    if (activeType === 'recurring') result = result.filter(t => t.is_recurring);

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t =>
        (t.merchant ?? '').toLowerCase().includes(term) ||
        (t.category ?? '').toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      switch (sortKey) {
        case 'date-desc':   return new Date(b.date) - new Date(a.date);
        case 'date-asc':    return new Date(a.date) - new Date(b.date);
        case 'amount-desc': return Math.abs(b.amount) - Math.abs(a.amount);
        case 'amount-asc':  return Math.abs(a.amount) - Math.abs(b.amount);
        case 'cat':         return (a.category ?? '').localeCompare(b.category ?? '');
        default:            return 0;
      }
    });

    return result;
  }, [transactions, activeCat, activeType, searchTerm, sortKey]);

  const resetFilters = () => {
    setActiveCat('all');
    setActiveType('all');
    setSearchTerm('');
    setSortKey('date-desc');
  };

  const RANGE_OPTIONS = [30, 60, 90];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar
        title="Transactions"
        subtitle="Read-only access · Data not stored"
        right={
          <div style={{ display: 'flex', gap: 6 }}>
            {RANGE_OPTIONS.map(d => (
              <button
                key={d}
                onClick={() => setDateRange(d)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: dateRange === d ? 'none' : '1px solid var(--border-1)',
                  background: dateRange === d ? 'var(--teal-500)' : 'transparent',
                  color: dateRange === d ? '#fff' : 'var(--fg-2)',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  transition: 'all var(--dur-fast) var(--ease-out)',
                }}
              >
                {d}d
              </button>
            ))}
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px', background: 'var(--ink-0)' }}>

        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: 'var(--danger)' }}>{error}</span>
            <Button variant="secondary" size="sm" onClick={() => fetchData(dateRange)}>Retry</Button>
          </div>
        )}

        {/* Metric cards */}
        {summary && !summary.pending && (
          <MetricCards summary={summary} />
        )}

        {/* Charts */}
        {summary && !summary.pending && summary.weekly_spending?.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
            <SpendingLineChart weeklySpending={summary.weekly_spending} />
            <CategoryDonutChart categoryTotals={summary.category_totals ?? []} />
          </div>
        )}

        {/* Filter bar */}
        <FilterBar
          categories={categories}
          activeCat={activeCat}   setActiveCat={setActiveCat}
          activeType={activeType} setActiveType={setActiveType}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortKey={sortKey}       setSortKey={setSortKey}
        />

        {/* Transaction table */}
        <TransactionTable
          transactions={filteredTransactions}
          totalSpent={summary?.total_spent ?? 0}
          loading={loading}
          onResetFilters={resetFilters}
        />

      </div>
    </div>
  );
}
