import { useState, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function PlaidLinkButton() {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchLinkToken = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/plaid/create-link-token');
      setLinkToken(data.link_token);
    } catch (err) {
      console.error('Failed to get link token', err);
    } finally {
      setLoading(false);
    }
  };

  const onSuccess = useCallback(async (publicToken) => {
    await api.post('/plaid/exchange-token', { public_token: publicToken });
    navigate('/dashboard');
  }, [navigate]);

  const { open, ready } = usePlaidLink({ token: linkToken, onSuccess });

  const handleClick = async () => {
    if (!linkToken) {
      await fetchLinkToken();
    }
  };

  // Open Plaid Link once token is ready
  if (linkToken && ready) {
    open();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-brand-primary hover:bg-brand-accent text-white font-semibold px-8 py-3 rounded-xl transition-colors disabled:opacity-50"
    >
      {loading ? 'Connecting…' : 'Connect My Bank Account'}
    </button>
  );
}
