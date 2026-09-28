'use client';

import React from 'react';
import { RcCardData, getRcDerivedValues } from '@/types/cards';
import {
  RcAshokaCrest,
  RcSmartChipWithPointer,
  RcCircleBadge,
} from '@/components/cards/Emblems';
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
  // Compute smart derived attributes (state, badge, authority, validity, specs)
  const derived = getRcDerivedValues(data);

  const regNo = data.registrationNumber || 'UP16DL3137';
  const regDate = data.registrationDate || '22-Oct-2022';
  const regValidity = derived.regnValidity;
  const ownerSerial = derived.ownerSerial;
  const chassisNo = data.chassisNumber || 'MD626AK35N3K13433';
  const engineNo = data.engineNumber || 'AK3KN3704338';
  const ownerName = data.ownerName || 'ABU FAISAL';
  const fatherName = data.sonWifeDaughterOf || 'OBAIDULLA';
  const address =
    data.address || 'D-74, BETA 1 , GREATER NOIDA, Gautam Buddha Nagar -201308';
  const fuelType = (data.fuelType || 'PETROL').toUpperCase();
  const emissionNorm = (data.emissionNorm || 'BHARAT STAGE VI').toUpperCase();
  const cardIssueDate = data.cardIssueDate || '30-08-2026';

  // Back side fields
  const vehicleClass = (data.vehicleClass || 'M-CYCLE/SCOOTER').toUpperCase();
  const maker = derived.maker;
  const model = derived.model;
  const color = (data.color || 'BLACK').toUpperCase();
  const bodyType = (data.bodyType || '2 WHEELER').toUpperCase();
  const seatingCap = data.seatingCapacity ?? '0';
  const unladenWeight = data.unladenWeight ?? '0';
  const cubicCap = data.cubicCapacity ?? '124.8';
  const horsePower = data.horsePower ?? '0';
  const wheelBase = data.wheelBase ?? '0';
  const mfgDate = data.monthYearOfMfg || '9/2022';
  const cylinders = data.noOfCylinders ?? '0';
  const financier = derived.financier;
  const authority = derived.registeringAuthority;

  // Standard Parivahan Vahan verification QR payload
  const qrString =
    data.qrPayload ||
    `https://vahan.parivahan.gov.in/rc?reg=${encodeURIComponent(regNo)}`;

  /* -------------------------------------------------------------
   * BACK SIDE LAYOUT (Form 23A)
   * ----------------------------------------------------------- */
  if (side === 'back') {
    return (
      <div
        className={`w-full h-full relative overflow-hidden bg-white text-black p-2 flex flex-col justify-between font-sans select-none rounded-[3.18mm] border border-[#B9E2FE] shadow-2xs ${className}`}
      >
        {/* Official Back Header Light Sky Blue Dividing Banner */}
        <div className="absolute top-0 left-0 right-0 h-[36px] bg-[#DEF0FC] pointer-events-none z-0" />

        {/* Top Header: Badges & Vehicle Class (Inside light blue banner) */}
        <div className="relative z-10 flex items-center justify-between px-0.5 pt-0.5">
          <div className="flex items-center gap-1">
            <RcCircleBadge text={derived.transportType} variant="cyan" />
            <RcCircleBadge text={derived.stateCode} variant="orange" />
          </div>

          <div className="text-[8.5px] font-black text-black tracking-tight">
            <span>Vehicle Class: </span>
            <span className="font-extrabold">{vehicleClass}</span>
          </div>
        </div>

        {/* Two-Column Form 23A Specifications Grid */}
        <div className="relative z-10 grid grid-cols-12 gap-2 my-auto items-start pr-6 pt-1">
          {/* Left Column: Reg No, Large QR Code (~29.4% width), Mfg Date, Cylinders */}
          <div className="col-span-4 flex flex-col justify-between h-full space-y-1">
            <div>
              <span className="text-[6.5px] font-bold text-black uppercase block leading-none">
                Regn. Number
              </span>
              <span className="text-[10px] font-black font-mono text-black tracking-wide leading-tight block mt-0.5">
                {regNo}
              </span>
            </div>

            {/* High-Density Square 2D QR Code matching government card scale */}
            <div className="w-[100px] h-[100px] bg-white p-0.5 rounded-xs border border-gray-400 shadow-2xs flex items-center justify-center shrink-0">
              <CardQrCode value={qrString} size={96} level="M" />
            </div>

            <div className="space-y-0.5 text-[6.5px] leading-tight">
              <div>
                <span className="font-bold text-black block">Month -Year of Mfg.</span>
                <span className="font-black text-[8px] text-black block">{mfgDate}</span>
              </div>
              <div className="font-bold text-[7px] text-black">
                No of Cylinders: <span className="font-extrabold">{cylinders}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Complete Technical Specifications */}
          <div className="col-span-8 space-y-0.5 text-[7px] leading-tight pl-1">
            <div>
              <span className="font-bold text-black block leading-none text-[6.5px]">Maker:</span>
              <span className="font-extrabold text-[8px] text-black uppercase truncate block mt-0.5">
                {maker}
              </span>
            </div>

            <div>
              <span className="font-bold text-black block leading-none text-[6.5px]">Model:</span>
              <span className="font-extrabold text-[8px] text-black uppercase truncate block mt-0.5">
                {model}
              </span>
            </div>

            <div className="flex items-center justify-between text-[7px]">
              <div>
                <span className="font-bold text-black">Color: </span>
                <span className="font-extrabold text-black">{color}</span>
              </div>
              <div>
                <span className="font-bold text-black">/Body Type: </span>
                <span className="font-extrabold text-black">{bodyType}</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-black">Seating(in all) Capacity</span>
              <div className="font-extrabold text-[7.5px] text-black">{seatingCap}</div>
            </div>

            <div>
              <span className="font-bold text-black">Unladen Weight (Kg)</span>
              <div className="font-extrabold text-[7.5px] text-black">{unladenWeight}</div>
            </div>

            <div className="grid grid-cols-3 gap-0.5 text-[6.5px]">
              <div>
                <span className="font-bold text-black block">Cubic Cap.</span>
                <span className="font-extrabold text-[7.5px] text-black">{cubicCap}</span>
              </div>
              <div>
                <span className="font-bold text-black block">/Horse Power</span>
                <span className="font-extrabold text-[7.5px] text-black">{horsePower}</span>
              </div>
              <div>
                <span className="font-bold text-black block">/Wheel Base</span>
                <span className="font-extrabold text-[7.5px] text-black">{wheelBase}</span>
              </div>
            </div>

            <div className="pt-0.5">
              <span className="font-bold text-black block leading-none text-[6.5px]">Financier</span>
              <span className="font-extrabold text-[7.5px] text-black uppercase truncate block mt-0.5">
                {financier}
              </span>
            </div>

            <div className="text-right pt-0.5">
              <span className="font-bold text-black block text-[6px]">Registration Authority</span>
              <span className="font-extrabold text-[7px] text-black uppercase block mt-0.5">
                {authority}
              </span>
            </div>
          </div>
        </div>

        {/* Rotated Vertical Border Label: Form 23A (Hugging right border, zero collision) */}
        <div
          className="absolute right-1 top-1/2 -translate-y-1/2 text-[7px] font-black tracking-wider text-gray-800 pointer-events-none select-none z-10"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
          }}
        >
          Form 23A
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * FRONT SIDE LAYOUT
   * ----------------------------------------------------------- */
  return (
    <div
      className={`w-full h-full relative overflow-hidden bg-white text-black p-2 flex flex-col justify-between font-sans select-none rounded-[3.18mm] border border-[#B9E2FE] shadow-2xs ${className}`}
    >
      {/* Official Front Header Light Sky Blue Scalloped Dividing Banner */}
      <svg
        viewBox="0 0 457 285"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      >
        <path
          d="M 0,0 L 457,0 L 457,48 L 78,48 Q 68,48 68,56 L 68,64 Q 68,72 56,72 L 0,72 Z"
          fill="#DEF0FC"
        />
      </svg>

      {/* Top Header: Real Ashoka Emblem + Title + State Badges */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-start gap-1.5">
          {/* Prominent Ashoka Emblem matching official scale */}
          <RcAshokaCrest className="w-[35px] h-[52px]" />
          <div className="flex flex-col pt-1">
            <span className="text-[9.5px] sm:text-[10px] font-black text-black tracking-tight leading-tight">
              Indian Union Vehicle Registration Certificate
            </span>
            <span className="text-[7.5px] sm:text-[8px] font-medium text-gray-800 leading-tight mt-0.5">
              {derived.stateIssued}
            </span>
          </div>
        </div>

        {/* Dual Circle Badges with white text */}
        <div className="flex items-center gap-1 shrink-0 pt-1">
          <RcCircleBadge text={derived.transportType} variant="cyan" />
          <RcCircleBadge text={derived.stateCode} variant="orange" />
        </div>
      </div>

      {/* Main Body Area: Chip on Left, 6-Row Grid on Right (with pr-6 safe margin) */}
      <div className="relative z-10 grid grid-cols-12 gap-1.5 my-auto items-center pr-6">
        {/* Left Side: Real Microchip + Blue Arrow Pointer + Fuel & Emission Norms */}
        <div className="col-span-3 flex flex-col justify-between h-full pt-1 space-y-2">
          {/* Microchip Contact with Royal Blue Arrow Pointer */}
          <RcSmartChipWithPointer />

          {/* Fuel & Emission Norms Below Chip */}
          <div className="space-y-1 text-[7px] leading-tight pt-0.5">
            <div>
              <span className="font-bold text-black uppercase block leading-none text-[6.5px]">
                Fuel
              </span>
              <span className="font-extrabold text-[8px] text-black uppercase">
                {fuelType}
              </span>
            </div>
            <div>
              <span className="font-bold text-black uppercase block leading-none text-[6px]">
                Emission Norms
              </span>
              <span className="font-extrabold text-[7.5px] text-black uppercase">
                {emissionNorm}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Exact 6-Row Data Hierarchy */}
        <div className="col-span-9 space-y-1 text-[7.5px] leading-tight pl-1">
          {/* Row 1: Regn No | Date of Regn. | Regn. Validity | Owner Serial */}
          <div className="grid grid-cols-12 gap-1 items-start">
            <div className="col-span-4">
              <span className="font-bold text-black block leading-none text-[6.5px]">
                Regn No
              </span>
              <span className="text-[10px] font-black font-mono text-black leading-tight tracking-wide block">
                {regNo}
              </span>
            </div>

            <div className="col-span-3">
              <span className="font-bold text-black block leading-none text-[6.5px]">
                Date of Regn.
              </span>
              <span className="text-[7.5px] font-bold text-black leading-tight block">
                {regDate}
              </span>
            </div>

            <div className="col-span-3">
              <span className="font-bold text-black block leading-none text-[6.5px]">
                Regn. Validity
              </span>
              <span className="text-[7.5px] font-bold text-black leading-tight block">
                {regValidity}
              </span>
            </div>

            <div className="col-span-2 flex flex-col items-center">
              <span className="font-bold text-black text-[6.5px] leading-none">Owner</span>
              <div className="flex items-center gap-0.5 mt-0.5">
                <span className="text-[6.5px] font-bold">Serial</span>
                <span className="w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center text-[7px] font-black leading-none">
                  {ownerSerial}
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Chassis No */}
          <div>
            <span className="font-bold text-black block leading-none text-[6.5px]">
              Chassis No
            </span>
            <span className="font-black font-mono text-[8.5px] text-black tracking-wider block">
              {chassisNo}
            </span>
          </div>

          {/* Row 3: Engine/Motor No */}
          <div>
            <span className="font-bold text-black block leading-none text-[6.5px]">
              Engine/Motor No
            </span>
            <span className="font-black font-mono text-[8.5px] text-black tracking-wider block">
              {engineNo}
            </span>
          </div>

          {/* Row 4: Owner Name */}
          <div>
            <span className="font-bold text-black block leading-none text-[6.5px]">
              Owner Name
            </span>
            <span className="font-black text-[9px] text-black uppercase tracking-wide block">
              {ownerName}
            </span>
          </div>

          {/* Row 5: Son/Daughter/Wife of (In case of Individual Owner) */}
          <div>
            <span className="font-bold text-black block leading-none text-[6px]">
              Son/Daughter/Wife of (In case of Individual Owner)
            </span>
            <span className="font-extrabold text-[8px] text-black uppercase tracking-wide block">
              {fatherName}
            </span>
          </div>

          {/* Row 6: Address */}
          <div>
            <span className="font-bold text-black block leading-none text-[6.5px]">
              Address
            </span>
            <span className="font-bold text-[7px] text-gray-900 leading-snug line-clamp-2 block uppercase">
              {address}
            </span>
          </div>
        </div>
      </div>

      {/* Rotated Vertical Border Label: Card Issue Date (Hugging right border, zero collision) */}
      <div
        className="absolute right-1 top-1/2 -translate-y-1/2 text-[6.5px] font-bold tracking-wider text-gray-700 pointer-events-none select-none z-10"
        style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
        }}
      >
        Card Issue Date ({cardIssueDate})
      </div>
    </div>
  );
}
