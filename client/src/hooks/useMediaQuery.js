import { useEffect, useState } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const listener = e => setMatches(e.matches);
    // Modern browsers use addEventListener on MediaQueryList.
    if (mql.addEventListener) mql.addEventListener('change', listener);
    else mql.addListener(listener);
    setMatches(mql.matches);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', listener);
      else mql.removeListener(listener);
    };
  }, [query]);

  return matches;
}
