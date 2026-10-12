'use client';

import React from 'react';
import { Printer, ZoomIn, ZoomOut, Maximize2, LayoutGrid, Compass } from 'lucide-react';

interface PrintControlsProps {
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  viewMode: 'both' | 'flip';
  onViewModeChange: (mode: 'both' | 'flip') => void;
  onPrint?: () => void;
  extraActions?: React.ReactNode;
}

export default function PrintControls({
  zoom,
  onZoomChange,
  showGuides,
  onToggleGuides,
  viewMode,
  onViewModeChange,
  onPrint,
  extraActions,
}: PrintControlsProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="no-print w-full max-w-4xl bg-white border border-gray-200 rounded-xl shadow-sm p-3 flex flex-wrap items-center justify-between gap-3">
      {/* View Mode & Safety Guides */}
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
          <button
            type="button"
            onClick={() => onViewModeChange('both')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${viewMode === 'both'
              ? 'bg-white text-navy shadow-sm'
              : 'text-gray-500 hover:text-navy'
              }`}
          >
            Side by Side
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('flip')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${viewMode === 'flip'
              ? 'bg-white text-navy shadow-sm'
              : 'text-gray-500 hover:text-navy'
              }`}
          >
            Flip View
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleGuides}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${showGuides
            ? 'bg-crimson/10 border-crimson text-crimson'
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          title="Toggle 3mm inner safe print margins"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{showGuides ? 'Hide Guides' : 'Safety Guides'}</span>
        </button>
      </div>

      {/* Zoom Controller */}
      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(1, Number((zoom - 0.25).toFixed(2))))}
          disabled={zoom <= 1}
          className="p-1 rounded text-gray-900 hover:text-navy disabled:opacity-40"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-mono font-semibold text-gray-700 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(2.5, Number((zoom + 0.25).toFixed(2))))}
          disabled={zoom >= 2.5}
          className="p-1 rounded text-gray-900 hover:text-navy disabled:opacity-40"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onZoomChange(1)}
          className="ml-1 p-1 text-[10px] text-gray-500 hover:text-navy font-semibold"
          title="Reset Zoom to 150%"
        >
          Reset
        </button>
      </div>

      {/* Print & Extra Action Buttons */}
      <div className="flex items-center gap-2">
        {extraActions}

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-black bg-white hover:bg-crimson rounded-lg shadow transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print PVC Tray</span>
        </button>
      </div>
    </div>
  );
}
