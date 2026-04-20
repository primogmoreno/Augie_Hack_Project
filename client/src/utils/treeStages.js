// 12-stage growth taxonomy. Stage is driven by healthScore (0-100).
// Each stage supplies the inputs for the parametric geometry generators
// in client/src/components/tree/treeGeometry.js.
//
// `growth` is a 0..1 scalar inside the stage used for fine interpolation.
// The frontend continuously interpolates between adjacent stages; these
// parameters are the anchor points.

export const TREE_STAGES = [
  {
    id: 'barren', name: 'Bare Ground', minScore: 0, maxScore: 9,
    description: 'Your financial journey has not started yet. Plant the first seed.',
    params: {
      seedVisible: true,
      trunkHeight: 0, trunkWidth: 0, trunkBend: 0,
      canopyRadius: 0, canopyBlobs: 0,
      branchCount: 0, rootCount: 0, rootSpread: 0,
      leafDensity: 0, trunkColor: '#8b7a5c',
    },
  },
  {
    id: 'seed', name: 'First Seed', minScore: 10, maxScore: 19,
    description: 'A seed has been planted. Small habits are beginning to take root.',
    params: {
      seedVisible: true, sprout: 0.1,
      trunkHeight: 8, trunkWidth: 3, trunkBend: 0.05,
      canopyRadius: 0, canopyBlobs: 0,
      branchCount: 0, rootCount: 1, rootSpread: 10,
      leafDensity: 0, trunkColor: '#a89265',
    },
  },
  {
    id: 'seedling', name: 'Seedling', minScore: 20, maxScore: 29,
    description: 'Two small cotyledons have emerged. Fragile but alive.',
    params: {
      sprout: 0.4,
      trunkHeight: 22, trunkWidth: 3.5, trunkBend: 0.1,
      canopyRadius: 10, canopyBlobs: 2,
      branchCount: 0, rootCount: 2, rootSpread: 18,
      leafDensity: 0.25, trunkColor: '#9fa86b',
    },
  },
  {
    id: 'sprout', name: 'Sprout', minScore: 30, maxScore: 39,
    description: 'A proper stem, four or five true leaves. The shape of a tree.',
    params: {
      sprout: 0.75,
      trunkHeight: 42, trunkWidth: 4.5, trunkBend: 0.08,
      canopyRadius: 18, canopyBlobs: 2,
      branchCount: 0, rootCount: 2, rootSpread: 24,
      leafDensity: 0.45, trunkColor: '#8f9e58',
    },
  },
  {
    id: 'sapling', name: 'Sapling', minScore: 40, maxScore: 49,
    description: 'A thin, steady trunk with the first real branches.',
    params: {
      trunkHeight: 72, trunkWidth: 6.5, trunkBend: 0.07,
      canopyRadius: 28, canopyBlobs: 3,
      branchCount: 2, rootCount: 3, rootSpread: 32,
      leafDensity: 0.55, trunkColor: '#7d8b55',
    },
  },
  {
    id: 'young', name: 'Young Tree', minScore: 50, maxScore: 59,
    description: 'Defined branches, a sparse but growing canopy.',
    params: {
      trunkHeight: 108, trunkWidth: 9, trunkBend: 0.05,
      canopyRadius: 40, canopyBlobs: 3,
      branchCount: 3, rootCount: 3, rootSpread: 42,
      leafDensity: 0.68, trunkColor: '#6e7a48',
    },
  },
  {
    id: 'growing', name: 'Growing Tree', minScore: 60, maxScore: 68,
    description: 'A full young canopy. Your foundation is taking shape.',
    params: {
      trunkHeight: 140, trunkWidth: 11, trunkBend: 0.04,
      canopyRadius: 52, canopyBlobs: 4,
      branchCount: 4, rootCount: 4, rootSpread: 52,
      leafDensity: 0.8, trunkColor: '#5d6840',
    },
  },
  {
    id: 'blossoming', name: 'Blossoming Tree', minScore: 69, maxScore: 76,
    description: 'Canopy in full bloom — your habits are compounding visibly.',
    params: {
      trunkHeight: 168, trunkWidth: 13, trunkBend: 0.035,
      canopyRadius: 62, canopyBlobs: 5,
      branchCount: 4, rootCount: 4, rootSpread: 60,
      leafDensity: 0.9, trunkColor: '#505a3a', hasBloom: 0.6,
    },
  },
  {
    id: 'semi-adult', name: 'Semi-Adult Tree', minScore: 77, maxScore: 83,
    description: 'Taller trunk, the first bark texture, a broader canopy.',
    params: {
      trunkHeight: 196, trunkWidth: 16, trunkBend: 0.03,
      canopyRadius: 74, canopyBlobs: 5,
      branchCount: 5, rootCount: 5, rootSpread: 72,
      leafDensity: 0.95, trunkColor: '#4a5030', barkTexture: 0.4,
    },
  },
  {
    id: 'adult', name: 'Adult Tree', minScore: 84, maxScore: 89,
    description: 'A wide, mature canopy. Your money is working for you.',
    params: {
      trunkHeight: 222, trunkWidth: 19, trunkBend: 0.025,
      canopyRadius: 86, canopyBlobs: 6,
      branchCount: 5, rootCount: 5, rootSpread: 82,
      leafDensity: 1.0, trunkColor: '#433f28', barkTexture: 0.7,
    },
  },
  {
    id: 'thriving', name: 'Thriving Tree', minScore: 90, maxScore: 95,
    description: 'Lush, fruiting. Financial confidence near its peak.',
    params: {
      trunkHeight: 246, trunkWidth: 22, trunkBend: 0.02,
      canopyRadius: 98, canopyBlobs: 6,
      branchCount: 6, rootCount: 6, rootSpread: 92,
      leafDensity: 1.0, trunkColor: '#3b3822', barkTexture: 0.9,
      hasFruit: 0.8,
    },
  },
  {
    id: 'mighty', name: 'Mighty Oak', minScore: 96, maxScore: 100,
    description: 'Financial mastery. Your tree stands tall and endures every season.',
    params: {
      trunkHeight: 270, trunkWidth: 26, trunkBend: 0.015,
      canopyRadius: 112, canopyBlobs: 7,
      branchCount: 6, rootCount: 7, rootSpread: 105,
      leafDensity: 1.0, trunkColor: '#32301e', barkTexture: 1.0,
      hasFruit: 1.0,
    },
  },
];

// Clamp a score to its stage + return neighbors and a fractional interpolation t.
export function getStageForScore(score) {
  const s = Math.max(0, Math.min(100, score ?? 0));
  return TREE_STAGES.filter(x => s >= x.minScore).pop() || TREE_STAGES[0];
}

// Returns { from, to, t } — two stages to interpolate between and a 0..1 t.
// Uses the mid-points of each stage range so motion is smooth.
export function getStagePair(score) {
  const s = Math.max(0, Math.min(100, score ?? 0));
  const anchors = TREE_STAGES.map(stage => ({
    stage,
    anchor: (stage.minScore + stage.maxScore) / 2,
  }));

  if (s <= anchors[0].anchor) {
    return { from: anchors[0].stage, to: anchors[0].stage, t: 0 };
  }
  if (s >= anchors[anchors.length - 1].anchor) {
    const last = anchors[anchors.length - 1].stage;
    return { from: last, to: last, t: 0 };
  }

  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i], b = anchors[i + 1];
    if (s >= a.anchor && s <= b.anchor) {
      const t = (s - a.anchor) / (b.anchor - a.anchor);
      return { from: a.stage, to: b.stage, t };
    }
  }
  return { from: anchors[0].stage, to: anchors[0].stage, t: 0 };
}

// Linear interpolation between two stage param objects.
export function interpolateParams(from, to, t) {
  const out = {};
  const keys = new Set([...Object.keys(from), ...Object.keys(to)]);
  for (const k of keys) {
    const a = from[k], b = to[k];
    if (typeof a === 'number' && typeof b === 'number') {
      out[k] = a + (b - a) * t;
    } else if (typeof a === 'string' && typeof b === 'string' && /^#[0-9a-f]{6}$/i.test(a)) {
      out[k] = lerpColor(a, b, t);
    } else {
      out[k] = t < 0.5 ? (a ?? b) : (b ?? a);
    }
  }
  return out;
}

function lerpColor(a, b, t) {
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}
