'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Team, Role, Player } from '@/types/game';

interface UseGameOptions {
  roomCode: string;
  playerId: string | null;
  pollInterval?: number;
}

interface UseGameReturn {
  game: GameState | null;
  player: Player | null;
  loading: boolean;
  error: string | null;

  // Actions
  updatePlayer: (team: Team | null, role: Role | null) => Promise<void>;
  startGame: () => Promise<void>;
  giveClue: (word: string, number: number) => Promise<void>;
  makeGuess: (cardIndex: number) => Promise<{ result: string }>;
  endTurn: () => Promise<void>;
  resetGame: () => Promise<void>;
  refresh: () => Promise<void>;
  // Boss proposal actions
  proposeCard: (cardIndex: number) => Promise<void>;
  respondToProposal: (accept: boolean) => Promise<{ result?: string; proposalAccepted?: boolean }>;
  cancelProposal: () => Promise<void>;
}

export function useGame({ roomCode, playerId, pollInterval = 2000 }: UseGameOptions): UseGameReturn {
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(0);

  // Fetch game state
  const fetchGame = useCallback(async () => {
    if (!roomCode) return;

    try {
      const url = new URL('/api/game', window.location.origin);
      url.searchParams.set('roomCode', roomCode);
      if (playerId) {
        url.searchParams.set('playerId', playerId);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.success) {
        // Only update if there's new activity
        if (data.data.lastActivity !== lastActivityRef.current) {
          lastActivityRef.current = data.data.lastActivity;
          setGame(data.data);
        }
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [roomCode, playerId]);

  // Initial fetch and polling
  useEffect(() => {
    fetchGame();

    // Set up polling for real-time updates
    pollRef.current = setInterval(fetchGame, pollInterval);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [fetchGame, pollInterval]);

  // Get current player
  const player = game?.players.find(p => p.id === playerId) || null;

  // API action helper
  const apiAction = async (action: string, params: Record<string, unknown> = {}) => {
    const response = await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, roomCode, playerId, ...params }),
    });
    const data = await response.json();

    if (data.success) {
      if (data.data?.game) {
        setGame(data.data.game);
        lastActivityRef.current = data.data.game.lastActivity;
      }
      return data.data;
    } else {
      throw new Error(data.error);
    }
  };

  // Actions
  const updatePlayer = async (team: Team | null, role: Role | null) => {
    await apiAction('updatePlayer', { team, role });
  };

  const startGame = async () => {
    await apiAction('start');
  };

  const giveClue = async (word: string, number: number) => {
    await apiAction('clue', { word, number });
  };

  const makeGuess = async (cardIndex: number) => {
    return await apiAction('guess', { cardIndex });
  };

  const endTurn = async () => {
    await apiAction('endTurn');
  };

  const resetGame = async () => {
    await apiAction('reset');
  };

  const refresh = async () => {
    await fetchGame();
  };

  // Boss proposal actions
  const proposeCard = async (cardIndex: number) => {
    await apiAction('proposeCard', { cardIndex });
  };

  const respondToProposal = async (accept: boolean) => {
    return await apiAction('respondToProposal', { accept });
  };

  const cancelProposal = async () => {
    await apiAction('cancelProposal');
  };

  return {
    game,
    player,
    loading,
    error,
    updatePlayer,
    startGame,
    giveClue,
    makeGuess,
    endTurn,
    resetGame,
    refresh,
    proposeCard,
    respondToProposal,
    cancelProposal,
  };
}
