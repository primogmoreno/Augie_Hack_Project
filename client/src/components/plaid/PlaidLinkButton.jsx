import { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import api from '../../services/api';

export default function PlaidLink({ onReady }) {
  const [linkToken, setLinkToken] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const fetchLinkToken = useCallback(() => {
    setFetchError(null);
    setLinkToken(null);
    api.post('/create_link_token')
      .then(res => {
        if (res.data.link_token) {
          setLinkToken(res.data.link_token);
        } else {
          setFetchError(res.data.error ?? 'No link token returned.');
        }
      })
      .catch(err => {
        const msg = err.response?.data?.error ?? err.message ?? 'Failed to start connection.';
        setFetchError(msg);
      });
  }, []);

  useEffect(() => { fetchLinkToken(); }, [fetchLinkToken]);

  const onSuccess = useCallback(async (public_token) => {
    try {
      await api.post('/exchange_public_token', { public_token });
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Token exchange failed:', err);
    }
  }, []);

  const { open, ready } = usePlaidLink({ token: linkToken ?? '', onSuccess });

  const isReady = ready && !!linkToken;

  // Must be before any conditional return to satisfy Rules of Hooks
  useEffect(() => {
    if (ready && linkToken && onReady) {
      onReady(open);
    }
  }, [ready, linkToken, open, onReady]);

  if (fetchError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--danger)', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 8, padding: '10px 16px', maxWidth: 360 }}>
          {fetchError}
        </div>
        <button
          onClick={fetchLinkToken}
          style={{ background: 'var(--teal-500)', color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer' }}
        >
          Try again
        </button>
      </div>
    );
  }

  // if onReady is passed, render nothing (parent controls button)
  // otherwise render the button as before
  if (onReady) return null;
  return (
    <button
      onClick={() => open()}
      disabled={!isReady}
      style={{
        background: 'var(--teal-500)',
        color: '#fff',
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: 16,
        padding: '14px 28px',
        borderRadius: 12,
        border: 'none',
        cursor: isReady ? 'pointer' : 'not-allowed',
        opacity: isReady ? 1 : 0.6,
        transition: 'opacity 150ms',
      }}
    >
      {!linkToken ? 'Loading…' : !ready ? 'Initializing…' : 'Connect My Bank Account'}
    </button>
  );
}
