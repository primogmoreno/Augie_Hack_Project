import { database } from '../firebase-config';
import {
  doc, getDoc, setDoc, updateDoc, addDoc,
  collection, serverTimestamp, arrayUnion, arrayRemove,
  query, orderBy, getDocs,
} from 'firebase/firestore';
import { computeArchetype } from '../utils/surveyScoring';

const db = database;

export async function writeBaselineLiteracy(userId, payload) {
  const baselineRef = doc(db, 'users', userId, 'literacy', 'baseline');
  const currentRef  = doc(db, 'users', userId, 'literacy', 'current');
  const profileRef  = doc(db, 'users', userId);

  const baselineDoc = {
    createdAt: serverTimestamp(),
    surveyVersion: '1.0',
    isBaseline: true,
    answers: payload.answers,
    scores: payload.scores,
    knowledgeChecks: payload.knowledgeChecks,
    archetype: payload.archetype,
    treeStage: payload.treeStage,
    treeState: payload.treeState,
    recommendedModules: payload.recommendedModules,
    dictionaryPriority: payload.dictionaryPriority,
    primaryGoal: payload.answers.goal,
  };

  const currentDoc = {
    ...baselineDoc,
    lastUpdatedAt: serverTimestamp(),
    lastUpdateReason: 'Onboarding survey completed',
    milestonesUnlocked: [],
    dictionaryTermsRead: [],
    modulesCompleted: [],
    growthFromBaseline: {
      literacy: 0, banking: 0, credit: 0, saving: 0, investing: 0,
    },
  };

  await Promise.all([
    setDoc(baselineRef, baselineDoc),
    setDoc(currentRef, currentDoc),
    updateDoc(profileRef, {
      surveyCompleted: true,
      surveyCompletedAt: serverTimestamp(),
      surveyVersion: '1.0',
      onboardingComplete: true,
    }),
  ]);

  await writeSnapshot(userId, {
    triggerType: 'survey_complete',
    triggerDetail: 'Onboarding survey completed',
    scores: payload.scores,
    treeStage: payload.treeStage,
    archetype: payload.archetype,
    delta: { literacy: 0, banking: 0, credit: 0, saving: 0, investing: 0 },
  });
}

export async function getCurrentLiteracy(userId) {
  const ref = doc(db, 'users', userId, 'literacy', 'current');
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

export async function getBaselineLiteracy(userId) {
  const ref = doc(db, 'users', userId, 'literacy', 'baseline');
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

export async function updateCurrentLiteracy(userId, updates) {
  const currentRef  = doc(db, 'users', userId, 'literacy', 'current');
  const baselineRef = doc(db, 'users', userId, 'literacy', 'baseline');

  const [currentSnap, baselineSnap] = await Promise.all([
    getDoc(currentRef),
    getDoc(baselineRef),
  ]);

  if (!currentSnap.exists() || !baselineSnap.exists()) {
    throw new Error('Literacy documents not initialized');
  }

  const current  = currentSnap.data();
  const baseline = baselineSnap.data();
  const newScores = { ...current.scores, ...updates.scores };

  const growthFromBaseline = {
    literacy:  Math.round(newScores.literacy  - baseline.scores.literacy),
    banking:   Math.round(newScores.banking   - baseline.scores.banking),
    credit:    Math.round(newScores.credit    - baseline.scores.credit),
    saving:    Math.round(newScores.saving    - baseline.scores.saving),
    investing: Math.round(newScores.investing - baseline.scores.investing),
  };

  let archetypeUpdate = {};
  if (Math.abs(newScores.literacy - current.scores.literacy) >= 5) {
    const { archetype, treeStage, treeState } = computeArchetype(newScores.literacy);
    archetypeUpdate = { archetype, treeStage, treeState };
  }

  await updateDoc(currentRef, {
    scores: newScores,
    growthFromBaseline,
    lastUpdatedAt: serverTimestamp(),
    lastUpdateReason: updates.reason || 'Score update',
    ...archetypeUpdate,
    ...(updates.milestonesUnlocked
      ? { milestonesUnlocked: arrayUnion(...updates.milestonesUnlocked) }
      : {}),
    ...(updates.dictionaryTermsRead
      ? { dictionaryTermsRead: arrayUnion(...updates.dictionaryTermsRead) }
      : {}),
    ...(updates.modulesCompleted
      ? { modulesCompleted: arrayUnion(...updates.modulesCompleted) }
      : {}),
  });

  return { newScores, growthFromBaseline };
}

export async function writeSnapshot(userId, snapshotData) {
  const snapshotsRef = collection(db, 'users', userId, 'snapshots');
  await addDoc(snapshotsRef, {
    snapshotId: `snap_${Date.now()}`,
    createdAt: serverTimestamp(),
    ...snapshotData,
  });
}

export async function recordDictionaryTermsRead(userId, termIds) {
  const currentRef = doc(db, 'users', userId, 'literacy', 'current');

  await updateDoc(currentRef, {
    dictionaryTermsRead: arrayUnion(...termIds),
    lastUpdatedAt: serverTimestamp(),
    lastUpdateReason: `Read ${termIds.length} dictionary term(s)`,
  });

  if (termIds.length >= 5) {
    const currentSnap = await getDoc(currentRef);
    const current = currentSnap.data();
    const newLiteracy = Math.min(100, current.scores.literacy + (termIds.length * 0.5));

    const { newScores } = await updateCurrentLiteracy(userId, {
      scores: { literacy: newLiteracy },
      reason: `Read ${termIds.length} dictionary terms in a session`,
      dictionaryTermsRead: termIds,
    });

    await writeSnapshot(userId, {
      triggerType: 'dictionary_batch',
      triggerDetail: `Read ${termIds.length} terms: ${termIds.slice(0, 3).join(', ')}...`,
      scores: newScores,
      treeStage: current.treeStage,
      archetype: current.archetype,
      delta: { literacy: termIds.length * 0.5 },
    });
    return true;
  }

  return false;
}

// ─── Dictionary starring ──────────────────────────────────────────────
// Backward-compatible: if the user's literacy/current doc has no
// `dictionaryTermsStarred` field, arrayUnion creates it. Reads elsewhere
// should default missing field to an empty array.

export async function recordDictionaryTermsStarred(userId, termId, action) {
  const currentRef = doc(db, 'users', userId, 'literacy', 'current');
  const snap = await getDoc(currentRef);
  if (!snap.exists()) return;

  const op = action === 'remove' ? arrayRemove(termId) : arrayUnion(termId);
  await updateDoc(currentRef, {
    dictionaryTermsStarred: op,
    lastUpdatedAt: serverTimestamp(),
    lastUpdateReason: `${action === 'remove' ? 'Unstarred' : 'Starred'} term: ${termId}`,
  });
}

export async function getDictionaryTermsStarred(userId) {
  const currentRef = doc(db, 'users', userId, 'literacy', 'current');
  const snap = await getDoc(currentRef);
  if (!snap.exists()) return [];
  return snap.data().dictionaryTermsStarred ?? [];
}

export async function recordModuleComplete(userId, moduleId, scoreImpact) {
  const { newScores } = await updateCurrentLiteracy(userId, {
    scores: scoreImpact,
    reason: `Completed module: ${moduleId}`,
    modulesCompleted: [moduleId],
  });

  const current = await getCurrentLiteracy(userId);

  await writeSnapshot(userId, {
    triggerType: 'module_complete',
    triggerDetail: `Completed module: ${moduleId}`,
    scores: newScores,
    treeStage: current.treeStage,
    archetype: current.archetype,
    delta: scoreImpact,
  });
}

export async function recordMilestoneUnlock(userId, milestoneId, literacyIncrement = 2) {
  const current = await getCurrentLiteracy(userId);
  const newLiteracy = Math.min(100, current.scores.literacy + literacyIncrement);

  const { newScores } = await updateCurrentLiteracy(userId, {
    scores: { literacy: newLiteracy },
    reason: `Unlocked milestone: ${milestoneId}`,
    milestonesUnlocked: [milestoneId],
  });

  const majorMilestones = ['ef-three-month', 'debt-down', 'cu-conversation', 'invest-growing', 'mighty-oak'];
  if (majorMilestones.includes(milestoneId)) {
    await writeSnapshot(userId, {
      triggerType: 'milestone_unlock',
      triggerDetail: `Unlocked milestone: ${milestoneId}`,
      scores: newScores,
      treeStage: current.treeStage,
      archetype: current.archetype,
      delta: { literacy: literacyIncrement },
    });
  }
}

export async function getLiteracySnapshots(userId) {
  const ref = collection(db, 'users', userId, 'snapshots');
  const q = query(ref, orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function recordSurveyRetake(userId, payload) {
  const baseline = await getBaselineLiteracy(userId);

  const { newScores } = await updateCurrentLiteracy(userId, {
    scores: payload.scores,
    reason: 'Survey retake',
  });

  const delta = {
    literacy:  Math.round(payload.scores.literacy  - baseline.scores.literacy),
    banking:   Math.round(payload.scores.banking   - baseline.scores.banking),
    credit:    Math.round(payload.scores.credit    - baseline.scores.credit),
    saving:    Math.round(payload.scores.saving    - baseline.scores.saving),
    investing: Math.round(payload.scores.investing - baseline.scores.investing),
  };

  await writeSnapshot(userId, {
    triggerType: 'survey_retake',
    triggerDetail: 'User retook the literacy survey',
    scores: newScores,
    treeStage: payload.treeStage,
    archetype: payload.archetype,
    delta,
  });
}
