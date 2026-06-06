'use client';
import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useGameStore } from '@/lib/gameStore';
import { getGuessablePlayers, getTeamForPlayer, getTeamMembers } from '@/lib/gameEngine';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { cn } from '@/lib/utils';

export function GuessPanel({ playerId }: { playerId: string }) {
  const { game, currentChit, activeTeam } = useGameState();
  const guess = useGameStore((s) => s.guess);
  const [selected, setSelected] = useState<string | null>(null);

  if (!game || !game.turn || !activeTeam) return null;

  const isMyTeamsTurn = activeTeam.memberIds.includes(playerId);
  const guessablePlayers = getGuessablePlayers(game);

  const handle = () => {
    if (!selected) return;
    guess(selected);
    setSelected(null);
  };

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <Card className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Current Chit</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentChit?.answer ?? '—'}</p>
      </Card>

      {isMyTeamsTurn ? (
        <Card>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Who wrote this?</p>
          <div className="space-y-2 mb-4">
            {guessablePlayers.map((p) => {
              const team = getTeamForPlayer(game, p.id);
              const teammates = team
                ? getTeamMembers(game, team.id).filter((m) => m.id !== p.id)
                : [];
              const isSelected = selected === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(isSelected ? null : p.id)}
                  className={cn(
                    'w-full text-left rounded-xl border px-3 py-2.5',
                    'backdrop-blur-xl transition-all duration-150',
                    'active:scale-[0.98] touch-manipulation',
                    isSelected
                      ? 'border-[#30D158]/55 bg-[#30D158]/15 shadow-[0_2px_12px_rgba(48,209,88,0.2)]'
                      : 'border-white/50 bg-white/60 dark:border-white/10 dark:bg-white/5 hover:border-[#30D158]/40 hover:bg-white/75'
                  )}
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{p.name}</p>
                  {teammates.length > 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      +{teammates.map((t) => t.name).join(', ')}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
          <Button onClick={handle} disabled={!selected} className="w-full">Guess</Button>
        </Card>
      ) : (
        <Card className="text-center text-sm text-gray-500 dark:text-gray-400">
          It&apos;s <span className="font-medium text-gray-700 dark:text-gray-300">
            {game.players[activeTeam.leaderId]?.name}&apos;s team
          </span>&apos;s turn to guess
        </Card>
      )}
    </div>
  );
}
