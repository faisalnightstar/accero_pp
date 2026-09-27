'use client';

import React from 'react';

interface StudioLayoutProps {
  header: React.ReactNode;
  form: React.ReactNode;
  preview: React.ReactNode;
  controls?: React.ReactNode;
}

export default function StudioLayout({
  header,
  form,
  preview,
  controls,
}: StudioLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-light flex flex-col">
      {/* Top Sticky Header */}
      <header className="no-print bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        {header}
      </header>

      {/* Main Dual-Pane Studio Workspace */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        {controls && <div className="no-print mb-4 w-full flex justify-center">{controls}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
          {/* Left Column: Form Editor (5 cols on wide, 6 on desktop) */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
            {form}
          </div>

          {/* Right Column: Sticky Live Card Canvas Preview (7 cols on wide, 6 on desktop) */}
          <div className="lg:col-span-6 xl:col-span-7 lg:sticky lg:top-24 flex flex-col items-center gap-4 order-1 lg:order-2">
            <div className="w-full flex flex-col items-center">
              {preview}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
