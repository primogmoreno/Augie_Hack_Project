import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Icon, { ICONS } from '../components/ui/Icon';
import RateRealityCheck from '../components/dashboard/RateRealityCheck';
import SpendingAnalyzer from '../components/analyzer/SpendingAnalyzer';
import Explainer from '../components/dashboard/Explainer';
import api from '../services/api';

// Shown while Plaid data loads or when not yet connected
const FALLBACK_ACCOUNTS = [
  { name: 'Checking', bank: 'Harbor CU ••5521', bal: 4218.47,  delta: '+$182 this week', tone: 'success' },
  { name: 'Savings',  bank: 'Harbor CU ••8840', bal: 6820.00,  delta: '68% to goal',     tone: 'primary' },
  { name: 'Credit',   bank: 'Visa ••2207',       bal: -1284.55, delta: '41% utilization', tone: 'warning' },
];

const BUDGET = [
  { name: 'Groceries',     spent: 284, cap: 400, color: 'var(--teal-500)' },
  { name: 'Dining',        spent: 312, cap: 250, color: 'var(--danger)',  over: true },
  { name: 'Transport',     spent: 48,  cap: 200, color: 'var(--teal-500)' },
  { name: 'Subscriptions', spent: 67,  cap: 80,  color: 'var(--warning)'  },
];

const FALLBACK_TXS = [
  { icon: ICONS.coffee, name: 'Blue Bottle Coffee', sub: 'Today · 8:14 AM',  tag: 'Dining',       amt: -6.25            },
  { icon: ICONS.cart,   name: "Trader Joe's",        sub: 'Yesterday',         tag: 'Groceries',    amt: -84.30           },
  { icon: ICONS.repeat, name: 'Netflix',             sub: 'Apr 14 · monthly',  tag: 'Subscription', amt: -15.49           },
  { icon: ICONS.repeat, name: 'Payroll — Acme Co.',  sub: 'Apr 15',            tag: 'Income',       amt: 2450.00, pos: true },
  { icon: ICONS.coffee, name: 'Blue Bottle Coffee',  sub: 'Apr 13',            tag: 'Dining',       amt: -6.25            },
];

function mapPlaidAccounts(accounts, liabilities) {
  const creditCards = liabilities?.credit ?? [];
  const result = [];

  for (const acct of accounts) {
    const type = acct.type;
    const subtype = acct.subtype;
    const bal = acct.balances.current ?? 0;

    if (type === 'depository' && subtype === 'checking') {
      result.push({ name: 'Checking', bank: `${acct.name} ••${acct.mask}`, bal, delta: 'Connected', tone: 'success' });
    } else if (type === 'depository' && subtype === 'savings') {
      result.push({ name: 'Savings', bank: `${acct.name} ••${acct.mask}`, bal, delta: 'Connected', tone: 'primary' });
    } else if (type === 'credit') {
      const cc = creditCards.find(c => c.account_id === acct.account_id);
      const utilization = cc && acct.balances.limit
        ? Math.round((bal / acct.balances.limit) * 100)
        : null;
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

export default function Dashboard() {
  const [accounts, setAccounts] = useState(FALLBACK_ACCOUNTS);
  const [creditInfo, setCreditInfo] = useState({ apr: 21.99, balance: 1284.55 });
  const [recentTxs, setRecentTxs] = useState(FALLBACK_TXS);
  const [showExplainer, setShowExplainer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/plaid/accounts')
      .then(({ data }) => {
        const mapped = mapPlaidAccounts(data.accounts, data.liabilities);
        setAccounts(mapped);
        setCreditInfo(extractCreditInfo(data.accounts, data.liabilities));
      })
      .catch(() => { /* keep fallback */ });

    api.get('/plaid/transactions')
      .then(({ data }) => {
        if (!data.transactions?.length) return;
        const iconFor = (cat) => {
          const c = (cat ?? '').toLowerCase();
          if (c.includes('food') || c.includes('restaurant') || c.includes('coffee')) return ICONS.coffee;
          if (c.includes('grocer') || c.includes('supermarket'))                       return ICONS.cart;
          if (c.includes('subscription') || c.includes('streaming'))                  return ICONS.repeat;
          return ICONS.repeat;
        };
        const mapped = data.transactions.slice(0, 5).map(t => ({
          icon: iconFor(t.personal_finance_category?.primary ?? t.category?.[0]),
          name: t.name,
          sub:  new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          tag:  t.personal_finance_category?.primary ?? t.category?.[0] ?? 'Other',
          amt:  t.amount,
          pos:  t.amount < 0,
        }));
        setRecentTxs(mapped);
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <TopBar
        title="Good morning."
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
                  : "Your accounts are connected. Use the tools below to understand your money better."}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="dark" onClick={() => navigate('/coach')}>Talk to coach</Button>
                <Button variant="ghost" onClick={() => setShowExplainer(true)}>What's "utilization"?</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Rate Reality Check */}
        <div style={{ marginBottom: 24 }}>
          <RateRealityCheck userApr={creditInfo.apr} userBalance={creditInfo.balance} />
        </div>

        {/* AI Spending Analyzer */}
        <div style={{ marginBottom: 24 }}>
          <SpendingAnalyzer />
        </div>

        {/* Budget + Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 14 }}>
          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, margin: 0 }}>April budget</h3>
              <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>15 days left</span>
            </div>
            {BUDGET.map(b => {
              const pct = Math.min(100, (b.spent / b.cap) * 100);
              return (
                <div key={b.name} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 500 }}>{b.name}</span>
                    <span className="money" style={{ color: b.over ? 'var(--danger)' : 'var(--fg-2)' }}>
                      ${b.spent} / ${b.cap}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--ink-100)', borderRadius: 999 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: b.color, borderRadius: 999 }} />
                  </div>
                </div>
              );
            })}
          </Card>

          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, margin: 0 }}>Recent activity</h3>
              <Button variant="ghost" size="sm">See all</Button>
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

      </div>

      {showExplainer && <Explainer onClose={() => setShowExplainer(false)} onCoach={() => { setShowExplainer(false); navigate('/coach'); }} />}
    </div>
  );
}
