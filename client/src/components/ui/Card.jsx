export default function Card({ children, style, onClick, ...rest }) {
  return (
    <div
      onClick={onClick}
      className={onClick ? 'card-clickable' : undefined}
      {...rest}
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-xl)',
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
