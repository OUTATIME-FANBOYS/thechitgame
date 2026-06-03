import { GameState, Player, Chit, Team } from './types';
import { nanoid } from 'nanoid';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getActiveChits(state: GameState): Chit[] {
  return Object.values(state.chits).filter((c) => !c.isDiscarded);
}

export function getTeamForPlayer(state: GameState, playerId: string): Team | null {
  return Object.values(state.teams).find((t) => t.memberIds.includes(playerId)) ?? null;
}

export function getTeamMembers(state: GameState, teamId: string): Player[] {
  const team = state.teams[teamId];
  if (!team) return [];
  return team.memberIds.map((id) => state.players[id]).filter(Boolean);
}

export function getGuessablePlayers(state: GameState): Player[] {
  const activeTeam = state.turn?.activeTeamId ? state.teams[state.turn.activeTeamId] : null;
  const activeIds = new Set(activeTeam?.memberIds ?? []);
  return Object.values(state.players).filter((p) => {
    if (activeIds.has(p.id)) return false;
    return Object.values(state.chits).some((c) => c.playerId === p.id && !c.isDiscarded);
  });
}

// ─── Setup ───────────────────────────────────────────────────────────────────

export function createInitialState(prompt: string, roomCode: string): GameState {
  return {
    roomCode,
    phase: 'lobby',
    prompt,
    players: {},
    chits: {},
    teams: {},
    turnOrder: [],
    turn: null,
    winner: null,
  };
}

export function addPlayer(state: GameState, name: string): { state: GameState; playerId: string } {
  const id = nanoid(6);
  const player: Player = { id, name, answer: '', teamId: null };
  return {
    state: { ...state, players: { ...state.players, [id]: player } },
    playerId: id,
  };
}

export function submitAnswer(state: GameState, playerId: string, answer: string): GameState {
  const chitId = nanoid(6);
  const chit: Chit = { id: chitId, playerId, answer, isDiscarded: false };
  return {
    ...state,
    players: { ...state.players, [playerId]: { ...state.players[playerId], answer } },
    chits: { ...state.chits, [chitId]: chit },
  };
}

// ─── Game Start ──────────────────────────────────────────────────────────────

export function startGame(state: GameState): GameState {
  const teams: Record<string, Team> = {};
  const turnOrder: string[] = [];
  let updatedPlayers = { ...state.players };

  const shuffled = Object.values(state.players).sort(() => Math.random() - 0.5);
  shuffled.forEach((player) => {
    const teamId = nanoid(6);
    teams[teamId] = { id: teamId, leaderId: player.id, memberIds: [player.id] };
    turnOrder.push(teamId);
    updatedPlayers[player.id] = { ...player, teamId };
  });

  const newState = { ...state, teams, turnOrder, players: updatedPlayers };
  const firstChit = drawRandomChit(newState);

  return {
    ...newState,
    phase: 'playing',
    turn: {
      activeTeamId: turnOrder[0],
      currentChitId: firstChit?.id ?? null,
      lastGuessResult: null,
      lastGuessedPlayerId: null,
    },
  };
}

// ─── Chit Drawing ─────────────────────────────────────────────────────────────

function drawRandomChit(state: GameState): Chit | null {
  const active = getActiveChits(state);
  if (active.length === 0) return null;
  return active[Math.floor(Math.random() * active.length)];
}

// ─── Guessing ─────────────────────────────────────────────────────────────────

export function makeGuess(state: GameState, guessedPlayerId: string): GameState {
  if (!state.turn) return state;
  const { activeTeamId, currentChitId } = state.turn;
  if (!currentChitId) return state;

  const isCorrect = state.chits[currentChitId].playerId === guessedPlayerId;
  return isCorrect
    ? handleCorrectGuess(state, guessedPlayerId, activeTeamId, currentChitId)
    : handleIncorrectGuess(state, guessedPlayerId);
}

function handleCorrectGuess(
  state: GameState,
  guessedPlayerId: string,
  activeTeamId: string,
  currentChitId: string
): GameState {
  // Discard the guessed chit
  const updatedChits = {
    ...state.chits,
    [currentChitId]: { ...state.chits[currentChitId], isDiscarded: true },
  };

  // Absorb the guessed player's entire team
  const guessedTeam = getTeamForPlayer(state, guessedPlayerId);
  const absorbedIds = guessedTeam ? guessedTeam.memberIds : [guessedPlayerId];
  const activeTeam = state.teams[activeTeamId];

  const updatedTeams = {
    ...state.teams,
    [activeTeamId]: { ...activeTeam, memberIds: [...activeTeam.memberIds, ...absorbedIds] },
  };

  let updatedTurnOrder = [...state.turnOrder];
  if (guessedTeam && guessedTeam.id !== activeTeamId) {
    delete updatedTeams[guessedTeam.id];
    updatedTurnOrder = updatedTurnOrder.filter((id) => id !== guessedTeam.id);
  }

  let updatedPlayers = { ...state.players };
  absorbedIds.forEach((pid) => {
    updatedPlayers[pid] = { ...updatedPlayers[pid], teamId: activeTeamId };
  });

  const newState: GameState = {
    ...state,
    players: updatedPlayers,
    chits: updatedChits,
    teams: updatedTeams,
    turnOrder: updatedTurnOrder,
  };

  const activeChits = getActiveChits(newState);
  if (activeChits.length === 0) {
    return { ...newState, phase: 'ended', winner: activeTeamId, turn: null };
  }

  const nextChit = drawRandomChit(newState);
  return {
    ...newState,
    turn: {
      activeTeamId,
      currentChitId: nextChit?.id ?? null,
      lastGuessResult: 'correct',
      lastGuessedPlayerId: guessedPlayerId,
    },
  };
}

function handleIncorrectGuess(state: GameState, guessedPlayerId: string): GameState {
  if (!state.turn) return state;
  const { activeTeamId, currentChitId } = state.turn;
  const currentIndex = state.turnOrder.indexOf(activeTeamId);
  const nextIndex = (currentIndex + 1) % state.turnOrder.length;

  return {
    ...state,
    turn: {
      activeTeamId: state.turnOrder[nextIndex],
      currentChitId,
      lastGuessResult: 'incorrect',
      lastGuessedPlayerId: guessedPlayerId,
    },
  };
}

export function passTurn(state: GameState): GameState {
  if (!state.turn) return state;
  const { activeTeamId, currentChitId } = state.turn;
  const currentIndex = state.turnOrder.indexOf(activeTeamId);
  const nextIndex = (currentIndex + 1) % state.turnOrder.length;

  return {
    ...state,
    turn: {
      activeTeamId: state.turnOrder[nextIndex],
      currentChitId,
      lastGuessResult: null,
      lastGuessedPlayerId: null,
    },
  };
}
