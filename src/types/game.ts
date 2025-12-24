// Código Secreto - Game Types

export type Team = 'red' | 'blue';
export type CardType = 'red' | 'blue' | 'neutral' | 'assassin';
export type Role = 'spymaster' | 'operative';
export type GamePhase = 'lobby' | 'playing' | 'finished';

export interface Card {
  word: string;
  type: CardType;        // The true identity (only spymasters see this)
  revealed: boolean;     // Has this card been revealed?
  revealedBy?: Team;     // Which team revealed this card?
}

export interface Player {
  id: string;
  name: string;
  team: Team | null;
  role: Role | null;
  isHost: boolean;
}

export interface Clue {
  word: string;
  number: number;
  team: Team;
  timestamp: number;
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  cards: Card[];           // 25 cards in 5x5 grid
  players: Player[];
  currentTurn: Team;
  startingTeam: Team;      // Team that goes first (has 9 cards)
  clues: Clue[];           // History of all clues given
  currentClue: Clue | null;
  guessesRemaining: number;
  redCardsRemaining: number;
  blueCardsRemaining: number;
  winner: Team | null;
  createdAt: number;
  lastActivity: number;
  // Player turn rotation within teams
  currentPlayerTurn: string | null;  // Player ID whose turn it is to select cards
  redOperativeOrder: string[];       // Order of red operatives for rotation
  blueOperativeOrder: string[];      // Order of blue operatives for rotation
  redOperativeIndex: number;         // Current index in red operative rotation
  blueOperativeIndex: number;        // Current index in blue operative rotation
}

// Key card positions - determines which cards belong to which team
export interface KeyCard {
  positions: CardType[];   // Array of 25 card types
  startingTeam: Team;
}

// Room creation/join
export interface CreateRoomRequest {
  hostName: string;
}

export interface JoinRoomRequest {
  roomCode: string;
  playerName: string;
}

export interface UpdatePlayerRequest {
  roomCode: string;
  playerId: string;
  team?: Team | null;
  role?: Role | null;
}

export interface GiveClueRequest {
  roomCode: string;
  playerId: string;
  word: string;
  number: number;
}

export interface MakeGuessRequest {
  roomCode: string;
  playerId: string;
  cardIndex: number;
}

export interface EndTurnRequest {
  roomCode: string;
  playerId: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
