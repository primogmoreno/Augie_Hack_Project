import { useState, useEffect, useMemo } from 'react';
import TopBar from '../components/layout/TopBar';
import MetricCards from '../components/transactions/MetricCards';
import SpendingLineChart from '../components/transactions/SpendingLineChart';
import FilterBar from '../components/transactions/FilterBar';
import TransactionTable from '../components/transactions/TransactionTable';
import Button from '../components/ui/Button';
import Icon, { ICONS } from '../components/ui/Icon';
import Card from '../components/ui/Card';
import PlaidLink from '../components/plaid/PlaidLinkButton';
import api from '../services/api';
import { cacheGet, cacheSet } from '../services/cache';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 10;

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [isConnected, setIsConnected]   = useState(null);
  const [dateRange, setDateRange]       = useState(90);
  const [openPlaid, setOpenPlaid]       = useState(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const navigate = useNavigate();

  const [activeCat, setActiveCat]       = useState('all');
  const [searchTerm, setSearchTerm]     = useState('');
  const [sortKey, setSortKey]           = useState('date-desc');
  const [recurringOnly, setRecurringOnly] = useState(false);

  const fetchData = async (days) => {
    setLoading(true);
    setError(null);
    try {
      const [txRes, sumRes] = await Promise.all([
        api.get(`/transactions?days=${days}`),
        api.get(`/summary?days=${days}`),
      ]);
      const txs = txRes.data.pending ? [] : (txRes.data.transactions ?? []);
      const sum = sumRes.data.pending ? null : sumRes.data;
      if (txs.length) setTransactions(txs);
      if (sum) setSummary(sum);
      setIsConnected(true);
      return { transactions: txs, summary: sum };
    } catch (err) {
      if (err.response?.status === 401) {
        setIsConnected(false);
      } else {
        setIsConnected(true);
        setError('Failed to load transactions. Please try again.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = cacheGet(`transactions_${dateRange}`);
    if (cached) {
      setTransactions(cached.transactions ?? []);
      setSummary(cached.summary);
      setIsConnected(true);
      setLoading(false);
      return;
    }
    fetchData(dateRange).then(data => {
      if (data) cacheSet(`transactions_${dateRange}`, data);
    });
  }, [dateRange]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [activeCat, searchTerm, sortKey, dateRange, recurringOnly]);

  const categories = useMemo(() =>
    [...new Set(transactions.map(t => t.category))].sort(),
  [transactions]);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    if (activeCat !== 'all')   result = result.filter(t => t.category === activeCat);
    if (recurringOnly)         result = result.filter(t => t.is_recurring);
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
  }, [transactions, activeCat, searchTerm, sortKey, recurringOnly]);

  const totalPages    = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const startIdx      = (currentPage - 1) * PAGE_SIZE;
  const paginatedTxs  = filteredTransactions.slice(startIdx, startIdx + PAGE_SIZE);

  const resetFilters = () => {
    setActiveCat('all');
    setSearchTerm('');
    setSortKey('date-desc');
    setRecurringOnly(false);
    setCurrentPage(1);
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const aiInsightText = summary
    ? (() => {
        const top = (summary.category_totals ?? []).find(c => c.category !== 'Income');
        if (top) return `Your spending in '${top.category}' leads this period. Consider a simulation of your budget to see where adjustments have the most impact.`;
        return 'Review your spending patterns and use the simulation to plan ahead.';
      })()
    : 'Connect your accounts to get personalized spending insights from your AI mentor.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PlaidLink onReady={openFn => setOpenPlaid(() => openFn)} />

      <TopBar
        title="Transactions"
        subtitle={isConnected ? 'Read-only access · Data not stored' : 'Connect your bank to view transactions'}
        right={
          !isConnected && (
            <Button variant="primary" size="sm" onClick={() => openPlaid?.()}>
              <Icon d={ICONS.plus} size={14} /> Connect bank
            </Button>
          )
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px', background: 'var(--bg-page)' }}>

        {/* ── NOT CONNECTED ─────────────────────────────────────────── */}
        {isConnected === false && (
          <div style={{ maxWidth: 640, margin: '40px auto 0' }}>
            <Card style={{ background: 'var(--primary)', border: 'none', padding: '36px 40px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center', fontSize: 32, margin: '0 auto 20px' }}>
                🏦
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>
                Bank not connected
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, color: '#fff', margin: '0 0 12px', lineHeight: 1.2 }}>
                See every transaction in one place
              </h2>
              <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.75)', margin: '0 0 28px', lineHeight: 1.65, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
                Connect your bank account to view, filter, and search your full transaction history — categorized automatically and updated in real time.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 28 }}>
                {[{ icon: ICONS.list, label: 'Full history' }, { icon: ICONS.chart, label: 'Spending charts' }, { icon: ICONS.sliders, label: 'Filter & search' }].map(f => (
                  <div key={f.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center', color: '#fff' }}>
                      <Icon d={f.icon} size={20} />
                    </div>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{f.label}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => openPlaid?.()} style={{ background: 'var(--fg-inverse)', color: 'var(--primary)', fontWeight: 700, padding: '12px 28px' }}>
                <Icon d={ICONS.lock} size={14} /> Connect via Plaid — it's secure
              </Button>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '16px 0 0' }}>
                We never store your bank credentials.
              </p>
            </Card>
          </div>
        )}

        {/* ── CONNECTED ─────────────────────────────────────────────── */}
        {isConnected === true && (
          <div style={{ animation: 'fadeIn var(--dur-slow) var(--ease-out)' }}>
            {/* Hero header */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 56, color: 'var(--primary)', letterSpacing: '-0.02em', lineHeight: 1, margin: '0 0 12px' }}>
                The Ledger
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--fg-2)', maxWidth: 560, lineHeight: 1.65, margin: 0 }}>
                A comprehensive chronicle of your financial movements. Every entry represents a step towards curated wealth and institutional clarity.
              </p>
            </div>

            {error && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, color: 'var(--danger)' }}>{error}</span>
                <Button variant="secondary" size="sm" onClick={() => fetchData(dateRange)}>Retry</Button>
              </div>
            )}

            {summary && !summary.pending && <MetricCards summary={summary} />}

            {/* Chart + AI Insight grid */}
            {summary && !summary.pending && summary.weekly_spending?.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 24 }}>
                <SpendingLineChart weeklySpending={summary.weekly_spending} />

                {/* AI Insight card */}
                <div style={{ background: 'var(--primary)', borderRadius: 'var(--radius-xl)', padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 24, color: 'rgba(255,179,157,0.8)', marginBottom: 12 }}>✦</div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--fg-inverse)', lineHeight: 1.3, margin: '0 0 12px' }}>
                      Insight from your Mentor:
                    </h4>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(176,205,187,0.9)', margin: 0 }}>
                      {aiInsightText}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/simulate')}
                    style={{ marginTop: 24, alignSelf: 'flex-start', background: 'none', border: 'none', borderBottom: '2px solid rgba(255,179,157,0.6)', paddingBottom: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(250,249,245,0.75)', cursor: 'pointer' }}
                  >
                    View Simulation
                  </button>
                </div>
              </div>
            )}

            {/* Unified filter bar */}
            <FilterBar
              categories={categories}
              activeCat={activeCat}         setActiveCat={setActiveCat}
              searchTerm={searchTerm}       setSearchTerm={setSearchTerm}
              sortKey={sortKey}             setSortKey={setSortKey}
              dateRange={dateRange}         setDateRange={setDateRange}
              recurringOnly={recurringOnly} setRecurringOnly={setRecurringOnly}
              onApply={() => setCurrentPage(1)}
            />

            {/* Transaction table */}
            <TransactionTable
              transactions={paginatedTxs}
              loading={loading}
              onResetFilters={resetFilters}
            />

            {/* Pagination */}
            {!loading && filteredTransactions.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', marginTop: 2, background: 'var(--surface-low)', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  Showing {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, filteredTransactions.length)} of {filteredTransactions.length} entries
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ padding: 6, background: 'none', border: 'none', cursor: currentPage === 1 ? 'default' : 'pointer', color: currentPage === 1 ? 'var(--fg-3)' : 'var(--fg-2)', borderRadius: 4 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  {pageNumbers.map(n => (
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      style={{
                        width: 32, height: 32, borderRadius: 4, border: 'none',
                        background: n === currentPage ? 'var(--primary)' : 'transparent',
                        color: n === currentPage ? 'var(--fg-inverse)' : 'var(--fg-2)',
                        fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-sans)', cursor: 'pointer',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{ padding: 6, background: 'none', border: 'none', cursor: currentPage === totalPages ? 'default' : 'pointer', color: currentPage === totalPages ? 'var(--fg-3)' : 'var(--fg-2)', borderRadius: 4 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LOADING ───────────────────────────────────────────────── */}
        {isConnected === null && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--fg-3)', fontSize: 14 }}>
            Loading…
          </div>
        )}
      </div>
    </div>
  );
}
