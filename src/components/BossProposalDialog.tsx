'use client';

import type { CardProposal, Player, Team } from '@/types/game';

interface BossProposalDialogProps {
  proposal: CardProposal;
  players: Player[];
  currentTeam: Team;
  currentPlayerId: string | null;
  isSpymaster: boolean;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
}

export function BossProposalDialog({
  proposal,
  players,
  currentTeam,
  currentPlayerId,
  isSpymaster,
  onAccept,
  onReject,
  onCancel,
}: BossProposalDialogProps) {
  const proposer = players.find(p => p.id === proposal.proposedBy);
  const teamOperatives = players.filter(
    p => p.team === currentTeam && p.role === 'operative'
  );
  const isMyTeam = players.find(p => p.id === currentPlayerId)?.team === currentTeam;
  const isMyProposal = proposal.proposedBy === currentPlayerId;
  const hasVoted = proposal.acceptedBy.includes(currentPlayerId || '') ||
                   proposal.rejectedBy.includes(currentPlayerId || '');
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const canVote = isMyTeam && currentPlayer?.role === 'operative' && !hasVoted;

  const teamColor = currentTeam === 'red'
    ? 'from-red-600 to-red-800 border-red-500'
    : 'from-blue-600 to-blue-800 border-blue-500';

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className={`
        bg-gradient-to-br ${teamColor}
        rounded-2xl p-6 max-w-sm w-full
        border-2 shadow-2xl
        animate-scaleIn
      `}>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            <span className="text-white font-bold text-lg">Propuesta del Jefe</span>
          </div>
          <p className="text-white/80 text-sm">
            {proposer?.name} sugiere seleccionar esta carta
          </p>
        </div>

        {/* Proposed card */}
        <div className="bg-black/30 rounded-xl p-6 text-center mb-4">
          <div className="text-3xl font-bold text-yellow-400 mb-2 animate-pulse">
            {proposal.cardWord}
          </div>
          <p className="text-white/60 text-sm">
            ¿Tu equipo debería seleccionar esta carta?
          </p>
        </div>

        {/* Vote status */}
        {(proposal.acceptedBy.length > 0 || proposal.rejectedBy.length > 0) && (
          <div className="bg-black/20 rounded-lg p-3 mb-4 text-sm">
            {proposal.acceptedBy.length > 0 && (
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>
                  Aceptado: {proposal.acceptedBy.map(id =>
                    players.find(p => p.id === id)?.name
                  ).join(', ')}
                </span>
              </div>
            )}
            {proposal.rejectedBy.length > 0 && (
              <div className="flex items-center gap-2 text-red-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>
                  Rechazado: {proposal.rejectedBy.map(id =>
                    players.find(p => p.id === id)?.name
                  ).join(', ')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {isMyProposal ? (
          // Spymaster view - can only cancel
          <div className="space-y-3">
            <p className="text-white/70 text-center text-sm mb-3">
              Esperando que tu equipo vote...
            </p>
            <button
              onClick={onCancel}
              className="w-full py-3 px-6 rounded-lg font-bold text-white
                bg-slate-600 hover:bg-slate-500 transition-all"
            >
              Cancelar Propuesta
            </button>
          </div>
        ) : canVote ? (
          // Operative view - can vote
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onReject}
              className="py-3 px-4 rounded-lg font-bold text-white
                bg-slate-600 hover:bg-slate-500 transition-all
                flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Rechazar
            </button>
            <button
              onClick={onAccept}
              className="py-3 px-4 rounded-lg font-bold text-white
                bg-green-600 hover:bg-green-500 transition-all
                flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Aceptar
            </button>
          </div>
        ) : hasVoted ? (
          // Already voted
          <div className="text-center text-white/70 py-3">
            Ya has votado. Esperando a otros jugadores...
          </div>
        ) : (
          // Other team or spymaster viewing
          <div className="text-center text-white/70 py-3">
            {isSpymaster
              ? 'Tu equipo está votando...'
              : 'El otro equipo está decidiendo...'
            }
          </div>
        )}
      </div>
    </div>
  );
}
