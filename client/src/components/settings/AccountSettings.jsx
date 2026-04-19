import useAuth from '../../services/useAuth';

export default function AccountSettings() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Name" value={user?.displayName ?? '—'} />
        <Field label="Email" value={user?.email ?? '—'} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--fg-3)', background: 'var(--surface-low)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
        Account details are managed by Google. To update your name or email, visit your Google account settings.
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{
        padding: '10px 14px', background: 'var(--surface-low)', borderRadius: 'var(--radius-md)',
        fontSize: 14, color: 'var(--fg-1)',
      }}>
        {value}
      </div>
    </div>
  );
}
