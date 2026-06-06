import { Player } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlayerBadgeProps {
  player: Player;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function PlayerBadge({ player, onClick, selected, className }: PlayerBadgeProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm font-medium',
        'backdrop-blur-xl border transition-all duration-150',
        'min-h-9 touch-manipulation select-none',
        selected
          ? 'bg-[#30D158]/25 border-[#30D158]/55 text-emerald-800 dark:text-emerald-300 shadow-[0_2px_12px_rgba(48,209,88,0.25)] scale-[1.04]'
          : 'bg-white/60 border-white/50 text-gray-700 dark:text-gray-300 dark:bg-white/5 dark:border-white/10 shadow-sm',
        onClick && !selected && 'hover:scale-[1.05] hover:bg-white/80 hover:border-[#30D158]/40 active:scale-[0.97]',
        !onClick && 'cursor-default',
        className
      )}
    >
      {player.name}
    </button>
  );
}
