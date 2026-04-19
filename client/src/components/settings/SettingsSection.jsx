import { useState } from 'react';

export default function SettingsSection({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: '1px solid var(--border-1)', paddingBottom: 28, marginBottom: 28 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          background: 'none', border: 'none', padding: '0 0 16px', cursor: 'pointer', textAlign: 'left',
        }}
      >
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, color: 'var(--fg-1)', flex: 1 }}>
          {title}
        </span>
        <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--fg-3)" strokeWidth={2} strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}
