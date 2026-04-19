import { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon, { ICONS } from '../components/ui/Icon';
import PlaidLink from '../components/plaid/PlaidLinkButton';
import TreeCanvas from '../components/tree/TreeCanvas';
import TreeStageLabel from '../components/tree/TreeStageLabel';
import PillarCard from '../components/tree/PillarCard';
import MilestoneStrip from '../components/tree/MilestoneStrip';
import InsightPanel from '../components/tree/InsightPanel';
import { useTreeAnimation } from '../hooks/useTreeAnimation';
import api from '../services/api';

const PILLAR_META = [
  { key: 'savings',  name: 'Savings'  },
  { key: 'debt',     name: 'Debt'     },
  { key: 'spending', name: 'Spending' },
  { key: 'literacy', name: 'Literacy' },
];

function buildInsights(pillars, sapling) {
  const ins = [];

  if (pillars.debt.score < 40) {
    ins.push({
      dotColor: '#A32D2D',
      title: 'Your tree is cracking — reduce debt',
      body: `High debt puts visible cracks in your trunk. Your debt-to-income ratio is ${Math.round((pillars.debt.debtToIncomeRatio || 0) * 100)}%. Paying down your highest-rate card would have the fastest impact.`,
      action: 'Open spending analyzer',
      actionRoute: '/analyze',
    });
  }

  if (pillars.savings.score < 35) {
    ins.push({
      dotColor: '#639922',
      title: 'Grow your roots — build savings',
      body: `Your emergency fund covers ${(pillars.savings.emergencyFundMonths || 0).toFixed(1)} months of expenses. Three months is the first major milestone. Even $50/month builds the roots.`,
      action: 'See savings scenarios',
      actionRoute: '/simulate',
    });
  }

  if (pillars.spending.score < 40) {
    ins.push({
      dotColor: '#185FA5',
      title: 'Leaves are falling — control spending',
      body: `You went over budget in ${pillars.spending.monthsOverBudget} of the last 3 months. Your biggest spend is ${pillars.spending.topOverspendCategory}. A focused budget there would stop the leaf drop.`,
      action: 'Analyze my spending',
      actionRoute: '/analyze',
    });
  }

  if (pillars.literacy.score < 50) {
    ins.push({
      dotColor: '#533AB7',
      title: 'Learn to grow your canopy',
      body: `You have completed ${pillars.literacy.modulesCompleted} of ${pillars.literacy.modulesTotal} literacy modules. Each module adds leaves to your tree.`,
      action: 'Open Jargon Decoder',
      actionRoute: '/jargon',
    });
  }

  if (!sapling.hasInvestmentAccount) {
    ins.push({
      dotColor: '#1D9E75',
      title: 'Plant your investment sapling',
      body: 'You have no investment account connected. Opening a 401k or IRA — even with small contributions — plants the sapling beside your tree.',
      action: 'Talk to the coach',
      actionRoute: '/coach',
    });
  }

  if (ins.length === 0) {
    ins.push({
      dotColor: '#27500A',
      title: 'Your tree is thriving',
      body: 'Keep your current habits. Explore investment diversity and advanced financial planning to push toward Mighty Oak status.',
      action: 'Explore scenarios',
      actionRoute: '/simulate',
    });
  }

  return ins.slice(0, 4);
}

const DEMO_DATA = {
  pillars: {
    savings:  { score: 0,  detail: 'Connect your bank to see',    emergencyFundMonths: 0, hasConsistentDeposits: false, monthlyContributionRate: 0, monthsOverBudget: 0, topOverspendCategory: '—', spendingVolatility: 'low', modulesCompleted: 0, modulesTotal: 12, lastActivityDays: 99 },
    debt:     { score: 50, detail: 'No credit data yet',          debtToIncomeRatio: 0, averageAPR: 0, missedPayments: 0, creditUtilization: 0 },
    spending: { score: 50, detail: 'Connect your bank to see',    monthsOverBudget: 0, topOverspendCategory: '—', spendingVolatility: 'low' },
    literacy: { score: 50, detail: 'Literacy tracking coming soon', modulesCompleted: 5, modulesTotal: 12, lastActivityDays: 7 },
  },
  sapling: { score: 0, hasInvestmentAccount: false, contributionConsistency: 0, accountTypes: [], totalInvestedBalance: 0, monthlyContribution: 0, lastContributionDays: 999, detail: 'No investment account' },
  healthScore: 35,
  stageName: 'Connect your bank',
  stageDescription: 'Link your account to see your real financial health tree.',
  unlockedMilestones: [],
};

export default function FinancialWorld() {
  const [healthData, setHealthData] = useState(null);
  const [isConnected, setIsConnected] = useState(null);
  const [openPlaid, setOpenPlaid]     = useState(null);
  const animTime = useTreeAnimation();

  useEffect(() => {
    api.get('/health/tree-data')
      .then(({ data }) => {
        setHealthData(data);
        setIsConnected(true);
      })
      .catch(err => {
        if (err.response?.status === 401) {
          setIsConnected(false);
          setHealthData(DEMO_DATA);
        } else {
          setIsConnected(true);
          setHealthData(DEMO_DATA);
        }
      });
  }, []);

  const data = healthData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PlaidLink onReady={fn => setOpenPlaid(() => fn)} />

      <TopBar
        title="My Financial World"
        subtitle={isConnected ? `Health score: ${data?.healthScore ?? '—'} · ${data?.stageName ?? ''}` : 'Connect your bank to grow your tree'}
        right={
          isConnected === false ? (
            <Button variant="primary" size="sm" onClick={() => openPlaid?.()}>
              <Icon d={ICONS.plus} size={14} /> Connect bank
            </Button>
          ) : null
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px 60px', background: 'var(--ink-0)' }}>

        {/* ── NOT CONNECTED ─────────────────────────────────────────── */}
        {isConnected === false && data && (
          <div style={{ marginBottom: 20 }}>
            <Card style={{
              background: 'linear-gradient(135deg, var(--teal-700) 0%, #0D5C52 100%)',
              border: 'none', padding: '20px 28px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                  Connect your bank to see your real tree
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  This preview uses placeholder scores — your actual data will look different.
                </div>
              </div>
              <Button onClick={() => openPlaid?.()} style={{ background: '#fff', color: 'var(--teal-700)', fontWeight: 700, flexShrink: 0 }}>
                <Icon d={ICONS.lock} size={14} /> Connect via Plaid
              </Button>
            </Card>
          </div>
        )}

        {/* ── LOADING ───────────────────────────────────────────────── */}
        {isConnected === null && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--fg-3)', fontSize: 14 }}>
            Loading your financial world…
          </div>
        )}

        {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
        {data && isConnected !== null && (
          <>
            {/* Header row */}
            <div style={{ marginBottom: 24 }}>
              <TreeStageLabel
                stageName={data.stageName}
                stageDescription={data.stageDescription}
                healthScore={data.healthScore}
              />
            </div>

            {/* Canvas + Pillars */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 24 }}>
              {/* Tree Canvas */}
              <Card style={{ padding: 0, overflow: 'hidden', height: 360, background: 'linear-gradient(180deg, #F0FAF6 0%, #E8F5EF 100%)' }}>
                <TreeCanvas healthData={data} animationTime={animTime} />
              </Card>

              {/* Pillar Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PILLAR_META.map(({ key, name }) => {
                  const p = data.pillars?.[key];
                  if (!p) return null;
                  return (
                    <PillarCard
                      key={key}
                      pillarKey={key}
                      name={name}
                      score={p.score}
                      detail={p.detail}
                    />
                  );
                })}
              </div>
            </div>

            {/* Milestone Strip */}
            <Card style={{ padding: '20px 24px', marginBottom: 20 }}>
              <MilestoneStrip unlockedMilestones={data.unlockedMilestones} />
            </Card>

            {/* Insight Panel */}
            <Card style={{ padding: '20px 24px' }}>
              <InsightPanel insights={buildInsights(data.pillars, data.sapling)} />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
