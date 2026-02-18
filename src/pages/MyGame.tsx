import React, { useEffect } from 'react'
import axios from 'axios';
import { getGameState } from '../api/GameState.api';
import type { GameState } from '../types/gameState.type';
import { getUsername } from '../utils/auth';

type TurnPlayedUpdate = {
  type: 'turn_played';
  gameId: number;
  playerId: number;
  roll: string;
  position: {
    id: number;
    number: number;
  };
  turn: number;
  nextPlayerId: number | null;
};

const MyGame: React.FC = () => {

    const [state, setState] = React.useState<GameState | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isPlayingTurn, setIsPlayingTurn] = React.useState(false);

    useEffect(() => {
        let isMounted: boolean = true;
    
        const loadGameState = async () => {
          try {
            const data = await getGameState();
            if (isMounted) {
              // Normalize positions to numbers if they come as objects
              const normalizedData = {
                ...data,
                players: data.players.map(player => ({
                  ...player,
                  position: typeof player.position === 'object' && player.position !== null
                    ? (player.position as any).number
                    : player.position
                }))
              };
              setState(normalizedData);
              console.log("Game state response:", normalizedData);
            }
          } catch (err) {
            if (isMounted) {
              setError("Unable to load game state.");
            }
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

    useEffect(() => {
      if (!state?.gameId) {
        return;
      }

      const hubUrl = new URL("/.well-known/mercure", window.location.origin);
      hubUrl.searchParams.append("topic", `game/${state.gameId}`);

      const source = new EventSource(hubUrl.toString(), { withCredentials: true });

      source.onmessage = (event) => {
        try {
          const payload: TurnPlayedUpdate = JSON.parse(event.data);
          if (payload.type !== 'turn_played') {
            return;
          }

          setState((prev) => {
            if (!prev || prev.gameId !== payload.gameId) {
              return prev;
            }

            const updatedPlayers = prev.players.map((player) =>
              player.id === payload.playerId
                ? { ...player, position: payload.position.number }
                : player
            );

            const positionIndex = prev.positions.findIndex(
              (position) => position.id === payload.position.id
            );

            const updatedPositions = positionIndex === -1
              ? [
                ...prev.positions,
                { id: payload.position.id, number: payload.position.number, placeCard: null },
              ]
              : prev.positions.map((position) =>
                position.id === payload.position.id
                  ? { ...position, number: payload.position.number }
                  : position
              );

            return {
              ...prev,
              turn: payload.turn,
              currentPlayerId: payload.nextPlayerId ?? prev.currentPlayerId,
              players: updatedPlayers,
              positions: updatedPositions,
            };
          });
        } catch (err) {
          console.error("Unable to parse Mercure update", err);
        }
      };

      return () => {
        source.close();
      };
    }, [state?.gameId]);

    const currentUsername = getUsername();
    const currentPlayer = state?.players.find((player) => player.username === currentUsername) ?? null;
    const isCurrentTurnPlayer = Boolean(
      state && currentPlayer && state.currentPlayerId === currentPlayer.id
    );

    const handlePlayTurn = async () => {
      if (!state) {
        return;
      }

      setIsPlayingTurn(true);
      setError(null);

      try {
        await axios.post(`api/game/${state.gameId}/turn/play`, null, { withCredentials: true });
      } catch (err) {
        setError("Unable to play the turn.");
      } finally {
        setIsPlayingTurn(false);
      }
    };

    return (
        <div className="text-parchment-900">
            {isLoading && <p>Loading game state...</p>}
            {error && <p>{error}</p>}
            {!isLoading && !error && state && (
              <table>
                <thead>
                  <tr>
                    <th>Game ID</th>
                    <th>Status</th>
                    <th>Turn</th>
                    <th>Current Player</th>
                  </tr>
                </thead>
                <tbody>
                  <React.Fragment key={state.gameId}>
                    <tr>
                      <td>{state.gameId}</td>
                      <td>{state.gameStatus}</td>
                      <td>{state.turn}</td>
                      <td>{state.currentPlayerId}</td>
                    </tr>
                    {isCurrentTurnPlayer && (
                      <tr>
                        <td colSpan={4}>
                          <button
                            type="button"
                            onClick={handlePlayTurn}
                            disabled={isPlayingTurn}
                          >
                            {isPlayingTurn ? "Playing turn..." : "Play turn"}
                          </button>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={4}>
                        <div>
                          <h3>Players</h3>
                          {state.players.length === 0 ? (
                            <p>—</p>
                          ) : (
                            <table>
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Username</th>
                                  <th>Color</th>
                                  <th>Revealed</th>
                                  <th>Character</th>
                                  <th>Position</th>
                                  <th>Damage</th>
                                  <th>Order</th>
                                  <th>Equipments</th>
                                </tr>
                              </thead>
                              <tbody>
                                {state.players.map((player) => (
                                  <tr key={player.id}>
                                    <td>{player.id}</td>
                                    <td>{player.username}</td>
                                    <td>{player.color}</td>
                                    <td>{player.revealed ? "Yes" : "No"}</td>
                                    <td>{player.characterCard?.name ?? "—"}</td>
                                    <td>{player.position ?? "—"}</td>
                                    <td>{player.currentDamage}</td>
                                    <td>{player.playingOrder}</td>
                                    <td>
                                      {player.equipments.length === 0
                                        ? "—"
                                        : player.equipments
                                            .map((card) => card.name)
                                            .join(", ")}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                        <div>
                          <h3>Positions</h3>
                          {state.positions.length === 0 ? (
                            <p>—</p>
                          ) : (
                            <table>
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Number</th>
                                  <th>Place Card</th>
                                </tr>
                              </thead>
                              <tbody>
                                {state.positions.map((position) => (
                                  <tr key={position.id}>
                                    <td>{position.id}</td>
                                    <td>{position.number}</td>
                                    <td>{position.placeCard?.name ?? "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                </tbody>
              </table>
            )}
        </div>
    )
}

export default MyGame
