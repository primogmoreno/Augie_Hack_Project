import { useState, useCallback } from 'react';
import TopBar from '../components/layout/TopBar';
import Card from '../components/ui/Card';
import Icon, { ICONS } from '../components/ui/Icon';
import api from '../services/api';

const ADVANCE_YEARS = 2;

const LIFE_EVENTS = {
  jobLoss:         { weight: 0.15, name: 'Job Loss',           emoji: '📉', description: 'You lost your job, leading to a significant drop in income.',           condition: s => s.hasJob && s.jobStability < 0.5 },
  promotion:       { weight: 0.05, name: 'Promotion',          emoji: '🚀', description: 'You earned a promotion, boosting your income.',                          condition: s => s.jobStability > 0.7 && s.age < 60 && s.hasJob },
  medicalExpense:  { weight: 0.10, name: 'Medical Expense',    emoji: '🏥', description: 'An unexpected medical bill drew down your savings.',                      condition: s => s.age > 40 },
  inheritance:     { weight: 0.02, name: 'Inheritance',        emoji: '🏛️', description: 'A relative left you an inheritance, growing your wealth.',               condition: s => s.age > 50 },
  child:           { weight: 0.10, name: 'New Child',          emoji: '👶', description: 'You welcomed a child — joy and extra expenses ahead.',                    condition: s => s.age > 25 && s.age < 45 && s.relationshipStatus === 'married' },
  deathInFamily:   { weight: 0.10, name: 'Death in Family',   emoji: '🕯️', description: 'A family member passed, causing emotional and financial strain.',         condition: () => true },
  weatherDisaster: { weight: 0.08, name: 'Weather Disaster',  emoji: '🌪️', description: 'A natural disaster damaged your property and drained savings.',           condition: () => true },
  lotteryWin:      { weight: 0.01, name: 'Lottery Win',       emoji: '🎰', description: 'You hit the jackpot — your cash surges by $1 000 000!',                  condition: () => true },
  newHouse:        { weight: 0.05, name: 'New House',         emoji: '🏠', description: 'You bought a house. A big purchase, but a solid asset.',                  condition: s => s.age > 30 && s.age < 50 },
  businessSuccess: { weight: 0.02, name: 'Business Boom',     emoji: '📈', description: "Your business took off, significantly increasing your wealth.",           condition: s => s.hasBusiness },
  businessFailure: { weight: 0.02, name: 'Business Failure',  emoji: '💸', description: 'Your business venture failed, causing major financial losses.',           condition: s => s.hasBusiness },
  newCar:          { weight: 0.05, name: 'New Car',           emoji: '🚗', description: 'You bought a new car — useful, but costly.',                              condition: s => s.age > 25 && s.age < 65 },
  healthDecline:   { weight: 0.05, name: 'Health Decline',   emoji: '💊', description: 'Your health declined, raising medical costs and lowering productivity.',  condition: s => s.age > 40 },
  retirement:      { weight: 0.10, name: 'Retirement',        emoji: '🌅', description: 'You have entered retirement — income drops but a new chapter begins.',    condition: s => s.age > 60 },
  noMajorEvent:    { weight: 0.60, name: null, emoji: null, description: null, condition: () => true },
};

const USER_ACTIONS = [
  { id: 'investMoney',   label: 'Invest $10k',     emoji: '📊', description: 'Move $10 000 from cash into investments.' },
  { id: 'startBusiness', label: 'Start Business',  emoji: '🏢', description: 'Spend $20 000 to launch a business venture.' },
  { id: 'newJob',        label: 'Find New Job',    emoji: '💼', description: 'Land a new job and boost income by 20%.' },
  { id: 'married',       label: 'Get Married',     emoji: '💍', description: 'Tie the knot — gain $20 000 combined finances.' },
  { id: 'divorce',       label: 'Divorce',         emoji: '📋', description: 'Split assets; cash is cut in half.' },
  { id: 'newCar',        label: 'Buy a Car',       emoji: '🚗', description: 'Purchase a new car for $30 000.' },
  { id: 'newHouse',      label: 'Buy a House',     emoji: '🏠', description: 'Put down $50 000 on a new home.' },
];

const DEFAULT_ECONOMY = { inflationRate: 0.02, marketReturn: 0.05, recession: false };

function defaultUser(form) {
  return {
    age:                Number(form.age),
    cash:               Number(form.cash),
    income:             Number(form.income),
    expenses:           Number(form.expenses),
    investments:        Number(form.investments),
    jobStability:       0.8,
    relationshipStatus: 'single',
    hasJob:             true,
    kids:               0,
    hasBusiness:        false,
  };
}

function pickRandomEvent(userState) {
  const valid = Object.entries(LIFE_EVENTS).filter(([, e]) => !e.condition || e.condition(userState));
  const total = valid.reduce((s, [, e]) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const [id, e] of valid) {
    if (r < e.weight) return { id, ...e };
    r -= e.weight;
  }
  return null;
}

function applyEvent(id, state) {
  const s = { ...state };
  switch (id) {
    case 'jobLoss':         s.hasJob = false;  s.income *= 0.05; break;
    case 'promotion':       s.income *= 1.3; break;
    case 'newJob':          s.hasJob = true;   s.income *= 1.2; break;
    case 'medicalExpense':  s.cash  -= s.cash  * 0.7; break;
    case 'inheritance':     s.cash  += s.cash  * 0.5; break;
    case 'child':           s.expenses += 5000; s.kids += 1; break;
    case 'deathInFamily':   s.cash  -= s.cash  * 0.3; break;
    case 'weatherDisaster': s.cash  -= s.cash  * 0.7; break;
    case 'lotteryWin':      s.cash  += 1_000_000; break;
    case 'newHouse':        s.cash  -= 50_000; break;
    case 'divorce':         s.cash  *= 0.5;  s.relationshipStatus = 'divorced'; break;
    case 'married':         s.cash  += 20_000; s.relationshipStatus = 'married'; break;
    case 'businessSuccess': s.cash  += s.cash * 0.5;  s.hasBusiness = true; break;
    case 'startBusiness':   s.cash  -= 20_000; s.hasBusiness = true; break;
    case 'businessFailure': s.cash  -= s.cash * 0.5;  s.hasBusiness = false; break;
    case 'newCar':          s.cash  -= 30_000; break;
    case 'healthDecline':   s.income *= 0.9; break;
    case 'retirement':      s.hasJob = false; s.income *= 0.5; break;
    case 'investMoney':     s.cash  -= 10_000; s.investments += 10_000; break;
    default: break;
  }
  return s;
}

function fmt(n) {
  if (n == null || isNaN(n)) return '$0';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${sign}$${(abs / 1_000).toFixed(0)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

function pct(n) { return `${(n * 100).toFixed(1)}%`; }

// ─── StatChip ───────────────────────────────────────────────────────────────
function StatChip({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'var(--surface-low)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      minWidth: 100,
      flex: '1 1 100px',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: accent || 'var(--fg-1)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── EventLog entry ──────────────────────────────────────────────────────────
function EventEntry({ entry }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border-1)' }}>
      <span style={{ fontSize: 18, lineHeight: 1.3 }}>{entry.emoji}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>Age {entry.age} — {entry.name}</div>
        <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{entry.description}</div>
      </div>
    </div>
  );
}

// ─── Setup Form ──────────────────────────────────────────────────────────────
function SetupForm({ onStart }) {
  const [form, setForm] = useState({ age: 25, cash: 15000, income: 4000, expenses: 2500, investments: 5000 });

  const field = (id, label, hint) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      <input
        type="number"
        value={form[id]}
        onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-1)',
          background: 'var(--surface-low)',
          color: 'var(--fg-1)',
          fontSize: 15,
          fontFamily: 'var(--font-sans)',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
      {hint && <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{hint}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 40px 60px' }}>
      <Card style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--fg-1)', marginBottom: 6 }}>
            Start Your Simulation
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.6 }}>
            Enter your starting financial snapshot. Every 2 years you'll face real-world events — some lucky, some not.
          </div>
        </div>

        {field('age',         'Starting Age',             'Simulation ends at age 80 or bankruptcy')}
        {field('cash',        'Cash / Savings ($)',       'Liquid money in your bank account')}
        {field('income',      'Monthly Income ($)',       'Your take-home pay each month')}
        {field('expenses',    'Monthly Expenses ($)',     'Rent, food, bills, etc.')}
        {field('investments', 'Investment Portfolio ($)', 'Stocks, ETFs, retirement accounts')}

        <button
          onClick={() => onStart(form)}
          style={{
            marginTop: 8,
            padding: '12px 0',
            background: 'var(--primary)',
            color: 'var(--fg-inverse)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
            letterSpacing: '0.01em',
          }}
        >
          Begin Simulation →
        </button>
      </Card>
    </div>
  );
}

// ─── Main Simulator ──────────────────────────────────────────────────────────
export default function LifeSimulator() {
  const [phase, setPhase]               = useState('setup');   // 'setup' | 'running' | 'ended'
  const [userState, setUserState]       = useState(null);
  const [economy, setEconomy]           = useState(DEFAULT_ECONOMY);
  const [log, setLog]                   = useState([]);
  const [activeEvent, setActiveEvent]   = useState(null);      // random event modal
  const [selectedActions, setSelected]  = useState(new Set());
  const [advancing, setAdvancing]       = useState(false);
  const [endReason, setEndReason]       = useState('');

  const startSim = useCallback((form) => {
    setUserState(defaultUser(form));
    setEconomy(DEFAULT_ECONOMY);
    setLog([]);
    setPhase('running');
  }, []);

  const toggleAction = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const advanceTime = useCallback(async () => {
    if (advancing) return;
    setAdvancing(true);

    let s = { ...userState };

    // Advance age and finances
    s.age += ADVANCE_YEARS;
    s.cash += s.income * 12 * ADVANCE_YEARS;
    s.cash -= s.expenses * 12 * ADVANCE_YEARS;
    s.investments *= Math.pow(1 + economy.marketReturn, ADVANCE_YEARS);
    s.expenses *= Math.pow(1 + economy.inflationRate, ADVANCE_YEARS);

    const newEntries = [];

    // Apply user-chosen actions
    for (const id of selectedActions) {
      const action = USER_ACTIONS.find(a => a.id === id);
      s = applyEvent(id, s);
      if (action) newEntries.push({ age: s.age, name: action.label, emoji: action.emoji, description: action.description });
    }
    setSelected(new Set());

    // Random life event
    const randomEv = pickRandomEvent(s);
    let pendingModal = null;
    if (randomEv && randomEv.name) {
      s = applyEvent(randomEv.id, s);
      newEntries.push({ age: s.age, name: randomEv.name, emoji: randomEv.emoji, description: randomEv.description });
      pendingModal = randomEv;
    }

    setUserState(s);
    setLog(prev => [...newEntries, ...prev]);
    if (pendingModal) setActiveEvent(pendingModal);

    // Fetch new economy forecast
    try {
      const { data } = await api.post('/gemini/predict-future', { advanceTime: ADVANCE_YEARS });
      setEconomy({
        inflationRate: data.inflationRate ?? economy.inflationRate,
        marketReturn:  data.marketRate   ?? economy.marketReturn,
        recession:     Math.random() < (data.recessionProbability ?? 0.15),
      });
    } catch {
      // keep existing economy
    }

    // Check end conditions
    if (s.age >= 80) {
      setEndReason(`You reached age ${s.age} — a full life simulated!`);
      setPhase('ended');
    } else if (s.cash < -10_000) {
      setEndReason(`You went bankrupt at age ${s.age}.`);
      setPhase('ended');
    }

    setAdvancing(false);
  }, [advancing, userState, economy, selectedActions]);

  const restart = () => {
    setPhase('setup');
    setUserState(null);
    setEconomy(DEFAULT_ECONOMY);
    setLog([]);
    setSelectedActions && setSelected(new Set());
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar
        title="Life Simulator"
        subtitle="Navigate financial decisions across decades — powered by real economic data"
        right={phase !== 'setup' && (
          <button
            onClick={restart}
            style={{
              padding: '8px 16px',
              background: 'var(--surface-low)',
              color: 'var(--fg-2)',
              border: '1px solid var(--border-1)',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon d={ICONS.repeat} size={14} />
            Restart
          </button>
        )}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', background: 'var(--bg-page)' }}>

        {/* ── SETUP ─────────────────────────────────────────────────────────── */}
        {phase === 'setup' && <SetupForm onStart={startSim} />}

        {/* ── ENDED ─────────────────────────────────────────────────────────── */}
        {phase === 'ended' && (
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <Card style={{ padding: '36px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                {endReason.includes('bankrupt') ? '💸' : '🎉'}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26, color: 'var(--fg-1)', marginBottom: 8 }}>
                Simulation Complete
              </div>
              <div style={{ fontSize: 15, color: 'var(--fg-2)', marginBottom: 28 }}>{endReason}</div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28 }}>
                <StatChip label="Final Cash"        value={fmt(userState?.cash)}        />
                <StatChip label="Investments"       value={fmt(userState?.investments)} />
                <StatChip label="Net Worth"         value={fmt((userState?.cash ?? 0) + (userState?.investments ?? 0))} accent="var(--primary)" />
              </div>

              <button
                onClick={restart}
                style={{
                  padding: '12px 32px',
                  background: 'var(--primary)',
                  color: 'var(--fg-inverse)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                }}
              >
                Play Again
              </button>
            </Card>

            {log.length > 0 && (
              <Card style={{ padding: '20px 24px', marginTop: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 12 }}>
                  Life Events Log
                </div>
                {log.map((e, i) => <EventEntry key={i} entry={e} />)}
              </Card>
            )}
          </div>
        )}

        {/* ── RUNNING ───────────────────────────────────────────────────────── */}
        {phase === 'running' && userState && (
          <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── Status Row ─────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <StatChip label="Age"          value={userState.age}                    sub="years old" />
              <StatChip label="Cash"         value={fmt(userState.cash)}              accent={userState.cash < 0 ? 'var(--danger, #ef4444)' : undefined} />
              <StatChip label="Investments"  value={fmt(userState.investments)}       accent="var(--primary)" />
              <StatChip label="Net Worth"    value={fmt(userState.cash + userState.investments)} accent="var(--primary)" />
              <StatChip label="Monthly In"   value={fmt(userState.income)}            sub="after tax" />
              <StatChip label="Monthly Out"  value={fmt(userState.expenses)}          />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* ── Life Details ───────────────────────────────────────────── */}
              <Card style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 14 }}>
                  Life Status
                </div>
                {[
                  { label: 'Employment',    value: userState.hasJob ? '✅ Employed' : '❌ Unemployed' },
                  { label: 'Relationship',  value: { single: '💔 Single', married: '💍 Married', divorced: '📋 Divorced' }[userState.relationshipStatus] || userState.relationshipStatus },
                  { label: 'Children',      value: userState.kids === 0 ? 'None' : `${userState.kids} kid${userState.kids > 1 ? 's' : ''}` },
                  { label: 'Business',      value: userState.hasBusiness ? '🏢 Active' : 'None' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-1)', fontSize: 13 }}>
                    <span style={{ color: 'var(--fg-3)' }}>{label}</span>
                    <span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </Card>

              {/* ── Economy ────────────────────────────────────────────────── */}
              <Card style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 14 }}>
                  Economy
                </div>
                {[
                  { label: 'Inflation Rate', value: pct(economy.inflationRate) },
                  { label: 'Market Return',  value: pct(economy.marketReturn) },
                  { label: 'Recession',      value: economy.recession ? '⚠️ Yes' : '✅ No',   accent: economy.recession ? 'var(--danger, #ef4444)' : undefined },
                ].map(({ label, value, accent }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-1)', fontSize: 13 }}>
                    <span style={{ color: 'var(--fg-3)' }}>{label}</span>
                    <span style={{ color: accent || 'var(--fg-1)', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, fontSize: 11, color: 'var(--fg-3)' }}>
                  Forecasts update each turn via Gemini AI
                </div>
              </Card>
            </div>

            {/* ── Choose Actions ─────────────────────────────────────────────── */}
            <Card style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 14 }}>
                Your Decisions This Turn
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                {USER_ACTIONS.map(action => {
                  const active = selectedActions.has(action.id);
                  return (
                    <button
                      key={action.id}
                      onClick={() => toggleAction(action.id)}
                      title={action.description}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${active ? 'var(--primary)' : 'var(--border-1)'}`,
                        background: active ? 'var(--primary-muted)' : 'var(--surface-low)',
                        color: active ? 'var(--primary)' : 'var(--fg-2)',
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: 'var(--font-sans)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 120ms ease',
                      }}
                    >
                      <span>{action.emoji}</span>
                      {action.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={advanceTime}
                disabled={advancing}
                style={{
                  width: '100%',
                  padding: '13px 0',
                  background: advancing ? 'var(--primary-muted)' : 'var(--primary)',
                  color: advancing ? 'var(--primary)' : 'var(--fg-inverse)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  cursor: advancing ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  transition: 'background 120ms ease',
                }}
              >
                {advancing
                  ? <><div style={{ width: 16, height: 16, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Advancing…</>
                  : <><Icon d={ICONS.repeat} size={15} /> Advance {ADVANCE_YEARS} Years</>
                }
              </button>
            </Card>

            {/* ── Event Log ──────────────────────────────────────────────────── */}
            {log.length > 0 && (
              <Card style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 12 }}>
                  Life Events Log
                </div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {log.map((e, i) => <EventEntry key={i} entry={e} />)}
                </div>
              </Card>
            )}

          </div>
        )}
      </div>

      {/* ── Random Event Modal ──────────────────────────────────────────────── */}
      {activeEvent && (
        <div
          onClick={() => setActiveEvent(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface-card)',
              borderRadius: 'var(--radius-xl)',
              padding: '32px 36px',
              maxWidth: 420,
              width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 14 }}>{activeEvent.emoji}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--fg-1)', textAlign: 'center', marginBottom: 10 }}>
              {activeEvent.name}
            </div>
            <div style={{ fontSize: 14, color: 'var(--fg-2)', textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
              {activeEvent.description}
            </div>
            <button
              onClick={() => setActiveEvent(null)}
              style={{
                width: '100%',
                padding: '11px 0',
                background: 'var(--primary)',
                color: 'var(--fg-inverse)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
