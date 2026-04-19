import { useState, useCallback } from 'react';
import { TERMS } from '../data/dictionaryTerms';

const STORAGE_KEY = 'finlit_dictionary_read';

export function useDictionaryProgress(onMilestoneUnlock) {
  const [readTerms, setReadTerms] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const markRead = useCallback((termId) => {
    setReadTerms(prev => {
      if (prev.has(termId)) return prev;
      const next = new Set(prev);
      next.add(termId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}

      const term = TERMS.find(t => t.id === termId);
      if (term?.milestone && onMilestoneUnlock) {
        onMilestoneUnlock(termId, term.name);
      }
      return next;
    });
  }, [onMilestoneUnlock]);

  const isRead = useCallback((termId) => readTerms.has(termId), [readTerms]);

  const progressForCategory = useCallback((catId) => {
    const catTerms = catId === 'all' ? TERMS : TERMS.filter(t => t.cat === catId);
    return {
      read: catTerms.filter(t => readTerms.has(t.id)).length,
      total: catTerms.length,
    };
  }, [readTerms]);

  return { readTerms, markRead, isRead, progressForCategory };
}
