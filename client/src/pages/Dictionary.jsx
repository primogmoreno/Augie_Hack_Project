import { useState, useMemo, useRef, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import CategoryBar from '../components/dictionary/CategoryBar';
import SearchBar from '../components/dictionary/SearchBar';
import TermGrid from '../components/dictionary/TermGrid';
import ProgressHeader from '../components/dictionary/ProgressHeader';
import { TERMS } from '../data/dictionaryTerms';
import { filterTerms, sortTerms } from '../utils/dictionaryFilters';
import { useDictionaryProgress } from '../hooks/useDictionaryProgress';
import { usePersonalContext } from '../hooks/usePersonalContext';
import api from '../services/api';

export default function Dictionary() {
  const [activeCat, setActiveCat]         = useState('all');
  const [expandedTermId, setExpandedTermId] = useState(null);
  const [searchVal, setSearchVal]         = useState('');
  const [sortKey, setSortKey]             = useState('alpha');
  const [isConnected, setIsConnected]     = useState(null);
  const expandedRef = useRef(null);

  // Check if user has Plaid connected
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

  const filteredAndSorted = useMemo(() => {
    const filtered = filterTerms(TERMS, { activeCat, searchVal });
    return sortTerms(filtered, sortKey, readTerms);
  }, [activeCat, searchVal, sortKey, readTerms]);

  function handleToggleTerm(termId) {
    const next = termId === expandedTermId ? null : termId;
    setExpandedTermId(next);
    if (next && termId) markRead(termId);
    if (next) {
      // Scroll to expanded card after render
      setTimeout(() => expandedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }
  }

  function handleNavigateToTerm(termId) {
    setActiveCat('all');
    setSearchVal('');
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
        title="Dictionary"
        subtitle="Browse and learn financial terms by category."
        right={<ProgressHeader readTerms={readTerms} />}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px 60px', background: 'var(--ink-0)' }}>
        <CategoryBar
          activeCat={activeCat}
          onCategorySelect={cat => { setActiveCat(cat); setExpandedTermId(null); }}
          progressForCategory={progressForCategory}
        />

        <SearchBar
          searchVal={searchVal}
          onSearchChange={setSearchVal}
          sortKey={sortKey}
          onSortChange={setSortKey}
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
          onClearSearch={() => setSearchVal('')}
        />
      </div>
    </div>
  );
}
