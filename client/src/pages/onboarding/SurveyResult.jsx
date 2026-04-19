import { useMemo } from 'react';
import Button from '../../components/ui/Button';
import ResultTree from '../../components/onboarding/ResultTree';
import PillarMiniBar from '../../components/onboarding/PillarMiniBar';
import NextStepCard from '../../components/onboarding/NextStepCard';
import { buildSurveyPayload } from '../../utils/firebasePayload';

export default function SurveyResult({ answers, onSubmit, submitting, submitError }) {
  const payload = useMemo(() => buildSurveyPayload(answers), [answers]);
  const { scores, archetype, treeStage, recommendedModules } = payload;

  const pillarsForTree = {
    savings:  { score: scores.saving },
    debt:     { score: scores.credit },
    spending: { score: scores.spending },
    literacy: { score: scores.literacy },
  };

  return (
    <div style={{ animation: 'fadeIn var(--dur-base) var(--ease-out)' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 12,
        }}>
          Your starting point
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          color: 'var(--fg-1)',
          margin: '0 0 8px',
        }}>
          {archetype}
        </h1>
        <p style={{
          fontSize: 15,
          color: 'var(--fg-2)',
          margin: '0 0 4px',
          lineHeight: 1.6,
        }}>
          {payload.archetype === 'Fresh start'
            ? 'Every financial expert started exactly where you are. Your journey begins now.'
            : payload.archetype === 'Building foundations'
            ? 'You have some awareness and are ready to build real knowledge on top of it.'
            : payload.archetype === 'Growing confident'
            ? "You understand the basics. Now it's about applying them consistently."
            : payload.archetype === 'Financially aware'
            ? 'You have solid foundations. A few targeted areas will accelerate your growth.'
            : payload.archetype === 'Well informed'
            ? 'You are well-informed across most areas. FinLit will help you go from awareness to mastery.'
            : 'You have strong financial knowledge. FinLit will help you optimize and go deeper.'}
        </p>
        <div style={{ fontSize: 13, color: 'var(--fg-3)', fontStyle: 'italic' }}>
          Tree stage: {treeStage}
        </div>
      </div>

      {/* Tree + Pillars */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
        marginBottom: 28,
      }}>
        <div style={{
          background: 'var(--surface-low)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ResultTree literacyScore={scores.literacy} pillars={pillarsForTree} />
        </div>

        <div style={{
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          padding: '20px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          justifyContent: 'center',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 4,
          }}>
            Your knowledge profile
          </div>
          {['banking', 'credit', 'saving', 'investing'].map(pillar => (
            <PillarMiniBar key={pillar} pillar={pillar} score={scores[pillar]} />
          ))}
        </div>
      </div>

      {/* Next steps */}
      <div style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        padding: '20px 22px',
        marginBottom: 28,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 14,
        }}>
          Recommended learning path
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recommendedModules.slice(0, 3).map((moduleId, i) => (
            <NextStepCard key={moduleId} moduleId={moduleId} rank={i} />
          ))}
        </div>
      </div>

      {submitError && (
        <div style={{
          background: 'var(--danger-bg)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: 16,
          fontSize: 14,
          color: 'var(--danger)',
        }}>
          {submitError}
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <Button
          variant="primary"
          size="lg"
          onClick={onSubmit}
          disabled={submitting}
          style={{ minWidth: 240 }}
        >
          {submitting ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 14, height: 14,
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 1s linear infinite',
              }} />
              Saving your profile…
            </span>
          ) : 'Go to my dashboard →'}
        </Button>
        <p style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 10 }}>
          Your tree can only grow from here.
        </p>
      </div>
    </div>
  );
}
