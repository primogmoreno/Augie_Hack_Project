import Button from '../ui/Button';

const FEATURES = [
  { emoji: '🌱', text: 'Personalize your financial learning path' },
  { emoji: '🌳', text: 'Grow your financial health tree over time' },
  { emoji: '📚', text: 'Get a dictionary tailored to your goals' },
  { emoji: '🎯', text: 'Track your real growth from day one' },
];

export default function WelcomeScreen({ onBegin }) {
  return (
    <div style={{ textAlign: 'center', animation: 'fadeIn var(--dur-base) var(--ease-out)' }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: 'var(--radius-xl)',
        background: 'var(--primary)',
        display: 'grid',
        placeItems: 'center',
        margin: '0 auto 28px',
        fontSize: 36,
      }}>
        🌱
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: 36,
        fontWeight: 500,
        letterSpacing: '-0.02em',
        lineHeight: 1.15,
        color: 'var(--fg-1)',
        margin: '0 0 14px',
      }}>
        Let's build your financial profile.
      </h1>

      <p style={{
        fontSize: 16,
        color: 'var(--fg-2)',
        lineHeight: 1.65,
        margin: '0 0 36px',
        maxWidth: 460,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        Eight quick questions to personalize your experience — no wrong answers,
        no judgment. This is your starting point.
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        marginBottom: 36,
        textAlign: 'left',
        maxWidth: 380,
        margin: '0 auto 36px',
      }}>
        {FEATURES.map(f => (
          <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{f.emoji}</span>
            <span style={{ fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.4 }}>{f.text}</span>
          </div>
        ))}
      </div>

      <Button variant="primary" size="lg" onClick={onBegin} style={{ minWidth: 200 }}>
        Get started →
      </Button>

      <p style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 16 }}>
        Takes about 2 minutes · No wrong answers
      </p>
    </div>
  );
}
