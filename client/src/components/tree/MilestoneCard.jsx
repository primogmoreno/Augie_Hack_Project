export default function MilestoneCard({ milestone, unlocked }) {
  const { name, description, icon, backgroundColor, textColor, requiredScore } = milestone;

  return (
    <div style={{
      flexShrink: 0,
      width: 140,
      background: unlocked ? backgroundColor : '#F4F4F2',
      border: `1px solid ${unlocked ? 'transparent' : 'var(--border-1)'}`,
      borderRadius: 12,
      padding: '12px 14px',
      opacity: unlocked ? 1 : 0.45,
      position: 'relative',
    }}>
      {!unlocked && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          fontSize: 10, color: '#888',
        }}>
          🔒
        </div>
      )}

      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: unlocked ? 'rgba(0,0,0,0.08)' : '#ddd',
        display: 'grid', placeItems: 'center',
        fontSize: 18, marginBottom: 8,
      }}>
        {icon}
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: unlocked ? textColor : '#666', marginBottom: 3, lineHeight: 1.3 }}>
        {name}
      </div>
      <div style={{ fontSize: 11, color: unlocked ? `${textColor}99` : '#999', lineHeight: 1.4, marginBottom: 6 }}>
        {description}
      </div>

      <div style={{
        fontSize: 10, fontWeight: 600,
        color: unlocked ? textColor : '#aaa',
        background: unlocked ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.05)',
        borderRadius: 6, padding: '2px 6px',
        display: 'inline-block',
      }}>
        {unlocked ? 'Unlocked' : requiredScore > 0 ? `Score ${requiredScore}` : 'Connect account'}
      </div>
    </div>
  );
}
