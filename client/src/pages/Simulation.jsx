import { useState, useMemo } from 'react';
import TopBar from '../components/layout/TopBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon, { ICONS } from '../components/ui/Icon';
import api from '../services/api';

const fmt = (n) => {
  const num = Number(n);
  return isNaN(num) || n === '' ? '—' : '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0 });
};

const EXPENSE_FIELDS = [
  { key: 'housing',        label: 'Housing',        sub: 'Rent, mortgage, property tax' },
  { key: 'loans',          label: 'Loan Payments',  sub: 'Student loans, personal loans' },
  { key: 'insurance',      label: 'Insurance',      sub: 'Health, life, auto, home' },
  { key: 'transportation', label: 'Transportation', sub: 'Car payment, gas, transit' },
  { key: 'utilities',      label: 'Utilities',      sub: 'Electricity, water, internet' },
  { key: 'food',           label: 'Groceries',      sub: 'Grocery shopping (not dining out)' },
  { key: 'entertainment',  label: 'Entertainment',  sub: 'Streaming, movies, going out' },
  { key: 'clothing',       label: 'Clothing',       sub: 'Apparel and accessories' },
  { key: 'otherExpenses',  label: 'Other',          sub: 'Anything not listed above' },
];

const AVG_DATA = {
  monthlyIncome: 5000, monthlySavings: 500, housing: 1200, loans: 300,
  insurance: 200, transportation: 400, utilities: 150, food: 300,
  entertainment: 150, clothing: 100, otherExpenses: 200,
};

const NEEDS_KEYS    = ['housing', 'insurance', 'transportation', 'utilities', 'food'];
const WANTS_KEYS    = ['entertainment', 'clothing', 'otherExpenses'];
const SAVINGS_KEYS  = ['monthlySavings', 'loans'];
const EXPENSE_KEYS  = EXPENSE_FIELDS.map(f => f.key);

// ── Input components ──────────────────────────────────────────────────────────

function NumberInput({ value, onChange, placeholder = '0' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>$</span>
      <input
        type="number"
        min="0"
        step="10"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          width: 110,
          padding: '7px 10px',
          border: '1px solid var(--border-1)',
          borderRadius: 8,
          fontSize: 14,
          fontFamily: 'var(--font-mono)',
          outline: 'none',
          textAlign: 'right',
        }}
      />
    </div>
  );
}

// ── Budget bar (50/30/20 comparison) ─────────────────────────────────────────

function BudgetRow({ label, sub, typical, yours }) {
  const pctTypical = typical > 0 ? Math.min(100, (yours / typical) * 100) : 0;
  const over = yours > typical;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: 12, color: 'var(--fg-3)', marginLeft: 8 }}>{sub}</span>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--fg-3)' }}>guideline: {fmt(typical)}</span>
          <span style={{ fontWeight: 600, color: over ? 'var(--danger)' : 'var(--success)' }}>
            yours: {fmt(yours)}
          </span>
        </div>
      </div>
      <div style={{ height: 8, background: 'var(--border-1)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          width: `${Math.min(100, pctTypical)}%`,
          height: '100%',
          background: over ? 'var(--danger)' : 'var(--primary)',
          borderRadius: 999,
          transition: 'width 0.4s ease',
        }} />
      </div>
      {over && (
        <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>
          {fmt(yours - typical)} over guideline
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Simulation() {
  const [step, setStep] = useState('form'); // 'form' | 'results'
  const [form, setForm] = useState({
    monthlyIncome: 4000,
    monthlySavings: 400,
    housing: '', loans: '', insurance: '', transportation: '',
    utilities: '', food: '', entertainment: '', clothing: '', otherExpenses: '',
  });
  const [tips, setTips] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [plaidLoading, setPlaidLoading] = useState(false);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const income       = Number(form.monthlyIncome) || 0;
  const savings      = Number(form.monthlySavings) || 0;
  const totalExpenses = useMemo(() => EXPENSE_KEYS.reduce((s, k) => s + (Number(form[k]) || 0), 0), [form]);
  const remaining    = income - savings - totalExpenses;
  const savingsRate  = income > 0 ? ((savings / income) * 100).toFixed(1) : '0.0';

  const typNeeds   = income * 0.5;
  const typWants   = income * 0.3;
  const typSavings = income * 0.2;
  const yourNeeds   = NEEDS_KEYS.reduce((s, k) => s + (Number(form[k]) || 0), 0);
  const yourWants   = WANTS_KEYS.reduce((s, k) => s + (Number(form[k]) || 0), 0);
  const yourSavings = SAVINGS_KEYS.reduce((s, k) => s + (Number(form[k]) || 0), 0);

  const handleAutoFill = async () => {
    setPlaidLoading(true);
    try {
      const { data } = await api.get('/summary?days=90');
      if (data && !data.error && !data.pending) {
        const monthly = (val) => Math.round((val || 0) / 3);
        let food = 0, transport = 0, utilities = 0, entertainment = 0, clothing = 0, other = 0;
        
        (data.category_totals || []).forEach(c => {
          if (c.category === 'Food & Dining') food = c.total;
          else if (c.category === 'Transport') transport = c.total;
          else if (c.category === 'Utilities') utilities = c.total;
          else if (c.category === 'Entertainment') entertainment = c.total;
          else if (c.category === 'Shopping') clothing = c.total;
          else other += c.total; // Catch 'Healthcare', 'Other', etc.
        });

        setForm(f => ({
          ...f,
          monthlyIncome: monthly(data.total_income) || f.monthlyIncome,
          monthlySavings: monthly(data.savings_invested) || f.monthlySavings,
          food: monthly(food) || '',
          transportation: monthly(transport) || '',
          utilities: monthly(utilities) || '',
          entertainment: monthly(entertainment) || '',
          clothing: monthly(clothing) || '',
          otherExpenses: monthly(other) || '',
        }));
      }
    } catch (err) {
      console.error('Failed to auto-fill from Plaid', err);
    } finally {
      setPlaidLoading(false);
    }
  };

  const handleSubmit = async () => {
    setStep('results');
    setTipsLoading(true);
    try {
      const { data } = await api.post('/gemini/simulate-tips', {
        answers: form,
        userNeeds: yourNeeds, userWants: yourWants, userSavings: yourSavings,
        typicalNeeds: typNeeds, typicalWants: typWants, typicalSavings: typSavings,
      });
      setTips(data.tips ?? []);
    } catch {
      const fallback = [];
      if (yourNeeds > typNeeds)
        fallback.push('Your essential expenses exceed the 50% guideline. Consider ways to reduce housing or transportation costs.');
      else
        fallback.push('Great job keeping your essential expenses under 50% of income!');
      if (yourWants > typWants)
        fallback.push('Your discretionary spending exceeds the 30% guideline. Review entertainment and lifestyle expenses.');
      else
        fallback.push('Your discretionary spending is within the recommended 30% range.');
      if (yourSavings < typSavings)
        fallback.push('Consider increasing your savings to reach the recommended 20% of income.');
      else
        fallback.push('Excellent! You\'re saving more than the recommended 20% of your income.');
      setTips(fallback);
    } finally {
      setTipsLoading(false);
    }
  };

  // ── FORM ──────────────────────────────────────────────────────────────────

  if (step === 'form') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <TopBar title="Budget Simulation" subtitle="See how your spending compares to the 50/30/20 guideline" />

        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px', background: 'var(--bg-page)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={handleAutoFill} disabled={plaidLoading} style={{ fontSize: 13, padding: '8px 16px', background: 'var(--surface-card)' }}>
                {plaidLoading ? 'Syncing Data...' : '✦ Auto-fill from connected bank'}
              </Button>
            </div>

            {/* Income & Savings */}
            <Card style={{ padding: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: 4 }}>
                Step 1 of 2
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, margin: '0 0 20px' }}>
                Income &amp; Savings
              </h2>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', display: 'block', marginBottom: 10 }}>
                  Monthly Income
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <input
                    type="range"
                    min="0" max="20000" step="100"
                    value={form.monthlyIncome}
                    onChange={e => set('monthlyIncome')(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--primary)' }}
                  />
                  <NumberInput value={form.monthlyIncome} onChange={v => set('monthlyIncome')(Number(v) || 0)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', display: 'block', marginBottom: 10 }}>
                  Monthly Savings
                  <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--fg-3)', marginLeft: 8 }}>
                    how much you put away each month
                  </span>
                </label>
                <NumberInput value={form.monthlySavings} onChange={set('monthlySavings')} />
              </div>
            </Card>

            {/* Expenses */}
            <Card style={{ padding: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: 4 }}>
                Step 2 of 2
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, margin: '0 0 6px' }}>
                Monthly Expenses
              </h2>
              <p style={{ fontSize: 14, color: 'var(--fg-2)', margin: '0 0 22px', lineHeight: 1.5 }}>
                Enter what you spend per month in each category. Leave blank if it doesn't apply.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {EXPENSE_FIELDS.map((f, i) => (
                  <div key={f.key} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '13px 0',
                    borderBottom: i < EXPENSE_FIELDS.length - 1 ? '1px solid var(--border-1)' : 'none',
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{f.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 1 }}>{f.sub}</div>
                    </div>
                    <NumberInput value={form[f.key]} onChange={set(f.key)} />
                  </div>
                ))}
              </div>

              {/* Running total */}
              <div style={{
                marginTop: 20,
                background: 'var(--surface-low)',
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--fg-2)' }}>Total expenses</span>
                  <span className="money" style={{ fontWeight: 500 }}>{fmt(totalExpenses)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--fg-2)' }}>Savings</span>
                  <span className="money" style={{ fontWeight: 500 }}>{fmt(savings)}</span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600,
                  borderTop: '1px solid var(--border-1)', paddingTop: 8, marginTop: 2,
                }}>
                  <span>Income remaining</span>
                  <span className="money" style={{ color: remaining < 0 ? 'var(--danger)' : 'var(--success)' }}>
                    {fmt(remaining)}
                  </span>
                </div>
              </div>
            </Card>

            <Button variant="primary" style={{ alignSelf: 'flex-end', padding: '13px 32px', fontSize: 15 }} onClick={handleSubmit}>
              See My Results →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────

  const comparisonRows = [
    { label: 'Monthly Income',  userKey: 'monthlyIncome',  avgKey: 'monthlyIncome' },
    { label: 'Monthly Savings', userKey: 'monthlySavings', avgKey: 'monthlySavings' },
    ...EXPENSE_FIELDS.map(f => ({ label: f.label, userKey: f.key, avgKey: f.key })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar
        title="Your Results"
        subtitle="Based on the 50/30/20 budget guideline"
        right={
          <Button variant="ghost" size="sm" onClick={() => setStep('form')}>
            <Icon d={ICONS.back} size={14} /> Edit answers
          </Button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px', background: 'var(--bg-page)' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { label: 'Monthly Income',  value: fmt(form.monthlyIncome),  color: 'var(--success)' },
              { label: 'Monthly Savings', value: fmt(form.monthlySavings), color: 'var(--teal-600)' },
              { label: 'Savings Rate',    value: `${savingsRate}%`,        color: Number(savingsRate) >= 20 ? 'var(--success)' : 'var(--warning)' },
            ].map(c => (
              <div key={c.label} style={{ background: 'var(--surface-low)', border: '1px solid var(--border-1)', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 8 }}>{c.label}</div>
                <div className="money" style={{ fontSize: 24, fontWeight: 500, color: c.color }}>{c.value}</div>
              </div>
            ))}
          </div>

          {/* 50/30/20 Budget Breakdown */}
          <Card style={{ padding: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-2)', marginBottom: 4 }}>
              Budget Breakdown
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: '0 0 6px' }}>
              How you compare to the 50/30/20 rule
            </h3>
            <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: '0 0 24px', lineHeight: 1.5 }}>
              A healthy budget puts 50% toward needs, 30% toward wants, and 20% toward savings &amp; debt.
            </p>
            <BudgetRow label="Needs (50%)"         sub="housing, utilities, groceries, insurance" typical={typNeeds}   yours={yourNeeds} />
            <BudgetRow label="Wants (30%)"          sub="dining, entertainment, hobbies"           typical={typWants}   yours={yourWants} />
            <BudgetRow label="Savings &amp; Debt (20%)" sub="savings deposits, loan repayment"    typical={typSavings} yours={yourSavings} />
          </Card>

          {/* Comparison table */}
          <Card style={{ padding: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-2)', marginBottom: 4 }}>
              How You Compare
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: '0 0 20px' }}>
              Your budget vs. national averages
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0 20px' }}>
              {['Category', 'You', 'Avg', 'Difference'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', paddingBottom: 10, borderBottom: '1px solid var(--border-1)' }}>
                  {h}
                </div>
              ))}
              {comparisonRows.map((row, i) => {
                const userVal = Number(form[row.userKey]) || 0;
                const avgVal  = Number(AVG_DATA[row.avgKey]) || 0;
                const diff    = userVal - avgVal;
                const isIncome = row.userKey === 'monthlyIncome' || row.userKey === 'monthlySavings';
                const diffColor = diff === 0 ? 'var(--fg-3)' : isIncome
                  ? (diff > 0 ? 'var(--success)' : 'var(--danger)')
                  : (diff > 0 ? 'var(--danger)'  : 'var(--success)');
                return (
                  <>
                    <div key={`l${i}`} style={{ fontSize: 13, padding: '10px 0', borderBottom: '1px solid var(--border-1)', color: 'var(--fg-1)' }}>{row.label}</div>
                    <div key={`u${i}`} className="money" style={{ fontSize: 13, padding: '10px 0', borderBottom: '1px solid var(--border-1)', textAlign: 'right' }}>{fmt(userVal)}</div>
                    <div key={`a${i}`} className="money" style={{ fontSize: 13, padding: '10px 0', borderBottom: '1px solid var(--border-1)', textAlign: 'right', color: 'var(--fg-3)' }}>{fmt(avgVal)}</div>
                    <div key={`d${i}`} className="money" style={{ fontSize: 13, padding: '10px 0', borderBottom: '1px solid var(--border-1)', textAlign: 'right', fontWeight: 500, color: diffColor }}>
                      {diff === 0 ? '—' : (diff > 0 ? '+' : '') + fmt(diff).replace('$-', '-$')}
                    </div>
                  </>
                );
              })}
            </div>
          </Card>

          {/* Personalized Insights */}
          <Card style={{
            background: 'var(--surface-low)',
            padding: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: 'var(--primary)',
                color: 'var(--fg-inverse)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 18,
              }}>✦</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 8 }}>
                  Personalized Insights · Powered by Gemini
                </div>
                {tipsLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--fg-3)', fontSize: 14 }}>
                    <div style={{ width: 16, height: 16, border: '2px solid var(--accent-muted)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Generating your personalized tips…
                  </div>
                ) : (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {tips.map((tip, i) => (
                      <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.55 }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--accent-muted)', color: 'var(--accent)',
                          display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, marginTop: 1,
                        }}>{i + 1}</span>
                        <span style={{ color: 'var(--fg-1)' }}>{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>

          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--fg-3)' }}>
            Averages based on U.S. Bureau of Labor Statistics consumer expenditure data.
            Insights are AI-generated — verify before making financial decisions.
          </div>

        </div>
      </div>
    </div>
  );
}
