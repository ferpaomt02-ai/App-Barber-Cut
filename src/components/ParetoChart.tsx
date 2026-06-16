/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ComputedServiceData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Layers, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface ParetoChartProps {
  data: ComputedServiceData[];
  totalRevenue: number;
}

export default function ParetoChart({ data, totalRevenue }: ParetoChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Resize observer to make SVG perfectly responsive
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        const computedWidth = Math.max(width, 320); // enforce minimum
        const computedHeight = Math.min(Math.max(computedWidth * 0.5, 320), 450);
        setDimensions({ width: computedWidth, height: computedHeight });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const { width, height } = dimensions;
  const padding = { top: 40, right: 60, bottom: 90, left: 70 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Maximum value for individual service revenue
  const maxRevenue = data.length > 0 ? Math.max(...data.map(d => d.ingreso_total)) : 100;
  // Nice round number for Left Y-Axis maximum
  const leftYMax = Math.ceil(maxRevenue * 1.15);

  // Scales
  const getX = (index: number) => {
    if (data.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (data.length - 1)) * (chartWidth - (chartWidth / data.length)) + (chartWidth / data.length) / 2;
  };

  const getBarX = (index: number, barWidth: number) => {
    const colWidth = chartWidth / data.length;
    return padding.left + index * colWidth + (colWidth - barWidth) / 2;
  };

  const getLeftY = (val: number) => {
    return padding.top + chartHeight - (val / leftYMax) * chartHeight;
  };

  const getRightY = (percentage: number) => {
    return padding.top + chartHeight - (percentage / 100) * chartHeight;
  };

  // Bar dimensions
  const colWidth = chartWidth / data.length;
  const barWidth = Math.max(colWidth * 0.65, 6);

  // Formatting helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Generate ticks for Left Y-Axis (Revenue)
  const leftYTicks = [0, 0.25, 0.5, 0.75, 1].map(pct => Math.round(leftYMax * pct));

  // Generate ticks for Right Y-Axis (Percentage)
  const rightYTicks = [0, 20, 40, 60, 80, 95, 100];

  return (
    <div className="w-full bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 sm:p-6" id="pareto-chart-container">
      {/* Chart Title and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-amber-500" />
            Curva de Distribución de Pareto
          </h2>
          <p className="text-xs text-slate-400">
            Barras: Ingreso por servicio ($) · Línea: Porcentaje acumulado (%)
          </p>
        </div>
        
        {/* Color Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-gradient-to-t from-amber-600 to-amber-400 shadow-sm shadow-amber-500/20" />
            <span className="text-amber-400">Clase A (Top 80%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-gradient-to-t from-sky-600 to-sky-400 shadow-sm shadow-sky-500/20" />
            <span className="text-sky-400">Clase B (80% a 95%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-gradient-to-t from-slate-600 to-slate-400" />
            <span className="text-slate-400 font-normal">Clase C (Resto 5%)</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Holder */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
        <svg width={width} height={height} className="overflow-visible">
          {/* Definitions for Gradients, Shadows, etc */}
          <defs>
            {/* Gradients */}
            <linearGradient id="grad-A" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="grad-B" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="grad-C" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="grad-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>

            {/* Glowing filter for line */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Gridlines */}
          {leftYTicks.map((tick, idx) => {
            const y = getLeftY(tick);
            return (
              <line
                key={`grid-${idx}`}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                className="stroke-slate-800/60"
                strokeDasharray={idx === 0 ? "0" : "4 4"}
              />
            );
          })}

          {/* Threshold references: 80% and 95% */}
          {[80, 95].map((pct) => {
            const y = getRightY(pct);
            return (
              <g key={`threshold-line-${pct}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  className={pct === 80 ? 'stroke-amber-500/40' : 'stroke-sky-500/30'}
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <text
                  x={width - padding.right - 8}
                  y={y - 5}
                  className={`text-xxs font-mono ${pct === 80 ? 'fill-amber-400 font-semibold' : 'fill-sky-400'}`}
                  textAnchor="end"
                >
                  Límite {pct}%
                </text>
              </g>
            );
          })}

          {/* Main Left Y-Axis (Revenue) */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            className="stroke-slate-800"
            strokeWidth="1.5"
          />
          {leftYTicks.map((tick, idx) => {
            const y = getLeftY(tick);
            return (
              <g key={`left-tick-${idx}`} className="text-xxs font-mono fill-slate-400">
                <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} className="stroke-slate-800" />
                <text x={padding.left - 10} y={y + 4} textAnchor="end">
                  {formatCurrency(tick)}
                </text>
              </g>
            );
          })}

          {/* Main Right Y-Axis (Percentage) */}
          <line
            x1={width - padding.right}
            y1={padding.top}
            x2={width - padding.right}
            y2={padding.top + chartHeight}
            className="stroke-slate-800"
            strokeWidth="1.5"
          />
          {rightYTicks.map((tick, idx) => {
            const y = getRightY(tick);
            return (
              <g key={`right-tick-${idx}`} className="text-xxs font-mono">
                <line x1={width - padding.right} y1={y} x2={width - padding.right + 5} y2={y} className="stroke-slate-800" />
                <text
                  x={width - padding.right + 10}
                  y={y + 4}
                  textAnchor="start"
                  className={tick === 80 ? 'fill-amber-400 font-semibold' : tick === 95 ? 'fill-sky-400 font-medium' : 'fill-slate-400'}
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Hover Crossshair Highlight */}
          {hoveredIdx !== null && (
            <g>
              {/* Vertical guideline */}
              <line
                x1={getX(hoveredIdx)}
                y1={padding.top}
                x2={getX(hoveredIdx)}
                y2={padding.top + chartHeight}
                className="stroke-slate-700/80"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              {/* Left Y Horizontal focus line */}
              <line
                x1={padding.left}
                y1={getLeftY(data[hoveredIdx].ingreso_total)}
                x2={getX(hoveredIdx)}
                y2={getLeftY(data[hoveredIdx].ingreso_total)}
                className="stroke-slate-700/50"
                strokeDasharray="2 2"
              />
              {/* Right Y Horizontal focus line */}
              <line
                x1={getX(hoveredIdx)}
                y1={getRightY(data[hoveredIdx].porcentaje_acumulado)}
                x2={width - padding.right}
                y2={getRightY(data[hoveredIdx].porcentaje_acumulado)}
                className="stroke-slate-700/50"
                strokeDasharray="2 2"
              />
            </g>
          )}

          {/* Bars representation (Revenue) */}
          {data.map((item, idx) => {
            const barH = (item.ingreso_total / leftYMax) * chartHeight;
            const x = getBarX(idx, barWidth);
            const y = padding.top + chartHeight - barH;

            // Coloring based on ABC classification
            let fillSrc = "url(#grad-C)";
            let shadowColor = "rgba(148, 163, 184, 0.2)";
            if (item.categoria === 'A') {
              fillSrc = "url(#grad-A)";
              shadowColor = "rgba(245, 158, 11, 0.4)";
            } else if (item.categoria === 'B') {
              fillSrc = "url(#grad-B)";
              shadowColor = "rgba(56, 189, 248, 0.3)";
            }

            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={`bar-group-${idx}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Visual bar backdrop target for easier hovering */}
                <rect
                  x={x - (colWidth - barWidth) / 2}
                  y={padding.top}
                  width={colWidth}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Actual value bar representation */}
                <motion.rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barH, 2)}
                  rx={Math.min(4, barWidth / 2)}
                  fill={fillSrc}
                  className="transition-all duration-200"
                  style={{
                    filter: isHovered ? `drop-shadow(0px 0px 8px ${shadowColor})` : 'none',
                    opacity: hoveredIdx !== null && !isHovered ? 0.4 : 1,
                  }}
                  initial={{ height: 0, y: padding.top + chartHeight }}
                  animate={{ height: Math.max(barH, 2), y: y }}
                  transition={{ delay: idx * 0.02, duration: 0.5, ease: 'easeOut' }}
                />
              </g>
            );
          })}

          {/* Line & dots representation (Pareto Curve - Cumulative Percentage) */}
          {data.length > 0 && (
            <g>
              {/* Polyline Path */}
              <motion.path
                d={data.map((item, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getRightY(item.porcentaje_acumulado)}`).join(' ')}
                fill="none"
                stroke="url(#grad-line)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                style={{
                  opacity: hoveredIdx !== null ? 0.3 : 0.95
                }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />

              {/* Connecting point circles */}
              {data.map((item, idx) => {
                const cx = getX(idx);
                const cy = getRightY(item.porcentaje_acumulado);
                const isHovered = hoveredIdx === idx;

                return (
                  <circle
                    key={`point-${idx}`}
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 6 : 4}
                    className="fill-rose-500 stroke-slate-900 transition-all duration-150 cursor-pointer"
                    strokeWidth={isHovered ? 3 : 2}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      opacity: hoveredIdx !== null && !isHovered ? 0.4 : 1,
                    }}
                  />
                );
              })}
            </g>
          )}

          {/* Bottom X-Axis labels */}
          {data.map((item, idx) => {
            const x = getX(idx);
            const isHovered = hoveredIdx === idx;
            const shortName = item.nombre_servicio.length > 15 
              ? `${item.nombre_servicio.slice(0, 15)}...` 
              : item.nombre_servicio;

            return (
              <g
                key={`xlabel-${idx}`}
                transform={`translate(${x}, ${padding.top + chartHeight + 15})`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <text
                  transform="rotate(35)"
                  className={`text-[10px] font-mono transition-colors text-right ${
                    isHovered 
                    ? 'fill-amber-400 font-bold font-sans' 
                    : item.categoria === 'A' 
                    ? 'fill-amber-300/80' 
                    : item.categoria === 'B' 
                    ? 'fill-sky-300/85' 
                    : 'fill-slate-400'
                  }`}
                  textAnchor="start"
                >
                  {item.sku}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovering Tooltip Element */}
        <AnimatePresence>
          {hoveredIdx !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute pointer-events-none z-30 min-w-[280px] bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 shadow-xl shadow-slate-950/60 backdrop-blur-md"
              style={{
                // Auto position tooltip based on hovered bar index
                left: getX(hoveredIdx) > width / 2 ? 'auto' : `${getX(hoveredIdx) + 15}px`,
                right: getX(hoveredIdx) > width / 2 ? `${width - getX(hoveredIdx) + 15}px` : 'auto',
                top: `${Math.max(getLeftY(data[hoveredIdx].ingreso_total) - 80, 20)}px`,
              }}
            >
              {/* Badge Category */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-2 mb-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  SKU: {data[hoveredIdx].sku}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    data[hoveredIdx].categoria === 'A'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : data[hoveredIdx].categoria === 'B'
                      ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  Clase {data[hoveredIdx].categoria}
                </span>
              </div>

              {/* Service description */}
              <p className="text-xs font-semibold text-white leading-tight mb-2.5">
                {data[hoveredIdx].nombre_servicio}
              </p>

              {/* Grid ledger entries */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-xxs">
                <div className="flex flex-col">
                  <span className="text-slate-500">Volumen Ventas:</span>
                  <span className="text-slate-200 font-medium">
                    {data[hoveredIdx].unidades_vendidas} unidades
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500">Ingreso Individual:</span>
                  <span className="text-amber-400 font-bold">
                    {formatCurrency(data[hoveredIdx].ingreso_total)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500">% del Total:</span>
                  <span className="text-slate-200">
                    {data[hoveredIdx].porcentaje_ingresos.toFixed(2)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500">% Acumulado:</span>
                  <span className="text-rose-400 font-semibold">
                    {data[hoveredIdx].porcentaje_acumulado.toFixed(2)}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
