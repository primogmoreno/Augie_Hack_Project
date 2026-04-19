import { useState } from 'react';
import api from '../../services/api';

export default function ConnectedBankCard({ institution, accounts, lastSynced, onDisconnected }) {
  const [step, setStep] = useState(0); // 0=idle, 1=confirm, 2=loading
  const [error, setError] = useState(null);

  async function handleRemove() {
    if (step === 0) { setStep(1); return; }
    setStep(2);
    setError(null);
    try {
      await api.post('/plaid/remove-item');
      onDisconnected?.();
    } catch {
      setError('Failed to disconnect. Please try again.');
      setStep(1);
    }
  }

  return (
    <div style={{
      border: '1px solid var(--border-1)', borderRadius: 'var(--radius-lg)',
      padding: '16px 20px', background: 'var(--surface-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-1)' }}>{institution ?? 'Connected Bank'}</div>
          {accounts?.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 4 }}>
              {accounts.map(a => a.name ?? a.official_name).filter(Boolean).join(' · ')}
            </div>
          )}
          {lastSynced && (
            <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>
              Last synced: {new Date(lastSynced).toLocaleDateString()}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {step === 0 && (
            <button onClick={handleRemove} style={dangerBtnStyle}>Disconnect</button>
          )}
          {step === 1 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--danger)' }}>Are you sure?</span>
              <button onClick={handleRemove} style={dangerBtnStyle}>Yes, disconnect</button>
              <button onClick={() => setStep(0)} style={cancelBtnStyle}>Cancel</button>
            </div>
          )}
          {step === 2 && (
            <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>Disconnecting…</span>
          )}
        </div>
      </div>
      {error && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)' }}>{error}</div>}
    </div>
  );
}

const dangerBtnStyle = {
  padding: '6px 12px', background: 'var(--danger-bg)', color: 'var(--danger)',
  border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)',
  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
};
const cancelBtnStyle = {
  padding: '6px 12px', background: 'var(--surface-low)', color: 'var(--fg-2)',
  border: '1px solid var(--border-1)', borderRadius: 'var(--radius-sm)',
  fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)',
};
