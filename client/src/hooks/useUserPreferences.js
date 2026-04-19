import { useState, useEffect, useCallback } from 'react';
import { database } from '../firebase-config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import useAuth from '../services/useAuth';

const STORAGE_KEY = 'finlit_preferences';

const DEFAULTS = {
  transactionDays: 90,
  syncFrequency: 'on_open',
  budgetSource: 'plaid',
  theme: 'system',
  defaultTab: 'dashboard',
  visualizationStyle: 'tree',
};

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveLocal(prefs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
}

export function useUserPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState(loadLocal);

  // On sign-in, fetch from Firestore and merge with local defaults
  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;

    async function syncFromFirestore() {
      try {
        const ref = doc(database, 'users', user.uid, 'preferences', 'app');
        const snap = await getDoc(ref);
        if (cancelled) return;
        if (snap.exists()) {
          const remote = snap.data();
          // Strip Firestore-only fields before merging
          const { updatedAt, ...remotePrefs } = remote;
          const merged = { ...DEFAULTS, ...remotePrefs };
          setPrefs(merged);
          saveLocal(merged);
        }
      } catch {
        // Network failure — local values already showing, nothing to do
      }
    }

    syncFromFirestore();
    return () => { cancelled = true; };
  }, [user?.uid]);

  const update = useCallback((patch) => {
    setPrefs(prev => {
      const next = { ...prev, ...patch };
      saveLocal(next);
      if (user?.uid) {
        const ref = doc(database, 'users', user.uid, 'preferences', 'app');
        setDoc(ref, { ...next, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
      }
      return next;
    });
  }, [user]);

  return { prefs, update };
}
