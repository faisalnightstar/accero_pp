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
  Lock,
} from 'lucide-react';
import { VOTER_LANGUAGES, VoterLanguageCode, translateVoterText } from '@/lib/voterLanguages';
import { AADHAAR_LANGUAGES, AadhaarLanguageCode, translateAadhaarText } from '@/lib/aadhaarLanguages';
import {
  FARMER_LANGUAGE_OPTIONS,
  getFarmerLanguageConfig,
  FarmerLanguageCode,
  translateFarmerText,
} from '@/lib/farmerLanguages';

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
  isIdentityLocked?: boolean;
}

const isIdentityKey = (type: DocumentType, key: string): boolean => {
  if (type === 'voter') return key === 'epicNumber';
  if (type === 'pan') return key === 'panNumber';
  if (type === 'aadhaar') return key === 'aadhaarNumber';
  if (type === 'dl') return key === 'dlNumber';
  if (type === 'rc') return key === 'registrationNumber' || key === 'chassisNumber';
  if (type === 'ration') return key === 'rationCardNumber';
  if (type === 'farmer') return key === 'farmerId';
  return false;
};

export default function CardForm({
  docType,
  data,
  onFieldChange,
  missingKeys = [],
  isIdentityLocked = false,
}: CardFormProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAadhaarTranslating, setIsAadhaarTranslating] = useState(false);
  const [isFarmerTranslating, setIsFarmerTranslating] = useState(false);
  const [isRationTranslating, setIsRationTranslating] = useState(false);

  // Auto-translate helper for Ration Card
  const handleRationTranslate = async () => {
    setIsRationTranslating(true);
    try {
      if (data.headOfFamily) {
        const tr = await translateAadhaarText(data.headOfFamily, 'HI');
        onFieldChange('headOfFamilyRegional', tr);
      }
      if (data.fatherOrSpouseName) {
        const tr = await translateAadhaarText(data.fatherOrSpouseName, 'HI');
        onFieldChange('fatherOrSpouseNameRegional', tr);
      }
      if (data.address) {
        const tr = await translateAadhaarText(data.address, 'HI');
        onFieldChange('addressRegional', tr);
      }
    } finally {
      setIsRationTranslating(false);
    }
  };

  const handleAddFamilyMember = () => {
    const list = Array.isArray(data.familyMembers) ? [...data.familyMembers] : [];
    const nextIdx = list.length + 1;
    const newMember = {
      slNo: nextIdx,
      memberId: `M00${nextIdx}`,
      name: '',
      nameRegional: '',
      relation: 'Family Member',
      gender: 'Male',
      age: 20,
      uidLinked: true,
      uidMasked: 'XXXX-XXXX-1234',
    };
    const updated = [...list, newMember];
    onFieldChange('familyMembers', updated);
    onFieldChange('memberCount', updated.length);
  };

  const handleRemoveFamilyMember = (index: number) => {
    const list = Array.isArray(data.familyMembers) ? [...data.familyMembers] : [];
    const updated = list.filter((_, i) => i !== index).map((m, i) => ({ ...m, slNo: i + 1 }));
    onFieldChange('familyMembers', updated);
    onFieldChange('memberCount', updated.length);
  };

  const handleUpdateFamilyMember = (index: number, key: string, val: any) => {
    const list = Array.isArray(data.familyMembers) ? [...data.familyMembers] : [];
    if (!list[index]) return;
    const updated = [...list];
    updated[index] = { ...updated[index], [key]: val };
    onFieldChange('familyMembers', updated);
  };

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

  // Auto-translate helper for multi-lingual Farmer Card
  const handleFarmerTranslate = async (targetLang?: string) => {
    const lang = (targetLang || data.language || 'HI').toUpperCase() as FarmerLanguageCode;
    const langConfig = getFarmerLanguageConfig(lang);
    setIsFarmerTranslating(true);

    try {
      onFieldChange('language', lang);

      // 1. Set regional headers from dictionary for target language
      onFieldChange('departmentHeaderRegional', langConfig.headerTitle.regional);
      onFieldChange('departmentTitleRegional', langConfig.headerTitle.regional);
      onFieldChange('ministryHeaderRegional', langConfig.ministryTitle.regional);
      onFieldChange('ministryTitleRegional', langConfig.ministryTitle.regional);

      // 2. Set regional gender from dictionary
      const isFemale = (data.gender || '').toLowerCase().includes('female');
      onFieldChange('genderRegional', isFemale ? langConfig.labels.female : langConfig.labels.male);

      // 3. Auto-translate Farmer Name (English -> Regional)
      const nameToTranslate = data.farmerName || data.name;
      if (nameToTranslate) {
        if (lang === 'EN') {
          onFieldChange('farmerNameRegional', nameToTranslate);
        } else {
          const transName = await translateFarmerText(nameToTranslate, lang);
          onFieldChange('farmerNameRegional', transName);
        }
      }
    } finally {
      setIsFarmerTranslating(false);
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

  // Helper to render an input field with optional amber missing-field badge or locked identity treatment
  const renderInput = (
    key: string,
    label: string,
    placeholder: string = '',
    type: string = 'text',
    required: boolean = false
  ) => {
    const isMissing = missingKeys.includes(key);
    const value = data ? (data[key] ?? '') : '';
    const isLocked = Boolean(isIdentityLocked && isIdentityKey(docType, key));

    return (
      <div className="flex flex-col gap-1.5" id={`field-container-${key}`}>
        <div className="flex items-center justify-between">
          <label
            htmlFor={`input-${key}`}
            className="text-xs font-semibold text-gray-700 flex items-center gap-1"
          >
            {isLocked && <Lock className="w-3.5 h-3.5 text-slate-500 inline-block mr-0.5" />}
            <span>{label}</span>
            {required && <span className="text-crimson">*</span>}
          </label>

          {isLocked ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              <Lock className="w-2.5 h-2.5 text-slate-500" />
              Verified Identity (Locked)
            </span>
          ) : isMissing ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              Missing from API
            </span>
          ) : null}
        </div>

        <input
          id={`input-${key}`}
          type={type}
          value={value}
          readOnly={isLocked}
          disabled={isLocked}
          onChange={(e) => {
            if (isLocked) return;
            onFieldChange(key, e.target.value);
          }}
          placeholder={isLocked ? `Locked: ${value}` : placeholder}
          className={`w-full px-3 py-2 text-xs rounded-lg border transition-all outline-none font-medium ${
            isLocked
              ? 'border-slate-300 bg-slate-100/90 text-slate-700 font-mono cursor-not-allowed select-none'
              : isMissing
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
              {renderInput('fatherName', "Father's Full Name", 'e.g. SUBHAS KHATR', 'text', true)}
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
              docType="pan"
            />
            <AssetDropzone
              label="Cardholder Signature"
              value={data.signatureUrl}
              onChange={(val) => onFieldChange('signatureUrl', val)}
              onClear={() => onFieldChange('signatureUrl', '')}
              aspectRatio="signature"
              helperText="Scanned signature on plain white paper"
              isMissing={missingKeys.includes('signatureUrl')}
              docType="pan"
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
              docType="aadhaar"
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
                {renderInput('electorName', 'Elector Name (English)', 'e.g. Ram Kumar', 'text', true)}
              </div>
              <div>
                {renderInput('electorNameRegional', 'Elector Name (Regional)', 'e.g. राम कुमार', 'text', false)}
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
                {renderInput('relationName', "Relative Name (English)", 'e.g. Dashrat Kumar', 'text', true)}
              </div>
              <div className="sm:col-span-2">
                {renderInput('relationNameRegional', 'Relative Name (Regional)', 'e.g. दशरत कुमार', 'text', false)}
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
                {renderInput('dateOfBirth', 'Date of Birth (DD/MM/YYYY)', 'e.g. 01/01/1990', 'text', false)}
              </div>
              <div>
                {renderInput('age', 'Age (Years)', 'e.g. 32', 'text', false)}
              </div>
            </div>
          </div>

          {/* Polling & Constituency Info */}
          <div className="space-y-3 border-t border-gray-100 pt-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">2. Constituency & Polling Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {renderInput('assemblyConstituency', 'Assembly Constituency (English)', 'e.g. 14 - Varanasi', 'text', true)}
              </div>
              <div>
                {renderInput('assemblyConstituencyRegional', 'Assembly Constituency (Regional)', 'e.g. 14 - वाराणसी', 'text', false)}
              </div>
              <div>
                {renderInput('partNumberAndName', 'Part No & Name (English)', 'e.g. 257 - PRATHMIK VIDYALAY...', 'text', true)}
              </div>
              <div>
                {renderInput('partNumberAndNameRegional', 'Part No & Name (Regional)', 'e.g. 257 - प्राथमिक विद्यालय...', 'text', false)}
              </div>
              <div>
                {renderInput('tehsil', 'Tehsil / Taluka', 'e.g. Varanasi', 'text', false)}
              </div>
              <div>
                {renderInput('district', 'District (English)', 'e.g. PURVI VARANASI', 'text', false)}
              </div>
              <div>
                {renderInput('districtRegional', 'District (Regional)', 'e.g. पूर्वी वाराणसी', 'text', false)}
              </div>
              <div>
                {renderInput('state', 'State (English)', 'e.g. UTTAR PRADESH', 'text', false)}
              </div>
              <div className="sm:col-span-2">
                {renderInput('stateRegional', 'State (Regional)', 'e.g. उत्तर प्रदेश', 'text', false)}
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
              docType="voter"
            />
            <AssetDropzone
              label="Officer Specimen Signature"
              value={data.signatureUrl || '/assets/voter/voter-officer-sign.png'}
              onChange={(val) => onFieldChange('signatureUrl', val)}
              onClear={() => onFieldChange('signatureUrl', '')}
              aspectRatio="signature"
              helperText="Electoral Registration Officer Signature"
              docType="voter"
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
                {renderInput('fatherOrHusbandName', 'S/W/D of (Son/Wife/Daughter of)', 'e.g. SUBHAS KHATR', 'text', true)}
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
              docType="dl"
            />
            <AssetDropzone
              label="Driver Signature"
              value={data.signatureUrl}
              onChange={(val) => onFieldChange('signatureUrl', val)}
              onClear={() => onFieldChange('signatureUrl', '')}
              aspectRatio="signature"
              helperText="Official Driver Specimen Signature"
              isMissing={missingKeys.includes('signatureUrl')}
              docType="dl"
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

      {/* ============================================================== */}
      {/* 5B. RATION CARD (NFSA / Department of Food & Civil Supplies)  */}
      {/* ============================================================== */}
      {docType === 'ration' && (
        <div className="space-y-4">
          {/* Section 1: Ration Card Identity & Scheme */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5 text-burgundy" />
                <span>1. Ration Card Identity & Category</span>
              </div>
              <button
                type="button"
                onClick={handleRationTranslate}
                disabled={isRationTranslating}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-burgundy hover:bg-burgundy/90 rounded-md shadow-2xs transition-all disabled:opacity-50"
                title="Auto-translate Head of Family, Father/Spouse, and Address to Hindi"
              >
                {isRationTranslating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-gold" />
                    <span>Auto-Translate</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                {renderInput('rationCardNumber', 'Ration Card Number', '10350050028009409992', 'text', true)}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Card Category / Scheme <span className="text-crimson">*</span>
                </label>
                <select
                  value={data.category || 'PHH'}
                  onChange={(e) => {
                    const cat = e.target.value;
                    onFieldChange('category', cat);
                    const schemeNames: Record<string, string> = {
                      PHH: 'PHH - Priority Household (पात्र गृहस्थी)',
                      AAY: 'AAY - Antyodaya Anna Yojana (अंत्योदय अन्न योजना)',
                      BPL: 'BPL - Below Poverty Line (गरीबी रेखा से नीचे)',
                      APL: 'APL - Above Poverty Line (सामान्य परिवार)',
                      WHITE: 'WHITE - Non-Subsidized White Card',
                    };
                    onFieldChange('schemeName', schemeNames[cat] || cat);
                  }}
                  className="w-full text-xs font-semibold rounded-lg border border-slate-300 p-2 bg-white focus:ring-1 focus:ring-burgundy"
                >
                  <option value="PHH">PHH - Priority Household (पात्र गृहस्थी)</option>
                  <option value="AAY">AAY - Antyodaya Anna Yojana (अंत्योदय)</option>
                  <option value="BPL">BPL - Below Poverty Line</option>
                  <option value="APL">APL - Above Poverty Line</option>
                  <option value="WHITE">WHITE - Non-Subsidized Card</option>
                </select>
              </div>

              <div>
                {renderInput('schemeName', 'Scheme Description', 'PHH - Priority Household (पात्र गृहस्थी)', 'text', false)}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Card Status
                </label>
                <select
                  value={data.status || 'ACTIVE'}
                  onChange={(e) => onFieldChange('status', e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-slate-300 p-2 bg-white focus:ring-1 focus:ring-burgundy"
                >
                  <option value="ACTIVE">ACTIVE (सक्रिय)</option>
                  <option value="INACTIVE">INACTIVE (निष्क्रिय / निलंबित)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Head of Family & Photograph */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-burgundy" />
              <span>2. Head of Family (मुखिया) Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                {renderInput('headOfFamily', 'Head of Family Name (English)', 'Sunita Devi', 'text', true)}
              </div>
              <div>
                {renderInput('headOfFamilyRegional', 'Head of Family Name (Regional / Hindi)', 'सुनीता देवी', 'text', false)}
              </div>
              <div>
                {renderInput('fatherOrSpouseName', 'Father / Spouse Name (English)', 'Ramesh Kumar', 'text', false)}
              </div>
              <div>
                {renderInput('fatherOrSpouseNameRegional', 'Father / Spouse Name (Regional / Hindi)', 'रमेश कुमार', 'text', false)}
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                <AssetDropzone
                  label="Head of Family Photograph"
                  value={data.photoUrl}
                  onChange={(val) => onFieldChange('photoUrl', val)}
                  onClear={() => onFieldChange('photoUrl', '')}
                  aspectRatio="photo"
                  helperText="Passport photograph of Head of Family (Mukhya)"
                  isMissing={missingKeys.includes('photoUrl')}
                  docType="ration"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Fair Price Shop (FPS) & Entitlements */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-burgundy" />
              <span>3. Fair Price Shop (FPS) & Gas Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                {renderInput('fpsCode', 'Fair Price Shop Code', '10423001', 'text', false)}
              </div>
              <div>
                {renderInput('fpsName', 'Fair Price Shop Dealer Name', 'Shri Ram Kripa Sahkari Bhandar', 'text', false)}
              </div>
              <div>
                {renderInput('gasConnectionStatus', 'Gas Connection (PMUY / None)', 'Yes (PMUY)', 'text', false)}
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input
                  id="input-onorcEligible"
                  type="checkbox"
                  checked={data.onorcEligible !== false}
                  onChange={(e) => onFieldChange('onorcEligible', e.target.checked)}
                  className="w-4 h-4 text-burgundy rounded border-slate-300 focus:ring-burgundy"
                />
                <label htmlFor="input-onorcEligible" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  One Nation One Ration Card (ONORC) Eligible
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Residential Address & Jurisdiction */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-burgundy" />
              <span>4. Address & Jurisdiction</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                {renderInput('address', 'Full Residential Address (English)', 'House No. 42, Ward 12, Rampur, Patna, Bihar - 800001', 'text', true)}
              </div>
              <div className="sm:col-span-2">
                {renderInput('addressRegional', 'Full Address (Regional / Hindi)', 'मकान नं. 42, वार्ड 12, रामपुर, पटना, बिहार - 800001', 'text', false)}
              </div>
              <div>
                {renderInput('district', 'District (जिला)', 'Patna', 'text', false)}
              </div>
              <div>
                {renderInput('state', 'State (राज्य)', 'Bihar', 'text', false)}
              </div>
              <div>
                {renderInput('issueDate', 'Issue Date (DD/MM/YYYY)', '12/04/2021', 'text', false)}
              </div>
              <div>
                {renderInput('validUpto', 'Validity', 'Life Time', 'text', false)}
              </div>
            </div>
          </div>

          {/* Section 5: Family Members Manager */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-burgundy" />
                <span>5. Family Members List</span>
                <span className="text-[10px] font-bold bg-burgundy/10 text-burgundy px-1.5 py-0.5 rounded-full ml-1">
                  {Array.isArray(data.familyMembers) ? data.familyMembers.length : 0} Members
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddFamilyMember}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-2xs transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Add Member</span>
              </button>
            </div>

            {Array.isArray(data.familyMembers) && data.familyMembers.length > 0 ? (
              <div className="space-y-2">
                {data.familyMembers.map((member: any, idx: number) => (
                  <div
                    key={member.memberId || idx}
                    className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {member.name || `Member ${idx + 1}`}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          ({member.relation || 'Member'})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFamilyMember(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
                          Member Name
                        </label>
                        <input
                          type="text"
                          value={member.name || ''}
                          onChange={(e) => handleUpdateFamilyMember(idx, 'name', e.target.value)}
                          placeholder="Full Name"
                          className="w-full text-xs rounded border border-slate-300 p-1.5 focus:ring-1 focus:ring-burgundy"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
                          Relation
                        </label>
                        <input
                          type="text"
                          value={member.relation || ''}
                          onChange={(e) => handleUpdateFamilyMember(idx, 'relation', e.target.value)}
                          placeholder="e.g. Son, Wife"
                          className="w-full text-xs rounded border border-slate-300 p-1.5 focus:ring-1 focus:ring-burgundy"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
                          Gender / Age
                        </label>
                        <div className="flex gap-1">
                          <select
                            value={member.gender || 'Male'}
                            onChange={(e) => handleUpdateFamilyMember(idx, 'gender', e.target.value)}
                            className="w-1/2 text-xs rounded border border-slate-300 p-1 focus:ring-1 focus:ring-burgundy"
                          >
                            <option value="Male">M</option>
                            <option value="Female">F</option>
                            <option value="Other">O</option>
                          </select>
                          <input
                            type="number"
                            value={member.age || ''}
                            onChange={(e) => handleUpdateFamilyMember(idx, 'age', Number(e.target.value))}
                            placeholder="Age"
                            className="w-1/2 text-xs rounded border border-slate-300 p-1 focus:ring-1 focus:ring-burgundy"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 pt-3 sm:pt-4">
                        <input
                          type="checkbox"
                          id={`uid-link-${idx}`}
                          checked={member.uidLinked !== false}
                          onChange={(e) => handleUpdateFamilyMember(idx, 'uidLinked', e.target.checked)}
                          className="w-3.5 h-3.5 text-burgundy rounded border-slate-300"
                        />
                        <label htmlFor={`uid-link-${idx}`} className="text-[10px] font-semibold text-gray-600 cursor-pointer">
                          Aadhaar Linked
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-white border border-dashed border-slate-300 rounded-lg text-xs text-gray-500">
                No family members added. Click &quot;Add Member&quot; to add family members to this Ration Card.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. FARMER ID (AgriStack / Rajasthan Farmer Registry) FORM     */}
      {/* ============================================================== */}
      {docType === 'farmer' && (
        <div className="space-y-4">
          {/* Section 1: Identity & Personal Details */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-burgundy" />
                <span>1. Farmer Identity & Details</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-burgundy" />
                  <select
                    value={data.language || 'HI'}
                    onChange={(e) => {
                      const newLang = e.target.value as FarmerLanguageCode;
                      onFieldChange('language', newLang);
                      handleFarmerTranslate(newLang);
                    }}
                    className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded px-2 py-0.5 focus:ring-1 focus:ring-burgundy"
                  >
                    {FARMER_LANGUAGE_OPTIONS.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.nativeName})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => handleFarmerTranslate()}
                  disabled={isFarmerTranslating}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-burgundy hover:bg-burgundy/90 rounded-md shadow-2xs transition-all disabled:opacity-50"
                  title="Auto-translate Farmer Name, Department Header, and Ministry Header into selected regional language"
                >
                  {isFarmerTranslating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Translating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-gold" />
                      <span>Auto-Translate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                {renderInput('farmerId', 'Farmer ID', '4256 177 6703', 'text', true)}
              </div>
              <div>
                {renderInput('aadhaarNumber', 'Aadhaar Number (12 Digits)', '411921789250', 'text', false)}
              </div>
              <div>
                <label htmlFor="input-farmerName" className="block text-xs font-semibold text-gray-700 mb-1">
                  Farmer Name (English) <span className="text-crimson">*</span>
                </label>
                <input
                  id="input-farmerName"
                  type="text"
                  value={data.farmerName || ''}
                  onChange={(e) => onFieldChange('farmerName', e.target.value)}
                  onBlur={async () => {
                    const name = data.farmerName;
                    if (name && !data.farmerNameRegional) {
                      setIsFarmerTranslating(true);
                      try {
                        const res = await translateFarmerText(name, data.language || 'HI');
                        onFieldChange('farmerNameRegional', res);
                      } finally {
                        setIsFarmerTranslating(false);
                      }
                    }
                  }}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  placeholder="e.g. Mohan Singh"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="input-farmerNameRegional" className="text-xs font-semibold text-gray-700">
                    Farmer Name (Regional / {getFarmerLanguageConfig(data.language).name})
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      const name = data.farmerName;
                      if (!name) return;
                      setIsFarmerTranslating(true);
                      try {
                        const res = await translateFarmerText(name, data.language || 'HI');
                        onFieldChange('farmerNameRegional', res);
                      } finally {
                        setIsFarmerTranslating(false);
                      }
                    }}
                    disabled={isFarmerTranslating || !data.farmerName}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-burgundy hover:text-burgundy/80 hover:underline disabled:opacity-40"
                    title="Translate name to regional script"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-gold" />
                    <span>Auto-Translate</span>
                  </button>
                </div>
                <input
                  id="input-farmerNameRegional"
                  type="text"
                  value={data.farmerNameRegional || ''}
                  onChange={(e) => onFieldChange('farmerNameRegional', e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  placeholder="e.g. मोहन सिंह"
                />
              </div>
              <div>
                {renderInput('gender', 'Gender (English)', 'Male', 'text', true)}
              </div>
              <div>
                {renderInput('genderRegional', 'Gender (Regional / Hindi)', 'पुरुष', 'text', false)}
              </div>
              <div>
                {renderInput('dateOfBirth', 'Date of Birth (DD/MM/YYYY)', '01/01/1981', 'text', true)}
              </div>
              <div>
                {renderInput('caste', 'Caste / Category', 'General / OBC / SC / ST', 'text', false)}
              </div>
              <div>
                {renderInput('areaCategory', 'Area (Rural / Urban)', 'Rural', 'text', false)}
              </div>
              <div>
                {renderInput('approvalDate', 'Approval Date', '15/06/2025', 'text', false)}
              </div>
              <div className="sm:col-span-2">
                {renderInput('downloadDate', 'Download Date', '15/06/2025', 'text', false)}
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                <AssetDropzone
                  label="Farmer Photograph"
                  value={data.photoUrl}
                  onChange={(val) => onFieldChange('photoUrl', val)}
                  onClear={() => onFieldChange('photoUrl', '')}
                  aspectRatio="photo"
                  helperText="Passport photograph (White or neutral background)"
                  isMissing={missingKeys.includes('photoUrl')}
                  docType="farmer"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address Information */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-burgundy" />
              <span>2. Farmer Address</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Address Line
                </label>
                <textarea
                  rows={2}
                  value={
                    typeof data.address === 'object' && data.address?.fullAddress
                      ? data.address.fullAddress
                      : typeof data.address === 'string'
                        ? data.address
                        : ''
                  }
                  onChange={(e) => {
                    const fullAddr = e.target.value;
                    if (typeof data.address === 'object' && data.address !== null) {
                      onFieldChange('address', { ...data.address, fullAddress: fullAddr });
                    } else {
                      onFieldChange('address', { fullAddress: fullAddr });
                    }
                  }}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  placeholder="S/O: Keshariya, jatav muhalla, house no., Dahwa, Bharatpur, Rajasthan - 321201"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Header, Footer & Verification Configuration */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-burgundy" />
              <span>3. Registry & Contact Info</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="input-departmentHeaderRegional" className="text-xs font-semibold text-gray-700">
                    Department Header (Regional / {getFarmerLanguageConfig(data.language).name})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const cfg = getFarmerLanguageConfig(data.language || 'HI');
                      onFieldChange('departmentHeaderRegional', cfg.headerTitle.regional);
                      onFieldChange('departmentTitleRegional', cfg.headerTitle.regional);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-burgundy hover:text-burgundy/80 hover:underline"
                    title="Auto-fill official regional department header"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-gold" />
                    <span>Auto-Fill</span>
                  </button>
                </div>
                <input
                  id="input-departmentHeaderRegional"
                  type="text"
                  value={data.departmentHeaderRegional || data.departmentTitleRegional || ''}
                  onChange={(e) => {
                    onFieldChange('departmentHeaderRegional', e.target.value);
                    onFieldChange('departmentTitleRegional', e.target.value);
                  }}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  placeholder="e.g. भारत सरकार"
                />
              </div>
              <div>
                {renderInput('departmentTitleEnglish', 'Department Header (English)', 'Government of India', 'text', false)}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="input-ministryHeaderRegional" className="text-xs font-semibold text-gray-700">
                    Ministry Header (Regional / {getFarmerLanguageConfig(data.language).name})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const cfg = getFarmerLanguageConfig(data.language || 'HI');
                      onFieldChange('ministryHeaderRegional', cfg.ministryTitle.regional);
                      onFieldChange('ministryTitleRegional', cfg.ministryTitle.regional);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-burgundy hover:text-burgundy/80 hover:underline"
                    title="Auto-fill official regional ministry header"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-gold" />
                    <span>Auto-Fill</span>
                  </button>
                </div>
                <input
                  id="input-ministryHeaderRegional"
                  type="text"
                  value={data.ministryHeaderRegional || data.ministryTitleRegional || ''}
                  onChange={(e) => {
                    onFieldChange('ministryHeaderRegional', e.target.value);
                    onFieldChange('ministryTitleRegional', e.target.value);
                  }}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  placeholder="e.g. कृषि एवं किसान कल्याण मंत्रालय"
                />
              </div>
              <div>
                {renderInput('ministryTitleEnglish', 'Ministry Header (English)', 'Ministry of Agri & Farmers Welfare', 'text', false)}
              </div>
              <div>
                {renderInput('registryTitle', 'Registry Title', 'Rajasthan Farmer Registry', 'text', false)}
              </div>
              <div>
                {renderInput('helplineNumber', 'Toll-free Helpline', '1800-180-1551', 'text', false)}
              </div>
              <div className="sm:col-span-2">
                {renderInput('websiteUrl', 'Official Portal URL', 'www.rjfr.agristack.gov.in', 'text', false)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
