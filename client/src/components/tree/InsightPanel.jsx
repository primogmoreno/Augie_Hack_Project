import { useNavigate } from 'react-router-dom';

export default function InsightPanel({ insights = [] }) {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 12 }}>
        What your tree needs next
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {insights.map((ins, i) => (
          <div key={i} style={{
            background: '#fff',
            border: '1px solid var(--border-1)',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: ins.dotColor,
              flexShrink: 0, marginTop: 5,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 4 }}>
                {ins.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55, marginBottom: 10 }}>
                {ins.body}
              </div>
              <button
                onClick={() => navigate(ins.actionRoute)}
                style={{
                  fontSize: 12, fontWeight: 600,
                  color: ins.dotColor,
                  background: 'none', border: 'none',
                  padding: 0, cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {ins.action} →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
