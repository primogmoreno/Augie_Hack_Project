import { scoreColor } from '../../utils/treeScoring';

const PILLAR_BAR_COLORS = {
  savings:  '#1D9E75',
  debt:     '#BA7517',
  spending: '#185FA5',
  literacy: '#533AB7',
};

export default function PillarCard({ name, pillarKey, score, detail }) {
  const color    = scoreColor(score);
  const barColor = PILLAR_BAR_COLORS[pillarKey] || '#1D9E75';

  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--border-1)',
      borderRadius: 12,
      padding: '12px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {name}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}</span>
      </div>

      <div style={{ height: 5, background: 'var(--ink-100, #eee)', borderRadius: 99, marginBottom: 8, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: barColor,
          borderRadius: 99,
          transition: 'width 0.6s ease',
        }} />
      </div>

      <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{detail}</div>
    </div>
  );
}
