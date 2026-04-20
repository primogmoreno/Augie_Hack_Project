import { useState, useEffect, useMemo } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Icon, { ICONS } from '../components/ui/Icon';
import PlaidLink from '../components/plaid/PlaidLinkButton';
import TopBar from '../components/layout/TopBar';
import TreeSVG from '../components/tree/TreeSVG';
import InvestmentSapling from '../components/tree/InvestmentSapling';
import HealthScoreRing from '../components/tree/HealthScoreRing';
import MoodChips from '../components/tree/MoodChips';
import MilestoneStrip from '../components/tree/MilestoneStrip';
import RecognitionsCard, { buildRecognitions } from '../components/world/RecognitionsCard';
import WarningsCard, { buildWarnings } from '../components/world/WarningsCard';
import LiteracyVisualization from '../components/literacy/LiteracyVisualization';
import { useTreeAnimation } from '../hooks/useTreeAnimation';
import { getStageForScore } from '../utils/treeStages';
import { computeMood } from '../utils/treeMood';
import api from '../services/api';

const PILLAR_META = [
  { key: 'savings',  name: 'Savings'  },
  { key: 'debt',     name: 'Debt'     },
  { key: 'spending', name: 'Spending' },
  { key: 'literacy', name: 'Literacy' },
];

const DEMO_DATA = {
  pillars: {
    savings:  { score: 0,  detail: 'Connect your bank to see', emergencyFundMonths: 0, hasConsistentDeposits: false, monthlyContributionRate: 0 },
    debt:     { score: 50, detail: 'No credit data yet', debtToIncomeRatio: 0, averageAPR: 0, missedPayments: 0, creditUtilization: 0 },
    spending: { score: 50, detail: 'Connect your bank to see', monthsOverBudget: 0, topOverspendCategory: '—', spendingVolatility: 'low' },
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
  const healthScore = data?.healthScore ?? 0;

  // Override backend's 8-stage name with the new 12-stage frontend taxonomy.
  const stage = useMemo(() => getStageForScore(healthScore), [healthScore]);
  const mood = useMemo(
    () => (data ? computeMood(data.pillars, data.sapling) : null),
    [data],
  );
  const recognitions = useMemo(
    () => (data ? buildRecognitions(data.pillars, data.sapling) : []),
    [data],
  );
  const warnings = useMemo(
    () => (data ? buildWarnings(data.pillars, data.sapling) : []),
    [data],
  );

  // When not connected we show the DEMO_DATA but with the backend's
  // placeholder "Connect your bank" label.
  const showingDemo = isConnected === false;
  const displayStageName = showingDemo ? 'Awaiting your first seed' : stage.name;
  const displayStageDescription = showingDemo
    ? 'Link your account to see your real financial tree begin to grow.'
    : stage.description;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PlaidLink onReady={fn => setOpenPlaid(() => fn)} redirectTo="/world" />

      <TopBar
        title="My Financial World"
        subtitle={isConnected
          ? `Score ${Math.round(healthScore)} · ${displayStageName}`
          : 'Connect your bank to grow your tree'}
        right={isConnected === false ? (
          <Button variant="primary" size="sm" onClick={() => openPlaid?.()}>
            <Icon d={ICONS.plus} size={14} /> Connect bank
          </Button>
        ) : null}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px', background: 'var(--bg-page)' }}>

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

        {isConnected === null && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--fg-3)', fontSize: 14 }}>
            Loading your financial world…
          </div>
        )}

        {data && isConnected !== null && (
          <div style={{ animation: 'fadeIn var(--dur-slow) var(--ease-out)' }}>

            {/* Hero header */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 56, color: 'var(--primary)',
                letterSpacing: '-0.02em', lineHeight: 1, margin: '0 0 12px',
              }}>
                My Financial World
              </h2>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: 16,
                color: 'var(--fg-2)', maxWidth: 620, lineHeight: 1.65, margin: 0,
              }}>
                A living portrait of your financial health — the stage shows
                long-term growth, while the weather reflects how the last few
                months have treated you.
              </p>
            </div>

            {/* Score + stage + mood chips */}
            <div style={{
              display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 24,
              alignItems: 'center', marginBottom: 24,
              borderBottom: '1px solid var(--border-1)', paddingBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <HealthScoreRing score={Math.round(healthScore)} size={80} />
                <div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.3em', color: 'var(--accent)', marginBottom: 8,
                  }}>
                    Current Stage
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: 34, color: 'var(--primary)', lineHeight: 1.1, marginBottom: 6,
                  }}>
                    {displayStageName}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5 }}>
                    {displayStageDescription}
                  </div>
                </div>
              </div>

              <div>
                <MoodChips mood={mood} />
              </div>
            </div>

            {/* Tree + insights grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '3fr 2fr',
              gap: 20, marginBottom: 28,
            }}>
              <Card style={{
                padding: 0, overflow: 'hidden',
                height: 520,
                background: 'linear-gradient(180deg, #f7f2e6 0%, #ecece0 100%)',
                position: 'relative',
              }}>
                <TreeSVG
                  healthScore={healthScore}
                  mood={mood}
                  animTime={animTime}
                  label={`Financial tree at ${displayStageName}, score ${Math.round(healthScore)} out of 100.`}
                />

                {/* Investment sapling — floated bottom-right */}
                <div style={{
                  position: 'absolute', right: 16, bottom: 16,
                  width: 120, height: 120,
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 6,
                  backdropFilter: 'blur(4px)',
                }}>
                  <InvestmentSapling
                    score={data.sapling?.score ?? 0}
                    hasInvestmentAccount={data.sapling?.hasInvestmentAccount ?? false}
                    contributionConsistency={data.sapling?.contributionConsistency ?? 0}
                  />
                  <div style={{
                    position: 'absolute', left: 0, right: 0, top: 4,
                    textAlign: 'center', fontSize: 9, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.2em',
                    color: 'var(--accent)',
                  }}>
                    Investments
                  </div>
                </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <RecognitionsCard recognitions={recognitions} />
                <WarningsCard warnings={warnings} />
              </div>
            </div>

            {/* Pillar stat row */}
            <Card style={{ padding: '20px 24px', marginBottom: 20 }}>
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
                      <div style={{
                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 4,
                      }}>
                        {name}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 30,
                        color, lineHeight: 1,
                      }}>
                        {Math.round(score)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>/100</div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card style={{ padding: '20px 24px', marginBottom: 20 }}>
              <MilestoneStrip unlockedMilestones={data.unlockedMilestones} />
            </Card>

            <Card style={{ padding: '20px 24px' }}>
              <LiteracyVisualization />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
