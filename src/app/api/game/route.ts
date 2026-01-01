// API Routes for Código Secreto game management
import { NextRequest, NextResponse } from 'next/server';
import { gameStore } from '@/lib/gameStore';
import {
  createGame,
  addPlayer,
  updatePlayer,
  startGame,
  giveClue,
  makeGuess,
  endTurn,
  resetGame,
  canStartGame,
  proposeCard,
  respondToProposal,
  cancelProposal,
  rejoinPlayer,
} from '@/lib/gameLogic';
import type { ApiResponse, GameState } from '@/types/game';

// Helper to create JSON response
function jsonResponse<T>(data: ApiResponse<T>, status = 200) {
  return NextResponse.json(data, { status });
}

// GET - Get game state
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomCode = searchParams.get('roomCode');
  const playerId = searchParams.get('playerId');

  if (!roomCode) {
    return jsonResponse({ success: false, error: 'Código de sala requerido' }, 400);
  }

  const game = await gameStore.get(roomCode);

  if (!game) {
    return jsonResponse({ success: false, error: 'Sala no encontrada' }, 404);
  }

  // If playerId provided, check if they're a spymaster to show full card info
  const player = playerId ? game.players.find(p => p.id === playerId) : null;
  const isSpymaster = player?.role === 'spymaster';
  const gameEnded = game.phase === 'finished';

  // For non-spymasters during active game, hide card types
  const sanitizedGame: GameState = {
    ...game,
    cards: game.cards.map(card => ({
      ...card,
      // Only show type if: revealed, player is spymaster, or game ended
      type: card.revealed || isSpymaster || gameEnded ? card.type : 'neutral',
    })),
  };

  return jsonResponse({ success: true, data: sanitizedGame });
}

// POST - Game actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'create': {
        const { hostName } = params;
        if (!hostName || hostName.trim().length < 2) {
          return jsonResponse({ success: false, error: 'Nombre inválido (mínimo 2 caracteres)' }, 400);
        }

        const game = createGame(hostName.trim());
        await gameStore.set(game.roomCode, game);

        const hostPlayer = game.players[0];
        return jsonResponse({
          success: true,
          data: { game, playerId: hostPlayer.id },
        });
      }

      case 'join': {
        const { roomCode, playerName } = params;
        if (!roomCode || !playerName || playerName.trim().length < 2) {
          return jsonResponse({ success: false, error: 'Código de sala y nombre requeridos' }, 400);
        }

        const game = await gameStore.get(roomCode);
        if (!game) {
          return jsonResponse({ success: false, error: 'Sala no encontrada' }, 404);
        }

        if (game.players.length >= 20) {
          return jsonResponse({ success: false, error: 'Sala llena (máximo 20 jugadores)' }, 400);
        }

        // Check for existing player with same name (reconnection)
        const existingPlayer = game.players.find(
          p => p.name.toLowerCase() === playerName.trim().toLowerCase()
        );

        if (existingPlayer) {
          // Allow reconnection - return existing player
          return jsonResponse({
            success: true,
            data: { game, playerId: existingPlayer.id, reconnected: true },
          });
        }

        // New player - only allowed in lobby
        if (game.phase !== 'lobby') {
          return jsonResponse({ success: false, error: 'La partida ya ha comenzado. Si eras un jugador, usa el mismo nombre para reconectarte.' }, 400);
        }

        const { game: updatedGame, player } = addPlayer(game, playerName.trim());
        await gameStore.set(roomCode, updatedGame);

        return jsonResponse({
          success: true,
          data: { game: updatedGame, playerId: player.id },
        });
      }

      case 'rejoin': {
        const { roomCode, playerName } = params;
        if (!roomCode || !playerName) {
          return jsonResponse({ success: false, error: 'Código de sala y nombre requeridos' }, 400);
        }

        const game = await gameStore.get(roomCode);
        if (!game) {
          return jsonResponse({ success: false, error: 'Sala no encontrada' }, 404);
        }

        const { game: updatedGame, player, error } = rejoinPlayer(game, playerName.trim());
        if (error) {
          return jsonResponse({ success: false, error }, 400);
        }

        await gameStore.set(roomCode, updatedGame);

        return jsonResponse({
          success: true,
          data: { game: updatedGame, playerId: player?.id, reconnected: !!player },
        });
      }

      case 'updatePlayer': {
        const { roomCode, playerId, team, role } = params;
        const game = await gameStore.get(roomCode);

        if (!game) {
          return jsonResponse({ success: false, error: 'Sala no encontrada' }, 404);
        }

        const player = game.players.find(p => p.id === playerId);
        if (!player) {
          return jsonResponse({ success: false, error: 'Jugador no encontrado' }, 404);
        }

        // If setting as spymaster, check if team already has one
        if (role === 'spymaster' && team) {
          const existingSpymaster = game.players.find(
            p => p.id !== playerId && p.team === team && p.role === 'spymaster'
          );
          if (existingSpymaster) {
            return jsonResponse({
              success: false,
              error: `El equipo ${team === 'red' ? 'Rojo' : 'Azul'} ya tiene Jefe de Espías`,
            }, 400);
          }
        }

        const updatedGame = updatePlayer(game, playerId, { team, role });
        await gameStore.set(roomCode, updatedGame);

        return jsonResponse({ success: true, data: { game: updatedGame } });
      }

      case 'start': {
        const { roomCode, playerId } = params;
        const game = await gameStore.get(roomCode);

        if (!game) {
          return jsonResponse({ success: false, error: 'Sala no encontrada' }, 404);
        }

        const player = game.players.find(p => p.id === playerId);
        if (!player?.isHost) {
          return jsonResponse({ success: false, error: 'Solo el anfitrión puede iniciar' }, 403);
        }

        const { canStart, reason } = canStartGame(game);
        if (!canStart) {
          return jsonResponse({ success: false, error: reason }, 400);
        }

        const updatedGame = startGame(game);
        await gameStore.set(roomCode, updatedGame);

        return jsonResponse({ success: true, data: { game: updatedGame } });
      }

      case 'clue': {
        const { roomCode, playerId, word, number } = params;
        const game = await gameStore.get(roomCode);

        if (!game) {
          return jsonResponse({ success: false, error: 'Sala no encontrada' }, 404);
        }

        if (!word || word.trim().length < 1) {
          return jsonResponse({ success: false, error: 'Pista inválida' }, 400);
        }

        if (typeof number !== 'number' || number < 0 || number > 9) {
          return jsonResponse({ success: false, error: 'Número inválido (0-9)' }, 400);
        }

        const { game: updatedGame, error } = giveClue(game, playerId, word.trim(), number);
        if (error) {
          return jsonResponse({ success: false, error }, 400);
        }

        await gameStore.set(roomCode, updatedGame);
        return jsonResponse({ success: true, data: { game: updatedGame } });
      }

      case 'guess': {
        const { roomCode, playerId, cardIndex } = params;
        const game = await gameStore.get(roomCode);

        if (!game) {
          return jsonResponse({ success: false, error: 'Sala no encontrada' }, 404);
        }

        if (typeof cardIndex !== 'number' || cardIndex < 0 || cardIndex > 24) {
          return jsonResponse({ success: false, error: 'Carta inválida' }, 400);
        }

        const { game: updatedGame, result, error } = makeGuess(game, playerId, cardIndex);
        if (error) {
          return jsonResponse({ success: false, error }, 400);
        }

        await gameStore.set(roomCode, updatedGame);
        return jsonResponse({
          success: true,
          data: { game: updatedGame, result },
        });
      }

      case 'endTurn': {
        const { roomCode, playerId } = params;
        const game = await gameStore.get(roomCode);

        if (!game) {
          return jsonResponse({ success: false, error: 'Sala no encontrada' }, 404);
        }

        const { game: updatedGame, error } = endTurn(game, playerId);
        if (error) {
          return jsonResponse({ success: false, error }, 400);
        }

        await gameStore.set(roomCode, updatedGame);
        return jsonResponse({ success: true, data: { game: updatedGame } });
      }

      case 'reset': {
        const { roomCode, playerId } = params;
        const game = await gameStore.get(roomCode);

        if (!game) {
          return jsonResponse({ success: false, error: 'Sala no encontrada' }, 404);
        }

        const player = game.players.find(p => p.id === playerId);
        if (!player?.isHost) {
          return jsonResponse({ success: false, error: 'Solo el anfitrión puede reiniciar' }, 403);
        }

        const updatedGame = resetGame(game);
        await gameStore.set(roomCode, updatedGame);

        return jsonResponse({ success: true, data: { game: updatedGame } });
      }

      case 'proposeCard': {
        const { roomCode, playerId, cardIndex } = params;
        const game = await gameStore.get(roomCode);

        if (!game) {
          return jsonResponse({ success: false, error: 'Sala no encontrada' }, 404);
        }

        if (typeof cardIndex !== 'number' || cardIndex < 0 || cardIndex > 24) {
          return jsonResponse({ success: false, error: 'Carta inválida' }, 400);
        }

        const { game: updatedGame, error } = proposeCard(game, playerId, cardIndex);
        if (error) {
          return jsonResponse({ success: false, error }, 400);
        }

        await gameStore.set(roomCode, updatedGame);
        return jsonResponse({ success: true, data: { game: updatedGame } });
      }

      case 'respondToProposal': {
        const { roomCode, playerId, accept } = params;
        const game = await gameStore.get(roomCode);

        if (!game) {
          return jsonResponse({ success: false, error: 'Sala no encontrada' }, 404);
        }

        if (typeof accept !== 'boolean') {
          return jsonResponse({ success: false, error: 'Respuesta inválida' }, 400);
        }

        const { game: gameWithResponse, shouldReveal, error } = respondToProposal(game, playerId, accept);
        if (error) {
          return jsonResponse({ success: false, error }, 400);
        }

        // If accepted, automatically make the guess
        if (shouldReveal && gameWithResponse.cardProposal) {
          const cardIndex = gameWithResponse.cardProposal.cardIndex;
          const { game: finalGame, result } = makeGuess(gameWithResponse, playerId, cardIndex);
          await gameStore.set(roomCode, finalGame);
          return jsonResponse({
            success: true,
            data: { game: finalGame, result, proposalAccepted: true },
          });
        }

        await gameStore.set(roomCode, gameWithResponse);
        return jsonResponse({ success: true, data: { game: gameWithResponse } });
      }

      case 'cancelProposal': {
        const { roomCode, playerId } = params;
        const game = await gameStore.get(roomCode);

        if (!game) {
          return jsonResponse({ success: false, error: 'Sala no encontrada' }, 404);
        }

        const { game: updatedGame, error } = cancelProposal(game, playerId);
        if (error) {
          return jsonResponse({ success: false, error }, 400);
        }

        await gameStore.set(roomCode, updatedGame);
        return jsonResponse({ success: true, data: { game: updatedGame } });
      }

      default:
        return jsonResponse({ success: false, error: 'Acción no válida' }, 400);
    }
  } catch (error) {
    console.error('API Error:', error);
    return jsonResponse({ success: false, error: 'Error del servidor' }, 500);
  }
}
