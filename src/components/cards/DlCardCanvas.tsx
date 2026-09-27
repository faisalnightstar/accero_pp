'use client';

import React from 'react';
import { DlCardData } from '@/types/cards';
import { AshokaEmblem, SmartCardChip, GuillochePattern } from '@/components/cards/Emblems';
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
  const qrString = `DL:${data.dlNumber}|NAME:${data.holderName}|DOB:${data.dateOfBirth}|VALID_NT:${data.validityNonTransport}|AUTH:${data.issuingAuthority}`;

  if (side === 'back') {
    return (
      <div
        className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-emerald-50/50 via-white to-sky-50/40 text-navy p-2 flex flex-col justify-between font-sans select-none ${className}`}
      >
        <GuillochePattern opacity={0.12} strokeColor="#457B9D" />

        {/* Back Header */}
        <div className="border-b border-gray-300 pb-0.5 flex items-center justify-between text-[7px] font-bold text-gray-700">
          <span>DRIVING LICENCE - AUTHORISATION TO DRIVE</span>
          <span>FORM 7</span>
        </div>

        {/* Vehicle Classes Endorsement Table */}
        <div className="my-auto">
          <table className="w-full text-left text-[6.5px] border border-gray-300 bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b border-gray-300 font-bold">
                <th className="p-0.5">COV Class</th>
                <th className="p-0.5">Description</th>
                <th className="p-0.5">Issue Date</th>
              </tr>
            </thead>
            <tbody>
              {data.vehicleClasses && data.vehicleClasses.length > 0 ? (
                data.vehicleClasses.map((cov, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="p-0.5 font-bold font-mono text-burgundy">{cov.code}</td>
                    <td className="p-0.5 text-gray-600 truncate max-w-[140px]">{cov.desc}</td>
                    <td className="p-0.5 font-mono text-gray-600">{cov.issueDate}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="border-b border-gray-200">
                    <td className="p-0.5 font-bold font-mono text-burgundy">MCWG</td>
                    <td className="p-0.5 text-gray-600">Motor Cycle With Gear</td>
                    <td className="p-0.5 font-mono text-gray-600">{data.issueDate}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-0.5 font-bold font-mono text-burgundy">LMV</td>
                    <td className="p-0.5 text-gray-600">Light Motor Vehicle</td>
                    <td className="p-0.5 font-mono text-gray-600">{data.issueDate}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Back Footer with Issuing Seal & QR */}
        <div className="border-t border-gray-300 pt-0.5 flex items-end justify-between">
          <div className="text-[6px] text-gray-600">
            <div>Issuing Authority: <strong className="text-navy">{data.issuingAuthority}</strong></div>
            <div>Badge / Endorsement No: VALID STATEWIDE</div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="bg-white p-0.5 rounded border border-gray-300 shadow-2xs">
              <CardQrCode value={qrString} size={36} level="M" />
            </div>
            <div className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center text-[5px] font-bold text-center text-gray-400">
              RTO SEAL
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Front Side Layout
  return (
    <div
      className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-amber-50/40 via-white to-sky-50/50 text-navy p-2 flex flex-col justify-between font-sans select-none ${className}`}
    >
      <GuillochePattern opacity={0.14} strokeColor="#1D3557" />

      {/* Top Banner Header */}
      <div className="relative z-10 border-b border-navy/20 pb-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <AshokaEmblem className="w-4 h-6 shrink-0" fill="#1D3557" />
            <div className="leading-none">
              <span className="text-[7.5px] font-extrabold text-navy uppercase block">
                UNION OF INDIA - DRIVING LICENCE
              </span>
              <span className="text-[6.5px] font-semibold text-burgundy uppercase block">
                {data.issuingAuthority ? `${data.issuingAuthority} - ` : ''}TRANSPORT DEPARTMENT
              </span>
            </div>
          </div>

          <div className="text-right leading-none">
            <span className="text-[6px] text-gray-500 font-semibold block uppercase">DL NO.</span>
            <span className="text-[10px] font-black font-mono tracking-wider text-burgundy">
              {data.dlNumber || 'DL-0000000000000'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Body (Smart Chip, Photo, Demographic Details) */}
      <div className="relative z-10 grid grid-cols-12 gap-1.5 my-auto items-center">
        {/* Left Chip & Photo Column (4 cols) */}
        <div className="col-span-4 flex flex-col items-center gap-1">
          <SmartCardChip className="w-8 h-6 shrink-0" />

          <div className="w-14 h-16 rounded border border-gray-400 bg-white overflow-hidden shadow-xs flex items-center justify-center">
            {data.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.photoUrl}
                alt="Driver Photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <User className="w-7 h-7" />
                <span className="text-[5.5px] uppercase font-semibold">Driver</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Details Column (8 cols) */}
        <div className="col-span-8 space-y-0.5 text-navy leading-none">
          {/* Driver Name */}
          <div>
            <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
              Name
            </span>
            <span className="text-[9px] font-bold uppercase truncate block tracking-wide">
              {data.holderName || 'DRIVER NAME'}
            </span>
          </div>

          {/* S/W/D of */}
          <div>
            <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
              S/W/D of
            </span>
            <span className="text-[7.5px] font-semibold uppercase truncate block text-gray-800">
              {data.fatherOrHusbandName || 'RELATION NAME'}
            </span>
          </div>

          {/* DOB & Blood Group */}
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
                DOB
              </span>
              <span className="text-[7.5px] font-bold font-mono text-gray-900">
                {data.dateOfBirth || 'DD-MM-YYYY'}
              </span>
            </div>
            <div>
              <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
                Blood Grp
              </span>
              <span className="text-[7.5px] font-bold font-mono text-crimson">
                {data.bloodGroup || 'O+'}
              </span>
            </div>
          </div>

          {/* Address */}
          <div>
            <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
              Address
            </span>
            <p className="text-[6.5px] text-gray-700 leading-tight truncate">
              {data.address || 'Address Details Pending'}
            </p>
          </div>

          {/* Validity (NT / TR) */}
          <div className="flex items-center gap-3 pt-0.5">
            <div>
              <span className="text-[5px] text-gray-500 uppercase font-semibold block">
                Valid Till (NT)
              </span>
              <span className="text-[7px] font-bold font-mono text-navy">
                {data.validityNonTransport || '20/12/2040'}
              </span>
            </div>
            <div>
              <span className="text-[5px] text-gray-500 uppercase font-semibold block">
                Issue Date
              </span>
              <span className="text-[7px] font-bold font-mono text-gray-600">
                {data.issueDate || '01-01-2020'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom COV Badges & Signature */}
      <div className="relative z-10 border-t border-navy/20 pt-0.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-[5.5px] text-gray-500 uppercase font-bold">COV:</span>
          {data.vehicleClasses && data.vehicleClasses.length > 0 ? (
            data.vehicleClasses.map((c, i) => (
              <span
                key={i}
                className="bg-navy text-white text-[6px] font-mono font-bold px-1 py-0.5 rounded"
              >
                {c.code}
              </span>
            ))
          ) : (
            <>
              <span className="bg-navy text-white text-[6px] font-mono font-bold px-1 py-0.5 rounded">
                MCWG
              </span>
              <span className="bg-navy text-white text-[6px] font-mono font-bold px-1 py-0.5 rounded">
                LMV
              </span>
            </>
          )}
        </div>

        <div className="w-20 h-5 border-b border-gray-600 bg-white/60 flex items-center justify-center overflow-hidden">
          {data.signatureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.signatureUrl}
              alt="Holder Signature"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-[6px] text-gray-400 italic">Signature</span>
          )}
        </div>
      </div>
    </div>
  );
}
