import React, { useEffect } from 'react'
import { getGameState } from '../api/GameState.api';
import { turnAttack } from '../api/Turn/Attack.api';
import { turnEnd } from '../api/Turn/End.api';
import { turnMove } from '../api/Turn/Move.api';
import { turnPlaceAbility } from '../api/Turn/PlaceAbility.api';
import { turnRoll } from '../api/Turn/Roll.api';
import type { GameState } from '../types/gameState.type';
import { getUsername } from '../utils/auth';

type TurnPhase = 'roll' | 'move' | 'place_ability' | 'attack' | 'end';

type TurnPlayedUpdate = {
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

const normalizeGameState = (data: GameState): GameState => ({
  ...data,
  players: data.players.map((player) => ({
    ...player,
    position:
      typeof player.position === 'object' && player.position !== null
        ? (player.position as any).number
        : player.position,
  })),
});

type PlaceAbilityResponse = {
  effect?: {
    pendingActions?: {
      required?: string[];
    };
  };
};

const getTurnPhase = (gameState: GameState): TurnPhase | null => {
  const phaseSource = (
    (gameState as GameState & { turnPhase?: string }).turnPhase ??
    gameState.gameStatus
  )
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/\s+/g, '_');

  if (
    phaseSource === 'roll' ||
    phaseSource === 'move' ||
    phaseSource === 'place_ability' ||
    phaseSource === 'attack' ||
    phaseSource === 'end'
  ) {
    return phaseSource;
  }

  return null;
};

const phaseLabel = (turnPhase: TurnPhase) =>
  turnPhase
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const readRequiredNumber = (fieldName: string): number | null => {
  const input = window.prompt(`Enter ${fieldName}:`);
  if (input === null) {
    return null;
  }

  const parsed = Number(input);
  if (!Number.isFinite(parsed)) {
    window.alert(`Invalid number for ${fieldName}.`);
    return null;
  }

  return parsed;
};

const buildPlaceAbilityPayload = (requiredFields: string[]): Record<string, unknown> | null => {
  const payload: Record<string, unknown> = {};

  for (const field of requiredFields) {
    switch (field) {
      case 'targetPlayerId': {
        const value = readRequiredNumber('targetPlayerId');
        if (value === null) {
          return null;
        }
        payload.targetPlayerId = value;
        break;
      }
      case 'targetLocationId': {
        const value = readRequiredNumber('targetLocationId');
        if (value === null) {
          return null;
        }
        payload.targetLocationId = value;
        break;
      }
      case 'deckType': {
        const value = window
          .prompt('Enter deckType (dark, light, sight):')
          ?.trim()
          .toLowerCase();

        if (!value || !['dark', 'light', 'sight'].includes(value)) {
          window.alert('Invalid deckType. Allowed values: dark, light, sight.');
          return null;
        }

        payload.deckType = value;
        break;
      }
      case 'outcome': {
        const value = window.prompt('Enter outcome (damage or heal):')?.trim().toLowerCase();
        if (!value || !['damage', 'heal'].includes(value)) {
          window.alert('Invalid outcome. Allowed values: damage, heal.');
          return null;
        }
        payload.outcome = value;
        break;
      }
      case 'drawnCardContext': {
        const targetPlayerId = readRequiredNumber('drawnCardContext.targetPlayerId');
        if (targetPlayerId === null) {
          return null;
        }
        payload.drawnCardContext = { targetPlayerId };
        break;
      }
      default: {
        const rawValue = window.prompt(`Enter value for ${field} (JSON or text):`);
        if (rawValue === null) {
          return null;
        }

        try {
          payload[field] = JSON.parse(rawValue);
        } catch {
          payload[field] = rawValue;
        }
      }
    }
  }

  return payload;
};

const extractRequiredPendingFields = (response: unknown): string[] => {
  const typedResponse = response as PlaceAbilityResponse;
  return typedResponse.effect?.pendingActions?.required ?? [];
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

    useEffect(() => {
      if (!state?.gameId) {
        return;
      }

      const hubUrl = new URL("/.well-known/mercure", window.location.origin);
      hubUrl.searchParams.append("topic", `game/${state.gameId}`);

      const source = new EventSource(hubUrl.toString(), { withCredentials: true });

      source.onmessage = (event) => {
        console.log("Mercure message received:", event.data);
        try {
          const payload: TurnPlayedUpdate = JSON.parse(event.data);
          console.log("Mercure payload parsed:", payload);
          if (payload.type !== 'turn_played') {
            return;
          }

          setState((prev) => {
            if (!prev || prev.gameId !== payload.gameId) {
              return prev;
            }

            const incomingPosition = payload.position;

            const updatedPlayers = prev.players.map((player) =>
              payload.playerId && incomingPosition && player.id === payload.playerId
                ? { ...player, position: incomingPosition.number }
                : player
            );

            const positionIndex = prev.positions.findIndex(
              (position) => incomingPosition && position.id === incomingPosition.id
            );

            const updatedPositions = !incomingPosition
              ? prev.positions
              : positionIndex === -1
              ? [
                ...prev.positions,
                { id: incomingPosition.id, number: incomingPosition.number, placeCard: null },
              ]
              : prev.positions.map((position) =>
                position.id === incomingPosition.id
                  ? { ...position, number: incomingPosition.number }
                  : position
              );

            return {
              ...prev,
              turn: payload.turn,
              turnPhase: payload.turnPhase ?? prev.turnPhase,
              currentTurnRoll: payload.currentTurnRoll ?? prev.currentTurnRoll,
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
        const gameId = String(state.gameId);
        console.log(`Executing turn phase: ${turnPhase}`);

        switch (turnPhase) {
          case 'roll':
            await turnRoll(gameId);
            break;
          case 'move':
            {
              const positionNumber = readRequiredNumber('positionNumber (target position id)');
              if (positionNumber === null) {
                setError('Move input was cancelled or invalid.');
                break;
              }

              await turnMove(gameId, { positionNumber });
            }
            break;
          case 'place_ability':
            {
              const placeAbilityResponse = await turnPlaceAbility(gameId);
              const requiredFields = extractRequiredPendingFields(placeAbilityResponse);

              if (requiredFields.length > 0) {
                console.log('Place ability requires additional context:', requiredFields);
                const payload = buildPlaceAbilityPayload(requiredFields);

                if (!payload) {
                  setError('Place ability input was cancelled or invalid.');
                  break;
                }

                console.log('Sending place ability context payload:', payload);
                await turnPlaceAbility(gameId, payload);
              }
            }
            break;
          case 'attack':
            await turnAttack(gameId);
            break;
          case 'end':
            await turnEnd(gameId);
            break;
          default:
            throw new Error('Unsupported turn phase.');
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
