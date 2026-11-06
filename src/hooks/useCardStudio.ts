'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
    fullName: 'ROHIT KHATRI',
    fatherName: 'SUBHASH KHATRI',
    dateOfBirth: '15/08/1990',
    gender: 'MALE',
    photoUrl: '',
    signatureUrl: '',
    category: 'Individual',
    templateVariant: 'nsdl',
    layoutFormat: 'cr80',
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
    genderRegional: 'पुरुष',
    age: '42',
    dateOfBirth: '01/01/1982',
    assemblyConstituency: '14 - GOVINDGANJ',
    assemblyConstituencyRegional: '14 - गोविन्दगंज',
    partNumberAndName: '257 - PRATHMIK VIDYALAY JHAKHARA, DAKSHINI BHAG',
    partNumberAndNameRegional: '257 - प्राथमिक विद्यालय झखरा दक्षिणी भाग',
    partNo: '257',
    partName: 'PRATHMIK VIDYALAY JHAKHARA, DAKSHINI BHAG',
    partNameRegional: 'प्राथमिक विद्यालय झखरा दक्षिणी भाग',
    acNo: '14',
    acName: 'GOVINDGANJ',
    acNameRegional: 'गोविन्दगंज',
    district: 'PURVI CHAMPARAN',
    districtRegional: 'पूर्वी चम्पारण',
    state: 'BIHAR',
    stateRegional: 'बिहार',
    fullAddress: 'HOUSE NO 12, PRATHMIK VIDYALAY JHAKHARA, GOVINDGANJ, PURVI CHAMPARAN, BIHAR - 845401',
    fullAddressRegional: 'मकान नं १२, प्राथमिक विद्यालय झखरा, गोविन्दगंज, पूर्वी चम्पारण, बिहार - ८४५४०१',
    photoUrl: '',
    signatureUrl: '/assets/voter/voter-officer-sign.png',
    issueDate: '23/09/2026',
    downloadDate: '06/11/2026',
    language: 'HI',
    houseNo: 'HOUSE NO 12',
    labelNameRegional: 'नाम',
    labelRelationRegional: 'पिता का नाम',
    labelGenderRegional: 'लिंग',
    labelDobRegional: 'जन्म तिथि / आयु',
    labelAddressRegional: 'पता',
    labelSignRegional: 'निर्वाचक रजिस्ट्रीकरण अधिकारी',
    layoutFormat: 'cr80',
    templateVariant: 'hindi',
  } as VoterCardData,

  dl: {
    dlNumber: 'UP-1620210012345',
    holderName: 'ROHIT KHATRI',
    fatherOrHusbandName: 'MOHAMMAD FAISAL',
    dateOfBirth: '15-08-1990',
    gender: 'MALE',
    organDonor: 'N',
    state: 'UTTAR PRADESH',
    emergencyContact: '9876543210',
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
    registrationDate: '22-Oct-2022',
    regnValidity: '22-Oct-2037',
    ownerSerial: 1,
    stateCode: 'UP',
    stateIssued: 'Issued by Government of Uttar Pradesh',
    transportType: 'NT',
    chassisNumber: 'MD626AK35N3K13433',
    engineNumber: 'AK3KN3704338',
    ownerName: 'ABU FAISAL',
    sonWifeDaughterOf: 'OBAIDULLA',
    address: 'D-74, BETA 1 , GREATER NOIDA, Gautam Buddha Nagar -201308',
    vehicleClass: 'M-CYCLE/SCOOTER',
    maker: 'TVS MOTOR COMPANY LTD',
    model: 'TVSNTORQ125-SUPER SQUADEDITION',
    color: 'BLACK',
    bodyType: '2 WHEELER',
    fuelType: 'PETROL',
    emissionNorm: 'BHARAT STAGE VI',
    seatingCapacity: '0',
    unladenWeight: '0',
    cubicCapacity: '124.8',
    horsePower: '0',
    wheelBase: '0',
    monthYearOfMfg: '9/2022',
    noOfCylinders: 0,
    financier: 'BANDHAN BANK LTD',
    registeringAuthority: 'Noida, Uttar Pradesh',
    cardIssueDate: '30-08-2026',
    qrPayload: 'https://vahan.parivahan.gov.in/rc?reg=UP16DL3137',
  } as RcCardData,
};

export const blankTemplates: Record<DocumentType, any> = {
  pan: {
    panNumber: '',
    fullName: '',
    fatherName: '',
    dateOfBirth: '',
    gender: 'MALE',
    photoUrl: '',
    signatureUrl: '',
    category: 'Individual',
    templateVariant: 'nsdl',
    layoutFormat: 'cr80',
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
    partNo: '',
    partName: '',
    partNameRegional: '',
    acNo: '',
    acName: '',
    acNameRegional: '',
    district: '',
    districtRegional: '',
    state: '',
    stateRegional: '',
    fullAddress: '',
    fullAddressRegional: '',
    photoUrl: '',
    signatureUrl: '/assets/voter/voter-officer-sign.png',
    issueDate: '',
    downloadDate: '',
    language: 'HI',
    houseNo: '',
    labelNameRegional: 'नाम',
    labelRelationRegional: 'पिता का नाम',
    labelGenderRegional: 'लिंग',
    labelDobRegional: 'जन्म तिथि / आयु',
    labelAddressRegional: 'पता',
    labelSignRegional: 'निर्वाचक रजिस्ट्रीकरण अधिकारी',
    layoutFormat: 'cr80',
    templateVariant: 'hindi',
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
    regnValidity: '',
    ownerSerial: 1,
    stateCode: 'UP',
    stateIssued: 'Issued by Government of Uttar Pradesh',
    transportType: 'NT',
    chassisNumber: '',
    engineNumber: '',
    ownerName: '',
    sonWifeDaughterOf: '',
    address: '',
    vehicleClass: 'M-CYCLE/SCOOTER',
    maker: '',
    model: '',
    color: '',
    bodyType: '2 WHEELER',
    fuelType: 'PETROL',
    emissionNorm: 'BHARAT STAGE VI',
    seatingCapacity: '0',
    unladenWeight: '0',
    cubicCapacity: '',
    horsePower: '0',
    wheelBase: '0',
    monthYearOfMfg: '',
    noOfCylinders: 0,
    financier: '',
    registeringAuthority: '',
    cardIssueDate: '',
    qrPayload: '',
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

  const isDirty = React.useMemo(() => {
    return JSON.stringify(cardData) !== JSON.stringify(originalSnapshot);
  }, [cardData, originalSnapshot]);

  return {
    docType,
    cardData,
    updateField,
    switchDocType,
    resetToOriginal,
    resetToBlank,
    loadData,
    isDirty,
  };
}
