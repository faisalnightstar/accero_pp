'use client';

import React from 'react';
import { VoterCardData } from '@/types/cards';
import { VOTER_LANGUAGES, VoterLanguageCode } from '@/lib/voterLanguages';
import CardBarcode from '@/components/cards/CardBarcode';
import CardQrCode from '@/components/cards/CardQrCode';
import { User } from 'lucide-react';

interface VoterCardCanvasProps {
  data: VoterCardData;
  side?: 'front' | 'back' | 'sheet';
  variant?: 'hindi' | 'assam' | string;
  className?: string;
}

export default function VoterCardCanvas({
  data,
  side = 'front',
  variant,
  className = '',
}: VoterCardCanvasProps) {
  const activeVariant = variant || data.templateVariant || 'hindi';

  // Check if legacy portrait mode is requested
  const isLegacyPortrait = activeVariant === 'assam' || activeVariant === 'legacy';

  if (isLegacyPortrait) {
    return renderLegacyPortrait({ data, side, activeVariant, className });
  }

  // Multi-lingual e-EPIC Landscape CR80 / Full Sheet mode
  const langKey = (data.language || 'HI').toUpperCase() as VoterLanguageCode;
  const langConfig = VOTER_LANGUAGES[langKey] || VOTER_LANGUAGES.HI;

  const frontAsset = langConfig.cardFrontAsset;
  const backAsset = langConfig.cardBackAsset;
  const sheetAsset = langConfig.sheetAsset;

  const epic = (data.epicNumber || 'AXH0801639').toUpperCase();
  const name = (data.electorName || 'ELECTOR NAME').toUpperCase();
  const electorNameRegional = data.electorNameRegional || name;
  const relationName = (data.relationName || "RELATION NAME").toUpperCase();
  const relationNameRegional = data.relationNameRegional || relationName;
  const relationTypeEnglish = data.relationType === 'HUSBAND' ? "Husband's" : "Father's";

  const labelName = data.labelNameRegional || langConfig.labels.name;
  const labelRelation =
    data.labelRelationRegional ||
    (data.relationType === 'HUSBAND'
      ? langConfig.labels.husbandName
      : langConfig.labels.fatherName);
  const labelGender = data.labelGenderRegional || langConfig.labels.gender;
  const labelDob = data.labelDobRegional || langConfig.labels.dob;
  const labelAddress = data.labelAddressRegional || langConfig.labels.address;
  const labelSign = data.labelSignRegional || langConfig.labels.electoralOfficer;

  const gender = (data.gender || 'Male');
  const genderLower = gender.toLowerCase();
  const genderRegional =
    data.genderRegional ||
    (genderLower.startsWith('f')
      ? langConfig.labels.female
      : langConfig.labels.male);

  const dob = data.dateOfBirth || data.age || '01/01/1990';
  const ac = data.assemblyConstituency || `${data.acNo || '14'} - ${data.acName || 'GOVINDGANJ'}`;
  const acRegional =
    data.assemblyConstituencyRegional ||
    (data.acNameRegional ? `${data.acNo || '14'} - ${data.acNameRegional}` : ac);
  const part = data.partNumberAndName || `${data.partNo || '257'} - ${data.partName || 'PRATHMIK VIDYALAY'}`;
  const partRegional =
    data.partNumberAndNameRegional ||
    (data.partNameRegional ? `${data.partNo || '257'} - ${data.partNameRegional}` : part);

  const address = (data.fullAddress || 'HOUSE NO 12, MAIN ROAD, BIHAR - 845401').toUpperCase();
  const addressRegional = data.fullAddressRegional || address;
  const downloadDate = data.downloadDate || data.issueDate || '06/11/2026';
  const officerSignUrl = data.signatureUrl || '/assets/voter/voter-officer-sign.png';

  /* -------------------------------------------------------------
   * 1. FULL OFFICIAL A4 e-EPIC SHEET MODE
   * ----------------------------------------------------------- */
  if (side === 'sheet' || data.layoutFormat === 'sheet') {
    return (
      <div
        className={`w-full h-full relative overflow-hidden select-none bg-white font-sans ${className}`}
        style={{
          aspectRatio: '2480 / 3508',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {/* Full A4 e-EPIC Sheet Template */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sheetAsset}
          alt={`Voter ID e-EPIC Sheet - ${langConfig.name}`}
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        />

        {/* ---------------- FRONT CARD OVERLAY (Upper Left) ---------------- */}
        {/* EPIC Number */}
        <div
          className="absolute font-black font-mono tracking-wider text-black text-[10px] leading-none"
          style={{
            left: '6.2%',
            top: '17.4%',
          }}
        >
          {epic}
        </div>

        {/* Main Photo */}
        <div
          className="absolute overflow-hidden rounded-[1px] bg-white border border-[#BFC1C6] shadow-2xs flex items-center justify-center"
          style={{
            left: '6.1%',
            top: '19.1%',
            width: '10.1%',
            height: '9.9%',
          }}
        >
          {data.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photoUrl} alt="Elector" className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-gray-400" />
          )}
        </div>

        {/* Ghost Photo */}
        <div
          className="absolute overflow-hidden rounded-[1px] border border-[#BFC1C6]/60 flex items-center justify-center pointer-events-none"
          style={{
            left: '40.0%',
            top: '17.1%',
            width: '3.6%',
            height: '2.9%',
            opacity: 0.75,
            filter: 'grayscale(100%)',
          }}
        >
          {data.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photoUrl} alt="Ghost" className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-gray-400" />
          )}
        </div>

        {/* Front Table */}
        <div
          className="absolute flex flex-col justify-between text-[8px] leading-tight text-black font-sans"
          style={{
            left: '16.9%',
            top: '18.3%',
            width: '22.5%',
            height: '10.7%',
          }}
        >
          <div className="flex items-baseline gap-1 truncate">
            <span className="font-bold shrink-0">{labelName}</span>
            <span className="font-bold">:</span>
            <span className="font-extrabold truncate">{electorNameRegional}</span>
          </div>
          <div className="flex items-baseline gap-1 truncate">
            <span className="font-bold shrink-0">Name</span>
            <span className="font-bold">:</span>
            <span className="font-extrabold uppercase truncate">{name}</span>
          </div>
          <div className="flex items-baseline gap-1 truncate">
            <span className="font-bold shrink-0">{labelRelation}</span>
            <span className="font-bold">:</span>
            <span className="font-extrabold truncate">{relationNameRegional}</span>
          </div>
          <div className="flex items-baseline gap-1 truncate">
            <span className="font-bold shrink-0">{relationTypeEnglish} Name</span>
            <span className="font-bold">:</span>
            <span className="font-extrabold uppercase truncate">{relationName}</span>
          </div>
          <div className="flex items-baseline gap-1 truncate">
            <span className="font-bold shrink-0">{labelGender}/Gender</span>
            <span className="font-bold">:</span>
            <span className="font-extrabold">{genderRegional} / {gender}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <div className="flex flex-col leading-none shrink-0">
              <span className="font-bold">{labelDob}</span>
              <span className="font-bold text-[6px]">Date Of Birth/Age</span>
            </div>
            <span className="font-bold">:</span>
            <span className="font-extrabold font-mono">{dob}</span>
          </div>
        </div>

        {/* ---------------- BACK CARD OVERLAY (Upper Right) ---------------- */}
        {/* EPIC Number */}
        <div
          className="absolute font-black font-mono tracking-wider text-black text-[10px] leading-none"
          style={{
            left: '56.1%',
            top: '14.9%',
          }}
        >
          {epic}
        </div>

        {/* QR Code */}
        <div
          className="absolute bg-white p-0.5 rounded-[1px] flex items-center justify-center overflow-hidden"
          style={{
            left: '56.1%',
            top: '17.0%',
            width: '11.6%',
            height: '8.35%',
          }}
        >
          <CardQrCode
            value={`ECI|${epic}|${name}|${dob}|${gender}|${ac}|${part}`}
            size={90}
            level="M"
          />
        </div>

        {/* Address */}
        <div
          className="absolute flex flex-col justify-start text-[7.5px] leading-tight text-black"
          style={{
            left: '68.6%',
            top: '14.8%',
            width: '25.2%',
          }}
        >
          <div className="line-clamp-2">
            <span className="font-bold">{labelAddress} : </span>
            <span className="font-semibold">{addressRegional}</span>
          </div>
          <div className="line-clamp-2 mt-0.5 uppercase">
            <span className="font-bold">Address : </span>
            <span className="font-semibold">{address}</span>
          </div>
        </div>

        {/* Officer Signature */}
        <div
          className="absolute flex items-end justify-between"
          style={{
            left: '68.6%',
            top: '21.8%',
            width: '25.2%',
          }}
        >
          <div className="flex flex-col text-[7px] leading-tight font-semibold text-black">
            <span className="font-bold">{labelSign} : {acRegional || ac}</span>
            <span className="mt-0.5">Electoral Registration Officer : {ac}</span>
          </div>
          <div className="flex flex-col items-center shrink-0 -mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={officerSignUrl}
              alt="ERO Signature"
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        {/* Download Date */}
        <div
          className="absolute text-[7px] font-bold text-gray-800 leading-none"
          style={{
            left: '56.1%',
            top: '25.6%',
          }}
        >
          Download Date: {downloadDate}
        </div>

        {/* ---------------- LOWER SECTION (Voter Slip & Polling Details) ---------------- */}
        <div
          className="absolute flex flex-col gap-1.5 text-[9px] font-bold text-black"
          style={{
            left: '38.0%',
            top: '47.5%',
            width: '56.0%',
          }}
        >
          <div className="text-[12px] font-black font-mono tracking-wider">{epic}</div>
          <div className="truncate">{acRegional}</div>
          <div className="truncate">{ac}</div>
          <div className="truncate">{partRegional}</div>
          <div className="truncate">{part}</div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 2. BACK SIDE LAYOUT (Landscape CR80 ID-1 standard)
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
        {/* Authentic Multi-Lingual Background Template */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backAsset}
          alt={`Voter Card Back - ${langConfig.name}`}
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        />

        {/* EPIC Number (above QR / Barcode) */}
        <div
          className="absolute font-black font-mono tracking-wider text-black text-[9px] leading-none"
          style={{
            left: '4.7%',
            top: '15.5%',
          }}
        >
          {epic}
        </div>

        {/* High-density QR Code / Barcode container */}
        <div
          className="absolute bg-white p-0.5 rounded-[1px] flex items-center justify-center overflow-hidden"
          style={{
            left: '4.7%',
            top: '27.0%',
            width: '28.1%',
            height: '44.5%',
          }}
        >
          <CardQrCode
            value={`ECI|${epic}|${name}|${dob}|${gender}|${ac}|${part}`}
            size={76}
            level="M"
          />
        </div>

        {/* Download Date under QR Code */}
        <div
          className="absolute text-[5.5px] font-bold text-gray-800 leading-none"
          style={{
            left: '4.7%',
            top: '73.0%',
          }}
        >
          Download Date: {downloadDate}
        </div>

        {/* Address Block */}
        <div
          className="absolute flex flex-col justify-start text-[6.5px] sm:text-[7px] leading-tight text-black"
          style={{
            left: '35.0%',
            top: '15.0%',
            width: '61.0%',
          }}
        >
          <div className="line-clamp-2">
            <span className="font-bold">{labelAddress} : </span>
            <span className="font-semibold">{addressRegional}</span>
          </div>
          <div className="line-clamp-2 mt-0.5 uppercase">
            <span className="font-bold">Address : </span>
            <span className="font-semibold">{address}</span>
          </div>
        </div>

        {/* Electoral Registration Officer & Signature */}
        <div
          className="absolute flex items-end justify-between"
          style={{
            left: '35.0%',
            top: '53.0%',
            width: '61.0%',
          }}
        >
          <div className="flex flex-col text-[6px] sm:text-[6.5px] leading-tight font-semibold text-black">
            <span className="font-bold">{labelSign} : {acRegional || ac}</span>
            <span className="mt-0.5">Electoral Registration Officer : {ac}</span>
          </div>
          <div className="flex flex-col items-center shrink-0 -mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={officerSignUrl}
              alt="ERO Signature"
              className="h-7 w-auto object-contain"
            />
          </div>
        </div>

        {/* Bottom Section: Assembly Constituency & Part info */}
        <div
          className="absolute flex items-center justify-between text-[6px] text-gray-800 font-medium"
          style={{
            left: '35.0%',
            top: '80.0%',
            width: '61.0%',
          }}
        >
          <div className="truncate pr-1">
            <span className="font-bold">AC: </span>
            <span>{acRegional || ac}</span>
          </div>
          <div className="truncate text-right pl-1">
            <span className="font-bold">Part: </span>
            <span>{partRegional || part}</span>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 3. FRONT SIDE LAYOUT (Landscape CR80 ID-1 standard)
   * ----------------------------------------------------------- */
  return (
    <div
      className={`w-full h-full relative overflow-hidden select-none bg-white font-sans ${className}`}
      style={{
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      {/* Authentic Multi-Lingual Background Template */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={frontAsset}
        alt={`Voter Card Front - ${langConfig.name}`}
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      />

      {/* Top EPIC Number above Photo */}
      <div
        className="absolute font-black font-mono tracking-wider text-black text-[9px] leading-none"
        style={{
          left: '3.6%',
          top: '29.2%',
        }}
      >
        {epic}
      </div>

      {/* Elector Photo */}
      <div
        className="absolute overflow-hidden rounded-[1px] bg-white border border-[#BFC1C6] shadow-2xs flex items-center justify-center"
        style={{
          left: '3.4%',
          top: '38.5%',
          width: '24.4%',
          height: '53.4%',
        }}
      >
        {data.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.photoUrl} alt="Elector" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <User className="w-8 h-8" />
            <span className="text-[6.5px] uppercase font-bold mt-0.5">Photo</span>
          </div>
        )}
      </div>

      {/* Ghost Photo (Upper right, grayscale, ~75% opacity) */}
      <div
        className="absolute overflow-hidden rounded-[1px] border border-[#BFC1C6]/60 flex items-center justify-center pointer-events-none select-none"
        style={{
          left: '85.5%',
          top: '27.4%',
          width: '8.7%',
          height: '15.8%',
          opacity: 0.75,
          filter: 'grayscale(100%)',
        }}
      >
        {data.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.photoUrl} alt="Ghost" className="w-full h-full object-cover" />
        ) : (
          <User className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {/* Micro-text vertical EPIC number next to ghost photo */}
      <div
        className="absolute text-[5.5px] font-bold text-gray-700 font-mono tracking-tighter pointer-events-none select-none"
        style={{
          left: '82.8%',
          top: '27.4%',
          height: '15.8%',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
        }}
      >
        {epic}
      </div>

      {/* Elector Details Table (6 Rows matching ECI layout) */}
      <div
        className="absolute flex flex-col justify-between text-[7.5px] leading-tight text-black font-sans"
        style={{
          left: '29.5%',
          top: '34.0%',
          width: '54.5%',
          height: '58.0%',
        }}
      >
        {/* Row 1: Regional Name */}
        <div className="flex items-baseline gap-1 truncate">
          <span className="font-bold shrink-0">{labelName}</span>
          <span className="font-bold">:</span>
          <span className="font-extrabold truncate">{electorNameRegional}</span>
        </div>

        {/* Row 2: English Name */}
        <div className="flex items-baseline gap-1 truncate">
          <span className="font-bold shrink-0">Name</span>
          <span className="font-bold">:</span>
          <span className="font-extrabold uppercase truncate">{name}</span>
        </div>

        {/* Row 3: Relation Regional */}
        <div className="flex items-baseline gap-1 truncate">
          <span className="font-bold shrink-0">{labelRelation}</span>
          <span className="font-bold">:</span>
          <span className="font-extrabold truncate">{relationNameRegional}</span>
        </div>

        {/* Row 4: Relation English */}
        <div className="flex items-baseline gap-1 truncate">
          <span className="font-bold shrink-0">{relationTypeEnglish} Name</span>
          <span className="font-bold">:</span>
          <span className="font-extrabold uppercase truncate">{relationName}</span>
        </div>

        {/* Row 5: Gender */}
        <div className="flex items-baseline gap-1 truncate">
          <span className="font-bold shrink-0">{labelGender}/Gender</span>
          <span className="font-bold">:</span>
          <span className="font-extrabold">{genderRegional} / {gender}</span>
        </div>

        {/* Row 6: DOB / Age */}
        <div className="flex items-baseline gap-1">
          <div className="flex flex-col leading-none shrink-0">
            <span className="font-bold">{labelDob}</span>
            <span className="font-bold text-[6px]">Date Of Birth/Age</span>
          </div>
          <span className="font-bold">:</span>
          <span className="font-extrabold font-mono">{dob}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Legacy Portrait Layout (Assam / Old Hindi format) fallback
 */
function renderLegacyPortrait({
  data,
  side,
  activeVariant,
  className,
}: {
  data: VoterCardData;
  side: 'front' | 'back' | 'sheet';
  activeVariant: string;
  className: string;
}) {
  const frontAsset =
    activeVariant === 'assam'
      ? '/assets/voter/voter-assam-front.png'
      : '/assets/voter/voter-hindi-front.jpg';
  const backAsset =
    activeVariant === 'assam'
      ? '/assets/voter/voter-assam-back.png'
      : '/assets/voter/voter-hindi-back.jpg';

  const epic = (data.epicNumber || 'AXH0801639').toUpperCase();
  const name = (data.electorName || 'ELECTOR NAME').toUpperCase();
  const nameRegionalLabel = data.electorNameRegional || 'मतदाता का नाम';
  const relationName = (data.relationName || "FATHER'S NAME").toUpperCase();
  const relationNameRegionalLabel = data.relationNameRegional || 'पिता का नाम';
  const gender = (data.gender || 'Male').toUpperCase();
  const genderRegional = data.genderRegional || (gender === 'MALE' ? 'पुरुष' : 'महिला');
  const dob = data.dateOfBirth || data.age || '01/01/1990';
  const ac = data.assemblyConstituency || '14 - GOVINDGANJ';
  const acRegional = data.assemblyConstituencyRegional || '14 - गोविन्दगंज';
  const part = data.partNumberAndName || '257 - PRATHMIK VIDYALAY JHAKHARA';
  const partRegional = data.partNumberAndNameRegional || '257 - प्राथमिक विद्यालय झखरा';
  const address = data.fullAddress || 'HOUSE NO 12, MAIN ROAD, BIHAR - 845401';
  const addressRegional = data.fullAddressRegional || 'मकान नं 12, मुख्य मार्ग, बिहार - 845401';
  const issueDate = data.issueDate || '15/01/2021';

  if (side === 'back') {
    return (
      <div
        className={`w-full h-full relative overflow-hidden select-none bg-white font-sans ${className}`}
        style={{
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backAsset}
          alt="Voter Card Back"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        />

        <div
          className="absolute flex items-center text-[8.5px] font-bold text-black"
          style={{ left: '6.0%', top: '7.0%' }}
        >
          <span className="w-28 shrink-0">लिंग / Sex :</span>
          <span>{genderRegional} / {gender}</span>
        </div>

        <div
          className="absolute flex items-center text-[8.5px] font-bold text-black"
          style={{ left: '6.0%', top: '11.0%' }}
        >
          <span className="w-28 shrink-0">जन्म तिथि / आयु :</span>
          <span className="font-mono">{dob}</span>
        </div>

        <div
          className="absolute flex flex-col text-[8px] font-semibold text-black leading-tight"
          style={{ left: '6.0%', top: '16.5%', width: '88.0%' }}
        >
          <span className="font-bold text-[8.5px]">पता / Address :</span>
          <span className="mt-1 line-clamp-2">{addressRegional}</span>
          <span className="mt-1 line-clamp-2 uppercase">{address}</span>
        </div>

        <div
          className="absolute flex items-center justify-between text-[7.5px] font-bold text-black"
          style={{ left: '6.0%', right: '6.0%', top: '49.0%' }}
        >
          <div>
            <span className="block">दिनांक / Date :</span>
            <span className="font-mono">{issueDate}</span>
          </div>

          <div className="flex flex-col items-center">
            {data.signatureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.signatureUrl} alt="Signature" className="h-6 object-contain" />
            ) : (
              <span className="text-[7px] italic text-gray-700">ERO Sign</span>
            )}
            <span className="text-[6.5px] font-bold text-center mt-0.5">
              निर्वाचक रजिस्ट्रीकरण अधिकारी<br />Electoral Registration Officer
            </span>
          </div>
        </div>

        <div
          className="absolute flex flex-col text-[7.5px] font-bold text-black leading-tight"
          style={{ left: '6.0%', top: '68.0%', width: '88.0%' }}
        >
          <span className="text-[7px] text-gray-800">
            विधान सभा निर्वाचन क्षेत्र संख्या एवं नाम / Assembly Constituency No. & Name :
          </span>
          <span className="mt-0.5 truncate">{acRegional} / {ac}</span>
        </div>

        <div
          className="absolute flex flex-col text-[7.5px] font-bold text-black leading-tight"
          style={{ left: '6.0%', top: '79.0%', width: '88.0%' }}
        >
          <span className="text-[7px] text-gray-800">
            भाग संख्या एवं नाम / Part No. & Name :
          </span>
          <span className="mt-0.5 truncate">{partRegional} / {part}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full relative overflow-hidden select-none bg-white font-sans ${className}`}
      style={{
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={frontAsset}
        alt="Voter Card Front"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      />

      <div
        className="absolute flex items-center justify-center overflow-hidden bg-transparent"
        style={{ left: '19.0%', top: '16.8%', width: '31.5%', height: '4.8%' }}
      >
        <CardBarcode
          value={epic}
          format="CODE128"
          width={1.2}
          height={32}
          displayValue={false}
          className="w-full h-full object-contain"
        />
      </div>

      <div
        className="absolute font-black font-mono tracking-wider text-black text-[12px] leading-none"
        style={{ left: '55.0%', top: '17.2%' }}
      >
        {epic}
      </div>

      <div
        className="absolute overflow-hidden rounded-[2px] bg-white border border-gray-400 shadow-2xs flex items-center justify-center"
        style={{ left: '28.4%', top: '24.6%', width: '43.7%', height: '37.2%' }}
      >
        {data.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.photoUrl} alt="Elector" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <User className="w-12 h-12" />
            <span className="text-[8px] uppercase font-bold mt-1">Photo</span>
          </div>
        )}
      </div>

      <div
        className="absolute flex flex-col justify-start text-black text-[11px] font-bold leading-tight"
        style={{ left: '8.0%', top: '66.2%', width: '84.0%' }}
      >
        <span className="truncate">{nameRegionalLabel}</span>
        <span className="truncate mt-1 uppercase">{name}</span>
      </div>

      <div
        className="absolute flex flex-col justify-start text-black text-[11px] font-bold leading-tight"
        style={{ left: '8.0%', top: '79.2%', width: '84.0%' }}
      >
        <span className="truncate">{relationNameRegionalLabel}</span>
        <span className="truncate mt-1 uppercase">{relationName}</span>
      </div>
    </div>
  );
}
