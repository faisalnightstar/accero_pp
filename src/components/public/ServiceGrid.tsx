'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import ServiceCard, { ServiceCardData } from './ServiceCard';

export interface ServiceGridProps {
  services: ServiceCardData[];
  showFilter?: boolean;
  className?: string;
}

export function ServiceGrid({
  services,
  showFilter = true,
  className = '',
}: ServiceGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tag.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedCategory === 'all') return matchesSearch;
      if (selectedCategory === 'identity') {
        return (
          matchesSearch &&
          ['pan', 'aadhaar', 'voter'].includes(service.id.toLowerCase())
        );
      }
      if (selectedCategory === 'transport') {
        return (
          matchesSearch &&
          ['dl', 'rc'].includes(service.id.toLowerCase())
        );
      }
      if (selectedCategory === 'civic') {
        return (
          matchesSearch &&
          ['ration', 'farmer'].includes(service.id.toLowerCase())
        );
      }
      return matchesSearch;
    });
  }, [services, searchQuery, selectedCategory]);

  return (
    <div className={`space-y-6 ${className}`}>
      {showFilter && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-white text-[#1D3557] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Services ({services.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('identity')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedCategory === 'identity'
                  ? 'bg-white text-[#1D3557] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Identity Cards
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('transport')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedCategory === 'transport'
                  ? 'bg-white text-[#1D3557] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transport &amp; RTO
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('civic')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedCategory === 'civic'
                  ? 'bg-white text-[#1D3557] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Civic &amp; Food
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search card formats..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1D3557] focus:ring-1 focus:ring-[#1D3557]"
            />
          </div>
        </div>
      )}

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id || service.slug} service={service} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <p className="text-sm font-semibold text-slate-700">No document services found</p>
          <p className="text-xs text-slate-500">Try adjusting your search query or category filter.</p>
        </div>
      )}
    </div>
  );
}

export default ServiceGrid;
