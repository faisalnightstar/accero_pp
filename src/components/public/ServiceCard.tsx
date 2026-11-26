import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, CreditCard, ShieldCheck, Car, UtensilsCrossed, Printer } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface ServiceCardData {
  id: string;
  serviceKey: string;
  slug: string;
  title: string;
  tag: string;
  description: string;
  badgeVariant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'gold';
  features?: string[];
  fee?: number;
  originalFee?: number;
  discountPercent?: number;
  offerBadge?: string;
  docType?: string;
}

export interface ServiceCardProps {
  service: ServiceCardData;
  className?: string;
}

export function ServiceCard({ service, className = '' }: ServiceCardProps) {
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pan':
        return <CreditCard className="w-5 h-5 text-[#8B1E2D]" />;
      case 'aadhaar':
        return <ShieldCheck className="w-5 h-5 text-amber-600" />;
      case 'voter':
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
      case 'dl':
        return <CreditCard className="w-5 h-5 text-indigo-600" />;
      case 'rc':
        return <Car className="w-5 h-5 text-purple-600" />;
      case 'ration':
        return <UtensilsCrossed className="w-5 h-5 text-teal-600" />;
      default:
        return <Printer className="w-5 h-5 text-[#1D3557]" />;
    }
  };

  const fee = service.fee ?? 20;
  const originalFee = service.originalFee ?? fee;
  const discountPercent = service.discountPercent ?? 0;

  return (
    <Card
      hoverEffect
      className={`p-6 flex flex-col justify-between group border border-slate-200/90 ${className}`}
    >
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:bg-white group-hover:border-slate-300 transition-colors">
            {getIcon(service.id || service.serviceKey)}
          </div>
          <Badge variant="default" size="sm">
            {service.tag}
          </Badge>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-lg font-bold text-[#1D3557] group-hover:text-[#8B1E2D] transition-colors">
            {service.title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Key Features if provided */}
        {service.features && service.features.length > 0 && (
          <ul className="space-y-1.5 pt-1">
            {service.features.slice(0, 3).map((feat, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{feat}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pricing & Actions */}
      <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold text-[#1D3557]">₹{fee}</span>
            <span className="text-[11px] text-slate-500">/ lookup</span>
            {originalFee > fee && (
              <span className="text-[11px] line-through text-slate-600 font-medium">₹{originalFee}</span>
            )}
          </div>
          {discountPercent > 0 && (
            <Badge variant="success" size="sm">
              {service.offerBadge || `${discountPercent}% OFF`}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            href={`/services/${service.slug}`}
            variant="outline"
            size="sm"
            className="w-full text-[11px]"
          >
            Details
          </Button>
          <Button
            href={`/studio?type=${service.docType || service.id.toLowerCase()}`}
            variant="primary"
            size="sm"
            className="w-full text-[11px]"
            icon={<ArrowRight className="w-3 h-3" />}
            iconPosition="right"
          >
            Format
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ServiceCard;
