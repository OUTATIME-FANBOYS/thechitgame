'use client';
import { useState, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { JoinRoom } from '@/components/player/JoinRoom';
import { AnswerSubmit } from '@/components/player/AnswerSubmit';
import { GuessPanel } from '@/components/player/GuessPanel';
import Link from 'next/link';

export default function PlayerPage() {
  const [playerId, setPlayerId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('chit-player-id');
  });
  const { game } = useGameState();

  useEffect(() => {
    if (playerId) sessionStorage.setItem('chit-player-id', playerId);
  }, [playerId]);

  if (!game) {
    sessionStorage.removeItem('chit-player-id');
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No active game. <Link href="/" className="text-emerald-700 underline">Create one</Link></p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full">
        {!playerId && game.phase === 'playing' && (
          <div className="max-w-sm mx-auto text-center text-gray-500 text-sm p-6">
            Game already started — ask the host to end it and start a new one.
          </div>
        )}
        {!playerId && game.phase !== 'playing' && <JoinRoom onJoined={setPlayerId} />}
        {playerId && game.phase === 'lobby' && <AnswerSubmit playerId={playerId} />}
        {playerId && game.phase === 'playing' && <GuessPanel playerId={playerId} />}
        {playerId && game.phase === 'ended' && (
          <p className="text-center text-gray-500 text-sm">Game ended! <Link href="/" className="text-indigo-600 underline">Play again</Link></p>
        )}
      </div>
    </main>
  );
}
