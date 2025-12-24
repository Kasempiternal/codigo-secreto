'use client';

import type { Card, Team } from '@/types/game';

interface GameCardProps {
  card: Card;
  index: number;
  isSpymaster: boolean;
  canGuess: boolean;
  onClick: () => void;
}

export function GameCard({ card, index, isSpymaster, canGuess, onClick }: GameCardProps) {
  const getCardStyles = () => {
    if (card.revealed) {
      switch (card.type) {
        case 'red':
          return 'bg-gradient-to-br from-red-500 to-red-700 text-white border-red-400';
        case 'blue':
          return 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border-blue-400';
        case 'neutral':
          return 'bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900 border-amber-300';
        case 'assassin':
          return 'bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-600';
      }
    }

    // Spymaster sees colors
    if (isSpymaster) {
      switch (card.type) {
        case 'red':
          return 'bg-red-900/30 border-red-500/50 text-white hover:bg-red-900/40';
        case 'blue':
          return 'bg-blue-900/30 border-blue-500/50 text-white hover:bg-blue-900/40';
        case 'neutral':
          return 'bg-amber-900/20 border-amber-500/30 text-white hover:bg-amber-900/30';
        case 'assassin':
          return 'bg-slate-900/50 border-slate-500/50 text-white hover:bg-slate-900/60';
      }
    }

    // Normal unrevealed card
    return 'bg-gradient-to-br from-slate-700 to-slate-800 text-white border-slate-600 hover:border-slate-500';
  };

  const getSpymasterIndicator = () => {
    if (!isSpymaster || card.revealed) return null;

    const colors: Record<string, string> = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      neutral: 'bg-amber-400',
      assassin: 'bg-slate-900 border border-white',
    };

    return (
      <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${colors[card.type]}`}></div>
    );
  };

  const canClick = canGuess && !card.revealed && !isSpymaster;

  return (
    <button
      onClick={onClick}
      disabled={!canClick}
      className={`
        game-card relative w-full aspect-square sm:aspect-[4/3] md:aspect-[3/2]
        rounded-md sm:rounded-lg md:rounded-xl border sm:border-2
        flex items-center justify-center
        font-bold
        transition-all duration-150
        touch-feedback
        ${getCardStyles()}
        ${canClick ? 'cursor-pointer active:scale-95 sm:hover:scale-105 sm:hover:shadow-xl' : 'cursor-default'}
        ${card.revealed ? 'opacity-90' : ''}
      `}
    >
      {getSpymasterIndicator()}

      <span className={`
        text-center break-words leading-tight px-0.5
        ${card.revealed && card.type === 'assassin' ? 'line-through' : ''}
      `}
      style={{
        fontSize: 'clamp(0.5rem, 2.5vw, 0.875rem)',
        wordBreak: 'break-word',
        hyphens: 'auto',
      }}
      >
        {card.word}
      </span>

      {card.revealed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {card.type === 'assassin' && (
            <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-red-500 opacity-80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          )}
        </div>
      )}
    </button>
  );
}
