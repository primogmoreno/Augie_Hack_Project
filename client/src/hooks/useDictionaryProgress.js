import { useState, useCallback } from 'react';
import { TERMS } from '../data/dictionaryTerms';
import useAuth from '../services/useAuth';
import { recordDictionaryTermsRead } from '../firebase/literacyService';

const LEGACY_KEY = 'fire_dictionary_read';
const STORAGE_KEY = 'fire_dictionary_read_v2';

function loadInitial() {
  try {
    const v2 = localStorage.getItem(STORAGE_KEY);
    if (v2) {
      const parsed = JSON.parse(v2);
      return {
        readTerms: new Set(Object.keys(parsed)),
        readAt: new Map(Object.entries(parsed).map(([k, v]) => [k, Number(v)])),
      };
    }
    // One-time migration from v1 (array of IDs) to v2 ({id: timestamp}).
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const ids = JSON.parse(legacy);
      const now = Date.now();
      const map = {};
      ids.forEach((id, i) => { map[id] = now - i; }); // preserve rough order
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      return {
        readTerms: new Set(ids),
        readAt: new Map(Object.entries(map).map(([k, v]) => [k, Number(v)])),
      };
    }
  } catch {}
  return { readTerms: new Set(), readAt: new Map() };
}

export function useDictionaryProgress(onMilestoneUnlock) {
  const { user } = useAuth();
  const [state, setState] = useState(loadInitial);
  const { readTerms, readAt } = state;

  const markRead = useCallback((termId) => {
    setState(prev => {
      if (prev.readTerms.has(termId)) return prev;
      const nextReadTerms = new Set(prev.readTerms);
      nextReadTerms.add(termId);
      const nextReadAt = new Map(prev.readAt);
      nextReadAt.set(termId, Date.now());

      try {
        const obj = Object.fromEntries(nextReadAt);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
      } catch {}

      if (user?.uid) {
        recordDictionaryTermsRead(user.uid, [termId]).catch(() => {});
      }

      const term = TERMS.find(t => t.id === termId);
      if (term?.milestone && onMilestoneUnlock) {
        onMilestoneUnlock(termId, term.name);
      }
      return { readTerms: nextReadTerms, readAt: nextReadAt };
    });
  }, [onMilestoneUnlock, user]);

  const isRead = useCallback((termId) => readTerms.has(termId), [readTerms]);

  const progressForCategory = useCallback((catId) => {
    const catTerms = catId === 'all' ? TERMS : TERMS.filter(t => t.cat === catId);
    return {
      read: catTerms.filter(t => readTerms.has(t.id)).length,
      total: catTerms.length,
    };
  }, [readTerms]);

  return { readTerms, readAt, markRead, isRead, progressForCategory };
}
