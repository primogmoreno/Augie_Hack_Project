import { useEffect, useRef } from 'react';

const TYPE_PILLS = [
  { id: 'all',       label: 'All' },
  { id: 'debit',     label: 'Expenses' },
  { id: 'credit',    label: 'Income' },
  { id: 'recurring', label: 'Recurring' },
];

const SORT_OPTIONS = [
  { value: 'date-desc',    label: 'Date (newest first)' },
  { value: 'date-asc',     label: 'Date (oldest first)' },
  { value: 'amount-desc',  label: 'Amount (high to low)' },
  { value: 'amount-asc',   label: 'Amount (low to high)' },
  { value: 'cat',          label: 'Category A–Z' },
];

export default function FilterBar({
  categories, activeCat, setActiveCat,
  activeType, setActiveType,
  searchTerm, setSearchTerm,
  sortKey, setSortKey,
}) {
  const debounceRef = useRef(null);

  const handleSearch = (val) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchTerm(val), 150);
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const pillStyle = (active) => ({
    padding: '5px 12px',
    borderRadius: 'var(--radius-sm)',
    border: active ? 'none' : '1px solid var(--border-1)',
    background: active ? '#173124' : 'var(--surface-low)',
    color: active ? '#faf9f5' : 'var(--fg-2)',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    transition: 'all var(--dur-fast) var(--ease-out)',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: 'none',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-sm)',
      padding: '14px 18px',
      marginBottom: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Row 1: category pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginRight: 4 }}>Category</span>
        <button style={pillStyle(activeCat === 'all')} onClick={() => setActiveCat('all')}>All</button>
        {categories.map(cat => (
          <button key={cat} style={pillStyle(activeCat === cat)} onClick={() => setActiveCat(cat)}>{cat}</button>
        ))}
      </div>

      {/* Row 2: type pills + search + sort */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginRight: 4 }}>Type</span>
        {TYPE_PILLS.map(p => (
          <button key={p.id} style={pillStyle(activeType === p.id)} onClick={() => setActiveType(p.id)}>{p.label}</button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            defaultValue={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search merchants, categories…"
            style={{
              padding: '7px 12px',
              border: '1px solid var(--border-1)',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              width: 220,
            }}
          />
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value)}
            style={{
              padding: '7px 10px',
              border: '1px solid var(--border-1)',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
              background: 'var(--surface-card)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
