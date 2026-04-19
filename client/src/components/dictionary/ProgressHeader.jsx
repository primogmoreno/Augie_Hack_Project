import { TERMS } from '../../data/dictionaryTerms';

export default function ProgressHeader({ readTerms }) {
  const readCount = readTerms.size;
  const totalCount = TERMS.length;
  const pct = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          width: 120,
          height: 6,
          background: 'var(--ink-100)',
          borderRadius: 3,
          overflow: 'hidden',
          border: '0.5px solid var(--border-1)',
        }}
      >
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: '#639922',
          borderRadius: 3,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <div style={{
        fontSize: 12,
        color: 'var(--fg-2)',
        fontFamily: 'var(--font-sans)',
        whiteSpace: 'nowrap',
      }}>
        {readCount} of {totalCount} read
      </div>
    </div>
  );
}
