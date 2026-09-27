'use client';

import React from 'react';
import { DocumentType } from '@/types/cards';
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
    const value = data[key] ?? '';

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
          className={`w-full px-3 py-2 text-xs rounded-lg border transition-all outline-none font-medium ${
            isMissing
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              {renderInput('panNumber', 'Permanent Account Number (PAN)', 'e.g. ABCDE1234F', 'text', true)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('fullName', 'Cardholder Full Name', 'e.g. ABU FAISAL', 'text', true)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('fatherName', "Father's Full Name", 'e.g. MOHAMMAD FAISAL', 'text', true)}
            </div>
            <div>
              {renderInput('dateOfBirth', 'Date of Birth (DD/MM/YYYY)', '15/08/1990', 'text', true)}
            </div>
            <div>
              {renderInput('category', 'Entity Category', 'Individual', 'text', false)}
            </div>
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
              {renderInput('holderName', 'Driver Full Name', 'e.g. ABU FAISAL', 'text', true)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('fatherOrHusbandName', 'S/W/D of', 'e.g. MOHAMMAD FAISAL', 'text', true)}
            </div>
            <div>
              {renderInput('dateOfBirth', 'Date of Birth (DD-MM-YYYY)', '15-08-1990', 'text', true)}
            </div>
            <div>
              {renderInput('bloodGroup', 'Blood Group', 'O+', 'text', false)}
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
        </div>
      )}

      {/* ---------------- VEHICLE RC FORM ---------------- */}
      {docType === 'rc' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Car className="w-5 h-5 text-burgundy" />
            <h3 className="text-sm font-bold text-navy">Vehicle RC (Form 23) Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              {renderInput('registrationNumber', 'Registration Number (RC)', 'e.g. UP16DL3137', 'text', true)}
            </div>
            <div>
              {renderInput('registrationDate', 'Registration Date', '10/05/2021', 'text', true)}
            </div>
            <div>
              {renderInput('vehicleClass', 'Vehicle Class', 'M-CYCLE/SCOOTER(2WN)', 'text', true)}
            </div>
            <div>
              {renderInput('chassisNumber', 'Chassis Number', 'e.g. ME4JF504LKV012345', 'text', true)}
            </div>
            <div>
              {renderInput('engineNumber', 'Engine Number', 'e.g. JF50E72012345', 'text', true)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('ownerName', 'Registered Owner Name', 'e.g. ABU FAISAL', 'text', true)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('sonWifeDaughterOf', 'Son/Wife/Daughter of', 'e.g. MOHAMMAD FAISAL', 'text', false)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('makerModel', 'Maker & Model Description', 'e.g. HONDA MOTORCYCLES / ACTIVA 6G', 'text', true)}
            </div>
            <div>
              {renderInput('fuelType', 'Fuel Type', 'PETROL', 'text', true)}
            </div>
            <div>
              {renderInput('emissionNorm', 'Emission Norms', 'BHARAT STAGE VI', 'text', false)}
            </div>
            <div>
              {renderInput('fitnessValidUpto', 'Fitness Valid Upto', '09/05/2036', 'text', false)}
            </div>
            <div>
              {renderInput('taxPaidUpto', 'Tax Paid Upto', 'L.T.T (One Time)', 'text', false)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('hypothecatedTo', 'Hypothecated To (Financier Bank)', 'e.g. STATE BANK OF INDIA', 'text', false)}
            </div>
            <div className="sm:col-span-2">
              {renderInput('address', 'Owner Address', 'Full Residential Address', 'text', true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
