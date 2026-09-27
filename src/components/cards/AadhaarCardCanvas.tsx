'use client';

import React from 'react';
import { AadhaarCardData } from '@/types/cards';
import { AshokaEmblem, GuillochePattern } from '@/components/cards/Emblems';
import CardQrCode from '@/components/cards/CardQrCode';
import { User } from 'lucide-react';

interface AadhaarCardCanvasProps {
  data: AadhaarCardData;
  side?: 'front' | 'back';
  className?: string;
}

export default function AadhaarCardCanvas({
  data,
  side = 'front',
  className = '',
}: AadhaarCardCanvasProps) {
  // Format 12-digit Aadhaar number with standard 4-digit grouping
  const rawNum = (data.aadhaarNumber || '574903267673').replace(/\s+/g, '');
  const formattedAadhaar =
    rawNum.length === 12
      ? `${rawNum.slice(0, 4)} ${rawNum.slice(4, 8)} ${rawNum.slice(8, 12)}`
      : data.aadhaarNumber || '5749 0326 7673';

  // Standard UIDAI XML barcode string for high-density QR code
  const uidaiXml = `<PrintLetterBarcodeData uid="${rawNum}" name="${data.name}" gender="${
    data.gender === 'FEMALE' ? 'F' : 'M'
  }" dob="${data.dateOfBirth}" co="${data.careOf || ''}" house="" street="" dist="" state="" pc=""/>`;

  if (side === 'back') {
    return (
      <div
        className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-amber-50/40 via-white to-blue-50/40 text-navy p-2 flex flex-col justify-between font-sans select-none ${className}`}
      >
        <GuillochePattern opacity={0.12} strokeColor="#E63946" />

        {/* Back Header with Tricolor accent */}
        <div className="border-b border-gray-300 pb-0.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <AshokaEmblem className="w-4 h-6 shrink-0" fill="#1D3557" />
            <div className="leading-none">
              <span className="text-[7.5px] font-bold text-navy block">भारतीय विशिष्ट पहचान प्राधिकरण</span>
              <span className="text-[6.5px] font-semibold text-gray-600 block">
                Unique Identification Authority of India
              </span>
            </div>
          </div>
          <span className="text-[6.5px] font-bold text-crimson uppercase">पता / Address</span>
        </div>

        {/* Address and QR Body */}
        <div className="grid grid-cols-12 gap-2 my-auto items-center">
          {/* Address Details (8 cols) */}
          <div className="col-span-8 space-y-1 text-gray-800 leading-tight">
            {data.careOf && (
              <div className="text-[7.5px]">
                <span className="text-[6px] text-gray-500 font-semibold block">आत्मज / C/O:</span>
                {data.careOfRegional && <span className="block font-medium">{data.careOfRegional}</span>}
                <span className="font-semibold text-navy">{data.careOf}</span>
              </div>
            )}

            <div className="text-[7.5px]">
              <span className="text-[6px] text-gray-500 font-semibold block">पता / Address:</span>
              {data.addressRegional && (
                <p className="line-clamp-2 font-medium text-gray-800 leading-tight">
                  {data.addressRegional}
                </p>
              )}
              <p className="line-clamp-2 text-gray-700 leading-tight">
                {data.address || 'Address Details Pending'}
              </p>
            </div>
          </div>

          {/* Secure QR Code (4 cols) */}
          <div className="col-span-4 flex flex-col items-center justify-center">
            <div className="bg-white p-0.5 rounded border border-gray-300 shadow-2xs">
              <CardQrCode value={uidaiXml} size={50} level="M" />
            </div>
            <span className="text-[5.5px] text-gray-400 mt-0.5 font-mono">UIDAI SECURE QR</span>
          </div>
        </div>

        {/* Back Footer with 1947 Helpline */}
        <div className="border-t border-gray-300 pt-0.5 flex items-center justify-between text-[6px] text-gray-600">
          <div className="flex items-center gap-3">
            <span>Helpline: <strong>1947</strong></span>
            <span>help@uidai.gov.in</span>
            <span>www.uidai.gov.in</span>
          </div>
          <span className="font-bold text-crimson">Aadhaar Card</span>
        </div>
      </div>
    );
  }

  // Front Side Layout
  return (
    <div
      className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-amber-50/50 via-white to-emerald-50/40 text-navy p-2 flex flex-col justify-between font-sans select-none ${className}`}
    >
      <GuillochePattern opacity={0.12} strokeColor="#457B9D" />

      {/* Tricolor Header */}
      <div className="relative z-10 border-b border-navy/20 pb-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AshokaEmblem className="w-4 h-6 shrink-0" fill="#1D3557" />
            <div className="leading-none">
              <div className="text-[8px] font-bold text-navy">भारत सरकार</div>
              <div className="text-[7.5px] font-extrabold text-navy uppercase">
                GOVERNMENT OF INDIA
              </div>
            </div>
          </div>

          <div className="text-right leading-none">
            {/* Aadhaar Logo Graphic placeholder */}
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
              <span className="text-[8px] font-black text-amber-600">आधार</span>
              <span className="text-[8px] font-bold text-navy">AADHAAR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body (Photo on Left, Details in Center, Tagline) */}
      <div className="relative z-10 grid grid-cols-12 gap-2 my-auto items-center">
        {/* Photo Box */}
        <div className="col-span-4 flex flex-col items-center">
          <div className="w-16 h-18 rounded border border-gray-400 bg-white overflow-hidden shadow-xs flex items-center justify-center">
            {data.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.photoUrl}
                alt="Aadhaar Resident Photo"
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

        {/* Resident Demographic Details */}
        <div className="col-span-8 space-y-0.5 text-navy leading-none">
          {/* Name */}
          <div>
            {data.nameRegional && (
              <span className="text-[9px] font-bold block text-navy leading-tight">
                {data.nameRegional}
              </span>
            )}
            <span className="text-[9px] font-extrabold text-gray-900 uppercase block tracking-wide">
              {data.name || 'NAME PENDING'}
            </span>
          </div>

          {/* DOB */}
          <div className="pt-0.5">
            <span className="text-[6px] text-gray-500 block uppercase font-semibold">
              जन्म तिथि / DOB:
            </span>
            <span className="text-[8px] font-bold text-gray-800 font-mono">
              {data.dateOfBirth || 'DD/MM/YYYY'}
            </span>
          </div>

          {/* Gender */}
          <div>
            <span className="text-[6px] text-gray-500 block uppercase font-semibold">
              लिंग / Gender:
            </span>
            <span className="text-[8px] font-semibold text-gray-800">
              {data.genderRegional ? `${data.genderRegional} / ` : ''}
              {data.gender || 'MALE'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Aadhaar Number & Tagline Banner */}
      <div className="relative z-10 border-t border-navy/20 pt-1 flex flex-col items-center">
        <div className="text-[13px] font-black tracking-widest text-burgundy font-mono leading-none">
          {formattedAadhaar}
        </div>
        <div className="text-[7px] font-bold text-steel-blue mt-0.5 tracking-wider">
          मेरा आधार, मेरी पहचान
        </div>
      </div>
    </div>
  );
}
