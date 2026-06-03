import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState } from './types';
import { createInitialState, addPlayer, submitAnswer, startGame, makeGuess, passTurn } from './gameEngine';

interface GameStore {
  game: GameState | null;
  createGame: (prompt: string) => void;
  joinGame: (name: string) => string;
  submitPlayerAnswer: (playerId: string, answer: string) => void;
  startTheGame: () => void;
  guess: (guessedPlayerId: string) => void;
  skipTurn: () => void;
  resetGame: () => void;
  seedDevPlayers: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      game: null,

      createGame: (prompt) => {
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        set({ game: createInitialState(prompt, roomCode) });
      },

      joinGame: (name) => {
        const { game } = get();
        if (!game) return '';
        const { state: newState, playerId } = addPlayer(game, name);
        set({ game: newState });
        return playerId;
      },

      submitPlayerAnswer: (playerId, answer) => {
        const { game } = get();
        if (!game) return;
        set({ game: submitAnswer(game, playerId, answer) });
      },

      startTheGame: () => {
        const { game } = get();
        if (!game) return;
        set({ game: startGame(game) });
      },

      guess: (guessedPlayerId) => {
        const { game } = get();
        if (!game) return;
        set({ game: makeGuess(game, guessedPlayerId) });
      },

      skipTurn: () => {
        const { game } = get();
        if (!game) return;
        set({ game: passTurn(game) });
      },

      resetGame: () => set({ game: null }),

      seedDevPlayers: () => {
        const { game } = get();
        if (!game || game.phase !== 'lobby') return;
        const existingNames = new Set(Object.values(game.players).map((p) => p.name));
        const fakes = [
          { name: 'Alice', answer: 'Scroll through my phone' },
          { name: 'Bob', answer: 'Brush my teeth' },
          { name: 'Carol', answer: 'Set three alarms' },
          { name: 'Dave', answer: 'Check all the locks' },
        ].filter((p) => !existingNames.has(p.name));
        if (fakes.length === 0) return;
        let g = game;
        for (const p of fakes) {
          const { state: withPlayer, playerId } = addPlayer(g, p.name);
          g = submitAnswer(withPlayer, playerId, p.answer);
        }
        set({ game: g });
      },
    }),
    {
      name: 'chit-game',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
