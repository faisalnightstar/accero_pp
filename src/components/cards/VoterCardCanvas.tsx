'use client';

import React from 'react';
import { VoterCardData } from '@/types/cards';
import { AshokaEmblem, GuillochePattern, EciLogo } from '@/components/cards/Emblems';
import CardQrCode from '@/components/cards/CardQrCode';
import { User } from 'lucide-react';

interface VoterCardCanvasProps {
  data: VoterCardData;
  side?: 'front' | 'back';
  className?: string;
}

export default function VoterCardCanvas({
  data,
  side = 'front',
  className = '',
}: VoterCardCanvasProps) {
  // ECI verification link or standard payload
  const qrString = `https://electoralsearch.eci.gov.in/?epic=${data.epicNumber}`;

  if (side === 'back') {
    return (
      <div
        className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-amber-50/70 via-white to-blue-50/50 text-navy p-2.5 flex flex-col justify-between font-sans select-none ${className}`}
      >
        <GuillochePattern opacity={0.12} strokeColor="#E63946" />

        {/* Back Header */}
        <div className="border-b border-gray-300 pb-1 flex items-center justify-between text-[7px] font-bold text-gray-700">
          <span>भारत निर्वाचन आयोग</span>
          <span>ELECTION COMMISSION OF INDIA</span>
        </div>

        {/* Constituency & Part Details */}
        <div className="space-y-1 text-[7px] text-gray-800 leading-tight my-auto">
          {/* Assembly Constituency */}
          <div>
            <span className="text-[6px] text-gray-500 block uppercase font-semibold">
              विधान सभा निर्वाचन क्षेत्र संख्या एवं नाम / Assembly Constituency
            </span>
            <span className="font-bold text-[8px] text-navy block truncate">
              {data.assemblyConstituencyRegional && (
                <span className="mr-1">{data.assemblyConstituencyRegional} /</span>
              )}
              {data.assemblyConstituency || 'AC PENDING'}
            </span>
          </div>

          {/* Part Details */}
          <div>
            <span className="text-[6px] text-gray-500 block uppercase font-semibold">
              भाग संख्या एवं नाम / Part No. and Name
            </span>
            <span className="font-medium text-[7.5px] text-gray-800 block truncate">
              {data.partNumberAndNameRegional && (
                <span className="mr-1">{data.partNumberAndNameRegional} /</span>
              )}
              {data.partNumberAndName || 'PART PENDING'}
            </span>
          </div>

          {/* Full Address */}
          <div>
            <span className="text-[6px] text-gray-500 block uppercase font-semibold">
              पता / Address
            </span>
            <p className="text-[7px] text-gray-700 leading-tight line-clamp-2">
              {data.fullAddressRegional && (
                <span className="block">{data.fullAddressRegional}</span>
              )}
              <span>{data.fullAddress || 'ADDRESS PENDING'}</span>
            </p>
          </div>
        </div>

        {/* Back Footer with Digital Sign & QR */}
        <div className="border-t border-gray-300 pt-1 flex items-end justify-between">
          <div className="flex flex-col text-[6px] text-gray-600">
            <span>दिनांक / Date: {data.issueDate || '01/01/2026'}</span>
            <span className="font-semibold text-navy mt-0.5">
              निर्वाचक रजिस्ट्रीकरण अधिकारी
            </span>
            <span>Electoral Registration Officer</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="bg-white p-0.5 rounded border border-gray-300 shadow-2xs">
              <CardQrCode value={qrString} size={38} level="M" />
            </div>
            <EciLogo className="w-6 h-6 shrink-0 opacity-80" />
          </div>
        </div>
      </div>
    );
  }

  // Front Side Layout
  return (
    <div
      className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-amber-50/60 via-white to-sky-50/60 text-navy p-2 flex flex-col justify-between font-sans select-none ${className}`}
    >
      <GuillochePattern opacity={0.15} strokeColor="#1D3557" />

      {/* Top Banner Header with Tricolor accent */}
      <div className="relative z-10 border-b border-navy/20 pb-1">
        <div className="flex items-center justify-between">
          <AshokaEmblem className="w-5 h-7 shrink-0" fill="#1D3557" />
          <div className="text-center leading-none">
            <div className="text-[8px] font-bold text-navy">
              भारत निर्वाचन आयोग
            </div>
            <div className="text-[8.5px] font-black text-burgundy uppercase tracking-wide">
              ELECTION COMMISSION OF INDIA
            </div>
            <div className="text-[6px] text-gray-600 font-semibold tracking-wider uppercase mt-0.5">
              मतदाता फोटो पहचान पत्र - Elector Photo Identity Card
            </div>
          </div>
          <EciLogo className="w-5 h-5 shrink-0" />
        </div>
      </div>

      {/* Main Body (Photo on Left, Bilingual Details on Right) */}
      <div className="relative z-10 grid grid-cols-12 gap-2 my-auto items-center">
        {/* Photo Box */}
        <div className="col-span-4 flex flex-col items-center">
          <div className="w-16 h-18 rounded border border-gray-400 bg-white overflow-hidden shadow-xs flex items-center justify-center">
            {data.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.photoUrl}
                alt="Elector Portrait"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <User className="w-8 h-8" />
                <span className="text-[6px] uppercase font-semibold">Photo</span>
              </div>
            )}
          </div>
        </div>

        {/* Elector Details */}
        <div className="col-span-8 space-y-1 text-navy leading-none">
          {/* EPIC Number Banner */}
          <div className="bg-steel-blue/10 border-l-2 border-steel-blue px-1.5 py-0.5 rounded-r">
            <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
              पहचान पत्र क्र. / EPIC NO.
            </span>
            <span className="text-[11px] font-black font-mono tracking-wider text-burgundy">
              {data.epicNumber || 'AXH0000000'}
            </span>
          </div>

          {/* Name */}
          <div>
            <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
              नाम / Name
            </span>
            <div className="text-[8.5px] font-bold truncate">
              {data.electorNameRegional && (
                <span className="mr-1 text-navy">{data.electorNameRegional}</span>
              )}
              <span className="text-gray-900 uppercase">
                {data.electorName || 'ELECTOR NAME'}
              </span>
            </div>
          </div>

          {/* Father/Husband Name */}
          <div>
            <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
              {data.relationType === 'HUSBAND'
                ? 'पति का नाम / Husband Name'
                : 'पिता का नाम / Father Name'}
            </span>
            <div className="text-[8px] font-semibold truncate text-gray-800">
              {data.relationNameRegional && (
                <span className="mr-1">{data.relationNameRegional}</span>
              )}
              <span className="uppercase">{data.relationName || 'RELATION NAME'}</span>
            </div>
          </div>

          {/* Gender & Age */}
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
                लिंग / Gender
              </span>
              <span className="text-[7.5px] font-semibold text-gray-800">
                {data.genderRegional ? `${data.genderRegional} / ` : ''}
                {data.gender || 'Male'}
              </span>
            </div>
            <div>
              <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
                आयु / Age
              </span>
              <span className="text-[7.5px] font-semibold text-gray-800 font-mono">
                {data.age ? `${data.age} Yrs` : data.dateOfBirth || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hologram security footer strip */}
      <div className="relative z-10 border-t border-navy/20 pt-0.5 flex items-center justify-between text-[6px] text-gray-500">
        <span>SECURITY HOLOGRAM EMBEDDED</span>
        <span className="font-mono text-crimson font-bold">ECI OFFICIAL PVC ID</span>
      </div>
    </div>
  );
}
