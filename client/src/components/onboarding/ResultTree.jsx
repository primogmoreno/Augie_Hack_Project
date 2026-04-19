import { useRef, useEffect } from 'react';
import { drawTree } from '../tree/TreeRenderer';
import { useTreeAnimation } from '../../hooks/useTreeAnimation';

export default function ResultTree({ literacyScore, pillars }) {
  const canvasRef = useRef(null);
  const animTime  = useTreeAnimation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    drawTree(ctx, {
      x: W / 2,
      groundY: H - 30,
      score: literacyScore,
      pillars: pillars ?? {},
      animTime,
      W,
    });
  }, [literacyScore, pillars, animTime]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      style={{ display: 'block', margin: '0 auto' }}
    />
  );
}
