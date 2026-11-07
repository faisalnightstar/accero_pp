'use client';

import React from 'react';
import { AadhaarCardData } from '@/types/cards';
import { AADHAAR_LANGUAGES, AadhaarLanguageCode } from '@/lib/aadhaarLanguages';
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

  // Active language configuration
  const langKey = ((data.language || 'HI').toUpperCase()) as AadhaarLanguageCode;
  const langConfig = AADHAAR_LANGUAGES[langKey] || AADHAAR_LANGUAGES.HI;

  const frontAsset = langConfig.cardFrontAsset || '/assets/aadhar/cards/hi_front.jpg';
  const backAsset = langConfig.cardBackAsset || '/assets/aadhar/cards/hi_back.jpg';
  const sheetAsset = langConfig.sheetAsset || '/assets/aadhar/HI.jpg';

  // Standard UIDAI XML barcode string for high-density QR code
  const uidaiXml = `<PrintLetterBarcodeData uid="${rawNum}" name="${data.name || ''}" gender="${
    data.gender === 'FEMALE' ? 'F' : 'M'
  }" dob="${data.dateOfBirth || ''}" co="${data.careOf || ''}" house="" street="" dist="" state="" pc=""/>`;

  // Guard against date value erroneously passed into regional DOB label field
  const isDateValue = (val?: string) => Boolean(val && /\d/.test(val));
  const dobLabel =
    data.labelDobRegional ||
    (data.dateOfBirthRegional && !isDateValue(data.dateOfBirthRegional)
      ? data.dateOfBirthRegional.trim()
      : langConfig.labels.dob);

  // Synchronize regional gender with primary English gender
  const isFemale = (data.gender || '').toUpperCase() === 'FEMALE';
  const isTransgender = (data.gender || '').toUpperCase() === 'TRANSGENDER';
  const defaultGenderRegional = isTransgender
    ? langConfig.labels.transgender
    : isFemale
    ? langConfig.labels.female
    : langConfig.labels.male;

  let resolvedGenderRegional = data.genderRegional?.trim() || defaultGenderRegional;
  if (isFemale && resolvedGenderRegional === langConfig.labels.male) {
    resolvedGenderRegional = langConfig.labels.female;
  } else if (!isFemale && !isTransgender && resolvedGenderRegional === langConfig.labels.female) {
    resolvedGenderRegional = langConfig.labels.male;
  }

  const addressLabel = data.labelAddressRegional || langConfig.labels.address;
  const isFullSheet = data.layoutFormat === 'sheet';

  /* -------------------------------------------------------------
   * 1. FULL OFFICIAL A4 e-AADHAAR SHEET MODE (aadhar.php match)
   * ----------------------------------------------------------- */
  if (side === 'sheet' && isFullSheet) {
    return (
      <div
        className={`w-full h-full relative overflow-hidden select-none bg-white font-sans ${className}`}
        style={{
          aspectRatio: '2480 / 3508',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {/* Authentic Background Sheet (e.g. HI.jpg, BN.jpg, GU.jpg) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sheetAsset}
          alt={`Aadhaar e-Aadhaar Sheet - ${langConfig.name}`}
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        />

        {/* Enrollment Number in Upper Letterhead */}
        <div
          className="absolute font-semibold text-gray-900 text-[9px] tracking-wide"
          style={{
            left: '30.8%',
            top: '27.0%',
          }}
        >
          {data.enrollmentNo || '1429/70044/00201'}
        </div>

        {/* Resident Delivery Address in Upper Letterhead */}
        <div
          className="absolute flex flex-col justify-start text-[7.5px] leading-tight text-gray-900 font-sans"
          style={{
            left: '10.5%',
            top: '29.5%',
            width: '28.0%',
          }}
        >
          <span className="font-bold text-gray-700">To</span>
          {data.nameRegional && (
            <span className="font-bold text-black mt-0.5 truncate">{data.nameRegional}</span>
          )}
          <span className="font-bold text-black uppercase mt-0.5 truncate">{data.name || 'RESIDENT NAME'}</span>
          {data.careOf && (
            <span className="text-gray-800 mt-0.5 truncate">
              {data.careOfRegional ? `${data.careOfRegional} / ` : ''}{data.careOf}
            </span>
          )}
          <span className="text-gray-800 line-clamp-3 mt-0.5">
            {data.addressRegional || data.address || 'Address Details Pending'}
          </span>
        </div>

        {/* Upper Aadhaar Number */}
        <div
          className="absolute font-black font-mono tracking-widest text-[#1D3557] text-[13px] leading-none"
          style={{
            left: '16.0%',
            top: '67.4%',
          }}
        >
          {formattedAadhaar}
        </div>

        {/* Upper Mini QR Code */}
        <div
          className="absolute bg-white p-0.5 border border-gray-300 rounded-xs shadow-2xs flex items-center justify-center"
          style={{
            left: '27.5%',
            top: '52.6%',
            width: '9.0%',
            height: '6.4%',
          }}
        >
          <CardQrCode value={uidaiXml} size={50} level="M" />
        </div>

        {/* ---------------- BOTTOM DETACHABLE CARD (LEFT: FRONT) ---------------- */}
        {/* Main Photo */}
        <div
          className="absolute overflow-hidden rounded-[2px] bg-white border border-gray-400 shadow-2xs flex items-center justify-center"
          style={{
            left: '4.8%',
            top: '73.2%',
            width: '10.5%',
            height: '14.0%',
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
              left: '42.2%',
              top: '73.2%',
              width: '3.6%',
              height: '4.8%',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.photoUrl} alt="Ghost" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Front Resident Details */}
        <div
          className="absolute flex flex-col justify-start leading-none text-black"
          style={{
            left: '16.6%',
            top: '73.2%',
            width: '24.0%',
          }}
        >
          {data.nameRegional && (
            <span className="text-[7.5px] font-bold block text-black truncate">
              {data.nameRegional}
            </span>
          )}
          <span className="text-[7.5px] font-bold block text-black uppercase truncate mt-0.5">
            {data.name || 'NAME PENDING'}
          </span>

          <div className="mt-1 text-[6.5px] text-gray-900 font-bold leading-tight">
            <span>{dobLabel} / DOB: </span>
            <span className="font-mono">{data.dateOfBirth || 'DD/MM/YYYY'}</span>
          </div>

          <div className="mt-1 text-[6.5px] text-gray-900 font-bold leading-tight">
            <span>{resolvedGenderRegional} / </span>
            <span>{data.gender || 'MALE'}</span>
          </div>
        </div>

        {/* Front Bottom Aadhaar Number */}
        <div
          className="absolute text-center font-black font-mono tracking-widest text-[#1D3557] text-[12px] leading-none"
          style={{
            left: '24.0%',
            bottom: '7.8%',
            transform: 'translateX(-50%)',
          }}
        >
          {formattedAadhaar}
        </div>

        {/* ---------------- BOTTOM DETACHABLE CARD (RIGHT: BACK) ---------------- */}
        {/* Back Address Block */}
        <div
          className="absolute flex flex-col justify-start leading-tight text-black text-[6px]"
          style={{
            left: '53.5%',
            top: '72.8%',
            width: '26.0%',
          }}
        >
          <span className="font-extrabold text-black block">{addressLabel}:</span>
          {data.careOf && (
            <span className="font-bold text-gray-900 block mt-0.5 truncate">
              {data.careOfRegional ? `${data.careOfRegional}` : ''}
            </span>
          )}
          {data.addressRegional && (
            <span className="font-medium text-gray-800 line-clamp-2 mt-0.5">
              {data.addressRegional}
            </span>
          )}

          <span className="font-extrabold text-black block mt-1">Address:</span>
          {data.careOf && (
            <span className="font-bold text-gray-900 block mt-0.5 truncate">
              {data.careOf}
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
            top: '72.5%',
            width: '13.5%',
            height: '13.5%',
          }}
        >
          <CardQrCode value={uidaiXml} size={65} level="M" />
        </div>

        {/* Back Bottom Aadhaar Number */}
        <div
          className="absolute text-center font-black font-mono tracking-widest text-[#1D3557] text-[12px] leading-none"
          style={{
            left: '73.0%',
            bottom: '7.8%',
            transform: 'translateX(-50%)',
          }}
        >
          {formattedAadhaar}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 2. SIDE-BY-SIDE PVC TRAY MODE (2-in-1 Sheet)
   * ----------------------------------------------------------- */
  if (side === 'sheet') {
    return (
      <div
        className={`w-full h-full relative overflow-hidden select-none bg-white font-sans ${className}`}
        style={{
          aspectRatio: '988 / 311',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {/* Left Card: FRONT */}
        <div className="absolute left-0 top-0 w-1/2 h-full overflow-hidden border-r border-gray-200">
          <AadhaarCardCanvas data={data} side="front" />
        </div>

        {/* Right Card: BACK */}
        <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden">
          <AadhaarCardCanvas data={data} side="back" />
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 3. BACK SIDE LAYOUT (Standard CR80 85.60mm x 53.98mm)
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
          alt={`Aadhaar PVC Back - ${langConfig.name}`}
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        />

        {/* Address Details Block */}
        <div
          className="absolute flex flex-col justify-start leading-tight text-black text-[7px]"
          style={{
            left: '5.5%',
            top: '28.0%',
            width: '50.0%',
          }}
        >
          <div>
            <span className="font-extrabold text-black block">{addressLabel}:</span>
            {data.careOf && (
              <span className="font-bold text-gray-900 block mt-0.5 truncate">
                {data.careOfRegional ? `${data.careOfRegional}` : ''}
              </span>
            )}
            {data.addressRegional && (
              <span className="font-medium text-gray-800 line-clamp-2 mt-0.5">
                {data.addressRegional}
              </span>
            )}
          </div>
          <div className="mt-1">
            <span className="font-extrabold text-black block">Address:</span>
            {data.careOf && (
              <span className="font-bold text-gray-900 block mt-0.5 truncate">
                {data.careOf}
              </span>
            )}
            <span className="font-medium text-gray-800 line-clamp-2 mt-0.5 uppercase">
              {data.address || 'Address Details Pending'}
            </span>
          </div>
        </div>

        {/* Back Secure QR Code */}
        <div
          className="absolute bg-white p-0.5 border border-gray-300 rounded-xs shadow-2xs flex items-center justify-center"
          style={{
            right: '4%',
            top: '19%',
            width: '37.2%',
            height: '56%',
          }}
        >
          <CardQrCode value={uidaiXml} size={100} level="M" />
        </div>

        {/* Back Aadhaar Number */}
        <div
          className="absolute text-center font-black font-mono tracking-widest text-[#1D3557] text-[13px] leading-none"
          style={{
            left: '50%',
            bottom: '16.5%',
            transform: 'translateX(-50%)',
          }}
        >
          {formattedAadhaar}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 4. FRONT SIDE LAYOUT (Standard CR80 85.60mm x 53.98mm)
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
        alt={`Aadhaar PVC Front - ${langConfig.name}`}
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      />

      {/* Main Resident Photo */}
      <div
        className="absolute overflow-hidden rounded-[2px] bg-white border border-gray-400 shadow-2xs flex items-center justify-center"
        style={{
          left: '4.6%',
          top: '23.9%',
          width: '27%',
          height: '52%',
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
            right: '5.0%',
            top: '24.5%',
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
          <span>{dobLabel} / DOB: </span>
          <span className="font-mono">{data.dateOfBirth || 'DD/MM/YYYY'}</span>
        </div>

        <div className="mt-1 text-[7.5px] text-gray-900 font-bold leading-tight">
          <span>{resolvedGenderRegional} / </span>
          <span>{data.gender || 'MALE'}</span>
        </div>
      </div>

      {/* Front Aadhaar Number */}
      <div
        className="absolute text-center font-black font-mono tracking-widest text-[#1D3557] text-[13.5px] leading-none"
        style={{
          left: '53%',
          bottom: '16.5%',
          transform: 'translateX(-50%)',
        }}
      >
        {formattedAadhaar}
      </div>
    </div>
  );
}
