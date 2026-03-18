import type { GameState } from './gameState.type';

export type BoardPosition = {
  number: number;
};

export type PlayerPosition = {
  username: string;
  color: string;
  position: number;
};

export type BoardProps = {
  positions: BoardPosition[];
  playerPositions: PlayerPosition[];
  gameState: GameState | null;
  onGameStateRefresh: (nextState: GameState) => void;
};

export type BoardApi = {
  addCircleToRectangle: (rectangleId: number, color: string) => boolean;
  addCircleToSelectedRectangle: (color: string) => boolean;
  clearCircles: () => void;
};
