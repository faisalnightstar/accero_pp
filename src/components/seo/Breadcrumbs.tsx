import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbCrumb {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbCrumb[];
  className?: string;
}

/**
 * Accessible Semantic Breadcrumb Navigation Component
 * Conforms to Google Search Central Search Appearance & W3C Breadcrumb Pattern.
 */
export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`py-2 px-1 text-xs text-slate-500 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5" itemScope itemType="https://schema.org/BreadcrumbList">
        {/* Home Root */}
        <li
          className="flex items-center gap-1.5"
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link
            href="/"
            className="flex items-center gap-1 text-slate-600 hover:text-[#8B1E2D] transition-colors"
            itemProp="item"
          >
            <Home className="w-3.5 h-3.5" />
            <span itemProp="name">Home</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        {/* Trail Items */}
        {items.map((crumb, idx) => {
          const isLast = idx === items.length - 1;
          const position = idx + 2;

          return (
            <li
              key={crumb.url}
              className="flex items-center gap-1.5"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
              {isLast ? (
                <span className="font-semibold text-slate-800 line-clamp-1" itemProp="name" aria-current="page">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.url}
                  className="text-slate-600 hover:text-[#8B1E2D] transition-colors line-clamp-1"
                  itemProp="item"
                >
                  <span itemProp="name">{crumb.name}</span>
                </Link>
              )}
              <meta itemProp="position" content={String(position)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

