import Button from '../ui/Button';
import Icon, { ICONS } from '../ui/Icon';

export default function ConfidenceQuestion({ screen, selectedValue, onSelect, onBack }) {
  return (
    <div style={{ animation: 'fadeIn var(--dur-base) var(--ease-out)' }}>
      <div style={{ marginBottom: 36 }}>
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 10,
        marginBottom: 36,
      }}>
        {screen.levels.map(level => {
          const isSelected = selectedValue === level.value;
          return (
            <button
              key={level.value}
              onClick={() => onSelect(level.value)}
              style={{
                padding: '18px 8px',
                borderRadius: 'var(--radius-xl)',
                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-1)'}`,
                background: isSelected ? 'var(--primary-muted)' : 'var(--surface-card)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                transition: 'all var(--dur-fast) var(--ease-out)',
                boxShadow: isSelected ? 'none' : 'var(--shadow-xs)',
              }}
            >
              <span style={{ fontSize: 28, lineHeight: 1 }}>{level.emoji}</span>
              <span style={{
                fontSize: 11,
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? 'var(--primary)' : 'var(--fg-2)',
                fontFamily: 'var(--font-sans)',
                textAlign: 'center',
                lineHeight: 1.3,
              }}>
                {level.label}
              </span>
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
          onClick={() => {}}
          disabled={selectedValue === undefined}
          style={{ marginLeft: 'auto', opacity: 0, pointerEvents: 'none' }}
        >
          Continue →
        </Button>
      </div>
      {selectedValue === undefined && (
        <p style={{ fontSize: 12, color: 'var(--fg-3)', textAlign: 'center', marginTop: 12 }}>
          Select an option to continue
        </p>
      )}
    </div>
  );
}
