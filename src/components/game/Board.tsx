import { useEffect, useRef } from 'react';

const Board = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.width = 800;
    canvas.height = 600;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(300, 180);
    ctx.lineTo(500, 180);
    ctx.lineTo(400, 380);
    ctx.closePath();
    ctx.stroke();

    const trianglePoints = [
      { x: 300, y: 180 },
      { x: 500, y: 180 },
      { x: 400, y: 380 },
    ];

    const centroid = {
      x: (trianglePoints[0].x + trianglePoints[1].x + trianglePoints[2].x) / 3,
      y: (trianglePoints[0].y + trianglePoints[1].y + trianglePoints[2].y) / 3,
    };

    const drawRectPairForSide = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = Math.hypot(dx, dy);
      if (length === 0) {
        return;
      }

      const tx = dx / length;
      const ty = dy / length;
      const nxA = -ty;
      const nyA = tx;
      const nxB = ty;
      const nyB = -tx;

      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;

      const distance = 28;
      const centerAX = midX + nxA * distance;
      const centerAY = midY + nyA * distance;
      const centerBX = midX + nxB * distance;
      const centerBY = midY + nyB * distance;

      const distA = Math.hypot(centerAX - centroid.x, centerAY - centroid.y);
      const distB = Math.hypot(centerBX - centroid.x, centerBY - centroid.y);

      const nx = distA > distB ? nxA : nxB;
      const ny = distA > distB ? nyA : nyB;

      const pairOffset = 42;
      const shortSide = 28;
      const longSide = 64;

      const rect1CenterX = midX + nx * distance + tx * pairOffset;
      const rect1CenterY = midY + ny * distance + ty * pairOffset;
      const rect2CenterX = midX + nx * distance - tx * pairOffset;
      const rect2CenterY = midY + ny * distance - ty * pairOffset;

      const angle = Math.atan2(ty, tx);
      const drawRotatedRect = (centerX: number, centerY: number) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.strokeRect(-shortSide / 2, -longSide / 2, shortSide, longSide);
        ctx.restore();
      };

      drawRotatedRect(rect1CenterX, rect1CenterY);
      drawRotatedRect(rect2CenterX, rect2CenterY);
    };

    drawRectPairForSide(trianglePoints[0], trianglePoints[1]);
    drawRectPairForSide(trianglePoints[1], trianglePoints[2]);
    drawRectPairForSide(trianglePoints[2], trianglePoints[0]);
  }, []);

  return (
    <canvas ref={canvasRef} id="game-board" width={800} height={600} style={{ border: '1px solid black' }}>
      Your browser does not support the HTML5 canvas element.
    </canvas>
  )
}

export default Board;