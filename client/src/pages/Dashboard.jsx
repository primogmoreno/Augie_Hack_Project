import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Icon, { ICONS } from '../components/ui/Icon';
import CategoryIcon from '../components/ui/CategoryIcon';
import RateRealityCheck from '../components/dashboard/RateRealityCheck';
import Explainer from '../components/dashboard/Explainer';
import PlaidLink from '../components/plaid/PlaidLinkButton';
import api from '../services/api';
import { cacheGet, cacheSet } from '../services/cache';

const FALLBACK_TXS = [
  { icon: 'dining', name: 'Blue Bottle Coffee', sub: 'Today · 8:14 AM',  tag: 'Food & Dining', amt: -6.25             },
  { icon: 'shopping', name: "Trader Joe's",     sub: 'Yesterday',        tag: 'Shopping',      amt: -84.30            },
  { icon: 'entertainment', name: 'Netflix',     sub: 'Apr 14 · monthly', tag: 'Entertainment', amt: -15.49            },
  { icon: 'income', name: 'Payroll — Acme Co.', sub: 'Apr 15',           tag: 'Income',        amt: 2450.00, pos: true },
  { icon: 'dining', name: 'Blue Bottle Coffee', sub: 'Apr 13',           tag: 'Food & Dining', amt: -6.25             },
];

const PLACEHOLDER_BUDGET = [
  { name: 'Food & Dining', color: '#185FA5', pct: 72 },
  { name: 'Shopping',      color: '#639922', pct: 48 },
  { name: 'Transport',     color: '#BA7517', pct: 28 },
  { name: 'Entertainment', color: '#533AB7', pct: 18 },
];

function mapPlaidAccounts(accounts, liabilities) {
  const creditCards = liabilities?.credit ?? [];
  const result = [];
  for (const acct of accounts) {
    const bal = acct.balances.current ?? 0;
    if (acct.type === 'depository' && acct.subtype === 'checking') {
      result.push({ name: 'Checking', bank: `${acct.name} ••${acct.mask}`, bal, delta: 'Connected', tone: 'success' });
    } else if (acct.type === 'depository' && acct.subtype === 'savings') {
      result.push({ name: 'Savings',  bank: `${acct.name} ••${acct.mask}`, bal, delta: 'Connected', tone: 'primary' });
    } else if (acct.type === 'credit') {
      const cc          = creditCards.find(c => c.account_id === acct.account_id);
      const utilization = cc && acct.balances.limit ? Math.round((bal / acct.balances.limit) * 100) : null;
      result.push({
        name: 'Credit',
        bank: `${acct.name} ••${acct.mask}`,
        bal:  -bal,
        delta: utilization !== null ? `${utilization}% utilization` : 'Connected',
        tone: utilization > 30 ? 'warning' : 'success',
      });
    }
  }
  return result;
}

function extractCreditInfo(accounts, liabilities) {
  const creditCards = liabilities?.credit ?? [];
  if (!creditCards.length) return { apr: 21.99, balance: 1284.55 };
  const cc      = creditCards[0];
  const apr     = cc.aprs?.find(a => a.apr_type === 'purchase_apr')?.apr_percentage ?? 21.99;
  const acct    = accounts.find(a => a.account_id === cc.account_id);
  const balance = acct?.balances?.current ?? 1284.55;
  return { apr: parseFloat(apr.toFixed(2)), balance: parseFloat(balance.toFixed(2)) };
}

function buildInsights(summary, creditInfo) {
  if (!summary) return [];
  const insights = [];
  const { category_totals = [], total_spent, savings_rate, national_savings_rate, savings_invested } = summary;

  const top = category_totals.find(c => c.category !== 'Income' && c.category !== 'Savings & Investing');
  if (top) {
    const pct = total_spent > 0 ? Math.round((top.total / total_spent) * 100) : 0;
    insights.push({
      label: 'Top spending category',
      value: top.category,
      detail: `$${top.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} · ${pct}% of total`,
      color: top.color?.primary ?? 'var(--teal-700)',
      light: top.color?.light  ?? 'var(--teal-50)',
    });
  }

  if (savings_invested > 0) {
    insights.push({
      label: 'Amount saved / invested',
      value: `$${savings_invested.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      detail: 'Money working for your future',
      color: '#1F7A6B', light: '#EAF5F3',
    });
  }

  if (typeof savings_rate === 'number' && typeof national_savings_rate === 'number') {
    const diff  = (savings_rate - national_savings_rate).toFixed(1);
    const ahead = savings_rate >= national_savings_rate;
    insights.push({
      label:  'Your savings rate',
      value:  `${savings_rate}%`,
      detail: ahead
        ? `+${diff}% above the national average (${national_savings_rate}%)`
        : `${Math.abs(diff)}% below the national average (${national_savings_rate}%)`,
      color: ahead ? '#1F7A6B' : 'var(--danger)',
      light: ahead ? '#EAF5F3' : '#FEF0F0',
    });
  }

  if (creditInfo.apr > 15) {
    insights.push({
      label: 'Credit card APR', value: `${creditInfo.apr}%`,
      detail: 'Above the national credit union average — worth reviewing',
      color: 'var(--danger)', light: '#FEF0F0',
    });
  }

  return insights.slice(0, 3);
}

// Blurred card overlay for locked sections
function LockedOverlay({ message }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 'inherit',
      background: 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 10, zIndex: 2,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: 'var(--teal-50)', border: '1px solid var(--teal-100)',
        display: 'grid', placeItems: 'center', color: 'var(--teal-700)',
      }}>
        <Icon d={ICONS.lock} size={18} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-2)', textAlign: 'center', maxWidth: 200, lineHeight: 1.5 }}>
        {message}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [accounts, setAccounts]         = useState([]);
  const [creditInfo, setCreditInfo]     = useState({ apr: 21.99, balance: 1284.55 });
  const [recentTxs, setRecentTxs]       = useState(FALLBACK_TXS);
  const [summary, setSummary]           = useState(null);
  const [isConnected, setIsConnected]   = useState(null); // null=loading, true=yes, false=no
  const [openPlaid, setOpenPlaid]       = useState(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const navigate = useNavigate();

   useEffect(() => {
    const cachedAccounts = cacheGet('accounts');
    if (cachedAccounts?.accounts?.length) {
      setAccounts(cachedAccounts.accounts);
      setCreditInfo(cachedAccounts.credit);
      setIsConnected(true);
    } else {
      api
        .get('/accounts')
        .then(({ data }) => {
          const mapped = mapPlaidAccounts(data.accounts, data.liabilities);
          const credit = extractCreditInfo(data.accounts, data.liabilities);
          setAccounts(mapped);
          setCreditInfo(credit);
          setIsConnected(true);
          cacheSet('accounts', { accounts: mapped, credit });
        })
        .catch(() => setIsConnected(false));
    }

    const cachedTxs = cacheGet('transactions');
    if (cachedTxs?.length) {
      setRecentTxs(cachedTxs);
    } else {
      api
        .get('/transactions')
        .then(({ data }) => {
          if (data.pending || !data.transactions?.length) return;

          const mapped = data.transactions.slice(0, 5).map((t) => ({
            icon: t.merchant_icon || 'other',
            name: t.merchant || t.name || 'Unknown',
            sub: t.date_formatted || t.date,
            tag: t.category || 'Other',
            amt: t.amount,
            pos: t.type === 'credit' || t.amount < 0,
          }));

          setRecentTxs(mapped);
          cacheSet('transactions', mapped);
        })
        .catch(() => {});
    }

    const cachedSummary = cacheGet('summary');
    if (cachedSummary) {
      setSummary(cachedSummary);
    } else {
      api
        .get('/summary?days=30')
        .then(({ data }) => {
          if (!data.pending) {
            setSummary(data);
            cacheSet('summary', data);
          }
        })
        .catch(() => {});
    }
  }, []);


  const insights      = buildInsights(summary, creditInfo);
  const topCategories = (summary?.category_totals ?? [])
    .filter(c => c.category !== 'Income' && c.category !== 'Savings & Investing')
    .slice(0, 4);

    const user = JSON.parse(sessionStorage.getItem("user"));
console.log(user.displayName); 
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return `Good morning, ${user.displayName}!`;
    if (h < 18) return `Good afternoon, ${user.displayName}!`;
    return `Good evening, ${user.displayName}!`;
  })();

  const connected = isConnected === true;
  const loading   = isConnected === null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Hidden PlaidLink — exposes open() to the "Add account" button */}
      <PlaidLink onReady={openFn => setOpenPlaid(() => openFn)} />

      <TopBar
        title={greeting}
        subtitle={connected ? "Here's where things stand." : "Connect your bank to get started."}
        right={
          <Button variant="secondary" size="sm" onClick={() => openPlaid?.()}>
            <Icon d={ICONS.plus} size={14} /> {connected ? 'Add account' : 'Connect bank'}
          </Button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px', background: 'var(--ink-0)', animation: 'fadeIn var(--dur-slow) var(--ease-out)' }}>

        {/* ── NOT CONNECTED: prominent CTA banner ──────────────────── */}
        {!loading && !connected && (
          <Card style={{
            background: 'linear-gradient(135deg, var(--teal-700) 0%, #0D5C52 100%)',
            border: 'none', padding: '32px 36px', marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                background: 'rgba(255,255,255,0.15)',
                display: 'grid', placeItems: 'center', color: '#fff', fontSize: 28,
              }}>
                🏦
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>
                  Step 1 — Connect your bank
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>
                  Your dashboard is ready — just add your bank
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: '0 0 20px', lineHeight: 1.55 }}>
                  Once connected, you'll see your real account balances, spending breakdowns, AI-powered insights, and personalized tips — all in one place.
                </p>
                <Button
                  variant="primary"
                  onClick={() => openPlaid?.()}
                  style={{ background: '#fff', color: 'var(--teal-700)', fontWeight: 700 }}
                >
                  <Icon d={ICONS.lock} size={14} /> Connect via Plaid — it's secure
                </Button>
              </div>
              {/* Preview list of what unlocks */}
              <div style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10,
                background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 20px',
              }}>
                {[
                  'Real account balances',
                  'Spending breakdown by category',
                  'AI insights & tips',
                  'Transaction history',
                  'APR & savings rate',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                    <Icon d={ICONS.check} size={14} stroke={2} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* ── Account cards ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {connected ? accounts.map((a, i) => (
            <Card key={i} style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-2)' }}>
                  {a.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{a.bank}</span>
              </div>
              <div className="money" style={{ fontSize: 28, fontWeight: 500, margin: '10px 0', color: a.bal < 0 ? 'var(--danger)' : 'var(--fg-1)' }}>
                {a.bal < 0 ? '−' : ''}${Math.abs(a.bal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <Badge tone={a.tone}>{a.delta}</Badge>
            </Card>
          )) : ['Checking', 'Savings', 'Credit'].map(name => (
            <Card key={name} style={{ padding: 18, opacity: loading ? 0.5 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-2)' }}>
                  {name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                  {loading ? '···' : '— not connected —'}
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 500, margin: '10px 0', color: 'var(--ink-200)', fontFamily: 'var(--font-mono, monospace)' }}>
                — — —
              </div>
              <Badge tone="default">{loading ? 'Loading…' : 'Connect to view'}</Badge>
            </Card>
          ))}
        </div>

        {/* ── Quick insights row (only when connected + data loaded) ── */}
        {connected && insights.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${insights.length}, 1fr)`, gap: 14, marginBottom: 24 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ background: ins.light, border: `1px solid ${ins.color}22`, borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: ins.color, marginBottom: 6 }}>
                  {ins.label}
                </div>
                <div className="money" style={{ fontSize: 22, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 4 }}>
                  {ins.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.4 }}>{ins.detail}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── AI Insight hero ────────────────────────────────────────── */}
        <Card style={{
          background: connected
            ? 'linear-gradient(180deg, var(--amber-50) 0%, #fff 70%)'
            : 'var(--ink-50)',
          borderColor: connected
            ? 'color-mix(in srgb, var(--amber-400) 35%, var(--border-1))'
            : 'var(--border-1)',
          padding: 24, marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: connected
                ? 'linear-gradient(135deg, var(--amber-300), var(--amber-400))'
                : 'var(--ink-100)',
              color: connected ? 'var(--ink-800)' : 'var(--fg-3)',
              display: 'grid', placeItems: 'center', fontWeight: 700,
            }}>
              {connected ? '✦' : <Icon d={ICONS.lock} size={18} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: connected ? 'var(--amber-500)' : 'var(--fg-3)', marginBottom: 8 }}>
                {connected ? "This week's insight" : 'AI insights — locked'}
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, lineHeight: 1.3, color: connected ? 'var(--fg-1)' : 'var(--fg-3)', marginBottom: 14 }}>
                {connected
                  ? (creditInfo.apr > 15
                      ? `Your credit card APR is ${creditInfo.apr}% — that's above the national credit union average.`
                      : summary
                        ? `You spent $${(summary.total_spent ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} this month. Get a full breakdown below.`
                        : 'Your accounts are connected. Use the tools below to understand your money better.')
                  : 'Connect your bank to unlock personalized AI insights, spending patterns, and tips tailored to your finances.'}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {connected ? (
                  <>
                    <Button variant="dark" onClick={() => navigate('/coach')}>Talk to coach</Button>
                    <Button variant="ghost" onClick={() => navigate('/analyze')}>
                      <Icon d={ICONS.zap} size={14} /> Analyze my spending
                    </Button>
                    <Button variant="ghost" onClick={() => setShowExplainer(true)}>What's "utilization"?</Button>
                  </>
                ) : (
                  <Button variant="secondary" onClick={() => openPlaid?.()}>
                    <Icon d={ICONS.plus} size={14} /> Connect bank to unlock
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* ── Rate Reality Check ─────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <RateRealityCheck userApr={creditInfo.apr} userBalance={creditInfo.balance} />
        </div>

        {/* ── Spending breakdown + Activity ─────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 14 }}>

          {/* Spending by category */}
          <div style={{ position: 'relative' }}>
            <Card style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, margin: 0 }}>
                  {connected && summary ? 'Last 30 days' : 'Spending preview'}
                </h3>
                {connected && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>See all</Button>
                )}
              </div>

              {(connected && topCategories.length > 0 ? topCategories.map(cat => ({
                name: cat.category, pct: Math.round((cat.total / (topCategories[0]?.total ?? 1)) * 100),
                color: cat.color?.primary ?? 'var(--teal-500)',
                label: `$${cat.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              })) : PLACEHOLDER_BUDGET).map(b => (
                <div key={b.name} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 500 }}>{b.name}</span>
                    <span className="money" style={{ color: 'var(--fg-2)' }}>{b.label ?? '—'}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--ink-100)', borderRadius: 999 }}>
                    <div style={{ width: `${b.pct}%`, height: '100%', borderRadius: 999, background: b.color }} />
                  </div>
                </div>
              ))}
            </Card>
            {!connected && (
              <LockedOverlay message="Connect your bank to see real spending by category" />
            )}
          </div>

          {/* Recent activity */}
          <div style={{ position: 'relative' }}>
            <Card style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, margin: 0 }}>Recent activity</h3>
                {connected && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>See all</Button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {FALLBACK_TXS.map((t, i) => (
                  <div key={i} className="tx-row" style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                    borderBottom: i < FALLBACK_TXS.length - 1 ? '1px solid var(--border-1)' : 0,
                  }}>
                    <div className="category-icon-box" style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--ink-50)', color: 'var(--fg-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <CategoryIcon iconKey={t.icon} size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {connected ? t.name : t.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{connected ? t.sub : '—'} · {t.tag}</div>
                    </div>
                    <div className="money" style={{ fontSize: 14, fontWeight: 500, color: t.pos ? 'var(--success)' : 'var(--fg-1)', flexShrink: 0 }}>
                      {t.pos ? '+' : '−'}${Math.abs(t.amt).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            {!connected && (
              <LockedOverlay message="Connect your bank to see your real transactions" />
            )}
          </div>
        </div>

        {/* ── Quick actions ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 14 }}>
          {[
            { label: 'Full spending analysis', sub: connected ? 'AI breakdown of 90 days'  : 'Requires bank connection', icon: ICONS.zap,     path: '/analyze',      accent: 'var(--amber-400)', disabled: !connected },
            { label: 'Transaction history',    sub: connected ? 'Filter, search, export'    : 'Requires bank connection', icon: ICONS.list,    path: '/transactions', accent: 'var(--teal-500)', disabled: !connected },
            { label: 'Run a simulation',       sub: 'Budget what-if scenarios',              icon: ICONS.sliders, path: '/simulate',     accent: '#533AB7',        disabled: false },
          ].map(card => (
            <button
              key={card.path}
              onClick={() => !card.disabled && navigate(card.path)}
              className={card.disabled ? undefined : 'surface-lift'}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px', borderRadius: 14,
                border: '1px solid var(--border-1)',
                background: '#fff', cursor: card.disabled ? 'default' : 'pointer', textAlign: 'left',
                opacity: card.disabled ? 0.55 : 1,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `${card.accent}18`, color: card.accent,
                display: 'grid', placeItems: 'center',
              }}>
                <Icon d={card.disabled ? ICONS.lock : card.icon} size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 2 }}>{card.label}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{card.sub}</div>
              </div>
            </button>
          ))}
        </div>

      </div>

      {showExplainer && (
        <Explainer
          onClose={() => setShowExplainer(false)}
          onCoach={() => { setShowExplainer(false); navigate('/coach'); }}
        />
      )}
    </div>
  );
}
