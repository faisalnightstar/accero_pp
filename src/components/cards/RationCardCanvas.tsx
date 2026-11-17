'use client';

import React from 'react';
import {
  RationCardData,
  RationFamilyMember,
  formatRationCardNumber,
  mapToRationCardData,
} from '@/types/cards';
import CardQrCode from '@/components/cards/CardQrCode';
import {
  AshokaEmblem,
  NfsaWheatEmblem,
  OnorcBadge,
  RationGuillocheSecurity,
} from '@/components/cards/Emblems';
import { User, Phone, Globe, ShieldCheck, Home } from 'lucide-react';

export interface RationCardCanvasProps {
  data: Partial<RationCardData>;
  side?: 'front' | 'back' | 'sheet';
  memberPage?: number;
  className?: string;
}

const REGIONAL_FONT =
  "'Hind', 'Noto Sans Devanagari', 'Mukta', 'Noto Sans Gurmukhi', 'Noto Sans Gujarati', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Kannada', 'Noto Sans Bengali', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

interface CategoryTheme {
  primary: string; // Header border / accent
  badgeBg: string; // Background for scheme stripe
  badgeText: string;
  pillBorder: string;
  englishLabel: string;
  regionalLabel: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  PHH: {
    primary: '#047857',
    badgeBg: 'linear-gradient(90deg, #065F46 0%, #047857 50%, #0D9488 100%)',
    badgeText: '#FFFFFF',
    pillBorder: '#34D399',
    englishLabel: 'PRIORITY HOUSEHOLD (PHH)',
    regionalLabel: 'पात्र गृहस्थी',
  },
  AAY: {
    primary: '#B45309',
    badgeBg: 'linear-gradient(90deg, #92400E 0%, #D97706 50%, #F59E0B 100%)',
    badgeText: '#FFFFFF',
    pillBorder: '#FCD34D',
    englishLabel: 'ANTYODAYA ANNA YOJANA (AAY)',
    regionalLabel: 'अंत्योदय अन्न योजना',
  },
  BPL: {
    primary: '#1D4ED8',
    badgeBg: 'linear-gradient(90deg, #1E40AF 0%, #1D4ED8 50%, #3B82F6 100%)',
    badgeText: '#FFFFFF',
    pillBorder: '#93C5FD',
    englishLabel: 'BELOW POVERTY LINE (BPL)',
    regionalLabel: 'गरीबी रेखा से नीचे',
  },
  APL: {
    primary: '#C2410C',
    badgeBg: 'linear-gradient(90deg, #9A3412 0%, #C2410C 50%, #EA580C 100%)',
    badgeText: '#FFFFFF',
    pillBorder: '#FDBA74',
    englishLabel: 'ABOVE POVERTY LINE (APL)',
    regionalLabel: 'सामान्य परिवार',
  },
  WHITE: {
    primary: '#475569',
    badgeBg: 'linear-gradient(90deg, #334155 0%, #475569 50%, #64748B 100%)',
    badgeText: '#FFFFFF',
    pillBorder: '#CBD5E1',
    englishLabel: 'NON-SUBSIDIZED WHITE CARD',
    regionalLabel: 'सफेद राशन कार्ड',
  },
};

export default function RationCardCanvas({
  data: rawData,
  side = 'front',
  memberPage = 1,
  className = '',
}: RationCardCanvasProps) {
  const data = mapToRationCardData(rawData);
  const theme = CATEGORY_THEMES[data.category] || CATEGORY_THEMES.PHH;
  const formattedRcNumber = formatRationCardNumber(data.rationCardNumber);

  /* -------------------------------------------------------------
   * 1. SHEET MODE: Dual Card Tray (Front Left, Back Right)
   * With automatic continuation trays for families > 5 members
   * ----------------------------------------------------------- */
  if (side === 'sheet') {
    const members = (data.familyMembers && data.familyMembers.length > 0) ? data.familyMembers : [];
    const membersPerPage = 5;
    const totalPages = Math.max(1, Math.ceil(members.length / membersPerPage));

    return (
      <div
        className={`w-full flex flex-col gap-4 ${className}`}
        style={{
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {/* Primary Tray: Front & Back (Page 1) */}
        <div className="w-full flex flex-row items-center justify-between gap-4 bg-gray-100 p-2 rounded-xl">
          <div className="w-1/2 h-full relative overflow-hidden bg-white shadow-sm border border-gray-200" style={{ aspectRatio: '85.60 / 53.98' }}>
            <RationCardFront data={data} theme={theme} formattedRcNumber={formattedRcNumber} />
          </div>
          <div className="w-1/2 h-full relative overflow-hidden bg-white shadow-sm border border-gray-200" style={{ aspectRatio: '85.60 / 53.98' }}>
            <RationCardBack data={data} theme={theme} formattedRcNumber={formattedRcNumber} memberPage={1} />
          </div>
        </div>

        {/* Continuation Tray for large families (> 5 members) */}
        {totalPages > 1 &&
          Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map((pageNum) => (
            <div
              key={`continuation-tray-p${pageNum}`}
              className="w-full flex flex-row items-center justify-between gap-4 bg-gray-100 p-2 rounded-xl"
            >
              <div className="w-1/2 h-full relative overflow-hidden bg-white shadow-sm border border-gray-200" style={{ aspectRatio: '85.60 / 53.98' }}>
                <RationCardFront data={data} theme={theme} formattedRcNumber={formattedRcNumber} />
              </div>
              <div className="w-1/2 h-full relative overflow-hidden bg-white shadow-sm border border-gray-200" style={{ aspectRatio: '85.60 / 53.98' }}>
                <RationCardBack data={data} theme={theme} formattedRcNumber={formattedRcNumber} memberPage={pageNum} />
              </div>
            </div>
          ))}
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 2. BACK SIDE (Upright, high-contrast family details & address)
   * ----------------------------------------------------------- */
  if (side === 'back') {
    return (
      <div
        className={`w-full h-full relative overflow-hidden select-none bg-white font-sans ${className}`}
        style={{
          aspectRatio: '85.60 / 53.98',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        <RationCardBack data={data} theme={theme} formattedRcNumber={formattedRcNumber} memberPage={memberPage} />
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 3. FRONT SIDE (Default)
   * ----------------------------------------------------------- */
  return (
    <div
      className={`w-full h-full relative overflow-hidden select-none bg-white font-sans ${className}`}
      style={{
        aspectRatio: '85.60 / 53.98',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <RationCardFront data={data} theme={theme} formattedRcNumber={formattedRcNumber} />
    </div>
  );
}

/* =====================================================================
 * FRONT SIDE COMPONENT
 * ===================================================================== */
interface FrontProps {
  data: RationCardData;
  theme: CategoryTheme;
  formattedRcNumber: string;
}

function RationCardFront({ data, theme, formattedRcNumber }: FrontProps) {
  const regionalHeader = data.departmentHeaderRegional || 'खाद्य एवं नागरिक आपूर्ति विभाग';
  const englishHeader = data.departmentHeaderEnglish || 'Food, Civil Supplies & Consumer Affairs Department';

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#FBFDFB]">
      {/* Subtle Security Guilloche Background */}
      <RationGuillocheSecurity opacity={0.08} color={theme.primary} />

      {/* Decorative Gold & Green Top Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#F59E0B] via-[#047857] to-[#1E3A8A]" />

      {/* ----------------- TOP HEADER AREA (3% - 20.5%) ----------------- */}
      <div className="absolute top-[3%] left-[3%] right-[3%] h-[17.5%] flex items-center justify-between z-10 pointer-events-none">
        {/* Left: Ashoka Lion Capital Emblem */}
        <div className="h-full flex items-center shrink-0">
          <AshokaEmblem className="h-[88%] w-auto" fill="#1E293B" />
        </div>

        {/* Center: Department Title & Government Branding */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-1.5 overflow-hidden">
          <span
            className="text-[8.5px] sm:text-[9.8px] font-extrabold text-[#9A3412] leading-tight tracking-wide whitespace-nowrap truncate max-w-full"
            style={{ fontFamily: REGIONAL_FONT }}
          >
            {regionalHeader}
          </span>
          <span className="text-[6.2px] sm:text-[7.2px] font-bold text-[#065F46] leading-tight tracking-tight uppercase whitespace-nowrap truncate max-w-full">
            {englishHeader}
          </span>
          <span className="text-[5px] sm:text-[5.8px] font-semibold text-gray-500 leading-none mt-0.5 whitespace-nowrap truncate max-w-full">
            National Food Security Act (NFSA) • Government of India
          </span>
        </div>

        {/* Right: NFSA & ONORC Crests */}
        <div className="h-full flex items-center gap-1 shrink-0">
          <NfsaWheatEmblem className="h-[82%] w-auto" />
          <OnorcBadge className="h-[82%] w-auto" />
        </div>
      </div>

      {/* ----------------- SCHEME & CATEGORY STRIPE (21.5% - 29%) ----------------- */}
      <div
        className="absolute top-[21.5%] left-0 right-0 h-[7.5%] flex items-center justify-between px-[4%] text-white shadow-2xs z-10 pointer-events-none"
        style={{ background: theme.badgeBg }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[7.5px] sm:text-[8.5px] font-black tracking-wide leading-none">
            {theme.englishLabel}
          </span>
          <span
            className="text-[7.5px] sm:text-[8.5px] font-bold opacity-90 leading-none"
            style={{ fontFamily: REGIONAL_FONT }}
          >
            ({theme.regionalLabel})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[6.5px] sm:text-[7.5px] font-bold uppercase tracking-wider bg-white/20 px-1 py-0.5 rounded-[2px] leading-none">
            {data.state || 'INDIA'}
          </span>
          <span className="text-[6.5px] sm:text-[7.5px] font-bold bg-[#F59E0B] text-black px-1 py-0.5 rounded-[2px] leading-none">
            {data.status || 'ACTIVE'}
          </span>
        </div>
      </div>

      {/* ----------------- HEAD OF FAMILY PHOTOGRAPH (Left Box) ----------------- */}
      <div className="absolute left-[3.5%] top-[31.5%] w-[23.5%] h-[47%] rounded-[2px] border-2 border-[#CBD5E1] bg-white shadow-2xs overflow-hidden flex items-center justify-center z-10">
        {data.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.photoUrl}
            alt={data.headOfFamily || 'Head of Family'}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-1">
            <User className="w-7 h-7 opacity-60 text-gray-400" />
            <span className="text-[5.5px] font-bold uppercase tracking-wider text-gray-500 mt-0.5 text-center leading-tight">
              मुखिया फोटो
            </span>
          </div>
        )}
      </div>

      {/* ----------------- MAIN INFORMATION GRID (Center Details) ----------------- */}
      <div
        className="absolute left-[29.5%] top-[30.5%] w-[47.5%] h-[53%] flex flex-col justify-between text-[#0F172A] z-10 select-text"
        style={{ fontFamily: REGIONAL_FONT }}
      >
        {/* Ration Card Number */}
        <div className="flex flex-col border-b border-gray-200 pb-0.5">
          <span className="text-[6px] sm:text-[6.8px] font-bold text-gray-500 uppercase leading-none">
            राशन कार्ड संख्या / Ration Card No.
          </span>
          <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-[#B45309] leading-tight font-mono">
            {formattedRcNumber}
          </span>
        </div>

        {/* Head of Family */}
        <div className="grid grid-cols-[38%_62%] items-center leading-tight py-[0.5px]">
          <span className="text-[6.8px] sm:text-[7.5px] font-bold text-gray-600">
            मुखिया का नाम:
          </span>
          <span className="text-[7.5px] sm:text-[8.5px] font-bold text-black truncate">
            {data.headOfFamilyRegional || data.headOfFamily}
            {data.headOfFamilyRegional && data.headOfFamily && (
              <span className="text-[6.5px] font-normal text-gray-600 block">
                {data.headOfFamily}
              </span>
            )}
          </span>
        </div>

        {/* Father / Spouse Name */}
        <div className="grid grid-cols-[38%_62%] items-center leading-tight py-[0.5px]">
          <span className="text-[6.8px] sm:text-[7.5px] font-bold text-gray-600">
            पिता / पति का नाम:
          </span>
          <span className="text-[7px] sm:text-[7.8px] font-semibold text-black truncate">
            {data.fatherOrSpouseNameRegional || data.fatherOrSpouseName || '-'}
          </span>
        </div>

        {/* Fair Price Shop (FPS) */}
        <div className="grid grid-cols-[38%_62%] items-center leading-tight py-[0.5px]">
          <span className="text-[6.8px] sm:text-[7.5px] font-bold text-gray-600">
            उचित दर विक्रेता:
          </span>
          <span className="text-[6.8px] sm:text-[7.5px] font-medium text-black truncate">
            <span className="font-bold text-[#047857]">{data.fpsCode || '10423001'}</span> - {data.fpsName || 'Sahkari Bhandar'}
          </span>
        </div>

        {/* Gas Connection & Total Members Row */}
        <div className="grid grid-cols-2 gap-1 py-[0.5px] items-center">
          <div className="flex items-center gap-1">
            <span className="text-[6.5px] sm:text-[7px] font-bold text-gray-600">
              गैस:
            </span>
            <span className="text-[6.5px] sm:text-[7px] font-semibold text-[#047857]">
              {data.gasConnectionStatus || 'Yes (PMUY)'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[6.5px] sm:text-[7px] font-bold text-gray-600">
              कुल सदस्य:
            </span>
            <span className="text-[7px] sm:text-[7.5px] font-bold bg-[#E2E8F0] text-[#1E293B] px-1 rounded-[2px] leading-tight">
              {data.memberCount || data.familyMembers?.length || 4} सदस्य
            </span>
          </div>
        </div>
      </div>

      {/* ----------------- QR CODE SECTION (Lower Right) ----------------- */}
      <div className="absolute right-[3.5%] top-[41%] w-[21%] h-[36%] p-0.5 bg-white border border-[#CBD5E1] rounded-[2px] shadow-2xs flex items-center justify-center z-10">
        <CardQrCode
          value={data.qrPayload || `https://nfsa.gov.in/portal/rc?id=${encodeURIComponent(data.rationCardNumber)}`}
          size={110}
          level="M"
          className="w-full h-full object-contain"
        />
      </div>

      {/* ----------------- BOTTOM BAR STRIP (86% - 100%) ----------------- */}
      <div className="absolute left-0 right-0 bottom-0 h-[14%] bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white flex items-center justify-between px-[3.5%] z-10 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-[#34D399]" />
          <span className="text-[6.5px] sm:text-[7.5px] font-bold tracking-wide">
            एक राष्ट्र, एक राशन कार्ड (ONORC)
          </span>
        </div>
        <div className="flex items-center gap-2 text-[6px] sm:text-[6.8px] text-gray-300">
          <span className="flex items-center gap-0.5">
            <Phone className="w-2.5 h-2.5 text-[#F59E0B]" />
            टोल फ्री: {data.helplineNumber || '1967'}
          </span>
          <span className="flex items-center gap-0.5">
            <Globe className="w-2.5 h-2.5 text-[#60A5FA]" />
            {data.websiteUrl || 'nfsa.gov.in'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
 * BACK SIDE COMPONENT (Family Members Table & Address)
 * ===================================================================== */
interface BackProps {
  data: RationCardData;
  theme: CategoryTheme;
  formattedRcNumber: string;
  memberPage?: number;
}

function RationCardBack({ data, theme, formattedRcNumber, memberPage = 1 }: BackProps) {
  const members: RationFamilyMember[] = (data.familyMembers && data.familyMembers.length > 0)
    ? data.familyMembers
    : [
        { slNo: 1, name: data.headOfFamily, relation: 'Self (Head)', gender: 'Female', age: 42, uidLinked: true },
        { slNo: 2, name: data.fatherOrSpouseName || 'Spouse', relation: 'Spouse', gender: 'Male', age: 46, uidLinked: true },
        { slNo: 3, name: 'Aman Kumar', relation: 'Son', gender: 'Male', age: 18, uidLinked: true },
        { slNo: 4, name: 'Priya Kumari', relation: 'Daughter', gender: 'Female', age: 15, uidLinked: true },
      ];

  const membersPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(members.length / membersPerPage));
  const currentPage = Math.min(Math.max(1, memberPage), totalPages);
  const startIndex = (currentPage - 1) * membersPerPage;
  const displayedMembers = members.slice(startIndex, startIndex + membersPerPage);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#FAFCFB]">
      {/* Subtle Background Pattern */}
      <RationGuillocheSecurity opacity={0.06} color={theme.primary} />

      {/* Decorative Top Accent Stripe */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#1E3A8A] via-[#047857] to-[#F59E0B]" />

      {/* ----------------- TOP HEADER AREA (3% - 15%) ----------------- */}
      <div className="absolute top-[3%] left-[3%] right-[3%] h-[12%] flex items-center justify-between border-b border-gray-200 pb-0.5 z-10 pointer-events-none">
        <div className="flex items-center gap-1 min-w-0 flex-1 mr-2 overflow-hidden">
          <NfsaWheatEmblem className="h-3.5 w-3.5 shrink-0" />
          <div className="flex items-baseline gap-1 min-w-0 truncate">
            <span
              className="text-[7.8px] sm:text-[8.8px] font-extrabold text-[#065F46] tracking-wide whitespace-nowrap truncate"
              style={{ fontFamily: REGIONAL_FONT }}
            >
              पारिवारिक सदस्यों का विवरण
            </span>
            <span className="text-[5.8px] sm:text-[6.5px] font-bold text-gray-500 uppercase whitespace-nowrap truncate">
              / Family Details
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[6.2px] sm:text-[7.2px] font-mono font-bold text-[#B45309] whitespace-nowrap">
            RC: {formattedRcNumber}
          </span>
          <span className="text-[5.5px] sm:text-[6.5px] font-bold bg-[#E2E8F0] text-[#1E293B] px-1 py-0.5 rounded-[2px] whitespace-nowrap">
            {totalPages > 1 ? `पृष्ठ ${currentPage}/${totalPages} (कुल: ${members.length})` : `कुल: ${members.length}`}
          </span>
        </div>
      </div>

      {/* ----------------- FAMILY MEMBERS MICRO-TABLE (16% - 59.5%) ----------------- */}
      <div className="absolute left-[3.5%] right-[3.5%] top-[16.5%] h-[43%] overflow-hidden z-10 select-text">
        <table className="w-full border-collapse text-[6.5px] sm:text-[7.2px] leading-tight">
          <thead>
            <tr className="bg-[#0F172A] text-white font-bold">
              <th className="py-0.5 px-1 text-center w-[6%] border border-gray-600">#</th>
              <th className="py-0.5 px-1 text-left w-[34%] border border-gray-600">
                सदस्य का नाम (Name)
              </th>
              <th className="py-0.5 px-1 text-left w-[24%] border border-gray-600">
                संबंध (Relation)
              </th>
              <th className="py-0.5 px-1 text-center w-[12%] border border-gray-600">
                लिंग
              </th>
              <th className="py-0.5 px-1 text-center w-[10%] border border-gray-600">
                आयु
              </th>
              <th className="py-0.5 px-1 text-center w-[14%] border border-gray-600">
                आधार
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedMembers.map((m, idx) => (
              <tr
                key={m.memberId || idx}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F1F5F9]'}
              >
                <td className="py-[1px] px-1 text-center font-bold text-gray-600 border border-gray-300">
                  {m.slNo ?? (startIndex + idx + 1)}
                </td>
                <td className="py-[1px] px-1 font-semibold text-black truncate border border-gray-300">
                  {m.nameRegional || m.name}
                  {m.nameRegional && m.name && (
                    <span className="text-[5.5px] font-normal text-gray-500 ml-1">
                      ({m.name})
                    </span>
                  )}
                </td>
                <td className="py-[1px] px-1 text-gray-700 truncate border border-gray-300">
                  {m.relationRegional || m.relation}
                </td>
                <td className="py-[1px] px-1 text-center text-gray-700 border border-gray-300">
                  {m.gender.charAt(0).toUpperCase()}
                </td>
                <td className="py-[1px] px-1 text-center text-gray-700 font-mono border border-gray-300">
                  {m.age}
                </td>
                <td className="py-[1px] px-1 text-center font-bold border border-gray-300">
                  {m.uidLinked ? (
                    <span className="text-[#047857] text-[6px]">सीडेड ✓</span>
                  ) : (
                    <span className="text-amber-600 text-[6px]">बाकी</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="text-right text-[5.8px] text-gray-500 italic mt-0.5 font-medium">
            सदस्य {startIndex + 1}–{Math.min(startIndex + membersPerPage, members.length)} of {members.length} {currentPage < totalPages ? `• शेष सदस्य पृष्ठ ${currentPage + 1} पर` : '• अंतिम पृष्ठ'}
          </div>
        )}
      </div>

      {/* ----------------- ADDRESS & FPS DETAILS (60.5% - 85.5%) ----------------- */}
      <div className="absolute left-[3.5%] right-[3.5%] top-[61%] h-[24.5%] flex gap-2 z-10 select-text">
        {/* Full Address Box */}
        <div className="w-[66%] h-full p-1 bg-white border border-gray-200 rounded-[2px] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[6.5px] font-bold text-[#065F46] uppercase leading-none">
            <Home className="w-2.5 h-2.5" />
            <span>स्थायी पता / Full Residential Address:</span>
          </div>
          <p
            className="text-[6.5px] sm:text-[7.2px] text-gray-800 font-medium leading-tight line-clamp-3 select-text"
            style={{ fontFamily: REGIONAL_FONT }}
          >
            {data.addressRegional || data.address}
          </p>
          <div className="flex items-center justify-between text-[5.8px] sm:text-[6.5px] text-gray-500 font-semibold border-t border-gray-100 pt-0.5">
            <span>जिला: {data.district || 'Patna'}</span>
            <span>राज्य: {data.state || 'Bihar'}</span>
            <span>जारी तिथि: {data.issueDate || '12/04/2021'}</span>
          </div>
        </div>

        {/* FPS Dealer & Verification Box */}
        <div className="w-[34%] h-full p-1 bg-white border border-gray-200 rounded-[2px] shadow-2xs flex flex-col justify-between">
          <div className="text-[6.2px] font-bold text-[#B45309] uppercase leading-none">
            उचित दर दुकान विवरण
          </div>
          <div className="text-[6px] sm:text-[6.8px] text-gray-700 leading-tight">
            <div className="truncate font-semibold text-black">
              {data.fpsName || 'Sahkari Bhandar'}
            </div>
            <div className="text-[5.8px] text-gray-500 font-mono">
              कोड: {data.fpsCode || '10423001'}
            </div>
            <div className="text-[5.5px] text-[#047857] font-bold mt-0.5">
              ONORC: {data.onorcEligible !== false ? 'स्वीकृत (Eligible)' : 'सीमित'}
            </div>
          </div>
          <div className="text-[5.5px] text-gray-400 text-right">
            वैधता: {data.validUpto || 'Life Time'}
          </div>
        </div>
      </div>

      {/* ----------------- BOTTOM STATUTORY FOOTER (86% - 100%) ----------------- */}
      <div className="absolute left-0 right-0 bottom-0 h-[14%] bg-[#0F172A] text-white flex items-center justify-between px-[3.5%] z-10 pointer-events-none">
        <span
          className="text-[5.5px] sm:text-[6.5px] text-gray-300 leading-tight truncate min-w-0 mr-2"
          style={{ fontFamily: REGIONAL_FONT }}
        >
          राष्ट्रीय खाद्य सुरक्षा अधिनियम (NFSA) खाद्यान्न वितरण हेतु अधिकृत।
        </span>
        <div className="flex items-center gap-1.5 text-[5.8px] sm:text-[6.6px] text-gray-300 shrink-0">
          <span className="text-[#34D399] font-bold whitespace-nowrap">हेल्पलाइन: 1967</span>
          <span className="text-gray-500">•</span>
          <span className="whitespace-nowrap">nfsa.gov.in</span>
        </div>
      </div>
    </div>
  );
}
