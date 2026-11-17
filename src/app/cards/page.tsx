'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  Printer,
  FileText,
  CreditCard,
  CheckCircle2,
  FileDown,
  Image as ImageIcon,
  Loader2,
  Car,
  Sprout,
  UtensilsCrossed,
} from 'lucide-react';
import Cr80CardContainer from '@/components/cards/Cr80CardContainer';
import PrintControls from '@/components/cards/PrintControls';
import PanCardCanvas from '@/components/cards/PanCardCanvas';
import VoterCardCanvas from '@/components/cards/VoterCardCanvas';
import AadhaarCardCanvas from '@/components/cards/AadhaarCardCanvas';
import DlCardCanvas from '@/components/cards/DlCardCanvas';
import RcCardCanvas from '@/components/cards/RcCardCanvas';
import FarmerCardCanvas from '@/components/cards/FarmerCardCanvas';
import RationCardCanvas from '@/components/cards/RationCardCanvas';
import { exportCardAsPdf, exportCardAsPng } from '@/lib/cardExport';
import { authorizePrintAction } from '@/actions/print';
import {
  trackEvent,
  ANALYTICS_EVENTS,
  Analytics,
  trackPrintInitiated,
  trackPrintDialogClosed,
} from '@/lib/analytics/events';
import {
  PanCardData,
  VoterCardData,
  AadhaarCardData,
  DlCardData,
  RcCardData,
  FarmerCardData,
  RationCardData,
} from '@/types/cards';
import {
  FarmerLanguageCode,
  FARMER_LANGUAGE_OPTIONS,
} from '@/lib/farmerLanguages';

// Realistic sample PAN data
const samplePanData: PanCardData = {
  panNumber: 'ABCDE1234F',
  fullName: 'ROHIT SINGH',
  fatherName: 'RAJU SINGH',
  dateOfBirth: '15/08/1990',
  gender: 'MALE',
  photoUrl: '',
  signatureUrl: '',
  category: 'Individual',
  templateVariant: 'nsdl',
  layoutFormat: 'cr80',
};

// Realistic sample Voter ID data (matching real sample from pdf.html)
const sampleVoterData: VoterCardData = {
  epicNumber: 'ABC0123456',
  electorName: 'Ram Kumar',
  electorNameRegional: 'राम कुमार',
  relationType: 'FATHER',
  relationName: 'Dashrat Kumar',
  relationNameRegional: 'दशरत कुमार',
  gender: 'Male',
  genderRegional: 'पुरुष',
  age: '42',
  dateOfBirth: '01/01/1982',
  assemblyConstituency: '14 - Varanasi',
  assemblyConstituencyRegional: '14 - वाराणसी',
  partNumberAndName: '257 - PRATHMIK VIDYALAY Rohaniya, DAKSHINI BHAG',
  partNumberAndNameRegional: '257 - प्राथमिक विद्यालय रोहनिया दक्षिणी भाग',
  district: 'PURVI VARANASI',
  districtRegional: 'पूर्वी वाराणसी',
  state: 'UTTAR PRADESH',
  stateRegional: 'उतार प्रदेश',
  fullAddress: 'HOUSE NO 12, PRATHMIK VIDYALAY Rohaniya, Varanasi, PURVI VARANASI, UTTAR PRADESH - 543212',
  fullAddressRegional: 'मकान नं १२, प्राथमिक विद्यालय रोहनिया, वाराणसी, पूर्वी वाराणसी, उतार प्रदेश - 543212',
  issueDate: '23/09/2026',
  downloadDate: '06/11/2026',
  signatureUrl: '/assets/voter/voter-officer-sign.png',
  language: 'HI',
  labelNameRegional: 'नाम',
  labelRelationRegional: 'पिता का नाम',
  labelGenderRegional: 'लिंग',
  labelDobRegional: 'जन्म तिथि / आयु',
  labelAddressRegional: 'पता',
  labelSignRegional: 'निर्वाचक रजिस्ट्रीकरण अधिकारी',
  layoutFormat: 'cr80',
  templateVariant: 'hindi',
};

// Realistic sample Aadhaar data
const sampleAadhaarData: AadhaarCardData = {
  aadhaarNumber: '5749 0326 7673',
  name: 'SUNIL SONKAR',
  nameRegional: 'सुनील सोनकर',
  dateOfBirth: '23/05/1978',
  dateOfBirthRegional: 'जन्म तिथि',
  gender: 'MALE',
  genderRegional: 'पुरुष',
  careOf: 'S/O Pyarelal',
  careOfRegional: 'आत्मज प्यारेलाल',
  address: 'HOUSE NO 12, NAI BASTI, CHETGANJ, VARANASI, UTTAR PRADESH - 221001',
  addressRegional: 'मकान नं १२, नई बस्ती, चेतगंज, वाराणसी, उत्तर प्रदेश - २२१००१',
  downloadDate: '06/11/2026',
  issueDate: '15/01/2018',
  enrollmentNo: '1429/70044/00201',
  language: 'HI',
  labelAddressRegional: 'पता',
  labelDobRegional: 'जन्म तिथि',
  layoutFormat: 'cr80',
};

// Realistic sample Driving License data
const sampleDlData: DlCardData = {
  dlNumber: 'UP-1620210012345',
  holderName: 'ROHIT SINGH',
  fatherOrHusbandName: 'AMRESH KUMAR',
  dateOfBirth: '15-08-1990',
  bloodGroup: 'O+',
  address: 'FLAT 402, SECTOR 62, NOIDA, GAUTAM BUDDHA NAGAR, UP - 201309',
  issueDate: '10-06-2021',
  validityNonTransport: '14-08-2040',
  validityTransport: '09-06-2026',
  adpvehNo: '-',
  hazardousValidUpto: '-',
  hillValidUpto: '-',
  vehicleClasses: [
    { code: 'MCWG', desc: 'Motor Cycle With Gear', issueDate: '10-06-2021', category: 'NT' },
    { code: 'LMV', desc: 'Light Motor Vehicle', issueDate: '10-06-2021', category: 'NT' },
  ],
  issuingAuthority: 'RTO NOIDA (UP16)',
};

// Realistic sample Vehicle RC data (matching official Form 23A reference card)
const sampleRcData: RcCardData = {
  registrationNumber: 'DL05RR1234',
  registrationDate: '22-Oct-2022',
  regnValidity: '22-Oct-2037',
  ownerSerial: 1,
  stateCode: 'UP',
  stateIssued: 'Issued by Government of Uttar Pradesh',
  transportType: 'NT',
  chassisNumber: 'AB123CD12E1F12345',
  engineNumber: 'AB1CD1234567',
  ownerName: 'RAHUL KUMAR',
  sonWifeDaughterOf: 'SUBHAM KUMAR',
  address: 'Gautam Buddha Nagar, 201308',
  vehicleClass: 'M-CYCLE/SCOOTER',
  maker: 'TVS MOTOR COMPANY LTD',
  model: 'TVSNTORQ125-SUPER SQUADEDITION',
  color: 'BLACK',
  bodyType: '2 WHEELER',
  fuelType: 'PETROL',
  emissionNorm: 'BHARAT STAGE VI',
  seatingCapacity: '2',
  unladenWeight: '0',
  cubicCapacity: '124',
  horsePower: '0',
  wheelBase: '0',
  monthYearOfMfg: '9/2022',
  noOfCylinders: 0,
  financier: 'BANDHAN BANK LTD',
  registeringAuthority: 'Noida, Uttar Pradesh',
  cardIssueDate: '01-11-2026',
  qrPayload: 'https://vahan.parivahan.gov.in/rc?reg=DL05RR1234',
  layoutFormat: 'cr80',
  templateVariant: 'authentic',
};

// Realistic sample Farmer ID data (matching official Rajasthan Farmer Registry sample)
const sampleFarmerData: FarmerCardData = {
  farmerId: '4256 177 6703',
  farmerName: 'Mohan Singh',
  farmerNameRegional: 'मोहन सिंह',
  gender: 'Male',
  genderRegional: 'पुरुष',
  dateOfBirth: '01/01/1981',
  caste: '',
  areaCategory: 'Rural',
  aadhaarNumber: '411921789250',
  maskAadhaar: false,
  photoUrl: '',
  approvalDate: '15/06/2025',
  downloadDate: '15/06/2025',
  departmentHeaderRegional: 'भारत सरकार',
  departmentTitleEnglish: 'Government of India',
  ministryHeaderRegional: 'कृषि एवं किसान कल्याण मंत्रालय',
  ministryTitleEnglish: 'Ministry of Agri & Farmers Welfare',
  registryTitle: 'Rajasthan Farmer Registry',
  helplineNumber: '1800-180-1551',
  websiteUrl: 'www.rjfr.agristack.gov.in',
  qrPayload: 'https://rjfr.agristack.gov.in/verify?id=42561776703',
  address: {
    fatherOrSpouseName: 'S/O: Keshariya',
    locality: 'jatav muhalla',
    houseNumber: '',
    village: 'Dahwa',
    district: 'Bharatpur',
    state: 'Rajasthan',
    pinCode: '321201',
    fullAddress: 'S/O: Keshariya, jatav muhalla, house no., Dahwa, Bharatpur, Rajasthan - 321201',
  },
  landRecords: [
    { khata: '10', khasra: '218', area: '0.000833' },
    { khata: '10', khasra: '235', area: '0.010833' },
    { khata: '11', khasra: '32', area: '0.022917' },
    { khata: '10', khasra: '196', area: '0.023333' },
    { khata: '10', khasra: '220', area: '0.024583' },
    { khata: '11', khasra: '33', area: '0.025' },
  ],
  layoutFormat: 'cr80',
  templateVariant: 'rajasthan',
};

// Realistic sample Ration Card data (NFSA / Department of Food & Civil Supplies)
const sampleRationData: RationCardData = {
  rationCardNumber: '10350050028009409992',
  headOfFamily: 'Sunita Devi',
  headOfFamilyRegional: 'सुनीता देवी',
  fatherOrSpouseName: 'Ramesh Kumar',
  fatherOrSpouseNameRegional: 'रमेश कुमार',
  category: 'PHH',
  schemeName: 'PHH - Priority Household (पात्र गृहस्थी)',
  fpsName: 'Shri Ram Kripa Sahkari Bhandar',
  fpsCode: '10423001',
  memberCount: 4,
  familyMembers: [
    { slNo: 1, memberId: 'M001', name: 'Sunita Devi', nameRegional: 'सुनीता देवी', relation: 'Self (Head)', relationRegional: 'स्वयं (मुखिया)', gender: 'Female', age: 42, uidLinked: true, uidMasked: 'XXXX-XXXX-4589' },
    { slNo: 2, memberId: 'M002', name: 'Ramesh Kumar', nameRegional: 'रमेश कुमार', relation: 'Spouse (Husband)', relationRegional: 'पति', gender: 'Male', age: 46, uidLinked: true, uidMasked: 'XXXX-XXXX-7812' },
    { slNo: 3, memberId: 'M003', name: 'Aman Kumar', nameRegional: 'अमन कुमार', relation: 'Son', relationRegional: 'पुत्र', gender: 'Male', age: 18, uidLinked: true, uidMasked: 'XXXX-XXXX-3341' },
    { slNo: 4, memberId: 'M004', name: 'Priya Kumari', nameRegional: 'प्रिया कुमारी', relation: 'Daughter', relationRegional: 'पुत्री', gender: 'Female', age: 15, uidLinked: true, uidMasked: 'XXXX-XXXX-9023' },
  ],
  gasConnectionStatus: 'Yes (PMUY)',
  address: 'House No. 42, Ward 12, Rampur, Patna, Bihar - 800001',
  addressRegional: 'मकान नं. 42, वार्ड 12, रामपुर, पटना, बिहार - 800001',
  district: 'Patna',
  state: 'Bihar',
  issueDate: '12/04/2021',
  validUpto: 'Life Time',
  status: 'ACTIVE',
  photoUrl: '',
  qrPayload: 'https://nfsa.gov.in/portal/ration_card_verification?rcid=10350050028009409992',
  departmentHeaderRegional: 'खाद्य एवं नागरिक आपूर्ति विभाग',
  departmentHeaderEnglish: 'Food, Civil Supplies & Consumer Affairs Department',
  helplineNumber: '1967 / 1800-180-2087',
  websiteUrl: 'nfsa.gov.in',
  onorcEligible: true,
  layoutFormat: 'cr80',
};

export default function CardsShowcasePage() {
  const [activeTab, setActiveTab] = useState<'pan' | 'voter' | 'aadhaar' | 'dl' | 'rc' | 'ration' | 'farmer' | 'container'>('pan');
  const [zoom, setZoom] = useState<number>(1.5);
  const [showGuides, setShowGuides] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'both' | 'flip'>('both');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [farmerLanguage, setFarmerLanguage] = useState<FarmerLanguageCode>('HI');

  // References to card DOM nodes for html2canvas export
  const frontCardRef = useRef<HTMLDivElement | null>(null);
  const backCardRef = useRef<HTMLDivElement | null>(null);

  // Render front and back for the selected card tab
  let cardFront: React.ReactNode;
  let cardBack: React.ReactNode;
  let currentDocTitle = 'card';

  if (activeTab === 'pan') {
    cardFront = <PanCardCanvas data={samplePanData} side="front" />;
    cardBack = <PanCardCanvas data={samplePanData} side="back" />;
    currentDocTitle = `pan_${samplePanData.panNumber}`;
  } else if (activeTab === 'voter') {
    cardFront = <VoterCardCanvas data={sampleVoterData} side="front" />;
    cardBack = <VoterCardCanvas data={sampleVoterData} side="back" />;
    currentDocTitle = `voter_${sampleVoterData.epicNumber}`;
  } else if (activeTab === 'aadhaar') {
    cardFront = <AadhaarCardCanvas data={sampleAadhaarData} side="front" />;
    cardBack = <AadhaarCardCanvas data={sampleAadhaarData} side="back" />;
    currentDocTitle = `aadhaar_${sampleAadhaarData.aadhaarNumber.replace(/\s+/g, '')}`;
  } else if (activeTab === 'dl') {
    cardFront = <DlCardCanvas data={sampleDlData} side="front" />;
    cardBack = <DlCardCanvas data={sampleDlData} side="back" />;
    currentDocTitle = `dl_${sampleDlData.dlNumber}`;
  } else if (activeTab === 'rc') {
    cardFront = <RcCardCanvas data={sampleRcData} side="front" variant={sampleRcData.templateVariant} />;
    cardBack = <RcCardCanvas data={sampleRcData} side="back" variant={sampleRcData.templateVariant} />;
    currentDocTitle = `rc_${sampleRcData.registrationNumber}`;
  } else if (activeTab === 'ration') {
    cardFront = <RationCardCanvas data={sampleRationData} side="front" />;
    cardBack = <RationCardCanvas data={sampleRationData} side="back" />;
    currentDocTitle = `ration_${sampleRationData.rationCardNumber}`;
  } else if (activeTab === 'farmer') {
    const farmerDataWithLang: FarmerCardData = {
      ...sampleFarmerData,
      language: farmerLanguage,
    };
    cardFront = <FarmerCardCanvas data={farmerDataWithLang} side="front" />;
    cardBack = <FarmerCardCanvas data={farmerDataWithLang} side="back" />;
    currentDocTitle = `farmer_${sampleFarmerData.farmerId?.replace(/\s+/g, '')}_${farmerLanguage}`;
  } else {
    // Base Demo Container
    cardFront = (
      <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-slate-50 via-white to-slate-100 text-navy relative">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h4 className="text-[11px] font-extrabold text-burgundy uppercase">
            PrintPortal Standard CR80
          </h4>
          <span className="text-[9px] font-mono font-bold bg-steel-blue/10 text-steel-blue px-1.5 py-0.5 rounded">
            SAMPLE-001
          </span>
        </div>
        <div className="text-center my-auto">
          <p className="text-xs font-bold text-navy">ISO/IEC 7810 ID-1 Physical Container</p>
          <p className="text-[9px] text-gray-500">85.60 mm × 53.98 mm (Corner Radius: 3.18 mm)</p>
        </div>
        <div className="border-t border-gray-200 pt-1 text-[7px] text-gray-500 flex justify-between">
          <span>PVC Card Tray Calibration</span>
          <span>Zero-Margin Engine</span>
        </div>
      </div>
    );
    cardBack = (
      <div className="w-full h-full p-4 flex flex-col justify-between bg-slate-100 text-navy relative">
        <div className="border-b border-gray-300 pb-1 text-[8px] font-semibold text-gray-600">
          SECURITY FEATURES & INSTRUCTIONS
        </div>
        <p className="text-[8px] text-gray-600 my-auto">
          Compatible with Evolis, Zebra, Fargo, and Epson PVC card printer trays.
        </p>
        <div className="border-t border-gray-300 pt-1 text-[7px] text-gray-500">
          Support: support@printportal.in
        </div>
      </div>
    );
    currentDocTitle = 'cr80_container_demo';
  }

  // Handle Print with Server Authorization & Wallet Billing
  const handlePrint = async () => {
    try {
      setIsExporting(true);
      const printJobId = `pj_${crypto.randomUUID()}`;

      const res = await authorizePrintAction({
        documentType: activeTab,
        cardIdentifier: currentDocTitle,
        printJobId,
        printFormat: 'CR80',
      });

      if (!res.success) {
        alert(res.error?.message || 'Print authorization failed. Please check your wallet balance.');
        return;
      }

      const isReprint = res.fee === 0;

      // Track verified print initiation (post-authorization, prior to window.print)
      try {
        if (typeof trackPrintInitiated === 'function') {
          trackPrintInitiated(activeTab, isReprint, res.fee);
        } else if (Analytics?.trackPrintInitiated) {
          Analytics.trackPrintInitiated(activeTab, isReprint, res.fee);
        }
      } catch (analyticsErr) {
        console.warn('[Cards] Analytics tracking error (non-fatal):', analyticsErr);
      }

      if (isReprint) {
        trackEvent(ANALYTICS_EVENTS.REPEAT_PRINT, {
          docType: activeTab.toUpperCase(),
          printFormat: 'CR80',
        });
      }

      window.print();

      // Track browser print dialog returning control to application
      try {
        if (typeof trackPrintDialogClosed === 'function') {
          trackPrintDialogClosed(activeTab, isReprint);
        } else if (Analytics?.trackPrintDialogClosed) {
          Analytics.trackPrintDialogClosed(activeTab, isReprint);
        }
      } catch (analyticsErr) {
        console.warn('[Cards] Analytics tracking error (non-fatal):', analyticsErr);
      }
    } catch (err: any) {
      alert(err.message || 'Error authorizing print.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle PDF Export with Server Authorization & Wallet Billing
  const handleExportPdf = async () => {
    if (!frontCardRef.current || !backCardRef.current) return;
    try {
      setIsExporting(true);
      const printJobId = `pj_${crypto.randomUUID()}`;

      const res = await authorizePrintAction({
        documentType: activeTab,
        cardIdentifier: currentDocTitle,
        printJobId,
        printFormat: 'PDF',
      });

      if (!res.success) {
        alert(res.error?.message || 'PDF export authorization failed. Please check your wallet balance.');
        return;
      }

      const isReprint = res.fee === 0;

      // Track verified export initiation (post-authorization)
      try {
        if (typeof trackPrintInitiated === 'function') {
          trackPrintInitiated(activeTab, isReprint, res.fee);
        } else if (Analytics?.trackPrintInitiated) {
          Analytics.trackPrintInitiated(activeTab, isReprint, res.fee);
        }
      } catch (analyticsErr) {
        console.warn('[Cards] Analytics tracking error (non-fatal):', analyticsErr);
      }

      if (isReprint) {
        trackEvent(ANALYTICS_EVENTS.REPEAT_PRINT, {
          docType: activeTab.toUpperCase(),
          printFormat: 'PDF',
        });
      }

      await exportCardAsPdf(frontCardRef.current, backCardRef.current, currentDocTitle);

      // Track completion
      try {
        if (typeof trackPrintDialogClosed === 'function') {
          trackPrintDialogClosed(activeTab, isReprint);
        } else if (Analytics?.trackPrintDialogClosed) {
          Analytics.trackPrintDialogClosed(activeTab, isReprint);
        }
      } catch (analyticsErr) {
        console.warn('[Cards] Analytics tracking error (non-fatal):', analyticsErr);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle PNG Export
  const handleExportPng = async (side: 'front' | 'back') => {
    const el = side === 'front' ? frontCardRef.current : backCardRef.current;
    if (!el) return;
    try {
      setIsExporting(true);
      await exportCardAsPng(el, `${currentDocTitle}_${side}`);
    } catch (err) {
      alert(`Failed to generate ${side} PNG image.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Navigation header (hidden during printing) */}
      <div className="no-print bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-gray-500 hover:text-navy hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-navy flex items-center gap-2">
                CR80 Vector Card Canvas & Print Studio
                <span className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  All 7 Canvases Active
                </span>
              </h1>
              <p className="text-xs text-gray-500">
                Pixel-perfect ISO 7810 ID-1 (85.60 mm × 53.98 mm) Card Tray Printing & 300+ DPI PDF Export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-gray-600 hover:text-navy px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Document Selection Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 border-t border-gray-100 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('pan')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${activeTab === 'pan'
              ? 'border-burgundy text-burgundy'
              : 'border-transparent text-gray-500 hover:text-navy'
              }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>PAN Card</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('aadhaar')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${activeTab === 'aadhaar'
              ? 'border-burgundy text-burgundy'
              : 'border-transparent text-gray-500 hover:text-navy'
              }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Aadhaar Card</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voter')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${activeTab === 'voter'
              ? 'border-burgundy text-burgundy'
              : 'border-transparent text-gray-500 hover:text-navy'
              }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Voter ID (EPIC)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dl')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${activeTab === 'dl'
              ? 'border-burgundy text-burgundy'
              : 'border-transparent text-gray-500 hover:text-navy'
              }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Driving License</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rc')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${activeTab === 'rc'
              ? 'border-burgundy text-burgundy'
              : 'border-transparent text-gray-500 hover:text-navy'
              }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Vehicle RC</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ration')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${activeTab === 'ration'
              ? 'border-burgundy text-burgundy'
              : 'border-transparent text-gray-500 hover:text-navy'
              }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Ration Card</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('farmer')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${activeTab === 'farmer'
              ? 'border-burgundy text-burgundy'
              : 'border-transparent text-gray-500 hover:text-navy'
              }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Farmer ID</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('container')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${activeTab === 'container'
              ? 'border-burgundy text-burgundy'
              : 'border-transparent text-gray-500 hover:text-navy'
              }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Base Container</span>
          </button>
        </div>
      </div>

      {/* Main preview workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center gap-6 print:max-w-none print:w-full print:p-0 print:m-0 print:block print:gap-0">
        {/* Controls Toolbar with Export Actions */}
        <PrintControls
          zoom={zoom}
          onZoomChange={setZoom}
          showGuides={showGuides}
          onToggleGuides={() => setShowGuides(!showGuides)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onPrint={handlePrint}
          isPrinting={isExporting}
          extraActions={
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-navy bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                title="Download 300+ DPI Print-Ready PDF"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-burgundy" />
                )}
                <span>PDF (300 DPI)</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportPng('front')}
                disabled={isExporting}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                title="Download High-Resolution Front PNG"
              >
                <ImageIcon className="w-3 h-3 text-steel-blue" />
                <span>Front PNG</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportPng('back')}
                disabled={isExporting}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                title="Download High-Resolution Back PNG"
              >
                <ImageIcon className="w-3 h-3 text-steel-blue" />
                <span>Back PNG</span>
              </button>
            </div>
          }
        />

        {/* Card Canvas Container */}
        {activeTab === 'farmer' && (
          <div className="no-print flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-2xs">
            <span className="text-xs font-semibold text-gray-500">Language:</span>
            <select
              value={farmerLanguage}
              onChange={(e) => setFarmerLanguage(e.target.value as FarmerLanguageCode)}
              className="text-xs font-bold text-burgundy bg-transparent border-0 cursor-pointer focus:ring-0"
            >
              {FARMER_LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>
        )}

        <section className="w-full flex justify-center py-4 print:py-0 print:block print:w-full">
          <Cr80CardContainer
            front={cardFront}
            back={cardBack}
            activeSide={viewMode}
            zoom={zoom}
            showGuides={showGuides}
            frontRef={frontCardRef}
            backRef={backCardRef}
            orientation={
              activeTab === 'voter'
                ? (sampleVoterData.templateVariant === 'assam' || sampleVoterData.templateVariant === 'legacy' ? 'portrait' : 'landscape')
                : 'landscape'
            }
          />
        </section>

        {/* Informational specs box (hidden during print) */}
        <div className="no-print max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-burgundy/10 text-burgundy shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-navy">5 Preformatted Document Types</h4>
              <p className="text-gray-500 mt-1">
                PAN, Aadhaar, Voter ID, Driving License, and Vehicle RC with official headers and security guilloche overlays.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-steel-blue/10 text-steel-blue shrink-0">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-navy">Zero-Margin PVC Tray Engine</h4>
              <p className="text-gray-500 mt-1">
                Print preview locks browser margins to 0 mm, preventing tray clipping on Evolis, Zebra, Fargo, and Epson printers.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gold/20 text-navy shrink-0">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-navy">1-Click High-DPI Export</h4>
              <p className="text-gray-500 mt-1">
                Instant 300+ DPI client-side PDF construction and PNG rasterization for offline storage and manual tray feeding.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
