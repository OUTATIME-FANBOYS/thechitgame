'use client';
import { useGameStore } from '@/lib/gameStore';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

export function Lobby() {
  const { game } = useGameState();
  const startTheGame = useGameStore((s) => s.startTheGame);
  const seedDevPlayers = useGameStore((s) => s.seedDevPlayers);
  if (!game) return null;

  const players = Object.values(game.players);
  const allAnswered = players.length > 1 && players.every((p) => p.answer !== '');

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Room Code</p>
        <p className="text-4xl font-bold tracking-widest text-indigo-600">{game.roomCode}</p>
      </Card>
      <Card>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Prompt</p>
        <p className="text-lg font-medium text-gray-800">{game.prompt}</p>
      </Card>
      <Card>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Players ({players.length})</p>
        <div className="space-y-2">
          {players.map((p) => (
            <div key={p.id} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800">{p.name}</span>
              <span className={`text-xs ${p.answer ? 'text-green-600' : 'text-gray-400'}`}>
                {p.answer ? '✓ Ready' : 'Waiting...'}
              </span>
            </div>
          ))}
          {players.length === 0 && <p className="text-sm text-gray-400">No players yet</p>}
        </div>
      </Card>
      <Button onClick={startTheGame} disabled={!allAnswered} className="w-full py-3 text-base">
        {allAnswered ? 'Start Game' : 'Waiting for all players to answer...'}
      </Button>
      {process.env.NODE_ENV === 'development' && (
        <Button variant="ghost" onClick={seedDevPlayers} className="w-full text-xs text-gray-400">
          Dev: Seed 4 players
        </Button>
      )}
    </div>
  );
}
