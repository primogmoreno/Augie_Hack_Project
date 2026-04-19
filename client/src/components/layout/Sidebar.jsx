import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import Icon, { ICONS } from '../ui/Icon';

const NAV = [
  { id: '/',            label: 'Home',             icon: ICONS.home },
  { id: '/dashboard',   label: 'Dashboard',        icon: ICONS.chart },
  { id: '/transactions',label: 'Transactions',     icon: ICONS.list },
  { id: '/simulate',    label: 'Simulation',       icon: ICONS.sliders },
  { id: '/coach',       label: 'Coach',            icon: ICONS.coach },
  { id: '/jargon',      label: 'Jargon Decoder',   icon: ICONS.book },
  { id: '/settings',    label: 'Settings',         icon: ICONS.settings },
  {id: '/logout',     label: 'Logout',        icon: ICONS.back}
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: 'var(--ink-0)',
      borderRight: '1px solid var(--border-1)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px 20px' }}>
        <Logo size={32} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>
          FinLit
        </span>
      </div>

      {NAV.map(item => {
        const active = location.pathname === item.id;
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 10,
              border: 0,
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              color: active ? 'var(--teal-700)' : 'var(--fg-2)',
              background: active ? 'var(--teal-50)' : 'transparent',
              transition: 'all var(--dur-fast) var(--ease-out)',
            }}
          >
            <Icon d={item.icon} />
            {item.label}
          </button>
        );
      })}

      <div style={{ marginTop: 'auto', padding: 12, background: '#fff', border: '1px solid var(--border-1)', borderRadius: 12, fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: 'var(--teal-700)', fontWeight: 600 }}>
          <Icon d={ICONS.lock} size={14} /> Secured by Plaid
        </div>
        <div style={{ color: 'var(--fg-3)', lineHeight: 1.5 }}>We never store your bank credentials.</div>
      </div>
    </aside>
  );
}
