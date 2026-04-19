export default function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      className={onClick ? 'card-clickable' : undefined}
      style={{
        background: '#fff',
        border: '1px solid var(--border-1)',
        borderRadius: 16,
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
