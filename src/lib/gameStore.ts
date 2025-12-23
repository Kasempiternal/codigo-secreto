// Código Secreto - Game store with Upstash Redis for production
// Uses in-memory fallback for local development

import { Redis } from '@upstash/redis';
import type { GameState } from '@/types/game';

const GAME_PREFIX = 'game:';
const GAME_TTL = 24 * 60 * 60; // 24 hours in seconds

// Check if Upstash Redis is configured (check both Vercel KV and Upstash env var names)
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const isRedisConfigured = !!(redisUrl && redisToken);

// Create Redis client if configured
const redis = isRedisConfigured ? new Redis({ url: redisUrl!, token: redisToken! }) : null;

// In-memory fallback for local development
const localGames = new Map<string, GameState>();

export const gameStore = {
  async get(roomCode: string): Promise<GameState | null> {
    const key = GAME_PREFIX + roomCode.toUpperCase();

    if (isRedisConfigured && redis) {
      try {
        const game = await redis.get<GameState>(key);
        return game;
      } catch (error) {
        console.error('Redis get error:', error);
        return null;
      }
    }

    // Fallback to in-memory for local dev
    return localGames.get(roomCode.toUpperCase()) ?? null;
  },

  async set(roomCode: string, game: GameState): Promise<void> {
    const key = GAME_PREFIX + roomCode.toUpperCase();

    if (isRedisConfigured && redis) {
      try {
        await redis.set(key, game, { ex: GAME_TTL });
      } catch (error) {
        console.error('Redis set error:', error);
      }
    } else {
      // Fallback to in-memory for local dev
      localGames.set(roomCode.toUpperCase(), game);
    }
  },

  async delete(roomCode: string): Promise<boolean> {
    const key = GAME_PREFIX + roomCode.toUpperCase();

    if (isRedisConfigured && redis) {
      try {
        const result = await redis.del(key);
        return result > 0;
      } catch (error) {
        console.error('Redis delete error:', error);
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
