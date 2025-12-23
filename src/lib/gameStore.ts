// Código Secreto - In-memory game store for Vercel serverless
// Note: In production, use Vercel KV or Redis for persistence

import type { GameState, Player } from '@/types/game';

// In-memory store (resets on cold start, but works for demo)
// For production: use Vercel KV, Upstash Redis, or similar
const games = new Map<string, GameState>();

// Cleanup old games (older than 24 hours)
function cleanupOldGames() {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  games.forEach((game, code) => {
    if (now - game.lastActivity > maxAge) {
      games.delete(code);
    }
  });
}

// Run cleanup periodically
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldGames, 60 * 60 * 1000); // Every hour
}

export const gameStore = {
  get(roomCode: string): GameState | undefined {
    return games.get(roomCode.toUpperCase());
  },

  set(roomCode: string, game: GameState): void {
    games.set(roomCode.toUpperCase(), game);
  },

  delete(roomCode: string): boolean {
    return games.delete(roomCode.toUpperCase());
  },

  has(roomCode: string): boolean {
    return games.has(roomCode.toUpperCase());
  },

  getPlayerCount(): number {
    let count = 0;
    games.forEach((game) => {
      count += game.players.length;
    });
    return count;
  },

  getGameCount(): number {
    return games.size;
  },
};

export default gameStore;
