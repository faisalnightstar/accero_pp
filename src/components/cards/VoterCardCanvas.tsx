'use client';

import React from 'react';
import { VoterCardData } from '@/types/cards';
import CardBarcode from '@/components/cards/CardBarcode';
import { User } from 'lucide-react';

interface VoterCardCanvasProps {
  data: VoterCardData;
  side?: 'front' | 'back';
  variant?: 'hindi' | 'assam';
  className?: string;
}

export default function VoterCardCanvas({
  data,
  side = 'front',
  variant,
  className = '',
}: VoterCardCanvasProps) {
  const activeVariant = variant || data.templateVariant || 'hindi';

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

  /* -------------------------------------------------------------
   * 1. BACK SIDE LAYOUT (Portrait 320x500 / 802x1280)
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
        {/* Authentic Background Template */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backAsset}
          alt="Voter Card Back"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        />

        {/* Gender / Sex */}
        <div
          className="absolute flex items-center text-[8.5px] font-bold text-black"
          style={{
            left: '6.0%',
            top: '7.0%',
          }}
        >
          <span className="w-28 shrink-0">लिंग / Sex :</span>
          <span>{genderRegional} / {gender}</span>
        </div>

        {/* Date of Birth / Age */}
        <div
          className="absolute flex items-center text-[8.5px] font-bold text-black"
          style={{
            left: '6.0%',
            top: '11.0%',
          }}
        >
          <span className="w-28 shrink-0">जन्म तिथि / आयु :</span>
          <span className="font-mono">{dob}</span>
        </div>

        {/* Address Block */}
        <div
          className="absolute flex flex-col text-[8px] font-semibold text-black leading-tight"
          style={{
            left: '6.0%',
            top: '16.5%',
            width: '88.0%',
          }}
        >
          <span className="font-bold text-[8.5px]">पता / Address :</span>
          <span className="mt-1 line-clamp-2">{addressRegional}</span>
          <span className="mt-1 line-clamp-2 uppercase">{address}</span>
        </div>

        {/* Date and Signature Area */}
        <div
          className="absolute flex items-center justify-between text-[7.5px] font-bold text-black"
          style={{
            left: '6.0%',
            right: '6.0%',
            top: '49.0%',
          }}
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

        {/* Assembly Constituency */}
        <div
          className="absolute flex flex-col text-[7.5px] font-bold text-black leading-tight"
          style={{
            left: '6.0%',
            top: '68.0%',
            width: '88.0%',
          }}
        >
          <span className="text-[7px] text-gray-800">
            विधान सभा निर्वाचन क्षेत्र संख्या एवं नाम / Assembly Constituency No. & Name :
          </span>
          <span className="mt-0.5 truncate">{acRegional} / {ac}</span>
        </div>

        {/* Part Number & Name */}
        <div
          className="absolute flex flex-col text-[7.5px] font-bold text-black leading-tight"
          style={{
            left: '6.0%',
            top: '79.0%',
            width: '88.0%',
          }}
        >
          <span className="text-[7px] text-gray-800">
            भाग संख्या एवं नाम / Part No. & Name :
          </span>
          <span className="mt-0.5 truncate">{partRegional} / {part}</span>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 2. FRONT SIDE LAYOUT (Portrait 320x500 / 643x1012)
   * ----------------------------------------------------------- */
  return (
    <div
      className={`w-full h-full relative overflow-hidden select-none bg-white font-sans ${className}`}
      style={{
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      {/* Authentic Background Template */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={frontAsset}
        alt="Voter Card Front"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      />

      {/* Official 1D Barcode (ECI Code 128 format via JsBarcode) */}
      <div
        className="absolute flex items-center justify-center overflow-hidden bg-transparent"
        style={{
          left: '19.0%',
          top: '16.8%',
          width: '31.5%',
          height: '4.8%',
        }}
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

      {/* EPIC Number */}
      <div
        className="absolute font-black font-mono tracking-wider text-black text-[12px] leading-none"
        style={{
          left: '55.0%',
          top: '17.2%',
        }}
      >
        {epic}
      </div>

      {/* Elector Photo */}
      <div
        className="absolute overflow-hidden rounded-[2px] bg-white border border-gray-400 shadow-2xs flex items-center justify-center"
        style={{
          left: '28.4%',
          top: '24.6%',
          width: '43.7%',
          height: '37.2%',
        }}
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

      {/* Elector Name */}
      <div
        className="absolute flex flex-col justify-start text-black text-[11px] font-bold leading-tight"
        style={{
          left: '8.0%',
          top: '66.2%',
          width: '84.0%',
        }}
      >
        <span className="truncate">{nameRegionalLabel}</span>
        <span className="truncate mt-1 uppercase">{name}</span>
      </div>

      {/* Father's / Husband's Name */}
      <div
        className="absolute flex flex-col justify-start text-black text-[11px] font-bold leading-tight"
        style={{
          left: '8.0%',
          top: '79.2%',
          width: '84.0%',
        }}
      >
        <span className="truncate">{relationNameRegionalLabel}</span>
        <span className="truncate mt-1 uppercase">{relationName}</span>
      </div>
    </div>
  );
}
