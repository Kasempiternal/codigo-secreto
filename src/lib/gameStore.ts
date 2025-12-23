// Código Secreto - Game store with Vercel KV for production
// Uses in-memory fallback for local development

import { kv } from '@vercel/kv';
import type { GameState } from '@/types/game';

const GAME_PREFIX = 'game:';
const GAME_TTL = 24 * 60 * 60; // 24 hours in seconds

// Check if Vercel KV is configured
const isKVConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// In-memory fallback for local development
const localGames = new Map<string, GameState>();

export const gameStore = {
  async get(roomCode: string): Promise<GameState | null> {
    const key = GAME_PREFIX + roomCode.toUpperCase();

    if (isKVConfigured) {
      try {
        const game = await kv.get<GameState>(key);
        return game;
      } catch (error) {
        console.error('KV get error:', error);
        return null;
      }
    }

    // Fallback to in-memory for local dev
    return localGames.get(roomCode.toUpperCase()) ?? null;
  },

  async set(roomCode: string, game: GameState): Promise<void> {
    const key = GAME_PREFIX + roomCode.toUpperCase();

    if (isKVConfigured) {
      try {
        await kv.set(key, game, { ex: GAME_TTL });
      } catch (error) {
        console.error('KV set error:', error);
      }
    } else {
      // Fallback to in-memory for local dev
      localGames.set(roomCode.toUpperCase(), game);
    }
  },

  async delete(roomCode: string): Promise<boolean> {
    const key = GAME_PREFIX + roomCode.toUpperCase();

    if (isKVConfigured) {
      try {
        const result = await kv.del(key);
        return result > 0;
      } catch (error) {
        console.error('KV delete error:', error);
        return false;
      }
    }

    return localGames.delete(roomCode.toUpperCase());
  },

  async has(roomCode: string): Promise<boolean> {
    const game = await this.get(roomCode);
    return game !== null;
  },
};

export default gameStore;
