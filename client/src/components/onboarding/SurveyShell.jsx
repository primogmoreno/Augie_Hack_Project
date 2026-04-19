import Logo from '../ui/Logo';

export default function SurveyShell({ questionIndex, totalQuestions, children }) {
  const showProgress = questionIndex >= 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 24px 60px',
    }}>
      {/* Top bar */}
      <div style={{
        width: '100%',
        maxWidth: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={28} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 18,
            fontWeight: 500,
            color: 'var(--fg-1)',
          }}>
            F.I.R.E
          </span>
        </div>

        {showProgress && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: totalQuestions }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === questionIndex ? 20 : 8,
                    height: 8,
                    borderRadius: 'var(--radius-full)',
                    background: i <= questionIndex ? 'var(--primary)' : 'var(--border-1)',
                    transition: 'all var(--dur-base) var(--ease-out)',
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--font-sans)' }}>
              {questionIndex + 1} of {totalQuestions}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ width: '100%', maxWidth: 600, flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
