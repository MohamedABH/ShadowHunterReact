import { turnAttack } from '../../api/Turn/Attack.api';
import { turnEnd } from '../../api/Turn/End.api';
import { turnMove } from '../../api/Turn/Move.api';
import { turnPlaceAbility } from '../../api/Turn/PlaceAbility.api';
import { turnRoll } from '../../api/Turn/Roll.api';
import type { GameState } from '../../types/gameState.type';

export type TurnPhase = 'roll' | 'move' | 'place_ability' | 'attack' | 'end';

type PlaceAbilityResponse = {
  effect?: {
    pendingActions?: {
      required?: string[];
    };
  };
};

export type TurnExecutionResult = {
  phase: TurnPhase;
  executed: boolean;
  cancelMessage?: string;
};

export const getTurnPhase = (gameState: GameState): TurnPhase | null => {
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

export const phaseLabel = (turnPhase: TurnPhase) =>
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

export const playCurrentTurnPhase = async (
  gameState: GameState,
): Promise<TurnExecutionResult> => {
  const turnPhase = getTurnPhase(gameState);
  if (!turnPhase) {
    throw new Error('Unknown turn phase.');
  }

  const gameId = String(gameState.gameId);
  console.log(`Executing turn phase: ${turnPhase}`);

  switch (turnPhase) {
    case 'roll':
      await turnRoll(gameId);
      break;
    case 'move': {
      const positionNumber = readRequiredNumber('positionNumber (target position id)');
      if (positionNumber === null) {
        return {
          phase: turnPhase,
          executed: false,
          cancelMessage: 'Move input was cancelled or invalid.',
        };
      }

      await turnMove(gameId, { positionNumber });
      break;
    }
    case 'place_ability': {
      const placeAbilityResponse = await turnPlaceAbility(gameId);
      const requiredFields = extractRequiredPendingFields(placeAbilityResponse);

      if (requiredFields.length > 0) {
        console.log('Place ability requires additional context:', requiredFields);
        const payload = buildPlaceAbilityPayload(requiredFields);

        if (!payload) {
          return {
            phase: turnPhase,
            executed: false,
            cancelMessage: 'Place ability input was cancelled or invalid.',
          };
        }

        console.log('Sending place ability context payload:', payload);
        await turnPlaceAbility(gameId, payload);
      }
      break;
    }
    case 'attack':
      await turnAttack(gameId);
      break;
    case 'end':
      await turnEnd(gameId);
      break;
    default:
      throw new Error('Unsupported turn phase.');
  }

  return {
    phase: turnPhase,
    executed: true,
  };
};
