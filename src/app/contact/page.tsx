import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Mail,
  MessageSquare,
  HelpCircle,
  Building2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import ContactForm from '@/components/contact/ContactForm';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Support & Enterprise Inquiries | Accero PrintPortal',
  description:
    'Need help with PVC card printer trays, wallet recharge, or high-volume enterprise API accounts? Reach out to the Accero PrintPortal support team.',
  path: '/contact',
  keywords: [
    'accero printportal contact',
    'printportal customer support',
    'cyber cafe software support',
    'csc operator helpdesk',
    'enterprise print portal inquiry',
  ],
});

export default function ContactPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Contact</span>
          </nav>

          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight">
              Get in Touch with Accero Support
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Have questions about PVC card printer alignment, wallet recharge, or enterprise multi-counter quotas? Our team is here to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Contact Details */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-[#1D3557]">Support Channels</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-red-50 text-[#8B1E2D] border border-red-100 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">Email Support</span>
                      <p className="text-sm font-semibold text-[#1D3557]">support@accero.app</p>
                      <span className="text-[11px] text-slate-500">Response within 4-8 business hours</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">Operator Assistance</span>
                      <p className="text-sm font-semibold text-[#1D3557]">Online Operator Helpdesk</p>
                      <span className="text-[11px] text-slate-500">Available 9:00 AM – 7:00 PM IST (Mon-Sat)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">Business Hours</span>
                      <p className="text-sm font-semibold text-[#1D3557]">Monday to Saturday</p>
                      <span className="text-[11px] text-slate-500">Indian Standard Time (IST)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Self-Help */}
              <div className="bg-[#1D3557] text-white p-6 rounded-3xl shadow-sm space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#F4D35E]" />
                  <span>Looking for Fast Answers?</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Browse our comprehensive Operator FAQ covering tray setup, wallet billing, and card formatting.
                </p>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F4D35E] hover:underline pt-1"
                >
                  <span>Visit Operator FAQ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-[#1D3557]">Send Us a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
