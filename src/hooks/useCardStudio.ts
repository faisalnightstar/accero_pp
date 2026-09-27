'use client';

import { useState, useCallback } from 'react';
import {
  DocumentType,
  PanCardData,
  AadhaarCardData,
  VoterCardData,
  DlCardData,
  RcCardData,
} from '@/types/cards';

export const defaultMockData: Record<DocumentType, any> = {
  pan: {
    panNumber: 'ABCDE1234F',
    fullName: 'ABU FAISAL',
    fatherName: 'MOHAMMAD FAISAL',
    dateOfBirth: '15/08/1990',
    photoUrl: '',
    signatureUrl: '',
    category: 'Individual',
  } as PanCardData,

  aadhaar: {
    aadhaarNumber: '5749 0326 7673',
    name: 'SUNIL SONKAR',
    nameRegional: 'सुनील सोनकर',
    dateOfBirth: '23/05/1978',
    dateOfBirthRegional: '23/05/1978',
    gender: 'MALE',
    genderRegional: 'पुरुष',
    careOf: 'S/O: Pyarelal',
    careOfRegional: 'आत्मज: प्यारेलाल',
    address: 'HOUSE NO 12, NAI BASTI, CHETGANJ, VARANASI, UTTAR PRADESH - 221001',
    addressRegional: 'मकान नं १२, नई बस्ती, चेतगंज, वाराणसी, उत्तर प्रदेश - २२१००१',
    photoUrl: '',
  } as AadhaarCardData,

  voter: {
    epicNumber: 'AXH0801639',
    electorName: 'RUPLAL SAH',
    electorNameRegional: 'रूपलाल साह',
    relationType: 'FATHER',
    relationName: 'CHANDRIKA SAH',
    relationNameRegional: 'चंद्रिका साह',
    gender: 'Male',
    genderRegional: 'पु',
    age: '42',
    dateOfBirth: '',
    assemblyConstituency: '14 - GOVINDGANJ',
    assemblyConstituencyRegional: '14 - गोविन्दगंज',
    partNumberAndName: '257 - PRATHMIK VIDYALAY JHAKHARA, DAKSHINI BHAG',
    partNumberAndNameRegional: '257 - प्राथमिक विद्यालय झखरा दक्षिणी भाग',
    district: 'PURVI CHAMPARAN',
    districtRegional: 'पूर्वी चम्पारण',
    state: 'BIHAR',
    stateRegional: 'बिहार',
    fullAddress: 'PRATHMIK VIDYALAY JHAKHARA, GOVINDGANJ, PURVI CHAMPARAN, BIHAR',
    fullAddressRegional: 'प्राथमिक विद्यालय झखरा, गोविन्दगंज, पूर्वी चम्पारण, बिहार',
    photoUrl: '',
    signatureUrl: '',
    issueDate: '23/09/2026',
  } as VoterCardData,

  dl: {
    dlNumber: 'UP-1620210012345',
    holderName: 'ABU FAISAL',
    fatherOrHusbandName: 'MOHAMMAD FAISAL',
    dateOfBirth: '15-08-1990',
    bloodGroup: 'O+',
    address: 'FLAT 402, SECTOR 62, NOIDA, GAUTAM BUDDHA NAGAR, UP - 201309',
    issueDate: '10-06-2021',
    validityNonTransport: '14-08-2040',
    validityTransport: '09-06-2026',
    vehicleClasses: [
      { code: 'MCWG', desc: 'Motor Cycle With Gear', issueDate: '10-06-2021' },
      { code: 'LMV', desc: 'Light Motor Vehicle', issueDate: '10-06-2021' },
    ],
    issuingAuthority: 'RTO NOIDA (UP16)',
    photoUrl: '',
    signatureUrl: '',
  } as DlCardData,

  rc: {
    registrationNumber: 'UP16DL3137',
    registrationDate: '10/05/2021',
    chassisNumber: 'ME4JF504LKV012345',
    engineNumber: 'JF50E72012345',
    ownerName: 'ABU FAISAL',
    sonWifeDaughterOf: 'MOHAMMAD FAISAL',
    address: 'FLAT 402, SECTOR 62, NOIDA, GAUTAM BUDDHA NAGAR, UP - 201309',
    vehicleClass: 'M-CYCLE/SCOOTER(2WN)',
    makerModel: 'HONDA MOTORCYCLES / ACTIVA 6G',
    fuelType: 'PETROL',
    emissionNorm: 'BHARAT STAGE VI',
    seatingCapacity: '2 In All',
    unladenWeight: '107 Kg',
    hypothecatedTo: 'STATE BANK OF INDIA',
    fitnessValidUpto: '09/05/2036',
    taxPaidUpto: 'L.T.T (One Time)',
    issuingAuthority: 'RTO NOIDA (UP16)',
  } as RcCardData,
};

export const blankTemplates: Record<DocumentType, any> = {
  pan: {
    panNumber: '',
    fullName: '',
    fatherName: '',
    dateOfBirth: '',
    photoUrl: '',
    signatureUrl: '',
    category: 'Individual',
  },
  aadhaar: {
    aadhaarNumber: '',
    name: '',
    nameRegional: '',
    dateOfBirth: '',
    dateOfBirthRegional: '',
    gender: 'MALE',
    genderRegional: '',
    careOf: '',
    careOfRegional: '',
    address: '',
    addressRegional: '',
    photoUrl: '',
  },
  voter: {
    epicNumber: '',
    electorName: '',
    electorNameRegional: '',
    relationType: 'FATHER',
    relationName: '',
    relationNameRegional: '',
    gender: 'Male',
    genderRegional: '',
    age: '',
    dateOfBirth: '',
    assemblyConstituency: '',
    assemblyConstituencyRegional: '',
    partNumberAndName: '',
    partNumberAndNameRegional: '',
    district: '',
    districtRegional: '',
    state: '',
    stateRegional: '',
    fullAddress: '',
    fullAddressRegional: '',
    photoUrl: '',
    signatureUrl: '',
    issueDate: '',
  },
  dl: {
    dlNumber: '',
    holderName: '',
    fatherOrHusbandName: '',
    dateOfBirth: '',
    bloodGroup: '',
    address: '',
    issueDate: '',
    validityNonTransport: '',
    validityTransport: '',
    vehicleClasses: [],
    issuingAuthority: '',
    photoUrl: '',
    signatureUrl: '',
  },
  rc: {
    registrationNumber: '',
    registrationDate: '',
    chassisNumber: '',
    engineNumber: '',
    ownerName: '',
    sonWifeDaughterOf: '',
    address: '',
    vehicleClass: '',
    makerModel: '',
    fuelType: 'PETROL',
    emissionNorm: 'BHARAT STAGE VI',
    seatingCapacity: '',
    unladenWeight: '',
    hypothecatedTo: '',
    fitnessValidUpto: '',
    taxPaidUpto: '',
    issuingAuthority: '',
  },
};

export function useCardStudio(initialType: DocumentType = 'pan') {
  const [docType, setDocType] = useState<DocumentType>(initialType);
  const [cardData, setCardData] = useState<any>(() => structuredClone(defaultMockData[initialType]));
  const [originalSnapshot, setOriginalSnapshot] = useState<any>(() => structuredClone(defaultMockData[initialType]));

  const updateField = useCallback((key: string, value: any) => {
    setCardData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const switchDocType = useCallback((newType: DocumentType, useBlank: boolean = false) => {
    setDocType(newType);
    const template = useBlank
      ? structuredClone(blankTemplates[newType])
      : structuredClone(defaultMockData[newType]);
    setCardData(template);
    setOriginalSnapshot(template);
  }, []);

  const resetToOriginal = useCallback(() => {
    setCardData(structuredClone(originalSnapshot));
  }, [originalSnapshot]);

  const loadData = useCallback((type: DocumentType, incomingData: any) => {
    setDocType(type);
    const cloned = structuredClone(incomingData);
    setCardData(cloned);
    setOriginalSnapshot(cloned);
  }, []);

  const resetToBlank = useCallback(() => {
    const blank = structuredClone(blankTemplates[docType]);
    setCardData(blank);
  }, [docType]);

  return {
    docType,
    cardData,
    updateField,
    switchDocType,
    resetToOriginal,
    resetToBlank,
    loadData,
  };
}
