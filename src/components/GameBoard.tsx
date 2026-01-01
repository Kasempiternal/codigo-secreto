'use client';

import { GameCard } from './GameCard';
import type { Card, LastReveal } from '@/types/game';

interface GameBoardProps {
  cards: Card[];
  isSpymaster: boolean;
  canGuess: boolean;
  onCardClick: (index: number) => void;
  lastReveal?: LastReveal | null;
  proposedCardIndex?: number | null;
}

export function GameBoard({ cards, isSpymaster, canGuess, onCardClick, lastReveal, proposedCardIndex }: GameBoardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-0">
      {/* Mobile-optimized card grid */}
      <div className="mobile-card-grid">
        {cards.map((card, index) => (
          <GameCard
            key={index}
            card={card}
            index={index}
            isSpymaster={isSpymaster}
            canGuess={canGuess}
            onClick={() => onCardClick(index)}
            lastReveal={lastReveal}
            isProposed={proposedCardIndex === index}
          />
        ))}
      </div>

      {/* Legend for spymasters - more compact on mobile */}
      {isSpymaster && (
        <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs md:text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-400">Rojo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-400">Azul</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400"></div>
            <span className="text-slate-400">Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900 border border-white"></div>
            <span className="text-slate-400">Asesino</span>
          </div>
        </div>
      )}
    </div>
  );
}
