'use client';
import { useEffect } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { getActiveChits, getTeamMembers } from '@/lib/gameEngine';
import { supabase } from '@/lib/supabase';
import { GameState } from '@/lib/types';

export function useGameState() {
  const game = useGameStore((s) => s.game);
  const roomCode = useGameStore((s) => s.roomCode);
  const setGame = useGameStore((s) => s.setGame);

  useEffect(() => {
    if (!roomCode) return;

    supabase
      .from('games')
      .select('state')
      .eq('room_code', roomCode)
      .single()
      .then(({ data }) => { if (data) setGame(data.state as GameState); });

    const channel = supabase
      .channel(`game-${roomCode}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games', filter: `room_code=eq.${roomCode}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setGame(null);
          } else {
            setGame((payload.new as { state: GameState }).state);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomCode, setGame]);

  if (!game) return { game: null };

  const activeChits = getActiveChits(game);
  const currentChit = game.turn?.currentChitId ? game.chits[game.turn.currentChitId] : null;
  const activeTeam = game.turn?.activeTeamId ? game.teams[game.turn.activeTeamId] : null;
  const activeTeamMembers = activeTeam ? getTeamMembers(game, activeTeam.id) : [];

  return { game, activeChits, currentChit, activeTeam, activeTeamMembers };
}
