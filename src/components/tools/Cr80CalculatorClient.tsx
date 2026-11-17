'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  calculateCr80Dimensions,
  CR80_STANDARD,
  CR80_DPI_PRESETS,
  DpiCalculationResult,
} from '@/lib/print/cr80Calculator';
import {
  Sliders,
  Copy,
  Check,
  RotateCcw,
  Printer,
  Maximize2,
  Info,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Cr80CalculatorClient() {
  const [dpi, setDpi] = useState<number>(300);
  const [bleedMm, setBleedMm] = useState<number>(0);
  const [unit, setUnit] = useState<'px' | 'mm' | 'in' | 'cm'>('px');
  const [copied, setCopied] = useState<boolean>(false);

  const calc: DpiCalculationResult = useMemo(() => {
    try {
      return calculateCr80Dimensions(dpi, bleedMm);
    } catch {
      return calculateCr80Dimensions(300, 0);
    }
  }, [dpi, bleedMm]);

  const copyToClipboard = () => {
    const textToCopy = `/* ISO/IEC 7810 ID-1 (CR80) Specs at ${calc.dpi} DPI */
Card Width: ${calc.cardWidthPx}px (${calc.cardWidthMm}mm / ${calc.cardWidthInches}in)
Card Height: ${calc.cardHeightPx}px (${calc.cardHeightMm}mm / ${calc.cardHeightInches}in)
Bleed: ${calc.bleedMm}mm (${calc.bleedPx}px)
Total Canvas Width: ${calc.totalWidthPx}px (${calc.totalWidthMm}mm)
Total Canvas Height: ${calc.totalHeightPx}px (${calc.totalHeightMm}mm)
Corner Radius: ${calc.cornerRadiusPx}px (${CR80_STANDARD.CORNER_RADIUS_MM}mm)`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setDpi(300);
    setBleedMm(0);
    setUnit('px');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Control Bar */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ISO/IEC 7810 ID-1 Calibrated
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Interactive CR80 PVC Dimension Calculator
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Real-time physical millimeter to digital pixel conversion engine for ID card printing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copied Specs!' : 'Copy Dimensions'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            icon={<RotateCcw className="w-4 h-4" />}
            title="Reset to 300 DPI defaults"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset DPI Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Resolution Preset (DPI)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CR80_DPI_PRESETS.map((preset) => (
                <button
                  key={preset.dpi}
                  type="button"
                  onClick={() => setDpi(preset.dpi)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    dpi === preset.dpi
                      ? 'border-[#1D3557] bg-[#1D3557]/5 ring-2 ring-[#1D3557]/20 text-[#1D3557] font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-sm font-semibold">{preset.dpi} DPI</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">{preset.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom DPI Slider & Input */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="custom-dpi-input" className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-slate-500" /> Custom DPI Value
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="custom-dpi-input"
                  type="number"
                  min="72"
                  max="2400"
                  step="1"
                  value={dpi}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 72 && val <= 2400) {
                      setDpi(val);
                    }
                  }}
                  className="w-20 px-2 py-1 text-right text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D3557] focus:outline-none bg-white"
                />
                <span className="text-xs text-slate-500 font-medium">DPI</span>
              </div>
            </div>
            <input
              type="range"
              min="72"
              max="1200"
              step="6"
              value={dpi}
              onChange={(e) => setDpi(parseInt(e.target.value, 10))}
              className="w-full accent-[#1D3557] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>72 (Web)</span>
              <span>300 (Standard)</span>
              <span>600 (High-Res)</span>
              <span>1200 (Ultra)</span>
            </div>
          </div>

          {/* Bleed Margin Controls */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-500" />
                Printer Trim Bleed Margin
              </label>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                +{bleedMm} mm per edge
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {[0, 1, 2, 3].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBleedMm(val)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium text-center transition-all ${
                    bleedMm === val
                      ? 'border-[#8B1E2D] bg-[#8B1E2D]/5 text-[#8B1E2D] font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {val === 0 ? 'None (0mm)' : `+${val}mm`}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500">
              {bleedMm === 0
                ? 'Standard borderless tray printing (direct fit on 85.60 × 53.98 mm pre-cut PVC blanks).'
                : `Adds ${bleedMm * 2}mm (${calc.bleedPx * 2}px) total canvas allowance to prevent white edges during knife cutter or thermal die trimming.`}
            </p>
          </div>

          {/* Unit Toggle */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Primary Display Units
            </label>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              {(['px', 'mm', 'in', 'cm'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    unit === u
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {u === 'px' ? 'Pixels (px)' : u === 'mm' ? 'Millimeters (mm)' : u === 'in' ? 'Inches (in)' : 'Centimeters (cm)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Preview & Calculated Metrics */}
        <div className="lg:col-span-7 space-y-6">
          {/* Visual SVG Card Preview */}
          <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col items-center justify-center">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md">
              {/* Outer Bleed Container if bleed > 0 */}
              <div
                className={`transition-all duration-300 relative rounded-2xl p-3 ${
                  bleedMm > 0 ? 'border-2 border-dashed border-amber-400/80 bg-amber-500/10' : 'border border-slate-700/50'
                }`}
              >
                {bleedMm > 0 && (
                  <span className="absolute -top-3 left-4 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                    Outer Bleed: +{calc.bleedMm}mm ({calc.totalWidthPx} × {calc.totalHeightPx}px)
                  </span>
                )}

                {/* Simulated Physical CR80 Card */}
                <div
                  className="w-full aspect-[85.6/53.98] bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 rounded-[14px] border border-slate-600 shadow-2xl relative p-4 sm:p-5 flex flex-col justify-between select-none"
                  style={{
                    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.15)',
                  }}
                >
                  {/* Card Header & Chip */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-7 rounded bg-gradient-to-tr from-amber-400 to-amber-200 border border-amber-500/50 flex items-center justify-center shadow-inner">
                        <div className="w-5 h-3 border border-amber-600/40 rounded-sm"></div>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-300 tracking-wide uppercase">
                        CR80 PVC
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {calc.dpi} DPI
                    </span>
                  </div>

                  {/* Card Middle Mock Info */}
                  <div className="grid grid-cols-12 gap-3 items-center my-2">
                    <div className="col-span-4 aspect-square rounded-lg bg-slate-700/60 border border-slate-600/60 flex items-center justify-center text-slate-400 text-xs font-medium">
                      PHOTO
                    </div>
                    <div className="col-span-8 space-y-1.5">
                      <div className="h-2.5 bg-slate-700/70 rounded w-4/5"></div>
                      <div className="h-2 bg-slate-700/50 rounded w-full"></div>
                      <div className="h-2 bg-slate-700/50 rounded w-2/3"></div>
                    </div>
                  </div>

                  {/* Card Footer Dimensions Stamp */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-sky-400/90 border-t border-slate-700/70 pt-2">
                    <span>W: {calc.cardWidthPx}px ({calc.cardWidthMm}mm)</span>
                    <span>H: {calc.cardHeightPx}px ({calc.cardHeightMm}mm)</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Specifications Footnote */}
              <div className="mt-3 text-center text-xs text-slate-400">
                Physical standard: <span className="text-white font-medium">85.60 mm × 53.98 mm</span> (3.370″ × 2.125″) | Radius: <span className="text-white font-medium">3.18 mm</span>
              </div>
            </div>
          </div>

          {/* Metric Conversion Data Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Cut Width
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-900 block mt-0.5">
                {unit === 'px' ? `${calc.cardWidthPx} px` : unit === 'mm' ? `${calc.cardWidthMm} mm` : unit === 'in' ? `${calc.cardWidthInches}″` : `${(calc.cardWidthMm / 10).toFixed(2)} cm`}
              </span>
              <span className="text-[11px] text-slate-500">85.60 mm raw</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Cut Height
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-900 block mt-0.5">
                {unit === 'px' ? `${calc.cardHeightPx} px` : unit === 'mm' ? `${calc.cardHeightMm} mm` : unit === 'in' ? `${calc.cardHeightInches}″` : `${(calc.cardHeightMm / 10).toFixed(2)} cm`}
              </span>
              <span className="text-[11px] text-slate-500">53.98 mm raw</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Canvas with Bleed
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-900 block mt-0.5">
                {calc.totalWidthPx} × {calc.totalHeightPx}
              </span>
              <span className="text-[11px] text-slate-500">px at {calc.dpi} DPI</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Corner Radius
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-900 block mt-0.5">
                {calc.cornerRadiusPx} px
              </span>
              <span className="text-[11px] text-slate-500">3.18 mm ISO-1</span>
            </div>
          </div>

          {/* Quick Hardware Recommendation Banner */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-sm text-blue-900">
            <Printer className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-950">
                Recommended Printer Setup for {calc.dpi} DPI
              </p>
              <p className="text-xs text-blue-800 mt-1">
                {calc.dpi <= 150
                  ? 'Suitable for low-resolution raster drafting only. Use 300+ DPI for physical PVC card tray output.'
                  : calc.dpi === 300
                  ? 'Optimized for Epson L805 / L8050 / L850 and Canon G570 / G670 ID card trays with 0mm borderless margins.'
                  : calc.dpi === 600
                  ? 'Recommended for ultra-sharp micro-text and Devanagari regional language font rendering on high-DPI desktop trays.'
                  : 'Commercial dye-sublimation and retransfer thermal PVC card printers (Zebra, Evolis, Magicard, Fargo).'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
