import React from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle,
  FileCheck,
  Printer,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Edit3,
} from 'lucide-react';

const serviceCards = [
  {
    id: 'pan',
    title: 'PAN Card',
    tag: 'NSDL / UTI Format',
    description: 'Instant PAN format with photo, signature, father name, and verifiable QR code.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    iconColor: 'from-[#8B1E2D] to-[#E63946]',
    fee: '₹20 / Print',
  },
  {
    id: 'aadhaar',
    title: 'Aadhaar PVC Card',
    tag: 'Official Standard Layout',
    description: 'Bilingual regional typography, secure QR code, and ghost image positioning.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    iconColor: 'from-amber-600 to-amber-700',
    fee: '₹20 / Print',
  },
  {
    id: 'voter',
    title: 'Voter ID (EPIC)',
    tag: 'ECI Modern Standard',
    description: 'High-resolution EPIC card format with assembly, district, and barcode/QR block.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    iconColor: 'from-[#1D3557] to-[#457B9D]',
    fee: '₹20 / Print',
  },
  {
    id: 'dl',
    title: 'Driving License (DL)',
    tag: 'Smart Card Chip Layout',
    description: 'Full transport department specification including vehicle class badges and authorization dates.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    iconColor: 'from-indigo-600 to-indigo-700',
    fee: '₹30 / Print',
  },
  {
    id: 'rc',
    title: 'Vehicle RC',
    tag: 'Vahan Standard Layout',
    description: 'Vehicle registration smart card template with chassis, engine, and owner details.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    iconColor: 'from-purple-600 to-purple-700',
    fee: '₹30 / Print',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#F0F4F8] pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#8B1E2D] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Next-Gen Document Print & Verification Studio</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1D3557] tracking-tight leading-tight">
              Pixel-Perfect PVC Cards with{' '}
              <span className="bg-gradient-to-r from-[#8B1E2D] via-[#E63946] to-[#457B9D] bg-clip-text text-transparent">
                Zero Missing Data
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed">
              Format and print official ISO 7810 ID-1 standard PVC cards for PAN, Aadhaar, Voter, Driving License, and Vehicle RC. Our real-time split-screen studio flags missing API fields so you can update and verify them live before printing.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-[#8B1E2D] to-[#E63946] rounded-xl shadow-lg hover:shadow-btn-hover transition-all transform hover:-translate-y-0.5"
              >
                <span>Start Printing Cards</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-medium text-[#1D3557] bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                <span>See Split-Screen Studio</span>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>85.6mm × 53.98mm ISO CR80</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Live Missing Field Detection</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant High-DPI PDF & Print</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>API Lookup & Manual Modes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-[#1D3557]">Preformatted Card Formats</h2>
          <p className="mt-2 text-slate-600 text-sm">
            Select a document type to open the split-screen print studio or initiate an instant card number lookup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.iconColor} text-white flex items-center justify-center shadow-md`}
                  >
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${card.badgeColor}`}
                  >
                    {card.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#1D3557] group-hover:text-[#8B1E2D] transition-colors">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.fee}
                </span>
                <Link
                  href={`/login?redirect=/studio/${card.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8B1E2D] hover:text-[#E63946] group-hover:translate-x-1 transition-all"
                >
                  <span>Open Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}

          {/* Quick Info Box */}
          <div className="bg-gradient-to-br from-[#1D3557] to-[#14233c] text-white rounded-2xl p-6 shadow-card flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Printer className="w-6 h-6 text-[#F4D35E]" />
              </div>
              <h3 className="text-xl font-bold">Compatible With All PVC Tray Printers</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Directly optimized for Evolis, Zebra, Fargo, Epson, and Canon PVC card trays. Zero margin clipping or scaling distortion.
              </p>
            </div>
            <div className="pt-6 border-t border-white/10">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#F4D35E] hover:text-white transition-colors"
              >
                <span>Create Operator Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-card">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-[#1D3557]">How Split-Screen Studio Works</h2>
            <p className="mt-2 text-slate-600 text-sm">
              Stop throwing away blank cards due to missing API data. Follow 3 simple steps:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-[#8B1E2D] font-bold flex items-center justify-center text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-[#1D3557]">Enter ID Number or Manual Data</h3>
              <p className="text-sm text-slate-600">
                Provide the card number to auto-fetch demographic data via external APIs, or switch to manual entry mode.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-[#1D3557]">Edit Missing Fields Live</h3>
              <p className="text-sm text-slate-600">
                Any field missing from the API response is flagged with amber guides. Update text or upload photos, and watch the card canvas synchronize in real time.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#457B9D] font-bold flex items-center justify-center text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-[#1D3557]">Print or Download PDF</h3>
              <p className="text-sm text-slate-600">
                Once satisfied, execute direct browser print with exact millimeter margins or download a print-ready vector PDF.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
