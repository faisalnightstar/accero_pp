'use client';

import React from 'react';
import { RcCardData } from '@/types/cards';
import { AshokaEmblem, GuillochePattern } from '@/components/cards/Emblems';
import CardQrCode from '@/components/cards/CardQrCode';

interface RcCardCanvasProps {
  data: RcCardData;
  side?: 'front' | 'back';
  className?: string;
}

export default function RcCardCanvas({
  data,
  side = 'front',
  className = '',
}: RcCardCanvasProps) {
  const qrString = `RC:${data.registrationNumber}|OWNER:${data.ownerName}|CHASSIS:${data.chassisNumber}|ENG:${data.engineNumber}|REG_DATE:${data.registrationDate}`;

  if (side === 'back') {
    return (
      <div
        className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-amber-50/50 via-white to-sky-50/40 text-navy p-2 flex flex-col justify-between font-sans select-none ${className}`}
      >
        <GuillochePattern opacity={0.12} strokeColor="#457B9D" />

        {/* Back Header */}
        <div className="border-b border-gray-300 pb-0.5 flex items-center justify-between text-[7px] font-bold text-gray-700">
          <span>VEHICLE PARTICULARS & SPECIFICATIONS</span>
          <span>FORM 23</span>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 my-auto text-[7px] leading-tight">
          <div>
            <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">Fuel Type</span>
            <span className="font-bold text-navy uppercase">{data.fuelType || 'PETROL'}</span>
          </div>

          <div>
            <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">Emission Norms</span>
            <span className="font-bold text-gray-800 uppercase">{data.emissionNorm || 'BHARAT STAGE VI'}</span>
          </div>

          <div>
            <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">Seating Capacity</span>
            <span className="font-semibold text-gray-800">{data.seatingCapacity || '2 In All'}</span>
          </div>

          <div>
            <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">Unladen / Laden Wt</span>
            <span className="font-semibold text-gray-800">{data.unladenWeight || '107 Kg / 237 Kg'}</span>
          </div>

          <div>
            <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">Fitness Valid Upto</span>
            <span className="font-bold font-mono text-navy">{data.fitnessValidUpto || '09/05/2036'}</span>
          </div>

          <div>
            <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">Tax Paid Upto</span>
            <span className="font-bold font-mono text-navy">{data.taxPaidUpto || 'L.T.T (One Time)'}</span>
          </div>

          <div className="col-span-2 bg-gray-50 p-1 rounded border border-gray-200">
            <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">Hypothecated To (Financier)</span>
            <span className="font-semibold text-gray-800 text-[6.5px] truncate block">
              {data.hypothecatedTo || 'NO HYPOTHECATION / CASH PURCHASE'}
            </span>
          </div>
        </div>

        {/* Back Footer with RTO Seal & QR */}
        <div className="border-t border-gray-300 pt-0.5 flex items-end justify-between">
          <div className="text-[6px] text-gray-600">
            <div>Registering Authority: <strong className="text-navy">{data.issuingAuthority || 'RTO NOIDA'}</strong></div>
            <div>Parivahan Sewa Certified Electronic Registration</div>
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
      className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-amber-50/50 via-white to-sky-50/50 text-navy p-2 flex flex-col justify-between font-sans select-none ${className}`}
    >
      <GuillochePattern opacity={0.14} strokeColor="#1D3557" />

      {/* Top Banner Header */}
      <div className="relative z-10 border-b border-navy/20 pb-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <AshokaEmblem className="w-4 h-6 shrink-0" fill="#1D3557" />
            <div className="leading-none">
              <span className="text-[7.5px] font-extrabold text-navy uppercase block">
                INDIAN UNION VEHICLE REGISTRATION
              </span>
              <span className="text-[6.5px] font-semibold text-burgundy uppercase block">
                FORM 23 - CERTIFICATE OF REGISTRATION
              </span>
            </div>
          </div>

          {/* Registration Number Highlight Pill */}
          <div className="text-right leading-none bg-burgundy text-white px-2 py-1 rounded shadow-xs">
            <span className="text-[5px] text-gold uppercase font-bold block">REGN. NO.</span>
            <span className="text-[11px] font-black font-mono tracking-widest">
              {data.registrationNumber || 'UP00AA0000'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Vehicle Details Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-x-2 gap-y-1 my-auto text-navy leading-none">
        {/* Owner Name */}
        <div>
          <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
            Owner Name
          </span>
          <span className="text-[8.5px] font-bold uppercase truncate block tracking-wide">
            {data.ownerName || 'OWNER NAME'}
          </span>
        </div>

        {/* S/W/D of */}
        <div>
          <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
            S/W/D of
          </span>
          <span className="text-[7.5px] font-semibold uppercase truncate block text-gray-800">
            {data.sonWifeDaughterOf || 'RELATION NAME'}
          </span>
        </div>

        {/* Reg Date & Vehicle Class */}
        <div>
          <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
            Reg. Date
          </span>
          <span className="text-[7.5px] font-bold font-mono text-gray-800">
            {data.registrationDate || 'DD/MM/YYYY'}
          </span>
        </div>

        <div>
          <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
            Vehicle Class
          </span>
          <span className="text-[7px] font-bold text-navy truncate block">
            {data.vehicleClass || 'M-CYCLE/SCOOTER(2WN)'}
          </span>
        </div>

        {/* Chassis No */}
        <div>
          <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
            Chassis Number
          </span>
          <span className="text-[7.5px] font-bold font-mono text-burgundy truncate block">
            {data.chassisNumber || 'CHASSIS PENDING'}
          </span>
        </div>

        {/* Engine No */}
        <div>
          <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
            Engine Number
          </span>
          <span className="text-[7.5px] font-bold font-mono text-gray-800 truncate block">
            {data.engineNumber || 'ENGINE PENDING'}
          </span>
        </div>

        {/* Maker / Model */}
        <div className="col-span-2">
          <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
            Maker / Model
          </span>
          <span className="text-[7.5px] font-semibold text-gray-800 truncate block">
            {data.makerModel || 'MAKER AND MODEL PENDING'}
          </span>
        </div>

        {/* Address */}
        <div className="col-span-2">
          <span className="text-[5.5px] text-gray-500 uppercase font-semibold block">
            Address
          </span>
          <p className="text-[6.5px] text-gray-700 leading-tight truncate">
            {data.address || 'Address Details Pending'}
          </p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 border-t border-navy/20 pt-0.5 flex items-center justify-between text-[6px] text-gray-500">
        <span>MINISTRY OF ROAD TRANSPORT & HIGHWAYS</span>
        <span className="font-mono text-steel-blue font-bold">SMART OPTICAL RC</span>
      </div>
    </div>
  );
}
