import { useState } from 'react';
import Button from '../ui/Button';
import Icon, { ICONS } from '../ui/Icon';

export default function KnowledgeQuestion({ screen, selectedValue, onSelect, onBack, canAdvance, onAdvance, onSkip }) {
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (value) => {
    onSelect(value);
    setRevealed(true);
  };

  const correctChoice = screen.choices.find(c => c.correct);

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
          const isCorrect  = choice.correct;
          let borderColor = 'var(--border-1)';
          let bg = 'var(--surface-card)';
          let labelColor = 'var(--fg-1)';

          if (revealed) {
            if (isSelected && isCorrect)  { borderColor = 'var(--success)'; bg = 'var(--success-bg)'; labelColor = 'var(--success)'; }
            else if (isSelected)          { borderColor = 'var(--danger)';  bg = 'var(--danger-bg)';  labelColor = 'var(--danger)'; }
            else if (isCorrect)           { borderColor = 'var(--success)'; bg = 'var(--success-bg)'; labelColor = 'var(--success)'; }
          } else if (isSelected) {
            borderColor = 'var(--primary)';
            bg = 'var(--primary-muted)';
            labelColor = 'var(--primary)';
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <span style={{
                fontSize: 14,
                fontWeight: isSelected || (revealed && isCorrect) ? 600 : 400,
                color: labelColor,
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.4,
              }}>
                {choice.label}
              </span>
              {revealed && isCorrect && <span style={{ fontSize: 16 }}>✓</span>}
              {revealed && isSelected && !isCorrect && <span style={{ fontSize: 16 }}>✗</span>}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div style={{
          background: 'var(--surface-low)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          marginBottom: 24,
          fontSize: 13,
          color: 'var(--fg-2)',
          lineHeight: 1.55,
          borderLeft: '3px solid var(--primary)',
          paddingLeft: 16,
        }}>
          {selectedValue === correctChoice?.value
            ? '✓ Correct! '
            : `The correct answer is: "${correctChoice?.label}". `}
          {selectedValue !== correctChoice?.value
            ? "Don't worry — this is what FinLit is here to help with."
            : 'Great financial awareness.'}
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
