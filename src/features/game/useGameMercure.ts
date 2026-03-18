import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { GameState } from '../../types/gameState.type';
import {
  applyTurnPlayedUpdate,
  parseTurnPlayedUpdate,
} from './gameState.service';

type UseGameMercureParams = {
  gameId?: number;
  setState: Dispatch<SetStateAction<GameState | null>>;
};

export const useGameMercure = ({ gameId, setState }: UseGameMercureParams) => {
  useEffect(() => {
    if (!gameId) {
      return;
    }

    const hubUrl = new URL('/.well-known/mercure', window.location.origin);
    hubUrl.searchParams.append('topic', `game/${gameId}`);

    const source = new EventSource(hubUrl.toString(), { withCredentials: true });

    source.onmessage = (event) => {
      console.log('Mercure message received:', event.data);
      try {
        const payload = parseTurnPlayedUpdate(event.data);
        console.log('Mercure payload parsed:', payload);
        if (!payload) {
          return;
        }

        setState((previous) => {
          if (!previous || previous.gameId !== payload.gameId) {
            return previous;
          }

          return applyTurnPlayedUpdate(previous, payload);
        });
      } catch (error) {
        console.error('Unable to parse Mercure update', error);
      }
    };

    return () => {
      source.close();
    };
  }, [gameId, setState]);
};
