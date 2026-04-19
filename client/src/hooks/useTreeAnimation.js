import { useRef, useEffect, useState } from 'react';

export function useTreeAnimation() {
  const animRef      = useRef(null);
  const startTimeRef = useRef(null);
  const [animTime, setAnimTime] = useState(0);

  useEffect(() => {
    startTimeRef.current = performance.now();

    const tick = (now) => {
      setAnimTime(now - startTimeRef.current);
      animRef.current = requestAnimationFrame(tick);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (animRef.current) cancelAnimationFrame(animRef.current);
      } else {
        startTimeRef.current = performance.now() - animTime;
        animRef.current = requestAnimationFrame(tick);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return animTime;
}
