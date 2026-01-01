'use client';

import { useEffect, useState } from 'react';
import type { Card, Team, CardRevealResult } from '@/types/game';

interface GameCardProps {
  card: Card;
  index: number;
  isSpymaster: boolean;
  canGuess: boolean;
  onClick: () => void;
  lastReveal?: { cardIndex: number; result: CardRevealResult; revealedAt: number } | null;
  isProposed?: boolean; // If this card is currently proposed by boss
}

export function GameCard({ card, index, isSpymaster, canGuess, onClick, lastReveal, isProposed }: GameCardProps) {
  const [animationClass, setAnimationClass] = useState('');
  const [showResultOverlay, setShowResultOverlay] = useState(false);

  // Handle reveal animation
  useEffect(() => {
    if (lastReveal && lastReveal.cardIndex === index) {
      // Trigger animation based on result
      setShowResultOverlay(true);
      setAnimationClass(getAnimationClass(lastReveal.result));

      // Clear animation after delay
      const timer = setTimeout(() => {
        setAnimationClass('');
        // Keep overlay a bit longer for assassin
        if (lastReveal.result !== 'assassin') {
          setTimeout(() => setShowResultOverlay(false), 500);
        }
      }, lastReveal.result === 'assassin' ? 3000 : 1500);

      return () => clearTimeout(timer);
    }
  }, [lastReveal, index]);

  const getAnimationClass = (result: CardRevealResult): string => {
    switch (result) {
      case 'correct':
        return 'animate-card-correct';
      case 'wrong':
        return 'animate-card-wrong';
      case 'neutral':
        return 'animate-card-neutral';
      case 'assassin':
        return 'animate-card-assassin';
      default:
        return '';
    }
  };

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

  const getResultOverlay = () => {
    if (!showResultOverlay || !lastReveal || lastReveal.cardIndex !== index) return null;

    switch (lastReveal.result) {
      case 'correct':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/30 rounded-lg animate-pulse">
            <svg className="w-8 h-8 sm:w-12 sm:h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'wrong':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-orange-500/30 rounded-lg">
            <svg className="w-8 h-8 sm:w-12 sm:h-12 text-orange-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'neutral':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-amber-500/30 rounded-lg">
            <svg className="w-8 h-8 sm:w-12 sm:h-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
            </svg>
          </div>
        );
      case 'assassin':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg animate-assassin-reveal">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span className="text-red-500 font-bold text-sm mt-1 animate-pulse">¡ASESINO!</span>
          </div>
        );
      default:
        return null;
    }
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
        ${animationClass}
        ${isProposed ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-900 animate-pulse' : ''}
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

      {/* Proposed indicator */}
      {isProposed && !card.revealed && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
          ?
        </div>
      )}

      {card.revealed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {card.type === 'assassin' && (
            <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-red-500 opacity-80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          )}
        </div>
      )}

      {/* Result overlay */}
      {getResultOverlay()}
    </button>
  );
}
