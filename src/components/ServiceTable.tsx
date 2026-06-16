/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ComputedServiceData, ABCAnalysisSummary } from '../types';
import { Search, Filter, ArrowUpDown, ChevronUp, ChevronDown, Copy, Check, Eye } from 'lucide-react';

interface ServiceTableProps {
  data: ComputedServiceData[];
  summary: ABCAnalysisSummary;
  onSelectService: (service: ComputedServiceData) => void;
}

type SortField = 'sku' | 'nombre_servicio' | 'costo_unitario' | 'precio_venta' | 'unidades_vendidas' | 'ingreso_total' | 'porcentaje_acumulado' | 'categoria';
type SortDirection = 'asc' | 'desc';

export default function ServiceTable({ data, summary, onSelectService }: ServiceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [sortField, setSortField] = useState<SortField>('ingreso_total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const handleCopySku = (e: React.MouseEvent, sku: string) => {
    e.stopPropagation(); // prevent opening detailed modal
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 1800);
  };

  // 1. Filter services based on search text and category tab selection
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nombre_servicio.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || item.categoria === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // 2. Sort filtered services
  const sortedData = [...filteredData].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    // Priority category custom sort
    if (sortField === 'categoria') {
      const categoryValue = { A: 1, B: 2, C: 3 };
      valA = categoryValue[a.categoria];
      valB = categoryValue[b.categoria];
    }

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDirection === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      // numeric comparison
      return sortDirection === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    }
  });

  const triggerSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc'); // default descending for raw numbers
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-slate-500/60 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-3 w-3 text-amber-400 font-bold" />
    ) : (
      <ChevronDown className="h-3 w-3 text-amber-400 font-bold" />
    );
  };

  return (
    <div className="space-y-4" id="service-table-root">
      {/* Search, Filter Tabs and Summary count */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/10 p-3 rounded-xl border border-slate-800/60">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por SKU o nombre de servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="input-buscador-tabla"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs font-sans text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 shadow-inner"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({data.length})
          </button>
          <button
            onClick={() => setSelectedCategory('A')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
              selectedCategory === 'A'
                ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Clase A ({summary.countA})
          </button>
          <button
            onClick={() => setSelectedCategory('B')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
              selectedCategory === 'B'
                ? 'bg-sky-400/10 text-sky-300 border border-sky-400/20 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Clase B ({summary.countB})
          </button>
          <button
            onClick={() => setSelectedCategory('C')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
              selectedCategory === 'C'
                ? 'bg-slate-800 text-slate-350 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Clase C ({summary.countC})
          </button>
        </div>
      </div>

      {/* Responsive Table visual element */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80 shadow-md">
        <table className="w-full min-w-[900px] border-collapse text-left text-xs font-sans">
          
          {/* Table Header */}
          <thead className="bg-slate-900/60 uppercase font-mono tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 select-none cursor-pointer hover:bg-slate-900 transition-colors" onClick={() => triggerSort('sku')}>
                <div className="flex items-center gap-1.5">
                  <span>SKU / Cód.</span>
                  {getSortIcon('sku')}
                </div>
              </th>
              
              <th className="py-3 px-4 select-none cursor-pointer hover:bg-slate-900 transition-colors w-[25%]" onClick={() => triggerSort('nombre_servicio')}>
                <div className="flex items-center gap-1.5">
                  <span>Nombre del Servicio / Producto</span>
                  {getSortIcon('nombre_servicio')}
                </div>
              </th>

              <th className="py-3 px-3 select-none cursor-pointer hover:bg-slate-900 transition-colors text-right" onClick={() => triggerSort('costo_unitario')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Costo Unit.</span>
                  {getSortIcon('costo_unitario')}
                </div>
              </th>

              <th className="py-3 px-3 select-none cursor-pointer hover:bg-slate-900 transition-colors text-right" onClick={() => triggerSort('precio_venta')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Precio Vta.</span>
                  {getSortIcon('precio_venta')}
                </div>
              </th>

              <th className="py-3 px-3 select-none cursor-pointer hover:bg-slate-900 transition-colors text-right" onClick={() => triggerSort('unidades_vendidas')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Uds. Vendidas</span>
                  {getSortIcon('unidades_vendidas')}
                </div>
              </th>

              <th className="py-3 px-3 select-none cursor-pointer hover:bg-slate-900 transition-colors text-right" onClick={() => triggerSort('ingreso_total')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Ingreso Bruto</span>
                  {getSortIcon('ingreso_total')}
                </div>
              </th>

              <th className="py-3 px-3 select-none cursor-pointer hover:bg-slate-900 transition-colors text-right" onClick={() => triggerSort('porcentaje_acumulado')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>% Acumulado</span>
                  {getSortIcon('porcentaje_acumulado')}
                </div>
              </th>

              <th className="py-3 px-4 select-none cursor-pointer hover:bg-slate-900 transition-colors text-center" onClick={() => triggerSort('categoria')}>
                <div className="flex items-center justify-center gap-1.5">
                  <span>Clasificación Clase</span>
                  {getSortIcon('categoria')}
                </div>
              </th>

              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-900/60 text-slate-300">
            {sortedData.length > 0 ? (
              sortedData.map((item, index) => {
                const markup = item.costo_unitario > 0 
                  ? ((item.precio_venta - item.costo_unitario) / item.costo_unitario) * 100 
                  : 100;
                
                return (
                  <tr
                    key={`tr-${item.sku}`}
                    onClick={() => onSelectService(item)}
                    className="hover:bg-slate-900/50 transition-colors cursor-pointer group/row"
                  >
                    {/* SKU badge */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-semibold">{item.sku}</span>
                        <button
                          onClick={(e) => handleCopySku(e, item.sku)}
                          className="p-1 rounded bg-slate-900 text-slate-500 hover:text-amber-400 opacity-0 group-hover/row:opacity-100 transition-opacity"
                        >
                          {copiedSku === item.sku ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Service Name */}
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      <div className="truncate max-w-[200px] xl:max-w-[400px] block" title={item.nombre_servicio}>
                        {item.nombre_servicio}
                      </div>
                    </td>

                    {/* Unit Cost */}
                    <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                      {formatCurrency(item.costo_unitario)}
                    </td>

                    {/* Sale Price */}
                    <td className="py-3.5 px-3 text-right font-mono text-slate-200">
                      {formatCurrency(item.precio_venta)}
                    </td>

                    {/* Units Sold */}
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-300">
                      {item.unidades_vendidas.toLocaleString()}
                    </td>

                    {/* Total Revenue */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-400">
                      {formatCurrency(item.ingreso_total)}
                    </td>

                    {/* Cumulative Percentage */}
                    <td className="py-3.5 px-3 text-right font-mono text-rose-400/90">
                      {item.porcentaje_acumulado.toFixed(2)}%
                    </td>

                    {/* ABC Class tag indicator */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xxs font-extrabold uppercase tracking-widest ${
                          item.categoria === 'A'
                            ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                            : item.categoria === 'B'
                            ? 'bg-sky-400/10 text-sky-300 border border-sky-400/20'
                            : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          item.categoria === 'A'
                            ? 'bg-amber-400'
                            : item.categoria === 'B'
                            ? 'bg-sky-400'
                            : 'bg-slate-400'
                        }`} />
                        Clase {item.categoria}
                      </span>
                    </td>

                    {/* Detail icon action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectService(item);
                        }}
                        className="p-1.5 rounded bg-slate-900 border border-slate-850 text-slate-400 hover:text-amber-400 hover:border-amber-400/30 transition-all shadow-sm"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-12 px-4 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="h-8 w-8 text-slate-600 animate-bounce" />
                    <p className="font-medium text-slate-400">No se encontraron servicios que coincidan con la búsqueda.</p>
                    <p className="text-xxs text-slate-500 font-mono">Modifica tus filtros o realiza otra consulta.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
