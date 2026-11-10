'use client';

import React from 'react';
import { RcCardData, getRcDerivedValues } from '@/types/cards';
import CardQrCode from '@/components/cards/CardQrCode';

export interface RcCardCanvasProps {
  data: RcCardData;
  side?: 'front' | 'back' | 'sheet';
  variant?: 'authentic' | 'vector';
  className?: string;
}

export default function RcCardCanvas({
  data,
  side = 'front',
  variant,
  className = '',
}: RcCardCanvasProps) {
  const activeVariant = variant || data.templateVariant || 'authentic';

  // Compute smart derived attributes (state, badge, authority, validity, specs)
  const derived = getRcDerivedValues(data);

  const regNo = data.registrationNumber || 'DL05RR1234';
  const regDate = data.registrationDate || '22-Oct-2022';
  const regValidity = derived.regnValidity;
  const ownerSerial = derived.ownerSerial || '1';
  const chassisNo = data.chassisNumber || 'AB123CD12E1F12345';
  const engineNo = data.engineNumber || 'AB1CD1234567';
  const ownerName = data.ownerName || 'RAHUL KUMAR';
  const fatherName = data.sonWifeDaughterOf || 'SUBHAM KUMAR';
  const address =
    data.address || 'Gautam Buddha Nagar, 201308';
  const fuelType = (data.fuelType || 'PETROL').toUpperCase();
  const emissionNorm = (data.emissionNorm || 'BHARAT STAGE VI').toUpperCase();
  const cardIssueDate = data.cardIssueDate || '01-11-2026';

  // Back side fields
  const vehicleClass = (data.vehicleClass || 'M-CYCLE/SCOOTER').toUpperCase();
  const maker = (derived.maker || 'TVS MOTOR COMPANY LTD').toUpperCase();
  const model = (derived.model || 'TVSNTORQ125-SUPER SQUADEDITION').toUpperCase();
  const color = (data.color || 'BLACK').toUpperCase();
  const bodyType = (data.bodyType || '2 WHEELER').toUpperCase();
  const seatingCap = data.seatingCapacity ?? '2';
  const unladenWeight = data.unladenWeight ?? '0';
  const cubicCap = data.cubicCapacity ?? '124';
  const horsePower = data.horsePower ?? '0';
  const wheelBase = data.wheelBase ?? '0';
  const mfgDate = data.monthYearOfMfg || '9/2022';
  const cylinders = data.noOfCylinders ?? '0';
  const financier = (derived.financier || 'BANDHAN BANK LTD').toUpperCase();
  const authority = derived.registeringAuthority || 'Noida, Uttar Pradesh';

  // Standard Parivahan Vahan verification QR payload
  const qrString =
    data.qrPayload ||
    `https://vahan.parivahan.gov.in/rc?reg=${encodeURIComponent(regNo)}`;

  /* -------------------------------------------------------------
   * 1. FULL SIDE-BY-SIDE SHEET MODE (A4 / Sheet Print Layout)
   * ----------------------------------------------------------- */
  if (side === 'sheet') {
    return (
      <div
        className={`w-full h-full relative overflow-hidden select-none bg-white font-sans ${className}`}
        style={{
          aspectRatio: '2060 / 670',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {/* Background Sheet Container with Cutting Guide */}
        <div className="absolute inset-0 flex items-center justify-between bg-white">
          {/* FRONT SIDE (Left Half) */}
          <div
            className="relative overflow-hidden"
            style={{
              width: '49.2%',
              height: '100%',
              aspectRatio: '1024 / 640',
            }}
          >
            <RcCardCanvas data={data} side="front" variant={activeVariant} />
          </div>

          {/* Cutting Guide Separator */}
          <div className="h-full border-r border-dashed border-gray-400 mx-1 shrink-0 opacity-70" />

          {/* BACK SIDE (Right Half) */}
          <div
            className="relative overflow-hidden"
            style={{
              width: '49.2%',
              height: '100%',
              aspectRatio: '1024 / 640',
            }}
          >
            <RcCardCanvas data={data} side="back" variant={activeVariant} />
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 2. BACK SIDE (Form 23A)
   * ----------------------------------------------------------- */
  if (side === 'back') {
    return (
      <div
        className={`w-full h-full relative overflow-hidden select-none bg-[#F5F8FD] text-black font-sans rounded-[3.18mm] border border-[#E5F4F8] shadow-2xs ${className}`}
        style={{
          aspectRatio: '1024 / 640',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {/* Authentic PNG Template Background or Vector Fallback */}
        {activeVariant === 'authentic' ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src="/assets/rc/rc-back.png"
            alt="Vehicle RC Back Template"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
          />
        ) : (
          <>
            {/* Top Rounded Banner */}
            <div
              className="absolute bg-[#EAF4FA] rounded-[10px] pointer-events-none"
              style={{
                top: '2.19%',
                left: '1.37%',
                right: '1.37%',
                height: '14.69%',
              }}
            />

            {/* Bottom Rounded Banner */}
            <div
              className="absolute bg-[#E3F2F7] rounded-[10px] pointer-events-none"
              style={{
                bottom: '2.19%',
                left: '1.37%',
                right: '1.37%',
                height: '12.66%',
              }}
            />
          </>
        )}

        {/* TOP HEADER: Circular Badges & Vehicle Class */}
        <div
          className="absolute flex items-center z-10"
          style={{
            top: '4%',
            left: '2.5%',
          }}
        >
          {/* NT Badge */}
          <div
            className="flex items-center justify-center rounded-full font-medium text-black bg-[#408EE0] leading-none shrink-0"
            style={{
              width: '17px',
              height: '17px',
              fontSize: '7.5px',
            }}
          >
            {derived.transportType || 'NT'}
          </div>

          {/* UP State Badge */}
          <div
            className="flex items-center justify-center rounded-full font-medium text-black bg-[#E68310] leading-none shrink-0 ml-0.5"
            style={{
              width: '17px',
              height: '17px',
              fontSize: '7.5px',
            }}
          >
            {derived.stateCode || 'UP'}
          </div>

          {/* Vehicle Class */}
          <div
            className="font-semibold text-black tracking-tight ml-5"
            style={{
              fontSize: '7.5px',
            }}
          >
            <span>Vehicle Class: </span>
            <span className="font-medium">{vehicleClass}</span>
          </div>
        </div>

        {/* LEFT COLUMN: Regn. Number, 2D QR Code, Mfg Date, Cylinders */}
        {/* Regn. Number */}
        <div
          className="absolute z-10"
          style={{
            top: '17.97%',
            left: '2.64%',
          }}
        >
          <span
            className="font-semibold text-black block leading-none"
            style={{ fontSize: '7.5px' }}
          >
            Regn. Number
          </span>
          <span
            className="font-medium font-mono text-black block  tracking-wide"
            style={{ fontSize: '7.5px' }}
          >
            {regNo}
          </span>
        </div>

        {/* Large 2D High-Density QR Code (~30% card width, directly inside QR box) */}
        <div
          className="absolute z-10 flex items-center justify-center"
          style={{
            top: '30.31%',
            left: '2.64%',
            width: '29.98%',
            height: '48.44%',
          }}
        >
          <CardQrCode value={qrString} size={94} level="M" />
        </div>

        {/* Month -Year of Mfg. */}
        <div
          className="absolute z-10"
          style={{
            top: '80.94%',
            left: '2.64%',
          }}
        >
          <span
            className="font-semibold text-black block leading-none"
            style={{ fontSize: '7.5px' }}
          >
            Month -Year of Mfg.
          </span>
          <span
            className="font-medium text-black block "
            style={{ fontSize: '7.5px' }}
          >
            {mfgDate}
          </span>
        </div>

        {/* No of Cylinders */}
        <div
          className="absolute font-semibold text-black z-10"
          style={{
            top: '90.00%',
            left: '2.64%',
            fontSize: '7.5px',
          }}
        >
          No of Cylinders: <span className="font-medium">{cylinders}</span>
        </div>

        {/* RIGHT COLUMN: Form 23A Specifications */}
        {/* Maker */}
        <div
          className="absolute z-10"
          style={{
            top: '17.97%',
            left: '34.57%',
            right: '4.5%',
          }}
        >
          <span
            className="font-semibold text-black block leading-none"
            style={{ fontSize: '7.5px' }}
          >
            Maker:
          </span>
          <span
            className="font-medium text-black block  uppercase truncate"
            style={{ fontSize: '7.5px' }}
          >
            {maker}
          </span>
        </div>

        {/* Model */}
        <div
          className="absolute z-10"
          style={{
            top: '28.91%',
            left: '34.57%',
            right: '4.5%',
          }}
        >
          <span
            className="font-semibold text-black block leading-none"
            style={{ fontSize: '7.5px' }}
          >
            Model:
          </span>
          <span
            className="font-medium text-black block  uppercase truncate"
            style={{ fontSize: '7.5px' }}
          >
            {model}
          </span>
        </div>

        {/* Color & /Body Type (Dual Column Row) */}
        <div
          className="absolute flex items-start z-10"
          style={{
            top: '39.84%',
            left: '34.57%',
            right: '4.5%',
          }}
        >
          <div className="w-[50%]">
            <span
              className="font-semibold text-black block leading-none"
              style={{ fontSize: '7.5px' }}
            >
              Color:
            </span>
            <span
              className="font-medium text-black block  uppercase"
              style={{ fontSize: '7.5px' }}
            >
              {color}
            </span>
          </div>
          <div className="w-[50%]">
            <span
              className="font-semibold text-black block leading-none"
              style={{ fontSize: '7.5px' }}
            >
              /Body Type:
            </span>
            <span
              className="font-medium text-black block  uppercase"
              style={{ fontSize: '7.5px' }}
            >
              {bodyType}
            </span>
          </div>
        </div>

        {/* Seating(in all) Capacity */}
        <div
          className="absolute z-10"
          style={{
            top: '50.00%',
            left: '34.57%',
            right: '4.5%',
          }}
        >
          <span
            className="font-semibold text-black block leading-none"
            style={{ fontSize: '7.5px' }}
          >
            Seating(in all) Capacity
          </span>
          <span
            className="font-medium text-black block "
            style={{ fontSize: '7.5px' }}
          >
            {seatingCap}
          </span>
        </div>

        {/* Unladen Weight (Kg) */}
        <div
          className="absolute z-10"
          style={{
            top: '60.16%',
            left: '34.57%',
            right: '4.5%',
          }}
        >
          <span
            className="font-semibold text-black block leading-none"
            style={{ fontSize: '7.5px' }}
          >
            Unladen Weight (Kg)
          </span>
          <span
            className="font-medium text-black block "
            style={{ fontSize: '7.5px' }}
          >
            {unladenWeight}
          </span>
        </div>

        {/* Triple Specs: Cubic Cap. /Horse Power /Wheel Base */}
        <div
          className="absolute z-10"
          style={{
            top: '70.62%',
            left: '34.57%',
            right: '4.5%',
          }}
        >
          <div
            className="font-semibold text-black leading-none flex items-center justify-between pr-2"
            style={{ fontSize: '7px' }}
          >
            <span>Cubic Cap.</span>
            <span>/Horse Power (BHP/Kw)</span>
            <span>/Wheel Base (mm)</span>
          </div>
          <div
            className="font-medium text-black flex items-center justify-between pr-8"
            style={{ fontSize: '7.5px' }}
          >
            <span className="w-10">{cubicCap}</span>
            <span className="w-10 text-center">{horsePower}</span>
            <span className="w-10 text-right">{wheelBase}</span>
          </div>
        </div>

        {/* Financier */}
        <div
          className="absolute z-10"
          style={{
            top: '81.88%',
            left: '34.57%',
            right: '4.5%',
          }}
        >
          <span
            className="font-semibold text-black block leading-none"
            style={{ fontSize: '7.5px' }}
          >
            Financier
          </span>
          <span
            className="font-medium text-black block  uppercase"
            style={{ fontSize: '7.5px' }}
          >
            {financier}
          </span>
        </div>

        {/* Registration Authority (Bottom Right) */}
        <div
          className="absolute z-10 flex flex-col items-end text-right"
          style={{
            top: '85.50%',
            right: '4.5%',
          }}
        >
          <span
            className="font-semibold text-black block leading-none"
            style={{ fontSize: '7.5px' }}
          >
            Registration Authority
          </span>
          <span
            className="font-medium text-black block "
            style={{ fontSize: '7.5px' }}
          >
            {authority}
          </span>
        </div>

        {/* Vertically Rotated Label: Form 23A */}
        <div
          className="absolute font-semibold text-black whitespace-nowrap pointer-events-none select-none z-10"
          style={{
            top: '50.00%',
            right: '-0.5%',
            transform: 'translateY(-50%) rotate(-90deg)',
            transformOrigin: 'center center',
            fontSize: '5.5px',
          }}
        >
          Form 23A
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 3. FRONT SIDE
   * ----------------------------------------------------------- */
  const stateTitle = (derived.stateIssued || 'Government of Uttar Pradesh')
    .replace(/^Issued by\s+/i, '');

  return (
    <div
      className={`w-full h-full relative overflow-hidden select-none bg-[#F4F7FC] text-black font-sans rounded-[3.18mm] border border-[#CDE4F1] shadow-2xs ${className}`}
      style={{
        aspectRatio: '1024 / 640',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      {/* Authentic PNG Template Background or Vector Fallback */}
      {activeVariant === 'authentic' ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/assets/rc/rc-front.png"
          alt="Vehicle RC Front Template"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        />
      ) : (
        <>
          {/* Top Rounded Banner with Emblem Tab */}
          <div
            className="absolute bg-[#EAF4FA] rounded-[10px] pointer-events-none"
            style={{
              top: '2.19%',
              left: '1.37%',
              right: '1.37%',
              height: '14.69%',
            }}
          />
          {/* Left Tab holding the Ashoka Emblem */}
          <div
            className="absolute bg-[#EAF4FA] rounded-[10px] pointer-events-none"
            style={{
              top: '2.19%',
              left: '1.37%',
              width: '13.8%',
              height: '21.0%',
            }}
          />

          {/* Bottom Rounded Banner */}
          <div
            className="absolute bg-[#E3F2F7] rounded-[10px] pointer-events-none"
            style={{
              bottom: '2.19%',
              left: '1.37%',
              right: '1.37%',
              height: '12.66%',
            }}
          />
        </>
      )}

      {/* TOP-LEFT: National Ashoka Emblem with Satyameva Jayate */}
      <div
        className="absolute flex flex-col items-center justify-center z-10"
        style={{
          top: '3.44%',
          left: '3.71%',
          width: '6.93%',
          height: '17.97%',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/rc/AshokaEmblem.png"
          alt="Emblem of India"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>

      {/* TOP HEADER TITLE */}
      <div
        className="absolute z-10"
        style={{
          top: '3.22%',
          left: '17.41%',
        }}
      >
        <div
          className="font-medium text-black tracking-tight leading-tight"
          style={{ fontSize: '8.5px' }}
        >
          Indian Union Vehicle Registration Certificate
        </div>
        <div
          className="font-normal text-black leading-tight "
          style={{ fontSize: '7.5px' }}
        >
          Issued by {stateTitle}
        </div>
      </div>

      {/* TOP-RIGHT: NT & State Circular Badges */}
      <div
        className="absolute flex items-center z-10"
        style={{
          top: '5.62%',
          right: '4.5%',
        }}
      >
        {/* NT Badge */}
        <div
          className="flex items-center justify-center rounded-full font-medium text-black bg-[#408EE0] leading-none shrink-0"
          style={{
            width: '18px',
            height: '18px',
            fontSize: '7.5px',
          }}
        >
          {derived.transportType || 'NT'}
        </div>

        {/* State Badge */}
        <div
          className="flex items-center justify-center rounded-full font-medium text-black bg-[#E68310] leading-none shrink-0 ml-0.5"
          style={{
            width: '18px',
            height: '18px',
            fontSize: '7.5px',
          }}
        >
          {derived.stateCode || 'UP'}
        </div>
      </div>

      {/* LEFT COLUMN: Smart Card Microchip with Arrow Pointer */}
      <div
        className="absolute flex items-center z-10"
        style={{
          top: '30.78%',
          left: '3.81%',
        }}
      >
        {/* Blue Directional Arrow (Pointing Left ◄) */}
        <svg
          viewBox="0 0 10 20"
          className="shrink-0 mr-1"
          style={{ width: '7.5px', height: '18px' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="10,0 0,10 10,20" fill="#408EE0" />
        </svg>

        {/* Photographic Gold Smart Card Microchip */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/rc/rcChip.png"
          alt="Microchip"
          className="object-contain rounded-[3px] shadow-2xs pointer-events-none select-none shrink-0"
          style={{ width: '42px', height: '33px' }}
        />
      </div>

      {/* LEFT COLUMN (Below Chip): Fuel & Emission Norms */}
      <div
        className="absolute flex flex-col z-10"
        style={{
          top: '63.12%',
          left: '1.76%',
        }}
      >
        <div>
          <span
            className="font-semibold text-black block leading-none"
            style={{ fontSize: '7.5px' }}
          >
            Fuel
          </span>
          <span
            className="font-medium text-black block  uppercase"
            style={{ fontSize: '7.5px' }}
          >
            {fuelType}
          </span>
        </div>

        <div className="mt-2">
          <span
            className="font-semibold text-black block leading-none"
            style={{ fontSize: '7.5px' }}
          >
            Emission Norms
          </span>
          <span
            className="font-medium text-black block  uppercase"
            style={{ fontSize: '7.5px' }}
          >
            {emissionNorm}
          </span>
        </div>
      </div>

      {/* RIGHT AREA: 6 Precise Rows matching Screenshot */}
      {/* Row 1: Regn No | Date of Regn. | Regn. Validity | Owner Serial */}
      <div
        className="absolute grid grid-cols-12 gap-1 items-start z-10"
        style={{
          top: '22.97%',
          left: '26.46%',
          right: '4.5%',
        }}
      >
        {/* Regn No */}
        <div className="col-span-4">
          <span
            className="font-semibold text-black block leading-none"
            style={{ fontSize: '7.5px' }}
          >
            Regn No
          </span>
          <span
            className="font-medium font-mono text-black block  tracking-wide"
            style={{ fontSize: '7.5px' }}
          >
            {regNo}
          </span>
        </div>

        {/* Date of Regn. */}
        <div className="col-span-3">
          <span
            className="font-semibold text-black block leading-none"
            style={{ fontSize: '7.5px' }}
          >
            Date of Regn.
          </span>
          <span
            className="font-medium text-black block "
            style={{ fontSize: '7.5px' }}
          >
            {regDate}
          </span>
        </div>

        {/* Regn. Validity */}
        <div className="col-span-3">
          <span
            className="font-semibold text-black block leading-none"
            style={{ fontSize: '7.5px' }}
          >
            Regn. Validity
          </span>
          <span
            className="font-medium text-black block "
            style={{ fontSize: '7.5px' }}
          >
            {regValidity}
          </span>
        </div>

        {/* Owner Serial */}
        <div className="col-span-2 flex flex-col items-start pl-1">
          <span
            className="font-semibold text-black block leading-none"
            style={{ fontSize: '7.5px' }}
          >
            Owner
          </span>
          <div className="flex items-center gap-1 ">
            <span
              className="font-semibold text-black"
              style={{ fontSize: '7.5px' }}
            >
              Serial
            </span>
            <div
              className="rounded-full border border-black flex items-center justify-center font-medium text-black leading-none shrink-0"
              style={{
                width: '13px',
                height: '13px',
                fontSize: '7.5px',
              }}
            >
              {ownerSerial}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Chassis No */}
      <div
        className="absolute z-10"
        style={{
          top: '34.22%',
          left: '26.46%',
          right: '4.5%',
        }}
      >
        <span
          className="font-semibold text-black block leading-none"
          style={{ fontSize: '7.5px' }}
        >
          Chassis No
        </span>
        <span
          className="font-medium font-mono text-black block  tracking-wide"
          style={{ fontSize: '7.5px' }}
        >
          {chassisNo}
        </span>
      </div>

      {/* Row 3: Engine/Motor No */}
      <div
        className="absolute z-10"
        style={{
          top: '45.47%',
          left: '26.46%',
          right: '4.5%',
        }}
      >
        <span
          className="font-semibold text-black block leading-none"
          style={{ fontSize: '7.5px' }}
        >
          Engine/Motor No
        </span>
        <span
          className="font-medium font-mono text-black block  tracking-wide"
          style={{ fontSize: '7.5px' }}
        >
          {engineNo}
        </span>
      </div>

      {/* Row 4: Owner Name */}
      <div
        className="absolute z-10"
        style={{
          top: '57.19%',
          left: '26.46%',
          right: '4.5%',
        }}
      >
        <span
          className="font-semibold text-black block leading-none"
          style={{ fontSize: '7.5px' }}
        >
          Owner Name
        </span>
        <span
          className="font-medium text-black block uppercase tracking-wide"
          style={{ fontSize: '7.5px' }}
        >
          {ownerName}
        </span>
      </div>

      {/* Row 5: Son/Daughter/Wife of (In case of Individual Owner) */}
      <div
        className="absolute z-10"
        style={{
          top: '69.06%',
          left: '26.46%',
          right: '4.5%',
        }}
      >
        <span
          className="font-semibold text-black block leading-none"
          style={{ fontSize: '7.5px' }}
        >
          Son/Daughter/Wife of (In case of Individual Owner)
        </span>
        <span
          className="font-medium text-black block uppercase"
          style={{ fontSize: '7.5px' }}
        >
          {fatherName}
        </span>
      </div>

      {/* Row 6: Address */}
      <div
        className="absolute z-10"
        style={{
          top: '80.31%',
          left: '26.46%',
          right: '4.5%',
        }}
      >
        <span
          className="font-semibold text-black block leading-none"
          style={{ fontSize: '7.5px' }}
        >
          Address
        </span>
        <span
          className="font-medium text-black block  leading-snug line-clamp-2 uppercase"
          style={{ fontSize: '7.5px' }}
        >
          {address}
        </span>
      </div>

      {/* Vertically Rotated Label: Card Issue Date */}
      <div
        className="absolute font-medium text-black whitespace-nowrap pointer-events-none select-none z-10"
        style={{
          top: '60.00%',
          right: '-9.5%',
          transform: 'translateY(-50%) rotate(-90deg)',
          transformOrigin: 'center center',
          fontSize: '5.5px',
        }}
      >
        Card Issue Date  ({cardIssueDate})
      </div>
    </div>
  );
}
