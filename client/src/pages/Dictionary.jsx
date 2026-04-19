import { useState, useMemo, useRef, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import CategoryBar from '../components/dictionary/CategoryBar';
import TermGrid from '../components/dictionary/TermGrid';
import { TERMS } from '../data/dictionaryTerms';
import { filterTerms, sortTerms } from '../utils/dictionaryFilters';
import { useDictionaryProgress } from '../hooks/useDictionaryProgress';
import { usePersonalContext } from '../hooks/usePersonalContext';
import api from '../services/api';

const SORT_OPTIONS = [
  { value: 'alpha',     label: 'A to Z' },
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
  const searchRef = useRef(null);
  const expandedRef = useRef(null);

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

  const { readTerms, markRead, isRead, progressForCategory } = useDictionaryProgress(handleMilestoneUnlock);
  const { contextData, loading: contextLoading } = usePersonalContext();

  const readCount  = readTerms.size;
  const totalCount = TERMS.length;
  const readPct    = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0;

  const filteredAndSorted = useMemo(() => {
    const filtered = filterTerms(TERMS, { activeCat, searchVal });
    return sortTerms(filtered, sortKey, readTerms);
  }, [activeCat, searchVal, sortKey, readTerms]);

  function handleToggleTerm(termId) {
    const next = termId === expandedTermId ? null : termId;
    setExpandedTermId(next);
    if (next && termId) markRead(termId);
    if (next) {
      setTimeout(() => expandedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }
  }

  function handleNavigateToTerm(termId) {
    setActiveCat('all');
    setSearchVal('');
    if (searchRef.current) searchRef.current.value = '';
    setExpandedTermId(termId);
    markRead(termId);
    setTimeout(() => {
      const el = document.getElementById(`term-${termId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar
        title="Financial Dictionary"
        subtitle="Browse and learn financial terms by category."
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px', background: 'var(--bg-page)' }}>

        {/* Hero header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'flex-end', gap: 32, marginBottom: 0 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 56, color: 'var(--primary)', letterSpacing: '-0.02em', lineHeight: 1, margin: '0 0 12px' }}>
                The Lexicon
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--fg-2)', maxWidth: 520, lineHeight: 1.65, margin: 0 }}>
                Your guide to financial language. Every term you read builds the foundation for smarter decisions.
              </p>
            </div>

            {/* Progress stat */}
            <div style={{ textAlign: 'right', paddingBottom: 4 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--primary)', lineHeight: 1, marginBottom: 4 }}>
                {readPct}%
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 10 }}>
                {readCount} of {totalCount} terms read
              </div>
              <div style={{ width: 160, height: 4, background: 'var(--border-1)', borderRadius: 99, overflow: 'hidden', marginLeft: 'auto' }}>
                <div style={{ height: '100%', width: `${readPct}%`, background: 'var(--success)', borderRadius: 99, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderBottom: '1px solid var(--border-1)', marginTop: 28 }} />
        </div>

        {/* Unified filter bar */}
        <div style={{
          background: 'var(--surface-low)', borderRadius: 'var(--radius-xl)',
          padding: 8, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20,
        }}>
          {/* Search */}
          <div style={{ flex: 1, position: 'relative' }}>
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--fg-3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              aria-label="Search financial terms"
              defaultValue={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search terms…"
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
                border: 'none', borderRadius: 'var(--radius-md)',
                fontSize: 13, fontFamily: 'var(--font-sans)',
                color: 'var(--fg-1)', background: 'var(--surface-card)',
                outline: 'none',
              }}
            />
          </div>

          {/* Sort */}
          <select
            aria-label="Sort terms"
            value={sortKey}
            onChange={e => setSortKey(e.target.value)}
            style={{
              flexShrink: 0, padding: '10px 14px',
              border: 'none', borderRadius: 'var(--radius-md)',
              fontSize: 13, fontFamily: 'var(--font-sans)',
              color: 'var(--fg-1)', background: 'var(--surface-card)',
              cursor: 'pointer', outline: 'none',
            }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Results count */}
          <div style={{ paddingRight: 8, fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {filteredAndSorted.length} term{filteredAndSorted.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Category pills */}
        <CategoryBar
          activeCat={activeCat}
          onCategorySelect={cat => { setActiveCat(cat); setExpandedTermId(null); }}
          progressForCategory={progressForCategory}
        />

        <TermGrid
          terms={filteredAndSorted}
          activeCat={activeCat}
          searchVal={searchVal}
          expandedTermId={expandedTermId}
          onToggle={handleToggleTerm}
          isRead={isRead}
          onMarkRead={markRead}
          onNavigateToTerm={handleNavigateToTerm}
          contextData={contextData}
          contextLoading={contextLoading}
          isConnected={isConnected}
          onClearSearch={() => {
            setSearchVal('');
            if (searchRef.current) searchRef.current.value = '';
          }}
        />
      </div>
    </div>
  );
}
