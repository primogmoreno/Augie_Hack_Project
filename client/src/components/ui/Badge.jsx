const tones = {
  success: { bg: 'var(--success-bg)', fg: 'var(--success)' },
  warning: { bg: 'var(--warning-bg)', fg: 'var(--warning)' },
  danger:  { bg: 'var(--danger-bg)',  fg: 'var(--danger)'  },
  info:    { bg: 'var(--info-bg)',    fg: 'var(--info)'    },
  neutral: { bg: 'var(--ink-50)',     fg: 'var(--fg-2)'    },
  primary: { bg: 'var(--teal-50)',    fg: 'var(--teal-700)'},
  accent:  { bg: 'var(--amber-50)',   fg: 'var(--amber-500)'},
};

export default function Badge({ tone = 'neutral', children }) {
  const t = tones[tone] ?? tones.neutral;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 500,
      background: t.bg,
      color: t.fg,
    }}>
      {children}
    </span>
  );
}
