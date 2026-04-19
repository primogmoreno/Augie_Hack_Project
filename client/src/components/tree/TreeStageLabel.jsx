import HealthScoreRing from './HealthScoreRing';

export default function TreeStageLabel({ stageName, stageDescription, healthScore }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <HealthScoreRing score={healthScore} size={72} />
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 4 }}>
          My Financial World
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--fg-1)', lineHeight: 1.2, marginBottom: 3 }}>
          {stageName}
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-2)' }}>{stageDescription}</div>
      </div>
    </div>
  );
}
