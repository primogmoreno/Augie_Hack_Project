import { TERMS } from '../../data/dictionaryTerms';

export default function RelatedChip({ relatedName, onNavigateToTerm }) {
  function handleClick() {
    const found = TERMS.find(t => t.name.toLowerCase() === relatedName.toLowerCase());
    if (found) {
      onNavigateToTerm(found.id);
    }
  }

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 20,
        border: '0.5px solid var(--border-1)',
        background: 'var(--ink-50)',
        fontSize: 12,
        fontFamily: 'var(--font-sans)',
        color: 'var(--fg-2)',
        cursor: 'pointer',
        transition: 'border-color 0.15s, color 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-2)';
        e.currentTarget.style.color = 'var(--fg-1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-1)';
        e.currentTarget.style.color = 'var(--fg-2)';
      }}
    >
      {relatedName}
    </button>
  );
}
