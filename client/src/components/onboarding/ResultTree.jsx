import TreeSVG from '../tree/TreeSVG';
import { useTreeAnimation } from '../../hooks/useTreeAnimation';
import { computeMood } from '../../utils/treeMood';

// Survey-result visualization. The literacy survey produces a literacy
// score but no bank-derived pillars, so we pass neutral mood values and
// let the stage speak for itself.
export default function ResultTree({ literacyScore, pillars }) {
  const animTime = useTreeAnimation();
  const mood = computeMood(pillars ?? {}, {});

  return (
    <div style={{ width: 220, height: 220, margin: '0 auto' }}>
      <TreeSVG
        healthScore={literacyScore}
        mood={mood}
        animTime={animTime}
        label={`Survey result tree at literacy score ${Math.round(literacyScore)}.`}
      />
    </div>
  );
}
