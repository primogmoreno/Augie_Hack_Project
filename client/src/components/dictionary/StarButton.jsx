import { useRef } from 'react';

export default function StarButton({ isStarred, onClick, size = 16, title }) {
  const ref = useRef(null);

  function handleClick(e) {
    if (ref.current) {
      ref.current.style.transform = 'scale(1.25)';
      setTimeout(() => {
        if (ref.current) ref.current.style.transform = 'scale(1)';
      }, 90);
    }
    onClick?.(e);
  }

  const fill = isStarred ? 'var(--accent, #D4A24C)' : 'none';
  const stroke = isStarred ? 'var(--accent, #D4A24C)' : 'var(--fg-3)';

  return (
    <button
      type="button"
      aria-label={isStarred ? 'Unstar this term' : 'Star this term'}
      aria-pressed={isStarred}
      title={title ?? (isStarred ? 'Starred' : 'Star')}
      onClick={handleClick}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 4,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-low)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'transform 90ms ease-out, fill 0.15s, stroke 0.15s', display: 'block' }}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}
