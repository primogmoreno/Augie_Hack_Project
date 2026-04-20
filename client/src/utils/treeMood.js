// The tree has two axes:
//   1. Growth stage — set by the long-term `healthScore` (treeStages.js)
//   2. Mood overlay — set by the short-term pillar conditions below
//
// A semi-adult tree can still have bare branches during a rough spending
// month while simultaneously blossoming from new investment contributions.
// The four scalars here are read by the rendering layers independently.

function clamp01(n) {
  if (Number.isNaN(n) || n === undefined || n === null) return 0;
  return Math.max(0, Math.min(1, n));
}

export function computeMood(pillars, sapling) {
  const p = pillars || {};
  const s = sapling || {};

  // ── Distress: canopy desaturates, leaves fall
  // Driven mostly by recent spending problems + low savings backstop.
  const monthsOver     = p.spending?.monthsOverBudget ?? 0;
  const volatility     = p.spending?.spendingVolatility ?? 'low';
  const volScore       = volatility === 'high' ? 1 : volatility === 'moderate' ? 0.5 : 0;
  const savingsScore   = p.savings?.score ?? 50;
  const distress = clamp01(
    (monthsOver / 3) * 0.5 +
    volScore * 0.3 +
    (1 - savingsScore / 100) * 0.2,
  );

  // ── Dryness: ground cracks, trunk color shifts warmer
  // Driven by emergency-fund thinness.
  const efMonths = p.savings?.emergencyFundMonths ?? 0;
  const dryness  = clamp01(1 - efMonths / 3);

  // ── Wind agitation: sway amplitude
  // Debt pressure + any missed payments.
  const debtScore = p.debt?.score ?? 100;
  const missed    = p.debt?.missedPayments ?? 0;
  const windAgitation = clamp01(
    0.2 + (debtScore < 40 ? 0.5 : 0) + missed * 0.15,
  );

  // ── Bloom: blossoms overlay
  // Investment consistency is what earns the bloom — can even apply at
  // young stages, so a user getting started with contributions gets
  // visual recognition independent of overall health.
  const hasInvest     = Boolean(s.hasInvestmentAccount);
  const consistency   = s.contributionConsistency ?? 0;
  const saplingScore  = s.score ?? 0;
  const bloom = hasInvest
    ? clamp01(0.35 + saplingScore / 200 + consistency * 0.3)
    : 0;

  return { distress, dryness, windAgitation, bloom };
}

// For the MoodChips row — active overlay labels.
export function moodChips(mood) {
  const out = [];
  if (mood.distress > 0.55) {
    out.push({ label: 'Leaves are falling', tone: 'warn' });
  } else if (mood.distress > 0.3) {
    out.push({ label: 'Gentle breeze', tone: 'neutral' });
  }
  if (mood.dryness > 0.55) {
    out.push({ label: 'Drought', tone: 'warn' });
  } else if (mood.dryness > 0.3) {
    out.push({ label: 'Ground is dry', tone: 'neutral' });
  }
  if (mood.windAgitation > 0.55) {
    out.push({ label: 'Strong winds', tone: 'warn' });
  }
  if (mood.bloom > 0.4) {
    out.push({ label: 'Blossoming', tone: 'good' });
  }
  if (out.length === 0) {
    out.push({ label: 'Calm & clear', tone: 'good' });
  }
  return out;
}
