'use client';

import React, { useState } from 'react';
import { RotateCw, Eye } from 'lucide-react';

export interface Cr80CardContainerProps {
  front: React.ReactNode;
  back: React.ReactNode;
  activeSide?: 'front' | 'back' | 'both' | 'flip';
  zoom?: number; // 1 = 100% (324px), 1.5 = 150% (486px), 2 = 200% (648px)
  showGuides?: boolean;
  className?: string;
  frontRef?: React.RefObject<HTMLDivElement | null>;
  backRef?: React.RefObject<HTMLDivElement | null>;
}

export default function Cr80CardContainer({
  front,
  back,
  activeSide = 'both',
  zoom = 1.5,
  showGuides = false,
  className = '',
  frontRef,
  backRef,
}: Cr80CardContainerProps) {
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');

  // Base CR80 screen resolution at 1x: 324px × 204px (1.588 aspect ratio)
  // At 1.5x zoom (default studio preview): 486px × 306px
  // At 2x zoom: 648px × 408px
  const baseWidthPx = 324;
  const baseHeightPx = 204;
  const cardWidth = baseWidthPx * zoom;
  const cardHeight = baseHeightPx * zoom;

  const toggleFlip = () => {
    setCurrentSide((prev) => (prev === 'front' ? 'back' : 'front'));
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Screen Interactive Mode */}
      <div className="no-print w-full flex flex-col items-center">
        {activeSide === 'both' ? (
          /* Side-by-Side Mode */
          <div className="flex flex-wrap items-center justify-center gap-6">
            {/* Front Card */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-500">
                Front Side
              </span>
              <div
                ref={frontRef}
                className="cr80-canvas shadow-xl border border-gray-200 bg-white relative transition-all duration-200 select-none"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  borderRadius: `${3.18 * (zoom * 1.15)}mm`,
                }}
              >
                {showGuides && <CardSafetyGuides />}
                <div className="w-full h-full relative overflow-hidden">
                  {front}
                </div>
              </div>
            </div>

            {/* Back Card */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-500">
                Back Side
              </span>
              <div
                ref={backRef}
                className="cr80-canvas shadow-xl border border-gray-200 bg-white relative transition-all duration-200 select-none"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  borderRadius: `${3.18 * (zoom * 1.15)}mm`,
                }}
              >
                {showGuides && <CardSafetyGuides />}
                <div className="w-full h-full relative overflow-hidden">
                  {back}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Flipped Single Card Mode */
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleFlip}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-navy bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5 text-crimson" />
                Flip to {currentSide === 'front' ? 'Back' : 'Front'}
              </button>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Showing {currentSide.toUpperCase()}
              </span>
            </div>

            <div
              ref={currentSide === 'front' ? frontRef : backRef}
              className="cr80-canvas shadow-2xl border border-gray-200 bg-white relative transition-transform duration-300 select-none"
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                borderRadius: `${3.18 * (zoom * 1.15)}mm`,
              }}
            >
              {showGuides && <CardSafetyGuides />}
              <div className="w-full h-full relative overflow-hidden">
                {currentSide === 'front' ? front : back}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Mode Containers (Single Page Side-by-Side: Front on Left, Back on Right) */}
      <div className="hidden print:block w-full">
        <div className="cr80-print-tray-row">
          {/* Slot 1: Front Card (85.60mm x 53.98mm) */}
          <div className="cr80-print-card-slot">
            <div className="w-[85.6mm] h-[53.98mm] relative overflow-hidden bg-white">
              {front}
            </div>
          </div>

          {/* Slot 2: Back Card (85.60mm x 53.98mm) */}
          <div className="cr80-print-card-slot">
            <div className="w-[85.6mm] h-[53.98mm] relative overflow-hidden bg-white">
              {back}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Visual 3mm inner safety guidelines for operator alignment inspection */
function CardSafetyGuides() {
  return (
    <div
      className="absolute inset-[3mm] border border-dashed border-crimson/30 pointer-events-none z-50 flex items-center justify-center"
      title="3mm Inner Safety Margin (Elements inside this boundary are safe from tray edge clipping)"
    >
      <span className="absolute top-1 left-1 text-[7px] text-crimson/50 font-mono">
        3mm Safe Zone
      </span>
    </div>
  );
}
