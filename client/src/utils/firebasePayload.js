import {
  computePillarScores,
  computeArchetype,
  computeRecommendedModules,
  computeDictionaryPriority,
} from './surveyScoring';

export function buildSurveyPayload(answers) {
  const scores = computePillarScores(answers);
  const { archetype, treeStage, treeState } = computeArchetype(scores.literacy);
  const recommendedModules = computeRecommendedModules(scores, answers.goal);
  const dictionaryPriority = computeDictionaryPriority(answers.goal);

  return {
    answers: {
      goal:              answers.goal || null,
      bankingConfidence: answers.bankingConfidence || null,
      bankingKnowledge:  answers.bankingKnowledge || null,
      creditConfidence:  answers.creditConfidence || null,
      creditKnowledge:   answers.creditKnowledge || null,
      savingConfidence:  answers.savingConfidence || null,
      investConfidence:  answers.investConfidence || null,
    },
    scores,
    knowledgeChecks: {
      bankingCorrect: answers.bankingKnowledge === 'b',
      creditCorrect:  answers.creditKnowledge === 'b',
    },
    archetype,
    treeStage,
    treeState,
    recommendedModules,
    dictionaryPriority,
  };
}
