import React, { useEffect } from 'react';
import { getGameState } from '../api/GameState.api';
import { Board } from '../features/board';
import { Chat } from '../features/chat';
import { Players, useGameMercure, normalizeGameState } from '../features/game';
import type { GameState } from '../types/gameState.type';

const BoardPage = () => {
    const [state, setState] = React.useState<GameState | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    useGameMercure({ gameId: state?.gameId, setState });

    useEffect(() => {
        let isMounted = true;

        const loadGameState = async () => {
            try {
                const data = await getGameState();
                if (!isMounted) {
                    return;
                }

                const normalizedData = normalizeGameState(data);
                setState(normalizedData);
            } catch {
                if (!isMounted) {
                    return;
                }

                setError('Unable to load board state.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadGameState();

        return () => {
            isMounted = false;
        };
    }, []);

    const players = state?.players ?? [];
    const positions = state?.positions ?? [];

    const playerPositions = players
        .map((player) => {
            if (typeof player.position !== 'number') {
                return null;
            }

            return {
                username: player.username,
                color: player.color,
                position: player.position,
            };
        })
        .filter((player): player is { username: string; color: string; position: number } => player !== null);

    return (
        <div className="board-page flex flex-row gap-4 justify-between w-full py-4">
            {isLoading && <p>Loading board state...</p>}
            {error && <p>{error}</p>}

            {!isLoading && !error && state && (
                <>
                    <Players players={players}></Players>
                    <Board
                        positions={positions}
                        playerPositions={playerPositions}
                        gameState={state}
                        onGameStateRefresh={(nextState) => setState(nextState)}
                    ></Board>
                </>
            )}

            <Chat></Chat>
        </div>
    )
}

export default BoardPage