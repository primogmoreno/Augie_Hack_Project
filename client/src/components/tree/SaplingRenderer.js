function lerp(min, max, t) {
  return min + (max - min) * Math.min(1, Math.max(0, t));
}

function getSaplingTrunkColor(score) {
  if (score < 16) return '#C5CDD6';
  if (score < 36) return '#7FBFBF';
  if (score < 61) return '#3BA8A8';
  if (score < 81) return '#1A7F8E';
  return '#0F5F70';
}

function getSaplingLeafColor(score) {
  if (score < 16) return '#BDD4C0';
  if (score < 36) return '#7FC9B3';
  if (score < 61) return '#3DA899';
  if (score < 81) return '#1D8A7A';
  return '#0B5E55';
}

function drawSaplingBoundary(ctx, x, groundY, radius) {
  ctx.strokeStyle = 'rgba(128,128,128,0.18)';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.ellipse(x, groundY, radius, radius * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawSaplingLabel(ctx, x, groundY, hasAccount) {
  ctx.fillStyle = hasAccount ? 'rgba(31,122,107,0.6)' : 'rgba(180,100,20,0.6)';
  ctx.font = '10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(hasAccount ? 'Investments' : 'Start investing', x, groundY + 22);
}

function drawLeafBlob(ctx, cx, cy, r, color, animTime, idx) {
  const sway = Math.sin(animTime * 0.0012 + idx + 2) * 1.5;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx + sway, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

export function drawSapling(ctx, { x, groundY, score, hasAccount, animTime }) {
  const SCALE = 0.4;
  const boundaryR = 36;

  drawSaplingBoundary(ctx, x, groundY, boundaryR);
  drawSaplingLabel(ctx, x, groundY, hasAccount);

  if (!hasAccount || score === 0) {
    // Bare patch with question mark
    ctx.fillStyle = '#B4B2A9';
    ctx.beginPath();
    ctx.ellipse(x, groundY, boundaryR * 0.7, boundaryR * 0.7 * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(150,140,130,0.7)';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', x, groundY - 12);
    return;
  }

  const t           = score / 100;
  const trunkH      = lerp(8, 120 * SCALE, t);
  const trunkW      = lerp(3, 18 * SCALE, t);
  const canopyR     = lerp(6, 58 * SCALE, t);
  const trunkColor  = getSaplingTrunkColor(score);
  const leafColor   = getSaplingLeafColor(score);

  // Ground patch
  ctx.fillStyle = score > 50 ? '#7FC9B3' : '#BDD4C0';
  ctx.beginPath();
  ctx.ellipse(x, groundY, boundaryR * 0.75, boundaryR * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trunk
  const trunkTop = groundY - trunkH;
  ctx.fillStyle = trunkColor;
  const r = trunkW / 2;
  ctx.beginPath();
  ctx.moveTo(x - r, groundY);
  ctx.lineTo(x - r, trunkTop + r);
  ctx.quadraticCurveTo(x - r, trunkTop, x, trunkTop);
  ctx.quadraticCurveTo(x + r, trunkTop, x + r, trunkTop + r);
  ctx.lineTo(x + r, groundY);
  ctx.closePath();
  ctx.fill();

  const canopyY = trunkTop;

  if (score < 16) {
    // Just 1-2 tiny leaves
    drawLeafBlob(ctx, x, canopyY, canopyR, leafColor, animTime, 0);
  } else if (score < 36) {
    // Small sprout
    drawLeafBlob(ctx, x - canopyR * 0.45, canopyY + canopyR * 0.2, canopyR * 0.6, leafColor, animTime, 1);
    drawLeafBlob(ctx, x + canopyR * 0.45, canopyY + canopyR * 0.2, canopyR * 0.6, leafColor, animTime, 2);
    drawLeafBlob(ctx, x, canopyY, canopyR, leafColor, animTime, 0);
  } else if (score < 61) {
    // Defined canopy
    drawLeafBlob(ctx, x - canopyR * 0.55, canopyY + canopyR * 0.25, canopyR * 0.7, leafColor, animTime, 1);
    drawLeafBlob(ctx, x + canopyR * 0.55, canopyY + canopyR * 0.25, canopyR * 0.7, leafColor, animTime, 2);
    drawLeafBlob(ctx, x, canopyY, canopyR, leafColor, animTime, 0);
  } else if (score < 81) {
    // Branch structure + small fruits
    drawLeafBlob(ctx, x - canopyR * 0.7, canopyY + canopyR * 0.35, canopyR * 0.7, leafColor, animTime, 1);
    drawLeafBlob(ctx, x + canopyR * 0.7, canopyY + canopyR * 0.35, canopyR * 0.7, leafColor, animTime, 2);
    drawLeafBlob(ctx, x, canopyY, canopyR, leafColor, animTime, 0);
    // Mini fruits
    ctx.fillStyle = '#56C0A0';
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const fx = x + Math.cos(angle) * canopyR * 0.55;
      const fy = canopyY + Math.sin(angle) * canopyR * 0.45 + Math.sin(animTime * 0.0009 + i) * 1.2;
      ctx.beginPath();
      ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Thriving mini tree
    drawLeafBlob(ctx, x - canopyR * 0.8, canopyY + canopyR * 0.45, canopyR * 0.65, leafColor, animTime, 3);
    drawLeafBlob(ctx, x + canopyR * 0.8, canopyY + canopyR * 0.45, canopyR * 0.65, leafColor, animTime, 4);
    drawLeafBlob(ctx, x - canopyR * 0.65, canopyY + canopyR * 0.15, canopyR * 0.8, leafColor, animTime, 1);
    drawLeafBlob(ctx, x + canopyR * 0.65, canopyY + canopyR * 0.15, canopyR * 0.8, leafColor, animTime, 2);
    drawLeafBlob(ctx, x, canopyY, canopyR, leafColor, animTime, 0);

    // Sparkles
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + animTime * 0.0006;
      const sx = x + Math.cos(angle) * (canopyR + 6);
      const sy = canopyY + Math.sin(angle) * (canopyR * 0.5);
      const opacity = 0.5 + Math.sin(animTime * 0.004 + i) * 0.5;
      ctx.fillStyle = `rgba(100, 220, 200, ${opacity})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
