'use client';

import type { Player, Team, Role } from '@/types/game';

interface TeamPanelProps {
  team: Team;
  players: Player[];
  cardsRemaining: number;
  isCurrentTurn: boolean;
  currentPlayerId: string | null;
  onSelectTeam?: () => void;
  onSelectRole?: (role: Role) => void;
  isLobby?: boolean;
}

export function TeamPanel({
  team,
  players,
  cardsRemaining,
  isCurrentTurn,
  currentPlayerId,
  onSelectTeam,
  onSelectRole,
  isLobby = false,
}: TeamPanelProps) {
  const teamName = team === 'red' ? 'Equipo Rojo' : 'Equipo Azul';
  const bgColor = team === 'red' ? 'from-red-600 to-red-800' : 'from-blue-600 to-blue-800';
  const borderColor = team === 'red' ? 'border-red-500' : 'border-blue-500';
  const glowColor = team === 'red' ? 'shadow-red-500/30' : 'shadow-blue-500/30';

  const spymaster = players.find(p => p.role === 'spymaster');
  const operatives = players.filter(p => p.role === 'operative');
  const unassigned = players.filter(p => !p.role);

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const isOnThisTeam = currentPlayer?.team === team;

  return (
    <div className={`
      rounded-xl border-2 ${borderColor} overflow-hidden
      ${isCurrentTurn ? `shadow-lg ${glowColor} team-active` : ''}
    `}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${bgColor} p-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">{teamName}</span>
          {isCurrentTurn && (
            <span className="animate-pulse text-yellow-300 text-sm">● Su turno</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-sm">{cardsRemaining} restantes</span>
          <div className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold`}>
            {cardsRemaining}
          </div>
        </div>
      </div>

      {/* Players */}
      <div className="bg-slate-800/50 p-3 space-y-3">
        {/* Spymaster */}
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.8 1.1 2.8 2.5V11c.6.3 1 .9 1 1.5v3c0 1-.8 1.8-1.8 1.8h-4c-1 0-1.8-.8-1.8-1.8v-3c0-.6.4-1.2 1-1.5V9.5C9.2 8.1 10.6 7 12 7z"/>
            </svg>
            Jefe de Espías
          </div>
          {spymaster ? (
            <div className="flex items-center gap-2 text-white">
              <div className={`w-2 h-2 rounded-full ${team === 'red' ? 'bg-red-400' : 'bg-blue-400'}`}></div>
              <span className="font-medium">
                {spymaster.name}
                {spymaster.id === currentPlayerId && ' (Tú)'}
                {spymaster.isHost && ' ⭐'}
              </span>
            </div>
          ) : isLobby && isOnThisTeam ? (
            <button
              onClick={() => onSelectRole?.('spymaster')}
              className={`
                w-full py-2 px-3 rounded-lg border-2 border-dashed
                ${team === 'red' ? 'border-red-500/50 hover:border-red-400' : 'border-blue-500/50 hover:border-blue-400'}
                text-slate-400 hover:text-white transition-colors text-sm
              `}
            >
              + Ser Jefe de Espías
            </button>
          ) : (
            <span className="text-slate-500 text-sm italic">Sin asignar</span>
          )}
        </div>

        {/* Operatives */}
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Agentes de Campo ({operatives.length})
          </div>
          {operatives.length > 0 ? (
            <div className="space-y-1">
              {operatives.map(player => (
                <div key={player.id} className="flex items-center gap-2 text-white text-sm">
                  <div className={`w-2 h-2 rounded-full ${team === 'red' ? 'bg-red-400' : 'bg-blue-400'}`}></div>
                  <span>
                    {player.name}
                    {player.id === currentPlayerId && ' (Tú)'}
                    {player.isHost && ' ⭐'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-slate-500 text-sm italic">Ninguno aún</span>
          )}

          {isLobby && isOnThisTeam && currentPlayer?.role !== 'operative' && (
            <button
              onClick={() => onSelectRole?.('operative')}
              className={`
                mt-2 w-full py-2 px-3 rounded-lg border-2 border-dashed
                ${team === 'red' ? 'border-red-500/50 hover:border-red-400' : 'border-blue-500/50 hover:border-blue-400'}
                text-slate-400 hover:text-white transition-colors text-sm
              `}
            >
              + Ser Agente de Campo
            </button>
          )}
        </div>

        {/* Unassigned */}
        {isLobby && unassigned.length > 0 && (
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Sin rol</div>
            <div className="space-y-1">
              {unassigned.map(player => (
                <div key={player.id} className="flex items-center gap-2 text-slate-400 text-sm">
                  <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                  <span>
                    {player.name}
                    {player.id === currentPlayerId && ' (Tú)'}
                    {player.isHost && ' ⭐'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Join team button */}
        {isLobby && !isOnThisTeam && (
          <button
            onClick={onSelectTeam}
            className={`
              w-full py-2 px-4 rounded-lg font-medium transition-all
              ${team === 'red'
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30'
              }
            `}
          >
            Unirse al {teamName}
          </button>
        )}
      </div>
    </div>
  );
}
