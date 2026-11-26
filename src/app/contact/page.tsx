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
  Sparkles,
  PhoneCall,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import ContactForm from '@/components/contact/ContactForm';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Support & Enterprise Inquiries | Accero PrintPortal',
  description:
    'Need help with PVC card printer trays, wallet recharge, or high-volume enterprise API accounts? Reach out to the Accero PrintPortal support team.',
  path: '/contact',
  keywords: [
    'Indi Print Portal',
    'Contact Indi Print Portal',
    'CSC Print Portal',
    'print portal helpline',
    'print portal customer care number',
    'print portal whatsapp support',
    'vle technical support',
    'digital service portal helpdesk',
    'fast print portal contact',
    'pvc card printing support',
    'cyber cafe operator helpline',
    'aadhar print portal support',
    'pan card print support',
    '24x7 print portal support',
    'accero printportal contact',
    'printportal customer support',
    'csc operator helpdesk',
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

      <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Contact Support</span>
          </nav>

          {/* Hero Header */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#1D3557] border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-[#8B1E2D]" />
              <span>Operator Desk &amp; Technical Help</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] tracking-tight">
              Get in Touch with Accero Support
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Have questions about PVC card printer alignment, wallet recharge, or enterprise multi-counter quotas? Our technical team is here to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Contact Details */}
            <div className="md:col-span-5 space-y-6">
              <Card className="p-6 border border-slate-200/90 shadow-sm space-y-6">
                <h2 className="text-base font-bold text-[#1D3557]">Support Channels</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-[#8B1E2D] border border-slate-200 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Support</span>
                      <p className="text-sm font-semibold text-[#1D3557]">support@accero.app</p>
                      <span className="text-[11px] text-slate-500">Response within 4-8 business hours</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-emerald-700 border border-slate-200 shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operator Desk</span>
                      <p className="text-sm font-semibold text-[#1D3557]">Online Operator Helpdesk</p>
                      <span className="text-[11px] text-slate-500">Available 9:00 AM – 7:00 PM IST (Mon-Sat)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-[#457B9D] border border-slate-200 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Hours</span>
                      <p className="text-sm font-semibold text-[#1D3557]">Monday to Saturday</p>
                      <span className="text-[11px] text-slate-500">Indian Standard Time (IST)</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Fast Answers Card */}
              <div className="bg-[#1D3557] text-white p-6 rounded-2xl shadow-sm space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#F4D35E]" />
                  <span>Looking for Fast Answers?</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Browse our comprehensive Operator FAQ covering tray setup, wallet billing, and card formatting.
                </p>
                <div className="pt-1">
                  <Button
                    href="/faq"
                    variant="outline"
                    size="sm"
                    className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                    iconPosition="right"
                  >
                    Visit Operator FAQ
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Form Container */}
            <div className="md:col-span-7 bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#1D3557]">Send Us a Direct Message</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Fill in your details below and an operator specialist will review your inquiry.
                </p>
              </div>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
