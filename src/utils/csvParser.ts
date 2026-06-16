/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RawServiceData, CSVParseResult, ComputedServiceData, ABCAnalysisSummary } from '../types';

// Helper to normalize a string (remove accents, spaces, special chars, lowercase)
function normalizeHeader(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, ''); // Keep only alphanumeric
}

function splitCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  // Clean outer quotes and trim
  return result.map(col => {
    let clean = col.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.slice(1, -1);
    }
    // Replace doubled quotes with single quotes
    return clean.replace(/""/g, '"').trim();
  });
}

export function parseCSV(text: string): CSVParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const services: RawServiceData[] = [];

  if (!text || text.trim() === '') {
    errors.push('El archivo CSV está vacío.');
    return { data: [], errors, warnings };
  }

  // Split lines, ignoring blank ones
  const rawLines = text.split(/\r?\n/);
  const lines = rawLines.map(l => l.trim()).filter(l => l.length > 0);

  if (lines.length < 2) {
    errors.push('El archivo CSV debe contener al menos una cabecera y una fila de datos.');
    return { data: [], errors, warnings };
  }

  // Detect delimiter (, or ;) by counting in the header line
  const headerLine = lines[0];
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semicolonCount = (headerLine.match(/;/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ';' : ',';

  warnings.push(`Delimitador autodetectado: "${delimiter}"`);

  // Parse headers
  const rawHeaders = splitCSVLine(headerLine, delimiter);
  const normalizedHeaders = rawHeaders.map(normalizeHeader);

  // Map columns index
  let skuIdx = -1;
  let nombreIdx = -1;
  let costoIdx = -1;
  let precioIdx = -1;
  let unidadesIdx = -1;

  normalizedHeaders.forEach((header, index) => {
    // SKU matches
    if (['sku', 'id', 'codigo', 'referencia', 'ref'].includes(header) || header.includes('sku')) {
      skuIdx = index;
    }
    // Name matches
    else if (
      ['nombreservicio', 'nombre', 'servicio', 'prestacion', 'concepto', 'name', 'descripcion', 'producto'].includes(header) ||
      header.includes('nombre') || header.includes('servicio')
    ) {
      nombreIdx = index;
    }
    // Cost matches
    else if (
      ['costounitario', 'costo', 'cost', 'unitcost', 'costou', 'costounit', 'costomaterial', 'costoservicio'].includes(header) ||
      header.includes('costo') || header.includes('cost')
    ) {
      if (costoIdx === -1) costoIdx = index; // prevent price collision
    }
    // Price matches
    else if (
      ['precioventa', 'precio', 'price', 'saleprice', 'pvp', 'preciounitario', 'unitprice', 'preciofinal'].includes(header) ||
      header.includes('precio') || header.includes('price') || header.includes('venta')
    ) {
      if (precioIdx === -1) precioIdx = index;
    }
    // Units Sold matches
    else if (
      ['unidadesvendidas', 'unidades', 'cantidad', 'quantity', 'cant', 'qty', 'unidadesv', 'ventas', 'ventascount', 'vendidos', 'totalvendidos'].includes(header) ||
      header.includes('unidad') || header.includes('cant') || header.includes('vendid')
    ) {
      if (unidadesIdx === -1) unidadesIdx = index;
    }
  });

  // Fallbacks if columns the user entered don't perfectly match our fuzzy logic, or to ensure we have defaults
  if (skuIdx === -1) {
    skuIdx = normalizedHeaders.findIndex(h => h.includes('sku') || h.includes('cod') || h.includes('id'));
  }
  if (nombreIdx === -1) {
    nombreIdx = normalizedHeaders.findIndex(h => h.includes('nom') || h.includes('ser') || h.includes('desc'));
  }
  if (costoIdx === -1) {
    costoIdx = normalizedHeaders.findIndex(h => h.includes('cos') || h.includes('val'));
  }
  if (precioIdx === -1) {
    precioIdx = normalizedHeaders.findIndex(h => h.includes('pre') || h.includes('ven') || h.includes('pvp'));
  }
  if (unidadesIdx === -1) {
    unidadesIdx = normalizedHeaders.findIndex(h => h.includes('uni') || h.includes('can') || h.includes('ven') || h.includes('qty'));
  }

  // Final verification of column assignments
  const missingHeaders: string[] = [];
  if (skuIdx === -1) missingHeaders.push('SKU / Código');
  if (nombreIdx === -1) missingHeaders.push('Nombre Servicio');
  if (costoIdx === -1) missingHeaders.push('Costo Unitario');
  if (precioIdx === -1) missingHeaders.push('Precio Venta');
  if (unidadesIdx === -1) missingHeaders.push('Unidades Vendidas');

  if (missingHeaders.length > 0) {
    errors.push(
      `No se pudieron detectar todas las columnas necesarias de forma automática. Faltan: ${missingHeaders.join(', ')}. ` +
      `Asegúrese de que el archivo tenga la fila de encabezados con nombres como: sku, nombre_servicio, costo_unitario, precio_venta y unidades_vendidas.`
    );
    return { data: [], errors, warnings };
  }

  // Parse rows
  for (let i = 1; i < lines.length; i++) {
    const rawRow = lines[i];
    const columns = splitCSVLine(rawRow, delimiter);

    // If empty row, skip
    if (columns.length === 1 && columns[0] === '') continue;

    // Validate if row has appropriate columns
    if (columns.length < Math.max(skuIdx, nombreIdx, costoIdx, precioIdx, unidadesIdx) + 1) {
      warnings.push(`Fila ${i + 1} ignorada o incompleta: "${rawRow.slice(0, 30)}..." tiene menos columnas de las configuradas.`);
      continue;
    }

    const rawSku = columns[skuIdx];
    const rawNombre = columns[nombreIdx];
    const rawCosto = columns[costoIdx];
    const rawPrecio = columns[precioIdx];
    const rawUnidades = columns[unidadesIdx];

    // Check SKU and Name are not completely blank
    if (!rawSku || !rawNombre) {
      warnings.push(`Fila ${i + 1} omitida por SKU o Nombre vacío.`);
      continue;
    }

    // Clean numeric strings: e.g. "$ 25.50" or "1.500,00" -> 1500.00 or "25,50" -> 25.50
    const parseNumber = (val: string): number => {
      if (!val) return 0;
      // Remove currencies, spaces
      let clean = val.replace(/[\$\s€]/g, '');
      
      // Handle European decimal comma notation: If there's a comma and no dot, or if the comma comes after the dot, or basic Spanish formatting
      // E.g. "1.500,25" -> replace dots with empty, and commas with dots.
      // If "25,50" -> replace comma with dot
      if (clean.includes(',') && clean.includes('.')) {
        if (clean.indexOf('.') < clean.indexOf(',')) {
          // Dot is thousands separator, comma is decimal
          clean = clean.replace(/\./g, '').replace(/,/g, '.');
        } else {
          // Comma is thousands separator, dot is decimal
          clean = clean.replace(/,/g, '');
        }
      } else if (clean.includes(',')) {
        // Only comma is present, check if it behaves as thousands divider or decimal divider.
        // In simple CSV, if there's exactly 1 comma followed by 1 or 2 digits, or if it is "25,50" -> decimal
        const parts = clean.split(',');
        if (parts[1].length === 3) {
          // Thousands separator e.g. "1,500"
          clean = clean.replace(/,/g, '');
        } else {
          // Decimal separator e.g. "25,50" or "8,5"
          clean = clean.replace(/,/g, '.');
        }
      }

      const num = parseFloat(clean);
      return isNaN(num) ? 0 : num;
    };

    const costo_unitario = parseNumber(rawCosto);
    const precio_venta = parseNumber(rawPrecio);
    const unidades_vendidas = Math.round(parseNumber(rawUnidades));

    services.push({
      sku: rawSku,
      nombre_servicio: rawNombre,
      costo_unitario,
      precio_venta,
      unidades_vendidas,
    });
  }

  if (services.length === 0) {
    errors.push('No se pudieron extraer registros válidos del archivo CSV.');
  }

  return { data: services, errors, warnings };
}

export function performABCAnalysis(rawServices: RawServiceData[]): {
  computed: ComputedServiceData[];
  summary: ABCAnalysisSummary;
} {
  // 1. Calculate individual metrics
  const servicesWithTotals = rawServices.map(item => {
    const ingreso_total = item.unidades_vendidas * item.precio_venta;
    const costo_total = item.unidades_vendidas * item.costo_unitario;
    const utilidad_total = ingreso_total - costo_total;
    const margen_porcentaje = ingreso_total > 0 ? (utilidad_total / ingreso_total) * 100 : 0;

    return {
      ...item,
      ingreso_total,
      costo_total,
      utilidad_total,
      margen_porcentaje,
    };
  });

  // 2. Sort from highest revenue to lowest
  servicesWithTotals.sort((a, b) => b.ingreso_total - a.ingreso_total);

  // 3. Compute total revenue
  const totalIngresos = servicesWithTotals.reduce((sum, item) => sum + item.ingreso_total, 0);
  const totalCostos = servicesWithTotals.reduce((sum, item) => sum + item.costo_total, 0);
  const totalUtilidad = servicesWithTotals.reduce((sum, item) => sum + item.utilidad_total, 0);
  const totalUnidades = servicesWithTotals.reduce((sum, item) => sum + item.unidades_vendidas, 0);

  // 4. Calculate cumulative percentages and assign categories
  // Category A: up to 80% (Ley de Pareto).
  // Category B: up to 95% (80% to 95%, next 15%).
  // Category C: the remaining 5% (95% to 100%).
  
  let runningTotal = 0;
  
  const computed: ComputedServiceData[] = servicesWithTotals.map((item) => {
    const porcentaje_ingresos = totalIngresos > 0 ? (item.ingreso_total / totalIngresos) * 100 : 0;
    
    // Store previous total to determine actual boundary cross
    const previousAccumulatedPct = totalIngresos > 0 ? (runningTotal / totalIngresos) * 100 : 0;
    
    runningTotal += item.ingreso_total;
    const porcentaje_acumulado = totalIngresos > 0 ? (runningTotal / totalIngresos) * 100 : 0;

    // Classification strategy
    let categoria: 'A' | 'B' | 'C' = 'C';
    
    if (previousAccumulatedPct < 80) {
      categoria = 'A';
    } else if (previousAccumulatedPct < 95) {
      categoria = 'B';
    } else {
      categoria = 'C';
    }

    return {
      ...item,
      porcentaje_ingresos,
      porcentaje_acumulado,
      categoria,
    };
  });

  // 5. Gather summary metrics
  let countA = 0;
  let countB = 0;
  let countC = 0;
  let ingresosA = 0;
  let ingresosB = 0;
  let ingresosC = 0;

  computed.forEach(item => {
    if (item.categoria === 'A') {
      countA++;
      ingresosA += item.ingreso_total;
    } else if (item.categoria === 'B') {
      countB++;
      ingresosB += item.ingreso_total;
    } else {
      countC++;
      ingresosC += item.ingreso_total;
    }
  });

  const summary: ABCAnalysisSummary = {
    totalIngresos,
    totalCostos,
    totalUtilidad,
    totalUnidades,
    serviciosCount: computed.length,
    countA,
    countB,
    countC,
    ingresosA,
    ingresosB,
    ingresosC,
  };

  return { computed, summary };
}
