'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { getRandomPrompt } from '@/lib/prompts';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

const SHAKE_THRESHOLD = 18;
const SHAKE_COOLDOWN_MS = 1200;

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');
  const [shook, setShook] = useState(false);
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const lastShakeAt = useRef(0);
  const createGame = useGameStore((s) => s.createGame);
  const game = useGameStore((s) => s.game);

  const applyRandom = useCallback(() => {
    setPrompt(getRandomPrompt());
    setShook(true);
    setTimeout(() => setShook(false), 500);
  }, []);

  const handleRandomClick = async () => {
    applyRandom();
    // iOS 13+ requires a user-gesture to unlock DeviceMotionEvent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DME = DeviceMotionEvent as any;
    if (typeof DME !== 'undefined' && typeof DME.requestPermission === 'function') {
      try { await DME.requestPermission(); } catch { /* user denied */ }
    }
  };

  useEffect(() => {
    if (game) return;

    const handleMotion = (e: DeviceMotionEvent) => {
      const accel = e.accelerationIncludingGravity;
      if (!accel) return;
      const x = accel.x ?? 0;
      const y = accel.y ?? 0;
      const z = accel.z ?? 0;
      const last = lastAccel.current;
      const delta = Math.abs(x - last.x) + Math.abs(y - last.y) + Math.abs(z - last.z);
      lastAccel.current = { x, y, z };

      const now = Date.now();
      if (delta > SHAKE_THRESHOLD && now - lastShakeAt.current > SHAKE_COOLDOWN_MS) {
        lastShakeAt.current = now;
        applyRandom();
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [game, applyRandom]);

  useEffect(() => {
    if (game?.roomCode) {
      setJoinUrl(`${window.location.origin}/player?code=${game.roomCode}`);
    }
  }, [game?.roomCode]);

  const handle = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    await createGame(prompt.trim());
    setLoading(false);
  };

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Chit Game</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">A social deduction party game</p>
        </div>
        {!game ? (
          <Card className={shook ? 'ring-2 ring-yellow-400/60' : ''}>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Create a new game</p>
            <textarea
              placeholder="Enter a prompt (e.g. What's the last thing you do before sleeping?)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handle()}
              rows={3}
              className="glass-input mb-3 resize-none"
            />
            <Button variant="yellow" onClick={handleRandomClick} className="w-full mb-2">
              🎲 Shock me with a random prompt
            </Button>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mb-3">
              or shake your phone
            </p>
            <Button onClick={handle} disabled={!prompt.trim() || loading} className="w-full">
              {loading ? 'Creating...' : 'Create Game'}
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
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
                <p className="text-4xl font-bold tracking-[0.15em] text-indigo-600 dark:text-indigo-400">{game.roomCode}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Scan to join or share the code</p>
              </div>
            </Card>
            <Link href="/host" className="block w-full"><Button className="w-full py-4">Open Host Screen</Button></Link>
            <Link href="/player" className="block w-full"><Button variant="secondary" className="w-full py-4">Open Player Screen</Button></Link>
          </div>
        )}
      </div>
    </main>
  );
}
