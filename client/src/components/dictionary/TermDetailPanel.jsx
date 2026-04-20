import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { CATEGORIES } from '../../data/dictionaryCategories';
import TermCardExpanded from './TermCardExpanded';

export default function TermDetailPanel({
  term,
  isRead,
  isStarred,
  onToggleStar,
  onMarkRead,
  onClose,
  onNavigateToTerm,
  contextData,
  contextLoading,
  isConnected,
}) {
  useEffect(() => {
    if (!term) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [term, onClose]);

  const cat = term ? CATEGORIES.find(c => c.id === term.cat) : null;

  return (
    <AnimatePresence>
      {term && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(23, 49, 36, 0.15)',
              zIndex: 40,
            }}
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-label={`Details for ${term.name}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(440px, 92vw)',
              background: 'var(--surface-card)',
              boxShadow: '-12px 0 40px rgba(0,0,0,0.14)',
              zIndex: 41,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              gap: 12, padding: '20px 24px 14px',
              borderBottom: '1px solid var(--border-1)',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {cat && (
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6,
                  }}>
                    {cat.name}
                  </div>
                )}
                <div style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 28, color: 'var(--primary)', lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                }}>
                  {term.name}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close detail panel"
                style={{
                  flexShrink: 0,
                  width: 32, height: 32, borderRadius: 8,
                  border: '1px solid var(--border-1)',
                  background: 'var(--surface-low)',
                  color: 'var(--fg-2)',
                  cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px' }}>
              <TermCardExpanded
                term={term}
                isRead={isRead}
                isStarred={isStarred}
                onToggleStar={onToggleStar}
                onMarkRead={onMarkRead}
                onClose={onClose}
                onNavigateToTerm={onNavigateToTerm}
                contextData={contextData}
                contextLoading={contextLoading}
                isConnected={isConnected}
                stack
                hideClose
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
