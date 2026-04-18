export default function TopBar({ title, subtitle, right }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 40px',
      borderBottom: '1px solid var(--border-1)',
      background: '#fff',
    }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 500, letterSpacing: '-0.015em', margin: 0 }}>
          {title}
        </h1>
        {subtitle && (
          <div style={{ fontSize: 14, color: 'var(--fg-2)', marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {right}
    </header>
  );
}
