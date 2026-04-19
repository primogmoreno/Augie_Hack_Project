export { LITERACY_LEVELS } from '../../hooks/useLiteracyVisualization';

export default function LiteracyLevelBadge({ level, nextLevel, levelProgress, literacy }) {
  if (!level) return null;

  return (
    <div style={{
      background: 'var(--surface-low)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: level.color, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>
        🌱
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, color: 'var(--fg-1)' }}>
            {level.name}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-2)' }}>
            {Math.round(literacy)} pts
          </div>
        </div>
        <div style={{ width: '100%', height: 6, background: 'var(--border-1)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${levelProgress}%`, background: level.color, borderRadius: 99, transition: 'width 0.5s ease' }} />
        </div>
        {nextLevel && (
          <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 4 }}>
            {levelProgress}% toward {nextLevel.name}
          </div>
        )}
      </div>
    </div>
  );
}
