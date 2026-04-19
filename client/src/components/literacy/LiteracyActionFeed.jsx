const TYPE_EMOJI = {
  survey_complete:  '📋',
  survey_retake:    '🔄',
  dictionary_batch: '📖',
  module_complete:  '🎓',
  milestone_unlock: '🏆',
  update:           '⚡',
};

export default function LiteracyActionFeed({ recentActions }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 12 }}>
        Recent Activity
      </div>
      {recentActions.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--fg-3)', fontStyle: 'italic', padding: '12px 0' }}>
          No activity yet. Explore terms and complete milestones to see your feed.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recentActions.map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 12px',
              background: 'var(--surface-low)',
              borderRadius: 'var(--radius-md)',
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{TYPE_EMOJI[a.type] ?? '⚡'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--fg-1)', lineHeight: 1.4, wordBreak: 'break-word' }}>{a.label}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{a.date}</div>
              </div>
              {a.delta > 0 && (
                <div style={{
                  flexShrink: 0, fontSize: 11, fontWeight: 700,
                  color: 'var(--success)', background: 'var(--success-bg)',
                  borderRadius: 'var(--radius-sm)', padding: '2px 6px',
                }}>
                  +{a.delta.toFixed(1)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
