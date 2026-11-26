import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Check,
  CreditCard,
  Zap,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  Receipt,
  FileCheck,
  Tag,
  Percent,
  Flame,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';
import PageTracker from '@/components/analytics/PageTracker';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { getPublicServicePricingCatalog } from '@/lib/wallet/pricing';
import { FAQSection } from '@/components/public/FAQSection';
import { CTASection } from '@/components/public/CTASection';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = buildPageMetadata({
  title: 'Transparent Pay-As-You-Print Pricing | Accero PrintPortal',
  description:
    'No monthly subscriptions. Pay only per verified card lookup or manual draft. 100% free lifetime re-prints (₹0) and instant UPI wallet recharge.',
  path: '/pricing',
  keywords: [
    'document printing software pricing',
    'pvc card print cost',
    'accero printportal fees',
    'pay as you go print software',
    'cyber cafe card printing rates',
    'free card re-print portal',
    'cheapest print portal in india',
    'csc print portal recharge rates',
    'per card printing charges for vle',
    'transparent print portal pricing',
    'print portal wallet recharge',
    'fastprintportal wallet recharge',
    'digital print portal wallet recharge',
    'retailer id print portal price',
    'distributor id print portal cost',
    'cheapest csc print portal recharge',
    'wallet based print portal',
    'instant upi wallet recharge print portal',
  ],
});

const faqs = [
  {
    question: 'Are there any recurring monthly subscriptions or hidden charges?',
    answer:
      'No. Accero PrintPortal is completely subscription-free. You only recharge your prepaid wallet balance as needed starting at ₹100 and pay transparent utility rates per card generated.',
  },
  {
    question: 'What happens if a lookup fails or the document is not found?',
    answer:
      'If an external query times out or fails, zero fee is charged (₹0). Any provisional wallet deduction is rolled back atomically in milliseconds. You are never billed for incomplete operations.',
  },
  {
    question: 'Do I have to pay again when re-printing a saved card?',
    answer:
      'No! Once a document has been saved to your operator vault, you can re-print it or re-download the high-DPI vector PDF as many times as you want for free (₹0).',
  },
  {
    question: 'What is the minimum wallet recharge amount and what payment modes are supported?',
    answer:
      'You can recharge your prepaid balance starting at ₹100 using any standard UPI app (Google Pay, PhonePe, Paytm, BHIM) via instant dynamic QR code.',
  },
  {
    question: 'Can I test the editor before depositing funds into my wallet?',
    answer:
      'Yes. You can explore the split-screen studio, inspect all card templates, and test layout controls with sample data before adding funds to your wallet.',
  },
];

export default async function PricingPage() {
  const dynamicCatalog = await getPublicServicePricingCatalog();

  const manualConfig = dynamicCatalog.find((s) => s.serviceId === 'MANUAL');
  const lookupConfigs = dynamicCatalog.filter((s) => s.serviceId !== 'MANUAL');

  const minLookupFee = lookupConfigs.length > 0 ? Math.min(...lookupConfigs.map((s) => s.fee)) : 20;
  const maxLookupFee = lookupConfigs.length > 0 ? Math.max(...lookupConfigs.map((s) => s.fee)) : 30;
  const maxDiscountPercent = Math.max(...dynamicCatalog.map((s) => s.discountPercent), 0);
  const hasActiveOffers = dynamicCatalog.some((s) => s.offerActive && s.discountPercent > 0);

  const softwareSchema = generateSoftwareApplicationSchema('Accero PrintPortal Pricing');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Pricing', url: '/pricing' },
  ]);
  const faqSchema = generateFaqSchema(faqs);

  return (
    <>
      <PageTracker event={ANALYTICS_EVENTS.PRICING_VISIT} metadata={{ pagePath: '/pricing' }} />
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
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Pricing</span>
          </nav>

          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-[#1D3557] border border-slate-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#8B1E2D]" />
              <span>Zero Monthly Subscriptions • Pay Only What You Print</span>
              {hasActiveOffers && maxDiscountPercent > 0 && (
                <span className="ml-1 bg-emerald-700 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                  Up to {maxDiscountPercent}% OFF
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] tracking-tight">
              Transparent Pay-As-You-Print Pricing
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              No monthly retainers, no hidden fees, and zero renewal charges. Top up your operator balance via UPI and print official-standard CR80 PVC cards on demand.
            </p>
          </div>

          {/* Promotional Offer Banner */}
          {hasActiveOffers && (
            <div className="max-w-5xl mx-auto bg-white border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                  <Flame className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#1D3557] flex items-center gap-2">
                    <span>Special Promotional Rates Active</span>
                    <Badge variant="gold" size="sm">
                      Limited Time
                    </Badge>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Save up to {maxDiscountPercent}% on official card lookups. Lifetime re-prints remain completely ₹0.
                  </p>
                </div>
              </div>
              <Button href="/register" variant="accent" size="sm" className="shrink-0">
                Claim Offer &amp; Register
              </Button>
            </div>
          )}

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Card 1: Manual Mode */}
            <Card hoverEffect className="p-8 border border-slate-200/90 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Offline Drafting
                  </span>
                  <h2 className="text-lg font-bold text-[#1D3557] mt-1">Manual Draft Studio</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Ideal when customers provide their own application receipts or physical photos.
                  </p>
                </div>
                <div className="pt-2 pb-4 border-b border-slate-100 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-[#1D3557]">
                    ₹{manualConfig?.fee ?? 5}
                  </span>
                  {manualConfig?.originalFee && manualConfig.originalFee > (manualConfig.fee ?? 5) && (
                    <span className="text-sm line-through text-slate-400 font-semibold">
                      ₹{manualConfig.originalFee}
                    </span>
                  )}
                  <span className="text-xs text-slate-500"> / card generated</span>
                </div>
                {manualConfig?.offerActive && manualConfig.discountPercent > 0 && (
                  <Badge variant="success" size="sm">
                    {manualConfig.offerBadge || `${manualConfig.discountPercent}% OFF`}
                  </Badge>
                )}
                <ul className="space-y-3 text-xs text-slate-600 pt-1">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Full Access to All 6 CR80 Card Canvases</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Drag-and-Drop Photo &amp; Signature Upload</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% Free Lifetime Re-Prints (₹0)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>300+ DPI Vector PDF Export</span>
                  </li>
                </ul>
              </div>
              <div className="pt-8">
                <Button href="/register" variant="outline" size="md" className="w-full text-xs">
                  Start with Manual Mode
                </Button>
              </div>
            </Card>

            {/* Card 2: Most Popular */}
            <Card
              hoverEffect
              className="p-8 border-2 border-[#1D3557] shadow-card flex flex-col justify-between relative bg-white"
            >
              <span className="absolute -top-3.5 right-6 bg-[#1D3557] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                Most Popular
              </span>
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    High Volume Cyber Cafes
                  </span>
                  <h2 className="text-lg font-bold text-[#1D3557] mt-1">Alphanumeric Lookup</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Automated demographic query with silent multi-provider fallback.
                  </p>
                </div>
                <div className="pt-2 pb-4 border-b border-slate-100 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-[#8B1E2D]">
                    ₹{minLookupFee} – ₹{maxLookupFee}
                  </span>
                  <span className="text-xs text-slate-500"> / verified lookup</span>
                </div>
                {hasActiveOffers && maxDiscountPercent > 0 && (
                  <Badge variant="success" size="sm">
                    Up to {maxDiscountPercent}% OFF Active
                  </Badge>
                )}
                <ul className="space-y-3 text-xs text-slate-600 pt-1">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Auto-Fetches Official Demographic Data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Split-Screen Live Missing Field Guides</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dynamic Demographic QR Code Synthesis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Zero Fee on Failed Lookups (₹0)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% Free Lifetime Re-Prints (₹0)</span>
                  </li>
                </ul>
              </div>
              <div className="pt-8">
                <Button href="/register" variant="accent" size="md" className="w-full text-xs">
                  Create Operator Account
                </Button>
              </div>
            </Card>

            {/* Card 3: Enterprise */}
            <Card hoverEffect className="p-8 border border-slate-200/90 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    High Volume Hubs
                  </span>
                  <h2 className="text-lg font-bold text-[#1D3557] mt-1">Multi-Counter Enterprise</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    For multi-desk centers, franchise networks, and high-capacity print shops.
                  </p>
                </div>
                <div className="pt-2 pb-4 border-b border-slate-100">
                  <span className="text-4xl font-extrabold text-[#1D3557]">Custom</span>
                  <span className="text-xs text-slate-500"> / high-volume counters</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 pt-1">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dedicated High-Throughput Quotas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Multi-Operator Sub-Accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Priority WhatsApp &amp; Phone SLA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Custom Template Calibration</span>
                  </li>
                </ul>
              </div>
              <div className="pt-8">
                <Button href="/contact" variant="outline" size="md" className="w-full text-xs">
                  Contact Sales
                </Button>
              </div>
            </Card>
          </div>

          {/* Itemized Rates Table with Single Source of Truth & % OFF */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1D3557] flex items-center gap-2">
                  <span>Itemized Service Rate Card</span>
                  {hasActiveOffers && (
                    <Badge variant="success" size="sm">
                      Live Offer Rates
                    </Badge>
                  )}
                </h2>
                <p className="text-xs text-slate-500">
                  Transparent per-service fees. Debited directly from your prepaid operator balance upon successful generation.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Service Workflow</th>
                    <th className="py-3 px-4">Base MRP</th>
                    <th className="py-3 px-4">Operator Fee</th>
                    <th className="py-3 px-4">Offer / Discount</th>
                    <th className="py-3 px-4">Guarantees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {dynamicCatalog.map((item) => (
                    <tr
                      key={item.serviceId}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#1D3557]">
                        {item.displayName || `${item.serviceId} Card Print`}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {item.originalFee > item.fee ? (
                          <span className="line-through">₹{item.originalFee}</span>
                        ) : (
                          <span>₹{item.originalFee || item.fee}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#8B1E2D] text-sm">
                        ₹{item.fee}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.offerActive && item.discountPercent > 0 ? (
                          <Badge variant="success" size="sm">
                            <Tag className="w-3 h-3 text-emerald-600" />
                            {item.offerBadge || `${item.discountPercent}% OFF`}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Regular Rate</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{item.note}</td>
                    </tr>
                  ))}
                  {/* Free Re-Prints Row */}
                  <tr className="bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Subsequent Re-Prints (Saved Records)</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">₹0</td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-sm">₹0</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success" size="sm">
                        100% Free
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-800 font-medium">
                      100% Free Forever for all saved cards from your Document History
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Pricing FAQ Section */}
          <FAQSection
            faqs={faqs}
            title="Pricing & Wallet Billing FAQs"
            subtitle="Straight answers about wallet recharge, refunds, and operator billing."
          />

          {/* CTA */}
          <CTASection />
        </div>
      </div>
    </>
  );
}
