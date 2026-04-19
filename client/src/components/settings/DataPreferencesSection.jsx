export default function DataPreferencesSection({ prefs, update }) {
  const dayOptions = [30, 60, 90, 180];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={labelStyle}>Transaction History Window</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {dayOptions.map(d => (
            <button
              key={d}
              onClick={() => update({ transactionDays: d })}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid',
                borderColor: prefs.transactionDays === d ? 'var(--primary)' : 'var(--border-1)',
                background: prefs.transactionDays === d ? 'var(--primary-muted)' : 'var(--surface-card)',
                color: prefs.transactionDays === d ? 'var(--primary)' : 'var(--fg-2)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle} htmlFor="sync-freq">Sync Frequency</label>
        <select
          id="sync-freq"
          value={prefs.syncFrequency}
          onChange={e => update({ syncFrequency: e.target.value })}
          style={selectStyle}
        >
          <option value="on_open">On every open</option>
          <option value="daily">Once per day</option>
          <option value="manual">Manual only</option>
        </select>
      </div>
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
  cursor: 'pointer', outline: 'none',
};
