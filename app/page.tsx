'use client';
import { useState } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import Link from 'next/link';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const createGame = useGameStore((s) => s.createGame);
  const game = useGameStore((s) => s.game);

  const handle = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    await createGame(prompt.trim());
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chit Game</h1>
          <p className="text-gray-500 text-sm mt-1">A social deduction party game</p>
        </div>
        {!game ? (
          <Card>
            <p className="text-sm font-medium text-gray-700 mb-3">Create a new game</p>
            <input
              type="text"
              placeholder="Enter a prompt (e.g. What's the last thing you do before sleeping?)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handle()}
              className="glass-input mb-3"
            />
            <Button onClick={handle} disabled={!prompt.trim() || loading} className="w-full">
              {loading ? 'Creating...' : 'Create Game'}
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            <Card className="text-center">
              <p className="text-xs text-gray-500 mb-1">Game created!</p>
              <p className="text-2xl font-bold text-indigo-600 tracking-widest">{game.roomCode}</p>
            </Card>
            <Link href="/host" className="block w-full"><Button className="w-full py-4">Open Host Screen</Button></Link>
            <Link href="/player" className="block w-full"><Button variant="secondary" className="w-full py-4">Open Player Screen</Button></Link>
          </div>
        )}
      </div>
    </main>
  );
}
