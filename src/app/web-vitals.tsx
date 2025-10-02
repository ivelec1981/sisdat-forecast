'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log Web Vitals to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value, 'ms - Rating:', metric.rating);
    }

    // Send Web Vitals to analytics endpoint
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    });

    // Use sendBeacon if available, fallback to fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/vitals', body);
    } else {
      fetch('/api/vitals', {
        body,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true
      }).catch(console.error);
    }

    // Log performance warnings
    if (metric.rating === 'poor') {
      console.warn(`⚠️ Poor ${metric.name} performance:`, {
        value: metric.value,
        rating: metric.rating,
        navigationType: metric.navigationType,
      });
    }
  });

  return null;
}
