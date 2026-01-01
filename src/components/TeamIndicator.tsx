'use client';

import type { Team, Role } from '@/types/game';

interface TeamIndicatorProps {
  team: Team | null;
  role: Role | null;
  isCurrentTurn: boolean;
  playerName: string;
}

export function TeamIndicator({ team, role, isCurrentTurn, playerName }: TeamIndicatorProps) {
  if (!team) return null;

  const isRed = team === 'red';
  const isSpymaster = role === 'spymaster';

  return (
    <div className={`
      fixed top-0 left-0 right-0 z-40 p-2
      ${isRed
        ? 'bg-gradient-to-r from-red-600 via-red-700 to-red-600'
        : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600'
      }
      ${isCurrentTurn ? 'team-indicator-glow' : 'opacity-90'}
      shadow-lg
    `}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Team badge */}
        <div className="flex items-center gap-2">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${isRed ? 'bg-red-400' : 'bg-blue-400'}
            shadow-inner
          `}>
            {isSpymaster ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
          </div>
          <div>
            <div className="text-white font-bold text-sm sm:text-base">
              Equipo {isRed ? 'Rojo' : 'Azul'}
            </div>
            <div className="text-white/80 text-xs sm:text-sm">
              {isSpymaster ? 'Jefe de Espías' : 'Agente de Campo'}
            </div>
          </div>
        </div>

        {/* Player name and turn indicator */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-white/90 text-sm font-medium">{playerName}</div>
            {isCurrentTurn && (
              <div className={`
                text-xs font-bold
                ${isRed ? 'text-red-200' : 'text-blue-200'}
                animate-pulse
              `}>
                Tu equipo juega
              </div>
            )}
          </div>
          {isCurrentTurn && (
            <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50"></div>
          )}
        </div>
      </div>
    </div>
  );
}
