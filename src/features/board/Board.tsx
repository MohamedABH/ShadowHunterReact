import { useEffect, useState } from 'react';
import type { BoardProps } from '../../types/board.type';
import { PLAYER_COLORS, type PlayerColor } from '../../types/playerColor.type';
import {
  BOARD_CANVAS_HEIGHT,
  BOARD_CANVAS_WIDTH,
} from './boardCanvas.utils';
import { useBoardCanvas } from './useBoardCanvas';

const Board = ({ positions, playerPositions }: BoardProps) => {
  const {
    canvasRef,
    selectedRectangleLabel,
    usedColors,
    addCircleToSelectedRectangle,
    clearCircles,
  } = useBoardCanvas({ positions, playerPositions });

  const [selectedColor, setSelectedColor] = useState<PlayerColor>('red');

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
