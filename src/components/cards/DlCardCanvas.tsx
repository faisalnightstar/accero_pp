'use client';

import React from 'react';
import { DlCardData } from '@/types/cards';
import CardQrCode from '@/components/cards/CardQrCode';
import { User } from 'lucide-react';

interface DlCardCanvasProps {
  data: DlCardData;
  side?: 'front' | 'back';
  className?: string;
}

export default function DlCardCanvas({
  data,
  side = 'front',
  className = '',
}: DlCardCanvasProps) {
  const dlno = (data.dlNumber || 'UP16 20110012345').toUpperCase();
  const name = (data.holderName || 'ROHIT KHATRI').toUpperCase();
  const fatherName = (data.fatherOrHusbandName || 'SUBHASH KHATRI').toUpperCase();
  const dob = data.dateOfBirth || '15-08-1992';
  const bgroup = data.bloodGroup || 'B+';
  const gender = (data.gender || 'MALE').toUpperCase();
  const idate = data.issueDate || '10-06-2021';
  const edate = data.validityNonTransport || '09-06-2041';
  const vtrans = data.validityTransport || '-';
  const address = data.address || 'H.NO- 45, SECTOR- 12, NOIDA, GAUTAM BUDDHA NAGAR, UP - 201301';
  const state = (data.state || 'UTTAR PRADESH').toUpperCase();
  const stateShort = dlno.slice(0, 2);
  const emergency = data.emergencyContact || '-';
  const authority = data.issuingAuthority || 'RTO NOIDA (UP16)';
  const organDonor = data.organDonor || 'N';

  // Base64 helper for authentic Sarathi QR link
  const safeBtoa = (str: string) => {
    if (typeof window !== 'undefined') {
      try {
        return window.btoa(str);
      } catch {
        return str;
      }
    }
    return Buffer.from(str).toString('base64');
  };

  // Authentic Parivahan Sarathi verification payload matching dlnew.php line 304
  const qrString = `https://sarathi.parivahan.gov.in/sarathiservice/rsServices/sarathi/QRService/DLDetails/dlqrresult?dlnum=${safeBtoa(
    dlno
  )}&dob=${safeBtoa(dob)}`;

  const frontAsset = '/assets/dl/dl-front.png';
  const backAsset = '/assets/dl/dl-back.png';

  /* -------------------------------------------------------------
   * 1. BACK SIDE LAYOUT (Standard CR80 85.60mm x 53.98mm)
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
          alt="Driving License Back"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        />

        {/* Sarathi Parivahan High-Density QR Code */}
        <div
          className="absolute bg-white p-0.5 rounded-[1px] border border-gray-400 shadow-2xs flex items-center justify-center"
          style={{
            left: '5.0%',
            top: '6.0%',
            width: '18.0%',
            height: '28.5%',
          }}
        >
          <CardQrCode value={qrString} size={56} level="M" />
        </div>

        {/* ADPVEH No & Validity Rows */}
        <div
          className="absolute flex flex-col text-[6px] font-bold text-black leading-tight"
          style={{
            left: '26.0%',
            top: '6.0%',
            width: '70.0%',
          }}
        >
          <span className="text-[5.5px] uppercase font-bold text-gray-800">
            ADPVEH No.(Regn.Numbers)
          </span>
          <span className="font-mono text-[7px] text-black">{data.adpvehNo || '-'}</span>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <span className="text-[5.5px] text-gray-800 uppercase block">Hazardous Validity</span>
              <span className="font-mono text-[6.5px] text-black">{data.hazardousValidUpto || '-'}</span>
            </div>
            <div>
              <span className="text-[5.5px] text-gray-800 uppercase block">Hill Validity</span>
              <span className="font-mono text-[6.5px] text-black">{data.hillValidUpto || '-'}</span>
            </div>
          </div>
        </div>

        {/* Vehicle Classes Endorsement Table (Form 7 match) */}
        <div
          className="absolute"
          style={{
            left: '4.0%',
            right: '4.0%',
            top: '37.0%',
          }}
        >
          <table className="w-full text-center text-[5.5px] border-collapse bg-white/90 border border-gray-400">
            <thead>
              <tr className="bg-gray-100 font-bold border-b border-gray-400 text-black">
                <th className="p-0.5 border-r border-gray-400">Class of Vehicle</th>
                <th className="p-0.5 border-r border-gray-400">Code</th>
                <th className="p-0.5 border-r border-gray-400">Code Issued By</th>
                <th className="p-0.5 border-r border-gray-400">Date of Issue</th>
                <th className="p-0.5">Vehicle Category</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(data.vehicleClasses) && data.vehicleClasses.length > 0 ? (
                data.vehicleClasses.map((cov, idx) => (
                  <tr key={idx} className="border-b border-gray-300 font-semibold text-black">
                    <td className="p-0.5 border-r border-gray-300">{cov.desc}</td>
                    <td className="p-0.5 border-r border-gray-300 font-bold font-mono text-burgundy">{cov.code}</td>
                    <td className="p-0.5 border-r border-gray-300 font-mono">{stateShort}</td>
                    <td className="p-0.5 border-r border-gray-300 font-mono">{cov.issueDate}</td>
                    <td className="p-0.5 font-bold">NT</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="border-b border-gray-300 font-semibold text-black">
                    <td className="p-0.5 border-r border-gray-300">Motor Cycle With Gear</td>
                    <td className="p-0.5 border-r border-gray-300 font-bold font-mono text-burgundy">MCWG</td>
                    <td className="p-0.5 border-r border-gray-300 font-mono">{stateShort}</td>
                    <td className="p-0.5 border-r border-gray-300 font-mono">{idate}</td>
                    <td className="p-0.5 font-bold">NT</td>
                  </tr>
                  <tr className="border-b border-gray-300 font-semibold text-black">
                    <td className="p-0.5 border-r border-gray-300">Light Motor Vehicle</td>
                    <td className="p-0.5 border-r border-gray-300 font-bold font-mono text-burgundy">LMV</td>
                    <td className="p-0.5 border-r border-gray-300 font-mono">{stateShort}</td>
                    <td className="p-0.5 border-r border-gray-300 font-mono">{idate}</td>
                    <td className="p-0.5 font-bold">NT</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Emergency Contact & Licensing Authority Footer */}
        <div
          className="absolute flex items-center justify-between text-[6px] font-bold text-black"
          style={{
            left: '6.0%',
            right: '6.0%',
            bottom: '4.5%',
          }}
        >
          <div>
            <span className="block text-[5px] text-gray-700 uppercase">Emergency Contact Number</span>
            <span className="font-mono text-[6.5px]">{emergency}</span>
          </div>

          <div className="text-right">
            <span className="block text-[5px] text-gray-700 uppercase">Licensing Authority</span>
            <span className="text-[6.5px] uppercase">{authority}</span>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 2. FRONT SIDE LAYOUT (Standard CR80 85.60mm x 53.98mm)
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
        alt="Driving License Front"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      />

      {/* Top Header Labels */}
      <div
        className="absolute w-full text-center leading-none text-black font-bold"
        style={{
          top: '3.5%',
        }}
      >
        <div className="text-[9.5px] font-black tracking-tight">INDIAN UNION DRIVING LICENCE</div>
        <div className="text-[6.5px] font-extrabold text-gray-800 mt-0.5">
          ISSUED BY GOVERNMENT OF {state}
        </div>
      </div>

      {/* State Short Code Badge */}
      <div
        className="absolute font-black text-[8px] text-black"
        style={{
          top: '3.5%',
          right: '5.0%',
        }}
      >
        {stateShort}
      </div>

      {/* DL Number Banner */}
      <div
        className="absolute font-black font-mono tracking-wider text-black text-[10.5px] leading-none"
        style={{
          left: '26.0%',
          top: '18.0%',
        }}
      >
        {dlno}
      </div>

      {/* Dates Column */}
      <div
        className="absolute grid grid-cols-3 gap-1 text-[6px] font-bold text-black leading-tight"
        style={{
          left: '26.0%',
          top: '26.0%',
          width: '50.0%',
        }}
      >
        <div>
          <span className="text-[5.5px] text-gray-700 block">Issue Date</span>
          <span className="font-mono text-[6.5px]">{idate}</span>
        </div>
        <div>
          <span className="text-[5.5px] text-gray-700 block">Validity (NT)</span>
          <span className="font-mono text-[6.5px]">{edate}</span>
        </div>
        <div>
          <span className="text-[5.5px] text-gray-700 block">Validity (TR)</span>
          <span className="font-mono text-[6.5px]">{vtrans}</span>
        </div>
      </div>

      {/* Applicant Photo */}
      <div
        className="absolute overflow-hidden rounded-[1px] bg-white border border-gray-400 shadow-2xs flex items-center justify-center"
        style={{
          right: '5.5%',
          top: '18.5%',
          width: '18.5%',
          height: '38.0%',
        }}
      >
        {data.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.photoUrl} alt="Applicant" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <User className="w-7 h-7" />
            <span className="text-[5px] uppercase font-bold mt-0.5">Photo</span>
          </div>
        )}
      </div>

      {/* Holder Signature */}
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{
          right: '4.5%',
          top: '59.0%',
          width: '20.5%',
          height: '14.0%',
        }}
      >
        <span className="text-[5px] font-bold text-gray-800 leading-none">Holder&apos;s Signature</span>
        {data.signatureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.signatureUrl} alt="Signature" className="h-4 object-contain mt-0.5" />
        ) : (
          <span className="text-[6px] italic text-gray-600 mt-0.5 font-serif">Signature</span>
        )}
      </div>

      {/* Demographic Details Block */}
      <div
        className="absolute flex flex-col text-[7px] font-bold text-black leading-tight"
        style={{
          left: '6.0%',
          top: '49.0%',
          width: '68.0%',
        }}
      >
        {/* Name & Gender */}
        <div className="flex items-center justify-between">
          <div className="truncate">
            <span className="text-[6px] text-gray-700 font-semibold">Name : </span>
            <span className="text-[8px] uppercase">{name}</span>
          </div>
          <div className="shrink-0 text-[6.5px]">
            <span className="text-[6px] text-gray-700 font-semibold">Gender : </span>
            <span>{gender}</span>
          </div>
        </div>

        {/* DOB, Blood Group, Organ Donor */}
        <div className="grid grid-cols-12 gap-1 mt-0.5 text-[6.5px]">
          <div className="col-span-5 truncate">
            <span className="text-[5.5px] text-gray-700 font-semibold">Date Of Birth : </span>
            <span className="font-mono">{dob}</span>
          </div>
          <div className="col-span-4 truncate">
            <span className="text-[5.5px] text-gray-700 font-semibold">Blood Group : </span>
            <span>{bgroup}</span>
          </div>
          <div className="col-span-3 text-right truncate">
            <span className="text-[5.5px] text-gray-700 font-semibold">Organ Donor : </span>
            <span>{organDonor}</span>
          </div>
        </div>

        {/* Father / Husband Name */}
        <div className="mt-0.5 truncate text-[7px]">
          <span className="text-[6px] text-gray-700 font-semibold">Son/Wife/Daughter of : </span>
          <span className="uppercase">{fatherName}</span>
        </div>

        {/* Address */}
        <div className="mt-0.5 text-[6.5px] leading-snug">
          <span className="text-[5.5px] text-gray-700 font-semibold block leading-none">Address :</span>
          <span className="font-medium text-gray-900 line-clamp-2 uppercase block mt-0.5">
            {address}
          </span>
        </div>
      </div>
    </div>
  );
}
