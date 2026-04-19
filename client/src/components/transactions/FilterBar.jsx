import { useRef } from 'react';

const SORT_OPTIONS = [
  { value: 'date-desc',   label: 'Date (newest first)' },
  { value: 'date-asc',    label: 'Date (oldest first)' },
  { value: 'amount-desc', label: 'Amount (high to low)' },
  { value: 'amount-asc',  label: 'Amount (low to high)' },
  { value: 'cat',         label: 'Category A–Z' },
];

const SEARCH_ICON = 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z';

export default function FilterBar({
  categories, activeCat, setActiveCat,
  searchTerm, setSearchTerm,
  sortKey, setSortKey,
  dateRange, setDateRange,
  recurringOnly, setRecurringOnly,
  onApply,
}) {
  const debounceRef = useRef(null);

  const handleSearch = (val) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchTerm(val), 150);
  };

  const selectStyle = {
    background: 'var(--surface-card)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px',
    fontSize: 13,
    fontFamily: 'var(--font-sans)',
    color: 'var(--fg-1)',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    paddingRight: 28,
  };

  return (
    <div style={{
      background: 'var(--surface-low)',
      borderRadius: 'var(--radius-xl)',
      padding: 8,
      marginBottom: 20,
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      {/* Search input */}
      <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--fg-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={SEARCH_ICON} />
        </svg>
        <input
          defaultValue={searchTerm}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search transactions, merchants…"
          style={{ border: 'none', outline: 'none', fontSize: 13, fontFamily: 'var(--font-sans)', background: 'transparent', width: '100%', color: 'var(--fg-1)' }}
        />
      </div>

      {/* Category select */}
      <div style={{ position: 'relative' }}>
        <select value={activeCat} onChange={e => setActiveCat(e.target.value)} style={selectStyle}>
          <option value="all">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--fg-3)" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
      </div>

      {/* Date range select */}
      <div style={{ position: 'relative' }}>
        <select value={dateRange} onChange={e => setDateRange(Number(e.target.value))} style={selectStyle}>
          <option value={30}>Last 30 Days</option>
          <option value={60}>Last 60 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
        <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--fg-3)" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
      </div>

      {/* Sort select */}
      <div style={{ position: 'relative' }}>
        <select value={sortKey} onChange={e => setSortKey(e.target.value)} style={selectStyle}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--fg-3)" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
      </div>

      {/* Recurring toggle */}
      <button
        onClick={() => setRecurringOnly(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: recurringOnly ? 'var(--primary-muted)' : 'var(--surface-card)',
          color: recurringOnly ? 'var(--primary)' : 'var(--fg-2)',
          border: recurringOnly ? '1.5px solid var(--primary)' : '1.5px solid transparent',
          borderRadius: 'var(--radius-md)',
          padding: '9px 14px', fontSize: 13, fontWeight: recurringOnly ? 700 : 500,
          fontFamily: 'var(--font-sans)', cursor: 'pointer', whiteSpace: 'nowrap',
          transition: 'all var(--dur-fast) var(--ease-out)',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
        </svg>
        Recurring
      </button>

      {/* Apply button */}
      <button
        onClick={onApply}
        style={{
          background: 'var(--primary)', color: 'var(--fg-inverse)',
          border: 'none', borderRadius: 'var(--radius-md)',
          padding: '10px 20px', fontSize: 12, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          fontFamily: 'var(--font-sans)', cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'opacity var(--dur-fast) var(--ease-out)',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Apply Filters
      </button>
    </div>
  );
}
