import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState } from './types';
import { createInitialState, addPlayer, submitAnswer, startGame, makeGuess, passTurn } from './gameEngine';
import { supabase } from './supabase';

async function fetchState(roomCode: string): Promise<GameState | null> {
  const { data } = await supabase.from('games').select('state').eq('room_code', roomCode).single();
  return data?.state ?? null;
}

async function writeState(roomCode: string, state: GameState): Promise<void> {
  await supabase.from('games').upsert({ room_code: roomCode, state });
}

interface GameStore {
  game: GameState | null;
  roomCode: string | null;
  setGame: (game: GameState | null) => void;
  createGame: (prompt: string) => Promise<void>;
  joinRoom: (roomCode: string) => Promise<boolean>;
  joinGame: (name: string) => Promise<string>;
  submitPlayerAnswer: (playerId: string, answer: string) => Promise<void>;
  startTheGame: () => Promise<void>;
  guess: (guessedPlayerId: string) => Promise<void>;
  skipTurn: () => Promise<void>;
  resetGame: () => Promise<void>;
  seedDevPlayers: () => Promise<void>;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      game: null,
      roomCode: null,

      setGame: (game) => set({ game }),

      createGame: async (prompt) => {
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        const game = createInitialState(prompt, roomCode);
        await writeState(roomCode, game);
        set({ game, roomCode });
      },

      joinRoom: async (code) => {
        const roomCode = code.toUpperCase();
        const game = await fetchState(roomCode);
        if (!game) return false;
        set({ roomCode, game });
        return true;
      },

      joinGame: async (name) => {
        const { game, roomCode } = get();
        if (!game || !roomCode) return '';
        const { state: newState, playerId } = addPlayer(game, name);
        await writeState(roomCode, newState);
        set({ game: newState });
        return playerId;
      },

      submitPlayerAnswer: async (playerId, answer) => {
        const { game, roomCode } = get();
        if (!game || !roomCode) return;
        const newState = submitAnswer(game, playerId, answer);
        await writeState(roomCode, newState);
        set({ game: newState });
      },

      startTheGame: async () => {
        const { game, roomCode } = get();
        if (!game || !roomCode) return;
        const newState = startGame(game);
        await writeState(roomCode, newState);
        set({ game: newState });
      },

      guess: async (guessedPlayerId) => {
        const { game, roomCode } = get();
        if (!game || !roomCode) return;
        const newState = makeGuess(game, guessedPlayerId);
        await writeState(roomCode, newState);
        set({ game: newState });
      },

      skipTurn: async () => {
        const { game, roomCode } = get();
        if (!game || !roomCode) return;
        const newState = passTurn(game);
        await writeState(roomCode, newState);
        set({ game: newState });
      },

      resetGame: async () => {
        const { roomCode } = get();
        if (roomCode) await supabase.from('games').delete().eq('room_code', roomCode);
        set({ game: null, roomCode: null });
      },

      seedDevPlayers: async () => {
        const { game, roomCode } = get();
        if (!game || !roomCode || game.phase !== 'lobby') return;
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
        await writeState(roomCode, g);
        set({ game: g });
      },
    }),
    {
      name: 'chit-room',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ roomCode: state.roomCode }),
    }
  )
);
