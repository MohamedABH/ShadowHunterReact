import { useEffect, useRef, useState, type RefObject } from 'react';
import type { BoardApi } from '../../types/board.type';
import type { BoardPosition, PlayerPosition } from '../../types/board.type';
import {
  PLAYER_COLOR_INITIALS,
  PLAYER_COLOR_VALUES,
  type PlayerColor,
  isPlayerColor,
} from '../../types/playerColor.type';
import {
  BOARD_CANVAS_HEIGHT,
  BOARD_CANVAS_WIDTH,
  CIRCLE_RADIUS,
  MAX_CIRCLES_PER_RECTANGLE,
  MAX_PLACEMENT_ATTEMPTS,
  RECT_LONG_SIDE,
  RECT_PAIR_OFFSET,
  RECT_SHORT_SIDE,
  buildMainTriangle,
  getContrastingTextColor,
  isPointInsideRotatedRect,
  randomPointInRectangle,
  type Point,
  type RotatedRectangle,
} from './boardCanvas.utils';

type CircleMarker = {
  x: number;
  y: number;
  radius: number;
  color: PlayerColor;
  rectangleId: number;
  source: 'manual' | 'player';
  playerKey?: string;
};

type PendingRectangle = Omit<RotatedRectangle, 'id'>;

type UseBoardCanvasParams = {
  positions: BoardPosition[];
  playerPositions: PlayerPosition[];
};

type UseBoardCanvasResult = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  selectedRectangleLabel: number | null;
  usedColors: PlayerColor[];
  addCircleToSelectedRectangle: (color: PlayerColor) => boolean;
  clearCircles: () => void;
};

declare global {
  interface Window {
    boardApi?: BoardApi;
  }
}

export const useBoardCanvas = ({
  positions,
  playerPositions,
}: UseBoardCanvasParams): UseBoardCanvasResult => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedRectangleLabel, setSelectedRectangleLabel] = useState<number | null>(null);
  const [usedColors, setUsedColors] = useState<PlayerColor[]>([]);

  const addCircleToSelectedRef = useRef<(color: PlayerColor) => boolean>(() => false);
  const clearCirclesRef = useRef<() => void>(() => {});
  const circlesRef = useRef<CircleMarker[]>([]);
  const playerCirclesByKeyRef = useRef<Record<string, CircleMarker>>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.width = BOARD_CANVAS_WIDTH;
    canvas.height = BOARD_CANVAS_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const mainTriangle = buildMainTriangle(canvas.width, canvas.height);
    if (!mainTriangle) {
      return;
    }

    const circles = circlesRef.current;
    let rectangles: RotatedRectangle[] = [];
    let pendingRectangles: PendingRectangle[] = [];
    let selectedRectangleId: number | null = null;

    const drawRectPairForSide = (a: Point, b: Point, centroid: Point) => {
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

      const distance = RECT_LONG_SIDE / 2;
      const centerAX = midX + nxA * distance;
      const centerAY = midY + nyA * distance;
      const centerBX = midX + nxB * distance;
      const centerBY = midY + nyB * distance;

      const distA = Math.hypot(centerAX - centroid.x, centerAY - centroid.y);
      const distB = Math.hypot(centerBX - centroid.x, centerBY - centroid.y);

      const nx = distA > distB ? nxA : nxB;
      const ny = distA > distB ? nyA : nyB;

      const rect1CenterX = midX + nx * distance + tx * RECT_PAIR_OFFSET;
      const rect1CenterY = midY + ny * distance + ty * RECT_PAIR_OFFSET;
      const rect2CenterX = midX + nx * distance - tx * RECT_PAIR_OFFSET;
      const rect2CenterY = midY + ny * distance - ty * RECT_PAIR_OFFSET;

      const angle = Math.atan2(ty, tx);
      const pushRectangle = (centerX: number, centerY: number) => {
        pendingRectangles.push({
          centerX,
          centerY,
          shortSide: RECT_SHORT_SIDE,
          longSide: RECT_LONG_SIDE,
          angle,
        });
      };

      pushRectangle(rect1CenterX, rect1CenterY);
      pushRectangle(rect2CenterX, rect2CenterY);
    };

    const assignClockwiseRectangleIds = (pendingRectangles: PendingRectangle[], centroid: Point) => {
      const twoPi = Math.PI * 2;
      const clockwiseFromTop = (rectangle: PendingRectangle) => {
        const dx = rectangle.centerX - centroid.x;
        const dy = rectangle.centerY - centroid.y;
        const rawAngle = Math.atan2(dx, -dy);
        return (rawAngle + twoPi) % twoPi;
      };

      const sorted = [...pendingRectangles].sort(
        (left, right) => clockwiseFromTop(left) - clockwiseFromTop(right),
      );

      const startIndex = sorted.length > 1 ? 1 : 0;
      return sorted.map((_, index) => {
        const rectangle = sorted[(startIndex + index) % sorted.length];
        return {
          id: index + 1,
          ...rectangle,
        };
      });
    };

    const drawRectangle = (rectangle: RotatedRectangle) => {
      ctx.save();
      ctx.translate(rectangle.centerX, rectangle.centerY);
      ctx.rotate(rectangle.angle);
      if (selectedRectangleId === rectangle.id) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
      }
      ctx.strokeRect(
        -rectangle.shortSide / 2,
        -rectangle.longSide / 2,
        rectangle.shortSide,
        rectangle.longSide,
      );
      ctx.restore();
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

      pendingRectangles = [];
      drawRectPairForSide(mainTriangle[0], mainTriangle[1], centroid);
      drawRectPairForSide(mainTriangle[1], mainTriangle[2], centroid);
      drawRectPairForSide(mainTriangle[2], mainTriangle[0], centroid);
      rectangles = assignClockwiseRectangleIds(pendingRectangles, centroid);

      for (const rectangle of rectangles) {
        drawRectangle(rectangle);
      }

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
      if (currentCount >= MAX_CIRCLES_PER_RECTANGLE) {
        return false;
      }

      let placedPoint: Point | null = null;
      for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt += 1) {
        const candidate = randomPointInRectangle(rectangle, CIRCLE_RADIUS);
        const overlapsExisting = circles.some((circle) => {
          const distance = Math.hypot(candidate.x - circle.x, candidate.y - circle.y);
          return distance < CIRCLE_RADIUS + circle.radius;
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
        radius: CIRCLE_RADIUS,
        color: normalizedColor,
        rectangleId,
        source: 'manual',
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
      playerCirclesByKeyRef.current = {};
      drawScene();
    };

    const tryPlacePlayerCircle = (
      rectangle: RotatedRectangle,
      color: PlayerColor,
      blockedCircles: CircleMarker[],
    ): CircleMarker | null => {
      let placedPoint: Point | null = null;

      for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt += 1) {
        const candidate = randomPointInRectangle(rectangle, CIRCLE_RADIUS);
        const overlapsExisting = blockedCircles.some((circle) => {
          const distance = Math.hypot(candidate.x - circle.x, candidate.y - circle.y);
          return distance < CIRCLE_RADIUS + circle.radius;
        });

        if (!overlapsExisting) {
          placedPoint = candidate;
          break;
        }
      }

      if (!placedPoint) {
        return null;
      }

      return {
        x: placedPoint.x,
        y: placedPoint.y,
        radius: CIRCLE_RADIUS,
        color,
        rectangleId: rectangle.id,
        source: 'player',
      };
    };

    const syncPlayerCirclesFromPlayers = () => {
      const manualCircles = circles.filter((circle) => circle.source === 'manual');
      const nextPlayerCircles: CircleMarker[] = [];
      const nextPlayerByKey: Record<string, CircleMarker> = {};

      for (const player of playerPositions) {
        if (!isPlayerColor(player.color)) {
          continue;
        }

        const rectangle = rectangles.find((item) => item.id === player.position);
        if (!rectangle) {
          continue;
        }

        const blockedCircles = [...manualCircles, ...nextPlayerCircles];
        const previousCircle = playerCirclesByKeyRef.current[player.username];

        const canReusePreviousCircle =
          previousCircle &&
          previousCircle.rectangleId === player.position &&
          previousCircle.color === player.color &&
          isPointInsideRotatedRect(previousCircle.x, previousCircle.y, rectangle) &&
          !blockedCircles.some((circle) => {
            const distance = Math.hypot(previousCircle.x - circle.x, previousCircle.y - circle.y);
            return distance < previousCircle.radius + circle.radius;
          });

        const playerCircle = canReusePreviousCircle
          ? {
              ...previousCircle,
              source: 'player' as const,
              playerKey: player.username,
            }
          : (() => {
              const newCircle = tryPlacePlayerCircle(rectangle, player.color, blockedCircles);
              if (!newCircle) {
                return null;
              }

              return {
                ...newCircle,
                playerKey: player.username,
              };
            })();

        if (!playerCircle) {
          continue;
        }

        nextPlayerCircles.push(playerCircle);
        nextPlayerByKey[player.username] = playerCircle;
      }

      circles.length = 0;
      circles.push(...manualCircles, ...nextPlayerCircles);
      playerCirclesByKeyRef.current = nextPlayerByKey;
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
      }
    };

    addCircleToSelectedRef.current = (color) => addCircleToSelectedRectangle(color);
    clearCirclesRef.current = clearCircles;

    window.boardApi = {
      addCircleToRectangle,
      addCircleToSelectedRectangle,
      clearCircles,
    };

    drawScene();
    syncPlayerCirclesFromPlayers();
    drawScene();

    canvas.addEventListener('click', onCanvasClick);

    return () => {
      canvas.removeEventListener('click', onCanvasClick);
      if (window.boardApi) {
        delete window.boardApi;
      }
    };
  }, [playerPositions, positions]);

  return {
    canvasRef,
    selectedRectangleLabel,
    usedColors,
    addCircleToSelectedRectangle: (color: PlayerColor) =>
      addCircleToSelectedRef.current(color),
    clearCircles: () => clearCirclesRef.current(),
  };
};
