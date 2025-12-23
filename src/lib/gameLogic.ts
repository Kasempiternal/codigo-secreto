// Código Secreto - Core Game Logic

import { v4 as uuidv4 } from 'uuid';
import { getRandomWords } from '@/data/words';
import type {
  Card,
  CardType,
  Team,
  Role,
  GameState,
  KeyCard,
  Player
} from '@/types/game';

// Generate a random 6-character room code
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (I, O, 0, 1)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate key card - determines card assignments
export function generateKeyCard(): KeyCard {
  const startingTeam: Team = Math.random() < 0.5 ? 'red' : 'blue';
  const otherTeam: Team = startingTeam === 'red' ? 'blue' : 'red';

  // Starting team gets 9 cards, other gets 8, 7 neutral, 1 assassin
  const types: CardType[] = [
    ...Array(9).fill(startingTeam),
    ...Array(8).fill(otherTeam),
    ...Array(7).fill('neutral'),
    'assassin'
  ];

  // Shuffle the types
  const positions = types.sort(() => Math.random() - 0.5);

  return { positions, startingTeam };
}

// Create initial game state
export function createGame(hostName: string): GameState {
  const roomCode = generateRoomCode();
  const keyCard = generateKeyCard();
  const words = getRandomWords(25);

  const cards: Card[] = words.map((word, index) => ({
    word,
    type: keyCard.positions[index],
    revealed: false,
  }));

  const host: Player = {
    id: uuidv4(),
    name: hostName,
    team: null,
    role: null,
    isHost: true,
  };

  const now = Date.now();

  return {
    roomCode,
    phase: 'lobby',
    cards,
    players: [host],
    currentTurn: keyCard.startingTeam,
    startingTeam: keyCard.startingTeam,
    clues: [],
    currentClue: null,
    guessesRemaining: 0,
    redCardsRemaining: keyCard.startingTeam === 'red' ? 9 : 8,
    blueCardsRemaining: keyCard.startingTeam === 'blue' ? 9 : 8,
    winner: null,
    createdAt: now,
    lastActivity: now,
  };
}

// Add a player to the game
export function addPlayer(game: GameState, playerName: string): { game: GameState; player: Player } {
  const player: Player = {
    id: uuidv4(),
    name: playerName,
    team: null,
    role: null,
    isHost: false,
  };

  return {
    game: {
      ...game,
      players: [...game.players, player],
      lastActivity: Date.now(),
    },
    player,
  };
}

// Update player team/role
export function updatePlayer(
  game: GameState,
  playerId: string,
  updates: { team?: Team | null; role?: Role | null }
): GameState {
  return {
    ...game,
    players: game.players.map(p =>
      p.id === playerId
        ? { ...p, ...updates }
        : p
    ),
    lastActivity: Date.now(),
  };
}

// Check if game can start
export function canStartGame(game: GameState): { canStart: boolean; reason?: string } {
  const redPlayers = game.players.filter(p => p.team === 'red');
  const bluePlayers = game.players.filter(p => p.team === 'blue');
  const redSpymaster = redPlayers.find(p => p.role === 'spymaster');
  const blueSpymaster = bluePlayers.find(p => p.role === 'spymaster');

  if (redPlayers.length < 2) {
    return { canStart: false, reason: 'El equipo Rojo necesita al menos 2 jugadores' };
  }
  if (bluePlayers.length < 2) {
    return { canStart: false, reason: 'El equipo Azul necesita al menos 2 jugadores' };
  }
  if (!redSpymaster) {
    return { canStart: false, reason: 'El equipo Rojo necesita un Jefe de Espías' };
  }
  if (!blueSpymaster) {
    return { canStart: false, reason: 'El equipo Azul necesita un Jefe de Espías' };
  }

  return { canStart: true };
}

// Start the game
export function startGame(game: GameState): GameState {
  return {
    ...game,
    phase: 'playing',
    lastActivity: Date.now(),
  };
}

// Process a clue from spymaster
export function giveClue(
  game: GameState,
  playerId: string,
  word: string,
  number: number
): { game: GameState; error?: string } {
  const player = game.players.find(p => p.id === playerId);

  if (!player || player.role !== 'spymaster') {
    return { game, error: 'Solo el Jefe de Espías puede dar pistas' };
  }

  if (player.team !== game.currentTurn) {
    return { game, error: 'No es el turno de tu equipo' };
  }

  const clue = {
    word: word.toUpperCase(),
    number,
    team: player.team,
    timestamp: Date.now(),
  };

  return {
    game: {
      ...game,
      clues: [...game.clues, clue],
      currentClue: clue,
      guessesRemaining: number + 1, // Players can guess one extra
      lastActivity: Date.now(),
    },
  };
}

// Process a guess from operatives
export function makeGuess(
  game: GameState,
  playerId: string,
  cardIndex: number
): { game: GameState; result: 'correct' | 'wrong' | 'assassin' | 'neutral'; error?: string } {
  const player = game.players.find(p => p.id === playerId);

  if (!player || player.role !== 'operative') {
    return { game, result: 'wrong', error: 'Solo los Agentes de Campo pueden adivinar' };
  }

  if (player.team !== game.currentTurn) {
    return { game, result: 'wrong', error: 'No es el turno de tu equipo' };
  }

  if (game.guessesRemaining <= 0) {
    return { game, result: 'wrong', error: 'No te quedan intentos' };
  }

  const card = game.cards[cardIndex];

  if (card.revealed) {
    return { game, result: 'wrong', error: 'Esta carta ya fue revelada' };
  }

  // Reveal the card
  const newCards = [...game.cards];
  newCards[cardIndex] = { ...card, revealed: true, revealedBy: player.team };

  let newRedRemaining = game.redCardsRemaining;
  let newBlueRemaining = game.blueCardsRemaining;
  let winner: Team | null = null;
  let result: 'correct' | 'wrong' | 'assassin' | 'neutral' = 'neutral';
  let endTurn = false;
  let newGuessesRemaining = game.guessesRemaining - 1;

  // Check what type of card was revealed
  if (card.type === 'assassin') {
    // Game over - other team wins
    winner = player.team === 'red' ? 'blue' : 'red';
    result = 'assassin';
  } else if (card.type === player.team) {
    // Correct guess
    if (card.type === 'red') {
      newRedRemaining--;
    } else {
      newBlueRemaining--;
    }
    result = 'correct';

    // Check for win
    if (newRedRemaining === 0) {
      winner = 'red';
    } else if (newBlueRemaining === 0) {
      winner = 'blue';
    }

    // End turn if no guesses remaining
    if (newGuessesRemaining <= 0) {
      endTurn = true;
    }
  } else if (card.type === 'neutral') {
    // Neutral card - turn ends
    result = 'neutral';
    endTurn = true;
  } else {
    // Wrong team's card - helps opponents and ends turn
    if (card.type === 'red') {
      newRedRemaining--;
    } else {
      newBlueRemaining--;
    }
    result = 'wrong';
    endTurn = true;

    // Check if this caused the other team to win
    if (newRedRemaining === 0) {
      winner = 'red';
    } else if (newBlueRemaining === 0) {
      winner = 'blue';
    }
  }

  const newGame: GameState = {
    ...game,
    cards: newCards,
    redCardsRemaining: newRedRemaining,
    blueCardsRemaining: newBlueRemaining,
    guessesRemaining: endTurn ? 0 : newGuessesRemaining,
    currentTurn: endTurn && !winner ? (game.currentTurn === 'red' ? 'blue' : 'red') : game.currentTurn,
    currentClue: endTurn ? null : game.currentClue,
    winner,
    phase: winner ? 'finished' : game.phase,
    lastActivity: Date.now(),
  };

  return { game: newGame, result };
}

// End turn voluntarily
export function endTurn(game: GameState, playerId: string): { game: GameState; error?: string } {
  const player = game.players.find(p => p.id === playerId);

  if (!player || player.team !== game.currentTurn) {
    return { game, error: 'No puedes terminar el turno' };
  }

  return {
    game: {
      ...game,
      currentTurn: game.currentTurn === 'red' ? 'blue' : 'red',
      currentClue: null,
      guessesRemaining: 0,
      lastActivity: Date.now(),
    },
  };
}

// Reset game with same players
export function resetGame(game: GameState): GameState {
  const keyCard = generateKeyCard();
  const words = getRandomWords(25);

  const cards: Card[] = words.map((word, index) => ({
    word,
    type: keyCard.positions[index],
    revealed: false,
  }));

  return {
    ...game,
    phase: 'lobby',
    cards,
    currentTurn: keyCard.startingTeam,
    startingTeam: keyCard.startingTeam,
    clues: [],
    currentClue: null,
    guessesRemaining: 0,
    redCardsRemaining: keyCard.startingTeam === 'red' ? 9 : 8,
    blueCardsRemaining: keyCard.startingTeam === 'blue' ? 9 : 8,
    winner: null,
    lastActivity: Date.now(),
  };
}
