const PILLAR_LABELS = {
  banking:   'Banking',
  credit:    'Credit',
  saving:    'Saving',
  investing: 'Investing',
};

export default function PillarMiniBar({ pillar, score }) {
  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
      }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-2)', fontFamily: 'var(--font-sans)' }}>
          {PILLAR_LABELS[pillar] ?? pillar}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-1)', fontFamily: 'var(--font-mono)' }}>
          {score}
        </span>
      </div>
      <div style={{
        height: 4,
        background: 'var(--border-1)',
        borderRadius: 'var(--radius-xs)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: 'var(--primary)',
          borderRadius: 'var(--radius-xs)',
          transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  );
}
