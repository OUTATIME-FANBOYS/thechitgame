'use client';
import { useState } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

export function JoinRoom({ onJoined }: { onJoined: (id: string) => void }) {
  const [name, setName] = useState('');
  const joinGame = useGameStore((s) => s.joinGame);

  const handle = () => {
    if (!name.trim()) return;
    onJoined(joinGame(name.trim()));
  };

  return (
    <Card className="max-w-sm mx-auto">
      <p className="text-lg font-semibold text-gray-800 mb-4">Join Game</p>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handle()}
        className="glass-input mb-3"
      />
      <Button onClick={handle} disabled={!name.trim()} className="w-full">Join</Button>
    </Card>
  );
}
