
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";

import api from '../../services/api';

export default function PlaidLink() {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1 - Get link token from your backend on mount
  useEffect(() => {
    api.post('/create_link_token')
      .then(res => setLinkToken(res.data.link_token))
      .catch(err => console.error("Error fetching link token:", err));
  }, []);

  // Step 2 - Called automatically after user connects their bank
  const onSuccess = useCallback(async (public_token, metadata) => {
    console.log("Public token received:", public_token);

    try {
      const res = await axios.post(`${API_URL}/exchange_public_token`, {
        public_token
      });
      console.log("Access token stored:", res.data);
      // redirect or update UI here
    } catch (err) {
      console.error("Exchange failed:", err);
    }
  }, []);
  

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

 return (
    <button

      className="bg-brand-primary hover:bg-brand-accent text-white font-semibold px-8 py-3 rounded-xl transition-colors disabled:opacity-50"
      onClick={() => open()} disabled={!ready || !linkToken}
    >
      {loading ? 'Connecting…' : 'Connect My Bank Account'}
    </button>
  );
}