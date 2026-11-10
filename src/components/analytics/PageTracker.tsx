'use client';

import { useEffect } from 'react';
import { trackEvent, AnalyticsEventType } from '@/lib/analytics/events';

interface PageTrackerProps {
  event: AnalyticsEventType;
  metadata?: Record<string, any>;
}

export default function PageTracker({ event, metadata }: PageTrackerProps) {
  useEffect(() => {
    trackEvent(event, metadata);
  }, [event, metadata]);

  return null;
}

