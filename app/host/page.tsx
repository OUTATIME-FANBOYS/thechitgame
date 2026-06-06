'use client';
import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useGameStore } from '@/lib/gameStore';
import { getGuessablePlayers } from '@/lib/gameEngine';
import { Lobby } from '@/components/host/Lobby';
import { ChitDisplay } from '@/components/host/ChitDisplay';
import { TeamBoard } from '@/components/host/TeamBoard';
import { RevealBoard } from '@/components/host/RevealBoard';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function HostPage() {
  const { game, activeTeam } = useGameState();
  const resetGame = useGameStore((s) => s.resetGame);
  const skipTurn = useGameStore((s) => s.skipTurn);
  const guess = useGameStore((s) => s.guess);
  const [selected, setSelected] = useState<string | null>(null);

  if (!game) return (
    <main className="min-h-dvh flex items-center justify-center px-4">
      <p className="text-gray-500 dark:text-gray-400">No active game. <Link href="/" className="text-emerald-700 dark:text-emerald-400 underline">Create one</Link></p>
    </main>
  );

  const handleGuess = () => {
    if (!selected) return;
    guess(selected);
    setSelected(null);
  };

  return (
    <main className="min-h-dvh px-4 py-5 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Host Screen</h1>
          <Button variant="ghost" onClick={resetGame}>End Game</Button>
        </div>
        {game.phase === 'lobby' && <Lobby />}
        {game.phase === 'playing' && (
          <>
            <ChitDisplay />
            <TeamBoard />
            <Card>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Guess for <span className="text-emerald-700 dark:text-emerald-400">{activeTeam ? game.players[activeTeam.leaderId]?.name : '—'}&apos;s team</span>
              </p>
              <div className="space-y-2 mb-4">
                {getGuessablePlayers(game).map((p) => {
                  const isSelected = selected === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelected(isSelected ? null : p.id)}
                      className={cn(
                        'w-full text-left rounded-xl border px-3 py-2.5 text-sm font-medium',
                        'backdrop-blur-xl transition-all duration-150 active:scale-[0.98] touch-manipulation',
                        isSelected
                          ? 'border-[#30D158]/55 bg-[#30D158]/15 text-emerald-800 dark:text-emerald-300 shadow-[0_2px_12px_rgba(48,209,88,0.2)]'
                          : 'border-white/50 bg-white/60 text-gray-800 dark:text-gray-200 dark:border-white/10 dark:bg-white/5 hover:border-[#30D158]/40 hover:bg-white/75'
                      )}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleGuess} disabled={!selected} className="flex-1">Guess</Button>
                <Button variant="secondary" onClick={() => { setSelected(null); skipTurn(); }}>Skip Turn →</Button>
              </div>
            </Card>
          </>
        )}
        {game.phase === 'ended' && <RevealBoard />}
      </div>
    </main>
  );
}
