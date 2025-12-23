'use client';

import { GameCard } from './GameCard';
import type { Card } from '@/types/game';

interface GameBoardProps {
  cards: Card[];
  isSpymaster: boolean;
  canGuess: boolean;
  onCardClick: (index: number) => void;
}

export function GameBoard({ cards, isSpymaster, canGuess, onCardClick }: GameBoardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 md:gap-3">
        {cards.map((card, index) => (
          <GameCard
            key={index}
            card={card}
            index={index}
            isSpymaster={isSpymaster}
            canGuess={canGuess}
            onClick={() => onCardClick(index)}
          />
        ))}
      </div>

      {/* Legend for spymasters */}
      {isSpymaster && (
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-400">Equipo Rojo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-400">Equipo Azul</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <span className="text-slate-400">Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-slate-900 border border-white"></div>
            <span className="text-slate-400">Asesino</span>
          </div>
        </div>
      )}
    </div>
  );
}
