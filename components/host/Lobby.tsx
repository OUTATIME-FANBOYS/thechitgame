'use client';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useGameStore } from '@/lib/gameStore';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

function BouncingDots() {
  return (
    <span className="inline-flex gap-1 items-center ml-1">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:300ms]" />
    </span>
  );
}

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
  const waitingPlayers = players.filter((p) => !p.answer);

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
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Room Code</p>
          <p className="text-4xl sm:text-5xl font-bold tracking-[0.15em] sm:tracking-[0.2em] text-indigo-600 dark:text-indigo-400">{game.roomCode}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Scan or visit <span className="font-medium text-gray-600 dark:text-gray-400 break-all">{typeof window !== 'undefined' ? `${window.location.hostname}/player` : ''}</span></p>
        </div>
      </Card>

      {/* Prompt */}
      <Card>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Prompt</p>
        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{game.prompt}</p>
      </Card>

      {/* Player list */}
      <Card>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Players ({players.length})
        </p>
        <div className="space-y-2">
          {players.map((p, i) => {
            const isWaiting = !p.answer;
            const waitingIndex = waitingPlayers.findIndex((w) => w.id === p.id);
            return (
              <div
                key={p.id}
                className="flex items-center justify-between py-1.5 px-2.5 rounded-xl border transition-colors duration-150"
                style={
                  isWaiting
                    ? { animationName: 'chit-player-pulse', animationDuration: '2s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', animationDelay: `${waitingIndex * 0.45}s` }
                    : undefined
                }
              >
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{p.name}</span>
                <span className={`text-xs font-medium ${p.answer ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {p.answer ? '✓ Ready' : <span className="inline-flex items-center">Thinking<BouncingDots /></span>}
                </span>
              </div>
            );
          })}
          {players.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2 flex items-center justify-center gap-1">
              Waiting for players to join<BouncingDots />
            </p>
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
