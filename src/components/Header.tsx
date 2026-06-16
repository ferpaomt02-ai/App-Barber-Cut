/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Scissors, Sparkles, SlidersHorizontal, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  onReset: () => void;
  hasData: boolean;
}

export default function Header({ onReset, hasData }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/15 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-4">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20">
            <Scissors className="h-5 w-5 rotate-45 transform" />
            <motion.div
              className="absolute -right-1 -top-1"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              <Sparkles className="h-3 w-3 text-slate-900" />
            </motion.div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-xl font-bold tracking-tight text-white">
                Barber<span className="text-amber-400">Cut</span>
              </span>
              <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-xxs font-semibold tracking-wider text-amber-300 uppercase border border-amber-400/20">
                Pareto ABC
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans tracking-wide">
              Analizador de Control de Inventario y Servicios
            </p>
          </div>
        </div>

        {/* Dynamic Controls / Status Indicators */}
        <div className="flex items-center gap-3">
          {hasData && (
            <button
              onClick={onReset}
              id="btn-re-analizar"
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-slate-300 border border-slate-800 hover:border-amber-500/35 transition-colors shadow-sm"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <span>Cargar nuevo archivo</span>
            </button>
          )}
          <div className="hidden md:flex items-center gap-2 rounded-lg bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 text-xs text-slate-400 font-mono">
            <BarChart3 className="h-3.5 w-3.5 text-amber-500/80" />
            <span>Ley de Pareto 80/20</span>
          </div>
        </div>
      </div>
    </header>
  );
}
