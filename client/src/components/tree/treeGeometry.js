// Parametric SVG path generators for the tree visualization.
// All generators return path `d` strings (or coordinate lists) given a set
// of parameters from treeStages.js + interpolation. Pure functions — no
// DOM/React dependencies so they're cheap to call per-frame for animation.

// Deterministic pseudo-random so re-renders don't jitter the tree.
function rand(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// ────────────────────────────────────────────────────────────────────
// Trunk — tapered bezier from ground to a rounded top, with a gentle bend.
export function generateTrunk({
  baseX, baseY, height, width, bend, taper = 0.55, bendSeed = 1,
}) {
  if (height <= 0 || width <= 0) return '';
  const topW = Math.max(1.5, width * taper);
  const bendX = (rand(bendSeed) - 0.5) * bend * height * 2;
  const midY = baseY - height * 0.5;
  const topY = baseY - height;

  const bl = [baseX - width / 2, baseY];
  const br = [baseX + width / 2, baseY];
  const mr = [baseX + width / 2 + bendX * 0.4, midY];
  const tr = [baseX + topW / 2 + bendX, topY];
  const tl = [baseX - topW / 2 + bendX, topY];
  const ml = [baseX - width / 2 + bendX * 0.4, midY];
  const topRadius = topW / 2;

  return [
    `M ${bl[0]} ${bl[1]}`,
    `C ${ml[0]} ${ml[1] + height * 0.2}, ${ml[0]} ${midY}, ${ml[0]} ${midY}`,
    `C ${ml[0]} ${midY - height * 0.15}, ${tl[0]} ${topY + topRadius}, ${tl[0]} ${topY + topRadius}`,
    `Q ${tl[0]} ${topY}, ${baseX + bendX} ${topY}`,
    `Q ${tr[0]} ${topY}, ${tr[0]} ${topY + topRadius}`,
    `C ${tr[0]} ${topY + topRadius}, ${mr[0]} ${midY - height * 0.15}, ${mr[0]} ${midY}`,
    `C ${mr[0]} ${midY}, ${mr[0]} ${mr[1] + height * 0.2}, ${br[0]} ${br[1]}`,
    'Z',
  ].join(' ');
}

// The x-offset of the top of the trunk (for positioning the canopy).
export function trunkTopOffset({ bend, height, bendSeed = 1 }) {
  return (rand(bendSeed) - 0.5) * bend * height * 2;
}

// ────────────────────────────────────────────────────────────────────
// Canopy — composed of N overlapping circular blobs arranged in an arch.
// Returned as a single path with multiple circular arcs so Framer can
// morph it via flubber.
export function generateCanopy({
  centerX, centerY, radius, blobs, irregularity = 0.18, seed = 1,
}) {
  if (blobs <= 0 || radius <= 0) return '';

  // Build a ring of overlapping blob centers
  const points = [];
  // Top blob
  points.push({ x: centerX, y: centerY, r: radius * 1.0 });
  // Side blobs (lower)
  for (let i = 0; i < blobs - 1; i++) {
    const half = (blobs - 1) / 2;
    const t = (i - half) / Math.max(1, half);
    const angle = Math.PI * (0.5 + t * 0.45);
    const dist = radius * 0.75;
    const jitter = (rand(seed + i) - 0.5) * irregularity * radius;
    const cx = centerX + Math.cos(angle) * dist + jitter;
    const cy = centerY + Math.sin(angle) * dist * 0.55 + radius * 0.15;
    const r = radius * (0.55 + 0.2 * rand(seed + i + 10));
    points.push({ x: cx, y: cy, r });
  }

  // Render as concatenated circle sub-paths
  return points.map(p => circleSubPath(p.x, p.y, p.r)).join(' ');
}

function circleSubPath(cx, cy, r) {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
}

// ────────────────────────────────────────────────────────────────────
// Roots — radiating below ground.
export function generateRoots({ baseX, baseY, count, spread, seed = 1 }) {
  const paths = [];
  if (count <= 0) return paths;
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const angle = Math.PI * (0.15 + t * 0.7);
    const ex = baseX + Math.cos(angle) * spread;
    const ey = baseY + Math.sin(angle) * (spread * 0.35);
    const wobble = (rand(seed + i) - 0.5) * 5;
    const midX = baseX + (ex - baseX) * 0.5 + wobble;
    paths.push(
      `M ${baseX} ${baseY} Q ${midX} ${baseY + 6} ${ex} ${ey}`,
    );
  }
  return paths;
}

// ────────────────────────────────────────────────────────────────────
// Branches — visible limbs coming off the trunk, used on larger stages.
export function generateBranches({
  baseX, trunkTop, trunkWidth, canopyRadius, count, seed = 1,
}) {
  const branches = [];
  if (count <= 0) return branches;
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const heightPct = 0.35 + (i / count) * 0.55;
    const startX = baseX + side * trunkWidth * 0.3;
    const startY = trunkTop + (1 - heightPct) * 30;
    const endX = startX + side * canopyRadius * (0.6 + 0.2 * rand(seed + i));
    const endY = startY - canopyRadius * (0.2 + 0.25 * rand(seed + i + 3));
    const midX = (startX + endX) / 2;
    const midY = startY - Math.abs(endX - startX) * 0.4;
    branches.push({
      d: `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`,
      width: Math.max(1, trunkWidth * 0.25 * (1 - i / count)),
    });
  }
  return branches;
}

// ────────────────────────────────────────────────────────────────────
// Blossoms — small circles distributed inside the canopy bounds.
export function generateBlossoms({ centerX, centerY, radius, density, seed = 1 }) {
  const count = Math.round(density * 18);
  const out = [];
  for (let i = 0; i < count; i++) {
    const angle = rand(seed + i) * Math.PI * 2;
    const dist = rand(seed + i + 100) * radius * 0.95;
    const x = centerX + Math.cos(angle) * dist;
    const y = centerY + Math.sin(angle) * dist * 0.75;
    const r = 2 + rand(seed + i + 200) * 2.5;
    out.push({ x, y, r });
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────
// Fruits — red/orange orbs clustered on lower branches.
export function generateFruits({ centerX, centerY, radius, density, seed = 1 }) {
  const count = Math.round(density * 7);
  const out = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const dist = radius * (0.5 + 0.3 * rand(seed + i));
    const x = centerX + Math.cos(angle) * dist;
    const y = centerY + Math.sin(angle) * dist * 0.6 + radius * 0.2;
    out.push({ x, y, r: 3.5 });
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────
// Ground — an ellipse with optional cracks.
export function generateGround({ centerX, centerY, width, height }) {
  const rx = width / 2, ry = height / 2;
  return `M ${centerX - rx} ${centerY}
    A ${rx} ${ry} 0 1 0 ${centerX + rx} ${centerY}
    A ${rx} ${ry} 0 1 0 ${centerX - rx} ${centerY} Z`;
}

export function generateGroundCracks({ centerX, centerY, width, severity, seed = 1 }) {
  const out = [];
  if (severity <= 0.1) return out;
  const count = Math.max(2, Math.round(severity * 6));
  for (let i = 0; i < count; i++) {
    const x = centerX - width * 0.35 + (i / count) * width * 0.7 + (rand(seed + i) - 0.5) * 6;
    const d = `M ${x} ${centerY}
      L ${x + (rand(seed + i + 20) - 0.5) * 12} ${centerY + 3 + severity * 3}
      L ${x + (rand(seed + i + 40) - 0.5) * 10} ${centerY + 7 + severity * 5}`;
    out.push(d);
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────
// Seed + sprout — tiny visuals for the earliest stages.
export function generateSeed({ baseX, baseY }) {
  return `M ${baseX} ${baseY - 4}
    Q ${baseX + 4} ${baseY - 2} ${baseX} ${baseY + 2}
    Q ${baseX - 4} ${baseY - 2} ${baseX} ${baseY - 4} Z`;
}

export function generateCotyledons({ baseX, topY, size }) {
  const r = size;
  return [
    `M ${baseX} ${topY} Q ${baseX - r} ${topY - r * 0.5} ${baseX - r * 1.3} ${topY - r * 0.2}
     Q ${baseX - r * 0.6} ${topY + r * 0.2} ${baseX} ${topY} Z`,
    `M ${baseX} ${topY} Q ${baseX + r} ${topY - r * 0.5} ${baseX + r * 1.3} ${topY - r * 0.2}
     Q ${baseX + r * 0.6} ${topY + r * 0.2} ${baseX} ${topY} Z`,
  ];
}
