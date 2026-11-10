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

const COMMA_SERIF_REGULAR =
  '"Comma Serif Regular", "Comma Serif", "Noto Serif", "DejaVu Serif", Georgia, serif';

const ROCKWELL_NUMBER_FONT =
  '"Rockwell", "Rockwell Nova", "GeoSlab703 Md BT", "Roboto Slab", serif';

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
  const uidaiXml = `<PrintLetterBarcodeData uid="${rawNum}" name="${data.name || ''}" gender="${data.gender === 'FEMALE' ? 'F' : 'M'
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

  // Format continuous address text ensuring Care Of flows inline into the address
  const formatAddressLine = (careOf?: string, address?: string) => {
    const co = (careOf || '').trim().replace(/[,;:\-\s]+$/, '');
    const addr = (address || '').trim().replace(/^[,;:\-\s]+/, '');
    if (!co && !addr) return '';
    if (!co) return addr;
    if (!addr) return co;
    return `${co}, ${addr}`;
  };

  const regionalAddressText = formatAddressLine(
    data.careOfRegional || data.careOf,
    data.addressRegional || data.address || 'Address Details Pending'
  );

  const englishAddressText = formatAddressLine(
    data.careOf,
    data.address || 'Address Details Pending'
  );

  /* -------------------------------------------------------------
   * 1. FULL OFFICIAL A4 e-AADHAAR SHEET MODE (aadhar.php match)
   * ----------------------------------------------------------- */
  if (side === 'sheet' && isFullSheet) {
    return (
      <div
        className={`w-full h-full relative overflow-hidden select-none bg-white font-aadhaar ${className}`}
        style={{
          aspectRatio: '2480 / 3508',
          fontFamily: COMMA_SERIF_REGULAR,
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
          className="absolute font-semibold text-gray-900 text-[11px] tracking-wide"
          style={{
            left: '29.0%',
            top: '30.5%',
            fontFamily: COMMA_SERIF_REGULAR,
          }}
        >
          {data.enrollmentNo || '1429/70044/00201'}
        </div>

        {/* Resident Delivery Address in Upper Letterhead */}
        <div
          className="absolute flex flex-col justify-start text-[7.5px] leading-tight text-gray-900 font-aadhaar line-clamp-none whitespace-normal"
          style={{
            left: '10.5%',
            top: '34.5%',
            width: '15.0%',
            fontFamily: COMMA_SERIF_REGULAR,
          }}
        >
          <span className="font-semibold text-gray-900">To</span>
          {data.nameRegional && (
            <span className="font-semibold text-black mt-0.5">{data.nameRegional}</span>
          )}
          <span className="font-semibold text-black capitalize mt-0.5">{data.name || 'RESIDENT NAME'}</span>
          {data.careOf && (
            <span className="text-gray-800 mt-0.5 truncate">
              {data.careOf ? `${data.careOf} ` : `${data.careOfRegional}`}
            </span>
          )}
          <span className="text-gray-800 line-clamp-3 mt-0.5">
            {data.address || data.addressRegional || 'Address Details Pending'}
          </span>
        </div>

        {/* Digital Signature verification */}
        <div
          className="absolute font-normal text-[#000000] leading-none flex flex-col"
          style={{
            left: '9%',
            top: '49.0%',
            width: '9%',
            fontFamily: ROCKWELL_NUMBER_FONT,
          }}>
          <span className='font-normal font-sans text-[7.5px]'>Signature valid</span>
          <span className='text-[4.0px] font-sans'>Digitally sign by DS Unique Identification Authority of India</span>
          <span className='text-[4.0px] font-sans'>06</span>
          <span className='text-[4.0px] font-sans'>Date: {new Date().getFullYear().toString().padStart(2, '0') + '.' + new Date().getMonth().toString().padStart(2, '0') + '.' + new Date().getDate().toString().padStart(2, '0') + ' ' + new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0') + ':' + new Date().getSeconds().toString().padStart(2, '0')}</span>
        </div>


        {/* Upper Aadhaar Number */}
        <div
          className="absolute font-black tracking-widest text-[#000000] text-[13px] leading-none"
          style={{
            left: '17.5%',
            top: '62%',
            fontFamily: ROCKWELL_NUMBER_FONT,
          }}
        >
          {formattedAadhaar}
        </div>

        {/* Upper Mini QR Code */}
        <div
          className="absolute bg-white rounded-xs shadow-2xs flex items-center justify-center"
          style={{
            left: '30.5%',
            top: '47.6%',
            width: '15%',
            height: '10%',
          }}
        >
          <CardQrCode value={uidaiXml} size={114} level="M" />
        </div>

        {/* ---------------- BOTTOM DETACHABLE CARD (LEFT: FRONT) ---------------- */}
        {/* Main Photo */}
        <div
          className="absolute overflow-hidden bg-white shadow-2xs flex items-center justify-center"
          style={{
            left: '7%',
            top: '72.5%',
            width: '8.5%',
            height: '7.0%',
          }}
        >
          {data.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photoUrl} alt="Resident" className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-gray-400" />
          )}
        </div>



        {/* Front Resident Details */}
        <div
          className="absolute flex flex-col justify-start leading-none text-black font-aadhaar"
          style={{
            left: '16.6%',
            top: '73.2%',
            width: '24.0%',
            fontFamily: COMMA_SERIF_REGULAR,
          }}
        >
          {data.nameRegional && (
            <span className="text-[7.5px] font-medium block text-black truncate">
              {data.nameRegional}
            </span>
          )}
          <span className="text-[7.5px] font-medium block text-black capitalize truncate mt-0.5">
            {data.name || 'NAME PENDING'}
          </span>

          <div className="text-[7.5px] font-medium block text-black capitalize truncate mt-0.5">
            <span>{dobLabel} / DOB: </span>
            <span style={{ fontFamily: ROCKWELL_NUMBER_FONT }}>{data.dateOfBirth || 'DD/MM/YYYY'}</span>
          </div>

          <div className="text-[7.5px] font-medium block text-black capitalize truncate mt-0.5">
            <span>{resolvedGenderRegional} / </span>
            <span>{data.gender || 'MALE'}</span>
          </div>
        </div>

        {/* Front Bottom Aadhaar Number */}
        <div
          className="absolute text-center font-black tracking-widest text-[#000000] text-[12px] leading-none"
          style={{
            left: '27.0%',
            bottom: '15%',
            transform: 'translateX(-50%)',
            fontFamily: ROCKWELL_NUMBER_FONT,
          }}
        >
          {formattedAadhaar}
        </div>

        {/* ---------------- BOTTOM DETACHABLE CARD (RIGHT: BACK) ---------------- */}
        {/* Back Address Block */}
        <div
          className="absolute flex flex-col justify-start text-black font-aadhaar"
          style={{
            left: '53.0%',
            top: '72.0%',
            width: '23.5%',
            fontFamily: COMMA_SERIF_REGULAR,
            fontSize: '7.5px',
            lineHeight: 1.1,
          }}
        >
          <div>
            <span className="font-medium text-black block">{addressLabel}:</span>
            <p className="font-medium text-gray-900 mt-0.5 break-words">
              {regionalAddressText}
            </p>
          </div>

          <div className="mt-1">
            <span className="font-medium text-black block">Address:</span>
            <p className="font-medium text-gray-900 mt-0.5 break-words">
              {englishAddressText}
            </p>
          </div>
        </div>

        {/* Back Secure QR Code */}
        <div
          className="absolute bg-white rounded-xs shadow-2xs flex items-center justify-center"
          style={{
            left: '78%',
            top: '72.5%',
            width: '14.0%',
            height: '10%',
          }}
        >
          <CardQrCode value={uidaiXml} size={180} level="M" />
        </div>

        {/* Back Bottom Aadhaar Number */}
        <div
          className="absolute text-center font-black tracking-widest text-[#000000] text-[12px] leading-none"
          style={{
            left: '73.0%',
            bottom: '15%',
            transform: 'translateX(-50%)',
            fontFamily: ROCKWELL_NUMBER_FONT,
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
        className={`w-full h-full relative overflow-hidden select-none bg-white font-aadhaar ${className}`}
        style={{
          aspectRatio: '988 / 311',
          fontFamily: COMMA_SERIF_REGULAR,
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
        className={`w-full h-full relative overflow-hidden select-none bg-white font-aadhaar ${className}`}
        style={{
          fontFamily: COMMA_SERIF_REGULAR,
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
          className="absolute flex flex-col justify-start text-black font-aadhaar"
          style={{
            left: '3.5%',
            top: '22.0%',
            width: '53.0%',
            fontFamily: COMMA_SERIF_REGULAR,
            fontSize: '6.8px',
            lineHeight: 1.25,
          }}
        >
          <div>
            <span className="font-extrabold text-black block">{addressLabel}:</span>
            <p className="font-bold text-gray-900 mt-0.5 break-words">
              {regionalAddressText}
            </p>
          </div>
          <div className="mt-1">
            <span className="font-extrabold text-black block">Address:</span>
            <p className="font-bold text-gray-900 mt-0.5 break-words">
              {englishAddressText}
            </p>
          </div>
        </div>

        {/* Back Secure QR Code */}
        <div
          className="absolute bg-white p-0.5 flex items-center justify-center"
          style={{
            right: '3.1%',
            top: '21%',
            width: '38.2%',
            height: '54.6%',
          }}
        >
          <CardQrCode value={uidaiXml} size={109} level="M" />
        </div>

        {/* Back Aadhaar Number */}
        <div
          className="absolute text-center font-extrabold text-[#000000] text-[13.5px] leading-none"
          style={{
            left: '50%',
            bottom: '16.50%',
            transform: 'translateX(-50%)',
            fontFamily: ROCKWELL_NUMBER_FONT,
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
      className={`w-full h-full relative overflow-hidden select-none bg-white font-aadhaar ${className}`}
      style={{
        fontFamily: COMMA_SERIF_REGULAR,
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
        className="absolute overflow-hidden rounded-[2px] bg-white shadow-2xs flex items-center justify-center"
        style={{
          left: '4.35%',
          top: '23.7%',
          width: '27%',
          height: '50.1%',
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
            right: '4.0%',
            top: '23.9%',
            width: '8.3%',
            height: '15.1%',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.photoUrl} alt="Ghost" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Resident Details */}
      <div
        className="absolute flex flex-col justify-start leading-none text-black font-aadhaar"
        style={{
          left: '35.5%',
          top: '27.0%',
          width: '46.0%',
          fontFamily: COMMA_SERIF_REGULAR,
        }}
      >
        {data.nameRegional && (
          <span className="text-[9px] font-bold block text-black truncate">
            {data.nameRegional}
          </span>
        )}
        <span className="text-[9px] font-bold block text-black capitalize truncate mt-0.5">
          {data.name || 'NAME PENDING'}
        </span>

        <div className="mt-1.5 text-[7.5px] text-gray-900 font-bold leading-tight">
          <span>{dobLabel} / DOB: </span>
          <span style={{ fontFamily: ROCKWELL_NUMBER_FONT }}>{data.dateOfBirth || 'DD/MM/YYYY'}</span>
        </div>

        <div className="mt-1 text-[7.5px] text-gray-900 font-bold leading-tight">
          <span>{resolvedGenderRegional} / </span>
          <span>{data.gender || 'MALE'}</span>
        </div>
      </div>

      {/* Front Aadhaar Number */}
      <div
        className="absolute text-center text-[#000000] text-[13.5px] leading-none font-extrabold"
        style={{
          left: '53%',
          bottom: '16.50%',
          transform: 'translateX(-50%)',
          fontFamily: ROCKWELL_NUMBER_FONT,
        }}
      >
        {formattedAadhaar}
      </div>
    </div>
  );
}
