import { useNavigate } from 'react-router-dom';
import { useLiteracyVisualization } from '../../hooks/useLiteracyVisualization';

export default function LiteracySettingsSection() {
  const navigate = useNavigate();
  const { loading, literacy, level, statCards } = useLiteracyVisualization();

  if (loading) {
    return <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>Loading literacy data…</div>;
  }

  if (literacy === null) {
    return (
      <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>
        Complete the onboarding survey to track your literacy progress.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <Stat label="Literacy Score" value={`${Math.round(literacy)}/100`} />
        <Stat label="Level" value={level?.name ?? '—'} />
        <Stat label="Terms Read" value={statCards.termsRead} />
      </div>
      <div>
        <button
          onClick={() => navigate('/onboarding/survey?mode=retake')}
          style={{
            padding: '10px 20px', background: 'var(--surface-low)',
            border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)',
            fontSize: 13, fontWeight: 600, color: 'var(--fg-1)',
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}
        >
          Retake Literacy Survey
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ background: 'var(--surface-low)', borderRadius: 'var(--radius-md)', padding: '12px 16px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: 'var(--primary)' }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginTop: 4 }}>{label}</div>
    </div>
  );
}
