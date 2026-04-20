export function filterTerms(terms, { activeCat, searchVal }) {
  let result = [...terms];

  if (activeCat && activeCat !== 'all') {
    result = result.filter(t => t.cat === activeCat);
  }

  if (searchVal.trim()) {
    const q = searchVal.toLowerCase();
    result = result.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.preview.toLowerCase().includes(q) ||
      t.definition.toLowerCase().includes(q) ||
      (t.related || []).some(r => String(r).toLowerCase().includes(q)),
    );
  }

  return result;
}

export function sortTerms(terms, sortKey, { readTerms, starred, readAt } = {}) {
  const sorted = [...terms];
  switch (sortKey) {
    case 'alpha':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'milestone':
      return sorted.sort((a, b) => (b.milestone ? 1 : 0) - (a.milestone ? 1 : 0));
    case 'unread':
      return sorted.sort((a, b) =>
        (readTerms?.has(a.id) ? 1 : 0) - (readTerms?.has(b.id) ? 1 : 0));
    case 'personal':
      return sorted.sort((a, b) =>
        (b.hasPersonalData ? 1 : 0) - (a.hasPersonalData ? 1 : 0));
    case 'starred':
      return sorted.sort((a, b) => {
        const sa = starred?.has(a.id) ? 1 : 0;
        const sb = starred?.has(b.id) ? 1 : 0;
        if (sa !== sb) return sb - sa;
        return a.name.localeCompare(b.name);
      });
    case 'recent':
      return sorted.sort((a, b) => {
        const ta = readAt?.get(a.id) ?? 0;
        const tb = readAt?.get(b.id) ?? 0;
        if (ta === tb) return a.name.localeCompare(b.name);
        return tb - ta;
      });
    default:
      return sorted;
  }
}

export function getPersonalContextString(contextData, key) {
  if (!contextData || !key) return null;
  const d = contextData;

  const generators = {
    checking: () => {
      if (!d.checking) return null;
      return `Your ${d.checking.accountName} ···${d.checking.lastFourDigits} had ${d.checking.transactionCount30Days} transactions in the last 30 days with an average balance of $${d.checking.averageBalance.toLocaleString()}.`;
    },
    savings: () => {
      if (!d.savings) return null;
      return `Your savings balance of $${d.savings.balance.toLocaleString()} earns approximately $${d.savings.monthlyInterestCurrent.toFixed(2)}/month at your current rate. In a 4.8% high-yield savings account, that same balance would earn $${d.savings.monthlyInterestHYS.toFixed(2)}/month.`;
    },
    directDeposit: () => {
      if (!d.directDeposit) return null;
      return d.directDeposit.detected
        ? `Recurring deposit of $${d.directDeposit.amount.toLocaleString()} detected every ${d.directDeposit.frequencyDays} days from ${d.directDeposit.sourceName}.`
        : `No consistent direct deposit detected. Setting one up can unlock fee waivers at many institutions.`;
    },
    overdraft: () => {
      if (!d.overdraft) return null;
      return d.overdraft.incidentsLast90Days === 0
        ? `No overdraft incidents detected in your last 90 days. Keep monitoring your balance before large purchases.`
        : `${d.overdraft.incidentsLast90Days} overdraft incident(s) in the last 90 days, costing approximately $${d.overdraft.feesPaidLast90Days} in fees.`;
    },
    balance: () => {
      if (!d.balance) return null;
      return `Checking: $${d.balance.checking.toLocaleString()} · Savings: $${d.balance.savings.toLocaleString()} · Total liquid assets: $${d.balance.totalAssets.toLocaleString()}.`;
    },
    apr: () => {
      if (!d.apr) return null;
      return `Your credit card APR is ${d.apr.userAPR}%. The national credit union average is ${d.apr.creditUnionAverage}%. On your current $${d.apr.userBalance.toLocaleString()} balance, switching to a credit union rate could save you approximately $${d.apr.annualSavingsIfSwitched}/year.`;
    },
    creditScore: () => {
      if (!d.creditScore) return null;
      return d.creditScore.connected
        ? `Your credit score data is connected.`
        : `Credit score tracking requires connecting a credit monitoring account. Your current payment and utilization patterns are influencing your score — tap Ask to understand how.`;
    },
    utilization: () => {
      if (!d.utilization) return null;
      return `Your estimated credit utilization is ${d.utilization.estimatedPercent}% — ${d.utilization.estimatedPercent > 30 ? 'above' : 'within'} the recommended 30% threshold. Paying $${d.utilization.amountToReduce} toward your balance would bring you to 30%.`;
    },
    minPayment: () => {
      if (!d.minPayment) return null;
      return `Your estimated minimum payment is ~$${d.minPayment.estimatedMinimum}/month. At that rate, payoff takes ${d.minPayment.monthsAtMin} months. Paying $${d.minPayment.suggestedPayment}/month instead pays it off in ${d.minPayment.monthsAtSuggested} months and saves ~$${d.minPayment.interestSavedAtSuggested} in interest.`;
    },
    debtToIncome: () => {
      if (!d.debtToIncome) return null;
      return `Your estimated debt-to-income ratio is ${d.debtToIncome.ratioPercent}% — ${d.debtToIncome.ratioPercent < 36 ? 'below' : 'above'} the 36% recommended maximum.`;
    },
    emergencyFund: () => {
      if (!d.emergencyFund) return null;
      return `Your essential expenses run ~$${d.emergencyFund.monthlyEssentials.toLocaleString()}/month. Your target is $${d.emergencyFund.targetMin.toLocaleString()}–$${d.emergencyFund.targetMax.toLocaleString()}. Current savings covers approximately ${d.emergencyFund.monthsEstimate} months — you are $${d.emergencyFund.gapToTarget.toLocaleString()} from the first major milestone.`;
    },
    spending: () => {
      if (!d.spending) return null;
      return `Based on your transactions: needs ~${d.spending.needsPercent}%, wants ~${d.spending.wantsPercent}%, savings ~${d.spending.savingsPercent}%. Your wants category is ${d.spending.wantsPercent - 30} points above the 50/30/20 guideline — driven largely by ${d.spending.topOverCategory}.`;
    },
    savingsRate: () => {
      if (!d.savingsRate) return null;
      return `Your current savings rate is ~${d.savingsRate.userRate}%. The national average is ${d.savingsRate.nationalAverage}% and the recommended minimum is ${d.savingsRate.recommendedMin}%.`;
    },
    netWorth: () => {
      if (!d.netWorth) return null;
      return `Assets: $${d.netWorth.totalAssets.toLocaleString()} · Liabilities: $${d.netWorth.totalLiabilities.toLocaleString()} · Estimated net worth: $${d.netWorth.netWorth.toLocaleString()}.`;
    },
    income: () => {
      if (!d.income) return null;
      return `At your estimated annual income of $${d.income.estimatedAnnual.toLocaleString()}, you are likely in the ${d.income.likelyBracket} federal tax bracket. Your estimated effective rate is ${d.income.effectiveRateEstimate}.`;
    },
    retirement401k: () => {
      if (!d.retirement401k) return null;
      return d.retirement401k.connected
        ? `Your 401k is connected. View your contribution rate and employer match in the investment summary.`
        : `No 401k account detected. If your employer offers a match and you are not contributing, you are leaving an immediate 100% return on that portion of your income on the table.`;
    },
  };

  return generators[key] ? generators[key]() : null;
}
