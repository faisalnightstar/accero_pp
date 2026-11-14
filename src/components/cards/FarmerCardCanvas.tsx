'use client';

import React from 'react';
import {
  FarmerCardData,
  formatFarmerId,
  maskAadhaarNumber,
  formatFarmerAddress,
} from '@/types/cards';
import { getFarmerLanguageConfig, FarmerLanguageConfig } from '@/lib/farmerLanguages';
import CardQrCode from '@/components/cards/CardQrCode';
import { AgriStackLogo, RcAshokaCrest } from '@/components/cards/Emblems';
import { User, Phone, Globe } from 'lucide-react';

export interface FarmerCardCanvasProps {
  data: FarmerCardData;
  side?: 'front' | 'back' | 'sheet';
  className?: string;
}

const REGIONAL_FONT =
  "'Hind', 'Noto Sans Devanagari', 'Mukta', 'Noto Sans Gurmukhi', 'Noto Sans Gujarati', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Kannada', 'Noto Sans Bengali', 'Noto Sans Oriya', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export default function FarmerCardCanvas({
  data,
  side = 'front',
  className = '',
}: FarmerCardCanvasProps) {
  const frontAsset = '/assets/farmer/farmer-card-front.png';
  const backAsset = '/assets/farmer/farmer-card-back.png';

  const langConfig = getFarmerLanguageConfig(data.language);

  const formattedId = formatFarmerId(data.farmerId) || '4256 177 6703';
  const displayAadhaar = data.maskAadhaar === false
    ? (data.aadhaarNumber || '411921789250')
    : maskAadhaarNumber(data.aadhaarNumber || '411921789250', false);

  const qrPayload =
    data.qrPayload ||
    (data.farmerId
      ? `https://rjfr.agristack.gov.in/verify?id=${encodeURIComponent(data.farmerId.replace(/\s+/g, ''))}`
      : 'https://rjfr.agristack.gov.in');

  const fullAddressText = formatFarmerAddress(data.address) ||
    'S/O: Keshariya, jatav muhalla, house no., Dahwa, Bharatpur, Rajasthan - 321201';

  const landRecords = data.landRecords && data.landRecords.length > 0
    ? data.landRecords
    : [
      { khata: '10', khasra: '218', area: '0.000833' },
      { khata: '10', khasra: '235', area: '0.010833' },
      { khata: '11', khasra: '32', area: '0.022917' },
      { khata: '10', khasra: '196', area: '0.023333' },
      { khata: '10', khasra: '220', area: '0.024583' },
      { khata: '11', khasra: '33', area: '0.025' },
    ];

  /* -------------------------------------------------------------
   * 1. SHEET MODE: Side-by-side Dual Cards (Front on Left, Back on Right)
   * ----------------------------------------------------------- */
  if (side === 'sheet') {
    return (
      <div
        className={`w-full h-full flex flex-row items-center justify-between gap-4 bg-gray-100 p-2 ${className}`}
        style={{
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        <div className="w-1/2 h-full relative overflow-hidden bg-white shadow-sm border border-gray-200">
          <FarmerCardFront
            data={data}
            langConfig={langConfig}
            frontAsset={frontAsset}
            formattedId={formattedId}
            displayAadhaar={displayAadhaar}
            qrPayload={qrPayload}
          />
        </div>
        <div className="w-1/2 h-full relative overflow-hidden bg-white shadow-sm border border-gray-200">
          <FarmerCardBack
            data={data}
            langConfig={langConfig}
            backAsset={backAsset}
            fullAddressText={fullAddressText}
            landRecords={landRecords}
          />
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 2. BACK SIDE (Rotated 180° background, upright readable content)
   * ----------------------------------------------------------- */
  if (side === 'back') {
    return (
      <div
        className={`w-full h-full relative overflow-hidden select-none bg-white font-sans ${className}`}
        style={{
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        <FarmerCardBack
          data={data}
          langConfig={langConfig}
          backAsset={backAsset}
          fullAddressText={fullAddressText}
          landRecords={landRecords}
        />
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 3. FRONT SIDE (Standard CR80 Identity Card)
   * ----------------------------------------------------------- */
  return (
    <div
      className={`w-full h-full relative overflow-hidden select-none bg-white font-sans ${className}`}
      style={{
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <FarmerCardFront
        data={data}
        langConfig={langConfig}
        frontAsset={frontAsset}
        formattedId={formattedId}
        displayAadhaar={displayAadhaar}
        qrPayload={qrPayload}
      />
    </div>
  );
}

/* =========================================================================
 * FRONT SUB-COMPONENT
 * ========================================================================= */
interface FrontProps {
  data: FarmerCardData;
  langConfig: FarmerLanguageConfig;
  frontAsset: string;
  formattedId: string;
  displayAadhaar: string;
  qrPayload: string;
}

function FarmerCardFront({ data, langConfig, frontAsset, formattedId, displayAadhaar, qrPayload }: FrontProps) {
  const labels = langConfig.labels;

  const frontRegionalHeader =
    data.departmentHeaderRegional ||
    data.departmentTitleRegional ||
    (data.language && data.language !== 'HI'
      ? langConfig.headerTitle.regional
      : (data.departmentTitleHindi || langConfig.headerTitle.regional));

  const frontEnglishHeader =
    data.departmentHeaderEnglish ||
    data.departmentTitleEnglish ||
    langConfig.headerTitle.english;

  const displayGender = (() => {
    if (data.gender && data.gender.includes('/')) {
      return data.gender;
    }
    const englishGender = data.gender || 'Male';
    const isFemale = englishGender.toLowerCase().includes('female');
    const defaultRegional = isFemale ? langConfig.labels.female : langConfig.labels.male;
    const regionalGender = data.genderRegional || defaultRegional;
    return `${regionalGender} / ${englishGender}`;
  })();

  return (
    <>
      {/* Authentic Front Background Template (1576 x 998 px) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={frontAsset}
        alt="Farmer Registry Card Front"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      />

      {/* ----------------- TOP HEADER AREA (0% - 20%) ----------------- */}
      <div className="absolute top-[3%] left-[4%] right-[4%] h-[15.5%] flex items-center justify-between z-10 pointer-events-none">
        {/* Left: AgriStack Logo */}
        <div className="h-[75%] flex items-center">
          <AgriStackLogo className="h-full w-auto" />
        </div>

        {/* Center: Department Title */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-1 overflow-hidden">
          <span
            className="text-[9.5px] sm:text-[10.5px] font-bold text-[#D97706] leading-tight tracking-wide drop-shadow-2xs whitespace-nowrap truncate max-w-full"
            style={{ fontFamily: REGIONAL_FONT }}
          >
            {frontRegionalHeader}
          </span>
          <span className="text-[9.5px] sm:text-[10.5px] font-bold text-[#006837] leading-tight tracking-wide whitespace-nowrap truncate max-w-full">
            {frontEnglishHeader}
          </span>
        </div>

        {/* Right: National Emblem of India */}
        <div className="h-[95%] flex items-center justify-end">
          <RcAshokaCrest className="h-full w-auto drop-shadow-2xs" />
        </div>
      </div>

      {/* ----------------- VERTICAL LEFT MARGIN (Approval Date) ----------------- */}
      <div
        className="absolute left-[1.2%] top-[25%] bottom-[20%] w-[4%] flex items-center justify-center pointer-events-none z-10"
      >
        <span
          className="text-[6px] sm:text-[6.8px] font-semibold text-[#374151] whitespace-nowrap tracking-wider select-none"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center center',
          }}
        >
          {labels.approvalDate}: {data.approvalDate || '15/06/2025'}
        </span>
      </div>

      {/* ----------------- FARMER PHOTOGRAPH (Left Box) ----------------- */}
      <div
        className="absolute left-[7.2%] top-[26%] w-[23.5%] h-[48%] rounded-[1px] border border-[#9CA3AF] bg-white shadow-2xs overflow-hidden flex items-center justify-center z-10"
      >
        {data.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.photoUrl}
            alt={data.farmerName || 'Farmer'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-1">
            <User className="w-8 h-8 opacity-60 text-gray-400" />
            <span className="text-[5.5px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">{labels.photo}</span>
          </div>
        )}
      </div>

      {/* ----------------- FARMER INFORMATION (Center Details Grid) ----------------- */}
      <div
        className="absolute left-[33.5%] top-[25.5%] w-[42%] h-[49%] flex flex-col justify-between text-[#0F172A] z-10 select-text"
        style={{ fontFamily: REGIONAL_FONT }}
      >
        <div className="grid grid-cols-[38%_62%] items-center leading-tight py-[0.5px]">
          <span className="text-[7.5px] sm:text-[8px] font-bold text-[#1E293B]">{labels.name}</span>
          <span className="text-[7.5px] sm:text-[8.5px] font-bold text-black truncate">
            {data.farmerNameRegional || data.farmerName || 'मोहन सिंह'}
          </span>
        </div>

        <div className="grid grid-cols-[38%_62%] items-center leading-tight py-[0.5px]">
          <span className="text-[7.5px] sm:text-[8px] font-bold text-[#1E293B]">{labels.nameEnglish}</span>
          <span className="text-[7.5px] sm:text-[8px] font-semibold text-black truncate">
            {data.farmerName || 'Mohan Singh'}
          </span>
        </div>

        <div className="grid grid-cols-[38%_62%] items-center leading-tight py-[0.5px]">
          <span className="text-[7.5px] sm:text-[8px] font-bold text-[#1E293B]">{labels.gender}</span>
          <span className="text-[7.5px] sm:text-[8px] font-semibold text-black truncate">
            {displayGender}
          </span>
        </div>

        <div className="grid grid-cols-[38%_62%] items-center leading-tight py-[0.5px]">
          <span className="text-[7.5px] sm:text-[8px] font-bold text-[#1E293B]">{labels.dob}</span>
          <span className="text-[7.5px] sm:text-[8px] font-semibold text-black truncate">
            {data.dateOfBirth || '01/01/1981'}
          </span>
        </div>

        <div className="grid grid-cols-[38%_62%] items-center leading-tight py-[0.5px]">
          <span className="text-[7.5px] sm:text-[8px] font-bold text-[#1E293B]">{labels.caste}</span>
          <span className="text-[7.5px] sm:text-[8px] font-semibold text-black truncate">
            {data.caste || '-'}
          </span>
        </div>

        <div className="grid grid-cols-[38%_62%] items-center leading-tight py-[0.5px]">
          <span className="text-[7.5px] sm:text-[8px] font-bold text-[#1E293B]">{labels.area}</span>
          <span className="text-[7.5px] sm:text-[8px] font-semibold text-black truncate">
            {data.areaCategory || 'Rural'}
          </span>
        </div>

        <div className="grid grid-cols-[38%_62%] items-center leading-tight py-[0.5px]">
          <span className="text-[7.5px] sm:text-[8px] font-bold text-[#1E293B]">{labels.aadhaar}</span>
          <span className="text-[7.5px] sm:text-[8px] font-semibold text-black tracking-tight truncate">
            {displayAadhaar}
          </span>
        </div>
      </div>

      {/* ----------------- QR CODE SECTION (Lower Right) ----------------- */}
      <div
        className="absolute right-[4.5%] top-[47%] w-[21%] h-[31.5%] p-0.5 bg-white border border-[#CBD5E1] rounded-[1px] shadow-2xs flex items-center justify-center z-10"
      >
        <CardQrCode
          value={qrPayload}
          size={110}
          level="M"
          className="w-full h-full object-contain"
        />
      </div>

      {/* ----------------- PROMINENT FARMER ID (Above Gold Line) ----------------- */}
      <div
        className="absolute left-[7.2%] right-[4.5%] top-[77.5%] h-[8%] flex items-center justify-center z-10 pointer-events-none"
      >
        <div className="flex items-center gap-1.5 text-[#15803D] font-extrabold text-[10.5px] sm:text-[11.5px] tracking-wider drop-shadow-2xs leading-none">
          <span>{labels.farmerId} :</span>
          <span className="tracking-widest">{formattedId}</span>
        </div>
      </div>

      {/* ----------------- BOTTOM FOOTER (Below Gold Line) ----------------- */}
      <div
        className="absolute left-0 right-0 bottom-0 h-[13.5%] flex items-center justify-center text-center z-10 pointer-events-none"
      >
        <span
          className="text-[10px] sm:text-[11px] font-extrabold text-[#111827] tracking-wide"
          style={{ fontFamily: REGIONAL_FONT }}
        >
          {data.registryTitle || langConfig.defaultRegistryTitle}
        </span>
      </div>
    </>
  );
}

/* =========================================================================
 * BACK SUB-COMPONENT
 * ========================================================================= */
interface BackProps {
  data: FarmerCardData;
  langConfig: FarmerLanguageConfig;
  backAsset: string;
  fullAddressText: string;
  landRecords: FarmerCardData['landRecords'];
}

function FarmerCardBack({ data, langConfig, backAsset, fullAddressText, landRecords }: BackProps) {
  const visibleRecords = landRecords && landRecords.length > 0 ? landRecords.slice(0, 6) : [];
  const labels = langConfig.labels;

  const backRegionalMinistry =
    data.ministryHeaderRegional ||
    data.ministryTitleRegional ||
    (data.language && data.language !== 'HI'
      ? langConfig.ministryTitle.regional
      : (data.ministryTitleHindi || langConfig.ministryTitle.regional));

  const backEnglishMinistry =
    data.ministryHeaderEnglish ||
    data.ministryTitleEnglish ||
    langConfig.ministryTitle.english;

  return (
    <>
      {/* Authentic Back Background (Exact 180° rotated image) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={backAsset}
        alt="Farmer Registry Card Back"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      />

      {/* ----------------- TOP HEADER AREA (0% - 20%) ----------------- */}
      <div className="absolute top-[3%] left-[4%] right-[4%] h-[15.5%] flex items-center justify-between z-10 pointer-events-none">
        {/* Left: AgriStack Logo */}
        <div className="h-[75%] flex items-center">
          <AgriStackLogo className="h-full w-auto" />
        </div>

        {/* Center: Ministry Header */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-1 overflow-hidden">
          <span
            className="text-[9px] sm:text-[9.5px] font-bold text-[#D97706] leading-tight tracking-wide drop-shadow-2xs whitespace-nowrap truncate max-w-full"
            style={{ fontFamily: REGIONAL_FONT }}
          >
            {backRegionalMinistry}
          </span>
          <span className="text-[9px] sm:text-[9.5px] font-bold text-[#006837] leading-tight tracking-wide whitespace-nowrap truncate max-w-full">
            {backEnglishMinistry}
          </span>
        </div>

        {/* Right: National Emblem of India */}
        <div className="h-[95%] flex items-center justify-end">
          <RcAshokaCrest className="h-full w-auto drop-shadow-2xs" />
        </div>
      </div>

      {/* ----------------- VERTICAL LEFT MARGIN (Download Date) ----------------- */}
      <div
        className="absolute left-[1.2%] top-[30%] bottom-[25%] w-[4%] flex items-center justify-center pointer-events-none z-10"
      >
        <span
          className="text-[6px] sm:text-[6.8px] font-semibold text-[#374151] whitespace-nowrap tracking-wider select-none"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center center',
          }}
        >
          {labels.downloadDate}: {data.downloadDate || ''}
        </span>
      </div>

      {/* ----------------- ADDRESS SECTION (Top Half) ----------------- */}
      <div
        className="absolute left-[7.2%] right-[4.5%] top-[23.5%] h-[15%] text-[#0F172A] z-10 select-text leading-tight"
        style={{ fontFamily: REGIONAL_FONT }}
      >
        <div className="font-extrabold text-[8px] sm:text-[8.5px] text-[#0F172A] mb-0.5">
          {labels.address}:
        </div>
        <div className="text-[7px] sm:text-[7.6px] font-medium text-black line-clamp-2 leading-[1.2]">
          {fullAddressText}
        </div>
      </div>

      {/* ----------------- LANDHOLDING INFORMATION TABLE ----------------- */}
      <div
        className="absolute left-[7.2%] right-[4.5%] top-[40.5%] bottom-[16%] z-10 overflow-hidden"
      >
        <table className="w-full border-collapse border border-black text-[#0F172A] bg-white/70">
          <thead>
            <tr className="border-b border-black bg-white/90">
              <th className="border-r border-black py-0.5 px-1 text-[7.2px] sm:text-[8px] font-extrabold text-center w-[30%]">
                {labels.khata}
              </th>
              <th className="border-r border-black py-0.5 px-1 text-[7.2px] sm:text-[8px] font-extrabold text-center w-[35%]">
                {labels.khasra}
              </th>
              <th className="py-0.5 px-1 text-[7.2px] sm:text-[8px] font-extrabold text-center w-[35%]">
                {labels.areaParcel}
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRecords.length > 0 ? (
              visibleRecords.map((rec, idx) => (
                <tr key={idx} className="border-b border-black last:border-b-0 leading-tight">
                  <td className="border-r border-black py-[1px] px-1 text-[6.8px] sm:text-[7.4px] font-semibold text-center truncate">
                    {rec.khata || '-'}
                  </td>
                  <td className="border-r border-black py-[1px] px-1 text-[6.8px] sm:text-[7.4px] font-semibold text-center truncate">
                    {rec.khasra || '-'}
                  </td>
                  <td className="py-[1px] px-1 text-[6.8px] sm:text-[7.4px] font-mono font-medium text-center truncate">
                    {rec.area !== undefined && rec.area !== null ? String(rec.area) : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-2 text-center text-[7px] text-gray-500 italic">
                  {labels.noLandRecords}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ----------------- BOTTOM FOOTER (Helpline & Official Website) ----------------- */}
      <div
        className="absolute left-[7.2%] right-[4.5%] bottom-0 h-[13.5%] flex items-center justify-between z-10 select-text"
      >
        {/* Left: Toll-free Helpline */}
        <div className="flex items-center gap-1.5 text-black font-extrabold text-[8.5px] sm:text-[9.5px]">
          <Phone className="w-3.5 h-3.5 text-black fill-black shrink-0" />
          <span className="tracking-tight">{data.helplineNumber || '1800-180-1551'}</span>
        </div>

        {/* Right: Official Website */}
        <div className="flex items-center gap-1.5 text-black font-extrabold text-[8px] sm:text-[9px]">
          <Globe className="w-3.5 h-3.5 text-black shrink-0" />
          <span className="tracking-tight font-sans">{data.websiteUrl || 'www.rjfr.agristack.gov.in'}</span>
        </div>
      </div>
    </>
  );
}
