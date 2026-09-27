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
} from 'lucide-react';
import Cr80CardContainer from '@/components/cards/Cr80CardContainer';
import PrintControls from '@/components/cards/PrintControls';
import PanCardCanvas from '@/components/cards/PanCardCanvas';
import VoterCardCanvas from '@/components/cards/VoterCardCanvas';
import AadhaarCardCanvas from '@/components/cards/AadhaarCardCanvas';
import DlCardCanvas from '@/components/cards/DlCardCanvas';
import RcCardCanvas from '@/components/cards/RcCardCanvas';
import { exportCardAsPdf, exportCardAsPng } from '@/lib/cardExport';
import {
  PanCardData,
  VoterCardData,
  AadhaarCardData,
  DlCardData,
  RcCardData,
} from '@/types/cards';

// Realistic sample PAN data
const samplePanData: PanCardData = {
  panNumber: 'ABCDE1234F',
  fullName: 'ABU FAISAL',
  fatherName: 'MOHAMMAD FAISAL',
  dateOfBirth: '15/08/1990',
  photoUrl: '',
  signatureUrl: '',
};

// Realistic sample Voter ID data (matching real sample from pdf.html)
const sampleVoterData: VoterCardData = {
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
  issueDate: '23/09/2026',
};

// Realistic sample Aadhaar data
const sampleAadhaarData: AadhaarCardData = {
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
};

// Realistic sample Driving License data
const sampleDlData: DlCardData = {
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
};

// Realistic sample Vehicle RC data (matching real sample from pdf.html)
const sampleRcData: RcCardData = {
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
};

export default function CardsShowcasePage() {
  const [activeTab, setActiveTab] = useState<'pan' | 'voter' | 'aadhaar' | 'dl' | 'rc' | 'container'>('pan');
  const [zoom, setZoom] = useState<number>(1.5);
  const [showGuides, setShowGuides] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'both' | 'flip'>('both');
  const [isExporting, setIsExporting] = useState<boolean>(false);

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
    cardFront = <RcCardCanvas data={sampleRcData} side="front" />;
    cardBack = <RcCardCanvas data={sampleRcData} side="back" />;
    currentDocTitle = `rc_${sampleRcData.registrationNumber}`;
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

  // Handle PDF Export
  const handleExportPdf = async () => {
    if (!frontCardRef.current || !backCardRef.current) return;
    try {
      setIsExporting(true);
      await exportCardAsPdf(frontCardRef.current, backCardRef.current, currentDocTitle);
    } catch (err) {
      alert('Failed to generate PDF. Please try again.');
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
                  All 5 Canvases Active
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
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'pan'
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
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'aadhaar'
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
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'voter'
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
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'dl'
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
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'rc'
                ? 'border-burgundy text-burgundy'
                : 'border-transparent text-gray-500 hover:text-navy'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Vehicle RC</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('container')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'container'
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center gap-6">
        {/* Controls Toolbar with Export Actions */}
        <PrintControls
          zoom={zoom}
          onZoomChange={setZoom}
          showGuides={showGuides}
          onToggleGuides={() => setShowGuides(!showGuides)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
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
        <section className="w-full flex justify-center py-4">
          <Cr80CardContainer
            front={cardFront}
            back={cardBack}
            activeSide={viewMode}
            zoom={zoom}
            showGuides={showGuides}
            frontRef={frontCardRef}
            backRef={backCardRef}
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
