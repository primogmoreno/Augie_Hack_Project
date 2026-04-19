export function computeHealthScore(pillars) {
  return Math.round(
    pillars.savings.score  * 0.30 +
    pillars.debt.score     * 0.25 +
    pillars.spending.score * 0.25 +
    pillars.literacy.score * 0.20
  );
}

export function computeSavingsScore(data) {
  let score = 0;
  score += Math.min(50, (data.emergencyFundMonths || 0) * (50 / 6));
  score += data.hasConsistentDeposits ? 30 : 0;
  score += Math.min(20, (data.monthlyContributionRate || 0));
  return Math.round(Math.min(100, score));
}

export function computeDebtScore(data) {
  let score = 100;
  score -= Math.min(40, (data.debtToIncomeRatio || 0) * 125);
  score -= Math.min(25, (data.creditUtilization || 0) * 62.5);
  score -= Math.min(20, (data.missedPayments || 0) * 10);
  if ((data.averageAPR || 0) > 20) score -= Math.min(15, (data.averageAPR - 20) * 1.5);
  return Math.round(Math.max(0, score));
}

export function computeSpendingScore(data) {
  let score = 100;
  score -= Math.min(60, (data.monthsOverBudget || 0) * 20);
  if (data.spendingVolatility === 'high')     score -= 20;
  if (data.spendingVolatility === 'moderate') score -= 10;
  return Math.round(Math.max(0, score));
}

export function computeLiteracyScore(data) {
  let score = 0;
  const total = data.modulesTotal || 12;
  score += ((data.modulesCompleted || 0) / total) * 70;
  if ((data.lastActivityDays || 999) <= 7)       score += 30;
  else if ((data.lastActivityDays || 999) <= 14)  score += 15;
  else if ((data.lastActivityDays || 999) <= 30)  score += 5;
  return Math.round(Math.min(100, score));
}

export function computeSaplingScore(data) {
  if (!data.hasInvestmentAccount) return 0;
  let score = 20;
  score += (data.contributionConsistency || 0) * 35;
  const monthly = data.monthlyIncome > 0
    ? Math.min(30, (data.monthlyContribution / data.monthlyIncome) * 300)
    : 0;
  score += monthly;
  score += Math.min(15, (data.accountTypes || []).length * 7);
  return Math.round(Math.min(100, score));
}

export function scoreColor(score) {
  if (score < 30) return '#A32D2D';
  if (score < 55) return '#BA7517';
  if (score < 75) return '#639922';
  return '#1D9E75';
}
