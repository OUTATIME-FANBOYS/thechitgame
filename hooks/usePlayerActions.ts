import { useGameStore } from '@/lib/gameStore';
export function usePlayerActions() {
  const { joinGame, submitPlayerAnswer, guess } = useGameStore();
  return { joinGame, submitPlayerAnswer, guess };
}
