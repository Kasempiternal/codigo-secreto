'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGame } from '@/hooks/useGame';
import { GameBoard } from '@/components/GameBoard';
import { TeamPanel } from '@/components/TeamPanel';
import { ClueInput } from '@/components/ClueInput';
import { QRCode } from '@/components/QRCode';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { PlayerTurnIndicator } from '@/components/PlayerTurnIndicator';
import { RulesModal, RulesButton } from '@/components/RulesModal';
import type { Team, Role } from '@/types/game';

export default function GameRoom() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    cardIndex: number;
    cardWord: string;
  }>({ isOpen: false, cardIndex: -1, cardWord: '' });
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const storedPlayerId = sessionStorage.getItem('playerId');
    if (!storedPlayerId) {
      router.push('/');
      return;
    }
    setPlayerId(storedPlayerId);
  }, [router]);

  const {
    game,
    player,
    loading,
    error,
    updatePlayer,
    startGame,
    giveClue,
    makeGuess,
    endTurn,
    resetGame,
  } = useGame({ roomCode, playerId, pollInterval: 1500 });

  // Show toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Copy room code to clipboard
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    showToast('¡Código copiado!', 'success');
  };

  // Share URL - points to join page so users only need to enter their name
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/unirse/${roomCode}`;
    }
    return '';
  };

  // Handle card click - show confirmation dialog
  const handleCardClick = (cardIndex: number) => {
    if (!game || game.phase !== 'playing') return;
    if (!player || player.role !== 'operative') return;
    if (player.team !== game.currentTurn) return;
    if (game.guessesRemaining <= 0) return;
    if (game.currentPlayerTurn && game.currentPlayerTurn !== playerId) {
      const currentTurnPlayer = game.players.find(p => p.id === game.currentPlayerTurn);
      showToast(`Es el turno de ${currentTurnPlayer?.name || 'otro jugador'}`, 'error');
      return;
    }

    const card = game.cards[cardIndex];
    if (card.revealed) return;

    setConfirmDialog({
      isOpen: true,
      cardIndex,
      cardWord: card.word,
    });
  };

  // Confirm card selection
  const handleConfirmGuess = async () => {
    const { cardIndex } = confirmDialog;
    setConfirmDialog({ isOpen: false, cardIndex: -1, cardWord: '' });

    try {
      const result = await makeGuess(cardIndex);
      if (result.result === 'assassin') {
        showToast('¡ASESINO! Has perdido la partida', 'error');
      } else if (result.result === 'correct') {
        showToast('¡Correcto! Sigue adivinando', 'success');
      } else if (result.result === 'wrong') {
        showToast('Era del otro equipo', 'error');
      } else {
        showToast('Neutral - Fin del turno', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Error', 'error');
    }
  };

  // Cancel card selection
  const handleCancelGuess = () => {
    setConfirmDialog({ isOpen: false, cardIndex: -1, cardWord: '' });
  };

  // Handle team/role selection
  const handleSelectTeam = async (team: Team) => {
    try {
      await updatePlayer(team, null);
    } catch (err: any) {
      showToast(err.message || 'Error', 'error');
    }
  };

  const handleSelectRole = async (team: Team, role: Role) => {
    try {
      await updatePlayer(team, role);
    } catch (err: any) {
      showToast(err.message || 'Error', 'error');
    }
  };

  // Loading state
  if (loading || !playerId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-white spinner mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-white">Cargando partida...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!game) return null;

  const isSpymaster = player?.role === 'spymaster';
  const isMyTurn = player?.team === game.currentTurn;
  const isMyPlayerTurn = game.currentPlayerTurn === playerId;
  const canGuess = game.phase === 'playing' && isMyTurn && player?.role === 'operative' && game.guessesRemaining > 0 && isMyPlayerTurn;
  const canGiveClue = game.phase === 'playing' && isMyTurn && isSpymaster && !game.currentClue;
  const currentTurnPlayer = game.currentPlayerTurn ? game.players.find(p => p.id === game.currentPlayerTurn) : null;

  const redPlayers = game.players.filter(p => p.team === 'red');
  const bluePlayers = game.players.filter(p => p.team === 'blue');
  const unassignedPlayers = game.players.filter(p => !p.team);

  return (
    <main className="min-h-screen p-2 sm:p-4 no-bounce safe-area-top safe-area-bottom">
      {/* Toast */}
      {toast && (
        <div className={`
          fixed bottom-4 left-1/2 -translate-x-1/2 z-50
          px-6 py-3 rounded-xl shadow-lg
          ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}
          text-white font-medium toast-enter
        `}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Código Secreto</h1>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Sala:</span>
              <button
                onClick={copyRoomCode}
                className="font-mono text-lg sm:text-xl text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1"
              >
                {roomCode}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {game.phase === 'lobby' && (
            <button
              onClick={() => setShowQR(!showQR)}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              title="Mostrar QR"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </button>
          )}

          <div className="text-right">
            <div className="text-slate-400 text-xs">Jugando como</div>
            <div className="text-white font-medium">{player?.name || 'Desconocido'}</div>
          </div>
        </div>
      </header>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-lg mb-4">Escanea para unirte</h3>
            <div className="flex justify-center mb-4">
              <QRCode url={getShareUrl()} size={200} />
            </div>
            <p className="text-slate-400 text-sm mb-2">O comparte este enlace:</p>
            <div className="bg-slate-700 rounded-lg p-3 text-xs text-slate-300 break-all">
              {getShareUrl()}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(getShareUrl());
                showToast('¡Enlace copiado!', 'success');
              }}
              className="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Copiar enlace
            </button>
          </div>
        </div>
      )}

      {/* Game Content */}
      <div className="max-w-6xl mx-auto">
        {/* LOBBY PHASE */}
        {game.phase === 'lobby' && (
          <div className="space-y-4">
            {/* Teams */}
            <div className="grid md:grid-cols-2 gap-4">
              <TeamPanel
                team="red"
                players={redPlayers}
                cardsRemaining={game.redCardsRemaining}
                isCurrentTurn={game.startingTeam === 'red'}
                currentPlayerId={playerId}
                onSelectTeam={() => handleSelectTeam('red')}
                onSelectRole={(role) => handleSelectRole('red', role)}
                isLobby={true}
              />
              <TeamPanel
                team="blue"
                players={bluePlayers}
                cardsRemaining={game.blueCardsRemaining}
                isCurrentTurn={game.startingTeam === 'blue'}
                currentPlayerId={playerId}
                onSelectTeam={() => handleSelectTeam('blue')}
                onSelectRole={(role) => handleSelectRole('blue', role)}
                isLobby={true}
              />
            </div>

            {/* Unassigned players */}
            {unassignedPlayers.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="text-slate-400 text-sm uppercase tracking-wide mb-2">
                  Sin equipo ({unassignedPlayers.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {unassignedPlayers.map(p => (
                    <span
                      key={p.id}
                      className="px-3 py-1 bg-slate-700 rounded-full text-white text-sm"
                    >
                      {p.name}
                      {p.id === playerId && ' (Tú)'}
                      {p.isHost && ' ⭐'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Start game button */}
            {player?.isHost && (
              <div className="text-center">
                <button
                  onClick={async () => {
                    try {
                      await startGame();
                    } catch (err: any) {
                      showToast(err.message || 'Error', 'error');
                    }
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  🚀 Iniciar Partida
                </button>
                <p className="text-slate-500 text-sm mt-2">
                  Cada equipo necesita al menos 2 jugadores y un Jefe de Espías
                </p>
              </div>
            )}

            {!player?.isHost && (
              <p className="text-center text-slate-400">
                Esperando a que el anfitrión inicie la partida...
              </p>
            )}

            {/* Starting team indicator */}
            <div className="text-center py-4">
              <span className="text-slate-400">Empieza el equipo: </span>
              <span className={game.startingTeam === 'red' ? 'text-red-400 font-bold' : 'text-blue-400 font-bold'}>
                {game.startingTeam === 'red' ? 'ROJO (9 cartas)' : 'AZUL (9 cartas)'}
              </span>
            </div>
          </div>
        )}

        {/* PLAYING PHASE */}
        {game.phase === 'playing' && (
          <div className="space-y-4">
            {/* Player Turn Indicator */}
            <PlayerTurnIndicator
              currentTeam={game.currentTurn}
              currentPlayer={currentTurnPlayer || null}
              isYourTurn={isMyPlayerTurn && player?.role === 'operative' && !!game.currentClue}
              guessesRemaining={game.guessesRemaining}
              hasClue={!!game.currentClue}
            />

            {/* Current Clue Display */}
            {game.currentClue && (
              <div className={`
                text-center py-4 rounded-xl animate-fadeIn
                ${game.currentTurn === 'red' ? 'bg-red-500/20 border-2 border-red-500' : 'bg-blue-500/20 border-2 border-blue-500'}
              `}>
                <div className="text-slate-400 text-sm mb-1">Pista del Jefe de Espías</div>
                <div className="text-3xl sm:text-4xl font-bold text-yellow-400 animate-pulse">
                  {game.currentClue.word} <span className="text-white">{game.currentClue.number}</span>
                </div>
              </div>
            )}

            {/* Score panels */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className={`
                p-3 rounded-xl text-center
                ${game.currentTurn === 'red' ? 'bg-red-500/30 border-2 border-red-500' : 'bg-red-500/10 border border-red-500/30'}
              `}>
                <div className="text-3xl font-bold text-red-400">{game.redCardsRemaining}</div>
                <div className="text-red-300 text-sm">Rojo restantes</div>
              </div>
              <div className={`
                p-3 rounded-xl text-center
                ${game.currentTurn === 'blue' ? 'bg-blue-500/30 border-2 border-blue-500' : 'bg-blue-500/10 border border-blue-500/30'}
              `}>
                <div className="text-3xl font-bold text-blue-400">{game.blueCardsRemaining}</div>
                <div className="text-blue-300 text-sm">Azul restantes</div>
              </div>
            </div>

            {/* Game board */}
            <GameBoard
              cards={game.cards}
              isSpymaster={isSpymaster}
              canGuess={canGuess}
              onCardClick={handleCardClick}
            />

            {/* Spymaster clue input */}
            {canGiveClue && player?.team && (
              <div className="max-w-md mx-auto bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <ClueInput
                  team={player.team}
                  onGiveClue={giveClue}
                />
              </div>
            )}

            {/* Operative controls */}
            {isMyTurn && player?.role === 'operative' && game.currentClue && (
              <div className={`
                text-center p-4 rounded-xl space-y-3
                ${isMyPlayerTurn ? 'bg-yellow-500/10 border-2 border-yellow-500/50 animate-pulse' : 'bg-slate-800/50'}
              `}>
                {isMyPlayerTurn ? (
                  <>
                    <div className="flex items-center justify-center gap-2 text-yellow-400">
                      <svg className="w-6 h-6 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="text-xl font-bold">¡Es tu turno para seleccionar!</span>
                      <svg className="w-6 h-6 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <p className="text-slate-300">
                      Toca una carta para adivinar
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400">
                    Esperando a que <span className="text-white font-bold">{currentTurnPlayer?.name}</span> seleccione una carta...
                  </p>
                )}

                {/* Pass turn button - always visible for operatives on their team's turn */}
                <button
                  onClick={async () => {
                    try {
                      await endTurn();
                      showToast('Turno terminado', 'info');
                    } catch (err: any) {
                      showToast(err.message || 'Error', 'error');
                    }
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                  Pasar Turno
                </button>
              </div>
            )}

            {/* Waiting message */}
            {!isMyTurn && (
              <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Esperando al {game.currentTurn === 'red' ? 'Equipo Rojo' : 'Equipo Azul'}...</span>
                </div>
              </div>
            )}

            {isMyTurn && isSpymaster && game.currentClue && (
              <div className="text-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                <p className="text-yellow-400 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  Observando a tus agentes...
                </p>
                {currentTurnPlayer && (
                  <p className="text-slate-400 text-sm mt-1">
                    Turno de: <span className="text-white font-bold">{currentTurnPlayer.name}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* FINISHED PHASE */}
        {game.phase === 'finished' && (
          <div className="text-center py-8 space-y-6">
            <div className={`
              text-4xl sm:text-6xl font-bold
              ${game.winner === 'red' ? 'text-red-400' : 'text-blue-400'}
            `}>
              🎉 ¡{game.winner === 'red' ? 'EQUIPO ROJO' : 'EQUIPO AZUL'} GANA! 🎉
            </div>

            {/* Final board */}
            <GameBoard
              cards={game.cards}
              isSpymaster={true} // Show all cards
              canGuess={false}
              onCardClick={() => {}}
            />

            {player?.isHost && (
              <button
                onClick={async () => {
                  try {
                    await resetGame();
                    showToast('¡Nueva partida!', 'success');
                  } catch (err: any) {
                    showToast(err.message || 'Error', 'error');
                  }
                }}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                🔄 Nueva Partida
              </button>
            )}
          </div>
        )}

        {/* Clue history */}
        {game.clues.length > 0 && (
          <div className="mt-6 bg-slate-800/30 rounded-xl p-4">
            <h3 className="text-slate-400 text-sm uppercase tracking-wide mb-2">Historial de pistas</h3>
            <div className="flex flex-wrap gap-2">
              {game.clues.slice().reverse().map((clue, i) => (
                <span
                  key={i}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${clue.team === 'red' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}
                  `}
                >
                  {clue.word} {clue.number}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Selection Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title="Confirmar Selección"
        message="¿Estás seguro de que quieres seleccionar esta carta?"
        cardWord={confirmDialog.cardWord}
        onConfirm={handleConfirmGuess}
        onCancel={handleCancelGuess}
        confirmText="¡Seleccionar!"
        cancelText="Cancelar"
      />

      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* Floating Rules Button - Always visible */}
      <RulesButton onClick={() => setShowRules(true)} />
    </main>
  );
}
