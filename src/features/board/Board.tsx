import { useEffect, useState } from 'react';
import type { BoardProps } from '../../types/board.type';
import { PLAYER_COLORS, type PlayerColor } from '../../types/playerColor.type';
import { getUsername } from '../../utils/auth';
import {
  getTurnPhase,
  phaseLabel,
  playCurrentTurnPhase,
  normalizeGameState,
  selectCurrentTurnContext,
} from '../game';
import { getGameState } from '../../api/GameState.api';
import {
  BOARD_CANVAS_HEIGHT,
  BOARD_CANVAS_WIDTH,
} from './boardCanvas.utils';
import { useBoardCanvas } from './useBoardCanvas';

const Board = ({ positions, playerPositions, gameState, onGameStateRefresh }: BoardProps) => {
  const {
    canvasRef,
    selectedRectangleLabel,
    usedColors,
    addCircleToSelectedRectangle,
    clearCircles,
  } = useBoardCanvas({ positions, playerPositions });

  const [selectedColor, setSelectedColor] = useState<PlayerColor>('red');
  const [isPlayingTurn, setIsPlayingTurn] = useState(false);
  const [turnError, setTurnError] = useState<string | null>(null);

  const currentUsername = getUsername();
  const { currentPlayer, isCurrentTurnPlayer } = selectCurrentTurnContext(gameState, currentUsername);
  const currentTurnPhase = gameState ? getTurnPhase(gameState) : null;
  const currentTurnPlayer = gameState?.players.find(
    (player) => player.id === gameState.currentPlayerId,
  ) ?? null;

  const addCircle = () => {
    const added = addCircleToSelectedRectangle(selectedColor);
    if (!added) {
      return;
    }

    const nextAvailableColor = PLAYER_COLORS.find((color) => !usedColors.includes(color));
    if (nextAvailableColor) {
      setSelectedColor(nextAvailableColor);
    }
  };

  useEffect(() => {
    if (!usedColors.includes(selectedColor)) {
      return;
    }

    const nextAvailableColor = PLAYER_COLORS.find((color) => !usedColors.includes(color));
    if (nextAvailableColor) {
      setSelectedColor(nextAvailableColor);
    }
  }, [selectedColor, usedColors]);

  const handlePlayTurn = async () => {
    if (!gameState) {
      return;
    }

    const turnPhase = getTurnPhase(gameState);
    if (!turnPhase) {
      setTurnError('Unknown turn phase.');
      return;
    }

    setIsPlayingTurn(true);
    setTurnError(null);

    try {
      const turnResult = await playCurrentTurnPhase(gameState);

      if (!turnResult.executed) {
        setTurnError(turnResult.cancelMessage ?? `${phaseLabel(turnResult.phase)} input was cancelled or invalid.`);
        return;
      }

      const refreshedState = await getGameState();
      const normalizedRefreshedState = normalizeGameState(refreshedState);
      onGameStateRefresh(normalizedRefreshedState);
    } catch {
      setTurnError(`Unable to execute ${phaseLabel(turnPhase)} phase.`);
    } finally {
      setIsPlayingTurn(false);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-row justify-around gap-2">
      <div className="w-fit">
        <div className="flex gap-2">
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

        {turnError && <p>{turnError}</p>}

        <div className="mt-2">
          <p>Current turn player: {currentTurnPlayer?.username ?? 'Unknown'}</p>
          <p>Current phase: {currentTurnPhase ? phaseLabel(currentTurnPhase) : 'Unknown'}</p>
          <p>You: {currentPlayer?.username ?? 'Unknown'}</p>
        </div>

        {isCurrentTurnPlayer && (
          <div className="mt-2">
            <button
              type="button"
              onClick={handlePlayTurn}
              disabled={isPlayingTurn || !currentTurnPhase}
            >
              {isPlayingTurn
                ? `Playing ${currentTurnPhase ? phaseLabel(currentTurnPhase) : 'turn'}...`
                : `${currentTurnPhase ? phaseLabel(currentTurnPhase) : 'Play'} turn`}
            </button>
          </div>
        )}

        <div>
          Selected rectangle: {selectedRectangleLabel ?? 'None'}
        </div>

        <canvas
          ref={canvasRef}
          id="game-board"
          width={BOARD_CANVAS_WIDTH}
          height={BOARD_CANVAS_HEIGHT}
          className="block self-start border border-black"
        >
          Your browser does not support the HTML5 canvas element.
        </canvas>
      </div>
    </div>
  )
}

export default Board;
