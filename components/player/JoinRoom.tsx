'use client';
import { useState } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

export function JoinRoom({ onJoined, initialCode = '' }: { onJoined: (id: string) => void; initialCode?: string }) {
  const [roomCode, setRoomCode] = useState(initialCode);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const joinRoom = useGameStore((s) => s.joinRoom);
  const joinGame = useGameStore((s) => s.joinGame);

  const handle = async () => {
    if (!roomCode.trim() || !name.trim()) return;
    setLoading(true);
    setError('');
    const found = await joinRoom(roomCode.trim());
    if (!found) {
      setError('Room not found. Check the code and try again.');
      setLoading(false);
      return;
    }
    const id = await joinGame(name.trim());
    setLoading(false);
    onJoined(id);
  };

  return (
    <Card className="max-w-sm mx-auto">
      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Join Game</p>
      <input
        type="text"
        placeholder="Room code (e.g. AB12)"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && handle()}
        className="glass-input mb-3"
        maxLength={4}
      />
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handle()}
        className="glass-input mb-3"
      />
      {error && <p className="text-red-600 dark:text-red-400 text-xs mb-3">{error}</p>}
      <Button onClick={handle} disabled={!roomCode.trim() || !name.trim() || loading} className="w-full">
        {loading ? 'Joining...' : 'Join'}
      </Button>
    </Card>
  );
}
