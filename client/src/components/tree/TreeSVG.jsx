import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getStagePair, interpolateParams } from '../../utils/treeStages';
import {
  generateTrunk, generateCanopy, generateRoots, generateBranches,
  generateBlossoms, generateFruits, generateGround, generateGroundCracks,
  generateSeed, generateCotyledons, trunkTopOffset,
} from './treeGeometry';
import FallingLeaves from './layers/FallingLeaves';

// Viewbox chosen so the tree has headroom for tall stages and width for
// the wider canopy of the Mighty Oak.
const VB_W = 640;
const VB_H = 520;
const GROUND_Y = 430;
const TRUNK_X = VB_W * 0.36; // left-of-center so insights panel reads right

const LEAF_COLOR_HEALTHY = '#2F6B3B';
const LEAF_COLOR_DISTRESSED = '#b78a3a';
const BLOSSOM_COLOR = '#EDB3C6';
const FRUIT_COLOR = '#B83A2E';

function desaturateGreen(distress) {
  // Blend between healthy green and an amber/bronze as distress rises.
  const d = Math.max(0, Math.min(1, distress));
  return blendHex(LEAF_COLOR_HEALTHY, LEAF_COLOR_DISTRESSED, d);
}

function blendHex(a, b, t) {
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

export default function TreeSVG({ healthScore, mood, animTime = 0, label }) {
  // Interpolated stage parameters based on current healthScore.
  const params = useMemo(() => {
    const { from, to, t } = getStagePair(healthScore);
    return interpolateParams(from.params, to.params, t);
  }, [healthScore]);

  // ── Core geometry
  const trunkD = useMemo(
    () => generateTrunk({
      baseX: TRUNK_X,
      baseY: GROUND_Y,
      height: params.trunkHeight ?? 0,
      width: params.trunkWidth ?? 0,
      bend: params.trunkBend ?? 0,
      bendSeed: 7,
    }),
    [params.trunkHeight, params.trunkWidth, params.trunkBend],
  );

  const trunkTopY = GROUND_Y - (params.trunkHeight ?? 0);
  const canopyOffsetX = trunkTopOffset({
    bend: params.trunkBend ?? 0,
    height: params.trunkHeight ?? 0,
    bendSeed: 7,
  });
  const canopyCenterX = TRUNK_X + canopyOffsetX;
  const canopyCenterY = trunkTopY - (params.canopyRadius ?? 0) * 0.4;

  const canopyD = useMemo(
    () => generateCanopy({
      centerX: canopyCenterX,
      centerY: canopyCenterY,
      radius: params.canopyRadius ?? 0,
      blobs: Math.round(params.canopyBlobs ?? 0),
      irregularity: 0.18,
      seed: 3,
    }),
    [canopyCenterX, canopyCenterY, params.canopyRadius, params.canopyBlobs],
  );

  // Branches — visible limbs for mid/late stages.
  const branches = useMemo(
    () => generateBranches({
      baseX: TRUNK_X,
      trunkTop: trunkTopY,
      trunkWidth: params.trunkWidth ?? 0,
      canopyRadius: params.canopyRadius ?? 0,
      count: Math.round(params.branchCount ?? 0),
      seed: 11,
    }),
    [trunkTopY, params.trunkWidth, params.canopyRadius, params.branchCount],
  );

  // Roots.
  const roots = useMemo(
    () => generateRoots({
      baseX: TRUNK_X,
      baseY: GROUND_Y,
      count: Math.round(params.rootCount ?? 0),
      spread: params.rootSpread ?? 0,
      seed: 5,
    }),
    [params.rootCount, params.rootSpread],
  );

  // Blossoms (blended from stage `hasBloom` AND live `mood.bloom`).
  const blossomDensity = Math.max(params.hasBloom ?? 0, mood?.bloom ?? 0);
  const blossoms = useMemo(
    () => generateBlossoms({
      centerX: canopyCenterX,
      centerY: canopyCenterY,
      radius: params.canopyRadius ?? 0,
      density: blossomDensity,
      seed: 17,
    }),
    [canopyCenterX, canopyCenterY, params.canopyRadius, blossomDensity],
  );

  // Fruits (stage thriving+).
  const fruits = useMemo(
    () => generateFruits({
      centerX: canopyCenterX,
      centerY: canopyCenterY,
      radius: params.canopyRadius ?? 0,
      density: params.hasFruit ?? 0,
      seed: 23,
    }),
    [canopyCenterX, canopyCenterY, params.canopyRadius, params.hasFruit],
  );

  // Ground + cracks.
  const groundD = generateGround({
    centerX: TRUNK_X,
    centerY: GROUND_Y,
    width: VB_W * 0.9,
    height: 22,
  });
  const cracks = useMemo(
    () => generateGroundCracks({
      centerX: TRUNK_X,
      centerY: GROUND_Y,
      width: VB_W * 0.9,
      severity: mood?.dryness ?? 0,
      seed: 31,
    }),
    [mood?.dryness],
  );

  // Leaf tint blended by distress.
  const leafColor = desaturateGreen(mood?.distress ?? 0);
  const canopyOpacity = 1 - 0.25 * (mood?.distress ?? 0);

  // Wind sway: a global rotate on the canopy/branches group driven by sin(animTime).
  const windAmp = 0.5 + (mood?.windAgitation ?? 0) * 2.5;
  const windAngle = Math.sin(animTime * 0.0011) * windAmp;

  // Seed / cotyledons (only visible at earliest stages).
  const showSeed = (params.trunkHeight ?? 0) < 10;
  const showCotyledons = (params.trunkHeight ?? 0) >= 10 && (params.trunkHeight ?? 0) < 35;
  const seedD = showSeed ? generateSeed({ baseX: TRUNK_X, baseY: GROUND_Y - 2 }) : '';
  const cotyledons = showCotyledons
    ? generateCotyledons({ baseX: TRUNK_X, topY: trunkTopY, size: 10 })
    : [];

  const groundColor = blendHex('#6b9475', '#c5b9a8', mood?.dryness ?? 0);

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
      role="img"
      aria-label={label ?? `Tree visualization at score ${Math.round(healthScore)}`}
    >
      <defs>
        <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3ecdf" />
          <stop offset="100%" stopColor="#f3f1eb" />
        </linearGradient>
        <radialGradient id="canopyShade" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
        </radialGradient>
      </defs>

      {/* Sky background */}
      <rect x="0" y="0" width={VB_W} height={GROUND_Y + 30} fill="url(#skyGradient)" />

      {/* Distant hills for scale */}
      <path
        d={`M 0 ${GROUND_Y - 10}
            Q ${VB_W * 0.25} ${GROUND_Y - 45} ${VB_W * 0.5} ${GROUND_Y - 20}
            Q ${VB_W * 0.75} ${GROUND_Y - 50} ${VB_W} ${GROUND_Y - 15}
            L ${VB_W} ${GROUND_Y} L 0 ${GROUND_Y} Z`}
        fill="rgba(23,49,36,0.06)"
      />

      {/* Ground */}
      <motion.path
        d={groundD}
        animate={{ fill: groundColor }}
        transition={{ duration: 0.6 }}
      />
      {cracks.map((d, i) => (
        <path key={`crack-${i}`} d={d} stroke="rgba(80,60,40,0.5)" strokeWidth="0.9" fill="none" />
      ))}

      {/* Roots (under trunk) */}
      <g>
        {roots.map((d, i) => (
          <motion.path
            key={`root-${i}`}
            d={d}
            stroke={params.trunkColor ?? '#8b7a5c'}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ duration: 0.8, delay: i * 0.08 }}
          />
        ))}
      </g>

      {/* Seed (barren / seed stage) */}
      {seedD && <path d={seedD} fill="#5a4525" />}

      {/* Trunk */}
      {trunkD && (
        <motion.path
          d={trunkD}
          animate={{ fill: params.trunkColor ?? '#8b7a5c' }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Bark texture hints (vertical stripes) at higher stages */}
      {params.barkTexture > 0 && (
        <g opacity={params.barkTexture * 0.4}>
          {[-0.25, 0, 0.25].map((f, i) => (
            <line
              key={`bark-${i}`}
              x1={TRUNK_X + f * params.trunkWidth}
              y1={trunkTopY + 10}
              x2={TRUNK_X + f * params.trunkWidth}
              y2={GROUND_Y - 6}
              stroke="rgba(40,30,15,0.5)"
              strokeWidth="0.8"
            />
          ))}
        </g>
      )}

      {/* Branches + canopy group — swayed by wind */}
      <motion.g
        style={{
          transformOrigin: `${TRUNK_X}px ${trunkTopY}px`,
        }}
        animate={{ rotate: windAngle }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
      >
        {/* Branches */}
        {branches.map((b, i) => (
          <motion.path
            key={`branch-${i}`}
            d={b.d}
            stroke={params.trunkColor ?? '#8b7a5c'}
            strokeWidth={b.width}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.1 * i }}
          />
        ))}

        {/* Cotyledons (seedling stage) */}
        {cotyledons.map((d, i) => (
          <path key={`cot-${i}`} d={d} fill="#8fae55" />
        ))}

        {/* Canopy */}
        {canopyD && (
          <motion.path
            d={canopyD}
            animate={{ fill: leafColor, opacity: canopyOpacity }}
            transition={{ duration: 0.7 }}
          />
        )}
        {canopyD && (
          <path d={canopyD} fill="url(#canopyShade)" opacity={canopyOpacity} />
        )}

        {/* Blossoms (bloom overlay + stage) */}
        {blossoms.map((b, i) => (
          <motion.circle
            key={`blossom-${i}`}
            cx={b.x}
            cy={b.y}
            r={b.r}
            fill={BLOSSOM_COLOR}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.95 }}
            transition={{ duration: 0.4, delay: 0.02 * i }}
          />
        ))}

        {/* Fruits (thriving+) */}
        {fruits.map((f, i) => (
          <motion.circle
            key={`fruit-${i}`}
            cx={f.x}
            cy={f.y + Math.sin(animTime * 0.001 + i) * 1.2}
            r={f.r}
            fill={FRUIT_COLOR}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.05 * i }}
          />
        ))}
      </motion.g>

      {/* Falling leaves overlay (outside the swaying group) */}
      <FallingLeaves
        intensity={mood?.distress ?? 0}
        centerX={canopyCenterX}
        centerY={canopyCenterY}
        radius={params.canopyRadius ?? 0}
        animTime={animTime}
        groundY={GROUND_Y}
        leafColor={LEAF_COLOR_DISTRESSED}
      />
    </svg>
  );
}
