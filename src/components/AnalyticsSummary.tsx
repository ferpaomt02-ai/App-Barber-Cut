/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ABCAnalysisSummary, ComputedServiceData } from '../types';
import { Award, Layers, TrendingUp, Sparkles, DollarSign, PiggyBank, Briefcase, PlusCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsSummaryProps {
  summary: ABCAnalysisSummary;
  computedData: ComputedServiceData[];
}

export default function AnalyticsSummary({ summary, computedData }: AnalyticsSummaryProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Profit margin total percentage
  const globalMarginPct = summary.totalIngresos > 0 
    ? (summary.totalUtilidad / summary.totalIngresos) * 100 
    : 0;

  // Actual Pareto evaluation: ratio of Class A services count vs. total services generating what portion of revenue
  const percentOfServicesGeneratingA = summary.serviciosCount > 0
    ? (summary.countA / summary.serviciosCount) * 100
    : 0;

  const actualRevenuePctOfA = summary.totalIngresos > 0
    ? (summary.ingresosA / summary.totalIngresos) * 100
    : 0;

  return (
    <div className="space-y-6" id="analytics-summary-root">
      {/* Dynamic Pareto Insight banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-amber-500/15 bg-gradient-to-r from-amber-950/20 via-slate-900/40 to-slate-950 p-5 shadow-sm relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-5 pointer-events-none">
          <Sparkles className="h-44 w-44 text-amber-400" />
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-amber-400 font-mono flex items-center gap-2">
              <Award className="h-4 w-4" />
              Diagnóstico de Pareto BarberCut
            </h3>
            <p className="text-white text-base sm:text-lg font-bold leading-snug">
              ¡La Ley del 80/20 se cumple! El <span className="text-amber-400 font-extrabold">{percentOfServicesGeneratingA.toFixed(0)}%</span> de tus servicios genera el <span className="text-amber-400 font-extrabold">{actualRevenuePctOfA.toFixed(0)}%</span> de tus ingresos totales.
            </p>
            <p className="text-xs text-slate-400 max-w-2xl">
              Concentra tus esfuerzos operativos, campañas publicitarias y compras de insumos principalmente en estos servicios críticos de <span className="text-amber-300 font-medium">Clase A</span>. Ellos sostienen la rentabilidad completa de tu barbería.
            </p>
          </div>
          
          <div className="flex-shrink-0 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-500 block mb-0.5">Margen Operativo Global</span>
            <span className="text-lg font-extrabold text-emerald-400 font-sans">
              {globalMarginPct.toFixed(1)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Global Metrics Banners */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Ingreso Bruto Total',
            value: formatCurrency(summary.totalIngresos),
            color: 'text-amber-400',
            icon: DollarSign,
            bg: 'bg-slate-950/50',
            border: 'border-slate-850',
          },
          {
            label: 'Costo Operativo Suma',
            value: formatCurrency(summary.totalCostos),
            color: 'text-rose-400',
            icon: PiggyBank,
            bg: 'bg-slate-950/50',
            border: 'border-slate-850',
          },
          {
            label: 'Utilidad Operativa Real',
            value: formatCurrency(summary.totalUtilidad),
            color: 'text-emerald-400',
            icon: Briefcase,
            bg: 'bg-emerald-950/10 border-emerald-500/10',
            border: 'border-emerald-500/15',
          },
          {
            label: 'Suma de Unidades Vendidas',
            value: `${summary.totalUnidades.toLocaleString()} servicios`,
            color: 'text-sky-400',
            icon: PlusCircle,
            bg: 'bg-slate-950/50',
            border: 'border-slate-850',
          }
        ].map((item, idx) => (
          <div
            key={`metric-${idx}`}
            className={`rounded-xl border ${item.border} ${item.bg} p-4 flex items-center justify-between gap-3 shadow-sm`}
          >
            <div className="space-y-1">
              <span className="text-xxs uppercase tracking-wider text-slate-500 font-mono font-medium block">
                {item.label}
              </span>
              <span className={`text-base sm:text-lg font-bold tracking-tight ${item.color}`}>
                {item.value}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <item.icon className={`h-4.5 w-4.5 ${item.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* ABC Classification Matrix Breakdown Accordion/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Clase A */}
        <div className="rounded-xl border border-amber-500/20 bg-slate-950 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-bold font-mono">
                A
              </span>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Clase A (Estrella)</h4>
                <p className="text-[10px] text-slate-400 font-sans">Sostiene el 80% del ingreso</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-center bg-slate-900/40 p-2.5 rounded-lg border border-slate-900">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Servicios</span>
              <span className="text-sm font-bold text-slate-200">{summary.countA}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Ventas</span>
              <span className="text-sm font-bold text-amber-400">{formatCurrency(summary.ingresosA)}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xxs font-mono text-amber-300 font-semibold uppercase tracking-wider">
              <AlertCircle className="h-3 w-3" />
              <span>Acción Estratégica:</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-2 list-none pl-0">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-mono mt-0.5">•</span>
                <span><strong>Control Riguroso:</strong> Cero quiebres de material de barbería crudo (champús, ceras, etc).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-mono mt-0.5">•</span>
                <span><strong>Agilización Agenda:</strong> Optimiza horarios estrella para estos servicios con mayores recursos.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-mono mt-0.5">•</span>
                <span><strong>Cuidado del Margen:</strong> Evalúa incrementos de precio sutiles periódicos, ya que son inelásticos.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Clase B */}
        <div className="rounded-xl border border-sky-500/20 bg-slate-950 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-sky-500/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-400/10 text-sky-400 border border-sky-400/20 text-xs font-bold font-mono">
                B
              </span>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Clase B (Intermedio)</h4>
                <p className="text-[10px] text-slate-400 font-sans">Aporta el 15% del ingreso</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-center bg-slate-900/40 p-2.5 rounded-lg border border-slate-900">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Servicios</span>
              <span className="text-sm font-bold text-slate-200">{summary.countB}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Ventas</span>
              <span className="text-sm font-bold text-sky-400">{formatCurrency(summary.ingresosB)}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xxs font-mono text-sky-300 font-semibold uppercase tracking-wider">
              <AlertCircle className="h-3 w-3" />
              <span>Acción Estratégica:</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-2 list-none pl-0">
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-mono mt-0.5">•</span>
                <span><strong>Incentivos de Compra:</strong> Implementa combos para que migren a transacciones de Clase A.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-mono mt-0.5">•</span>
                <span><strong>Control de Costos:</strong> Consolida stock de seguridad para evitar estancamientos financieros.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-mono mt-0.5">•</span>
                <span><strong>Soporte General:</strong> Buen pilar de servicios recurrentes que amortiguan gastos fijos.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Clase C */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300 text-xs font-bold font-mono border border-slate-700">
                C
              </span>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Clase C (Bajo Impacto)</h4>
                <p className="text-[10px] text-slate-400 font-sans">Aporta el 5% del ingreso</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-center bg-slate-900/40 p-2.5 rounded-lg border border-slate-900">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Servicios</span>
              <span className="text-sm font-bold text-slate-200">{summary.countC}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Ventas</span>
              <span className="text-sm font-bold text-slate-400">{formatCurrency(summary.ingresosC)}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xxs font-mono text-slate-400 font-semibold uppercase tracking-wider">
              <AlertCircle className="h-3 w-3" />
              <span>Acción Estratégica:</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-2 list-none pl-0">
              <li className="flex items-start gap-2">
                <span className="text-slate-500 font-mono mt-0.5">•</span>
                <span><strong>Simplificación:</strong> Minimiza o automatiza compras de materiales para estos servicios.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-500 font-mono mt-0.5">•</span>
                <span><strong>Combos de Salida:</strong> Úsalos como obsequio o complemento en promociones de alto valor.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-500 font-mono mt-0.5">•</span>
                <span><strong>Eliminación:</strong> Evalúa retirar el servicio si el tiempo de preparación o costo operativo es alto.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
