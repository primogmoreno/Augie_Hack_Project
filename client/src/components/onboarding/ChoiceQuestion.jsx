import Button from '../ui/Button';
import Icon, { ICONS } from '../ui/Icon';

export default function ChoiceQuestion({ screen, selectedValue, onSelect, onBack, canAdvance, onAdvance }) {
  return (
    <div style={{ animation: 'fadeIn var(--dur-base) var(--ease-out)' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 10,
        }}>
          {screen.section}
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
          color: 'var(--fg-1)',
          margin: '0 0 8px',
        }}>
          {screen.question}
        </h2>
        {screen.sub && (
          <p style={{ fontSize: 14, color: 'var(--fg-3)', margin: 0, lineHeight: 1.5 }}>
            {screen.sub}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {screen.choices.map(choice => {
          const isSelected = selectedValue === choice.value;
          return (
            <button
              key={choice.value}
              onClick={() => onSelect(choice.value)}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: 'var(--radius-xl)',
                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-1)'}`,
                background: isSelected ? 'var(--primary-muted)' : 'var(--surface-card)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--dur-fast) var(--ease-out)',
                boxShadow: isSelected ? 'none' : 'var(--shadow-xs)',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}>
                <div>
                  <div style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: isSelected ? 'var(--primary)' : 'var(--fg-1)',
                    fontFamily: 'var(--font-sans)',
                    marginBottom: 2,
                  }}>
                    {choice.label}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: isSelected ? 'var(--primary)' : 'var(--fg-3)',
                    fontFamily: 'var(--font-sans)',
                    lineHeight: 1.4,
                    opacity: isSelected ? 0.8 : 1,
                  }}>
                    {choice.desc}
                  </div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-1)'}`,
                  background: isSelected ? 'var(--primary)' : 'transparent',
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                }}>
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#faf9f5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <Icon d={ICONS.back} size={15} /> Back
        </Button>
        <Button
          variant="primary"
          onClick={onAdvance}
          disabled={!canAdvance}
          style={{ marginLeft: 'auto' }}
        >
          Continue →
        </Button>
      </div>
    </div>
  );
}
