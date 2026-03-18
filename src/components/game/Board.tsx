import { useEffect, useRef, useState } from 'react';
import type { BoardApi, BoardProps } from '../../types/board.type';
import {
  PLAYER_COLORS,
  PLAYER_COLOR_INITIALS,
  PLAYER_COLOR_VALUES,
  type PlayerColor,
  isPlayerColor,
} from '../../types/playerColor.type';

type Point = {
  x: number;
  y: number;
};

type RotatedRectangle = {
  id: number;
  centerX: number;
  centerY: number;
  shortSide: number;
  longSide: number;
  angle: number;
};

type Triangle = [Point, Point, Point];

type CircleMarker = {
  x: number;
  y: number;
  radius: number;
  color: PlayerColor;
  rectangleId: number;
};

declare global {
  interface Window {
    boardApi?: BoardApi;
  }
}

const getContrastingTextColor = (hexColor: string) => {
  const sanitized = hexColor.replace('#', '');
  const red = parseInt(sanitized.slice(0, 2), 16);
  const green = parseInt(sanitized.slice(2, 4), 16);
  const blue = parseInt(sanitized.slice(4, 6), 16);
  const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;

  return luminance > 160 ? '#111111' : '#f8fafc';
};

const Board = ({ positions, playerPositions }: BoardProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedRectangleLabel, setSelectedRectangleLabel] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<PlayerColor>('red');
  const [usedColors, setUsedColors] = useState<PlayerColor[]>([]);

  const addCircle = () => {
    const added = window.boardApi?.addCircleToSelectedRectangle(selectedColor);
    if (!added) {
      return;
    }

    const nextAvailableColor = PLAYER_COLORS.find((color) => !usedColors.includes(color));
    if (nextAvailableColor) {
      setSelectedColor(nextAvailableColor);
    }
  };

  const clearCircles = () => {
    window.boardApi?.clearCircles();
  };

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

    const topSideLength = 300;
    const oppositeAngleDeg = 53.13;

    const triangleCenterX = canvas.width / 2;
    const halfTopSide = topSideLength / 2;
    const oppositeAngleRad = (oppositeAngleDeg * Math.PI) / 180;
    const height = halfTopSide / Math.tan(oppositeAngleRad / 2);

    if (!Number.isFinite(height) || height <= 0) {
      return;
    }

    const canvasCenterY = canvas.height / 2;
    const triangleTopY = canvasCenterY - height / 3;

    const topLeft = { x: triangleCenterX - halfTopSide, y: triangleTopY };
    const topRight = { x: triangleCenterX + halfTopSide, y: triangleTopY };
    const bottom = { x: triangleCenterX, y: triangleTopY + height };

    const mainTriangle: Triangle = [topLeft, topRight, bottom];
    const circles: CircleMarker[] = [];
    const maxCirclesPerRectangle = 8;
    const circleRadius = 14;
    const maxPlacementAttempts = 200;

    let rectangles: RotatedRectangle[] = [];

    let selectedRectangleId: number | null = null;

    const randomPointInRectangle = (rectangle: RotatedRectangle, radius: number): Point => {
      const safeHalfWidth = rectangle.shortSide / 2 - radius;
      const safeHalfHeight = rectangle.longSide / 2 - radius;

      const localX = (Math.random() * 2 - 1) * safeHalfWidth;
      const localY = (Math.random() * 2 - 1) * safeHalfHeight;

      const cos = Math.cos(rectangle.angle);
      const sin = Math.sin(rectangle.angle);

      return {
        x: rectangle.centerX + localX * cos - localY * sin,
        y: rectangle.centerY + localX * sin + localY * cos,
      };
    };

    const drawRectPairForSide = (
      a: Point,
      b: Point,
      centroid: Point,
      nextRectangleIdRef: { value: number },
    ) => {
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

      const shortSide = 120; // Short side of the rectangles
      const longSide = Math.floor(shortSide*1.4); // Long side of the rectangles
      const distance = longSide / 2; // So the short side sits exactly on the triangle side
      const centerAX = midX + nxA * distance;
      const centerAY = midY + nyA * distance;
      const centerBX = midX + nxB * distance;
      const centerBY = midY + nyB * distance;

      const distA = Math.hypot(centerAX - centroid.x, centerAY - centroid.y);
      const distB = Math.hypot(centerBX - centroid.x, centerBY - centroid.y);

      const nx = distA > distB ? nxA : nxB;
      const ny = distA > distB ? nyA : nyB;

      const pairOffset = 10 + Math.floor(shortSide/2); // Distance between the two rectangles in the pair

      const rect1CenterX = midX + nx * distance + tx * pairOffset;
      const rect1CenterY = midY + ny * distance + ty * pairOffset;
      const rect2CenterX = midX + nx * distance - tx * pairOffset;
      const rect2CenterY = midY + ny * distance - ty * pairOffset;

      const angle = Math.atan2(ty, tx);
      const drawRotatedRect = (centerX: number, centerY: number) => {
        const rectangleId = nextRectangleIdRef.value;
        rectangles.push({
          id: rectangleId,
          centerX,
          centerY,
          shortSide,
          longSide,
          angle,
        });
        nextRectangleIdRef.value += 1;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        if (selectedRectangleId === rectangleId) {
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 3;
        } else {
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 2;
        }
        ctx.strokeRect(-shortSide / 2, -longSide / 2, shortSide, longSide);
        ctx.restore();
      };

      drawRotatedRect(rect1CenterX, rect1CenterY);
      drawRotatedRect(rect2CenterX, rect2CenterY);
    };

    const drawScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.moveTo(mainTriangle[0].x, mainTriangle[0].y);
      ctx.lineTo(mainTriangle[1].x, mainTriangle[1].y);
      ctx.lineTo(mainTriangle[2].x, mainTriangle[2].y);
      ctx.closePath();
      ctx.stroke();

      const centroid = {
        x: (mainTriangle[0].x + mainTriangle[1].x + mainTriangle[2].x) / 3,
        y: (mainTriangle[0].y + mainTriangle[1].y + mainTriangle[2].y) / 3,
      };

      rectangles = [];
      const nextRectangleIdRef = { value: 1 };
      drawRectPairForSide(mainTriangle[0], mainTriangle[1], centroid, nextRectangleIdRef);
      drawRectPairForSide(mainTriangle[1], mainTriangle[2], centroid, nextRectangleIdRef);
      drawRectPairForSide(mainTriangle[2], mainTriangle[0], centroid, nextRectangleIdRef);

      for (const circle of circles) {
        const circleColor = PLAYER_COLOR_VALUES[circle.color];
        const circleInitial = PLAYER_COLOR_INITIALS[circle.color];

        ctx.beginPath();
        ctx.fillStyle = circleColor;
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = getContrastingTextColor(circleColor);
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(circleInitial, circle.x, circle.y);
      }

      const uniqueUsedColors = [...new Set(circles.map((circle) => circle.color))] as PlayerColor[];
      setUsedColors(uniqueUsedColors);
    };

    const addCircleToRectangle = (rectangleId: number, color: string) => {
      const normalizedColor = color.trim().toLowerCase();
      if (!isPlayerColor(normalizedColor)) {
        return false;
      }

      const colorAlreadyUsed = circles.some((circle) => circle.color === normalizedColor);
      if (colorAlreadyUsed) {
        return false;
      }

      const rectangle = rectangles.find((item) => item.id === rectangleId);
      if (!rectangle) {
        return false;
      }

      const currentCount = circles.filter((circle) => circle.rectangleId === rectangleId).length;

      if (currentCount >= maxCirclesPerRectangle) {
        return false;
      }

      let placedPoint: Point | null = null;
      for (let attempt = 0; attempt < maxPlacementAttempts; attempt += 1) {
        const candidate = randomPointInRectangle(rectangle, circleRadius);
        const overlapsExisting = circles.some((circle) => {
          const distance = Math.hypot(candidate.x - circle.x, candidate.y - circle.y);
          return distance < circleRadius + circle.radius;
        });

        if (!overlapsExisting) {
          placedPoint = candidate;
          break;
        }
      }

      if (!placedPoint) {
        return false;
      }

      circles.push({
        x: placedPoint.x,
        y: placedPoint.y,
        radius: circleRadius,
        color: normalizedColor,
        rectangleId,
      });
      drawScene();
      return true;
    };

    const addCircleToSelectedRectangle = (color: string) => {
      if (selectedRectangleId === null) {
        return false;
      }

      return addCircleToRectangle(selectedRectangleId, color);
    };

    const clearCircles = () => {
      circles.length = 0;
      drawScene();
    };

    const autoPopulateCirclesFromPlayers = () => {
      const validPositions = positions
        .map((position) => position.number)
        .filter((positionNumber) => Number.isInteger(positionNumber));

      const validRectangleIds = new Set(
        validPositions.length > 0 ? validPositions : [1, 2, 3, 4, 5, 6],
      );

      for (const player of playerPositions) {
        if (!validRectangleIds.has(player.position)) {
          continue;
        }

        addCircleToRectangle(player.position, player.color);
      }
    };

    window.boardApi = {
      addCircleToRectangle,
      addCircleToSelectedRectangle,
      clearCircles,
    };

    drawScene();
    autoPopulateCirclesFromPlayers();

    const isPointInsideRotatedRect = (
      pointX: number,
      pointY: number,
      rectangle: RotatedRectangle,
    ) => {
      const translatedX = pointX - rectangle.centerX;
      const translatedY = pointY - rectangle.centerY;

      const cos = Math.cos(-rectangle.angle);
      const sin = Math.sin(-rectangle.angle);

      const localX = translatedX * cos - translatedY * sin;
      const localY = translatedX * sin + translatedY * cos;

      return (
        Math.abs(localX) <= rectangle.shortSide / 2 &&
        Math.abs(localY) <= rectangle.longSide / 2
      );
    };

    const onCanvasClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clickX = (event.clientX - rect.left) * scaleX;
      const clickY = (event.clientY - rect.top) * scaleY;

      const clickedRectangle = rectangles.find((rectangle) =>
        isPointInsideRotatedRect(clickX, clickY, rectangle),
      );

      if (clickedRectangle) {
        selectedRectangleId = clickedRectangle.id;
        setSelectedRectangleLabel(clickedRectangle.id);
        drawScene();
        console.log(clickedRectangle.id);
      }
    };

    canvas.addEventListener('click', onCanvasClick);

    return () => {
      canvas.removeEventListener('click', onCanvasClick);
      if (window.boardApi) {
        delete window.boardApi;
      }
    };
  }, []);

  useEffect(() => {
    if (!usedColors.includes(selectedColor)) {
      return;
    }

    const nextAvailableColor = PLAYER_COLORS.find((color) => !usedColors.includes(color));
    if (nextAvailableColor) {
      setSelectedColor(nextAvailableColor);
    }
  }, [selectedColor, usedColors]);

  return (
    <div className="flex w-full flex-1 flex-row justify-around gap-2">
      <div className='w-fit'>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={selectedColor} onChange={(event) => setSelectedColor(event.target.value as PlayerColor)}>
            {PLAYER_COLORS.map((color) => (
              <option key={color} value={color} disabled={usedColors.includes(color)}>
                {color}
              </option>
            ))}
          </select>
          <button type="button" onClick={addCircle}>Add Circle</button>
          <button type="button" onClick={clearCircles}>Clear Circles</button>
        </div>

        <div>
          Selected rectangle: {selectedRectangleLabel ?? 'None'}
        </div>

        <canvas
          ref={canvasRef}
          id="game-board"
          width={800}
          height={600}
          className="self-start"
          style={{ border: '1px solid black', width: 800, height: 600 }}
        >
          Your browser does not support the HTML5 canvas element.
        </canvas>
      </div>
    </div>
  )
}

export default Board;