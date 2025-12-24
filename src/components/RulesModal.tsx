'use client';

import { useState } from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const [activeTab, setActiveTab] = useState<'basics' | 'roles' | 'gameplay' | 'winning'>('basics');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn border border-slate-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Cómo Jugar</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 shrink-0 overflow-x-auto">
          {[
            { id: 'basics', label: 'Básico', icon: '📋' },
            { id: 'roles', label: 'Roles', icon: '👥' },
            { id: 'gameplay', label: 'Juego', icon: '🎮' },
            { id: 'winning', label: 'Ganar', icon: '🏆' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 min-w-[80px] py-3 px-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-amber-400 border-b-2 border-amber-400 bg-slate-700/50'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <span className="block text-lg mb-1">{tab.icon}</span>
              <span className="block text-xs sm:text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-xl p-4">
                <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                  <span>🎯</span> Objetivo
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Código Secreto es un juego de palabras por equipos. Tu equipo debe encontrar todas sus cartas secretas antes que el equipo rival usando pistas de una sola palabra.
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4">
                <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                  <span>🃏</span> El Tablero
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  25 cartas con palabras. Cada carta es de un tipo:
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span className="text-slate-300 text-sm">Rojas (8-9 cartas del equipo rojo)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                    <span className="text-slate-300 text-sm">Azules (8-9 cartas del equipo azul)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-600"></div>
                    <span className="text-slate-300 text-sm">Neutrales (7 cartas sin efecto)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-900 border border-slate-600"></div>
                    <span className="text-slate-300 text-sm">Asesino (1 carta - ¡perder instantáneo!)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                <h3 className="text-purple-300 font-bold mb-2 flex items-center gap-2">
                  <span>🕵️</span> Jefe de Espías (Spymaster)
                </h3>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Ve los colores de TODAS las cartas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Da pistas de UNA palabra + un número</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>El número indica cuántas cartas relaciona</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>NO puede dar pistas sobre palabras en el tablero</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 rounded-xl p-4 border border-emerald-700/50">
                <h3 className="text-emerald-300 font-bold mb-2 flex items-center gap-2">
                  <span>🔍</span> Agente de Campo (Operative)
                </h3>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Solo ve las palabras (no los colores)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Intenta adivinar las cartas de su equipo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Puede hacer hasta [número + 1] intentos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Los turnos rotan entre agentes del equipo</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'gameplay' && (
            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-xl p-4">
                <h3 className="text-amber-400 font-bold mb-3">Turno del Equipo:</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">1</div>
                    <div>
                      <p className="text-white font-medium text-sm">El Jefe da una pista</p>
                      <p className="text-slate-400 text-xs">Ejemplo: "ANIMAL 3" = 3 cartas relacionadas con animales</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">2</div>
                    <div>
                      <p className="text-white font-medium text-sm">Los Agentes discuten</p>
                      <p className="text-slate-400 text-xs">Hablan entre ellos sobre qué cartas elegir</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">3</div>
                    <div>
                      <p className="text-white font-medium text-sm">Un Agente selecciona</p>
                      <p className="text-slate-400 text-xs">El agente designado toca una carta</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">4</div>
                    <div>
                      <p className="text-white font-medium text-sm">Se revela el resultado</p>
                      <p className="text-slate-400 text-xs">Correcta = sigue | Incorrecta = turno rival</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-900/30 rounded-xl p-4 border border-red-700/50">
                <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                  <span>⚠️</span> ¡Importante!
                </h3>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li>• El Jefe NO puede hablar ni hacer gestos</li>
                  <li>• Si tocas una carta neutral, tu turno termina</li>
                  <li>• Si tocas una carta rival, ¡los ayudas!</li>
                  <li>• Puedes "Pasar Turno" en cualquier momento</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'winning' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-4 border border-green-700/50">
                <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                  <span>🏆</span> Victoria
                </h3>
                <p className="text-slate-300 text-sm">
                  El primer equipo en revelar TODAS sus cartas de color gana la partida.
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 rounded-xl p-4 border border-red-700/50">
                <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                  <span>💀</span> Derrota Instantánea
                </h3>
                <p className="text-slate-300 text-sm">
                  Si un equipo toca la carta del <strong className="text-red-400">ASESINO</strong>, pierde inmediatamente. ¡El otro equipo gana!
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4">
                <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                  <span>💡</span> Consejos
                </h3>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>Como Jefe: busca conexiones entre múltiples palabras</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>Como Agente: discute con tu equipo antes de elegir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>Si no estás seguro, pasa el turno</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>¡Evita el asesino a toda costa!</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all transform active:scale-95"
          >
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  );
}

// Floating Rules Button Component
export function RulesButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-full shadow-lg shadow-amber-500/30 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95"
      aria-label="Ver reglas"
    >
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  );
}
