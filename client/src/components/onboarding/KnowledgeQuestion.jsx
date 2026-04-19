import { useState } from 'react';
import Button from '../ui/Button';
import Icon, { ICONS } from '../ui/Icon';

export default function KnowledgeQuestion({ screen, selectedValue, onSelect, onBack, canAdvance, onAdvance, onSkip }) {
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (value) => {
    onSelect(value);
    setRevealed(true);
  };

  return (
    <div style={{ animation: 'fadeIn var(--dur-base) var(--ease-out)' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--accent)',
          }}>
            {screen.section}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-low)',
            color: 'var(--fg-3)',
            fontFamily: 'var(--font-sans)',
          }}>
            Scenario
          </div>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
          color: 'var(--fg-1)',
          margin: 0,
        }}>
          {screen.question}
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {screen.choices.map(choice => {
          const isSelected = selectedValue === choice.value;

          let borderColor = 'var(--border-1)';
          let bg = 'var(--surface-card)';
          let labelColor = 'var(--fg-1)';
          let fontWeight = 400;

          if (revealed && isSelected) {
            borderColor = 'var(--primary)';
            bg = 'var(--primary-muted)';
            labelColor = 'var(--primary)';
            fontWeight = 600;
          } else if (!revealed && isSelected) {
            borderColor = 'var(--primary)';
            bg = 'var(--primary-muted)';
            labelColor = 'var(--primary)';
            fontWeight = 600;
          }

          return (
            <button
              key={choice.value}
              onClick={() => !revealed && handleSelect(choice.value)}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: 'var(--radius-xl)',
                border: `2px solid ${borderColor}`,
                background: bg,
                cursor: revealed ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all var(--dur-fast) var(--ease-out)',
              }}
            >
              <span style={{
                fontSize: 14,
                fontWeight,
                color: labelColor,
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.4,
              }}>
                {choice.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Neutral educational callout — shown after selection */}
      {revealed && screen.explanation && (
        <div style={{
          background: 'var(--surface-low)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px 14px 20px',
          marginBottom: 24,
          fontSize: 13,
          color: 'var(--fg-2)',
          lineHeight: 1.6,
          borderLeft: '3px solid var(--primary)',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <svg style={{ flexShrink: 0, marginTop: 1 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{screen.explanation}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <Icon d={ICONS.back} size={15} /> Back
        </Button>
        {!screen.required && !revealed && (
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip
          </Button>
        )}
        <Button
          variant="primary"
          onClick={onAdvance}
          disabled={!canAdvance && !revealed}
          style={{ marginLeft: 'auto' }}
        >
          Continue →
        </Button>
      </div>
    </div>
  );
}
