'use client';
import { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { useGameStore } from '@/lib/gameStore';
import { getActiveChits, getTeamMembers } from '@/lib/gameEngine';
import { GameState } from '@/lib/types';
import { api } from '@/convex/_generated/api';

export function useGameState() {
  const game = useGameStore((s) => s.game);
  const roomCode = useGameStore((s) => s.roomCode);
  const setGame = useGameStore((s) => s.setGame);

  // Live subscription: Convex re-runs this query whenever the room document changes.
  const liveState = useQuery(api.games.getByRoom, roomCode ? { roomCode } : 'skip');

  useEffect(() => {
    if (liveState === undefined) return; // still loading
    setGame((liveState as GameState | null) ?? null);
  }, [liveState, setGame]);

  if (!game) return { game: null };

  const activeChits = getActiveChits(game);
  const currentChit = game.turn?.currentChitId ? game.chits[game.turn.currentChitId] : null;
  const activeTeam = game.turn?.activeTeamId ? game.teams[game.turn.activeTeamId] : null;
  const activeTeamMembers = activeTeam ? getTeamMembers(game, activeTeam.id) : [];

  return { game, activeChits, currentChit, activeTeam, activeTeamMembers };
}
