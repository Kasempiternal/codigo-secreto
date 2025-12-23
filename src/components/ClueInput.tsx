'use client';

import { useState } from 'react';
import type { Team } from '@/types/game';

interface ClueInputProps {
  team: Team;
  onGiveClue: (word: string, number: number) => Promise<void>;
  disabled?: boolean;
}

export function ClueInput({ team, onGiveClue, disabled }: ClueInputProps) {
  const [word, setWord] = useState('');
  const [number, setNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || loading || disabled) return;

    // Validate word (no spaces, no numbers)
    if (word.includes(' ')) {
      setError('La pista debe ser una sola palabra');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onGiveClue(word.trim().toUpperCase(), number);
      setWord('');
      setNumber(1);
    } catch (err: any) {
      setError(err.message || 'Error al dar la pista');
    } finally {
      setLoading(false);
    }
  };

  const bgColor = team === 'red' ? 'from-red-600 to-red-700' : 'from-blue-600 to-blue-700';
  const borderColor = team === 'red' ? 'border-red-500' : 'border-blue-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="text-center mb-2">
        <h3 className="text-white font-bold text-lg flex items-center justify-center gap-2">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          Da tu pista, Jefe de Espías
        </h3>
        <p className="text-slate-400 text-sm">Una palabra + número de cartas relacionadas</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value.toUpperCase())}
          placeholder="PISTA"
          maxLength={30}
          disabled={disabled || loading}
          className={`
            flex-1 px-4 py-3 rounded-lg bg-slate-700/50 border-2 ${borderColor}
            text-white text-center text-xl font-bold uppercase tracking-wider
            placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20
            disabled:opacity-50
          `}
        />

        <select
          value={number}
          onChange={(e) => setNumber(parseInt(e.target.value))}
          disabled={disabled || loading}
          className={`
            w-20 px-2 py-3 rounded-lg bg-slate-700/50 border-2 ${borderColor}
            text-white text-center text-xl font-bold
            focus:outline-none focus:ring-2 focus:ring-white/20
            disabled:opacity-50
          `}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={!word.trim() || loading || disabled}
        className={`
          w-full py-3 px-6 rounded-lg font-bold text-white
          bg-gradient-to-r ${bgColor}
          hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
          transition-all flex items-center justify-center gap-2
        `}
      >
        {loading ? (
          <>
            <svg className="w-5 h-5 spinner" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Enviando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Dar Pista: {word || '___'} {number}
          </>
        )}
      </button>

      <div className="text-xs text-slate-500 text-center">
        <p>💡 El número indica cuántas palabras están relacionadas</p>
        <p>Los agentes pueden adivinar hasta {number + 1} cartas</p>
      </div>
    </form>
  );
}
