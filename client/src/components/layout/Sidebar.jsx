import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import Icon, { ICONS } from '../ui/Icon';

const NAV = [
  { id: '/',             label: 'Home',               icon: ICONS.home },
  { id: '/dashboard',    label: 'Dashboard',          icon: ICONS.chart },
  { id: '/transactions', label: 'Transactions',       icon: ICONS.list },
  { id: '/analyze',      label: 'Analyze',            icon: ICONS.zap },
  { id: '/world',        label: 'My Financial World', icon: ICONS.tree },
  { id: '/simulate',     label: 'Simulation',         icon: ICONS.sliders },
  { id: '/coach',        label: 'Coach',              icon: ICONS.coach },
  { id: '/dictionary',   label: 'Dictionary',         icon: ICONS.book },
  { id: '/settings',     label: 'Settings',           icon: ICONS.settings },
  { id: '/logout',       label: 'Logout',             icon: ICONS.back },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside style={{
      width: 288,
      minHeight: '100vh',
      background: 'var(--bg-page)',
      borderRight: '1px solid var(--border-1)',
      padding: '28px 16px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px 24px' }}>
        <Logo size={32} />
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 20,
            fontWeight: 500,
            color: 'var(--fg-1)',
            lineHeight: 1.1,
          }}>
            FinLit
          </div>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 8,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--fg-3)',
            marginTop: 2,
          }}>
            Institutional Grade
          </div>
        </div>
      </div>

      {/* Nav items */}
      {NAV.map(item => {
        const active = location.pathname === item.id;
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={active ? 'nav-item nav-item--active' : 'nav-item'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              border: 0,
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              fontFamily: 'var(--font-sans)',
              color: active ? 'var(--primary)' : 'var(--fg-2)',
              background: active ? 'var(--primary-muted)' : 'transparent',
              transition: 'all var(--dur-fast) var(--ease-out)',
              width: '100%',
            }}
          >
            <Icon d={item.icon} size={16} />
            {item.label}
          </button>
        );
      })}

      {/* Bottom CTA */}
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'var(--primary)',
            color: 'var(--fg-inverse)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'background var(--dur-fast) var(--ease-out)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
        >
          <Icon d={ICONS.plus} size={14} />
          Connect Account
        </button>
        <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 8, textAlign: 'center' }}>
          Secured via Plaid · Read-only
        </div>
      </div>
    </aside>
  );
}
