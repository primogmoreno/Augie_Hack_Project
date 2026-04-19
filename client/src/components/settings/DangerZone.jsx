import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function DangerZone({ onDisconnected }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const navigate = useNavigate();

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await api.post('/plaid/remove-item');
      onDisconnected?.();
    } catch {}
    setDisconnecting(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        onClick={handleDisconnect}
        disabled={disconnecting}
        style={dangerBtn}
      >
        {disconnecting ? 'Disconnecting…' : 'Disconnect Bank Account'}
      </button>
      <button onClick={() => setShowDeleteModal(true)} style={dangerBtn}>
        Delete Account
      </button>

      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
        }}>
          <div style={{
            background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)',
            padding: 32, maxWidth: 400, width: '90%',
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: '0 0 12px' }}>Delete Account</h3>
            <p style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6, margin: '0 0 20px' }}>
              To delete your account, please contact us at <strong>support@finlit.app</strong>. We'll process your request within 48 hours.
            </p>
            <button onClick={() => setShowDeleteModal(false)} style={{
              padding: '10px 20px', background: 'var(--primary)', color: 'var(--fg-inverse)',
              border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const dangerBtn = {
  padding: '10px 20px', background: 'var(--danger-bg)',
  border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)',
  fontSize: 13, fontWeight: 600, color: 'var(--danger)',
  cursor: 'pointer', fontFamily: 'var(--font-sans)', alignSelf: 'flex-start',
};
