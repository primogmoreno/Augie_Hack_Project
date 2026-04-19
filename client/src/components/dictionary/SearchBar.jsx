import { useRef } from 'react';

const SORT_OPTIONS = [
  { value: 'alpha',     label: 'A to Z' },
  { value: 'milestone', label: 'Milestones first' },
  { value: 'unread',    label: 'Unread first' },
  { value: 'personal',  label: 'Has my data' },
];

export default function SearchBar({ searchVal, onSearchChange, sortKey, onSortChange }) {
  const debounceRef = useRef(null);

  function handleInput(e) {
    const val = e.target.value;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange(val), 200);
  }

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <svg
          viewBox="0 0 24 24"
          width={15}
          height={15}
          fill="none"
          stroke="var(--fg-3)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          aria-label="Search financial terms"
          defaultValue={searchVal}
          onChange={handleInput}
          placeholder="Search terms…"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            paddingLeft: 36,
            paddingRight: 12,
            paddingTop: 9,
            paddingBottom: 9,
            border: '0.5px solid var(--border-1)',
            borderRadius: 'var(--radius-md)',
            fontSize: 13,
            fontFamily: 'var(--font-sans)',
            color: 'var(--fg-1)',
            background: 'var(--surface-card)',
            outline: 'none',
          }}
        />
      </div>

      <select
        aria-label="Sort terms by"
        value={sortKey}
        onChange={e => onSortChange(e.target.value)}
        style={{
          flexShrink: 0,
          width: 150,
          padding: '9px 12px',
          border: '0.5px solid var(--border-1)',
          borderRadius: 'var(--radius-md)',
          fontSize: 13,
          fontFamily: 'var(--font-sans)',
          color: 'var(--fg-1)',
          background: 'var(--surface-card)',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
