export default function LiteracyStatCards({ statCards }) {
  const cards = [
    { label: 'Terms Explored',        value: statCards.termsRead,           icon: '📖' },
    { label: 'Categories Mastered',   value: `${statCards.categoriesMastered}/4`, icon: '🏆' },
    { label: 'Milestones Unlocked',   value: statCards.milestonesUnlocked,  icon: '🎯' },
    { label: 'Growth Points',         value: `+${statCards.growthPoints}`,  icon: '📈' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {cards.map(c => (
        <div key={c.label} style={{
          background: 'var(--surface-low)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, color: 'var(--primary)', lineHeight: 1 }}>
            {c.value}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginTop: 4 }}>
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}
