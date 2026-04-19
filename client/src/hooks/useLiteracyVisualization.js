import { useState, useEffect } from 'react';
import useAuth from '../services/useAuth';
import { getCurrentLiteracy, getLiteracySnapshots } from '../firebase/literacyService';

export const LITERACY_LEVELS = [
  { name: 'Sapling',     min: 0,  max: 20,  color: '#a3e6b5' },
  { name: 'Sprout',      min: 20, max: 40,  color: '#4caf7d' },
  { name: 'Branching',   min: 40, max: 60,  color: '#2e7d52' },
  { name: 'Flourishing', min: 60, max: 80,  color: '#1b5e35' },
  { name: 'Mighty Oak',  min: 80, max: 101, color: '#173124' },
];

const CATEGORY_KEYS = ['banking', 'credit', 'saving', 'investing'];

const ZEROED = {
  loading: false,
  literacy: null,
  level: null,
  nextLevel: null,
  levelProgress: 0,
  categoryScores: {},
  snapshots: [],
  timelineData: [],
  recentActions: [],
  statCards: { termsRead: 0, categoriesMastered: 0, milestonesUnlocked: 0, growthPoints: 0 },
};

export function useLiteracyVisualization() {
  const { user } = useAuth();
  const [state, setState] = useState({ ...ZEROED, loading: true });

  useEffect(() => {
    if (!user?.uid) {
      setState({ ...ZEROED, loading: false });
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const [current, snapshots] = await Promise.all([
          getCurrentLiteracy(user.uid),
          getLiteracySnapshots(user.uid).catch(() => []),
        ]);

        if (cancelled) return;

        if (!current) {
          setState({ ...ZEROED, loading: false });
          return;
        }

        const scores = current.scores ?? {};
        const literacy = scores.literacy ?? 0;

        const level = LITERACY_LEVELS.find(l => literacy >= l.min && literacy < l.max)
          ?? LITERACY_LEVELS[0];
        const levelIdx = LITERACY_LEVELS.indexOf(level);
        const nextLevel = LITERACY_LEVELS[levelIdx + 1] ?? null;
        const levelProgress = nextLevel
          ? Math.round(((literacy - level.min) / (nextLevel.min - level.min)) * 100)
          : 100;

        const categoryScores = Object.fromEntries(
          CATEGORY_KEYS.map(k => [k, scores[k] ?? 0])
        );

        const timelineData = snapshots.map(s => ({
          date: s.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) ?? '',
          literacy: Math.round(s.scores?.literacy ?? 0),
          type: s.triggerType ?? 'update',
        }));

        const recentActions = snapshots.slice(-8).reverse().map(s => ({
          id: s.id,
          type: s.triggerType,
          label: s.triggerDetail ?? s.triggerType,
          date: s.createdAt?.toDate?.()?.toLocaleDateString() ?? '',
          delta: s.delta?.literacy ?? 0,
        }));

        const growth = current.growthFromBaseline ?? {};
        const growthPoints = Object.values(growth).reduce((a, v) => a + Math.max(0, v), 0);
        const categoriesMastered = CATEGORY_KEYS.filter(k => (scores[k] ?? 0) >= 75).length;

        setState({
          loading: false,
          literacy,
          level,
          nextLevel,
          levelProgress,
          categoryScores,
          snapshots,
          timelineData,
          recentActions,
          statCards: {
            termsRead: current.dictionaryTermsRead?.length ?? 0,
            categoriesMastered,
            milestonesUnlocked: current.milestonesUnlocked?.length ?? 0,
            growthPoints: Math.round(growthPoints),
          },
        });
      } catch {
        if (!cancelled) setState({ ...ZEROED, loading: false });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user?.uid]);

  return state;
}
