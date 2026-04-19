import { useState, useEffect, useCallback } from 'react';
import { database } from '../firebase-config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import useAuth from '../services/useAuth';
import { TOUR_STEPS } from '../data/tourSteps';

const STORAGE_KEY = 'finlit_tour_completed';

export function useGuidedTour() {
  const { user, isRegistered } = useAuth();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user || !isRegistered) return;
    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed) return;
    const t = setTimeout(() => setActive(true), 800);
    return () => clearTimeout(t);
  }, [user, isRegistered]);

  async function markComplete() {
    localStorage.setItem(STORAGE_KEY, 'true');
    if (user?.uid) {
      const ref = doc(database, 'users', user.uid);
      setDoc(ref, { tourCompletedAt: serverTimestamp() }, { merge: true }).catch(() => {});
    }
  }

  const next = useCallback(() => {
    if (step >= TOUR_STEPS.length - 1) {
      setActive(false);
      setStep(0);
      markComplete();
    } else {
      setStep(s => s + 1);
    }
  }, [step]);

  const prev = useCallback(() => {
    setStep(s => Math.max(0, s - 1));
  }, []);

  const skip = useCallback(() => {
    setActive(false);
    setStep(0);
    markComplete();
  }, []);

  const restart = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStep(0);
    setActive(true);
  }, []);

  return {
    active,
    step,
    currentStep: TOUR_STEPS[step],
    totalSteps: TOUR_STEPS.length,
    next,
    prev,
    skip,
    restart,
  };
}
