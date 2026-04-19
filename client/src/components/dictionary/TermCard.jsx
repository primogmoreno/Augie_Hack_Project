import { CATEGORIES } from '../../data/dictionaryCategories';
import TermCardExpanded from './TermCardExpanded';

export default function TermCard({
  term,
  isExpanded,
  isRead,
  onToggle,
  onMarkRead,
  onNavigateToTerm,
  contextData,
  contextLoading,
  isConnected,
  activeCat,
}) {
  const cat = CATEGORIES.find(c => c.id === term.cat);

  return (
    <div
      style={{
        gridColumn: isExpanded ? '1 / -1' : undefined,
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        background: 'var(--surface-card)',
        cursor: isExpanded ? 'default' : 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.borderColor = 'var(--border-2)'; }}
      onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.borderColor = 'var(--border-1)'; }}
      onClick={() => { if (!isExpanded) onToggle(term.id); }}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(term.id); } }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-1)', fontFamily: 'var(--font-sans)' }}>
              {term.name}
            </span>
            {term.milestone && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
                background: '#FBEBD3', color: '#A8631A', border: '0.5px solid #A8631A',
              }}>milestone</span>
            )}
            {isRead && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
                background: '#E4F2EA', color: '#173124', border: '0.5px solid #2F8F5A',
              }}>read</span>
            )}
            {term.hasPersonalData && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
                background: 'rgba(23,49,36,0.06)', color: '#173124', border: '0.5px solid #173124',
              }}>my data</span>
            )}
          </div>

          {activeCat === 'all' && cat && (
            <div style={{ fontSize: 10, color: 'var(--fg-3)', marginBottom: 4, fontFamily: 'var(--font-sans)' }}>
              {cat.name}
            </div>
          )}

          <div style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5, fontFamily: 'var(--font-sans)' }}>
            {term.preview}
          </div>
        </div>

        <svg
          viewBox="0 0 24 24"
          width={16}
          height={16}
          fill="none"
          stroke="var(--fg-3)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            marginTop: 2,
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {isExpanded && (
        <TermCardExpanded
          term={term}
          isRead={isRead}
          onMarkRead={onMarkRead}
          onClose={() => onToggle(null)}
          onNavigateToTerm={onNavigateToTerm}
          contextData={contextData}
          contextLoading={contextLoading}
          isConnected={isConnected}
        />
      )}
    </div>
  );
}
