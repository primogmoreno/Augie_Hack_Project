export const TREE_STAGES = [
  { id: 'barren',     name: 'Bare Ground',     minScore: 0,  maxScore: 14,  description: 'Your financial journey has not started yet. Plant the first seed.',       treeState: 'no-tree' },
  { id: 'seed',       name: 'First Seed',       minScore: 15, maxScore: 24,  description: 'A seed has been planted. Small habits are beginning to take root.',       treeState: 'seed'    },
  { id: 'sprout',     name: 'Young Sprout',     minScore: 25, maxScore: 39,  description: 'Your sprout is fragile but growing. Protect it with consistent habits.',  treeState: 'sprout'  },
  { id: 'sapling',    name: 'Steady Sapling',   minScore: 40, maxScore: 54,  description: 'Your roots are forming. Keep nurturing your habits.',                     treeState: 'sapling' },
  { id: 'young-tree', name: 'Young Tree',       minScore: 55, maxScore: 69,  description: 'Growing strong. Your financial foundation is becoming solid.',            treeState: 'young'   },
  { id: 'mature',     name: 'Mature Tree',      minScore: 70, maxScore: 84,  description: 'A strong, leafy tree. Your money is working for you.',                   treeState: 'mature'  },
  { id: 'thriving',   name: 'Thriving Tree',    minScore: 85, maxScore: 92,  description: 'Full canopy, deep roots. Financial confidence at its peak.',              treeState: 'thriving'},
  { id: 'mighty',     name: 'Mighty Oak',       minScore: 93, maxScore: 100, description: 'Financial mastery. Your tree stands tall and endures all seasons.',       treeState: 'mighty'  },
];

export function getStageForScore(score) {
  return TREE_STAGES.filter(s => score >= s.minScore).pop() || TREE_STAGES[0];
}
