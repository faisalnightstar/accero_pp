import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  Award,
  Wallet,
  Users,
  FileText,
  MapPin,
  Compass,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { FAQSection } from '@/components/public/FAQSection';
import { CTASection } from '@/components/public/CTASection';

export const metadata: Metadata = buildPageMetadata({
  title: 'Farmer ID Card Printing Software for CSC Operators & Retailers | Accero',
  description:
    'Dedicated Farmer ID Card & AgriStack Farmer Registry PVC printing software for CSC VLEs and rural cyber cafes in India. Landholding records table, dynamic QR code verification, bilingual typography, and ₹0 lifetime re-prints.',
  path: '/farmer-id-printing-for-csc',
  keywords: [
    'Farmer ID Printing Software for CSC',
    'Farmer Card Printing Software for Retailers',
    'Farmer Registry Printing Portal',
    'AgriStack Farmer ID Printing',
    'Farmer ID Card Download and Print',
    'Rajasthan Farmer Registry Card Print',
    'Digital Farmer ID Card Software',
    'Farmer ID Card front and back printing',
    'kisan registry pvc card print',
    'farmer id card download to pvc',
    'pm kisan card pvc print portal',
    'kisan credit card pvc format',
    'kisan registry smart card printing',
    'किसान आईडी कार्ड प्रिंट सॉफ्टवेयर',
    'किसान रजिस्ट्री कार्ड प्रिंट',
  ],
});

const cscBenefits = [
  {
    title: 'High-Demand Rural Citizen Service',
    desc: 'With the nationwide rollout of AgriStack and state farmer registries, millions of agricultural landholders need physical PVC smart cards to present at banks, mandis, and agriculture offices. Equip your CSC center to deliver instant card printing.',
    icon: Compass,
  },
  {
    title: 'Landholding Records Table (Khata & Khasra)',
    desc: 'The reverse canvas features a structured, high-legibility land parcel table detailing Khata number, Khasra number, and land area in hectares, matching official state revenue records.',
    icon: MapPin,
  },
  {
    title: 'Authentic Dual-Emblem Design',
    desc: 'Features official-standard AgriStack header branding alongside the Lion Capital of Ashoka (*Satyameva Jayate*), high-contrast photograph framing, and 180° rotated background architecture.',
    icon: Award,
  },
  {
    title: 'Multi-Lingual Translation (12 Languages)',
    desc: 'Render farmer names, guardian relations, and residential addresses in native regional scripts (Hindi, Marathi, Bengali, Tamil, Telugu, Punjabi, Gujarati, Kannada, Odia, Malayalam, Assamese) with one-click auto-translation.',
    icon: Layers,
  },
  {
    title: '100% Free Lifetime Re-Prints (₹0)',
    desc: 'When a farmer loses their card in the field or needs an additional copy for a crop loan application, reprint it from your operator vault at zero platform cost (₹0). Keep 100% of the customer fee as center profit.',
    icon: Wallet,
  },
  {
    title: 'Zero Driver Hassles on Epson & Canon Trays',
    desc: 'Conforms to ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm) with zero margin drift. Perfectly compatible with Epson L805/L850/L8050, Canon G-series, and direct-to-card PVC printers.',
    icon: Printer,
  },
];

const faqs = [
  {
    question: 'What is a Farmer ID?',
    answer:
      'A Farmer ID is a unique digital identification number assigned to an agricultural landholder under the Government of India’s digital agriculture mission (AgriStack). It aggregates verified land parcels, crop records, and demographic details into a single interoperable digital profile.',
  },
  {
    question: 'What is AgriStack?',
    answer:
      'AgriStack is the national digital public infrastructure initiated by the Ministry of Agriculture and Farmers Welfare. It provides an interoperable foundation linking the Farmer Registry, Village Cadastral Maps, and Crop Sown Registries to streamline credit, crop insurance, and minimum support price (MSP) procurement.',
  },
  {
    question: 'What is the difference between Farmer ID and Farmer Registry ID?',
    answer:
      'A Farmer ID refers to the specific individual unique code assigned to a farmer, whereas a Farmer Registry ID represents the formal registration profile within a state or national registry that links the landholder’s Aadhaar e-KYC with verified land revenue records.',
  },
  {
    question: 'Does Accero issue official Farmer IDs or register land records?',
    answer:
      'No. Accero PrintPortal is an independent commercial document processing and printing software utility. It does not register farmers, assign Farmer IDs, or modify revenue records. It is designed solely to format authorized records onto durable PVC smart cards.',
  },
  {
    question: 'Does every Indian state use the same Farmer ID card format?',
    answer:
      'No. While AgriStack sets national digital standards, physical card templates and registry portals vary by state. Accero PrintPortal currently supports the authenticated Rajasthan Farmer Registry (RJFR) format, and will roll out additional state-specific templates as state departments release physical card specifications.',
  },
  {
    question: 'Can CSC VLEs and cyber cafe owners print Farmer ID cards using Accero?',
    answer:
      'Yes. Rural CSC VLEs, digital service centers, and printing shops use Accero PrintPortal to format and print dual-sided PVC cards for local farmers using standard tray printers in under one minute.',
  },
  {
    question: 'What is the service fee for Farmer ID Card processing?',
    answer:
      'Verified API lookup is ₹20 per card generation (discounted from ₹35 with 43% OFF). Manual entry formatting is ₹5. All subsequent re-prints from your operator vault are 100% free of charge (₹0).',
  },
  {
    question: 'What information is printed on the physical Farmer ID card?',
    answer:
      'The front side displays the AgriStack logo, department title, Ashoka Crest, farmer photo, Farmer ID, name, gender, DOB, category, Aadhaar mask, and dynamic QR verification code. The reverse side features the residential address, helpline number, and a landholding table listing Khata, Khasra, and area in hectares.',
  },
];

export default function FarmerIdPrintingForCscPage() {
  const softwareSchema = generateSoftwareApplicationSchema(
    'Farmer ID Card Printing Software for CSC Operators',
    'BusinessApplication',
    [
      'ISO/IEC 7810 ID-1 CR80 Dimensions (85.60 mm × 53.98 mm)',
      'Authentic AgriStack & Rajasthan Farmer Registry Design',
      'Detailed Landholding Records Table (Khata, Khasra, Area)',
      '12-Language Multi-Lingual Regional Translation Engine',
      'Dynamic QR Verification Code Generator',
      '100% Free Lifetime Re-Prints (₹0)',
    ]
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Farmer ID Printing for CSC', url: '/farmer-id-printing-for-csc' },
  ]);
  const faqSchema = generateFaqSchema(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/services" className="hover:text-[#1D3557] transition-colors">
              Services
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Farmer ID Printing for CSC</span>
          </nav>

          {/* Hero Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200/90 shadow-sm relative overflow-hidden text-left">
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>AgriStack &amp; State Farmer Registry Ready</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] tracking-tight leading-tight">
                Farmer ID Card Printing Software for <span className="text-[#8B1E2D]">CSC Operators</span> &amp; Retailers
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
                Format, preview, and print physical PVC Farmer ID and Farmer Registry smart cards for rural citizens. Featuring live land parcel tables (Khata &amp; Khasra), dynamic QR codes, multi-lingual translation across 12 Indian languages, and ₹0 lifetime re-prints.
              </p>

              {/* AEO / GEO Direct Operator Answer Box */}
              <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-slate-50/90 border border-slate-200/90 shadow-xs">
                <FileText className="w-6 h-6 text-[#8B1E2D] shrink-0 mt-0.5" />
                <div className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                  <span className="font-bold text-[#1D3557] block">
                    Direct Operator Answer: How does Accero format Farmer ID cards for CSC printing?
                  </span>
                  <p className="leading-relaxed">
                    CSC VLEs enter an authorized 11-digit Farmer ID or Aadhaar number into Accero PrintPortal or select blank manual entry. The platform arranges demographic records, farmer photograph, and land parcel details into an ISO/IEC 7810 ID-1 standard CR80 layout with authentic AgriStack branding, front/back background alignment, and zero margin drift for direct feeding into PVC card printer trays.
                  </p>
                  <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">AgriStack Framework Compatible</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Rajasthan Registry Supported</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">₹20 Verified / ₹5 Manual</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">₹0 Lifetime Re-Prints</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  href="/studio?type=farmer"
                  variant="primary"
                  size="lg"
                  icon={<Printer className="w-5 h-5" />}
                >
                  Open Farmer Card Studio
                </Button>
                <Button
                  href="/register"
                  variant="accent"
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                >
                  Create Free Operator Account
                </Button>
                <Button
                  href="/services/farmer-id-printing"
                  variant="outline"
                  size="lg"
                >
                  View Service Specifications
                </Button>
              </div>

              {/* Trust Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ISO ID-1 Standard (85.6mm)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>₹0 Lifetime Free Re-Prints</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Khata &amp; Khasra Land Table</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>12-Language Auto-Translate</span>
                </div>
              </div>
            </div>
          </section>

          {/* State Specific Notice Card */}
          <section className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-3 text-left">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm sm:text-base">
              <Compass className="w-5 h-5 text-amber-700 shrink-0" />
              <span>State-Specific Template Availability: Rajasthan Farmer Registry</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
              Under the national AgriStack framework, individual state governments maintain independent Farmer Registries. Accero PrintPortal currently provides the authentic <strong>Rajasthan Farmer Registry (RJFR)</strong> dual-sided template with Khata/Khasra tables and official QR verification endpoints. As other Indian states release physical smart card guidelines, dedicated templates will be added to the catalog.
            </p>
          </section>

          {/* Operator Benefits Grid */}
          <section className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
                Rural Operator Solutions
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557]">
                Why CSC VLEs Choose Accero for Farmer ID Cards
              </h2>
              <p className="text-sm text-slate-600">
                Built to solve the real operational challenges faced by rural centers printing farmer documents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cscBenefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <Card key={idx} className="p-6 space-y-3 bg-white border border-slate-200/90 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#8B1E2D]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#1D3557]">{benefit.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{benefit.desc}</p>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Step-by-Step Operator Workflow */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
                Simple 5-Step Process
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557]">
                How CSC Operators Print Farmer ID Cards
              </h2>
              <p className="text-sm text-slate-600">
                Fast customer turnaround: from farmer inquiry to printed plastic smart card in under one minute.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#1D3557] text-white flex items-center justify-center font-bold">1</div>
                <div className="font-bold text-[#1D3557]">Lookup / Input</div>
                <p className="text-slate-600">Input 11-digit Farmer ID or select blank manual entry.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#1D3557] text-white flex items-center justify-center font-bold">2</div>
                <div className="font-bold text-[#1D3557]">Verify Identity</div>
                <p className="text-slate-600">Review farmer name, DOB, photo, and address details.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#1D3557] text-white flex items-center justify-center font-bold">3</div>
                <div className="font-bold text-[#1D3557]">Verify Land Table</div>
                <p className="text-slate-600">Inspect Khata, Khasra, and land parcel area entries.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#1D3557] text-white flex items-center justify-center font-bold">4</div>
                <div className="font-bold text-[#1D3557]">Live Canvas Preview</div>
                <p className="text-slate-600">Inspect 300+ DPI front and reverse sides in the split-screen studio.</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">5</div>
                <div className="font-bold text-emerald-900">Print to Tray</div>
                <p className="text-emerald-800">1-click print directly to your Epson or Canon PVC card tray.</p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <FAQSection faqs={faqs} />

          {/* Official Compliance Notice */}
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 leading-relaxed flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Compliance &amp; Legal Notice:</strong> Accero PrintPortal is an independent commercial document processing software utility. It is not affiliated with, endorsed by, or an official portal of the Ministry of Agriculture and Farmers Welfare, AgriStack, or the Government of Rajasthan. Output cards strictly conform to the international physical card standard ISO/IEC 7810 ID-1.
            </div>
          </div>

          {/* Conversion CTA Section */}
          <CTASection
            title="Start Printing PVC Farmer ID Cards at Your Center Today"
            description="Create your operator account in 30 seconds. Zero monthly software fees, instant UPI wallet recharge, and 100% free lifetime re-prints."
          />
        </div>
      </div>
    </>
  );
}
