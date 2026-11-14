import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface CTASectionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  className?: string;
}

export function CTASection({
  title = 'Ready to Eliminate Ruined PVC Cards at Your Center?',
  description = 'Join thousands of Cyber Cafes, CSC VLEs, and Printing Shops across India. Start with zero subscription fees and format your first card in seconds.',
  primaryButtonText = 'Create Operator Account',
  primaryButtonHref = '/register',
  secondaryButtonText = 'Explore Features',
  secondaryButtonHref = '/features',
  className = '',
}: CTASectionProps) {
  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${className}`}>
      <div className="bg-[#1D3557] text-white rounded-3xl p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-card">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold border border-white/20">
            <Zap className="w-3.5 h-3.5 text-[#F4D35E]" />
            <span>Instant Setup • Zero Subscription Fees</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {title}
          </h2>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              href={primaryButtonHref}
              variant="accent"
              size="lg"
              className="w-full sm:w-auto"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              {primaryButtonText}
            </Button>
            <Button
              href={secondaryButtonHref}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 border-white/20 hover:border-white/30"
            >
              {secondaryButtonText}
            </Button>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Free Lifetime Re-Prints</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant Dynamic UPI Top-Up</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Epson &amp; Canon Tray J Zero Margin</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
