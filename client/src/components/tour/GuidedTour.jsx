import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import TourTooltip from './TourTooltip';

const PADDING = 6;

function isInViewport(rect) {
  return (
    rect.top >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.left >= 0 &&
    rect.right <= window.innerWidth
  );
}

export default function GuidedTour({ active, step, currentStep, totalSteps, onNext, onPrev, onSkip }) {
  const [targetRect, setTargetRect] = useState(null);

  const measure = useCallback(() => {
    if (!currentStep?.target) { setTargetRect(null); return; }
    const el = document.querySelector(currentStep.target);
    if (!el) { setTargetRect(null); return; }

    const rect = el.getBoundingClientRect();

    if (!isInViewport(rect)) {
      // Scroll the element into view inside its scrollable ancestor, then re-measure
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      setTimeout(() => {
        setTargetRect(el.getBoundingClientRect());
      }, 450);
    } else {
      setTargetRect(rect);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!active) { setTargetRect(null); return; }
    // Small delay lets the DOM settle (e.g. route transitions)
    const id = setTimeout(measure, 100);
    return () => clearTimeout(id);
  }, [active, measure]);

  if (!active) return null;

  const rect = targetRect;

  return createPortal(
    <>
      {/* Full-screen click-to-skip dim — transparent when spotlight is active */}
      <div
        onClick={onSkip}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: rect ? 'transparent' : 'rgba(0,0,0,0.55)',
          pointerEvents: 'all',
        }}
      />

      {/* Spotlight div — box-shadow creates the dim everywhere outside it */}
      {rect && (
        <div
          style={{
            position: 'fixed',
            top: rect.top - PADDING,
            left: rect.left - PADDING,
            width: rect.width + PADDING * 2,
            height: rect.height + PADDING * 2,
            borderRadius: 8,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
            zIndex: 10001,
            pointerEvents: 'none',
          }}
        />
      )}

      <TourTooltip
        step={step}
        currentStep={currentStep}
        totalSteps={totalSteps}
        targetRect={rect}
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
      />
    </>,
    document.body
  );
}
