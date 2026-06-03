export interface Player {
  id: string;
  name: string;
  answer: string;
  teamId: string | null;
}

export interface Chit {
  id: string;
  playerId: string;
  answer: string;
  isDiscarded: boolean;
}

export interface Team {
  id: string;
  leaderId: string;
  memberIds: string[];
}

export type GamePhase = 'lobby' | 'playing' | 'ended';

export interface TurnState {
  activeTeamId: string;
  currentChitId: string | null;
  lastGuessResult: 'correct' | 'incorrect' | null;
  lastGuessedPlayerId: string | null;
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  prompt: string;
  players: Record<string, Player>;
  chits: Record<string, Chit>;
  teams: Record<string, Team>;
  turnOrder: string[];
  turn: TurnState | null;
  winner: string | null;
}
