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
  Player,
  CardProposal,
  LastReveal
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
    // Player turn rotation
    currentPlayerTurn: null,
    redOperativeOrder: [],
    blueOperativeOrder: [],
    redOperativeIndex: 0,
    blueOperativeIndex: 0,
    // Boss card proposal system
    cardProposal: null,
    // Last reveal for animations
    lastReveal: null,
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
  // Get operatives for each team and create rotation order
  const redOperatives = game.players
    .filter(p => p.team === 'red' && p.role === 'operative')
    .map(p => p.id);
  const blueOperatives = game.players
    .filter(p => p.team === 'blue' && p.role === 'operative')
    .map(p => p.id);

  // Determine first operative based on starting team
  const firstOperative = game.startingTeam === 'red'
    ? redOperatives[0]
    : blueOperatives[0];

  return {
    ...game,
    phase: 'playing',
    lastActivity: Date.now(),
    redOperativeOrder: redOperatives,
    blueOperativeOrder: blueOperatives,
    redOperativeIndex: 0,
    blueOperativeIndex: 0,
    currentPlayerTurn: firstOperative || null,
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

  // Get current operative for this team
  const operativeOrder = player.team === 'red' ? game.redOperativeOrder : game.blueOperativeOrder;
  const operativeIndex = player.team === 'red' ? game.redOperativeIndex : game.blueOperativeIndex;
  const currentOperative = operativeOrder[operativeIndex] || null;

  return {
    game: {
      ...game,
      clues: [...game.clues, clue],
      currentClue: clue,
      guessesRemaining: number + 1, // Players can guess one extra
      currentPlayerTurn: currentOperative,
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

  // Check if it's this player's turn to select
  if (game.currentPlayerTurn && game.currentPlayerTurn !== playerId) {
    const currentPlayer = game.players.find(p => p.id === game.currentPlayerTurn);
    return { game, result: 'wrong', error: `Es el turno de ${currentPlayer?.name || 'otro jugador'} para seleccionar` };
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

  // Calculate new operative indices and current player turn
  let newRedOperativeIndex = game.redOperativeIndex;
  let newBlueOperativeIndex = game.blueOperativeIndex;
  let newCurrentPlayerTurn: string | null = game.currentPlayerTurn;

  if (endTurn && !winner) {
    // Switch to other team and advance their operative index
    const nextTeam = game.currentTurn === 'red' ? 'blue' : 'red';
    if (nextTeam === 'red') {
      // Next turn will be red team, advance red operative index
      newRedOperativeIndex = (game.redOperativeIndex + 1) % game.redOperativeOrder.length;
      newCurrentPlayerTurn = game.redOperativeOrder[newRedOperativeIndex] || null;
    } else {
      // Next turn will be blue team, advance blue operative index
      newBlueOperativeIndex = (game.blueOperativeIndex + 1) % game.blueOperativeOrder.length;
      newCurrentPlayerTurn = game.blueOperativeOrder[newBlueOperativeIndex] || null;
    }
  }

  // Create last reveal info for animations
  const lastReveal: LastReveal = {
    cardIndex,
    result,
    revealedAt: Date.now(),
  };

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
    redOperativeIndex: newRedOperativeIndex,
    blueOperativeIndex: newBlueOperativeIndex,
    currentPlayerTurn: winner ? null : newCurrentPlayerTurn,
    cardProposal: null, // Clear any proposal after a guess
    lastReveal,
  };

  return { game: newGame, result };
}

// End turn voluntarily
export function endTurn(game: GameState, playerId: string): { game: GameState; error?: string } {
  const player = game.players.find(p => p.id === playerId);

  if (!player || player.team !== game.currentTurn) {
    return { game, error: 'No puedes terminar el turno' };
  }

  // Calculate new operative indices and current player turn for next team
  const nextTeam = game.currentTurn === 'red' ? 'blue' : 'red';
  let newRedOperativeIndex = game.redOperativeIndex;
  let newBlueOperativeIndex = game.blueOperativeIndex;
  let newCurrentPlayerTurn: string | null = null;

  if (nextTeam === 'red') {
    newRedOperativeIndex = (game.redOperativeIndex + 1) % game.redOperativeOrder.length;
    newCurrentPlayerTurn = game.redOperativeOrder[newRedOperativeIndex] || null;
  } else {
    newBlueOperativeIndex = (game.blueOperativeIndex + 1) % game.blueOperativeOrder.length;
    newCurrentPlayerTurn = game.blueOperativeOrder[newBlueOperativeIndex] || null;
  }

  return {
    game: {
      ...game,
      currentTurn: nextTeam,
      currentClue: null,
      guessesRemaining: 0,
      lastActivity: Date.now(),
      redOperativeIndex: newRedOperativeIndex,
      blueOperativeIndex: newBlueOperativeIndex,
      currentPlayerTurn: newCurrentPlayerTurn,
      cardProposal: null, // Clear any proposal on turn end
      lastReveal: null, // Clear last reveal on turn end
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
    // Reset player turn rotation
    currentPlayerTurn: null,
    redOperativeOrder: [],
    blueOperativeOrder: [],
    redOperativeIndex: 0,
    blueOperativeIndex: 0,
    // Reset proposals and reveals
    cardProposal: null,
    lastReveal: null,
  };
}

// Boss proposes a card for team to vote on
export function proposeCard(
  game: GameState,
  playerId: string,
  cardIndex: number
): { game: GameState; error?: string } {
  const player = game.players.find(p => p.id === playerId);

  if (!player || player.role !== 'spymaster') {
    return { game, error: 'Solo el Jefe de Espías puede proponer cartas' };
  }

  if (player.team !== game.currentTurn) {
    return { game, error: 'No es el turno de tu equipo' };
  }

  if (!game.currentClue) {
    return { game, error: 'Primero debes dar una pista' };
  }

  const card = game.cards[cardIndex];
  if (card.revealed) {
    return { game, error: 'Esta carta ya fue revelada' };
  }

  const proposal: CardProposal = {
    cardIndex,
    cardWord: card.word,
    proposedBy: playerId,
    proposedAt: Date.now(),
    acceptedBy: [],
    rejectedBy: [],
  };

  return {
    game: {
      ...game,
      cardProposal: proposal,
      lastActivity: Date.now(),
    },
  };
}

// Operative responds to boss proposal
export function respondToProposal(
  game: GameState,
  playerId: string,
  accept: boolean
): { game: GameState; shouldReveal: boolean; error?: string } {
  const player = game.players.find(p => p.id === playerId);

  if (!player || player.role !== 'operative') {
    return { game, shouldReveal: false, error: 'Solo los Agentes de Campo pueden votar' };
  }

  if (player.team !== game.currentTurn) {
    return { game, shouldReveal: false, error: 'No es el turno de tu equipo' };
  }

  if (!game.cardProposal) {
    return { game, shouldReveal: false, error: 'No hay propuesta activa' };
  }

  // Check if already voted
  if (game.cardProposal.acceptedBy.includes(playerId) || game.cardProposal.rejectedBy.includes(playerId)) {
    return { game, shouldReveal: false, error: 'Ya has votado' };
  }

  const newProposal = { ...game.cardProposal };
  if (accept) {
    newProposal.acceptedBy = [...newProposal.acceptedBy, playerId];
  } else {
    newProposal.rejectedBy = [...newProposal.rejectedBy, playerId];
  }

  // If accepted by any operative, reveal the card
  if (accept) {
    return {
      game: {
        ...game,
        cardProposal: newProposal,
        lastActivity: Date.now(),
      },
      shouldReveal: true,
    };
  }

  // If rejected, just update the proposal
  return {
    game: {
      ...game,
      cardProposal: newProposal,
      lastActivity: Date.now(),
    },
    shouldReveal: false,
  };
}

// Cancel boss proposal
export function cancelProposal(
  game: GameState,
  playerId: string
): { game: GameState; error?: string } {
  const player = game.players.find(p => p.id === playerId);

  if (!player) {
    return { game, error: 'Jugador no encontrado' };
  }

  // Only the proposer (spymaster) or operatives can cancel
  if (player.team !== game.currentTurn) {
    return { game, error: 'No es el turno de tu equipo' };
  }

  if (!game.cardProposal) {
    return { game, error: 'No hay propuesta activa' };
  }

  // Only the proposer can cancel
  if (game.cardProposal.proposedBy !== playerId) {
    return { game, error: 'Solo quien propuso puede cancelar' };
  }

  return {
    game: {
      ...game,
      cardProposal: null,
      lastActivity: Date.now(),
    },
  };
}

// Rejoin existing player (reconnection)
export function rejoinPlayer(
  game: GameState,
  playerName: string
): { game: GameState; player: Player | null; error?: string } {
  // Find existing player by name
  const existingPlayer = game.players.find(
    p => p.name.toLowerCase() === playerName.toLowerCase()
  );

  if (existingPlayer) {
    return {
      game: {
        ...game,
        lastActivity: Date.now(),
      },
      player: existingPlayer,
    };
  }

  // If not found and game is in lobby, allow joining as new player
  if (game.phase === 'lobby') {
    const { game: updatedGame, player } = addPlayer(game, playerName);
    return { game: updatedGame, player };
  }

  return { game, player: null, error: 'Jugador no encontrado. La partida ya está en curso.' };
}
