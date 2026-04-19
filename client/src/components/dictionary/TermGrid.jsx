import { CATEGORIES } from '../../data/dictionaryCategories';
import TermCard from './TermCard';

export default function TermGrid({
  terms,
  activeCat,
  searchVal,
  expandedTermId,
  onToggle,
  isRead,
  onMarkRead,
  onNavigateToTerm,
  contextData,
  contextLoading,
  isConnected,
  onClearSearch,
}) {
  const catLabel = activeCat === 'all'
    ? 'All terms'
    : CATEGORIES.find(c => c.id === activeCat)?.name ?? activeCat;

  const metaLabel = searchVal.trim()
    ? `${terms.length} result${terms.length !== 1 ? 's' : ''} for "${searchVal.trim()}"`
    : `${terms.length} term${terms.length !== 1 ? 's' : ''} in ${catLabel}`;

  if (terms.length === 0) {
    return (
      <div>
        <div style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 16, fontFamily: 'var(--font-sans)' }}>
          {metaLabel}
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--fg-3)', fontFamily: 'var(--font-sans)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14, marginBottom: 16 }}>No terms match your search.</div>
          <button
            onClick={onClearSearch}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '0.5px solid var(--border-1)',
              background: '#fff',
              color: 'var(--fg-2)',
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
            }}
          >
            Clear search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 12, fontFamily: 'var(--font-sans)' }}>
        {metaLabel}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 10,
      }}>
        {terms.map(term => (
          <TermCard
            key={term.id}
            term={term}
            isExpanded={expandedTermId === term.id}
            isRead={isRead(term.id)}
            onToggle={onToggle}
            onMarkRead={onMarkRead}
            onNavigateToTerm={onNavigateToTerm}
            contextData={contextData}
            contextLoading={contextLoading}
            isConnected={isConnected}
            activeCat={activeCat}
          />
        ))}
      </div>
    </div>
  );
}
