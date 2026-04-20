import { useNavigate } from 'react-router-dom';

export function buildRecognitions(pillars, sapling) {
  const out = [];
  const p = pillars || {};
  const s = sapling || {};

  if ((p.savings?.score ?? 0) >= 70) {
    const ef = (p.savings?.emergencyFundMonths ?? 0).toFixed(1);
    out.push({
      title: 'Your roots are strong',
      body: `Your savings cover ${ef} months of expenses — a meaningful cushion. Keep the auto-deposit rhythm going.`,
    });
  } else if (p.savings?.hasConsistentDeposits) {
    out.push({
      title: 'Consistent deposits showing',
      body: 'You\'ve deposited in at least 2 of the last 3 months. That rhythm is exactly what builds emergency funds over time.',
    });
  }

  if ((p.debt?.score ?? 0) >= 75) {
    out.push({
      title: 'Debt is under control',
      body: `Your debt-to-income ratio looks healthy. You're not letting interest compound against you.`,
    });
  }

  if ((p.spending?.score ?? 0) >= 70) {
    out.push({
      title: 'Spending in balance',
      body: `You've stayed within budget in recent months and your spending volatility is low. Steady money is winning money.`,
    });
  }

  if ((p.literacy?.score ?? 0) >= 65) {
    const done = p.literacy?.modulesCompleted ?? 0;
    const total = p.literacy?.modulesTotal ?? 0;
    out.push({
      title: 'You\'re learning',
      body: `${done} of ${total} modules complete. Every term you read adds leaves to your tree.`,
    });
  }

  if (s.hasInvestmentAccount && (s.contributionConsistency ?? 0) > 0.5) {
    out.push({
      title: 'Investments are blooming',
      body: `Your ${s.accountTypes?.[0] || 'investment'} is receiving steady contributions. Time in the market is your biggest ally.`,
    });
  }

  return out.slice(0, 3);
}

export default function RecognitionsCard({ recognitions }) {
  const list = recognitions ?? [];

  if (list.length === 0) {
    return (
      <div style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 22px',
        border: '1px solid var(--border-1)',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.3em', color: 'var(--success)', marginBottom: 8,
        }}>
          What you're doing right
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6 }}>
          Keep building. The first recognition will land once one of your
          pillars crosses a key threshold.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-xl)',
      padding: '20px 22px',
      border: '1px solid rgba(47,143,90,0.3)',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.3em', color: 'var(--success)', marginBottom: 14,
      }}>
        What you're doing right
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {list.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              background: '#E4F2EA',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 1,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', marginBottom: 3 }}>
                {r.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.6 }}>
                {r.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
