import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'yellow' | 'red';
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-5 py-3 rounded-2xl font-semibold text-sm',
        'transition-all duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'hover:scale-[1.02] active:scale-[0.97]',
        'min-h-[44px] touch-manipulation select-none',

        variant === 'primary' && [
          'bg-[#30D158]/20 backdrop-blur-xl',
          'border border-[#30D158]/50',
          'text-emerald-800',
          'shadow-[0_4px_20px_rgba(48,209,88,0.2)]',
          'hover:bg-[#30D158]/30 hover:shadow-[0_6px_28px_rgba(48,209,88,0.3)]',
          'focus-visible:ring-[#30D158]',
        ],

        variant === 'yellow' && [
          'bg-[#FFD60A]/20 backdrop-blur-xl',
          'border border-[#FFD60A]/55',
          'text-yellow-800',
          'shadow-[0_4px_20px_rgba(255,214,10,0.2)]',
          'hover:bg-[#FFD60A]/30 hover:shadow-[0_6px_28px_rgba(255,214,10,0.3)]',
          'focus-visible:ring-[#FFD60A]',
        ],

        variant === 'red' && [
          'bg-[#FF453A]/15 backdrop-blur-xl',
          'border border-[#FF453A]/40',
          'text-red-800',
          'shadow-[0_4px_20px_rgba(255,69,58,0.15)]',
          'hover:bg-[#FF453A]/25 hover:shadow-[0_6px_28px_rgba(255,69,58,0.25)]',
          'focus-visible:ring-[#FF453A]',
        ],

        variant === 'secondary' && [
          'bg-white/60 backdrop-blur-xl',
          'border border-white/55',
          'text-gray-700',
          'shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
          'hover:bg-white/78 hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)]',
          'focus-visible:ring-gray-400',
        ],

        variant === 'ghost' && [
          'text-gray-500',
          'hover:bg-white/50 hover:backdrop-blur-xl hover:border hover:border-white/40 hover:text-gray-700',
          'focus-visible:ring-gray-300',
        ],

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
