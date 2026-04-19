export default function HealthScoreRing({ score, size = 72 }) {
  const radius       = size / 2 - 7;
  const circumference = 2 * Math.PI * radius;
  const offset       = circumference - (score / 100) * circumference;

  const color = score < 30 ? '#B83A2E' : score < 50 ? '#A8631A' : score < 70 ? '#2F8F5A' : '#173124';
  const track = score < 30 ? '#F6DDD8' : score < 50 ? '#FBEBD3' : score < 70 ? '#E4F2EA' : 'rgba(23,49,36,0.06)';

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
