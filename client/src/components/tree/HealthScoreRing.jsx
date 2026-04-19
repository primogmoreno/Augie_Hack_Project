export default function HealthScoreRing({ score, size = 72 }) {
  const radius       = size / 2 - 7;
  const circumference = 2 * Math.PI * radius;
  const offset       = circumference - (score / 100) * circumference;

  const color = score < 30 ? '#E24B4A' : score < 50 ? '#BA7517' : score < 70 ? '#639922' : '#1D9E75';
  const track = score < 30 ? '#FCEBEB' : score < 50 ? '#FAEEDA' : score < 70 ? '#EAF3DE' : '#E1F5EE';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth="7" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
      />
      <text x={size / 2} y={size / 2 + 6} textAnchor="middle" fontSize="16" fontWeight="600" fill={color}>
        {score}
      </text>
    </svg>
  );
}
