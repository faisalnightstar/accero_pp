'use client';

import React from 'react';

/**
 * Clean Vector Indian National Emblem (Lion Capital of Ashoka)
 */
export function AshokaEmblem({
  className = 'w-8 h-10',
  fill = '#1D3557',
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 130"
      className={className}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Lion Capital of Ashoka Emblem"
    >
      {/* 3 Lions Heads and Crowns representation */}
      <path d="M50 8 C44 8 40 12 40 17 C40 21 43 24 45 26 C43 28 41 32 41 37 C41 45 46 50 50 52 C54 50 59 45 59 37 C59 32 57 28 55 26 C57 24 60 21 60 17 C60 12 56 8 50 8 Z" />
      {/* Left Lion */}
      <path d="M36 22 C31 22 27 26 27 31 C27 35 29 38 31 40 C28 43 26 47 26 53 C26 62 32 68 37 70 C39 67 40 62 40 57 C37 54 36 49 36 44 C36 40 38 37 39 35 C38 33 37 28 36 22 Z" />
      {/* Right Lion */}
      <path d="M64 22 C69 22 73 26 73 31 C73 35 71 38 69 40 C72 43 74 47 74 53 C74 62 68 68 63 70 C61 67 60 62 60 57 C63 54 64 49 64 44 C64 40 62 37 61 35 C62 33 63 28 64 22 Z" />
      {/* Central Base & Ashoka Chakra */}
      <rect x="20" y="74" width="60" height="12" rx="3" />
      <circle cx="50" cy="80" r="5" fill="#FFFFFF" />
      <circle cx="50" cy="80" r="1.5" fill={fill} />
      <circle cx="30" cy="80" r="3" fill="#FFFFFF" opacity="0.8" />
      <circle cx="70" cy="80" r="3" fill="#FFFFFF" opacity="0.8" />
      {/* Bell Lotus Pedestal */}
      <path d="M22 88 C30 98 70 98 78 88 L74 96 C65 102 35 102 26 96 Z" />
      {/* Satyameva Jayate Banner */}
      <rect x="15" y="104" width="70" height="7" rx="2" opacity="0.85" />
      <text
        x="50"
        y="110"
        textAnchor="middle"
        fontSize="6"
        fontWeight="bold"
        fill="#FFFFFF"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        सत्यमेव जयते
      </text>
    </svg>
  );
}

/**
 * Smart Card Gold Microchip Graphic
 */
export function SmartCardChip({
  className = 'w-10 h-8',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 50 40"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Smart Card Chip"
    >
      <rect x="2" y="2" width="46" height="36" rx="4" fill="#D4AF37" stroke="#997A15" strokeWidth="1" />
      {/* Inner Chip Contacts */}
      <path
        d="M2 14 H16 V26 H2 M48 14 H34 V26 H48 M16 2 V14 M34 2 V14 M16 38 V26 M34 38 V26 M16 14 H34 V26 H16 Z"
        fill="none"
        stroke="#806500"
        strokeWidth="1"
      />
      <rect x="20" y="16" width="10" height="8" rx="1.5" fill="#F4D35E" stroke="#806500" strokeWidth="0.8" />
    </svg>
  );
}

/**
 * Election Commission of India (ECI) Crest
 */
export function EciLogo({
  className = 'w-8 h-8',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Election Commission of India Logo"
    >
      <circle cx="30" cy="30" r="28" fill="#1D3557" />
      <circle cx="30" cy="30" r="24" fill="#FFFFFF" />
      <circle cx="30" cy="30" r="21" fill="#E63946" opacity="0.1" />
      {/* Ballot Box / Ashoka representation */}
      <rect x="22" y="22" width="16" height="16" rx="2" fill="#1D3557" />
      <path d="M26 26 L34 26 M30 22 V38" stroke="#FFFFFF" strokeWidth="1.5" />
      {/* ECI text */}
      <text
        x="30"
        y="46"
        textAnchor="middle"
        fontSize="6"
        fontWeight="extrabold"
        fill="#1D3557"
        fontFamily="sans-serif"
      >
        ECI
      </text>
    </svg>
  );
}

/**
 * Guilloche Security Background Pattern Overlay
 */
export function GuillochePattern({
  className = '',
  opacity = 0.08,
  strokeColor = '#1D3557',
}: {
  className?: string;
  opacity?: number;
  strokeColor?: string;
}) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <defs>
        <pattern id="guilloche-wave" width="60" height="30" patternUnits="userSpaceOnUse">
          <path
            d="M 0 15 Q 15 0 30 15 T 60 15 M 0 20 Q 15 5 30 20 T 60 20 M 0 10 Q 15 -5 30 10 T 60 10"
            fill="none"
            stroke={strokeColor}
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#guilloche-wave)" />
    </svg>
  );
}

/**
 * Smart Card Microchip Contact with Royal Blue Directional Arrow Pointer (Form 23A)
 */
export function RcSmartChipWithPointer({
  className = 'w-11 h-8',
}: {
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {/* Directional Arrow Pointer */}
      <svg
        viewBox="0 0 10 16"
        className="w-2.5 h-3.5 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points="10,0 0,8 10,16" fill="#2563EB" />
      </svg>

      {/* 8-Contact Gold Smart Card Microchip */}
      <svg
        viewBox="0 0 54 40"
        className="w-full h-full shrink-0 shadow-xs"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gold-chip-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <rect
          x="1"
          y="1"
          width="52"
          height="38"
          rx="5"
          fill="url(#gold-chip-grad)"
          stroke="#B45309"
          strokeWidth="1.2"
        />
        {/* Contact Separator Circuit Traces */}
        <path
          d="M 1 14 H 18 V 26 H 1 M 53 14 H 36 V 26 H 53 M 18 1 V 14 M 36 1 V 14 M 18 39 V 26 M 36 39 V 26 M 18 14 H 36 V 26 H 18 Z"
          fill="none"
          stroke="#92400E"
          strokeWidth="1.2"
        />
        <rect
          x="22"
          y="16"
          width="10"
          height="8"
          rx="2"
          fill="#FDE047"
          stroke="#92400E"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}

/**
 * Circular Header Badge Pill (e.g. NT in Cyan, State in Orange)
 */
export function RcCircleBadge({
  text,
  variant = 'cyan',
  className = '',
}: {
  text: string;
  variant?: 'cyan' | 'orange';
  className?: string;
}) {
  const bgClass =
    variant === 'cyan'
      ? 'bg-[#38BDF8] border-[#0284C7]'
      : 'bg-[#F59E0B] border-[#D97706]';

  return (
    <div
      className={`w-4 h-4 rounded-full flex items-center justify-center border font-bold text-[7.5px] text-black shadow-2xs leading-none shrink-0 ${bgClass} ${className}`}
    >
      <span>{text}</span>
    </div>
  );
}

/**
 * National Emblem with soft sky blue curved circular crest accent
 */
export function RcAshokaCrest({
  className = 'w-7 h-9',
}: {
  className?: string;
}) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Soft Blue Radial Background Crest */}
      <div
        className="absolute -inset-1 rounded-full opacity-60 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #BAE6FD 20%, #E0F2FE 70%, transparent 100%)',
        }}
      />
      <AshokaEmblem className="w-full h-full relative z-10" fill="#1E293B" />
    </div>
  );
}

