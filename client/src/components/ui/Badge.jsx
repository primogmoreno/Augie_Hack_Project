const tones = {
  success: { bg: 'var(--success-bg)',   fg: 'var(--success)' },
  warning: { bg: 'var(--warning-bg)',   fg: 'var(--warning)' },
  danger:  { bg: 'var(--danger-bg)',    fg: 'var(--danger)'  },
  info:    { bg: 'var(--info-bg)',      fg: 'var(--info)'    },
  neutral: { bg: 'var(--surface-low)',  fg: 'var(--fg-2)'    },
  primary: { bg: 'var(--primary-muted)',fg: 'var(--primary)' },
  accent:  { bg: 'var(--accent-muted)', fg: 'var(--accent)'  },
  default: { bg: 'var(--surface-low)',  fg: 'var(--fg-2)'    },
};

export default function Badge({ tone = 'neutral', children }) {
  const t = tones[tone] ?? tones.neutral;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '3px 8px',
      borderRadius: 'var(--radius-sm)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.02em',
      background: t.bg,
      color: t.fg,
    }}>
      {children}
    </span>
  );
}
