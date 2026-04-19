import { useState, useEffect, useMemo } from 'react';
import TopBar from '../components/layout/TopBar';
import MetricCards from '../components/transactions/MetricCards';
import SpendingLineChart from '../components/transactions/SpendingLineChart';
import CategoryDonutChart from '../components/transactions/CategoryDonutChart';
import FilterBar from '../components/transactions/FilterBar';
import TransactionTable from '../components/transactions/TransactionTable';
import Button from '../components/ui/Button';
import Icon, { ICONS } from '../components/ui/Icon';
import Card from '../components/ui/Card';
import PlaidLink from '../components/plaid/PlaidLinkButton';
import api from '../services/api';
import { cacheGet, cacheSet } from '../services/cache';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [isConnected, setIsConnected]   = useState(null); // null=loading, true=yes, false=no
  const [dateRange, setDateRange]       = useState(90);
  const [openPlaid, setOpenPlaid]       = useState(null);

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

      const transactions = txRes.data.pending
        ? []
        : (txRes.data.transactions ?? []);
      const summary = sumRes.data.pending ? null : sumRes.data;
      if (transactions.length) setTransactions(transactions);
      if (summary) setSummary(summary);
      setIsConnected(true);
      return { transactions, summary };
    } catch (err) {
      if (err.response?.status === 401) {
        setIsConnected(false);
      } else {
        setIsConnected(true);
        setError("Failed to load transactions. Please try again.");
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
      return;
    }
    fetchData(dateRange).then((data) => {
      if (data) cacheSet(`transactions_${dateRange}`, data);
    });
  }, [dateRange]);


  const categories = useMemo(() =>
    [...new Set(transactions.map(t => t.category))].sort(),
  [transactions]);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    if (activeCat !== 'all')        result = result.filter(t => t.category === activeCat);
    if (activeType === 'debit')     result = result.filter(t => t.type === 'debit');
    if (activeType === 'credit')    result = result.filter(t => t.type === 'credit');
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
      <PlaidLink onReady={openFn => setOpenPlaid(() => openFn)} />

      <TopBar
        title="Transactions"
        subtitle={isConnected ? 'Read-only access · Data not stored' : 'Connect your bank to view transactions'}
        right={
          isConnected ? (
            <div style={{ display: 'flex', gap: 6 }}>
              {RANGE_OPTIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDateRange(d)}
                  style={{
                    padding: '6px 14px', borderRadius: 8,
                    border: dateRange === d ? 'none' : '1px solid var(--border-1)',
                    background: dateRange === d ? 'var(--primary)' : 'transparent',
                    color: dateRange === d ? '#fff' : 'var(--fg-2)',
                    fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)',
                    cursor: 'pointer', transition: 'all var(--dur-fast) var(--ease-out)',
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>
          ) : (
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
            <Card style={{
              background: 'var(--primary)',
              border: 'none', padding: '36px 40px', textAlign: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: 'rgba(255,255,255,0.15)',
                display: 'grid', placeItems: 'center',
                fontSize: 32, margin: '0 auto 20px',
              }}>
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
                {[
                  { icon: ICONS.list,    label: 'Full history' },
                  { icon: ICONS.chart,   label: 'Spending charts' },
                  { icon: ICONS.sliders, label: 'Filter & search' },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(255,255,255,0.15)',
                      display: 'grid', placeItems: 'center', color: '#fff',
                    }}>
                      <Icon d={f.icon} size={20} />
                    </div>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{f.label}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => openPlaid?.()}
                style={{ background: 'var(--fg-inverse)', color: 'var(--primary)', fontWeight: 700, padding: '12px 28px' }}
              >
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
            {error && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, color: 'var(--danger)' }}>{error}</span>
                <Button variant="secondary" size="sm" onClick={() => fetchData(dateRange)}>Retry</Button>
              </div>
            )}

            {summary && !summary.pending && <MetricCards summary={summary} />}

            {summary && !summary.pending && summary.weekly_spending?.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                <SpendingLineChart weeklySpending={summary.weekly_spending} />
                <CategoryDonutChart categoryTotals={summary.category_totals ?? []} />
              </div>
            )}

            <FilterBar
              categories={categories}
              activeCat={activeCat}   setActiveCat={setActiveCat}
              activeType={activeType} setActiveType={setActiveType}
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              sortKey={sortKey}       setSortKey={setSortKey}
            />

            <TransactionTable
              transactions={filteredTransactions}
              loading={loading}
              onResetFilters={resetFilters}
            />
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
