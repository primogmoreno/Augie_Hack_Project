const MODULE_LABELS = {
  'credit-and-debt':      { label: 'Credit & Debt', desc: 'Learn how APR, credit scores, and debt repayment work.' },
  'saving-fundamentals':  { label: 'Saving Fundamentals', desc: 'Build your emergency fund and understand compound interest.' },
  'investing-intro':      { label: 'Investing Intro', desc: 'Get started with 401k, IRA, and index funds.' },
  'budgeting-basics':     { label: 'Budgeting Basics', desc: 'Track spending and build a budget that sticks.' },
  'financial-fundamentals': { label: 'Financial Fundamentals', desc: 'Core concepts every financially literate person knows.' },
  'banking-basics':       { label: 'Banking Basics', desc: 'Checking, savings, overdrafts, and moving money safely.' },
  'advanced-investing':   { label: 'Advanced Investing', desc: 'Portfolio strategy, diversification, and risk management.' },
  'tax-strategy':         { label: 'Tax Strategy', desc: 'Reduce your tax burden with smart planning.' },
  'retirement-planning':  { label: 'Retirement Planning', desc: 'Build a plan for long-term financial independence.' },
};

export default function NextStepCard({ moduleId, rank }) {
  const meta = MODULE_LABELS[moduleId] ?? { label: moduleId, desc: 'A personalized learning module.' };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      padding: '14px 16px',
      background: rank === 0 ? 'var(--primary-muted)' : 'var(--surface-low)',
      borderRadius: 'var(--radius-lg)',
      border: rank === 0 ? '1px solid var(--border-2)' : 'none',
    }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: 'var(--radius-sm)',
        background: rank === 0 ? 'var(--primary)' : 'var(--border-1)',
        color: rank === 0 ? 'var(--fg-inverse)' : 'var(--fg-2)',
        display: 'grid',
        placeItems: 'center',
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
        fontFamily: 'var(--font-mono)',
      }}>
        {rank + 1}
      </div>
      <div>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--fg-1)',
          fontFamily: 'var(--font-sans)',
          marginBottom: 2,
        }}>
          {meta.label}
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.45 }}>
          {meta.desc}
        </div>
      </div>
    </div>
  );
}
