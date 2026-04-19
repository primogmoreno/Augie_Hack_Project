import { useState, useEffect } from 'react';
import api from '../services/api';

export function usePersonalContext() {
  const [contextData, setContextData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/plaid/dictionary-context')
      .then(res => setContextData(res.data))
      .catch(() => setContextData(null))
      .finally(() => setLoading(false));
  }, []);

  return { contextData, loading };
}
