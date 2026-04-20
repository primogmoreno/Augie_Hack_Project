import { moodChips } from '../../utils/treeMood';

const TONE_STYLES = {
  good: {
    background: '#E4F2EA',
    color: 'var(--primary)',
    border: '0.5px solid var(--success)',
  },
  warn: {
    background: '#FBEBD3',
    color: '#7a4211',
    border: '0.5px solid var(--warning)',
  },
  neutral: {
    background: 'var(--surface-low)',
    color: 'var(--fg-2)',
    border: '0.5px solid var(--border-1)',
  },
};

export default function MoodChips({ mood }) {
  if (!mood) return null;
  const chips = moodChips(mood);

  return (
    <div style={{
      display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center',
    }}>
      <span style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.2em', color: 'var(--fg-3)', marginRight: 4,
      }}>
        Today
      </span>
      {chips.map((c, i) => {
        const style = TONE_STYLES[c.tone] ?? TONE_STYLES.neutral;
        return (
          <span
            key={`${c.label}-${i}`}
            style={{
              ...style,
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 500,
              padding: '4px 10px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
            }}
          >
            {c.label}
          </span>
        );
      })}
    </div>
  );
}
