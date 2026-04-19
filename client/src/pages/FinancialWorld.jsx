import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon, { ICONS } from '../components/ui/Icon';
import PlaidLink from '../components/plaid/PlaidLinkButton';
import TreeCanvas from '../components/tree/TreeCanvas';
import HealthScoreRing from '../components/tree/HealthScoreRing';
import MilestoneStrip from '../components/tree/MilestoneStrip';
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
      title: 'Your tree is cracking — reduce debt',
      body: `High debt puts visible cracks in your trunk. Your debt-to-income ratio is ${Math.round((pillars.debt.debtToIncomeRatio || 0) * 100)}%. Paying down your highest-rate card would have the fastest impact.`,
      action: 'Open spending analyzer',
      actionRoute: '/analyze',
    });
  }

  if (pillars.savings.score < 35) {
    ins.push({
      title: 'Grow your roots — build savings',
      body: `Your emergency fund covers ${(pillars.savings.emergencyFundMonths || 0).toFixed(1)} months of expenses. Three months is the first major milestone. Even $50/month builds the roots.`,
      action: 'See savings scenarios',
      actionRoute: '/simulate',
    });
  }

  if (pillars.spending.score < 40) {
    ins.push({
      title: 'Leaves are falling — control spending',
      body: `You went over budget in ${pillars.spending.monthsOverBudget} of the last 3 months. Your biggest spend is ${pillars.spending.topOverspendCategory}. A focused budget there would stop the leaf drop.`,
      action: 'Analyze my spending',
      actionRoute: '/analyze',
    });
  }

  if (pillars.literacy.score < 50) {
    ins.push({
      title: 'Learn to grow your canopy',
      body: `You have completed ${pillars.literacy.modulesCompleted} of ${pillars.literacy.modulesTotal} literacy modules. Each module adds leaves to your tree.`,
      action: 'Open Jargon Decoder',
      actionRoute: '/jargon',
    });
  }

  if (!sapling.hasInvestmentAccount) {
    ins.push({
      title: 'Plant your investment sapling',
      body: 'You have no investment account connected. Opening a 401k or IRA — even with small contributions — plants the sapling beside your tree.',
      action: 'Talk to the coach',
      actionRoute: '/coach',
    });
  }

  if (ins.length === 0) {
    ins.push({
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
  const navigate = useNavigate();

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
      <PlaidLink onReady={fn => setOpenPlaid(() => fn)} redirectTo="/world" />

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

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px', background: 'var(--bg-page)' }}>

        {/* ── NOT CONNECTED ─────────────────────────────────────────── */}
        {isConnected === false && data && (
          <div style={{ marginBottom: 32 }}>
            <Card style={{
              background: 'var(--primary)', border: 'none',
              padding: '24px 32px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                  Connect your bank to see your real tree
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  This preview uses placeholder scores — your actual data will look different.
                </div>
              </div>
              <Button onClick={() => openPlaid?.()} style={{ background: 'var(--fg-inverse)', color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>
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
          <div style={{ animation: 'fadeIn var(--dur-slow) var(--ease-out)' }}>

            {/* Hero header */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 56, color: 'var(--primary)', letterSpacing: '-0.02em', lineHeight: 1, margin: '0 0 12px' }}>
                My Financial World
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--fg-2)', maxWidth: 560, lineHeight: 1.65, margin: 0 }}>
                A living portrait of your financial health — shaped by your habits, goals, and growth over time.
              </p>
            </div>

            {/* Stage + Pillar stat row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 24,
              alignItems: 'center', marginBottom: 36,
              borderBottom: '1px solid var(--border-1)', paddingBottom: 32,
            }}>
              {/* Stage + health ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <HealthScoreRing score={data.healthScore} size={80} />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'var(--accent)', marginBottom: 8 }}>
                    Current Stage
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 34, color: 'var(--primary)', lineHeight: 1.1, marginBottom: 6 }}>
                    {data.stageName}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5 }}>
                    {data.stageDescription}
                  </div>
                </div>
              </div>

              {/* Pillar scores with border separators */}
              <div style={{ display: 'flex' }}>
                {PILLAR_META.map(({ key, name }, i) => {
                  const p = data.pillars?.[key];
                  const score = p?.score ?? 0;
                  const color = score >= 60 ? 'var(--success)' : score >= 35 ? 'var(--primary)' : 'var(--danger)';
                  return (
                    <div key={key} style={{
                      flex: 1, paddingLeft: i > 0 ? 20 : 0,
                      borderLeft: i > 0 ? '1px solid var(--border-1)' : 'none',
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 4 }}>
                        {name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color, lineHeight: 1 }}>
                        {score}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>/100</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tree canvas + Insights dark card */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 24 }}>

              {/* Tree */}
              <Card style={{ padding: 0, overflow: 'hidden', height: 420, background: 'var(--surface-low)' }}>
                <TreeCanvas healthData={data} animationTime={animTime} />
              </Card>

              {/* Insights dark card */}
              <div style={{
                background: 'var(--primary)', borderRadius: 'var(--radius-xl)',
                padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20,
                overflowY: 'auto',
              }}>
                <div>
                  <div style={{ fontSize: 22, color: 'rgba(255,179,157,0.8)', marginBottom: 10 }}>✦</div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--fg-inverse)', lineHeight: 1.3, margin: 0 }}>
                    What your tree needs next
                  </h4>
                </div>
                {buildInsights(data.pillars, data.sapling).map((ins, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,179,157,0.8)', flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-inverse)', marginBottom: 4 }}>
                        {ins.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(176,205,187,0.9)', lineHeight: 1.6, marginBottom: 8 }}>
                        {ins.body}
                      </div>
                      <button
                        onClick={() => navigate(ins.actionRoute)}
                        style={{
                          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em',
                          color: 'rgba(250,249,245,0.7)', background: 'none', border: 'none',
                          borderBottom: '1px solid rgba(255,179,157,0.4)', paddingBottom: 2,
                          cursor: 'pointer', fontFamily: 'var(--font-sans)',
                        }}
                      >
                        {ins.action} →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestone strip */}
            <Card style={{ padding: '20px 24px' }}>
              <MilestoneStrip unlockedMilestones={data.unlockedMilestones} />
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}
