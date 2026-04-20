import { useNavigate } from 'react-router-dom';
import RelatedChip from './RelatedChip';
import PersonalContextBlock from './PersonalContextBlock';
import { getPersonalContextString } from '../../utils/dictionaryFilters';

export default function TermCardExpanded({ term, isRead, isStarred, onToggleStar, onMarkRead, onClose, onNavigateToTerm, contextData, contextLoading, isConnected, stack = false, hideClose = false }) {
  const navigate = useNavigate();
  const contextString = term.hasPersonalData
    ? getPersonalContextString(contextData, term.personalContextKey)
    : null;

  function handleAsk() {
    const prompt = `Explain the financial term "${term.name}" and how it specifically applies to my financial situation based on my connected account data. Be specific about what I should do or watch out for.`;
    navigate('/coach', { state: { initialPrompt: prompt } });
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: stack ? '1fr' : '1fr 1fr',
        gap: 24,
      }}
        className="term-expanded-grid"
      >
        {/* Left column */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--fg-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              Definition
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-1)', lineHeight: 1.65 }}>
              {term.definition}
            </div>
          </div>

          <div style={{
            background: 'var(--surface-low)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--fg-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              Why it matters
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-1)', lineHeight: 1.65 }}>
              {term.why}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {term.hasPersonalData && (
            <div data-tour="dictionary-personal-block">
              <PersonalContextBlock
                contextString={contextString}
                loading={contextLoading}
                isConnected={isConnected}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--fg-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              Related terms
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {term.related.map(r => (
                <RelatedChip key={r} relatedName={r} onNavigateToTerm={onNavigateToTerm} />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
            <button
              data-tour="ask-about-this"
              onClick={handleAsk}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: '#173124',
                color: '#faf9f5',
                fontSize: 13,
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Ask about this →
            </button>

            <button
              onClick={() => onMarkRead(term.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: `1px solid ${isRead ? '#2F8F5A' : 'var(--border-1)'}`,
                background: isRead ? '#E4F2EA' : 'var(--surface-low)',
                color: isRead ? '#173124' : 'var(--fg-2)',
                fontSize: 13,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {isRead ? 'Read ✓' : 'Mark as read'}
            </button>

            {onToggleStar && (
              <button
                onClick={() => onToggleStar(term.id)}
                aria-pressed={!!isStarred}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${isStarred ? 'var(--accent, #D4A24C)' : 'var(--border-1)'}`,
                  background: isStarred ? 'rgba(212,162,76,0.12)' : 'var(--surface-low)',
                  color: isStarred ? 'var(--accent, #8a621f)' : 'var(--fg-2)',
                  fontSize: 13,
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={14}
                  height={14}
                  fill={isStarred ? 'var(--accent, #D4A24C)' : 'none'}
                  stroke={isStarred ? 'var(--accent, #D4A24C)' : 'currentColor'}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {isStarred ? 'Starred' : 'Star'}
              </button>
            )}

            {!hideClose && (
              <button
                onClick={onClose}
                style={{
                  marginLeft: 'auto',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-1)',
                  background: 'var(--surface-low)',
                  color: 'var(--fg-2)',
                  fontSize: 13,
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .term-expanded-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
