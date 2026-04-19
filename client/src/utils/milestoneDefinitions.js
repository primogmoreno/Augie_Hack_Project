export const MILESTONES = [
  { id: 'first-deposit',   name: 'First deposit',        description: 'Made your first tracked saving',           icon: '🪴', backgroundColor: '#E6F1FB', textColor: '#0C447C', requiredScore: 5,  trigger: 'savings.emergencyFundMonths > 0',               treeEffect: 'Grows first root'           },
  { id: 'budget-set',      name: 'Budget builder',       description: 'Set up a monthly spending budget',         icon: '📊', backgroundColor: '#EAF3DE', textColor: '#27500A', requiredScore: 20, trigger: 'literacy.modulesCompleted >= 1',                treeEffect: 'First leaves appear'        },
  { id: 'debt-aware',      name: 'Debt aware',           description: 'Understand your debt-to-income ratio',     icon: '📉', backgroundColor: '#FAEEDA', textColor: '#854F0B', requiredScore: 25, trigger: 'debt.debtToIncomeRatio acknowledged in app',    treeEffect: 'Trunk strengthens'          },
  { id: 'ef-one-month',    name: 'One month saved',      description: 'Emergency fund covers 1 month',            icon: '🏡', backgroundColor: '#EEEDFE', textColor: '#3C3489', requiredScore: 35, trigger: 'savings.emergencyFundMonths >= 1',               treeEffect: 'Roots spread'               },
  { id: 'sapling-planted', name: 'Sapling planted',      description: 'Opened your first investment account',     icon: '🌱', backgroundColor: '#E1F5EE', textColor: '#085041', requiredScore: 0,  trigger: 'sapling.hasInvestmentAccount === true',          treeEffect: 'Investment sapling appears' },
  { id: 'rate-reader',     name: 'Rate reader',          description: 'Learned how APR works',                    icon: '📖', backgroundColor: '#E6F1FB', textColor: '#0C447C', requiredScore: 40, trigger: 'jargon decoder used for APR',                   treeEffect: 'Canopy fills out'           },
  { id: 'consistent-3mo',  name: 'Consistent saver',     description: 'Saved consistently for 3 months',          icon: '🌿', backgroundColor: '#EAF3DE', textColor: '#27500A', requiredScore: 50, trigger: 'savings.hasConsistentDeposits for 3+ months',   treeEffect: 'Fruit begins to appear'     },
  { id: 'ef-three-month',  name: 'Three months saved',   description: 'Emergency fund covers 3 months',           icon: '🦺', backgroundColor: '#E6F1FB', textColor: '#0C447C', requiredScore: 60, trigger: 'savings.emergencyFundMonths >= 3',               treeEffect: 'Tree grows taller'          },
  { id: 'debt-down',       name: 'Debt reducer',         description: 'Reduced total debt balance by 10%',        icon: '📈', backgroundColor: '#FAEEDA', textColor: '#854F0B', requiredScore: 65, trigger: 'debt balance 10% lower than 90 days ago',       treeEffect: 'Cracks on trunk heal'       },
  { id: 'cu-conversation', name: 'Rate negotiator',      description: 'Prepared to talk to your credit union',    icon: '🤝', backgroundColor: '#EEEDFE', textColor: '#3C3489', requiredScore: 70, trigger: 'Talk to a Banker chatbot used',                  treeEffect: 'Birds arrive'               },
  { id: 'invest-growing',  name: 'Investment growing',   description: 'Sapling contributing consistently',        icon: '🌳', backgroundColor: '#E1F5EE', textColor: '#085041', requiredScore: 0,  trigger: 'sapling.contributionConsistency >= 0.7',         treeEffect: 'Sapling branches appear'    },
  { id: 'financial-plan',  name: 'Financial planner',    description: 'Built a 12-month plan',                    icon: '🗺', backgroundColor: '#EAF3DE', textColor: '#173404', requiredScore: 85, trigger: 'scenario tool used with 12-month projection',   treeEffect: 'Sparkles appear'            },
  { id: 'mighty-oak',      name: 'Mighty oak',           description: 'Reached the highest financial stage',      icon: '🏆', backgroundColor: '#FAEEDA', textColor: '#412402', requiredScore: 93, trigger: 'healthScore >= 93',                              treeEffect: 'Full bloom — the tree is complete' },
];

export function getUnlockedMilestones(pillars, sapling, healthScore) {
  const unlocked = [];
  if ((pillars?.savings?.emergencyFundMonths || 0) > 0)           unlocked.push('first-deposit');
  if ((pillars?.literacy?.modulesCompleted || 0) >= 1)            unlocked.push('budget-set');
  if (healthScore >= 25)                                           unlocked.push('debt-aware');
  if ((pillars?.savings?.emergencyFundMonths || 0) >= 1)          unlocked.push('ef-one-month');
  if (sapling?.hasInvestmentAccount)                               unlocked.push('sapling-planted');
  if (healthScore >= 40)                                           unlocked.push('rate-reader');
  if (pillars?.savings?.hasConsistentDeposits && healthScore >= 50) unlocked.push('consistent-3mo');
  if ((pillars?.savings?.emergencyFundMonths || 0) >= 3)          unlocked.push('ef-three-month');
  if (healthScore >= 65)                                           unlocked.push('debt-down');
  if (healthScore >= 70)                                           unlocked.push('cu-conversation');
  if ((sapling?.contributionConsistency || 0) >= 0.7)             unlocked.push('invest-growing');
  if (healthScore >= 85)                                           unlocked.push('financial-plan');
  if (healthScore >= 93)                                           unlocked.push('mighty-oak');
  return unlocked;
}
