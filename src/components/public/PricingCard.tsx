import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface PricingCardProps {
  title: string;
  tagline: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  popular?: boolean;
  badge?: string;
  footnote?: string;
  className?: string;
}

export function PricingCard({
  title,
  tagline,
  price,
  period,
  description,
  features,
  ctaText,
  ctaHref,
  popular = false,
  badge,
  footnote,
  className = '',
}: PricingCardProps) {
  return (
    <Card
      hoverEffect
      className={`relative p-8 flex flex-col justify-between ${
        popular
          ? 'border-2 border-[#1D3557] shadow-card bg-white'
          : 'border border-slate-200/90 bg-white'
      } ${className}`}
    >
      {badge && (
        <span className="absolute -top-3.5 right-6 bg-[#1D3557] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
          {badge}
        </span>
      )}

      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {tagline}
          </span>
          <h3 className="text-xl font-bold text-[#1D3557] mt-1">{title}</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{description}</p>
        </div>

        <div className="pt-2 pb-4 border-b border-slate-100">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold text-[#1D3557]">{price}</span>
            <span className="text-xs font-medium text-slate-500">{period}</span>
          </div>
          {footnote && <p className="text-[11px] text-emerald-700 font-medium mt-1">{footnote}</p>}
        </div>

        <ul className="space-y-3 text-xs text-slate-600">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-8 mt-auto">
        <Button
          href={ctaHref}
          variant={popular ? 'primary' : 'outline'}
          size="md"
          className="w-full"
          icon={<ArrowRight className="w-3.5 h-3.5" />}
          iconPosition="right"
        >
          {ctaText}
        </Button>
      </div>
    </Card>
  );
}

export default PricingCard;
