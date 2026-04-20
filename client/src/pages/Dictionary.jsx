import { useState, useMemo, useRef, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import CategoryBar from '../components/dictionary/CategoryBar';
import TermGrid from '../components/dictionary/TermGrid';
import FilterBar from '../components/dictionary/FilterBar';
import TermDetailPanel from '../components/dictionary/TermDetailPanel';
import { TERMS } from '../data/dictionaryTerms';
import { filterTerms, sortTerms } from '../utils/dictionaryFilters';
import { useDictionaryProgress } from '../hooks/useDictionaryProgress';
import { useDictionaryStarred } from '../hooks/useDictionaryStarred';
import { useDictionaryShortcuts } from '../hooks/useDictionaryShortcuts';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { usePersonalContext } from '../hooks/usePersonalContext';
import api from '../services/api';

const SORT_OPTIONS = [
  { value: 'alpha',     label: 'A to Z' },
  { value: 'starred',   label: 'Starred first' },
  { value: 'recent',    label: 'Recently read' },
  { value: 'milestone', label: 'Milestones first' },
  { value: 'unread',    label: 'Unread first' },
  { value: 'personal',  label: 'Has my data' },
];

export default function Dictionary() {
  const [activeCat, setActiveCat]           = useState('all');
  const [expandedTermId, setExpandedTermId] = useState(null);
  const [searchVal, setSearchVal]           = useState('');
  const [sortKey, setSortKey]               = useState('alpha');
  const [isConnected, setIsConnected]       = useState(null);
  const [scrolled, setScrolled]             = useState(false);
  const searchRef = useRef(null);
  const scrollRef = useRef(null);

  const isWide = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    api.get('/plaid/accounts')
      .then(() => setIsConnected(true))
      .catch(err => {
        setIsConnected(err.response?.status !== 401 ? true : false);
      });
  }, []);

  function handleMilestoneUnlock(termId, termName) {
    api.post('/milestones/unlock', { milestoneId: `dictionary-${termId}`, termName })
      .catch(() => {});
  }

  const { readTerms, readAt, markRead, isRead, progressForCategory } = useDictionaryProgress(handleMilestoneUnlock);
  const { starred, toggleStar, isStarred } = useDictionaryStarred();
  const { contextData, loading: contextLoading } = usePersonalContext();

  const readCount  = readTerms.size;
  const totalCount = TERMS.length;
  const readPct    = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0;

  const filteredAndSorted = useMemo(() => {
    const filtered = filterTerms(TERMS, { activeCat, searchVal });
    return sortTerms(filtered, sortKey, { readTerms, starred, readAt });
  }, [activeCat, searchVal, sortKey, readTerms, starred, readAt]);

  const expandedTerm = expandedTermId ? TERMS.find(t => t.id === expandedTermId) : null;
  const inlineExpandedId = isWide ? null : expandedTermId;

  function handleToggleTerm(termId) {
    const next = termId === expandedTermId ? null : termId;
    setExpandedTermId(next);
    if (next && termId) markRead(termId);
    if (next && !isWide) {
      setTimeout(() => {
        const el = document.getElementById(`term-${termId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }

  function handleNavigateToTerm(termId) {
    setActiveCat('all');
    setSearchVal('');
    setExpandedTermId(termId);
    markRead(termId);
    if (!isWide) {
      setTimeout(() => {
        const el = document.getElementById(`term-${termId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  useDictionaryShortcuts({
    searchRef,
    expandedTermId,
    onCloseExpanded: () => setExpandedTermId(null),
    onToggleTerm: handleToggleTerm,
    onToggleStar: toggleStar,
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 8);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar
        title="Financial Dictionary"
        subtitle="Browse and learn financial terms by category."
      />

      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px', background: 'var(--bg-page)' }}
      >

        {/* Hero header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'flex-end', gap: 32, marginBottom: 0 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 56, color: 'var(--primary)', letterSpacing: '-0.02em', lineHeight: 1, margin: '0 0 12px' }}>
                The Lexicon
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--fg-2)', maxWidth: 520, lineHeight: 1.65, margin: 0 }}>
                Your guide to financial language. Every term you read builds the foundation for smarter decisions.
              </p>
            </div>

            <div style={{ textAlign: 'right', paddingBottom: 4 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--primary)', lineHeight: 1, marginBottom: 4 }}>
                {readPct}%
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 10 }}>
                {readCount} of {totalCount} terms read
                {starred.size > 0 && ` · ${starred.size} starred`}
              </div>
              <div style={{ width: 160, height: 4, background: 'var(--border-1)', borderRadius: 99, overflow: 'hidden', marginLeft: 'auto' }}>
                <div style={{ height: '100%', width: `${readPct}%`, background: 'var(--success)', borderRadius: 99, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          </div>

          <div style={{ borderBottom: '1px solid var(--border-1)', marginTop: 28 }} />
        </div>

        {/* Sticky filter + category bar */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          background: 'var(--bg-page)',
          paddingTop: 12,
          paddingBottom: 12,
          marginBottom: 16,
          boxShadow: scrolled ? '0 6px 14px -12px rgba(0,0,0,0.25)' : 'none',
          transition: 'box-shadow 0.2s ease',
        }}>
          <div style={{ marginBottom: 12 }}>
            <FilterBar
              ref={searchRef}
              searchVal={searchVal}
              onSearchChange={setSearchVal}
              sortKey={sortKey}
              onSortChange={setSortKey}
              sortOptions={SORT_OPTIONS}
              resultsCount={filteredAndSorted.length}
            />
          </div>

          <CategoryBar
            activeCat={activeCat}
            onCategorySelect={cat => { setActiveCat(cat); setExpandedTermId(null); }}
            progressForCategory={progressForCategory}
          />
        </div>

        <TermGrid
          terms={filteredAndSorted}
          activeCat={activeCat}
          searchVal={searchVal}
          expandedTermId={inlineExpandedId}
          onToggle={handleToggleTerm}
          isRead={isRead}
          isStarred={isStarred}
          onToggleStar={toggleStar}
          onMarkRead={markRead}
          onNavigateToTerm={handleNavigateToTerm}
          contextData={contextData}
          contextLoading={contextLoading}
          isConnected={isConnected}
          onClearSearch={() => setSearchVal('')}
        />
      </div>

      {isWide && (
        <TermDetailPanel
          term={expandedTerm}
          isRead={expandedTerm ? isRead(expandedTerm.id) : false}
          isStarred={expandedTerm ? isStarred(expandedTerm.id) : false}
          onToggleStar={toggleStar}
          onMarkRead={markRead}
          onClose={() => setExpandedTermId(null)}
          onNavigateToTerm={handleNavigateToTerm}
          contextData={contextData}
          contextLoading={contextLoading}
          isConnected={isConnected}
        />
      )}
    </div>
  );
}
