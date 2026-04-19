import { scoreColor } from '../../utils/treeScoring';

const PILLAR_BAR_COLORS = {
  savings:  '#173124',
  debt:     '#173124',
  spending: '#173124',
  literacy: '#173124',
};

export default function PillarCard({ name, pillarKey, score, detail }) {
  const color    = scoreColor(score);
  const barColor = PILLAR_BAR_COLORS[pillarKey] || '#1D9E75';

  return (
    <div style={{
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-xs)',
      padding: '12px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {name}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}</span>
      </div>

      <div style={{ height: 4, background: 'var(--border-1)', borderRadius: 'var(--radius-xs)', marginBottom: 8, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: barColor,
          borderRadius: 'var(--radius-xs)',
          transition: 'width 0.6s ease',
        }} />
      </div>

      <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{detail}</div>
    </div>
  );
}
