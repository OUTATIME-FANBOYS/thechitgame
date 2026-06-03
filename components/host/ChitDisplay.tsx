'use client';
import { useGameState } from '@/hooks/useGameState';
import { Card } from '@/components/shared/Card';

export function ChitDisplay() {
  const { game, currentChit, activeTeam, activeTeamMembers } = useGameState();
  if (!game || !game.turn) return null;

  return (
    <div className="space-y-4">
      <Card className="text-center py-8">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Current Chit</p>
        <p className="text-3xl font-bold text-gray-900">{currentChit?.answer ?? '—'}</p>
      </Card>
      <Card>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Active Team</p>
        <div className="flex flex-wrap gap-2">
          {activeTeamMembers.map((p) => (
            <span key={p.id} className="px-3 py-1 bg-[#30D158]/15 border border-[#30D158]/35 text-emerald-800 rounded-full text-sm font-medium">
              {p.name}
            </span>
          ))}
        </div>
      </Card>
      {game.turn.lastGuessResult && (
        <Card className={game.turn.lastGuessResult === 'correct'
          ? 'bg-[#30D158]/15 border-[#30D158]/40'
          : 'bg-[#FF453A]/12 border-[#FF453A]/35'}>
          <p className={`text-sm font-semibold ${game.turn.lastGuessResult === 'correct' ? 'text-emerald-800' : 'text-red-700'}`}>
            {game.turn.lastGuessResult === 'correct' ? '✓ Correct! Keep guessing.' : '✗ Wrong guess — turn passes.'}
          </p>
        </Card>
      )}
    </div>
  );
}
