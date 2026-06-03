'use client';
import { useGameState } from '@/hooks/useGameState';
import { getTeamMembers } from '@/lib/gameEngine';
import { Card } from '@/components/shared/Card';

export function TeamBoard() {
  const { game } = useGameState();
  if (!game) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide">Teams</p>
      {Object.values(game.teams).map((team) => {
        const members = getTeamMembers(game, team.id);
        const isActive = game.turn?.activeTeamId === team.id;
        return (
          <Card key={team.id} className={isActive ? 'border-[#30D158]/55 bg-[#30D158]/10' : ''}>
            <div className="flex items-center gap-2 flex-wrap">
              {isActive && <span className="text-xs text-emerald-700 font-bold tracking-wide">▶ ACTIVE</span>}
              {members.map((p) => (
                <span key={p.id} className="text-sm font-medium text-gray-800">
                  {p.name}{p.id === team.leaderId ? ' ★' : ''}
                </span>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
