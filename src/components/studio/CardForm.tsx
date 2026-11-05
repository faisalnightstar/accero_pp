'use client';

import React from 'react';
import { DocumentType } from '@/types/cards';
import AssetDropzone from '@/components/studio/AssetDropzone';
import {
  CreditCard,
  User,
  Calendar,
  MapPin,
  Car,
  Shield,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

interface CardFormProps {
  docType: DocumentType;
  data: any;
  onFieldChange: (key: string, value: any) => void;
  missingKeys?: string[];
}

export default function CardForm({
  docType,
  data,
  onFieldChange,
  missingKeys = [],
}: CardFormProps) {
  // Helper to render an input field with optional amber missing-field badge
  const renderInput = (
    key: string,
    label: string,
    placeholder: string = '',
    type: string = 'text',
    required: boolean = false
  ) => {
    const isMissing = missingKeys.includes(key);
    const value = data ? (data[key] ?? '') : '';

    return (
      <div className="flex flex-col gap-1.5" id={`field-container-${key}`}>
        <div className="flex items-center justify-between">
          <label
            htmlFor={`input-${key}`}
            className="text-xs font-semibold text-gray-700 flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-crimson">*</span>}
          </label>

          {isMissing && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              Missing from API
            </span>
          )}
        </div>

        <input
          id={`input-${key}`}
          type={type}
          value={value}
          onChange={(e) => onFieldChange(key, e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 text-xs rounded-lg border transition-all outline-none font-medium ${isMissing
            ? 'border-amber-400 bg-amber-50/20 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
            : 'border-gray-300 bg-white focus:border-steel-blue focus:ring-2 focus:ring-steel-blue/20 text-navy'
            }`}
        />
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-6">
      {/* ---------------- PAN CARD FORM ---------------- */}
      {docType === 'pan' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <CreditCard className="w-5 h-5 text-burgundy" />
            <h3 className="text-sm font-bold text-navy">PAN Card Details</h3>
          </div>

          {/* Template & Print Format Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1.5">
                Official Template Variant
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onFieldChange('templateVariant', 'nsdl')}
                  className={`px-2.5 py-1.5 text-xs rounded-lg border font-semibold transition-all ${(data.templateVariant || 'nsdl') === 'nsdl'
                    ? 'bg-burgundy text-white border-burgundy shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  NSDL (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => onFieldChange('templateVariant', 'utiitsl')}
                  className={`px-2.5 py-1.5 text-xs rounded-lg border font-semibold transition-all ${data.templateVariant === 'utiitsl'
                    ? 'bg-burgundy text-white border-burgundy shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  UTIITSL (e-PAN)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1.5">
                Print & Display Layout
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onFieldChange('layoutFormat', 'cr80')}
                  className={`px-2.5 py-1.5 text-xs rounded-lg border font-semibold transition-all ${(data.layoutFormat || 'cr80') === 'cr80'
                    ? 'bg-navy text-white border-navy shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  CR80 Tray (Dual)
                </button>
                <button
                  type="button"
                  onClick={() => onFieldChange('layoutFormat', 'sheet')}
                  className={`px-2.5 py-1.5 text-xs rounded-lg border font-semibold transition-all ${data.layoutFormat === 'sheet'
                    ? 'bg-navy text-white border-navy shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  Side-by-Side Sheet
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              {renderInput('panNumber', 'Permanent Account Number (PAN)', 'e.g. ABCDE1234F', 'text', true)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('fullName', 'Cardholder Full Name', 'e.g. ROHIT KHATRI', 'text', true)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('fatherName', "Father's Full Name", 'e.g. MOHAMMAD FAISAL', 'text', true)}
            </div>
            <div>
              {renderInput('dateOfBirth', 'Date of Birth (DD/MM/YYYY)', '15/08/1990', 'text', true)}
            </div>
            <div>
              {renderInput('gender', 'Gender (MALE / FEMALE)', 'MALE', 'text', false)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('category', 'Entity Category', 'Individual', 'text', false)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <AssetDropzone
              label="Cardholder Photograph"
              value={data.photoUrl}
              onChange={(val) => onFieldChange('photoUrl', val)}
              onClear={() => onFieldChange('photoUrl', '')}
              aspectRatio="photo"
              helperText="Passport photograph (White background)"
              isMissing={missingKeys.includes('photoUrl')}
            />
            <AssetDropzone
              label="Cardholder Signature"
              value={data.signatureUrl}
              onChange={(val) => onFieldChange('signatureUrl', val)}
              onClear={() => onFieldChange('signatureUrl', '')}
              aspectRatio="signature"
              helperText="Scanned signature on plain white paper"
              isMissing={missingKeys.includes('signatureUrl')}
            />
          </div>
        </div>
      )}

      {/* ---------------- AADHAAR CARD FORM ---------------- */}
      {docType === 'aadhaar' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Shield className="w-5 h-5 text-burgundy" />
            <h3 className="text-sm font-bold text-navy">Aadhaar Card Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              {renderInput('aadhaarNumber', '12-Digit Aadhaar Number', 'e.g. 5749 0326 7673', 'text', true)}
            </div>
            <div>
              {renderInput('name', 'Resident Name (English)', 'e.g. SUNIL SONKAR', 'text', true)}
            </div>
            <div>
              {renderInput('nameRegional', 'Resident Name (Hindi / Regional)', 'e.g. सुनील सोनकर', 'text', false)}
            </div>
            <div>
              {renderInput('dateOfBirth', 'Date of Birth (DD/MM/YYYY)', '23/05/1978', 'text', true)}
            </div>
            <div>
              {renderInput('gender', 'Gender (MALE / FEMALE)', 'MALE', 'text', true)}
            </div>
            <div>
              {renderInput('careOf', 'Care of / Son of (English)', 'S/O: Pyarelal', 'text', false)}
            </div>
            <div>
              {renderInput('careOfRegional', 'Care of (Hindi / Regional)', 'आत्मज: प्यारेलाल', 'text', false)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('address', 'Full Address (English)', 'House No, Street, City, State - PIN', 'text', true)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('addressRegional', 'Full Address (Hindi / Regional)', 'मकान नं, गली, शहर, राज्य - पिन', 'text', false)}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <AssetDropzone
              label="Resident Photograph"
              value={data.photoUrl}
              onChange={(val) => onFieldChange('photoUrl', val)}
              onClear={() => onFieldChange('photoUrl', '')}
              aspectRatio="photo"
              helperText="Official UIDAI Resident Portrait"
              isMissing={missingKeys.includes('photoUrl')}
            />
          </div>
        </div>
      )}

      {/* ---------------- VOTER CARD FORM ---------------- */}
      {docType === 'voter' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <FileCheck className="w-5 h-5 text-burgundy" />
            <h3 className="text-sm font-bold text-navy">Voter ID (EPIC) Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              {renderInput('epicNumber', 'EPIC Number', 'e.g. AXH0801639', 'text', true)}
            </div>
            <div>
              {renderInput('electorName', 'Elector Name (English)', 'e.g. RUPLAL SAH', 'text', true)}
            </div>
            <div>
              {renderInput('electorNameRegional', 'Elector Name (Hindi / Regional)', 'e.g. रूपलाल साह', 'text', false)}
            </div>
            <div>
              {renderInput('relationName', "Father's / Husband's Name (English)", 'e.g. CHANDRIKA SAH', 'text', true)}
            </div>
            <div>
              {renderInput('relationNameRegional', "Relation Name (Hindi / Regional)", 'e.g. चंद्रिका साह', 'text', false)}
            </div>
            <div>
              {renderInput('gender', 'Gender', 'Male', 'text', true)}
            </div>
            <div>
              {renderInput('age', 'Age / DOB', '42', 'text', false)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('assemblyConstituency', 'Assembly Constituency (English)', 'e.g. 14 - GOVINDGANJ', 'text', true)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('assemblyConstituencyRegional', 'Assembly Constituency (Regional)', 'e.g. 14 - गोविन्दगंज', 'text', false)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('partNumberAndName', 'Part Number & Name (English)', 'e.g. 257 - PRATHMIK VIDYALAY...', 'text', true)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('partNumberAndNameRegional', 'Part Number & Name (Regional)', 'e.g. 257 - प्राथमिक विद्यालय...', 'text', false)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('fullAddress', 'Full Address (English)', 'Village/Town, Dist, State', 'text', true)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('fullAddressRegional', 'Full Address (Regional)', 'गाँव/मोहल्ला, जिला, राज्य', 'text', false)}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <AssetDropzone
              label="Elector Photograph"
              value={data.photoUrl}
              onChange={(val) => onFieldChange('photoUrl', val)}
              onClear={() => onFieldChange('photoUrl', '')}
              aspectRatio="photo"
              helperText="Election Commission ID portrait"
              isMissing={missingKeys.includes('photoUrl')}
            />
          </div>
        </div>
      )}

      {/* ---------------- DRIVING LICENSE FORM ---------------- */}
      {docType === 'dl' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <CreditCard className="w-5 h-5 text-burgundy" />
            <h3 className="text-sm font-bold text-navy">Driving License Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              {renderInput('dlNumber', 'Driving Licence Number', 'e.g. UP-1620210012345', 'text', true)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('holderName', 'Driver Full Name', 'e.g. ROHIT KHATRI', 'text', true)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('fatherOrHusbandName', 'S/W/D of', 'e.g. MOHAMMAD FAISAL', 'text', true)}
            </div>
            <div>
              {renderInput('dateOfBirth', 'Date of Birth (DD-MM-YYYY)', '15-08-1990', 'text', true)}
            </div>
            <div>
              {renderInput('gender', 'Gender', 'MALE', 'text', false)}
            </div>
            <div>
              {renderInput('bloodGroup', 'Blood Group', 'O+', 'text', false)}
            </div>
            <div>
              {renderInput('organDonor', 'Organ Donor', 'N', 'text', false)}
            </div>
            <div>
              {renderInput('state', 'State', 'UTTAR PRADESH', 'text', false)}
            </div>
            <div>
              {renderInput('emergencyContact', 'Emergency Contact', '9876543210', 'text', false)}
            </div>
            <div>
              {renderInput('issueDate', 'Issue Date (DD-MM-YYYY)', '10-06-2021', 'text', true)}
            </div>
            <div>
              {renderInput('validityNonTransport', 'Validity Non-Transport (NT)', '14-08-2040', 'text', true)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('issuingAuthority', 'Issuing RTO Authority', 'RTO NOIDA (UP16)', 'text', true)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('address', 'Permanent Address', 'Full Residential Address', 'text', true)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <AssetDropzone
              label="Driver Photograph"
              value={data.photoUrl}
              onChange={(val) => onFieldChange('photoUrl', val)}
              onClear={() => onFieldChange('photoUrl', '')}
              aspectRatio="photo"
              helperText="35mm × 45mm Driving Licence Photo"
              isMissing={missingKeys.includes('photoUrl')}
            />
            <AssetDropzone
              label="Driver Signature"
              value={data.signatureUrl}
              onChange={(val) => onFieldChange('signatureUrl', val)}
              onClear={() => onFieldChange('signatureUrl', '')}
              aspectRatio="signature"
              helperText="Official Driver Specimen Signature"
              isMissing={missingKeys.includes('signatureUrl')}
            />
          </div>
        </div>
      )}

      {/* ---------------- VEHICLE RC FORM (Form 23A) ---------------- */}
      {docType === 'rc' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-burgundy" />
              <h3 className="text-sm font-bold text-navy">
                Official Vehicle RC (Form 23A) Details
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Form 23A Standard
            </span>
          </div>

          {/* Section 1: Registration Header & Badges */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5 text-burgundy" />
              <span>1. Registration Header & Badges</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                {renderInput('registrationNumber', 'Regn No', 'e.g. UP05LD1234', 'text', true)}
              </div>
              <div>
                {renderInput('registrationDate', 'Date of Regn.', 'e.g. 22-Oct-2022', 'text', true)}
              </div>
              <div>
                {renderInput('regnValidity', 'Regn. Validity', 'e.g. 22-Oct-2037', 'text', true)}
              </div>
              <div>
                {renderInput('ownerSerial', 'Owner Serial', 'e.g. 1', 'number', false)}
              </div>
              <div>
                {renderInput('transportType', 'Badge 1 (Transport Type)', 'NT', 'text', false)}
              </div>
              <div>
                {renderInput('stateCode', 'Badge 2 (State Code)', 'UP', 'text', false)}
              </div>
              <div className="sm:col-span-3">
                {renderInput('stateIssued', 'Issuing Government', 'Issued by Government of Uttar Pradesh', 'text', false)}
              </div>
            </div>
          </div>

          {/* Section 2: Vehicle Identification & Class */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-burgundy" />
              <span>2. Vehicle Identification & Model</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                {renderInput('vehicleClass', 'Vehicle Class', 'M-CYCLE/SCOOTER', 'text', true)}
              </div>
              <div>
                {renderInput('maker', 'Maker Description', 'TVS MOTOR COMPANY LTD', 'text', true)}
              </div>
              <div className="sm:col-span-2">
                {renderInput('model', 'Model Description', 'TVSNTORQ125-SUPER SQUADEDITION', 'text', true)}
              </div>
              <div>
                {renderInput('chassisNumber', 'Chassis No', 'MR123RK21N5K12345', 'text', true)}
              </div>
              <div>
                {renderInput('engineNumber', 'Engine/Motor No', 'AR1CH1234567', 'text', true)}
              </div>
              <div>
                {renderInput('color', 'Color', 'BLACK', 'text', false)}
              </div>
              <div>
                {renderInput('bodyType', 'Body Type', '2 WHEELER', 'text', false)}
              </div>
            </div>
          </div>

          {/* Section 3: Owner Particulars */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-burgundy" />
              <span>3. Registered Owner Particulars</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                {renderInput('ownerName', 'Owner Name', 'ROHIT KHATRI', 'text', true)}
              </div>
              <div className="sm:col-span-2">
                {renderInput('sonWifeDaughterOf', 'Son/Daughter/Wife of (In case of Individual Owner)', 'SUBHASH KHATRI', 'text', false)}
              </div>
              <div className="sm:col-span-2">
                {renderInput('address', 'Permanent Address', 'Full Residential Address', 'text', true)}
              </div>
            </div>
          </div>

          {/* Section 4: Technical Specifications */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <FileCheck className="w-3.5 h-3.5 text-burgundy" />
              <span>4. Technical & Manufacturing Specifications</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                {renderInput('fuelType', 'Fuel', 'PETROL', 'text', true)}
              </div>
              <div>
                {renderInput('emissionNorm', 'Emission Norms', 'BHARAT STAGE VI', 'text', false)}
              </div>
              <div>
                {renderInput('seatingCapacity', 'Seating(in all) Capacity', '0', 'text', false)}
              </div>
              <div>
                {renderInput('unladenWeight', 'Unladen Weight (Kg)', '0', 'text', false)}
              </div>
              <div>
                {renderInput('cubicCapacity', 'Cubic Cap.', '124.8', 'text', false)}
              </div>
              <div>
                {renderInput('horsePower', 'Horse Power (BHP/Kw)', '0', 'text', false)}
              </div>
              <div>
                {renderInput('wheelBase', 'Wheel Base (mm)', '0', 'text', false)}
              </div>
              <div>
                {renderInput('monthYearOfMfg', 'Month -Year of Mfg.', '9/2022', 'text', false)}
              </div>
              <div>
                {renderInput('noOfCylinders', 'No of Cylinders', '0', 'text', false)}
              </div>
            </div>
          </div>

          {/* Section 5: Financial, Authority & Regulatory */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-burgundy" />
              <span>5. Financial & Registration Authority</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                {renderInput('financier', 'Financier / Hypothecated To', 'BANDHAN BANK LTD', 'text', false)}
              </div>
              <div>
                {renderInput('registeringAuthority', 'Registration Authority', 'Noida, Uttar Pradesh', 'text', true)}
              </div>
              <div>
                {renderInput('cardIssueDate', 'Card Issue Date', '30-08-2026', 'text', false)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
