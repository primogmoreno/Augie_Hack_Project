import { forwardRef } from 'react';

const FilterBar = forwardRef(function FilterBar({
  searchVal,
  onSearchChange,
  sortKey,
  onSortChange,
  sortOptions,
  resultsCount,
}, ref) {
  return (
    <div style={{
      background: 'var(--surface-low)',
      borderRadius: 'var(--radius-xl)',
      padding: 8,
      display: 'flex',
      gap: 8,
      alignItems: 'center',
    }}>
      <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--fg-3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={ref}
          type="text"
          aria-label="Search financial terms"
          value={searchVal}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search terms…   (press / to focus)"
          style={{
            width: '100%', boxSizing: 'border-box',
            paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
            border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: 13, fontFamily: 'var(--font-sans)',
            color: 'var(--fg-1)', background: 'var(--surface-card)',
            outline: 'none',
          }}
        />
      </div>

      <select
        aria-label="Sort terms"
        value={sortKey}
        onChange={e => onSortChange(e.target.value)}
        style={{
          flexShrink: 0, padding: '10px 14px',
          border: 'none', borderRadius: 'var(--radius-md)',
          fontSize: 13, fontFamily: 'var(--font-sans)',
          color: 'var(--fg-1)', background: 'var(--surface-card)',
          cursor: 'pointer', outline: 'none',
        }}
      >
        {sortOptions.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <div style={{
        paddingRight: 8, fontSize: 12, color: 'var(--fg-3)',
        fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {resultsCount} term{resultsCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
});

export default FilterBar;
