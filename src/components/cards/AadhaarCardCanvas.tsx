'use client';

import React from 'react';
import { AadhaarCardData } from '@/types/cards';
import CardQrCode from '@/components/cards/CardQrCode';
import { User } from 'lucide-react';

interface AadhaarCardCanvasProps {
  data: AadhaarCardData;
  side?: 'front' | 'back' | 'sheet';
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
  const uidaiXml = `<PrintLetterBarcodeData uid="${rawNum}" name="${data.name || ''}" gender="${
    data.gender === 'FEMALE' ? 'F' : 'M'
  }" dob="${data.dateOfBirth || ''}" co="${data.careOf || ''}" house="" street="" dist="" state="" pc=""/>`;

  const frontAsset = '/assets/aadhar/aadhar-pvc-front.jpg';
  const backAsset = '/assets/aadhar/aadhar-pvc-back.jpg';
  const sheetAsset = '/assets/aadhar/aadhar-pvc-sheet.jpg';

  /* -------------------------------------------------------------
   * 1. FULL SIDE-BY-SIDE SHEET MODE (newaadhar.php 1:1 match)
   * ----------------------------------------------------------- */
  if (side === 'sheet') {
    return (
      <div
        className={`w-full h-full relative overflow-hidden select-none bg-white font-sans ${className}`}
        style={{
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {/* Authentic Background Sheet (988x311) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sheetAsset}
          alt="Aadhaar PVC Sheet"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        />

        {/* ---------------- FRONT HALF (Left: 0 to 50%) ---------------- */}
        {/* Main Photo */}
        <div
          className="absolute overflow-hidden rounded-[2px] bg-white border border-gray-400 shadow-2xs flex items-center justify-center"
          style={{
            left: '4.25%',
            top: '26.7%',
            width: '12.15%',
            height: '47.3%',
          }}
        >
          {data.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photoUrl} alt="Resident" className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-gray-400" />
          )}
        </div>

        {/* Ghost Photo Watermark */}
        {data.photoUrl && (
          <div
            className="absolute overflow-hidden opacity-60 filter grayscale pointer-events-none"
            style={{
              left: '42.0%',
              top: '25.7%',
              width: '4.0%',
              height: '16.0%',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.photoUrl} alt="Ghost" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Resident Details */}
        <div
          className="absolute flex flex-col justify-start leading-none text-black"
          style={{
            left: '17.7%',
            top: '27.0%',
            width: '23.0%',
          }}
        >
          {data.nameRegional && (
            <span className="text-[8.5px] font-bold block text-black truncate">
              {data.nameRegional}
            </span>
          )}
          <span className="text-[8.5px] font-bold block text-black uppercase truncate mt-0.5">
            {data.name || 'NAME PENDING'}
          </span>

          <div className="mt-1.5 text-[7px] text-gray-900 font-bold leading-tight">
            <span>{data.dateOfBirthRegional || 'जन्म तिथि'}/DOB: </span>
            <span className="font-mono">{data.dateOfBirth || 'DD/MM/YYYY'}</span>
          </div>

          <div className="mt-1 text-[7px] text-gray-900 font-bold leading-tight">
            <span>{data.genderRegional || (data.gender === 'FEMALE' ? 'महिला' : 'पुरुष')} / </span>
            <span>{data.gender || 'MALE'}</span>
          </div>
        </div>

        {/* Front Aadhaar Number */}
        <div
          className="absolute text-center font-black font-mono tracking-widest text-[#1D3557] text-[13px] leading-none"
          style={{
            left: '21.0%',
            bottom: '7.5%',
            transform: 'translateX(-50%)',
          }}
        >
          {formattedAadhaar}
        </div>

        {/* ---------------- BACK HALF (Right: 50% to 100%) ---------------- */}
        {/* Address Details */}
        <div
          className="absolute flex flex-col justify-start leading-tight text-black text-[6.5px]"
          style={{
            left: '52.5%',
            top: '23.0%',
            width: '26.0%',
          }}
        >
          <span className="font-extrabold text-black block">पता / Address:</span>
          {data.careOf && (
            <span className="font-bold text-gray-900 block mt-0.5 truncate">
              {data.careOfRegional ? `${data.careOfRegional} / ` : ''}{data.careOf}
            </span>
          )}
          {data.addressRegional && (
            <span className="font-medium text-gray-800 line-clamp-2 mt-0.5">
              {data.addressRegional}
            </span>
          )}
          <span className="font-medium text-gray-800 line-clamp-2 mt-0.5 uppercase">
            {data.address || 'Address Details Pending'}
          </span>
        </div>

        {/* Back Secure QR Code */}
        <div
          className="absolute bg-white p-0.5 border border-gray-300 rounded-xs shadow-2xs flex items-center justify-center"
          style={{
            left: '81.5%',
            top: '23.0%',
            width: '14.5%',
            height: '46.0%',
          }}
        >
          <CardQrCode value={uidaiXml} size={68} level="M" />
        </div>

        {/* Back Aadhaar Number */}
        <div
          className="absolute text-center font-black font-mono tracking-widest text-[#1D3557] text-[13px] leading-none"
          style={{
            left: '71.0%',
            bottom: '7.5%',
            transform: 'translateX(-50%)',
          }}
        >
          {formattedAadhaar}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 2. BACK SIDE LAYOUT (Standard CR80 85.60mm x 53.98mm)
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
          alt="Aadhaar PVC Back"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        />

        {/* Address Details Block */}
        <div
          className="absolute flex flex-col justify-start leading-tight text-black text-[7px]"
          style={{
            left: '5.5%',
            top: '23.0%',
            width: '53.0%',
          }}
        >
          <span className="font-extrabold text-black block">पता / Address:</span>
          {data.careOf && (
            <span className="font-bold text-gray-900 block mt-0.5 truncate">
              {data.careOfRegional ? `${data.careOfRegional} / ` : ''}{data.careOf}
            </span>
          )}
          {data.addressRegional && (
            <span className="font-medium text-gray-800 line-clamp-2 mt-0.5">
              {data.addressRegional}
            </span>
          )}
          <span className="font-medium text-gray-800 line-clamp-2 mt-0.5 uppercase">
            {data.address || 'Address Details Pending'}
          </span>
        </div>

        {/* Back Secure QR Code */}
        <div
          className="absolute bg-white p-0.5 border border-gray-300 rounded-xs shadow-2xs flex items-center justify-center"
          style={{
            right: '6.0%',
            top: '23.0%',
            width: '30.0%',
            height: '48.0%',
          }}
        >
          <CardQrCode value={uidaiXml} size={68} level="M" />
        </div>

        {/* Back Aadhaar Number */}
        <div
          className="absolute text-center font-black font-mono tracking-widest text-[#1D3557] text-[13px] leading-none"
          style={{
            left: '50%',
            bottom: '7.5%',
            transform: 'translateX(-50%)',
          }}
        >
          {formattedAadhaar}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 3. FRONT SIDE LAYOUT (Standard CR80 85.60mm x 53.98mm)
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
        alt="Aadhaar PVC Front"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      />

      {/* Main Resident Photo */}
      <div
        className="absolute overflow-hidden rounded-[2px] bg-white border border-gray-400 shadow-2xs flex items-center justify-center"
        style={{
          left: '8.5%',
          top: '26.7%',
          width: '24.3%',
          height: '47.3%',
        }}
      >
        {data.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.photoUrl} alt="Resident" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <User className="w-7 h-7" />
            <span className="text-[6px] uppercase font-bold mt-0.5">Photo</span>
          </div>
        )}
      </div>

      {/* Ghost Photo Watermark */}
      {data.photoUrl && (
        <div
          className="absolute overflow-hidden opacity-60 filter grayscale pointer-events-none"
          style={{
            right: '8.0%',
            top: '25.7%',
            width: '8.1%',
            height: '16.0%',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.photoUrl} alt="Ghost" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Resident Details */}
      <div
        className="absolute flex flex-col justify-start leading-none text-black"
        style={{
          left: '35.5%',
          top: '27.0%',
          width: '46.0%',
        }}
      >
        {data.nameRegional && (
          <span className="text-[9px] font-bold block text-black truncate">
            {data.nameRegional}
          </span>
        )}
        <span className="text-[9px] font-bold block text-black uppercase truncate mt-0.5">
          {data.name || 'NAME PENDING'}
        </span>

        <div className="mt-1.5 text-[7.5px] text-gray-900 font-bold leading-tight">
          <span>{data.dateOfBirthRegional || 'जन्म तिथि'}/DOB: </span>
          <span className="font-mono">{data.dateOfBirth || 'DD/MM/YYYY'}</span>
        </div>

        <div className="mt-1 text-[7.5px] text-gray-900 font-bold leading-tight">
          <span>{data.genderRegional || (data.gender === 'FEMALE' ? 'महिला' : 'पुरुष')} / </span>
          <span>{data.gender || 'MALE'}</span>
        </div>
      </div>

      {/* Front Aadhaar Number */}
      <div
        className="absolute text-center font-black font-mono tracking-widest text-[#1D3557] text-[13.5px] leading-none"
        style={{
          left: '50%',
          bottom: '7.5%',
          transform: 'translateX(-50%)',
        }}
      >
        {formattedAadhaar}
      </div>
    </div>
  );
}
