'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Printer, FileText } from 'lucide-react';
import Cr80CardContainer from '@/components/cards/Cr80CardContainer';
import CardQrCode from '@/components/cards/CardQrCode';
import PrintControls from '@/components/cards/PrintControls';

export default function CardsShowcasePage() {
  const [zoom, setZoom] = useState<number>(1.5);
  const [showGuides, setShowGuides] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'both' | 'flip'>('both');

  // Sample demo card front
  const demoFront = (
    <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-slate-50 via-white to-slate-100 text-navy relative">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-burgundy flex items-center justify-center text-white text-[10px] font-bold">
            P
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold tracking-wide uppercase text-burgundy leading-none">
              PrintPortal Standard CR80
            </h4>
            <span className="text-[8px] text-gray-500 font-medium">
              ISO/IEC 7810 ID-1 (85.60 mm × 53.98 mm)
            </span>
          </div>
        </div>
        <span className="text-[9px] font-mono font-bold bg-steel-blue/10 text-steel-blue px-1.5 py-0.5 rounded">
          SAMPLE-001
        </span>
      </div>

      <div className="flex items-center gap-3 my-1">
        <div className="w-14 h-16 rounded border border-gray-300 bg-gray-100 flex items-center justify-center text-[9px] text-gray-400 font-medium">
          PHOTO
        </div>
        <div className="flex-1 space-y-1 text-[9px]">
          <div>
            <span className="text-gray-400 block text-[7px] uppercase font-semibold">
              Cardholder Name
            </span>
            <span className="font-bold text-navy uppercase text-[10px]">
              ABU FAISAL
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[7px] uppercase font-semibold">
              Father Name
            </span>
            <span className="font-medium text-gray-700 uppercase">
              MOHAMMAD FAISAL
            </span>
          </div>
          <div className="flex gap-4">
            <div>
              <span className="text-gray-400 block text-[7px] uppercase font-semibold">
                DOB
              </span>
              <span className="font-mono text-gray-700">15/08/1990</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[7px] uppercase font-semibold">
                Valid Thru
              </span>
              <span className="font-mono text-gray-700">PERMANENT</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <CardQrCode
            value="PRINT-PORTAL:ID=SAMPLE-001|NAME=ABU+FAISAL|STANDARD=CR80"
            size={52}
          />
          <span className="text-[6px] text-gray-400 font-mono mt-0.5">VERIFIED</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-1 flex items-center justify-between text-[7px] text-gray-500">
        <span>PVC Tray Precision Print Engine</span>
        <div className="w-20 h-4 border-b border-gray-400 text-center text-[6px] text-gray-400">
          Signature
        </div>
      </div>
    </div>
  );

  // Sample demo card back
  const demoBack = (
    <div className="w-full h-full p-4 flex flex-col justify-between bg-slate-100 text-navy relative">
      <div className="border-b border-gray-300 pb-1 flex justify-between items-center text-[8px] font-semibold text-gray-600">
        <span>SECURITY FEATURES & INSTRUCTIONS</span>
        <span className="font-mono text-[7px]">REV-2026</span>
      </div>

      <div className="space-y-1.5 text-[8px] text-gray-600 leading-relaxed my-1">
        <p>
          1. This card is formatted to ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm).
        </p>
        <p>
          2. Print directly via high-precision ID card printer trays (Evolis, Zebra, Fargo, Epson L805).
        </p>
        <p>
          3. If found, please return to the designated issuing authority or nearest branch office.
        </p>
      </div>

      <div className="border-t border-gray-300 pt-1 flex items-center justify-between">
        <div className="text-[7px] text-gray-500">
          <span>Support: support@printportal.in</span>
          <br />
          <span>Helpline: 1800-000-0000 (Toll Free)</span>
        </div>
        <div className="w-24 h-5 bg-white border border-gray-300 flex items-center justify-center font-mono text-[8px] tracking-widest text-gray-500">
          *SAMPLE-001*
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Navigation header (hidden during printing) */}
      <div className="no-print bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-gray-500 hover:text-navy hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-navy flex items-center gap-2">
                CR80 Vector Card Canvas & Print Studio
                <span className="bg-gold/20 text-gold border border-gold/40 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Phase 2 Engine
                </span>
              </h1>
              <p className="text-xs text-gray-500">
                Pixel-perfect ISO 7810 ID-1 (85.60 mm × 53.98 mm) Card Tray Printing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-gray-600 hover:text-navy px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main preview workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center gap-6">
        {/* Controls Toolbar */}
        <PrintControls
          zoom={zoom}
          onZoomChange={setZoom}
          showGuides={showGuides}
          onToggleGuides={() => setShowGuides(!showGuides)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Card Canvas Container */}
        <section className="w-full flex justify-center py-4">
          <Cr80CardContainer
            front={demoFront}
            back={demoBack}
            activeSide={viewMode}
            zoom={zoom}
            showGuides={showGuides}
          />
        </section>

        {/* Informational specs box (hidden during print) */}
        <div className="no-print max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-burgundy/10 text-burgundy shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-navy">Exact CR80 Calibration</h4>
              <p className="text-gray-500 mt-1">
                85.60 mm × 53.98 mm with 3.18 mm corner radius. Fits Evolis, Zebra, Fargo, and Epson PVC trays.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-steel-blue/10 text-steel-blue shrink-0">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-navy">Zero-Margin @page Rule</h4>
              <p className="text-gray-500 mt-1">
                Print preview locks browser margins to 0 mm, preventing tray clipping or multi-page overflow.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gold/20 text-navy shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-navy">Dynamic QR Synthesis</h4>
              <p className="text-gray-500 mt-1">
                Client-side 2x resolution vector QR code rendering with offline zero-latency guarantee.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
