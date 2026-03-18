export type Point = {
  x: number;
  y: number;
};

export type RotatedRectangle = {
  id: number;
  centerX: number;
  centerY: number;
  shortSide: number;
  longSide: number;
  angle: number;
};

export type Triangle = [Point, Point, Point];

export const BOARD_CANVAS_WIDTH = 800;
export const BOARD_CANVAS_HEIGHT = 600;
export const TRIANGLE_TOP_SIDE_LENGTH = 300;
export const TRIANGLE_OPPOSITE_ANGLE_DEG = 53.13;
export const RECT_SHORT_SIDE = 120;
export const RECT_LONG_SIDE = Math.floor(RECT_SHORT_SIDE * 1.4);
export const RECT_PAIR_OFFSET = 10 + Math.floor(RECT_SHORT_SIDE / 2);
export const MAX_CIRCLES_PER_RECTANGLE = 8;
export const CIRCLE_RADIUS = 14;
export const MAX_PLACEMENT_ATTEMPTS = 200;

export const getContrastingTextColor = (hexColor: string) => {
  const sanitized = hexColor.replace('#', '');
  const red = parseInt(sanitized.slice(0, 2), 16);
  const green = parseInt(sanitized.slice(2, 4), 16);
  const blue = parseInt(sanitized.slice(4, 6), 16);
  const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;

  return luminance > 160 ? '#111111' : '#f8fafc';
};

export const buildMainTriangle = (
  canvasWidth: number,
  canvasHeight: number,
): Triangle | null => {
  const triangleCenterX = canvasWidth / 2;
  const halfTopSide = TRIANGLE_TOP_SIDE_LENGTH / 2;
  const oppositeAngleRad = (TRIANGLE_OPPOSITE_ANGLE_DEG * Math.PI) / 180;
  const height = halfTopSide / Math.tan(oppositeAngleRad / 2);

  if (!Number.isFinite(height) || height <= 0) {
    return null;
  }

  const canvasCenterY = canvasHeight / 2;
  const triangleTopY = canvasCenterY - height / 3;

  const topLeft = { x: triangleCenterX - halfTopSide, y: triangleTopY };
  const topRight = { x: triangleCenterX + halfTopSide, y: triangleTopY };
  const bottom = { x: triangleCenterX, y: triangleTopY + height };

  return [topLeft, topRight, bottom];
};

export const randomPointInRectangle = (
  rectangle: RotatedRectangle,
  radius: number,
): Point => {
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

export const isPointInsideRotatedRect = (
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
