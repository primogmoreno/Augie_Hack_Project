import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Icon, { ICONS } from '../components/ui/Icon';
import RateRealityCheck from '../components/dashboard/RateRealityCheck';
import Explainer from '../components/dashboard/Explainer';
import api from '../services/api';

const FALLBACK_ACCOUNTS = [
  { name: 'Checking', bank: 'Harbor CU ••5521', bal: 4218.47,  delta: '+$182 this week', tone: 'success' },
  { name: 'Savings',  bank: 'Harbor CU ••8840', bal: 6820.00,  delta: '68% to goal',     tone: 'primary' },
  { name: 'Credit',   bank: 'Visa ••2207',       bal: -1284.55, delta: '41% utilization', tone: 'warning' },
];

const FALLBACK_TXS = [
  { icon: ICONS.coffee, name: 'Blue Bottle Coffee', sub: 'Today · 8:14 AM',  tag: 'Dining',       amt: -6.25             },
  { icon: ICONS.cart,   name: "Trader Joe's",        sub: 'Yesterday',        tag: 'Groceries',    amt: -84.30            },
  { icon: ICONS.repeat, name: 'Netflix',             sub: 'Apr 14 · monthly', tag: 'Subscription', amt: -15.49            },
  { icon: ICONS.repeat, name: 'Payroll — Acme Co.',  sub: 'Apr 15',           tag: 'Income',       amt: 2450.00, pos: true },
  { icon: ICONS.coffee, name: 'Blue Bottle Coffee',  sub: 'Apr 13',           tag: 'Dining',       amt: -6.25             },
];

function mapPlaidAccounts(accounts, liabilities) {
  const creditCards = liabilities?.credit ?? [];
  const result = [];
  for (const acct of accounts) {
    const bal = acct.balances.current ?? 0;
    if (acct.type === 'depository' && acct.subtype === 'checking') {
      result.push({ name: 'Checking', bank: `${acct.name} ••${acct.mask}`, bal, delta: 'Connected', tone: 'success' });
    } else if (acct.type === 'depository' && acct.subtype === 'savings') {
      result.push({ name: 'Savings', bank: `${acct.name} ••${acct.mask}`, bal, delta: 'Connected', tone: 'primary' });
    } else if (acct.type === 'credit') {
      const cc = creditCards.find(c => c.account_id === acct.account_id);
      const utilization = cc && acct.balances.limit ? Math.round((bal / acct.balances.limit) * 100) : null;
      result.push({
        name: 'Credit',
        bank: `${acct.name} ••${acct.mask}`,
        bal: -bal,
        delta: utilization !== null ? `${utilization}% utilization` : 'Connected',
        tone: utilization > 30 ? 'warning' : 'success',
      });
    }
  }
  return result.length ? result : FALLBACK_ACCOUNTS;
}

function extractCreditInfo(accounts, liabilities) {
  const creditCards = liabilities?.credit ?? [];
  if (!creditCards.length) return { apr: 21.99, balance: 1284.55 };
  const cc = creditCards[0];
  const apr = cc.aprs?.find(a => a.apr_type === 'purchase_apr')?.apr_percentage ?? 21.99;
  const acct = accounts.find(a => a.account_id === cc.account_id);
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
      light: top.color?.light ?? 'var(--teal-50)',
    });
  }

  if (savings_invested > 0) {
    insights.push({
      label: 'Amount saved / invested',
      value: `$${savings_invested.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      detail: 'Money working for your future',
      color: '#1F7A6B',
      light: '#EAF5F3',
    });
  }

  if (typeof savings_rate === 'number' && typeof national_savings_rate === 'number') {
    const diff = (savings_rate - national_savings_rate).toFixed(1);
    const ahead = savings_rate >= national_savings_rate;
    insights.push({
      label: 'Your savings rate',
      value: `${savings_rate}%`,
      detail: ahead
        ? `+${diff}% above the national average (${national_savings_rate}%)`
        : `${Math.abs(diff)}% below the national average (${national_savings_rate}%)`,
      color: ahead ? '#1F7A6B' : 'var(--danger)',
      light: ahead ? '#EAF5F3' : '#FEF0F0',
    });
  }

  if (creditInfo.apr > 15) {
    insights.push({
      label: 'Credit card APR',
      value: `${creditInfo.apr}%`,
      detail: 'Above the national credit union average — worth reviewing',
      color: 'var(--danger)',
      light: '#FEF0F0',
    });
  }

  return insights.slice(0, 3);
}

export default function Dashboard() {
  const [accounts, setAccounts]       = useState(FALLBACK_ACCOUNTS);
  const [creditInfo, setCreditInfo]   = useState({ apr: 21.99, balance: 1284.55 });
  const [recentTxs, setRecentTxs]     = useState(FALLBACK_TXS);
  const [summary, setSummary]         = useState(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/accounts')
      .then(({ data }) => {
        setAccounts(mapPlaidAccounts(data.accounts, data.liabilities));
        setCreditInfo(extractCreditInfo(data.accounts, data.liabilities));
      })
      .catch(() => {});

    api.get('/transactions')
      .then(({ data }) => {
        if (data.pending || !data.transactions?.length) return;
        const iconFor = (cat) => {
          const c = (cat ?? '').toLowerCase();
          if (c.includes('food') || c.includes('restaurant') || c.includes('coffee')) return ICONS.coffee;
          if (c.includes('grocer') || c.includes('supermarket'))                       return ICONS.cart;
          return ICONS.repeat;
        };
        setRecentTxs(data.transactions.slice(0, 5).map(t => ({
          icon: iconFor(t.personal_finance_category?.primary ?? t.category?.[0]),
          name: t.name,
          sub:  new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          tag:  t.category ?? 'Other',
          amt:  t.amount,
          pos:  t.amount < 0,
        })));
      })
      .catch(() => {});

    api.get('/summary?days=30')
      .then(({ data }) => { if (!data.pending) setSummary(data); })
      .catch(() => {});
  }, []);

  const insights = buildInsights(summary, creditInfo);
  const topCategories = (summary?.category_totals ?? [])
    .filter(c => c.category !== 'Income' && c.category !== 'Savings & Investing')
    .slice(0, 4);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning.';
    if (h < 18) return 'Good afternoon.';
    return 'Good evening.';
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <TopBar
        title={greeting}
        subtitle="Here's where things stand."
        right={
          <Button variant="secondary" size="sm">
            <Icon d={ICONS.plus} size={14} /> Add account
          </Button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px', background: 'var(--ink-0)' }}>

        {/* Account cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {accounts.map((a, i) => (
            <Card key={i} style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-2)' }}>
                  {a.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{a.bank}</span>
              </div>
              <div className="money" style={{
                fontSize: 28, fontWeight: 500, margin: '10px 0',
                color: a.bal < 0 ? 'var(--danger)' : 'var(--fg-1)',
              }}>
                {a.bal < 0 ? '−' : ''}${Math.abs(a.bal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <Badge tone={a.tone}>{a.delta}</Badge>
            </Card>
          ))}
        </div>

        {/* Quick insights row */}
        {insights.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${insights.length}, 1fr)`, gap: 14, marginBottom: 24 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{
                background: ins.light,
                border: `1px solid ${ins.color}22`,
                borderRadius: 14,
                padding: '16px 18px',
              }}>
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

        {/* AI Insight hero */}
        <Card style={{
          background: 'linear-gradient(180deg, var(--amber-50) 0%, #fff 70%)',
          borderColor: 'color-mix(in srgb, var(--amber-400) 35%, var(--border-1))',
          padding: 24,
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--amber-300), var(--amber-400))',
              color: 'var(--ink-800)', display: 'grid', placeItems: 'center', fontWeight: 700,
            }}>✦</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--amber-500)', marginBottom: 8 }}>
                This week's insight
              </div>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500,
                lineHeight: 1.3, color: 'var(--fg-1)', marginBottom: 14,
              }}>
                {creditInfo.apr > 15
                  ? `Your credit card APR is ${creditInfo.apr}% — that's above the national credit union average. Here's what to do.`
                  : summary
                    ? `You spent $${(summary.total_spent ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} this month. Get a full breakdown below.`
                    : 'Your accounts are connected. Use the tools below to understand your money better.'}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button variant="dark" onClick={() => navigate('/coach')}>Talk to coach</Button>
                <Button variant="ghost" onClick={() => navigate('/analyze')}>
                  <Icon d={ICONS.zap} size={14} /> Analyze my spending
                </Button>
                <Button variant="ghost" onClick={() => setShowExplainer(true)}>What's "utilization"?</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Rate Reality Check */}
        <div style={{ marginBottom: 24 }}>
          <RateRealityCheck userApr={creditInfo.apr} userBalance={creditInfo.balance} />
        </div>

        {/* Spending breakdown + Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 14 }}>

          {/* Spending by category (real data if available, else placeholder) */}
          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, margin: 0 }}>
                {summary ? 'Last 30 days' : 'April budget'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>See all</Button>
            </div>

            {topCategories.length > 0 ? topCategories.map(cat => {
              const maxSpend = topCategories[0]?.total ?? 1;
              const pct = Math.round((cat.total / maxSpend) * 100);
              return (
                <div key={cat.category} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 500 }}>{cat.category}</span>
                    <span className="money" style={{ color: 'var(--fg-2)' }}>
                      ${cat.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--ink-100)', borderRadius: 999 }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', borderRadius: 999,
                      background: cat.color?.primary ?? 'var(--teal-500)',
                    }} />
                  </div>
                </div>
              );
            }) : [
              { name: 'Groceries', spent: 284, cap: 400, color: 'var(--teal-500)' },
              { name: 'Dining',    spent: 312, cap: 250, color: 'var(--danger)' },
              { name: 'Transport', spent: 48,  cap: 200, color: 'var(--teal-500)' },
              { name: 'Subscriptions', spent: 67, cap: 80, color: 'var(--warning)' },
            ].map(b => {
              const pct = Math.min(100, (b.spent / b.cap) * 100);
              return (
                <div key={b.name} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 500 }}>{b.name}</span>
                    <span className="money" style={{ color: 'var(--fg-2)' }}>${b.spent} / ${b.cap}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--ink-100)', borderRadius: 999 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: b.color, borderRadius: 999 }} />
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Recent activity */}
          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, margin: 0 }}>Recent activity</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>See all</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentTxs.map((t, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                  borderBottom: i < recentTxs.length - 1 ? '1px solid var(--border-1)' : 0,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'var(--ink-50)', color: 'var(--fg-2)',
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    <Icon d={t.icon} size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{t.sub} · {t.tag}</div>
                  </div>
                  <div className="money" style={{ fontSize: 14, fontWeight: 500, color: t.pos ? 'var(--success)' : 'var(--fg-1)', flexShrink: 0 }}>
                    {t.pos ? '+' : '−'}${Math.abs(t.amt).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 14 }}>
          {[
            { label: 'Full spending analysis', sub: 'AI breakdown of 90 days', icon: ICONS.zap, path: '/analyze', accent: 'var(--amber-400)' },
            { label: 'Transaction history',    sub: 'Filter, search, export',  icon: ICONS.list, path: '/transactions', accent: 'var(--teal-500)' },
            { label: 'Run a simulation',       sub: 'Budget what-if scenarios', icon: ICONS.sliders, path: '/simulate', accent: '#533AB7' },
          ].map(card => (
            <button
              key={card.path}
              onClick={() => navigate(card.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px', borderRadius: 14,
                border: '1px solid var(--border-1)',
                background: '#fff', cursor: 'pointer', textAlign: 'left',
                transition: 'box-shadow var(--dur-fast) var(--ease-out)',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `${card.accent}18`,
                color: card.accent, display: 'grid', placeItems: 'center',
              }}>
                <Icon d={card.icon} size={16} />
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
