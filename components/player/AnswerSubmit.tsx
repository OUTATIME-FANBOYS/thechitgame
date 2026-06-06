'use client';
import { useState } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

export function AnswerSubmit({ playerId }: { playerId: string }) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submitPlayerAnswer = useGameStore((s) => s.submitPlayerAnswer);
  const { game } = useGameState();

  const handle = () => {
    if (!answer.trim()) return;
    submitPlayerAnswer(playerId, answer.trim());
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card className="max-w-sm mx-auto text-center">
        <p className="text-green-600 dark:text-green-400 font-medium">✓ Answer submitted!</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Waiting for the game to start...</p>
      </Card>
    );
  }

  return (
    <Card className="max-w-sm mx-auto">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Prompt</p>
      <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">{game?.prompt}</p>
      <input
        type="text"
        placeholder="Your answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handle()}
        className="glass-input mb-3"
      />
      <Button onClick={handle} disabled={!answer.trim()} className="w-full">Submit Answer</Button>
    </Card>
  );
}
