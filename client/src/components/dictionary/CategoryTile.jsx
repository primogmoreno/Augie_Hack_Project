export default function CategoryTile({ category, isActive, progress, onClick }) {
  const pct = progress.total > 0 ? Math.round((progress.read / progress.total) * 100) : 0;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '12px 14px',
        borderRadius: 'var(--radius-xl)',
        border: isActive ? `2px solid ${category.borderColor}` : '1px solid var(--border-1)',
        background: isActive ? category.color : 'var(--surface-card)',
        cursor: 'pointer',
        flexShrink: 0,
        minWidth: 88,
        transition: 'border-color 0.15s, background 0.15s',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 9,
        background: isActive ? category.borderColor + '22' : 'var(--surface-low)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
      }}>
        {category.icon}
      </div>

      <div style={{
        fontSize: 11,
        fontWeight: 500,
        fontFamily: 'var(--font-sans)',
        color: isActive ? category.textColor : 'var(--fg-2)',
        textAlign: 'center',
        lineHeight: 1.3,
        maxWidth: 80,
      }}>
        {category.name}
      </div>

      <div style={{
        width: '100%',
        height: 3,
        background: 'var(--border-1)',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: isActive ? category.borderColor : '#173124',
          borderRadius: 2,
          transition: 'width 0.3s ease',
        }} />
      </div>

      <div style={{
        fontSize: 10,
        color: 'var(--fg-3)',
        fontFamily: 'var(--font-sans)',
      }}>
        {progress.read}/{progress.total}
      </div>
    </div>
  );
}
