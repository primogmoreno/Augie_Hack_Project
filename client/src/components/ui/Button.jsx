const sizes = {
  sm: { padding: '6px 12px',  fontSize: 13, borderRadius: 'var(--radius-sm)' },
  md: { padding: '10px 18px', fontSize: 14, borderRadius: 'var(--radius-sm)' },
  lg: { padding: '14px 24px', fontSize: 15, borderRadius: 'var(--radius-md)' },
};

const variants = {
  primary:   { background: 'var(--primary)',     color: 'var(--fg-inverse)', borderColor: 'transparent' },
  secondary: { background: 'var(--surface-low)', color: 'var(--fg-1)',       borderColor: 'var(--border-1)' },
  ghost:     { background: 'transparent',        color: 'var(--fg-1)',       borderColor: 'transparent' },
  accent:    { background: 'var(--accent)',       color: 'var(--fg-inverse)', borderColor: 'transparent' },
  dark:      { background: 'var(--primary)',      color: 'var(--fg-inverse)', borderColor: 'transparent' },
};

export default function Button({ variant = 'primary', size = 'md', children, onClick, disabled, style, type = 'button', ...rest }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="btn-pressable"
      style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        border: '1px solid transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: `all var(--dur-fast) var(--ease-out)`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        opacity: disabled ? 0.4 : 1,
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
