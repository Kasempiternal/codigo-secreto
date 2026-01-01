'use client';

interface SpymasterProposalWarningProps {
  cardWord: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SpymasterProposalWarning({
  cardWord,
  onConfirm,
  onCancel,
}: SpymasterProposalWarningProps) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border-2 border-yellow-500/50 shadow-2xl animate-scaleIn">
        {/* Warning icon */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-3">
            <svg className="w-10 h-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-yellow-400 mb-2">
            ¡Atención, Jefe de Espías!
          </h3>
          <p className="text-slate-300">
            Normalmente no deberías seleccionar cartas directamente.
          </p>
        </div>

        {/* Explanation */}
        <div className="bg-slate-700/50 rounded-lg p-4 mb-4 text-sm text-slate-300 space-y-2">
          <p className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            Usa esta opción solo si un jugador se desconectó
          </p>
          <p className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            Tu equipo recibirá la propuesta y podrá aceptarla o rechazarla
          </p>
          <p className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            Cualquier agente puede aceptar para revelar la carta
          </p>
        </div>

        {/* Selected card */}
        <div className="text-center bg-slate-700/30 rounded-lg py-3 mb-4">
          <span className="text-slate-400 text-sm">Carta seleccionada:</span>
          <div className="text-2xl font-bold text-white mt-1">{cardWord}</div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="py-3 px-4 rounded-lg font-bold text-slate-300
              bg-slate-600 hover:bg-slate-500 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="py-3 px-4 rounded-lg font-bold text-white
              bg-yellow-600 hover:bg-yellow-500 transition-all
              flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Proponer
          </button>
        </div>
      </div>
    </div>
  );
}
