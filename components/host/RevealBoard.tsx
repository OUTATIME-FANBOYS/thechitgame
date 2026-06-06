'use client';
import { useGameState } from '@/hooks/useGameState';
import { getTeamMembers } from '@/lib/gameEngine';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { useGameStore } from '@/lib/gameStore';

export function RevealBoard() {
  const { game } = useGameState();
  const resetGame = useGameStore((s) => s.resetGame);
  if (!game || game.phase !== 'ended' || !game.winner) return null;

  const winners = getTeamMembers(game, game.winner);
  const chits = Object.values(game.chits);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Game Over!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Winners:{' '}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {winners.map((p) => p.name).join(', ')}
          </span>
        </p>
      </div>

      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">All Answers Revealed</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {chits.map((chit) => {
            const author = game.players[chit.playerId];
            return (
              <Card key={chit.id} className="flex flex-col gap-1">
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">{chit.answer}</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">— {author?.name ?? 'Unknown'}</p>
              </Card>
            );
          })}
        </div>
      </div>

      <Button onClick={resetGame} className="w-full py-3">Play Again</Button>
    </div>
  );
}
