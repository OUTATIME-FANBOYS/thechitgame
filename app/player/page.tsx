'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { useGameStore } from '@/lib/gameStore';
import { JoinRoom } from '@/components/player/JoinRoom';
import { AnswerSubmit } from '@/components/player/AnswerSubmit';
import { GuessPanel } from '@/components/player/GuessPanel';
import Link from 'next/link';

function PlayerContent() {
  const roomCode = useGameStore((s) => s.roomCode);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const { game } = useGameState();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get('code')?.toUpperCase() ?? '';

  useEffect(() => {
    if (!roomCode) return;
    const stored = localStorage.getItem(`chit-player-${roomCode}`);
    if (stored) setPlayerId(stored);
  }, [roomCode]);

  const handleJoined = (id: string) => {
    if (roomCode) localStorage.setItem(`chit-player-${roomCode}`, id);
    setPlayerId(id);
  };

  if (!game) return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <JoinRoom onJoined={handleJoined} initialCode={codeFromUrl} />
      </div>
    </main>
  );

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!playerId && game.phase === 'playing' && (
          <div className="max-w-sm mx-auto text-center text-gray-500 dark:text-gray-400 text-sm p-6">
            Game already started — ask the host to end it and start a new one.
          </div>
        )}
        {!playerId && game.phase !== 'playing' && <JoinRoom onJoined={handleJoined} initialCode={codeFromUrl} />}
        {playerId && game.phase === 'lobby' && <AnswerSubmit playerId={playerId} />}
        {playerId && game.phase === 'playing' && <GuessPanel playerId={playerId} />}
        {playerId && game.phase === 'ended' && (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            Game ended! <Link href="/" className="text-emerald-700 dark:text-emerald-400 underline">Play again</Link>
          </p>
        )}
      </div>
    </main>
  );
}

export default function PlayerPage() {
  return (
    <Suspense>
      <PlayerContent />
    </Suspense>
  );
}
