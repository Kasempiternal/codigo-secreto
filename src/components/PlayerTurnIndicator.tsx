'use client';

import type { Player, Team } from '@/types/game';

interface PlayerTurnIndicatorProps {
  currentTeam: Team;
  currentPlayer: Player | null;
  isYourTurn: boolean;
  guessesRemaining: number;
  hasClue: boolean;
}

export function PlayerTurnIndicator({
  currentTeam,
  currentPlayer,
  isYourTurn,
  guessesRemaining,
  hasClue,
}: PlayerTurnIndicatorProps) {
  const teamColor = currentTeam === 'red' ? 'red' : 'blue';
  const teamName = currentTeam === 'red' ? 'Equipo Rojo' : 'Equipo Azul';

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-4 mb-4
      ${currentTeam === 'red'
        ? 'bg-gradient-to-r from-red-600/30 to-red-800/30 border-2 border-red-500'
        : 'bg-gradient-to-r from-blue-600/30 to-blue-800/30 border-2 border-blue-500'
      }
      ${isYourTurn ? 'animate-turnPulse' : ''}
    `}>
      {/* Animated background for your turn */}
      {isYourTurn && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      )}

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Team indicator */}
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${currentTeam === 'red' ? 'bg-red-500' : 'bg-blue-500'}
            ${isYourTurn ? 'animate-bounce' : ''}
          `}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-lg">{teamName}</div>
            {hasClue && currentPlayer && (
              <div className={`text-sm ${currentTeam === 'red' ? 'text-red-300' : 'text-blue-300'}`}>
                Selecciona: <span className="font-bold">{currentPlayer.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Your turn badge */}
        {isYourTurn && hasClue && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500 rounded-full animate-pulse">
            <span className="text-yellow-400 font-bold text-lg">¡TU TURNO!</span>
            <svg className="w-5 h-5 text-yellow-400 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        )}

        {/* Guesses remaining */}
        {hasClue && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Intentos:</span>
            <div className="flex gap-1">
              {Array.from({ length: guessesRemaining }).map((_, i) => (
                <div
                  key={i}
                  className={`
                    w-3 h-3 rounded-full
                    ${currentTeam === 'red' ? 'bg-red-400' : 'bg-blue-400'}
                    animate-pulse
                  `}
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
