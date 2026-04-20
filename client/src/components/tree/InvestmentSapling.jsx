import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  generateTrunk, generateCanopy, generateFruits, generateBlossoms,
} from './treeGeometry';

// A small, separate sapling beside/beneath the header showing how the
// user's investment habits are growing. Keyed off sapling.score (0-100)
// from /api/health/tree-data.

const VB_W = 200;
const VB_H = 200;
const TRUNK_X = VB_W / 2;
const GROUND_Y = VB_H - 20;

function paramsForScore(score, hasInvestmentAccount) {
  if (!hasInvestmentAccount) {
    return { trunkH: 0, trunkW: 0, canopyR: 0, blobs: 0, color: '#b7ad99' };
  }
  const s = Math.max(0, Math.min(100, score));
  const t = s / 100;
  return {
    trunkH: 8 + t * 70,
    trunkW: 2 + t * 6,
    canopyR: 6 + t * 32,
    blobs: Math.round(1 + t * 3),
    color: blend('#9fa86b', '#2f6b3b', t),
  };
}

function blend(a, b, t) {
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
  return `#${Math.round(ar + (br - ar) * t).toString(16).padStart(2, '0')}${Math.round(ag + (bg - ag) * t).toString(16).padStart(2, '0')}${Math.round(ab + (bb - ab) * t).toString(16).padStart(2, '0')}`;
}

export default function InvestmentSapling({ score = 0, hasInvestmentAccount = false, contributionConsistency = 0 }) {
  const p = paramsForScore(score, hasInvestmentAccount);

  const trunkD = useMemo(() => generateTrunk({
    baseX: TRUNK_X, baseY: GROUND_Y,
    height: p.trunkH, width: p.trunkW, bend: 0.05, bendSeed: 2,
  }), [p.trunkH, p.trunkW]);

  const topY = GROUND_Y - p.trunkH;
  const canopyD = useMemo(() => generateCanopy({
    centerX: TRUNK_X, centerY: topY - p.canopyR * 0.35,
    radius: p.canopyR, blobs: p.blobs, seed: 4,
  }), [topY, p.canopyR, p.blobs]);

  const blossoms = useMemo(
    () => generateBlossoms({
      centerX: TRUNK_X, centerY: topY - p.canopyR * 0.35,
      radius: p.canopyR,
      density: contributionConsistency * 0.5,
      seed: 9,
    }),
    [topY, p.canopyR, contributionConsistency],
  );

  const fruits = useMemo(
    () => generateFruits({
      centerX: TRUNK_X, centerY: topY - p.canopyR * 0.35,
      radius: p.canopyR, density: score > 70 ? 0.6 : 0, seed: 12,
    }),
    [topY, p.canopyR, score],
  );

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
      role="img"
      aria-label={hasInvestmentAccount
        ? `Investment sapling growing at score ${Math.round(score)}`
        : 'No investment account connected'}
    >
      {/* Dashed boundary circle */}
      <circle
        cx={VB_W / 2} cy={VB_H / 2} r={VB_W / 2 - 8}
        fill="none" stroke="rgba(23,49,36,0.18)" strokeWidth={1} strokeDasharray="3 4"
      />

      {/* Ground line */}
      <ellipse cx={TRUNK_X} cy={GROUND_Y} rx={VB_W * 0.35} ry={5} fill="rgba(47,139,90,0.25)" />

      {!hasInvestmentAccount && (
        <>
          <circle cx={TRUNK_X} cy={GROUND_Y - 4} r={4} fill="#8b6d43" />
          <text
            x={VB_W / 2} y={GROUND_Y + 18}
            textAnchor="middle"
            fontSize={10}
            fontFamily="var(--font-sans)"
            fill="var(--fg-3)"
          >
            No investment yet
          </text>
        </>
      )}

      {hasInvestmentAccount && (
        <>
          {trunkD && (
            <motion.path d={trunkD} animate={{ fill: p.color }} transition={{ duration: 0.5 }} />
          )}
          {canopyD && (
            <motion.path
              d={canopyD}
              animate={{ fill: p.color }}
              transition={{ duration: 0.6 }}
            />
          )}
          {blossoms.map((b, i) => (
            <circle key={`sb-${i}`} cx={b.x} cy={b.y} r={b.r * 0.8} fill="#EDB3C6" opacity={0.9} />
          ))}
          {fruits.map((f, i) => (
            <circle key={`sf-${i}`} cx={f.x} cy={f.y} r={f.r * 0.9} fill="#B83A2E" />
          ))}
        </>
      )}
    </svg>
  );
}
