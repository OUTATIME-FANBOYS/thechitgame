'use client';
import { useEffect } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { getActiveChits, getTeamMembers } from '@/lib/gameEngine';
import { getSupabase } from '@/lib/supabase';
import { GameState } from '@/lib/types';

export function useGameState() {
  const game = useGameStore((s) => s.game);
  const roomCode = useGameStore((s) => s.roomCode);
  const setGame = useGameStore((s) => s.setGame);

  useEffect(() => {
    if (!roomCode) return;

    const sb = getSupabase();
    const channelName = `game-${roomCode}`;

    // Remove any stale channel from a previous render before subscribing
    sb.getChannels().forEach((ch) => {
      if (ch.topic === `realtime:${channelName}`) sb.removeChannel(ch);
    });

    sb.from('games')
      .select('state')
      .eq('room_code', roomCode)
      .single()
      .then(({ data }) => { if (data) setGame(data.state as GameState); });

    const channel = sb
      .channel(channelName)
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

    return () => { sb.removeChannel(channel); };
  // setGame is a stable Zustand ref — excluding it prevents unnecessary re-subscriptions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  if (!game) return { game: null };

  const activeChits = getActiveChits(game);
  const currentChit = game.turn?.currentChitId ? game.chits[game.turn.currentChitId] : null;
  const activeTeam = game.turn?.activeTeamId ? game.teams[game.turn.activeTeamId] : null;
  const activeTeamMembers = activeTeam ? getTeamMembers(game, activeTeam.id) : [];

  return { game, activeChits, currentChit, activeTeam, activeTeamMembers };
}
