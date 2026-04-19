export default function TopBar({ title, subtitle, right }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 40px',
      borderBottom: '1px solid var(--border-1)',
      background: 'var(--bg-page)',
    }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          color: 'var(--fg-1)',
          margin: 0,
        }}>
          {title}
        </h1>
        {subtitle && (
          <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 3, fontFamily: 'var(--font-sans)' }}>
            {subtitle}
          </div>
        )}
      </div>
      {right}
    </header>
  );
}
