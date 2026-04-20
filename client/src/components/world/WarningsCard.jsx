import { useNavigate } from 'react-router-dom';

export function buildWarnings(pillars, sapling) {
  const ins = [];
  const p = pillars || {};
  const s = sapling || {};

  if ((p.debt?.score ?? 100) < 40) {
    const dti = Math.round((p.debt?.debtToIncomeRatio ?? 0) * 100);
    ins.push({
      title: 'Your tree is cracking — reduce debt',
      body: `High debt puts visible cracks in your trunk. Your debt-to-income ratio is ${dti}%. Paying down your highest-rate card would have the fastest impact.`,
      action: 'Open spending analyzer',
      route: '/analyze',
    });
  }

  if ((p.savings?.score ?? 0) < 35) {
    const ef = (p.savings?.emergencyFundMonths ?? 0).toFixed(1);
    ins.push({
      title: 'Grow your roots — build savings',
      body: `Your emergency fund covers ${ef} months of expenses. Three months is the first major milestone. Even $50/month builds the roots.`,
      action: 'See savings scenarios',
      route: '/simulate',
    });
  }

  if ((p.spending?.score ?? 0) < 45) {
    ins.push({
      title: 'Leaves are falling — control spending',
      body: `You went over budget in ${p.spending?.monthsOverBudget ?? 0} of the last 3 months. Your biggest spend is ${p.spending?.topOverspendCategory || 'unclassified'}. A focused budget there would stop the leaf drop.`,
      action: 'Analyze my spending',
      route: '/analyze',
    });
  }

  if ((p.literacy?.score ?? 0) < 50) {
    const done = p.literacy?.modulesCompleted ?? 0;
    const total = p.literacy?.modulesTotal ?? 0;
    ins.push({
      title: 'Learn to grow your canopy',
      body: `You have completed ${done} of ${total} literacy modules. Each module adds leaves to your tree.`,
      action: 'Open Jargon Decoder',
      route: '/jargon',
    });
  }

  if (!s.hasInvestmentAccount) {
    ins.push({
      title: 'Plant your investment sapling',
      body: 'No investment account connected yet. Opening a 401k or IRA — even with small contributions — plants the sapling beside your tree.',
      action: 'Talk to the coach',
      route: '/coach',
    });
  }

  return ins.slice(0, 3);
}

export default function WarningsCard({ warnings }) {
  const navigate = useNavigate();
  const list = warnings ?? [];

  if (list.length === 0) {
    return (
      <div style={{
        background: 'var(--primary)',
        borderRadius: 'var(--radius-xl)',
        padding: '22px 24px',
      }}>
        <div style={{ fontSize: 20, color: 'rgba(255,179,157,0.8)', marginBottom: 8 }}>✦</div>
        <h4 style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20,
          color: 'var(--fg-inverse)', margin: '0 0 6px',
        }}>
          Your tree is thriving
        </h4>
        <p style={{ fontSize: 12, color: 'rgba(176,205,187,0.9)', lineHeight: 1.6, margin: 0 }}>
          Keep your current habits. Explore investment diversity and advanced
          financial planning to push toward Mighty Oak status.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--primary)',
      borderRadius: 'var(--radius-xl)',
      padding: '22px 24px',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div>
        <div style={{ fontSize: 20, color: 'rgba(255,179,157,0.8)', marginBottom: 6 }}>✦</div>
        <h4 style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20,
          color: 'var(--fg-inverse)', margin: 0, lineHeight: 1.2,
        }}>
          What your tree needs next
        </h4>
      </div>

      {list.map((ins, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'rgba(255,179,157,0.8)',
            flexShrink: 0, marginTop: 6,
          }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-inverse)', marginBottom: 3 }}>
              {ins.title}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(176,205,187,0.9)', lineHeight: 1.6, marginBottom: 6 }}>
              {ins.body}
            </div>
            <button
              onClick={() => navigate(ins.route)}
              style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.15em', color: 'rgba(250,249,245,0.75)',
                background: 'none', border: 'none',
                borderBottom: '1px solid rgba(255,179,157,0.4)',
                paddingBottom: 2, cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {ins.action} →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
