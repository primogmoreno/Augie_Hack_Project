import { useState, useCallback, useEffect } from 'react';
import useAuth from '../services/useAuth';
import {
  recordDictionaryTermsStarred,
  getDictionaryTermsStarred,
} from '../firebase/literacyService';

const STORAGE_KEY = 'fire_dictionary_starred';

function loadLocal() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function persistLocal(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
}

export function useDictionaryStarred() {
  const { user } = useAuth();
  const [starred, setStarred] = useState(loadLocal);

  // On auth, hydrate from Firestore and merge with local.
  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    getDictionaryTermsStarred(user.uid)
      .then(remote => {
        if (cancelled) return;
        setStarred(prev => {
          const merged = new Set([...prev, ...remote]);
          persistLocal(merged);
          return merged;
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.uid]);

  const toggleStar = useCallback((termId) => {
    setStarred(prev => {
      const next = new Set(prev);
      const willStar = !next.has(termId);
      if (willStar) next.add(termId);
      else next.delete(termId);
      persistLocal(next);

      if (user?.uid) {
        recordDictionaryTermsStarred(user.uid, termId, willStar ? 'add' : 'remove')
          .catch(() => {});
      }
      return next;
    });
  }, [user?.uid]);

  const isStarred = useCallback((termId) => starred.has(termId), [starred]);

  return { starred, toggleStar, isStarred };
}
