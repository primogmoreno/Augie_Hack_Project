export default function AppPreferencesSection({ prefs, update, onRestartTour }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={labelStyle} htmlFor="theme-select">Theme</label>
        <select
          id="theme-select"
          value={prefs.theme}
          onChange={e => update({ theme: e.target.value })}
          style={selectStyle}
        >
          <option value="system">System default</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div>
        <label style={labelStyle} htmlFor="default-tab">Default Tab</label>
        <select
          id="default-tab"
          value={prefs.defaultTab}
          onChange={e => update({ defaultTab: e.target.value })}
          style={selectStyle}
        >
          <option value="dashboard">Dashboard</option>
          <option value="world">My Financial World</option>
          <option value="transactions">Transactions</option>
          <option value="coach">Coach</option>
        </select>
      </div>

      {onRestartTour && (
        <div>
          <div style={{ ...labelStyle, marginBottom: 8 }}>Guided Tour</div>
          <button
            onClick={onRestartTour}
            style={{
              padding: '10px 20px', background: 'var(--surface-low)',
              border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)',
              fontSize: 13, fontWeight: 600, color: 'var(--fg-1)',
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            Replay Tour
          </button>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 8, display: 'block',
};
const selectStyle = {
  padding: '10px 14px', background: 'var(--surface-low)',
  border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)',
  fontSize: 13, color: 'var(--fg-1)', fontFamily: 'var(--font-sans)',
  cursor: 'pointer', outline: 'none', display: 'block',
};
