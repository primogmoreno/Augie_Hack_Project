import { useRef, useEffect, useCallback } from 'react';
import { drawTree } from './TreeRenderer';
import { drawSapling } from './SaplingRenderer';

export default function TreeCanvas({ healthData, animationTime }) {
  const canvasRef = useRef(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const groundY = H - 30;

    drawTree(ctx, {
      x: W * 0.38,
      groundY,
      score:    healthData.healthScore,
      pillars:  healthData.pillars,
      animTime: animationTime,
      W,
    });

    drawSapling(ctx, {
      x:          W * 0.78,
      groundY,
      score:      healthData.sapling?.score ?? 0,
      hasAccount: healthData.sapling?.hasInvestmentAccount ?? false,
      animTime:   animationTime,
    });
  }, [healthData, animationTime]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      render();
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    render();
    return () => ro.disconnect();
  }, [render]);

  const score = healthData.healthScore;
  const stage = healthData.stageName;

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
      role="img"
      aria-label={`Financial health tree. Score: ${score} out of 100. Stage: ${stage}. ${healthData.stageDescription}`}
    />
  );
}
