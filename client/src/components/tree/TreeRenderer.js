function lerp(min, max, t) {
  return min + (max - min) * Math.min(1, Math.max(0, t));
}

function getTrunkColor(score) {
  if (score < 20) return '#D3D1C7';
  if (score < 40) return '#B4B2A9';
  if (score < 60) return '#9FE1CB';
  if (score < 80) return '#5DCAA5';
  return '#1D9E75';
}

function getLeafColor(score) {
  if (score < 20) return '#D3D1C7';
  if (score < 35) return '#C0DD97';
  if (score < 55) return '#97C459';
  if (score < 75) return '#639922';
  return '#27500A';
}

function getGroundColor(score) {
  if (score < 25) return '#B4B2A9';
  if (score < 50) return '#C0DD97';
  if (score < 75) return '#97C459';
  return '#639922';
}

function drawGround(ctx, x, groundY, score, W) {
  const gw = W * 0.55;
  const gh = gw * 0.12;
  ctx.fillStyle = getGroundColor(score);
  ctx.beginPath();
  ctx.ellipse(x, groundY, gw / 2, gh, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dry cracks when savings < 20
  if (score < 25) {
    ctx.strokeStyle = 'rgba(80,60,40,0.35)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 5; i++) {
      const cx = x - gw * 0.3 + i * (gw * 0.15);
      ctx.beginPath();
      ctx.moveTo(cx, groundY);
      ctx.lineTo(cx + (Math.random() - 0.5) * 14, groundY + 4);
      ctx.lineTo(cx + (Math.random() - 0.5) * 10, groundY + 9);
      ctx.stroke();
    }
  }
}

function drawRoots(ctx, x, baseY, spread, numRoots, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let i = 0; i < numRoots; i++) {
    const angle = Math.PI * (0.15 + 0.7 * (i / Math.max(numRoots - 1, 1)));
    const ex = x + Math.cos(angle) * spread;
    const ey = baseY + Math.sin(angle) * (spread * 0.35);
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(x + (ex - x) * 0.5, baseY + 6, ex, ey);
    ctx.stroke();
  }
}

function drawLeafCluster(ctx, cx, cy, r, color, animTime, idx) {
  const sway = Math.sin(animTime * 0.001 + idx) * 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx + sway, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // secondary blobs for fullness
  ctx.beginPath();
  ctx.arc(cx + sway - r * 0.55, cy + r * 0.3, r * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + sway + r * 0.55, cy + r * 0.3, r * 0.72, 0, Math.PI * 2);
  ctx.fill();
}

function drawFruits(ctx, cx, canopyY, canopyR, numFruits, animTime) {
  ctx.fillStyle = '#E85454';
  for (let i = 0; i < numFruits; i++) {
    const angle = (i / numFruits) * Math.PI * 2;
    const fx = cx + Math.cos(angle) * canopyR * 0.65;
    const fy = canopyY + Math.sin(angle) * canopyR * 0.5 + Math.sin(animTime * 0.0008 + i) * 1.5;
    ctx.beginPath();
    ctx.arc(fx, fy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBirds(ctx, cx, canopyY, canopyR, numBirds, animTime) {
  ctx.strokeStyle = '#1a3a20';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < numBirds; i++) {
    const bx = cx - canopyR + (i / numBirds) * canopyR * 1.8 + 10;
    const by = canopyY - canopyR * 0.6 - i * 8;
    const flap = Math.sin(animTime * 0.006 + i * 2) * 3;
    ctx.beginPath();
    ctx.moveTo(bx - 6, by + flap);
    ctx.quadraticCurveTo(bx, by, bx + 6, by + flap);
    ctx.stroke();
  }
}

function drawSparkles(ctx, cx, canopyY, canopyR, animTime) {
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + animTime * 0.0005;
    const sx = cx + Math.cos(angle) * (canopyR + 10);
    const sy = canopyY + Math.sin(angle) * (canopyR * 0.6);
    const opacity = 0.5 + Math.sin(animTime * 0.003 + i) * 0.5;
    ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCracks(ctx, trunkX, trunkBaseY, trunkH, trunkW, debtScore) {
  if (debtScore >= 30) return;
  const severity = 1 - debtScore / 30;
  const numCracks = Math.ceil(severity * 4);
  ctx.strokeStyle = `rgba(80,60,40,${0.3 + severity * 0.4})`;
  ctx.lineWidth = 0.8 + severity;
  for (let i = 0; i < numCracks; i++) {
    const sx = trunkX - trunkW * 0.3 + (i / numCracks) * trunkW * 0.6;
    const sy = trunkBaseY - trunkH * (0.2 + i * 0.15);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (((i * 3.7) % 1) - 0.5) * 6, sy - trunkH * 0.08);
    ctx.lineTo(sx + (((i * 7.3) % 1) - 0.5) * 8, sy - trunkH * 0.16);
    ctx.stroke();
  }
}

function drawFallingLeaves(ctx, cx, canopyY, canopyR, spendingScore, animTime) {
  if (spendingScore >= 25) return;
  const severity = 1 - spendingScore / 25;
  const numLeaves = Math.ceil(severity * 6);
  ctx.fillStyle = `rgba(186,117,23,${0.5 + severity * 0.3})`;
  for (let i = 0; i < numLeaves; i++) {
    const phase = (animTime * 0.0004 + i * 0.7) % 1;
    const lx = cx + Math.sin(phase * Math.PI * 2 + i) * canopyR * 0.8;
    const ly = canopyY + phase * canopyR * 2.5;
    const size = 3 + severity * 3;
    ctx.beginPath();
    ctx.ellipse(lx, ly, size, size * 0.6, phase * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawTree(ctx, { x, groundY, score, pillars, animTime, W }) {
  const t = score / 100;

  // Nothing for score < 15
  if (score < 15) {
    // Just a bare patch
    drawGround(ctx, x, groundY, score, W || ctx.canvas.width);
    return;
  }

  const trunkH     = lerp(10, 120, t);
  const trunkW     = lerp(4, 18, t);
  const canopyR    = lerp(12, 58, t);
  const rootSpread = lerp(12, 65, t);
  const numRoots   = Math.floor(lerp(0, 5, t));

  const trunkColor = getTrunkColor(score);
  const leafColor  = getLeafColor(score);

  drawGround(ctx, x, groundY, score, W || ctx.canvas.width);

  // Roots
  drawRoots(ctx, x, groundY, rootSpread, numRoots, trunkColor);

  // Trunk (rounded rect)
  const trunkTop = groundY - trunkH;
  ctx.fillStyle = trunkColor;
  ctx.beginPath();
  const r = trunkW / 2;
  ctx.moveTo(x - r, groundY);
  ctx.lineTo(x - r, trunkTop + r);
  ctx.quadraticCurveTo(x - r, trunkTop, x, trunkTop);
  ctx.quadraticCurveTo(x + r, trunkTop, x + r, trunkTop + r);
  ctx.lineTo(x + r, groundY);
  ctx.closePath();
  ctx.fill();

  // Cracks (debt < 30)
  const debtScore = pillars?.debt?.score ?? 100;
  drawCracks(ctx, x, groundY, trunkH, trunkW, debtScore);

  // Canopy — seed stage just draws a small bump
  if (score >= 15) {
    const canopyY = trunkTop;

    // Mid side clusters (score > 40)
    if (score > 40) {
      drawLeafCluster(ctx, x - canopyR * 0.75, canopyY + canopyR * 0.2, canopyR * 0.55, leafColor, animTime, 1);
      drawLeafCluster(ctx, x + canopyR * 0.75, canopyY + canopyR * 0.2, canopyR * 0.55, leafColor, animTime, 2);
    }

    // Lower side clusters (score > 65)
    if (score > 65) {
      drawLeafCluster(ctx, x - canopyR * 0.9, canopyY + canopyR * 0.6, canopyR * 0.42, leafColor, animTime, 3);
      drawLeafCluster(ctx, x + canopyR * 0.9, canopyY + canopyR * 0.6, canopyR * 0.42, leafColor, animTime, 4);
    }

    // Main top cluster
    drawLeafCluster(ctx, x, canopyY, canopyR, leafColor, animTime, 0);

    // Fruits (score > 55 and savings > 60)
    const savingsScore = pillars?.savings?.score ?? 0;
    if (score > 55 && savingsScore > 60) {
      const numFruits = Math.floor(lerp(0, 9, (score - 55) / 45));
      drawFruits(ctx, x, canopyY, canopyR, numFruits, animTime);
    }

    // Birds (score > 78 and literacy > 65)
    const literacyScore = pillars?.literacy?.score ?? 0;
    if (score > 78 && literacyScore > 65) {
      const numBirds = Math.floor(lerp(0, 3, (score - 78) / 22));
      drawBirds(ctx, x, canopyY, canopyR, numBirds, animTime);
    }

    // Sparkles (score > 92)
    if (score > 92) {
      drawSparkles(ctx, x, canopyY, canopyR, animTime);
    }

    // Falling leaves (spending < 25)
    const spendingScore = pillars?.spending?.score ?? 100;
    drawFallingLeaves(ctx, x, canopyY, canopyR, spendingScore, animTime);
  }
}
