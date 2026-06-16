/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ComputedServiceData } from '../types';
import { X, Sparkles, TrendingUp, DollarSign, Award, ArrowUpRight, Percent, ShoppingCart, PercentCircle, HelpCircle, Save } from 'lucide-react';
import { motion } from 'motion/react';

interface ServiceDetailModalProps {
  service: ComputedServiceData;
  totalRevenue: number;
  onClose: () => void;
}

export default function ServiceDetailModal({ service, totalRevenue, onClose }: ServiceDetailModalProps) {
  // Simulator states
  const [simPrice, setSimPrice] = useState(service.precio_venta);
  const [simUnits, setSimUnits] = useState(service.unidades_vendidas);

  // Sync simulator states when selected service changes
  useEffect(() => {
    setSimPrice(service.precio_venta);
    setSimUnits(service.unidades_vendidas);
  }, [service]);

  // Derived simulator values
  const simNewRevenue = simPrice * simUnits;
  const simNewCost = service.costo_unitario * simUnits;
  const simNewProfit = simNewRevenue - simNewCost;
  const simNewMargin = simNewRevenue > 0 ? (simNewProfit / simNewRevenue) * 100 : 0;

  const deltaRevenue = simNewRevenue - service.ingreso_total;
  const deltaProfit = simNewProfit - service.utilidad_total;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const getCategoryTheme = (cat: 'A' | 'B' | 'C') => {
    switch (cat) {
      case 'A':
        return {
          bg: 'bg-amber-400/10 border-amber-400/20 text-amber-300',
          text: 'text-amber-400',
          badge: 'Clase A (Servicio Vital)',
          desc: 'Servicio crítico de alto impacto. Sostiene la rentabilidad principal del negocio.'
        };
      case 'B':
        return {
          bg: 'bg-sky-400/10 border-sky-400/20 text-sky-300',
          text: 'text-sky-400',
          badge: 'Clase B (Soporte Medio)',
          desc: 'Servicio estable e intermedio. Constituye volumen operativo periódico.'
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-350 border-slate-700/60',
          text: 'text-slate-400',
          badge: 'Clase C (Bajo Rendimiento)',
          desc: 'Servicio secundario de poca incidencia financiera. Requiere simplificación.'
        };
    }
  };

  const theme = getCategoryTheme(service.categoria);

  // Unit metrics
  const profitPerUnit = service.precio_venta - service.costo_unitario;
  const markupPct = service.costo_unitario > 0 ? (profitPerUnit / service.costo_unitario) * 100 : 100;
  const portionOfTotalRevenue = totalRevenue > 0 ? (service.ingreso_total / totalRevenue) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" id="detail-modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-850 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold font-mono border ${theme.bg}`}>
              {theme.badge}
            </span>
            <span className="text-xs text-slate-500 font-mono font-medium">SKU: {service.sku}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors border border-slate-800"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* General Name */}
          <div className="space-y-1">
            <p className="text-xxs uppercase tracking-widest font-mono text-amber-500 font-semibold">Análisis Individual</p>
            <h2 className="text-xl font-bold text-white leading-tight font-sans">
              {service.nombre_servicio}
            </h2>
            <p className="text-xs text-slate-400">{theme.desc}</p>
          </div>

          {/* Unit Economics Block Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/40 p-4 border border-slate-850 rounded-xl space-y-1">
              <span className="text-xxs uppercase text-slate-500 font-mono font-medium block">Precio Venta</span>
              <span className="text-base font-bold text-slate-100">{formatCurrency(service.precio_venta)}</span>
            </div>
            
            <div className="bg-slate-900/40 p-4 border border-slate-850 rounded-xl space-y-1">
              <span className="text-xxs uppercase text-slate-500 font-mono font-medium block">Costo Materiales/Sueldo</span>
              <span className="text-base font-bold text-slate-400">{formatCurrency(service.costo_unitario)}</span>
            </div>

            <div className="bg-slate-900/40 p-4 border border-slate-850 rounded-xl space-y-1">
              <span className="text-xxs uppercase text-slate-500 font-mono font-medium block">Margen de Ganancia</span>
              <span className="text-base font-bold text-emerald-400">{service.margen_porcentaje.toFixed(1)}%</span>
            </div>

            <div className="bg-slate-900/40 p-4 border border-slate-850 rounded-xl space-y-1">
              <span className="text-xxs uppercase text-slate-500 font-mono font-medium block">Markup (%)</span>
              <span className="text-base font-bold text-sky-400">{markupPct.toFixed(1)}%</span>
            </div>
          </div>

          {/* Accumulated Metrics Block Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Visual Contribution Chart progress */}
            <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xxs uppercase text-slate-500 font-mono block">Participación en Ingresos</span>
                <div className="flex items-end gap-1.5 mt-1.5">
                  <span className="text-2xl font-extrabold text-white">{portionOfTotalRevenue.toFixed(1)}%</span>
                  <span className="text-xxs text-slate-450 font-mono pb-1">del global</span>
                </div>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full" 
                  style={{ width: `${portionOfTotalRevenue}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl space-y-1.5">
              <span className="text-xxs uppercase text-slate-500 font-mono block">Ingresos Acumulados ($)</span>
              <span className="text-xl font-bold text-amber-400 block">{formatCurrency(service.ingreso_total)}</span>
              <span className="text-xxs text-slate-400 font-mono block">Por {service.unidades_vendidas} unidades vendidas</span>
            </div>

            <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl space-y-1.5">
              <span className="text-xxs uppercase text-slate-500 font-mono block">Margen de Contribución Real</span>
              <span className="text-xl font-bold text-emerald-400 block">{formatCurrency(service.utilidad_total)}</span>
              <span className="text-xxs text-slate-450 font-mono block">Utilidad total generada</span>
            </div>
          </div>

          {/* Interactive Target Simulation Panel */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-400/10 text-amber-300 font-bold border border-amber-400/20 text-xxs">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Simulador de Incremento de Margen
              </h3>
            </div>
            
            <p className="text-xs text-slate-400">
              Modifica las variables para simular cómo un aumento de volumen de reservas o un ajuste en la tarifa aumentaría los rendimientos brutos.
            </p>

            <div className="space-y-4 pt-2">
              {/* Slider Price */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Tarifa Simulada ($):</span>
                  <span className="text-amber-400 font-bold">{formatCurrency(simPrice)}</span>
                </div>
                <input
                  type="range"
                  min={Math.max(1, Math.round(service.precio_venta * 0.5))}
                  max={Math.round(service.precio_venta * 2)}
                  step="0.5"
                  value={simPrice}
                  onChange={(e) => setSimPrice(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Min: -50%</span>
                  <span>Actual: {formatCurrency(service.precio_venta)}</span>
                  <span>Max: +100%</span>
                </div>
              </div>

              {/* Slider Sales count */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Reservas Mensuales:</span>
                  <span className="text-sky-400 font-bold">{simUnits} servicios</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max={Math.round(service.unidades_vendidas * 2.5)}
                  step="5"
                  value={simUnits}
                  onChange={(e) => setSimUnits(parseInt(e.target.value))}
                  className="w-full accent-sky-500 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>5 uds</span>
                  <span>Actual: {service.unidades_vendidas}</span>
                  <span>Max: +150%</span>
                </div>
              </div>
            </div>

            {/* Results of simulation */}
            <div className="border-t border-slate-800 pt-4 grid grid-cols-2 gap-4 font-mono">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                <span className="text-[10px] text-slate-500 uppercase block">Ingreso Sim.</span>
                <span className="text-sm font-bold text-slate-105 block">{formatCurrency(simNewRevenue)}</span>
                <span className={`text-[10px] flex items-center gap-0.5 mt-1 ${deltaRevenue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {deltaRevenue >= 0 ? '+' : ''}{formatCurrency(deltaRevenue)}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                <span className="text-[10px] text-slate-500 uppercase block">Utilidad Sim.</span>
                <span className="text-sm font-bold text-emerald-400 block">{formatCurrency(simNewProfit)}</span>
                <span className={`text-[10px] flex items-center gap-0.5 mt-1 ${deltaProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {deltaProfit >= 0 ? '+' : ''}{formatCurrency(deltaProfit)} (margen {simNewMargin.toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Action Strategy block */}
          <div className="space-y-3">
            <span className="text-xxs uppercase tracking-wider font-mono text-slate-500 font-medium">Recomendación de Inventario y Operativa</span>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 space-y-2 text-xs">
              {service.categoria === 'A' ? (
                <>
                  <p>
                    📌 <strong>Posicionamiento Premium:</strong> Este servicio tiene un alto valor percibido. No compitas por precio reducido. Mantén la tarifa premium y enfoca promociones en fidelizar a este segmento recurrente.
                  </p>
                  <p>
                    🪒 <strong>Protección de Stock:</strong> Monitorea diariamente tus suministros relacionados (espuma fina, aceites humectantes, toallas de algodón estériles) necesarios para atender este servicio sin retrasos.
                  </p>
                </>
              ) : service.categoria === 'B' ? (
                <>
                  <p>
                    📌 <strong>Estrategia de Crecimiento:</strong> Atrae a estos consumidores ofreciéndoles pequeños upgrades de cortesía o promocionando combos premium (ej. agregando exfoliación sutil) para transformarlos a Clase A.
                  </p>
                  <p>
                    🪒 <strong>Abastecimiento Estandarizado:</strong> Mantén suministros promedio. Revisa si un incremento moderado de volumen compensaría una pequeña rebaja de insumos adquiridos por lote.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    📌 <strong>Simplificación Operativa:</strong> No asignes esfuerzos publicitarios independientes a este servicio. Considera ofrecerlo únicamente de forma programada o en días de baja demanda para compensar capacidad muerta.
                  </p>
                  <p>
                    🪒 <strong>Venta Cruzada:</strong> Intégralo como "añadido con descuento" en la compra de un combo Clase A o B. Esto acelerará la rotación de cremas o champús estancados en bodega.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-850 flex items-center justify-end bg-slate-900/40">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 hover:text-white transition-colors text-slate-350 border border-slate-850"
          >
            Cerrar Ficha
          </button>
        </div>
      </motion.div>
    </div>
  );
}
