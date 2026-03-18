import type { GameState, Position } from '../types/gameState.type';

export type TurnPlayedUpdate = {
  type: 'turn_played';
  gameId: number;
  playerId?: number;
  roll?: string;
  position?: {
    id: number;
    number: number;
  };
  turn: number;
  nextPlayerId: number | null;
  turnPhase?: string;
  currentTurnRoll?: number;
};

export const normalizeGameState = (data: GameState): GameState => ({
  ...data,
  players: data.players.map((player) => ({
    ...player,
    position:
      typeof player.position === 'object' && player.position !== null
        ? (player.position as { number: number }).number
        : player.position,
  })),
});

export const parseTurnPlayedUpdate = (eventData: string): TurnPlayedUpdate | null => {
  const payload: unknown = JSON.parse(eventData);
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as Partial<TurnPlayedUpdate>;
  if (
    candidate.type !== 'turn_played' ||
    typeof candidate.gameId !== 'number' ||
    typeof candidate.turn !== 'number'
  ) {
    return null;
  }

  return candidate as TurnPlayedUpdate;
};

export const applyTurnPlayedUpdate = (
  previous: GameState,
  payload: TurnPlayedUpdate,
): GameState => {
  if (previous.gameId !== payload.gameId) {
    return previous;
  }

  const incomingPosition = payload.position;

  const updatedPlayers = previous.players.map((player) =>
    payload.playerId && incomingPosition && player.id === payload.playerId
      ? { ...player, position: incomingPosition.number }
      : player,
  );

  const updatedPositions: Position[] = !incomingPosition
    ? previous.positions
    : previous.positions.some((position) => position.id === incomingPosition.id)
    ? previous.positions.map((position) =>
        position.id === incomingPosition.id
          ? { ...position, number: incomingPosition.number }
          : position,
      )
    : [...previous.positions, { id: incomingPosition.id, number: incomingPosition.number, placeCard: null }];

  return {
    ...previous,
    turn: payload.turn,
    turnPhase: payload.turnPhase ?? previous.turnPhase,
    currentTurnRoll: payload.currentTurnRoll ?? previous.currentTurnRoll,
    currentPlayerId: payload.nextPlayerId ?? previous.currentPlayerId,
    players: updatedPlayers,
    positions: updatedPositions,
  };
};

export const selectCurrentTurnContext = (
  gameState: GameState | null,
  username: string,
) => {
  const currentPlayer =
    gameState?.players.find((player) => player.username === username) ?? null;

  const isCurrentTurnPlayer = Boolean(
    gameState && currentPlayer && gameState.currentPlayerId === currentPlayer.id,
  );

  return {
    currentPlayer,
    isCurrentTurnPlayer,
  };
};
