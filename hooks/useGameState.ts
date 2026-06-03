import { useGameStore } from '@/lib/gameStore';
import { getActiveChits, getTeamMembers } from '@/lib/gameEngine';

export function useGameState() {
  const game = useGameStore((s) => s.game);
  if (!game) return { game: null };

  const activeChits = getActiveChits(game);
  const currentChit = game.turn?.currentChitId ? game.chits[game.turn.currentChitId] : null;
  const activeTeam = game.turn?.activeTeamId ? game.teams[game.turn.activeTeamId] : null;
  const activeTeamMembers = activeTeam ? getTeamMembers(game, activeTeam.id) : [];

  return { game, activeChits, currentChit, activeTeam, activeTeamMembers };
}
