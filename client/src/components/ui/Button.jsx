const sizes = {
  sm: { padding: '6px 12px', fontSize: 13, borderRadius: 8 },
  md: { padding: '10px 18px', fontSize: 15, borderRadius: 10 },
  lg: { padding: '14px 24px', fontSize: 16, borderRadius: 12 },
};

const variants = {
  primary:   { background: 'var(--teal-500)', color: '#fff', boxShadow: 'var(--shadow-sm)', borderColor: 'transparent' },
  secondary: { background: '#fff', color: 'var(--fg-1)', borderColor: 'var(--ink-200)' },
  ghost:     { background: 'transparent', color: 'var(--fg-1)', borderColor: 'transparent' },
  accent:    { background: 'var(--amber-400)', color: 'var(--ink-800)', boxShadow: 'var(--shadow-sm)', borderColor: 'transparent' },
  dark:      { background: 'var(--ink-800)', color: '#fff', borderColor: 'transparent' },
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
        opacity: disabled ? 0.5 : 1,
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
