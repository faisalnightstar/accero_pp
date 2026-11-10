'use client';

import React from 'react';
import { PanCardData, getPanQrXmlString } from '@/types/cards';
import CardQrCode from '@/components/cards/CardQrCode';
import { User } from 'lucide-react';

export interface PanCardCanvasProps {
  data: PanCardData;
  side?: 'front' | 'back' | 'sheet';
  variant?: 'nsdl' | 'utiitsl';
  className?: string;
}

const HELVETICA_LT_PRO_BOLD =
  "'Helvetica LT Pro Bold', 'Helvetica LT Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function PanCardCanvas({
  data,
  side = 'front',
  variant,
  className = '',
}: PanCardCanvasProps) {
  const activeVariant = variant || data.templateVariant || 'nsdl';
  const isUti = activeVariant === 'utiitsl';
  const qrString = getPanQrXmlString(data);

  // Asset URLs matching the extracted high-resolution templates
  const frontAsset =
    activeVariant === 'utiitsl'
      ? '/assets/pan/uti-front.jpg'
      : '/assets/pan/nsdl-front.jpg';
  const backAsset =
    activeVariant === 'utiitsl'
      ? '/assets/pan/uti-back.jpg'
      : '/assets/pan/nsdl-back.jpg';
  const sheetAsset =
    activeVariant === 'utiitsl'
      ? '/assets/pan/uti-sheet.jpg'
      : '/assets/pan/nsdl-sheet.jpg';

  const panno = (data.panNumber || 'ABCDE1234F').toUpperCase();
  const name = (data.fullName || 'APPLICANT NAME').toUpperCase();
  const fatherName = (data.fatherName || "FATHER'S NAME").toUpperCase();
  const dob = data.dateOfBirth || 'DD/MM/YYYY';

  /* -------------------------------------------------------------
   * 1. FULL SIDE-BY-SIDE SHEET MODE (Legacy pan.php 1:1 match)
   * ----------------------------------------------------------- */
  if (side === 'sheet') {
    return (
      <div
        className={`w-full h-full relative overflow-hidden select-none bg-white font-pan ${className}`}
        style={{
          fontFamily: HELVETICA_LT_PRO_BOLD,
          fontWeight: 700,
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {/* Authentic Background Sheet (1280x386 with center fold line) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sheetAsset}
          alt={`PAN Card ${activeVariant.toUpperCase()} Sheet`}
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        />

        {/* ---------------- FRONT SIDE OVERLAYS (Left Half: 0 - 50%) ---------------- */}

        {/* Applicant Photo */}
        <div
          className="absolute overflow-hidden rounded-[1px] border border-[#718096]/80 bg-white shadow-2xs flex items-center justify-center"
          style={{
            left: isUti ? '3.9%' : '3.875%',
            top: isUti ? '38.5%' : '38.5%',
            width: '7.75%',
            height: '22.0%',
          }}
        >
          {data.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.photoUrl}
              alt="Applicant"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <User className="w-4 h-4 opacity-70" />
              <span className="text-[5px] uppercase font-semibold">Photo</span>
            </div>
          )}
        </div>

        {/* Permanent Account Number */}
        <div
          className="absolute font-bold text-[#1A202C] tracking-wider leading-none"
          style={{
            fontFamily: HELVETICA_LT_PRO_BOLD,
            fontWeight: 700,
            left: '17.75%',
            top: isUti ? '42.5%' : '42.28%',
            fontSize: 'calc(100% * 0.046)',
          }}
        >
          {panno}
        </div>

        {/* Applicant Full Name */}
        <div
          className="absolute font-bold uppercase text-[#1A202C] truncate leading-none"
          style={{
            fontFamily: HELVETICA_LT_PRO_BOLD,
            fontWeight: 700,
            left: isUti ? '4.2%' : '4.125%',
            top: isUti ? '63.5%' : '62.59%',
            width: '24%',
            fontSize: 'calc(100% * 0.034)',
          }}
          title={name}
        >
          {name}
        </div>

        {/* Father's Full Name */}
        <div
          className="absolute font-bold uppercase text-[#1A202C] truncate leading-none"
          style={{
            fontFamily: HELVETICA_LT_PRO_BOLD,
            fontWeight: 700,
            left: '4.25%',
            top: isUti ? '76.0%' : '75.03%',
            width: '24%',
            fontSize: 'calc(100% * 0.045)',
          }}
          title={fatherName}
        >
          {fatherName}
        </div>

        {/* Date of Birth */}
        <div
          className="absolute font-bold text-[#1A202C] leading-none"
          style={{
            fontFamily: HELVETICA_LT_PRO_BOLD,
            fontWeight: 700,
            left: isUti ? '4.2%' : '4.125%',
            top: isUti ? '91.2%' : '90.36%',
            fontSize: 'calc(100% * 0.034)',
          }}
        >
          {dob}
        </div>

        {/* Applicant Signature */}
        <div
          className="absolute overflow-hidden flex items-center justify-center pointer-events-none"
          style={{
            left: isUti ? '17.0%' : '16.5%',
            top: isUti ? '74.0%' : '73.0%',
            width: '10.0%',
            height: '15.0%',
          }}
        >
          {data.signatureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.signatureUrl}
              alt="Signature"
              className="max-w-full max-h-full object-contain mix-blend-multiply"
            />
          ) : (
            <span className="text-[6px] text-gray-400 italic">Signature</span>
          )}
        </div>

        {/* High-Density Scannable Dynamic QR Code */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: isUti ? '33.3%' : '33.4%',
            top: '28.5%',
            width: '13.8%',
            height: '43.0%',
          }}
        >
          <div className="w-full h-full p-0.5 bg-white rounded-[1px] shadow-2xs flex items-center justify-center">
            <CardQrCode value={qrString} size={110} level="M" />
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 2. BACK SIDE (Standard ISO CR80 PVC card)
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
        {/* Authentic Background Back Template (NSDL or UTIITSL) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backAsset}
          alt={`PAN Card ${activeVariant.toUpperCase()} Back`}
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        />
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 3. FRONT SIDE (Standard ISO CR80 PVC card)
   * ----------------------------------------------------------- */
  return (
    <div
      className={`w-full h-full relative overflow-hidden select-none bg-white font-pan ${className}`}
      style={{
        fontFamily: HELVETICA_LT_PRO_BOLD,
        fontWeight: 700,
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      {/* Authentic Background Front Template (NSDL or UTIITSL) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={frontAsset}
        alt={`PAN Card ${activeVariant.toUpperCase()} Front`}
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      />

      {/* Applicant Photo */}
      <div
        className="absolute overflow-hidden rounded-[1px] bg-white shadow-2xs flex items-center justify-center"
        style={{
          left: isUti ? '5.2%' : '5.9%',
          top: isUti ? '26.5%' : '27%',
          width: '16.0%',
          height: '25.73%',
        }}
      >
        {data.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.photoUrl}
            alt="Applicant"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <User className="w-5 h-5 opacity-70" />
            <span className="text-[6px] uppercase font-semibold">Photo</span>
          </div>
        )}
      </div>

      {/* Permanent Account Number */}
      <div
        className="absolute font-bold text-[#1A202C] tracking-wider leading-none text-[10.5px]"
        style={{
          fontFamily: HELVETICA_LT_PRO_BOLD,
          fontWeight: 700,
          left: '32.5%',
          top: isUti ? '42.5%' : '42.28%',
        }}
      >
        {panno}
      </div>

      {/* Applicant Full Name */}
      <div
        className="absolute font-bold uppercase text-[#1A202C] truncate leading-none text-[8.5px]"
        style={{
          fontFamily: HELVETICA_LT_PRO_BOLD,
          fontWeight: 700,
          left: '6%',
          top: isUti ? '61.5%' : '60.59%',
          width: '48%',
        }}
        title={name}
      >
        {name}
      </div>

      {/* Father's Full Name */}
      <div
        className="absolute font-bold uppercase text-[#1A202C] truncate leading-none text-[8.5px]"
        style={{
          fontFamily: HELVETICA_LT_PRO_BOLD,
          fontWeight: 700,
          left: '6%',
          top: isUti ? '74.0%' : '73.03%',
          width: '48%',
        }}
        title={fatherName}
      >
        {fatherName}
      </div>

      {/* Date of Birth */}
      <div
        className="absolute font-bold text-[#1A202C] leading-none text-[8.5px]"
        style={{
          fontFamily: HELVETICA_LT_PRO_BOLD,
          fontWeight: 700,
          left: '6%',
          top: isUti ? '89.5%' : '88.36%',
        }}
      >
        {dob}
      </div>

      {/* Applicant Signature */}
      <div
        className="absolute overflow-hidden flex items-center justify-center pointer-events-none"
        style={{
          left: isUti ? '33.5%' : '33.0%',
          top: isUti ? '75.0%' : '75.0%',
          width: '20.0%',
          height: '15.0%',
        }}
      >
        {data.signatureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.signatureUrl}
            alt="Signature"
            className="max-w-full max-h-full object-contain mix-blend-multiply"
          />
        ) : (
          <span className="text-[7px] text-gray-400 italic">Signature</span>
        )}
      </div>

      {/* High-Density Scannable Dynamic QR Code */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: isUti ? '66.5%' : '66.6%',
          top: '28.5%',
          width: '27.8%',
          height: '43.0%',
        }}
      >
        <div className="w-full h-full p-1 bg-white rounded-[1px] shadow-2xs flex items-center justify-center">
          <CardQrCode value={qrString} size={110} level="M" />
        </div>
      </div>
    </div>
  );
}
