/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Check, AlertCircle, Info, ArrowRight, Play, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseCSV } from '../utils/csvParser';
import { RawServiceData } from '../types';
import { sampleBarberData } from '../data/sampleData';

interface DropzoneProps {
  onDataLoaded: (data: RawServiceData[], warnings: string[]) => void;
}

export default function Dropzone({ onDataLoaded }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [showManually, setShowManually] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setErrorMsg('Por favor selecciona únicamente archivos de tipo CSV (.csv) o de texto (.txt).');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setErrorMsg(null);
    setParseWarnings([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
    };
    reader.onerror = () => {
      setErrorMsg('Ocurrió un error al leer el archivo en el navegador.');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = () => {
    if (!csvText) {
      setErrorMsg('No hay datos cargados para analizar.');
      return;
    }

    const { data, errors, warnings } = parseCSV(csvText);

    if (errors.length > 0) {
      setErrorMsg(errors.join(' '));
      return;
    }

    onDataLoaded(data, warnings);
  };

  const loadDemoData = () => {
    setErrorMsg(null);
    setParseWarnings([]);
    onDataLoaded(sampleBarberData, ['Datos de demostración cargados exitosamente.']);
  };

  return (
    <div className="mx-auto max-w-4xl py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-400/20 mb-3">
          Ley de Pareto (80/20) para Negocios
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
          Analizador de Clasificación <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">ABC</span>
        </h1>
        <p className="mt-2.5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Carga las ventas y costos de tu salón o barbería. Clasificaremos tus servicios para identificar el <strong className="text-amber-400">80% de tus ingresos</strong> (Clase A) y optimizar tus inventarios.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Dropzone / File Loader */}
        <div className="md:col-span-2 space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`cursor-pointer group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all min-h-[300px] bg-slate-900/40 backdrop-blur-sm ${
              isDragging
                ? 'border-amber-400 bg-amber-500/5 shadow-inner shadow-amber-500/10'
                : 'border-slate-800 hover:border-amber-500/30 hover:bg-slate-900/80 shadow-md'
            }`}
            id="csv-dropzone"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.txt"
              className="hidden"
            />

            <div className="mb-4 rounded-xl p-3 bg-slate-950 border border-slate-800 group-hover:border-amber-500/30 group-hover:bg-slate-900 transition-all">
              {selectedFile ? (
                <FileSpreadsheet className="h-10 w-10 text-amber-400 animate-pulse" />
              ) : (
                <UploadCloud className="h-10 w-10 text-slate-400 group-hover:text-amber-400 transition-colors" />
              )}
            </div>

            {selectedFile ? (
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                  Archivo Seleccionado
                </span>
                <p className="font-semibold text-white max-w-xs truncate mx-auto">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {((selectedFile.size || 0) / 1024).toFixed(2)} KB
                </p>
                <div className="flex items-center justify-center gap-2 mt-2 text-emerald-400 text-xs">
                  <Check className="h-3.5 w-3.5" />
                  <span>Cargado con éxito. Listo para analizar.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-200">
                  Arrastra tu archivo CSV aquí, o <span className="text-amber-400 underline decoration-dotted underline-offset-4 group-hover:text-amber-300">explora tu equipo</span>
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto pt-1">
                  Soporta codificación UTF-8, comas, puntos y comas y separadores decimales estándar.
                </p>
              </div>
            )}
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Error al procesar archivo</p>
                  <p className="text-xs mt-1 text-rose-400/90">{errorMsg}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action trigger button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile}
              id="btn-analizar-upload"
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-semibold transition-all shadow-md ${
                selectedFile
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold hover:shadow-lg hover:shadow-amber-500/10 active:scale-[0.98]'
                  : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <span>Analizar Datos de Barbería</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={loadDemoData}
              id="btn-analizar-demo"
              className="flex items-center justify-center gap-2 rounded-xl py-3.5 px-5 font-semibold bg-slate-950 border border-slate-800 hover:border-amber-500/20 hover:bg-slate-900 text-amber-400 transition-all shadow-sm group"
            >
              <Play className="h-4 w-4 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
              <span>Usar Datos Demostración</span>
            </button>
          </div>
        </div>

        {/* Structural CSV format template advice card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Info className="h-4.5 w-4.5 text-amber-400" />
            <span>Formato de CSV Esperado</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            El archivo debe incluir una primera fila de cabeceras. Las columnas del CSV pueden estar en español o inglés:
          </p>

          <div className="space-y-3 font-sans text-xs">
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="font-mono text-amber-300 font-medium">sku</span>
              <span className="text-slate-400 text-right">Ej: BC-001</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="font-mono text-amber-300 font-medium">nombre_servicio</span>
              <span className="text-slate-400 text-right">Ej: Corte Clásico</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="font-mono text-amber-300 font-medium">costo_unitario</span>
              <span className="text-slate-400 text-right">Ej: 4.50</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="font-mono text-amber-300 font-medium">precio_venta</span>
              <span className="text-slate-400 text-right">Ej: 20.00</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="font-mono text-amber-300 font-medium">unidades_vendidas</span>
              <span className="text-slate-400 text-right">Ej: 154</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                const csvContent = "sku,nombre_servicio,costo_unitario,precio_venta,unidades_vendidas\n" +
                  "BC-001,Corte Degradado Fino,4.00,22.00,320\n" +
                  "BC-002,Recorte Barba Navaja,2.50,15.00,280\n" +
                  "BC-003,Facial Exfoliante Mentol,6.00,30.00,110\n" +
                  "BC-004,Combo Magnate Total,10.00,50.00,190\n" +
                  "BC-005,Tinte Canas Express,7.00,25.00,60\n" +
                  "BC-006,Locion Barba Esencial,5.00,18.00,45\n";
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", "barberia_abc_plantilla.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="w-full text-center py-2 rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-white transition-colors text-slate-300 font-medium border border-slate-800/80 text-xs"
            >
              Descargar Plantilla CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
