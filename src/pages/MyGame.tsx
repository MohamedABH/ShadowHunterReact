import React, { useEffect } from 'react'
import { getGameState } from '../api/GameState.api';
import type { GameState } from '../types/gameState.type';
import { getUsername } from '../utils/auth';
import { getTurnPhase, phaseLabel, playCurrentTurnPhase } from '../services/turnPlay.service';
import { normalizeGameState, selectCurrentTurnContext } from '../services/gameState.service';
import { useGameMercure } from '../hooks/useGameMercure';


const MyGame: React.FC = () => {

    const [state, setState] = React.useState<GameState | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isPlayingTurn, setIsPlayingTurn] = React.useState(false);

    useGameMercure({ gameId: state?.gameId, setState });

    useEffect(() => {
        let isMounted: boolean = true;
    
        const loadGameState = async () => {
          try {
            const data = await getGameState();
            if (isMounted) {
              const normalizedData = normalizeGameState(data);
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

    const currentUsername = getUsername();
    const { isCurrentTurnPlayer } = selectCurrentTurnContext(state, currentUsername);
    const currentTurnPhase = state ? getTurnPhase(state) : null;

    const handlePlayTurn = async () => {
      if (!state) {
        return;
      }

      const turnPhase = getTurnPhase(state);
      if (!turnPhase) {
        setError("Unknown turn phase.");
        return;
      }

      setIsPlayingTurn(true);
      setError(null);

      try {
        const turnResult = await playCurrentTurnPhase(state);

        if (!turnResult.executed) {
          setError(turnResult.cancelMessage ?? `${phaseLabel(turnResult.phase)} input was cancelled or invalid.`);
          return;
        }

        const refreshedState = await getGameState();
        const normalizedRefreshedState = normalizeGameState(refreshedState);
        setState(normalizedRefreshedState);
        console.log('Game state refreshed after phase:', normalizedRefreshedState);
      } catch (err) {
        setError(`Unable to execute ${phaseLabel(turnPhase)} phase.`);
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
                            disabled={isPlayingTurn || !currentTurnPhase}
                          >
                            {isPlayingTurn
                              ? `Playing ${currentTurnPhase ? phaseLabel(currentTurnPhase) : 'turn'}...`
                              : `${currentTurnPhase ? phaseLabel(currentTurnPhase) : 'Play'} turn`}
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
                            <div className="grid gap-4">
                              {state.positions.map((position) => {
                                const playersOnPosition = state.players.filter(
                                  (player) => player.position === position.number
                                );

                                return (
                                  <article key={position.id} className="rounded border p-4">
                                    <h4>Position {position.number}</h4>
                                    <p>ID: {position.id}</p>
                                    <p>Place Card: {position.placeCard?.name ?? "—"}</p>
                                    <p>Roll: {position.placeCard?.roll ?? "—"}</p>

                                    <div>
                                      <strong>Players here</strong>
                                      {playersOnPosition.length === 0 ? (
                                        <p>—</p>
                                      ) : (
                                        <ul>
                                          {playersOnPosition.map((player) => (
                                            <li key={player.id}>
                                              {player.username} (ID: {player.id}, Color: {player.color})
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  </article>
                                );
                              })}
                            </div>
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
