import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaidLink } from 'react-plaid-link';
import api from '../../services/api';

export default function PlaidLink() {
  const [linkToken, setLinkToken] = useState(null);
  const navigate = useNavigate();

  // Step 1 — fetch link token from Flask on mount
  useEffect(() => {
    api.post('/create_link_token')
      .then(res => setLinkToken(res.data.link_token))
      .catch(err => console.error('Error fetching link token:', err));
  }, []);

  // Step 2 — called automatically after user connects their bank in the modal
  const onSuccess = useCallback(async (public_token) => {
    try {
      await api.post('/exchange_public_token', { public_token });
      navigate('/dashboard');
    } catch (err) {
      console.error('Token exchange failed:', err);
    }
  }, [navigate]);

  const { open, ready } = usePlaidLink({ token: linkToken, onSuccess });

  return (
    <button
      onClick={() => open()}
      disabled={!ready || !linkToken}
      style={{
        background: 'var(--teal-500)',
        color: '#fff',
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: 16,
        padding: '14px 28px',
        borderRadius: 12,
        border: 'none',
        cursor: !ready || !linkToken ? 'not-allowed' : 'pointer',
        opacity: !ready || !linkToken ? 0.6 : 1,
        transition: 'opacity 150ms',
      }}
    >
      {!linkToken ? 'Loading…' : 'Connect My Bank Account'}
    </button>
  );
}
