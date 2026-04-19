const CATEGORIES = [
  { key: 'banking',   label: 'Banking',   color: '#173124' },
  { key: 'credit',    label: 'Credit',    color: '#e05d44' },
  { key: 'saving',    label: 'Saving',    color: '#4caf7d' },
  { key: 'investing', label: 'Investing', color: '#2d7dd2' },
];

function Ring({ score, color, label, size = 72 }) {
  const R = (size - 10) / 2;
  const circumference = 2 * Math.PI * R;
  const pct = Math.min(100, Math.max(0, score));
  const dash = (pct / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="var(--border-1)" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={R}
          fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="central"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${size / 2}px ${size / 2}px` }}
          fontSize={13} fontWeight={600} fill="var(--fg-1)" fontFamily="var(--font-mono)"
        >
          {Math.round(pct)}
        </text>
      </svg>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-3)' }}>
        {label}
      </div>
    </div>
  );
}

export default function CategoryMasteryRings({ categoryScores }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 16 }}>
        Category Mastery
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {CATEGORIES.map(c => (
          <Ring key={c.key} score={categoryScores[c.key] ?? 0} color={c.color} label={c.label} />
        ))}
      </div>
    </div>
  );
}
