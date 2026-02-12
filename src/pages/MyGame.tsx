import React, { useEffect } from 'react'
import { getGameState } from '../api/GameState.api';
import type { GameState } from '../types/gameState.type';

const MyGame: React.FC = () => {

    const [state, setState] = React.useState<GameState | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    useEffect(() => {
        let isMounted: boolean = true;
    
        const loadGameState = async () => {
          try {
            const data = await getGameState();
            if (isMounted) {
              setState(data);
              console.log("Game state response:", data);
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

    return (
        <div>
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
