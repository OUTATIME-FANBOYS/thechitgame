'use client';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useGameStore } from '@/lib/gameStore';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

export function Lobby() {
  const { game } = useGameState();
  const startTheGame = useGameStore((s) => s.startTheGame);
  const seedDevPlayers = useGameStore((s) => s.seedDevPlayers);
  const [joinUrl, setJoinUrl] = useState('');

  useEffect(() => {
    if (game?.roomCode) {
      setJoinUrl(`${window.location.origin}/player?code=${game.roomCode}`);
    }
  }, [game?.roomCode]);

  if (!game) return null;

  const players = Object.values(game.players);
  const allAnswered = players.length > 1 && players.every((p) => p.answer !== '');

  return (
    <div className="space-y-5">
      {/* QR + room code */}
      <Card className="flex flex-col items-center gap-4 py-6">
        {joinUrl && (
          <div className="p-3 bg-white rounded-2xl shadow-sm">
            <QRCodeSVG
              value={joinUrl}
              size={160}
              fgColor="#1a1a1a"
              bgColor="#ffffff"
              level="M"
            />
          </div>
        )}
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Room Code</p>
          <p className="text-4xl sm:text-5xl font-bold tracking-[0.15em] sm:tracking-[0.2em] text-indigo-600">{game.roomCode}</p>
          <p className="text-xs text-gray-400 mt-2">Scan or visit <span className="font-medium text-gray-600 break-all">{typeof window !== 'undefined' ? `${window.location.hostname}/player` : ''}</span></p>
        </div>
      </Card>

      {/* Prompt */}
      <Card>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Prompt</p>
        <p className="text-lg font-medium text-gray-800">{game.prompt}</p>
      </Card>

      {/* Player list */}
      <Card>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
          Players ({players.length})
        </p>
        <div className="space-y-2">
          {players.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-gray-800">{p.name}</span>
              <span className={`text-xs font-medium ${p.answer ? 'text-emerald-600' : 'text-gray-400'}`}>
                {p.answer ? '✓ Ready' : 'Thinking…'}
              </span>
            </div>
          ))}
          {players.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">Waiting for players to join…</p>
          )}
        </div>
      </Card>

      <Button onClick={startTheGame} disabled={!allAnswered} className="w-full py-4 text-base">
        {allAnswered ? 'Start Game' : 'Waiting for all players to answer…'}
      </Button>
      {process.env.NODE_ENV === 'development' && (
        <Button variant="ghost" onClick={seedDevPlayers} className="w-full text-xs text-gray-400">
          Dev: Seed 4 players
        </Button>
      )}
    </div>
  );
}
