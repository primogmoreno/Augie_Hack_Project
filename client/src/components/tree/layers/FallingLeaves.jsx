// Falling leaf particles. Active when mood.distress > 0.
// Each leaf has a deterministic seed so leaves don't jitter between renders.

const NUM_LEAVES = 16;

function leafPosition({ seed, t, centerX, centerY, radius, groundY }) {
  // Spawn just inside the canopy, drift down and sideways.
  const spawnX = centerX + Math.sin(seed * 7.3) * radius * 0.9;
  const spawnY = centerY + Math.cos(seed * 3.1) * radius * 0.4;
  const duration = 4000 + (seed % 10) * 400;
  const phase = ((t + seed * 913) % duration) / duration;

  const driftX = Math.sin(phase * Math.PI * 2 + seed) * (30 + (seed % 5) * 10);
  const x = spawnX + driftX;
  const y = spawnY + phase * (groundY - spawnY + 20);
  const rot = phase * 360 + seed * 40;
  // Fade out near ground
  const alpha = phase < 0.85 ? 1 : 1 - (phase - 0.85) / 0.15;
  return { x, y, rot, alpha };
}

export default function FallingLeaves({
  intensity, centerX, centerY, radius, animTime, groundY, leafColor,
}) {
  if (intensity <= 0.05 || radius <= 0) return null;
  const activeCount = Math.ceil(intensity * NUM_LEAVES);

  return (
    <g pointerEvents="none">
      {Array.from({ length: activeCount }).map((_, i) => {
        const seed = i + 1;
        const { x, y, rot, alpha } = leafPosition({
          seed, t: animTime, centerX, centerY, radius, groundY,
        });
        const size = 3 + (seed % 3);
        return (
          <g key={`fl-${i}`} transform={`translate(${x} ${y}) rotate(${rot})`} opacity={alpha * intensity}>
            <ellipse cx={0} cy={0} rx={size} ry={size * 0.55} fill={leafColor} />
            <line x1={-size} y1={0} x2={size} y2={0} stroke="rgba(80,60,20,0.4)" strokeWidth={0.5} />
          </g>
        );
      })}
    </g>
  );
}
