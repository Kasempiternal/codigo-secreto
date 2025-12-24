'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RulesModal, RulesButton } from '@/components/RulesModal';

export default function JoinRoom() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.roomCode as string).toUpperCase();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRules, setShowRules] = useState(false);

  const handleJoin = async () => {
    if (name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          roomCode: roomCode,
          playerName: name.trim(),
        }),
      });
      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('playerId', data.data.playerId);
        sessionStorage.setItem('playerName', name.trim());
        router.push(`/sala/${roomCode}`);
      } else {
        setError(data.error || 'No se pudo unir a la sala');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleJoin();
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-blue-500 rounded-2xl mb-4 shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Unirse a Partida
          </h1>
          <p className="text-slate-400">
            Código Secreto - Juego de espías
          </p>
        </div>

        {/* Join form card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50">
          {/* Room code display */}
          <div className="mb-6 text-center">
            <div className="text-slate-400 text-sm mb-2">Código de sala</div>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-xl">
              <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-yellow-400 tracking-widest">
                {roomCode}
              </span>
            </div>
          </div>

          {/* Name input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Tu nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ej: Agente 007"
                maxLength={20}
                autoFocus
                className="w-full px-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 spinner" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Uniéndose...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Unirse a la Partida
                </>
              )}
            </button>
          </div>

          {/* Alternative link */}
          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              ¿Quieres crear tu propia partida?
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Basado en Codenames de Vlaada Chvátil
        </p>
      </div>

      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* Floating Rules Button */}
      <RulesButton onClick={() => setShowRules(true)} />
    </main>
  );
}
