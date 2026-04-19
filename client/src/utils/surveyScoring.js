export function computePillarScores(answers) {
  function confToScore(confValue) {
    return Math.round(((confValue - 1) / 4) * 80);
  }

  const banking = Math.min(100,
    confToScore(answers.bankingConfidence || 3) +
    (answers.bankingKnowledge === 'b' ? 20 : 0)
  );

  const credit = Math.min(100,
    confToScore(answers.creditConfidence || 3) +
    (answers.creditKnowledge === 'b' ? 20 : 0)
  );

  const saving = Math.min(100,
    confToScore(answers.savingConfidence || 3)
  );

  const investing = Math.min(100,
    confToScore(answers.investConfidence || 3)
  );

  const spending = 50;
  const literacy = computeLiteracyScore(answers);

  return { banking, credit, saving, investing, spending, literacy };
}

export function computeLiteracyScore(answers) {
  const confidenceValues = [
    answers.bankingConfidence || 3,
    answers.creditConfidence || 3,
    answers.savingConfidence || 3,
    answers.investConfidence || 3,
  ];

  const avgConfidence = confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length;
  const normalizedConf = (avgConfidence - 1) / 4;

  const knowledgeScore = (
    (answers.bankingKnowledge === 'b' ? 0.5 : 0) +
    (answers.creditKnowledge === 'b' ? 0.5 : 0)
  );

  const rawScore = (normalizedConf * 0.65) + (knowledgeScore * 0.35);
  return Math.round(rawScore * 100);
}

export function computeArchetype(literacyScore) {
  if (literacyScore < 20) return {
    archetype: 'Fresh start',
    treeStage: 'First seed',
    treeState: 'seed',
    treeColor: '#B4B2A9',
    description: 'Every financial expert started exactly where you are. Your journey begins now.',
  };
  if (literacyScore < 35) return {
    archetype: 'Building foundations',
    treeStage: 'Young sprout',
    treeState: 'sprout',
    treeColor: '#8aab95',
    description: 'You have some awareness and are ready to build real knowledge on top of it.',
  };
  if (literacyScore < 52) return {
    archetype: 'Growing confident',
    treeStage: 'Steady sapling',
    treeState: 'sapling',
    treeColor: '#4a7a60',
    description: "You understand the basics. Now it's about applying them consistently.",
  };
  if (literacyScore < 68) return {
    archetype: 'Financially aware',
    treeStage: 'Young tree',
    treeState: 'young',
    treeColor: '#27500A',
    description: 'You have solid foundations. A few targeted areas will accelerate your growth significantly.',
  };
  if (literacyScore < 82) return {
    archetype: 'Well informed',
    treeStage: 'Mature tree',
    treeState: 'mature',
    treeColor: '#173124',
    description: 'You are well-informed across most areas. F.I.R.E will help you go from awareness to mastery.',
  };
  return {
    archetype: 'Strong foundation',
    treeStage: 'Thriving tree',
    treeState: 'thriving',
    treeColor: '#173124',
    description: 'You have strong financial knowledge. F.I.R.E will help you optimize and go deeper.',
  };
}

export function computeRecommendedModules(pillarScores, goal) {
  const modules = [];

  const goalModuleMap = {
    debt:   'credit-and-debt',
    save:   'saving-fundamentals',
    invest: 'investing-intro',
    budget: 'budgeting-basics',
    learn:  'financial-fundamentals',
  };
  if (goal && goalModuleMap[goal]) modules.push(goalModuleMap[goal]);

  const pillarModuleMap = [
    { pillar: 'banking',   threshold: 50, module: 'banking-basics' },
    { pillar: 'credit',    threshold: 50, module: 'credit-and-debt' },
    { pillar: 'saving',    threshold: 50, module: 'saving-fundamentals' },
    { pillar: 'investing', threshold: 40, module: 'investing-intro' },
  ];

  pillarModuleMap
    .filter(pm => pillarScores[pm.pillar] < pm.threshold)
    .sort((a, b) => pillarScores[a.pillar] - pillarScores[b.pillar])
    .forEach(pm => {
      if (!modules.includes(pm.module)) modules.push(pm.module);
    });

  if (modules.length === 0) {
    modules.push('advanced-investing', 'tax-strategy', 'retirement-planning');
  }

  return modules;
}

export function computeDictionaryPriority(goal) {
  const priorityMap = {
    debt:   ['credit', 'saving', 'loans'],
    save:   ['saving', 'banking', 'investing'],
    invest: ['investing', 'retirement', 'taxes'],
    budget: ['saving', 'banking', 'credit'],
    learn:  ['banking', 'credit', 'saving'],
  };
  return priorityMap[goal] || ['banking', 'credit', 'saving'];
}

export const SCORE_CAPS = {
  dictionaryTerms:   { literacy: 25 },
  milestones:        { literacy: 30 },
  moduleCompletions: { per_pillar: 40 },
  plaidImprovements: { per_pillar: 30 },
  surveyRetake:      { replaces: true },
};

export const SNAPSHOT_TRIGGERS = {
  SURVEY_COMPLETE:    'survey_complete',
  SURVEY_RETAKE:      'survey_retake',
  MODULE_COMPLETE:    'module_complete',
  MILESTONE_UNLOCK:   'milestone_unlock',
  DICTIONARY_BATCH:   'dictionary_batch',
  PLAID_IMPROVEMENT:  'plaid_improvement',
  MONTHLY_CHECKPOINT: 'monthly_checkpoint',
  MANUAL:             'manual',
};
