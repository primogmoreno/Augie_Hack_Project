import { useEffect } from 'react';

// Keyboard shortcuts for the dictionary:
//   "/"     focus the search input
//   "Esc"   close expanded card / detail panel
//   "↑/↓"   move focus between term cards
//   "Enter" toggle focused card
//   "s"     star focused card (only fires when a card has focus)
//
// The page passes in callbacks so this hook stays presentation-agnostic.

export function useDictionaryShortcuts({
  searchRef, expandedTermId, onCloseExpanded, onToggleTerm, onToggleStar,
}) {
  useEffect(() => {
    function isTypingIn(el) {
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
    }

    function getFocusedCardId() {
      const el = document.activeElement;
      if (!el || !(el instanceof HTMLElement)) return null;
      const card = el.closest('[data-term-id]');
      return card?.getAttribute('data-term-id') ?? null;
    }

    function handleKey(e) {
      // "/" focus search — skip when already typing.
      if (e.key === '/' && !isTypingIn(document.activeElement)) {
        e.preventDefault();
        searchRef?.current?.focus();
        return;
      }

      if (e.key === 'Escape') {
        if (expandedTermId) {
          e.preventDefault();
          onCloseExpanded?.();
        }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (isTypingIn(document.activeElement)) return;
        const cards = Array.from(document.querySelectorAll('[data-term-id]'));
        if (cards.length === 0) return;
        const current = document.activeElement?.closest('[data-term-id]');
        const currentIdx = current ? cards.indexOf(current) : -1;
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        const nextIdx = currentIdx === -1
          ? (dir === 1 ? 0 : cards.length - 1)
          : (currentIdx + dir + cards.length) % cards.length;
        e.preventDefault();
        cards[nextIdx].focus();
        return;
      }

      if (e.key === 'Enter') {
        if (isTypingIn(document.activeElement)) return;
        const termId = getFocusedCardId();
        if (termId) {
          e.preventDefault();
          onToggleTerm?.(termId);
        }
        return;
      }

      if (e.key === 's' || e.key === 'S') {
        if (isTypingIn(document.activeElement)) return;
        const termId = getFocusedCardId();
        if (termId) {
          e.preventDefault();
          onToggleStar?.(termId);
        }
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [searchRef, expandedTermId, onCloseExpanded, onToggleTerm, onToggleStar]);
}
