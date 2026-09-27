'use client';

import React from 'react';
import { PanCardData } from '@/types/cards';
import { AshokaEmblem, GuillochePattern } from '@/components/cards/Emblems';
import CardQrCode from '@/components/cards/CardQrCode';
import { User } from 'lucide-react';

interface PanCardCanvasProps {
  data: PanCardData;
  side?: 'front' | 'back';
  className?: string;
}

export default function PanCardCanvas({
  data,
  side = 'front',
  className = '',
}: PanCardCanvasProps) {
  // QR payload formatted to standard NSDL/Income Tax string
  const qrString =
    data.qrData ||
    `PAN:${data.panNumber}|NAME:${data.fullName}|FATHER:${data.fatherName}|DOB:${data.dateOfBirth}`;

  if (side === 'back') {
    return (
      <div
        className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-amber-50 text-navy p-3 flex flex-col justify-between font-sans select-none ${className}`}
      >
        <GuillochePattern opacity={0.12} strokeColor="#457B9D" />

        {/* Back Header */}
        <div className="border-b border-gray-300 pb-1 flex items-center justify-between text-[7px] text-gray-700 font-semibold tracking-wide">
          <span>INCOME TAX DEPARTMENT</span>
          <span>GOVT. OF INDIA</span>
        </div>

        {/* Instructions Body */}
        <div className="space-y-1 text-[7px] text-gray-700 leading-tight">
          <p>
            1. This card is the property of the Income Tax Department, Government of India.
          </p>
          <p>
            2. If found, please return to: Income Tax PAN Services Unit, NSDL e-Governance Infrastructure Limited, 5th Floor, Mantri Sterling, Plot No. 341, Survey No. 997, Model Colony, Near Deep Bungalow Chowk, Pune - 411 016.
          </p>
          <p>
            3. Possession of more than one PAN card is illegal and liable to a penalty under Section 272B of the Income Tax Act, 1961.
          </p>
        </div>

        {/* Barcode & Footer info */}
        <div className="border-t border-gray-300 pt-1 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[6px] text-gray-500">Toll Free: 1800 180 1961</span>
            <span className="text-[6px] text-gray-500">Website: www.incometax.gov.in</span>
          </div>
          {/* Simulated Code 128 Barcode */}
          <div className="flex flex-col items-center">
            <div className="h-4 w-28 bg-white border border-gray-300 flex items-center justify-center tracking-widest font-mono text-[7px] text-gray-800">
              *{data.panNumber}*
            </div>
            <span className="text-[6px] font-mono text-gray-500 mt-0.5">{data.panNumber}</span>
          </div>
        </div>
      </div>
    );
  }

  // Front Side Layout
  return (
    <div
      className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-amber-50/60 text-navy p-2.5 flex flex-col justify-between font-sans select-none ${className}`}
    >
      <GuillochePattern opacity={0.14} strokeColor="#457B9D" />

      {/* Top Banner Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-navy/20 pb-1">
        <div className="flex items-center gap-1.5">
          <AshokaEmblem className="w-5 h-7 shrink-0" fill="#1D3557" />
          <div className="leading-none">
            <div className="text-[7.5px] font-bold tracking-tight text-navy">
              आयकर विभाग
            </div>
            <div className="text-[8px] font-extrabold tracking-tight text-burgundy uppercase">
              INCOME TAX DEPARTMENT
            </div>
          </div>
        </div>

        <div className="text-right leading-none">
          <div className="text-[7.5px] font-bold text-navy">
            भारत सरकार
          </div>
          <div className="text-[8px] font-extrabold text-navy uppercase">
            GOVT. OF INDIA
          </div>
        </div>
      </div>

      {/* Main Body (Photo, Details, QR) */}
      <div className="relative z-10 grid grid-cols-12 gap-2 my-auto items-center">
        {/* Photo Column (3 cols) */}
        <div className="col-span-3 flex flex-col items-center">
          <div className="w-14 h-16 rounded border border-gray-400 bg-white overflow-hidden shadow-xs flex items-center justify-center">
            {data.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.photoUrl}
                alt="PAN Photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <User className="w-7 h-7" />
                <span className="text-[6px] uppercase font-semibold">Photo</span>
              </div>
            )}
          </div>
        </div>

        {/* Middle Details Column (6 cols) */}
        <div className="col-span-6 space-y-0.5 text-navy leading-none">
          {/* Name */}
          <div>
            <span className="text-[6px] text-gray-500 uppercase font-semibold block">
              नाम / Name
            </span>
            <span className="text-[9px] font-bold uppercase truncate block tracking-wide">
              {data.fullName || 'NAME PENDING'}
            </span>
          </div>

          {/* Father's Name */}
          <div>
            <span className="text-[6px] text-gray-500 uppercase font-semibold block">
              पिता का नाम / Father&apos;s Name
            </span>
            <span className="text-[8px] font-semibold uppercase truncate block text-gray-800">
              {data.fatherName || 'FATHER NAME PENDING'}
            </span>
          </div>

          {/* DOB */}
          <div>
            <span className="text-[6px] text-gray-500 uppercase font-semibold block">
              जन्म की तारीख / Date of Birth
            </span>
            <span className="text-[8.5px] font-bold font-mono text-gray-900 block">
              {data.dateOfBirth || 'DD/MM/YYYY'}
            </span>
          </div>
        </div>

        {/* Right QR Column (3 cols) */}
        <div className="col-span-3 flex flex-col items-center justify-center">
          <div className="bg-white p-0.5 rounded border border-gray-300 shadow-2xs">
            <CardQrCode value={qrString} size={48} level="M" />
          </div>
        </div>
      </div>

      {/* Bottom PAN Number & Signature Banner */}
      <div className="relative z-10 border-t border-navy/20 pt-1 flex items-end justify-between">
        <div>
          <span className="text-[6px] text-gray-500 font-semibold block uppercase leading-none">
            स्थायी लेखा संख्या कार्ड / PAN Number
          </span>
          <span className="text-[12px] font-black tracking-widest text-burgundy font-mono leading-none">
            {data.panNumber || 'ABCDE1234F'}
          </span>
        </div>

        {/* Signature Box */}
        <div className="w-24 h-6 border-b border-gray-700 bg-white/70 flex items-center justify-center overflow-hidden">
          {data.signatureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.signatureUrl}
              alt="Signature"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-[7px] text-gray-400 italic">Signature</span>
          )}
        </div>
      </div>
    </div>
  );
}
