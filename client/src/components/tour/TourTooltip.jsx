const TT_W = 320;
const GAP = 12;
const SCREEN_PAD = 16;

function getStyle(rect) {
  // No target — center on screen
  if (!rect) {
    return {
      position: 'fixed',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: TT_W,
      maxHeight: `calc(100vh - ${SCREEN_PAD * 2}px)`,
      overflowY: 'auto',
    };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Vertical: prefer below, then above, then center
  let top;
  const spaceBelow = vh - rect.bottom - GAP;
  const spaceAbove = rect.top - GAP;

  if (spaceBelow >= 160) {
    top = rect.bottom + GAP;
  } else if (spaceAbove >= 160) {
    top = rect.top - GAP - 160; // approximate — real height may vary
  } else {
    // Neither side has room: anchor below but allow scroll
    top = Math.min(rect.bottom + GAP, vh - 160 - SCREEN_PAD);
    top = Math.max(SCREEN_PAD, top);
  }

  // Horizontal: align with target left, clamped to viewport
  let left = rect.left;
  left = Math.min(left, vw - TT_W - SCREEN_PAD);
  left = Math.max(SCREEN_PAD, left);

  return {
    position: 'fixed',
    top,
    left,
    width: TT_W,
    maxHeight: `calc(100vh - ${SCREEN_PAD * 2}px)`,
    overflowY: 'auto',
  };
}

export default function TourTooltip({
  step, currentStep, totalSteps, targetRect,
  onNext, onPrev, onSkip,
}) {
  if (!currentStep) return null;

  const isFirst = step === 0;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div
      style={{
        ...getStyle(targetRect),
        zIndex: 10002,
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        padding: '20px 20px 16px',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--border-1)', borderRadius: 99, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'var(--primary)', borderRadius: 99,
          transition: 'width 0.3s ease',
        }} />
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 8 }}>
        {step + 1} of {totalSteps}
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, color: 'var(--fg-1)', marginBottom: 8 }}>
        {currentStep.title}
      </div>
      <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6, marginBottom: 16 }}>
        {currentStep.body}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {!isFirst && (
          <button onClick={onPrev} style={secondaryBtn}>← Back</button>
        )}
        <button onClick={onNext} style={primaryBtn}>
          {currentStep.primaryAction ?? 'Next →'}
        </button>
        <button onClick={onSkip} style={{ ...secondaryBtn, marginLeft: 'auto' }}>
          {currentStep.secondaryAction ?? 'Skip'}
        </button>
      </div>
    </div>
  );
}

const primaryBtn = {
  padding: '8px 16px', background: 'var(--primary)', color: 'var(--fg-inverse)',
  border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
};
const secondaryBtn = {
  padding: '8px 14px', background: 'var(--surface-low)', color: 'var(--fg-2)',
  border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', fontSize: 13,
  fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)',
};
