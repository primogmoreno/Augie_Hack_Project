import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon, { ICONS } from '../components/ui/Icon';
import CategoryIcon from '../components/ui/CategoryIcon';
import RateRealityCheck from '../components/dashboard/RateRealityCheck';
import Explainer from '../components/dashboard/Explainer';
import PlaidLink from '../components/plaid/PlaidLinkButton';
import api from '../services/api';
import { cacheGet, cacheSet } from '../services/cache';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';

const FALLBACK_TXS = [
  { icon: 'dining',       name: 'Blue Bottle Coffee', sub: 'Today · 8:14 AM',  tag: 'Food & Dining', amt: -6.25             },
  { icon: 'shopping',     name: "Trader Joe's",       sub: 'Yesterday',        tag: 'Shopping',      amt: -84.30            },
  { icon: 'entertainment',name: 'Netflix',            sub: 'Apr 14 · monthly', tag: 'Entertainment', amt: -15.49            },
  { icon: 'income',       name: 'Payroll — Acme Co.', sub: 'Apr 15',           tag: 'Income',        amt: 2450.00, pos: true },
  { icon: 'dining',       name: 'Blue Bottle Coffee', sub: 'Apr 13',           tag: 'Food & Dining', amt: -6.25             },
];

const PLACEHOLDER_BUDGET = [
  { name: 'Food & Dining', color: '#173124', pct: 72 },
  { name: 'Shopping',      color: '#2F8F5A', pct: 48 },
  { name: 'Transport',     color: '#A8631A', pct: 28 },
  { name: 'Entertainment', color: '#4f1b08', pct: 18 },
];

function mapPlaidAccounts(accounts, liabilities) {
  const creditCards = liabilities?.credit ?? [];

  // Count how many of each type exist so we can disambiguate labels
  const typeCount = {};
  for (const acct of accounts) {
    const key = acct.type === 'credit' ? 'credit' : acct.subtype ?? acct.type;
    typeCount[key] = (typeCount[key] ?? 0) + 1;
  }
  const typeSeen = {};

  const result = [];
  for (const acct of accounts) {
    const bal  = acct.balances.current ?? 0;
    const mask = acct.mask ? `••${acct.mask}` : '';

    if (acct.type === 'depository' && acct.subtype === 'checking') {
      const key = 'checking';
      typeSeen[key] = (typeSeen[key] ?? 0) + 1;
      const label = typeCount[key] > 1 ? `Checking ${typeSeen[key]}` : 'Checking';
      result.push({ name: label, bank: `${acct.name} ${mask}`, bal, delta: 'Connected', tone: 'success' });

    } else if (acct.type === 'depository' && acct.subtype === 'savings') {
      const key = 'savings';
      typeSeen[key] = (typeSeen[key] ?? 0) + 1;
      const label = typeCount[key] > 1 ? `Savings ${typeSeen[key]}` : 'Savings';
      result.push({ name: label, bank: `${acct.name} ${mask}`, bal, delta: 'Connected', tone: 'primary' });

    } else if (acct.type === 'credit') {
      const key = 'credit';
      typeSeen[key] = (typeSeen[key] ?? 0) + 1;
      const label = typeCount[key] > 1 ? `Credit ${typeSeen[key]}` : 'Credit';
      const cc          = creditCards.find(c => c.account_id === acct.account_id);
      const utilization = cc && acct.balances.limit ? Math.round((bal / acct.balances.limit) * 100) : null;
      result.push({
        name: label,
        bank: `${acct.name} ${mask}`,
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

function getRiskLabel(summary) {
  if (!summary) return { label: '—', sub: 'Connect bank to assess' };
  const sr = summary.savings_rate ?? 0;
  if (sr > 20) return { label: 'Stable / Low', sub: 'Your savings rate is strong' };
  if (sr > 10) return { label: 'Moderate', sub: 'Consider increasing savings' };
  return { label: 'Elevated', sub: 'Review your spending patterns' };
}

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
        background: 'var(--primary-muted)', border: '1px solid var(--border-1)',
        display: 'grid', placeItems: 'center', color: 'var(--primary)',
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
  const [accounts, setAccounts]           = useState([]);
  const [creditInfo, setCreditInfo]       = useState({ apr: 21.99, balance: 1284.55 });
  const [recentTxs, setRecentTxs]         = useState(FALLBACK_TXS);
  const [summary, setSummary]             = useState(null);
  const [isConnected, setIsConnected]     = useState(null);
  const [openPlaid, setOpenPlaid]         = useState(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cachedAccounts = cacheGet('accounts');
    if (cachedAccounts?.accounts?.length) {
      setAccounts(cachedAccounts.accounts);
      setCreditInfo(cachedAccounts.credit);
      setIsConnected(true);
    } else {
      api.get('/accounts')
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
      api.get('/transactions')
        .then(({ data }) => {
          if (data.pending || !data.transactions?.length) return;
          const mapped = data.transactions.slice(0, 5).map(t => ({
            icon: t.merchant_icon || 'other',
            name: t.merchant || t.name || 'Unknown',
            sub:  t.date_formatted || t.date,
            tag:  t.category || 'Other',
            amt:  t.amount,
            pos:  t.type === 'credit' || t.amount < 0,
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
      api.get('/summary?days=30')
        .then(({ data }) => {
          if (!data.pending) {
            setSummary(data);
            cacheSet('summary', data);
          }
        })
        .catch(() => {});
    }
  }, []);

  const connected  = isConnected === true;
  const loading    = isConnected === null;

  const topCategories = (summary?.category_totals ?? [])
    .filter(c => c.category !== 'Income' && c.category !== 'Savings & Investing')
    .slice(0, 4);

  const pieData = connected && topCategories.length > 0
    ? topCategories.map(cat => ({
        name: cat.category,
        value: cat.total,
        color: cat.color?.primary ?? 'var(--primary)'
      }))
    : PLACEHOLDER_BUDGET.map(b => ({
        name: b.name,
        value: b.pct,
        color: b.color
      }));

  const weeklyData = summary?.weekly_spending ?? [];

  const user = JSON.parse(sessionStorage.getItem('user'));
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return `Good morning, ${user?.displayName ?? 'there'}!`;
    if (h < 18) return `Good afternoon, ${user?.displayName ?? 'there'}!`;
    return `Good evening, ${user?.displayName ?? 'there'}!`;
  })();

  const totalValue = connected ? accounts.reduce((sum, a) => sum + a.bal, 0) : 0;
  const riskLabel  = getRiskLabel(summary);

  const aiInsightText = connected
    ? (creditInfo.apr > 15
        ? `Your ${creditInfo.apr}% APR is above the national average. Prioritizing this debt could save hundreds annually.`
        : summary
          ? `You spent $${(summary.total_spent ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} this month. Maintaining this trajectory improves your debt-to-income ratio.`
          : 'Your accounts are connected. Explore the tools below to understand your money better.')
    : 'Connect your bank to unlock personalized AI insights and tips tailored to your finances.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <PlaidLink onReady={openFn => setOpenPlaid(() => openFn)} />

      <TopBar
        title={greeting}
        subtitle={connected ? "Here's where things stand." : 'Connect your bank to get started.'}
        right={
          <Button variant="secondary" size="sm" onClick={() => openPlaid?.()}>
            <Icon d={ICONS.plus} size={14} /> {connected ? 'Add account' : 'Connect bank'}
          </Button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px 72px', background: 'var(--bg-page)', animation: 'fadeIn var(--dur-slow) var(--ease-out)' }}>

        {/* ── NOT CONNECTED: prominent CTA banner ──────────────────── */}
        {!loading && !connected && (
          <Card style={{ background: 'var(--primary)', padding: '32px 36px', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0, background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 28 }}>
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
                <Button variant="primary" onClick={() => openPlaid?.()} style={{ background: 'var(--fg-inverse)', color: 'var(--primary)', fontWeight: 700 }}>
                  <Icon d={ICONS.lock} size={14} /> Connect via Plaid — it's secure
                </Button>
              </div>
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 20px' }}>
                {['Real account balances', 'Spending breakdown by category', 'AI insights & tips', 'Transaction history', 'APR & savings rate'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                    <Icon d={ICONS.check} size={14} stroke={2} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* ── HERO FINANCIAL SNAPSHOT ──────────────────────────────── */}
        {connected && (
          <section style={{ marginBottom: 40 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 24, alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'var(--accent)', marginBottom: 14 }}>
                  Total Portfolio Value
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 72, fontWeight: 300, letterSpacing: '-0.04em', color: totalValue < 0 ? 'var(--danger, #ef4444)' : 'var(--primary)', lineHeight: 1, margin: 0 }}>
                  {totalValue < 0 ? '−' : ''}${Math.floor(Math.abs(totalValue)).toLocaleString()}
                  <span style={{ fontSize: 40, opacity: 0.4 }}>
                    .{(Math.abs(totalValue) % 1).toFixed(2).slice(2)}
                  </span>
                </h3>
                {totalValue < 0 && (
                  <div style={{ fontSize: 12, color: 'var(--danger, #ef4444)', marginTop: 6, fontWeight: 500 }}>
                    Net liabilities exceed assets — credit balances are included
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(Math.max(accounts.length, 3), 4)}, 1fr)`, gap: '0 8px', paddingBottom: 8, flexWrap: 'wrap' }}>
                {accounts.length > 0 ? accounts.map((a, i) => {
                  const isCredit = a.bal < 0;
                  return (
                    <div key={i} style={{ borderLeft: '1px solid var(--border-2)', paddingLeft: 16, minWidth: 0 }}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--fg-3)', letterSpacing: '0.1em', marginBottom: 2 }}>{a.name}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: isCredit ? 'var(--danger, #ef4444)' : 'var(--primary)' }}>
                        {isCredit ? '−' : ''}${Math.abs(a.bal).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--fg-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.bank}</div>
                    </div>
                  );
                }) : ['Checking', 'Savings', 'Credit'].map((name, i) => (
                  <div key={i} style={{ borderLeft: '1px solid var(--border-2)', paddingLeft: 16 }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--fg-3)', letterSpacing: '0.1em', marginBottom: 4 }}>{name}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--fg-3)' }}>—</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      {/* ── SPENDING TREND CHART ──────────────────────────────── */}
      {connected && weeklyData.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <Card style={{ padding: '24px 28px' }}>
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--primary)', margin: '0 0 4px' }}>
                Weekly Spending Trend
              </h4>
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--fg-3)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--fg-3)' }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Spent']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: 13 }}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>
      )}

        {/* ── BENTO GRID: Spending | Activity | AI Insight ─────────── */}
        <section style={{ display: 'grid', gridTemplateColumns: '4fr 5fr 3fr', gap: 16, marginBottom: 28 }}>

          {/* Col 1: Spending Breakdown */}
          <div style={{ position: 'relative' }}>
            <div style={{ background: 'var(--surface-low)', borderRadius: 'var(--radius-xl)', padding: '24px', height: '100%', boxSizing: 'border-box' }}>
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--primary)', margin: '0 0 4px' }}>
                  Spending Breakdown
                </h4>
                <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: 0 }}>Last 30 Days Analysis</p>
              </div>
          
            <div style={{ height: 180, marginBottom: 16 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `$${Number(value).toFixed(2)}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {pieData.map(b => (
              <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: b.color }} />
                  <span style={{ fontWeight: 500, color: 'var(--fg-1)' }}>{b.name}</span>
                  </div>
                <span className="money" style={{ color: 'var(--fg-2)' }}>
                  ${b.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                </div>
              ))}
            </div>
            {!connected && <LockedOverlay message="Connect your bank to see real spending by category" />}
          </div>

          {/* Col 2: Recent Activity */}
          <div style={{ position: 'relative' }}>
            <Card style={{ padding: 24, height: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--primary)', margin: 0 }}>
                  Recent Activity
                </h4>
                {connected && (
                  <button
                    onClick={() => navigate('/transactions')}
                    style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', background: 'none', border: 'none', borderBottom: '1px solid var(--border-1)', paddingBottom: 2, cursor: 'pointer' }}
                  >
                    View All Archive
                  </button>
                )}
              </div>
              {(connected ? recentTxs : FALLBACK_TXS).slice(0, 5).map((t, i, arr) => (
                <div key={i} className="tx-row" style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 8px',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border-1)' : 0,
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-low)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <CategoryIcon iconKey={t.icon} size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{t.tag} · {connected ? t.sub : '—'}</div>
                  </div>
                  <div className="money" style={{ fontSize: 14, fontWeight: 500, color: t.pos ? 'var(--success)' : 'var(--fg-1)', flexShrink: 0 }}>
                    {t.pos ? '+' : '−'}${Math.abs(t.amt).toFixed(2)}
                  </div>
                </div>
              ))}
            </Card>
            {!connected && <LockedOverlay message="Connect your bank to see your real transactions" />}
          </div>

          {/* Col 3: AI Insight + Risk Score */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* AI Insight card */}
            <div style={{
              background: 'var(--primary)', borderRadius: 'var(--radius-xl)', padding: 28,
              flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 280,
            }}>
              <div>
                <div style={{ fontSize: 24, color: 'rgba(255,179,157,0.8)', marginBottom: 14 }}>✦</div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--fg-inverse)', lineHeight: 1.3, margin: '0 0 12px' }}>
                  {connected ? (creditInfo.apr > 15 ? 'The Cost of Credit' : 'The Path to Liquidity') : 'Unlock Insights'}
                </h4>
                <p style={{ fontSize: 12, lineHeight: 1.7, color: 'rgba(176,205,187,0.9)', margin: 0 }}>
                  {aiInsightText}
                </p>
              </div>
              <div style={{ paddingTop: 20 }}>
                <button
                  onClick={() => navigate('/coach')}
                  style={{ background: 'none', border: 'none', borderBottom: '1px solid rgba(176,205,187,0.4)', paddingBottom: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(250,249,245,0.75)', cursor: 'pointer' }}
                >
                  Full Strategy Report
                </button>
              </div>
            </div>

            {/* Risk Score card */}
            <div style={{ background: 'rgba(79,27,8,0.08)', borderRadius: 'var(--radius-xl)', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--fg-3)', marginBottom: 4 }}>
                  Risk Score
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--primary)' }}>
                  {connected ? riskLabel.label : '—'}
                </div>
              </div>
              {/* Shield icon */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>
        </section>

        {/* ── RATE REALITY CHECK ────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <RateRealityCheck userApr={creditInfo.apr} userBalance={creditInfo.balance} />
        </div>

        {/* ── EDITORIAL QUOTE SECTION ───────────────────────────────── */}
        {connected && (
          <section style={{ borderTop: '1px solid var(--border-1)', paddingTop: 56, paddingBottom: 48, display: 'flex', gap: 0, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 460, marginRight: 48 }}>
              <h5 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 32, color: 'var(--primary)', lineHeight: 1.3, margin: '0 0 16px', fontWeight: 400 }}>
                "Financial literacy is not just about numbers, but about the freedom to navigate the world on your own terms."
              </h5>
              <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: 0, lineHeight: 1.6 }}>
                From the <em>Institutional Quarterly Review</em>, Autumn Series 2024.
              </p>
            </div>
            <div style={{ flex: 1, minWidth: 240, borderLeft: '1px solid var(--border-1)', paddingLeft: 48 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>
                Projected Net Worth (1 yr)
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: totalValue < 0 ? 'var(--danger, #ef4444)' : 'var(--primary)', lineHeight: 1 }}>
                {totalValue !== 0
                  ? `${totalValue < 0 ? '−' : ''}$${Math.abs(Math.round(totalValue * 1.142)).toLocaleString()}`
                  : '—'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, fontWeight: 700, color: totalValue < 0 ? 'var(--danger, #ef4444)' : 'var(--success)' }}>
                {totalValue < 0 ? '↓ Based on current debt trajectory' : '↑ +14.2% from current'}
              </div>
            </div>
          </section>
        )}

        {/* ── QUICK ACTIONS ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: connected ? 0 : 14 }}>
          {[
            { label: 'Full spending analysis', sub: connected ? 'AI breakdown of 90 days' : 'Requires bank connection', icon: ICONS.zap,     path: '/analyze',      disabled: !connected },
            { label: 'Transaction history',    sub: connected ? 'Filter, search, export'  : 'Requires bank connection', icon: ICONS.list,    path: '/transactions', disabled: !connected },
            { label: 'Run a simulation',       sub: 'Budget what-if scenarios',            icon: ICONS.sliders, path: '/simulate',     disabled: false },
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
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'var(--primary-muted)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
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
