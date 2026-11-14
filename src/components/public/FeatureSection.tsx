import React from 'react';
import Link from 'next/link';
import {
  Search,
  Edit3,
  Globe,
  Printer,
  ShieldCheck,
  Wallet,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function FeatureSection() {
  const features = [
    {
      title: 'Split-Screen Live Studio',
      description:
        'Interactive side-by-side editor with real-time missing field detection. When an external API returns partial data, missing fathers names or addresses are flagged with amber guides.',
      icon: Edit3,
      tag: 'Core Innovation',
      href: '/features/document-editing',
      color: 'text-[#8B1E2D]',
    },
    {
      title: 'CR80 Physical Print Engine',
      description:
        'Conforms strictly to ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm). Zero-margin CSS print coordinates formatted directly for Epson and Canon card trays.',
      icon: Printer,
      tag: 'Hardware Precision',
      href: '/features/document-printing',
      color: 'text-indigo-600',
    },
    {
      title: 'Alphanumeric Lookup Cascade',
      description:
        'Instant number verification across PAN, Aadhaar, Voter, DL, RC, and Ration records with automated multi-provider fallback and zero charge on failed queries.',
      icon: Search,
      tag: 'Speed & Resilience',
      href: '/features/document-lookup',
      color: 'text-emerald-600',
    },
    {
      title: 'Bilingual Regional Typography',
      description:
        'High-resolution Unicode regional language rendering (Devanagari, Hindi, Marathi) using Google Fonts Hind to eliminate clipped conjuncts and broken vowels.',
      icon: Globe,
      tag: 'Regional Language',
      href: '/features/multilingual-printing',
      color: 'text-blue-600',
    },
    {
      title: 'Encrypted Document Vault',
      description:
        'Save drafted records to your operator account for lifetime access. Citizen cards can be re-printed and re-downloaded anytime with 100% free re-prints (₹0).',
      icon: ShieldCheck,
      tag: '100% Free Re-Prints',
      href: '/features/document-management',
      color: 'text-purple-600',
    },
    {
      title: 'Transparent Prepaid Ledger',
      description:
        'Zero monthly subscriptions or hidden renewal costs. Recharge starting at ₹100 using dynamic UPI QR codes with instant automated rollback on query timeouts.',
      icon: Wallet,
      tag: 'Utility Billing',
      href: '/features/wallet-management',
      color: 'text-amber-600',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
          Built for Operators
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] tracking-tight">
          Eliminate Ruined PVC Cards &amp; Misaligned Trays
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          High morning footfalls leave no room for blank card waste or crashes. Accero delivers rock-solid reliability for Indian document centers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.href}
              hoverEffect
              className="p-6 flex flex-col justify-between border border-slate-200/90 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:bg-white group-hover:border-slate-300 transition-colors">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {item.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#1D3557] group-hover:text-[#8B1E2D] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D3557] group-hover:text-[#8B1E2D] transition-colors"
                >
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export default FeatureSection;
