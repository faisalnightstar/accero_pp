'use client';

import React, { useState } from 'react';
import { DocumentType, DlVehicleClass } from '@/types/cards';
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
  Languages,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { VOTER_LANGUAGES, VoterLanguageCode, translateVoterText } from '@/lib/voterLanguages';
import { AADHAAR_LANGUAGES, AadhaarLanguageCode, translateAadhaarText } from '@/lib/aadhaarLanguages';

const DL_VEHICLE_PRESETS = [
  { code: 'MCWG', desc: 'Motor Cycle With Gear', category: 'NT' },
  { code: 'LMV', desc: 'Light Motor Vehicle', category: 'NT' },
  { code: 'MCWOG', desc: 'Motor Cycle Without Gear', category: 'NT' },
  { code: 'LMV-NT', desc: 'Light Motor Vehicle (Non-Transport)', category: 'NT' },
  { code: 'TRANS', desc: 'Transport Vehicle', category: 'TR' },
  { code: 'LMV-TR', desc: 'Light Motor Vehicle (Transport)', category: 'TR' },
  { code: 'HMV', desc: 'Heavy Motor Vehicle', category: 'TR' },
  { code: 'HGMV', desc: 'Heavy Goods Motor Vehicle', category: 'TR' },
  { code: 'HPMV', desc: 'Heavy Passenger Motor Vehicle', category: 'TR' },
  { code: 'E-RICK', desc: 'E-Rickshaw / E-Cart', category: 'TR' },
  { code: 'INVCRG', desc: 'Invalid Carriage', category: 'NT' },
];

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
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAadhaarTranslating, setIsAadhaarTranslating] = useState(false);

  // Auto-translate helper for multi-lingual Aadhaar Card
  const handleAadhaarTranslate = async (targetLang?: string) => {
    const lang = targetLang || data.language || 'HI';
    const langConfig = AADHAAR_LANGUAGES[lang as AadhaarLanguageCode] || AADHAAR_LANGUAGES.HI;
    setIsAadhaarTranslating(true);

    try {
      // 1. Set regional labels from dictionary
      onFieldChange('language', lang);
      onFieldChange('dateOfBirthRegional', langConfig.labels.dob);
      onFieldChange('labelDobRegional', langConfig.labels.dob);
      onFieldChange('labelAddressRegional', langConfig.labels.address);

      const isFemale = (data.gender || '').toUpperCase() === 'FEMALE';
      const isTransgender = (data.gender || '').toUpperCase() === 'TRANSGENDER';
      onFieldChange(
        'genderRegional',
        isTransgender
          ? langConfig.labels.transgender
          : isFemale
            ? langConfig.labels.female
            : langConfig.labels.male
      );

      // 2. Translate dynamic resident details via Google Translate GTX API
      if (data.name) {
        const transName = await translateAadhaarText(data.name, lang);
        onFieldChange('nameRegional', transName);
      }
      if (data.careOf) {
        const transCo = await translateAadhaarText(data.careOf, lang);
        onFieldChange('careOfRegional', transCo);
      }
      if (data.address) {
        const transAddr = await translateAadhaarText(data.address, lang);
        onFieldChange('addressRegional', transAddr);
      }
    } finally {
      setIsAadhaarTranslating(false);
    }
  };

  // Auto-translate helper for multi-lingual Voter ID
  const handleVoterTranslate = async (targetLang?: string) => {
    const lang = targetLang || data.language || 'HI';
    const langConfig = VOTER_LANGUAGES[lang as VoterLanguageCode] || VOTER_LANGUAGES.HI;
    setIsTranslating(true);

    try {
      // 1. Set regional labels from dictionary
      onFieldChange('language', lang);
      onFieldChange('labelNameRegional', langConfig.labels.name);
      const isHusband = data.relationType === 'HUSBAND';
      onFieldChange(
        'labelRelationRegional',
        isHusband ? langConfig.labels.husbandName : langConfig.labels.fatherName
      );
      onFieldChange('labelGenderRegional', langConfig.labels.gender);
      onFieldChange('labelDobRegional', langConfig.labels.dob);
      onFieldChange('labelAddressRegional', langConfig.labels.address);
      onFieldChange('labelSignRegional', langConfig.labels.electoralOfficer);

      const isFemale = (data.gender || '').toLowerCase().startsWith('f');
      onFieldChange('genderRegional', isFemale ? langConfig.labels.female : langConfig.labels.male);

      // 2. Translate dynamic elector values via Google Translate GTX API
      if (data.electorName) {
        const transName = await translateVoterText(data.electorName, lang);
        onFieldChange('electorNameRegional', transName);
      }
      if (data.relationName) {
        const transRel = await translateVoterText(data.relationName, lang);
        onFieldChange('relationNameRegional', transRel);
      }
      if (data.partName || data.partNumberAndName) {
        const pText = data.partName || data.partNumberAndName;
        const transPart = await translateVoterText(pText, lang);
        onFieldChange('partNameRegional', transPart);
        onFieldChange('partNumberAndNameRegional', transPart);
      }
      if (data.acName || data.assemblyConstituency) {
        const acText = data.acName || data.assemblyConstituency;
        const transAc = await translateVoterText(acText, lang);
        onFieldChange('acNameRegional', transAc);
        onFieldChange('assemblyConstituencyRegional', transAc);
      }
      if (data.fullAddress) {
        const transAddr = await translateVoterText(data.fullAddress, lang);
        onFieldChange('fullAddressRegional', transAddr);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // House No builder matching sethno() from voter_capc-advance.php
  const handleHouseNoChange = (houseNo: string) => {
    onFieldChange('houseNo', houseNo);
    const part = data.partName || data.partNumberAndName || '';
    const tehsil = data.tehsil || '';
    const district = data.district || '';
    const state = data.state || '';
    const full = [houseNo, part, tehsil, district, state].filter(Boolean).join(', ');
    onFieldChange('fullAddress', full);
  };

  // Driving License Vehicle Classes Handlers
  const handleDlVehicleClassChange = (
    index: number,
    field: keyof DlVehicleClass,
    val: string
  ) => {
    const currentList: DlVehicleClass[] = Array.isArray(data.vehicleClasses)
      ? [...data.vehicleClasses]
      : [];
    if (!currentList[index]) return;
    currentList[index] = {
      ...currentList[index],
      [field]: val,
    };
    onFieldChange('vehicleClasses', currentList);
  };

  const handleAddDlVehicleClass = (preset?: { code: string; desc: string; category?: string }) => {
    const currentList: DlVehicleClass[] = Array.isArray(data.vehicleClasses)
      ? [...data.vehicleClasses]
      : [];
    if (currentList.length >= 6) return;

    const newClass: DlVehicleClass = preset
      ? {
        code: preset.code,
        desc: preset.desc,
        issueDate: data.issueDate || '10-06-2021',
        category: preset.category || 'NT',
      }
      : {
        code: 'LMV',
        desc: 'Light Motor Vehicle',
        issueDate: data.issueDate || '10-06-2021',
        category: 'NT',
      };

    onFieldChange('vehicleClasses', [...currentList, newClass]);
  };

  const handleRemoveDlVehicleClass = (index: number) => {
    const currentList: DlVehicleClass[] = Array.isArray(data.vehicleClasses)
      ? [...data.vehicleClasses]
      : [];
    const updated = currentList.filter((_, i) => i !== index);
    onFieldChange('vehicleClasses', updated);
  };

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
        <div className="space-y-5">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-burgundy" />
              <div>
                <h3 className="text-sm font-bold text-navy">
                  Aadhaar Card Multi-Lingual Engine
                </h3>
                <p className="text-[11px] text-gray-500">
                  Select official regional language for instant localized template & translation
                </p>
              </div>
            </div>

            {/* Auto-Translate Trigger */}
            <button
              type="button"
              onClick={() => handleAadhaarTranslate()}
              disabled={isAadhaarTranslating}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-burgundy hover:bg-burgundy/90 shadow-2xs transition-all disabled:opacity-50"
            >
              {isAadhaarTranslating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Translate</span>
                </>
              )}
            </button>
          </div>

          {/* Language & Layout Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200">
            <div>
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                <Languages className="w-3.5 h-3.5 text-burgundy" />
                <span>Regional Language & Template</span>
              </label>
              <select
                value={data.language || 'HI'}
                onChange={(e) => {
                  const newLang = e.target.value as AadhaarLanguageCode;
                  onFieldChange('language', newLang);
                  handleAadhaarTranslate(newLang);
                }}
                className="w-full text-xs font-semibold rounded-lg border border-gray-300 p-2 bg-white text-navy focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all"
              >
                {Object.values(AADHAAR_LANGUAGES).map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name} ({item.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-burgundy" />
                <span>Format Layout</span>
              </label>
              <select
                value={data.layoutFormat || 'cr80'}
                onChange={(e) => onFieldChange('layoutFormat', e.target.value)}
                className="w-full text-xs font-semibold rounded-lg border border-gray-300 p-2 bg-white text-navy focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all"
              >
                <option value="cr80">CR80 PVC Card (85.60 × 53.98 mm)</option>
                <option value="sheet">Full A4 e-Aadhaar Sheet (210 × 297 mm)</option>
              </select>
            </div>
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
              <label className="text-xs font-semibold text-gray-700 flex items-center justify-between mb-1.5">
                <span>Date of Birth (DD/MM/YYYY)</span>
                <span className="text-crimson">*</span>
              </label>
              <input
                type="text"
                value={data.dateOfBirth || ''}
                onChange={(e) => {
                  onFieldChange('dateOfBirth', e.target.value);
                  const lang = (data.language || 'HI') as AadhaarLanguageCode;
                  const langConfig = AADHAAR_LANGUAGES[lang] || AADHAAR_LANGUAGES.HI;
                  if (data.dateOfBirthRegional && /\d/.test(data.dateOfBirthRegional)) {
                    onFieldChange('dateOfBirthRegional', langConfig.labels.dob);
                  }
                }}
                placeholder="23/05/1978"
                className="w-full text-xs font-semibold rounded-lg border border-gray-300 p-2 bg-white text-navy focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-1.5">
                <span>Gender</span>
                <span className="text-crimson">*</span>
              </label>
              <select
                value={(data.gender || 'MALE').toUpperCase()}
                onChange={(e) => {
                  const val = e.target.value as 'MALE' | 'FEMALE' | 'TRANSGENDER';
                  onFieldChange('gender', val);
                  const lang = (data.language || 'HI') as AadhaarLanguageCode;
                  const langConfig = AADHAAR_LANGUAGES[lang] || AADHAAR_LANGUAGES.HI;
                  onFieldChange(
                    'genderRegional',
                    val === 'FEMALE'
                      ? langConfig.labels.female
                      : val === 'TRANSGENDER'
                        ? langConfig.labels.transgender
                        : langConfig.labels.male
                  );
                }}
                className="w-full text-xs font-semibold rounded-lg border border-gray-300 p-2 bg-white text-navy focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all"
              >
                <option value="MALE">MALE ({AADHAAR_LANGUAGES[(data.language || 'HI') as AadhaarLanguageCode]?.labels.male || 'पुरुष'})</option>
                <option value="FEMALE">FEMALE ({AADHAAR_LANGUAGES[(data.language || 'HI') as AadhaarLanguageCode]?.labels.female || 'महिला'})</option>
                <option value="TRANSGENDER">TRANSGENDER ({AADHAAR_LANGUAGES[(data.language || 'HI') as AadhaarLanguageCode]?.labels.transgender || 'ट्रांसजेंडर'})</option>
              </select>
            </div>
            <div>
              {renderInput('careOf', 'Care of / Son of (English)', 'S/O Pyarelal', 'text', false)}
            </div>
            <div>
              {renderInput('careOfRegional', 'Care of (Hindi / Regional)', 'आत्मज प्यारेलाल', 'text', false)}
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
        <div className="space-y-5">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-burgundy" />
              <div>
                <h3 className="text-sm font-bold text-navy">Official Voter ID (e-EPIC) Details</h3>
                <p className="text-[11px] text-gray-500">Multi-lingual ECI Standard with Auto-Translation</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleVoterTranslate()}
                disabled={isTranslating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-steel-blue hover:bg-[#346684] rounded-lg shadow-xs transition-colors disabled:opacity-50"
                title="Translate Name, Relation, Part, and Address into selected regional script"
              >
                {isTranslating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                )}
                <span>{isTranslating ? 'Translating...' : 'Auto-Translate'}</span>
              </button>
            </div>
          </div>

          {/* Configuration: Language & Print Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50/70 border border-gray-200/80 rounded-xl">
            <div>
              <label className="text-xs font-bold text-navy flex items-center gap-1.5 mb-1.5">
                <Languages className="w-4 h-4 text-burgundy" />
                <span>Card Language / Regional Script</span>
              </label>
              <select
                value={data.language || 'HI'}
                onChange={(e) => {
                  const newLang = e.target.value as VoterLanguageCode;
                  onFieldChange('language', newLang);
                  handleVoterTranslate(newLang);
                }}
                className="w-full text-xs font-semibold rounded-lg border border-gray-300 p-2 bg-white text-navy focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all"
              >
                {Object.values(VOTER_LANGUAGES).map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name} ({item.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-navy flex items-center gap-1.5 mb-1.5">
                <FileCheck className="w-4 h-4 text-steel-blue" />
                <span>Print Layout Format</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onFieldChange('layoutFormat', 'cr80')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${(data.layoutFormat || 'cr80') === 'cr80'
                    ? 'bg-burgundy text-white border-burgundy shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  CR80 Card (PVC)
                </button>
                <button
                  type="button"
                  onClick={() => onFieldChange('layoutFormat', 'sheet')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${data.layoutFormat === 'sheet'
                    ? 'bg-burgundy text-white border-burgundy shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  Full Sheet (A4)
                </button>
              </div>
            </div>
          </div>

          {/* Primary Elector Identification */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">1. Elector Identity</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                {renderInput('epicNumber', 'EPIC Number', 'e.g. ABC0123456', 'text', true)}
              </div>
              <div>
                {renderInput('electorName', 'Elector Name (English)', 'e.g. RUPLAL SAH', 'text', true)}
              </div>
              <div>
                {renderInput('electorNameRegional', 'Elector Name (Regional)', 'e.g. रूपलाल साह', 'text', false)}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-1.5">
                  <span>Relationship Type</span>
                  <span className="text-crimson">*</span>
                </label>
                <select
                  value={data.relationType || 'FATHER'}
                  onChange={(e) => {
                    const rel = e.target.value as 'FATHER' | 'HUSBAND';
                    onFieldChange('relationType', rel);
                    const lang = (data.language || 'HI') as VoterLanguageCode;
                    const langConfig = VOTER_LANGUAGES[lang] || VOTER_LANGUAGES.HI;
                    onFieldChange(
                      'labelRelationRegional',
                      rel === 'HUSBAND' ? langConfig.labels.husbandName : langConfig.labels.fatherName
                    );
                  }}
                  className="w-full text-xs font-semibold rounded-lg border border-gray-300 p-2 bg-white text-navy focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all"
                >
                  <option value="FATHER">Father</option>
                  <option value="HUSBAND">Husband</option>
                </select>
              </div>
              <div>
                {renderInput('relationName', "Relative Name (English)", 'e.g. CHANDRIKA SAH', 'text', true)}
              </div>
              <div className="sm:col-span-2">
                {renderInput('relationNameRegional', 'Relative Name (Regional)', 'e.g. चंद्रिका साह', 'text', false)}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-1.5">
                  <span>Gender</span>
                  <span className="text-crimson">*</span>
                </label>
                <select
                  value={data.gender || 'Male'}
                  onChange={(e) => {
                    const val = e.target.value;
                    onFieldChange('gender', val);
                    const lang = (data.language || 'HI') as VoterLanguageCode;
                    const langConfig = VOTER_LANGUAGES[lang] || VOTER_LANGUAGES.HI;
                    onFieldChange('genderRegional', val === 'Female' ? langConfig.labels.female : langConfig.labels.male);
                  }}
                  className="w-full text-xs font-semibold rounded-lg border border-gray-300 p-2 bg-white text-navy focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all"
                >
                  <option value="Male">Male / पुरुष</option>
                  <option value="Female">Female / महिला</option>
                  <option value="Other">Other / अन्य</option>
                </select>
              </div>
              <div>
                {renderInput('dateOfBirth', 'Date of Birth / Age', 'e.g. 01/01/1990 or 42', 'text', false)}
              </div>
            </div>
          </div>

          {/* Polling & Constituency Info */}
          <div className="space-y-3 border-t border-gray-100 pt-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">2. Constituency & Polling Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {renderInput('assemblyConstituency', 'Assembly Constituency (English)', 'e.g. 14 - GOVINDGANJ', 'text', true)}
              </div>
              <div>
                {renderInput('assemblyConstituencyRegional', 'Assembly Constituency (Regional)', 'e.g. 14 - गोविन्दगंज', 'text', false)}
              </div>
              <div>
                {renderInput('partNumberAndName', 'Part No & Name (English)', 'e.g. 257 - PRATHMIK VIDYALAY...', 'text', true)}
              </div>
              <div>
                {renderInput('partNumberAndNameRegional', 'Part No & Name (Regional)', 'e.g. 257 - प्राथमिक विद्यालय...', 'text', false)}
              </div>
              <div>
                {renderInput('tehsil', 'Tehsil / Taluka', 'e.g. GOVINDGANJ', 'text', false)}
              </div>
              <div>
                {renderInput('district', 'District', 'e.g. PURVI CHAMPARAN', 'text', false)}
              </div>
            </div>
          </div>

          {/* Address Builder & Regional Address */}
          <div className="space-y-3 border-t border-gray-100 pt-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">3. Address Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  House No (Auto-updates Full Address)
                </label>
                <input
                  type="text"
                  value={data.houseNo || ''}
                  onChange={(e) => handleHouseNoChange(e.target.value)}
                  placeholder="e.g. HOUSE NO 12"
                  className="w-full text-xs font-medium rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                {renderInput('fullAddress', 'Full Address (English)', 'Village/Town, Dist, State', 'text', true)}
              </div>
              <div className="sm:col-span-2">
                {renderInput('fullAddressRegional', 'Full Address (Regional)', 'गाँव/मोहल्ला, जिला, राज्य', 'text', false)}
              </div>
            </div>
          </div>

          {/* Photographs & ERO Specimen Signature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <AssetDropzone
              label="Elector Photograph"
              value={data.photoUrl}
              onChange={(val) => onFieldChange('photoUrl', val)}
              onClear={() => onFieldChange('photoUrl', '')}
              aspectRatio="photo"
              helperText="Official ECI Portrait (Front & Ghost Photo)"
              isMissing={missingKeys.includes('photoUrl')}
            />
            <AssetDropzone
              label="Officer Specimen Signature"
              value={data.signatureUrl || '/assets/voter/voter-officer-sign.png'}
              onChange={(val) => onFieldChange('signatureUrl', val)}
              onClear={() => onFieldChange('signatureUrl', '')}
              aspectRatio="signature"
              helperText="Electoral Registration Officer Signature"
            />
          </div>
        </div>
      )}

      {/* ---------------- DRIVING LICENSE FORM ---------------- */}
      {docType === 'dl' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-burgundy" />
              <h3 className="text-sm font-bold text-navy">Driving License Details</h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Form 7 Standard
            </span>
          </div>

          {/* Section 1: Core Driver & License Identity */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-burgundy" />
              <span>1. Driver & License Identity</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                {renderInput('dlNumber', 'Driving Licence Number', 'e.g. UP-1620210012345', 'text', true)}
              </div>
              <div className="sm:col-span-2">
                {renderInput('holderName', 'Driver Full Name', 'e.g. ROHIT KHATRI', 'text', true)}
              </div>
              <div className="sm:col-span-2">
                {renderInput('fatherOrHusbandName', 'S/W/D of (Son/Wife/Daughter of)', 'e.g. MOHAMMAD FAISAL', 'text', true)}
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
                {renderInput('organDonor', 'Organ Donor (Y / N)', 'N', 'text', false)}
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
              <div>
                {renderInput('validityTransport', 'Validity Transport (TR)', '09-06-2026', 'text', false)}
              </div>
              <div>
                {renderInput('issuingAuthority', 'Issuing RTO Authority', 'RTO NOIDA (UP16)', 'text', true)}
              </div>
              <div className="sm:col-span-2">
                {renderInput('address', 'Permanent Address', 'Full Residential Address', 'text', true)}
              </div>
            </div>
          </div>

          {/* ADPVEH No & Validity Rows */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-burgundy" />
                <span>2. ADPVEH No & Validity Rows</span>
              </div>
              <span className="text-[10px] text-gray-500 font-medium">Card Back Endorsement</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                {renderInput('adpvehNo', 'ADPVEH No.(Regn.Numbers)', 'e.g. UP16AB1234 or -', 'text', false)}
              </div>
              <div>
                {renderInput('hazardousValidUpto', 'Hazardous Validity', 'e.g. 15-08-2028 or -', 'text', false)}
              </div>
              <div>
                {renderInput('hillValidUpto', 'Hill Validity', 'e.g. 15-08-2028 or -', 'text', false)}
              </div>
            </div>
          </div>

          {/* Vehicle Classes Endorsement Table (Form 7 match) */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-burgundy" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Vehicle Classes Endorsement Table (Form 7 match)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${(data.vehicleClasses?.length || 0) >= 6 ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                  {(data.vehicleClasses?.length || 0)} / 6 Classes
                </span>
                <button
                  type="button"
                  onClick={() => handleAddDlVehicleClass()}
                  disabled={(data.vehicleClasses?.length || 0) >= 6}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-burgundy hover:bg-burgundy/90 text-white shadow-2xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Class</span>
                </button>
              </div>
            </div>

            {/* Quick Preset Badges */}
            <div className="flex items-center flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase mr-1">Quick Add:</span>
              {DL_VEHICLE_PRESETS.map((p) => {
                const isAdded = (data.vehicleClasses || []).some(
                  (c: DlVehicleClass) => c.code?.toUpperCase() === p.code.toUpperCase()
                );
                return (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => handleAddDlVehicleClass(p)}
                    disabled={(data.vehicleClasses?.length || 0) >= 6 || isAdded}
                    title={`${p.desc} (${p.category})`}
                    className={`text-[10.5px] px-2 py-0.5 rounded-md font-semibold border transition-all ${isAdded
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                      : (data.vehicleClasses?.length || 0) >= 6
                        ? 'opacity-40 cursor-not-allowed border-gray-200 bg-white text-gray-400'
                        : 'bg-white text-navy border-gray-300 hover:border-burgundy hover:text-burgundy hover:bg-burgundy/5'
                      }`}
                  >
                    +{p.code}
                  </button>
                );
              })}
            </div>

            {/* Vehicle Classes Rows Table */}
            {Array.isArray(data.vehicleClasses) && data.vehicleClasses.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100/80 text-[11px] font-bold text-gray-700 uppercase border-b border-gray-200">
                    <tr>
                      <th className="py-2 px-2.5 w-8 text-center">#</th>
                      <th className="py-2 px-2.5">Class of Vehicle (Description)</th>
                      <th className="py-2 px-2.5 w-24">Code</th>
                      <th className="py-2 px-2.5 w-28">Date of Issue</th>
                      <th className="py-2 px-2.5 w-20">Category</th>
                      <th className="py-2 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.vehicleClasses.map((item: DlVehicleClass, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-2 px-2.5 text-center font-bold text-gray-500 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2.5">
                          <input
                            type="text"
                            value={item.desc || ''}
                            onChange={(e) => handleDlVehicleClassChange(idx, 'desc', e.target.value)}
                            placeholder="e.g. Motor Cycle With Gear"
                            className="w-full px-2 py-1 text-xs rounded border border-gray-200 focus:border-burgundy focus:ring-1 focus:ring-burgundy/20 outline-none font-medium"
                          />
                        </td>
                        <td className="py-1.5 px-2.5">
                          <input
                            type="text"
                            value={item.code || ''}
                            onChange={(e) => handleDlVehicleClassChange(idx, 'code', e.target.value.toUpperCase())}
                            placeholder="MCWG"
                            className="w-full px-2 py-1 text-xs font-mono font-bold uppercase rounded border border-gray-200 focus:border-burgundy focus:ring-1 focus:ring-burgundy/20 outline-none"
                          />
                        </td>
                        <td className="py-1.5 px-2.5">
                          <input
                            type="text"
                            value={item.issueDate || ''}
                            onChange={(e) => handleDlVehicleClassChange(idx, 'issueDate', e.target.value)}
                            placeholder="DD-MM-YYYY"
                            className="w-full px-2 py-1 text-xs font-mono rounded border border-gray-200 focus:border-burgundy focus:ring-1 focus:ring-burgundy/20 outline-none"
                          />
                        </td>
                        <td className="py-1.5 px-2.5">
                          <select
                            value={item.category || 'NT'}
                            onChange={(e) => handleDlVehicleClassChange(idx, 'category', e.target.value)}
                            className="w-full px-1.5 py-1 text-xs font-semibold rounded border border-gray-200 bg-white focus:border-burgundy focus:ring-1 focus:ring-burgundy/20 outline-none"
                          >
                            <option value="NT">NT</option>
                            <option value="TR">TR</option>
                          </select>
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveDlVehicleClass(idx)}
                            title="Remove Class"
                            className="p-1 rounded text-gray-400 hover:text-crimson hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-white border border-dashed border-gray-300 rounded-lg">
                <Car className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-gray-700">No Vehicle Classes Added</p>
                <p className="text-[11px] text-gray-500 mb-3">Add up to 6 vehicle class endorsements for Form 7 layout</p>
                <button
                  type="button"
                  onClick={() => handleAddDlVehicleClass()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-burgundy text-white hover:bg-burgundy/90 transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Vehicle Class</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Photographs & Specimen Signatures */}
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

          {/* Template & Print Format Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1.5">
                Official Template Variant
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onFieldChange('templateVariant', 'authentic')}
                  className={`px-2.5 py-1.5 text-xs rounded-lg border font-semibold transition-all ${(data.templateVariant || 'authentic') === 'authentic'
                    ? 'bg-burgundy text-white border-burgundy shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  Form 23A (Authentic)
                </button>
                <button
                  type="button"
                  onClick={() => onFieldChange('templateVariant', 'vector')}
                  className={`px-2.5 py-1.5 text-xs rounded-lg border font-semibold transition-all ${data.templateVariant === 'vector'
                    ? 'bg-burgundy text-white border-burgundy shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  Vector Standard
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
