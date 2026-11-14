'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Search,
  RotateCw,
  FileText,
  CreditCard,
  Car,
  UtensilsCrossed,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Cr80CardContainer from '@/components/cards/Cr80CardContainer';
import PanCardCanvas from '@/components/cards/PanCardCanvas';
import AadhaarCardCanvas from '@/components/cards/AadhaarCardCanvas';
import VoterCardCanvas from '@/components/cards/VoterCardCanvas';
import DlCardCanvas from '@/components/cards/DlCardCanvas';
import RcCardCanvas from '@/components/cards/RcCardCanvas';
import RationCardCanvas from '@/components/cards/RationCardCanvas';
import { DocumentType } from '@/types/cards';
import { useRouter } from 'next/navigation';

const SAMPLE_DOCS = [
  {
    type: 'pan' as DocumentType,
    name: 'PAN Card',
    tag: 'NSDL / UTIITSL Format',
    placeholder: 'Enter 10-character PAN (e.g. ABCDE1234F)',
    exampleId: 'ABCDE1234F',
    fee: '₹20',
    data: {
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
    },
  },
  {
    type: 'aadhaar' as DocumentType,
    name: 'Aadhaar PVC',
    tag: 'Bilingual CR80 Layout',
    placeholder: 'Enter 12-digit Aadhaar number',
    exampleId: '234567890123',
    fee: '₹30',
    data: {
      aadhaarNumber: '234567890123',
      fullName: 'सुनील कुमार / SUNIL KUMAR',
      fatherName: 'रामेश्वर प्रसाद / RAMESHWAR PRASAD',
      dateOfBirth: '12/04/1988',
      gender: 'MALE',
      address: 'H.No 142, Ward 5, Shanti Nagar, Lucknow, UP - 226001',
      photoUrl: '',
      qrCodeData: 'https://uidai.gov.in',
      layoutFormat: 'cr80',
    },
  },
  {
    type: 'voter' as DocumentType,
    name: 'Voter ID (EPIC)',
    tag: 'National Electoral Standard',
    placeholder: 'Enter EPIC Number (e.g. WBF1234567)',
    exampleId: 'WBF1234567',
    fee: '₹20',
    data: {
      epicNumber: 'WBF1234567',
      fullName: 'AMIT ROY / अमित रॉय',
      relativeName: 'BIMAL ROY / बिमल रॉय',
      dateOfBirth: '20/06/1992',
      gender: 'MALE',
      address: '14/B Vivekananda Road, Kolkata - 700006',
      assemblyConstituency: '165 - JORASANKO',
      partNumber: '42',
      photoUrl: '',
      layoutFormat: 'cr80',
    },
  },
  {
    type: 'dl' as DocumentType,
    name: 'Driving Licence',
    tag: 'Smart Card Chip Format',
    placeholder: 'Enter DL Number (e.g. DL-0420110012345)',
    exampleId: 'DL-0420110012345',
    fee: '₹25',
    data: {
      dlNumber: 'DL-0420110012345',
      fullName: 'VIKRAM MALHOTRA',
      fatherName: 'SURESH MALHOTRA',
      dateOfBirth: '05/11/1985',
      bloodGroup: 'B+',
      vehicleClasses: ['MCWG', 'LMV'],
      validityNonTransport: '04/11/2035',
      validityTransport: '04/11/2026',
      address: 'Flat 302, Green Glen Layout, Bellandur, Bengaluru - 560103',
      photoUrl: '',
      signatureUrl: '',
      layoutFormat: 'cr80',
    },
  },
  {
    type: 'rc' as DocumentType,
    name: 'Vehicle RC',
    tag: 'Vahan Smart Card Format',
    placeholder: 'Enter Vehicle RC (e.g. DL01AB1234)',
    exampleId: 'DL01AB1234',
    fee: '₹25',
    data: {
      rcNumber: 'DL01AB1234',
      ownerName: 'RAJESH KHANNA',
      fatherName: 'KISHORE KHANNA',
      chassisNumber: 'MA3ERLF3S00123456',
      engineNumber: 'K10BN1234567',
      vehicleClass: 'Motor Car (LMV)',
      fuelType: 'PETROL',
      makerModel: 'MARUTI SUZUKI SWIFT VXI',
      registrationDate: '10/01/2022',
      fitnessUpto: '09/01/2037',
      layoutFormat: 'cr80',
    },
  },
  {
    type: 'ration' as DocumentType,
    name: 'Ration Card',
    tag: 'NFSA Food Security Layout',
    placeholder: 'Enter 12-digit Ration Card Number',
    exampleId: '102030405060',
    fee: '₹25',
    data: {
      rationCardNumber: '102030405060',
      headOfFamily: 'KAMLA DEVI',
      headOfFamilyRegional: 'कमला देवी',
      fatherOrSpouseName: 'LATE MOHAN LAL',
      category: 'PHH',
      fpsName: 'SHREE GANESH KENDRA (FPS-4401)',
      fpsCode: 'FPS-4401',
      memberCount: 4,
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      layoutFormat: 'cr80',
    },
  },
  {
    type: 'farmer' as DocumentType,
    name: 'Farmer ID (AgriStack)',
    tag: 'Farmer Registry Card Layout',
    placeholder: 'Enter 11-digit Farmer ID (e.g. 4256 177 6703)',
    exampleId: '4256 177 6703',
    fee: '₹20',
    data: {
      farmerId: '4256 177 6703',
      farmerName: 'Mohan Singh',
      farmerNameRegional: 'मोहन सिंह',
      gender: 'Male / Male',
      dateOfBirth: '01/01/1981',
      caste: 'General',
      areaCategory: 'Rural',
      address: {
        guardianRelation: 'S/O',
        guardianName: 'Keshariya',
        street: 'jatav muhalla, house no.',
        village: 'Dahwa',
        district: 'Bharatpur',
        state: 'Rajasthan',
        pincode: '321201',
      },
      landRecords: [
        { khata: '10', khasra: '218', area: '0.000833' },
        { khata: '10', khasra: '235', area: '0.010833' },
        { khata: '11', khasra: '32', area: '0.022917' },
      ],
      layoutFormat: 'cr80',
    },
  },
];

export function HeroSection() {
  const router = useRouter();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeSide, setActiveSide] = useState<'flip' | 'both'>('flip');
  const [lookupValue, setLookupValue] = useState('');

  const currentDoc = SAMPLE_DOCS[selectedIdx];

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = lookupValue.trim() || currentDoc.exampleId;
    router.push(`/studio?type=${currentDoc.type}&lookup=${encodeURIComponent(query.toUpperCase())}`);
  };

  const renderCanvas = (side: 'front' | 'back') => {
    switch (currentDoc.type) {
      case 'pan':
        return <PanCardCanvas data={currentDoc.data as any} side={side} />;
      case 'aadhaar':
        return <AadhaarCardCanvas data={currentDoc.data as any} side={side} />;
      case 'voter':
        return <VoterCardCanvas data={currentDoc.data as any} side={side} />;
      case 'dl':
        return <DlCardCanvas data={currentDoc.data as any} side={side} />;
      case 'rc':
        return <RcCardCanvas data={currentDoc.data as any} side={side} />;
      case 'ration':
        return <RationCardCanvas data={currentDoc.data as any} side={side} />;
      default:
        return null;
    }
  };

  return (
    <section className="relative overflow-hidden bg-white border-b border-slate-200/90 pt-8 pb-16 lg:py-20">
      {/* Subtle Grid Canvas Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Mission, Value Proposition, Action Search */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[#1D3557] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Independent Document Layout &amp; Card Printing SaaS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] tracking-tight leading-[1.15]">
              Pixel-Perfect PVC Cards with{' '}
              <span className="text-[#8B1E2D]">Zero Missing Data</span>
            </h1>

            {/* Clear Value Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Engineered for Cyber Cafes, CSC VLEs, and Printing Shops across India. Format, verify, and print official-standard ISO 7810 ID-1 CR80 cards with live missing-field correction and 100% free lifetime re-prints.
            </p>

            {/* Document Selector Pills */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Select Card Workflow to Preview:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_DOCS.map((doc, idx) => (
                  <button
                    key={doc.type}
                    type="button"
                    onClick={() => {
                      setSelectedIdx(idx);
                      setLookupValue('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedIdx === idx
                        ? 'bg-[#1D3557] text-white border-[#1D3557] shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {doc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Lookup Action Form */}
            <form onSubmit={handleLookupSubmit} className="pt-2 max-w-xl">
              <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-300 focus-within:border-[#1D3557] focus-within:ring-2 focus-within:ring-[#1D3557]/15 transition-all shadow-xs">
                <div className="flex items-center pl-3 pr-2 text-slate-400">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={lookupValue}
                  onChange={(e) => setLookupValue(e.target.value)}
                  placeholder={currentDoc.placeholder}
                  className="flex-1 bg-transparent border-none py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Open in Studio
                </Button>
              </div>

              {/* Example Trigger */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 px-1">
                <span>
                  Example {currentDoc.name}:{' '}
                  <button
                    type="button"
                    onClick={() => setLookupValue(currentDoc.exampleId)}
                    className="font-mono font-semibold text-[#8B1E2D] hover:underline"
                  >
                    {currentDoc.exampleId}
                  </button>
                </span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Free Lifetime Re-Prints (₹0)
                </span>
              </div>
            </form>

            {/* Hardware & Trust Highlights */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>85.60 × 53.98 mm ISO CR80</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Epson &amp; Canon Tray J</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Amber Missing Field Guide</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Devanagari Unicode Fonts</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Card Canvas */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-md bg-slate-50 rounded-3xl border border-slate-200/90 p-5 shadow-card space-y-4">
              {/* Header Specification */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Live Template Canvas
                  </span>
                  <h3 className="text-sm font-bold text-[#1D3557]">{currentDoc.name}</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {currentDoc.tag}
                </span>
              </div>

              {/* Exact CR80 Canvas Wrapper */}
              <div className="flex justify-center items-center py-2 overflow-hidden">
                <Cr80CardContainer
                  front={renderCanvas('front')}
                  back={renderCanvas('back')}
                  activeSide={activeSide}
                  zoom={1.12}
                  className="transition-transform duration-300 shadow-sm"
                />
              </div>

              {/* Interactive View Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>300+ DPI Print Layout</span>
                </div>

                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveSide('flip')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                      activeSide === 'flip'
                        ? 'bg-[#1D3557] text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Interactive Flip
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSide('both')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                      activeSide === 'both'
                        ? 'bg-[#1D3557] text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dual Side View
                  </button>
                </div>
              </div>

              {/* Bottom Card CTA */}
              <div className="pt-2">
                <Link
                  href={`/services/${
                    currentDoc.type === 'pan'
                      ? 'pan-card-printing'
                      : currentDoc.type === 'aadhaar'
                      ? 'aadhaar-document-management'
                      : currentDoc.type === 'voter'
                      ? 'voter-id-printing'
                      : currentDoc.type === 'dl'
                      ? 'driving-licence-printing'
                      : currentDoc.type === 'rc'
                      ? 'vehicle-rc-printing'
                      : currentDoc.type === 'ration'
                      ? 'ration-card-printing'
                      : currentDoc.type === 'farmer'
                      ? 'farmer-id-printing'
                      : 'pan-card-printing'
                  }`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-[#8B1E2D] hover:bg-red-50 border border-red-200/60 transition-colors"
                >
                  <span>View Complete {currentDoc.name} Specifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
