'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent, trackPageView, AnalyticsEventType, SafeEventMetadata } from '@/lib/analytics/events';

interface PageTrackerProps {
  event: AnalyticsEventType;
  metadata?: SafeEventMetadata;
}

/**
 * Legacy/Explicit Page Event Tracker
 * Dispatches an event when a specific component mounts.
 */
export default function PageTracker({ event, metadata }: PageTrackerProps) {
  useEffect(() => {
    trackEvent(event, metadata);
  }, [event, metadata]);

  return null;
}

/**
 * App Router Virtual Page View Tracker
 * Observes pathname and searchParams changes across Next.js client transitions.
 * Eliminates duplicate page views via lastTrackedUrl ref.
 * Note: Must be wrapped in a <Suspense> boundary in layout.tsx.
 */
export function AppRouterPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const currentQuery = searchParams ? searchParams.toString() : '';
    const fullUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;

    // Prevent duplicate page_view dispatches for identical URLs on re-renders
    if (lastTrackedUrl.current === fullUrl) {
      return;
    }

    lastTrackedUrl.current = fullUrl;
    trackPageView(pathname, currentQuery);
  }, [pathname, searchParams]);

  return null;
}
