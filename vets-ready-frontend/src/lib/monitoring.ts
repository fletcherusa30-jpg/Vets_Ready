"""Monitoring and analytics configuration"""
import * as Sentry from "@sentry/react";
import posthog from 'posthog-js';

// Sentry Error Tracking
export const initSentry = () => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ["localhost", /^https:\/\/.*\.vetsready\.com/],
        }),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        // Filter sensitive data
        if (event.request) {
          // Remove authorization headers
          if (event.request.headers) {
            delete event.request.headers['Authorization'];
            delete event.request.headers['Cookie'];
          }

          // Remove sensitive form data
          if (event.request.data) {
            const sensitiveFields = ['password', 'token', 'ssn', 'dd214'];
            sensitiveFields.forEach(field => {
              if (event.request.data[field]) {
                event.request.data[field] = '[Filtered]';
              }
            });
          }
        }

        return event;
      },
    });
  }
};

// PostHog Analytics (Privacy-Focused)
export const initPostHog = () => {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
      // GDPR compliance - opt out by default, user must opt in
      opt_out_capturing_by_default: true,
      // Privacy settings
      mask_all_text: false,
      mask_all_element_attributes: false,
      // Disable session recording by default
      disable_session_recording: true,
      // Respect Do Not Track
      respect_dnt: true,
      // Advanced privacy
      persistence: 'localStorage',
      autocapture: {
        dom_event_allowlist: ['click', 'submit'], // Only track clicks and form submits
        url_allowlist: [/^https:\/\/.*\.vetsready\.com/],
      },
      sanitize_properties: (properties) => {
        // Remove PII
        const piiFields = ['email', 'phone', 'ssn', 'name', 'address'];
        piiFields.forEach(field => {
          if (properties[field]) {
            delete properties[field];
          }
        });
        return properties;
      },
    });
  }
};

// User Consent Management
export const setAnalyticsConsent = (consent: boolean) => {
  if (consent) {
    posthog.opt_in_capturing();
    localStorage.setItem('analytics_consent', 'true');
  } else {
    posthog.opt_out_capturing();
    localStorage.setItem('analytics_consent', 'false');
  }
};

export const hasAnalyticsConsent = (): boolean => {
  return localStorage.getItem('analytics_consent') === 'true';
};

// Track custom events (privacy-safe)
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (hasAnalyticsConsent()) {
    posthog.capture(eventName, properties);
  }
};

// Identify user (for authenticated users only, no PII)
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (hasAnalyticsConsent()) {
    // Never send PII - only tier, account type, etc.
    const safeTra its = traits ? {
      tier: traits.tier,
      user_type: traits.user_type,
      created_at: traits.created_at,
      // No email, name, phone, etc.
    } : {};

    posthog.identify(userId, safeTraits);
  }
};

// Performance monitoring
export const trackPerformance = () => {
  if (hasAnalyticsConsent() && 'PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          trackEvent('page_performance', {
            page: window.location.pathname,
            load_time: navEntry.loadEventEnd - navEntry.fetchStart,
            dom_content_loaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
            first_paint: navEntry.responseStart - navEntry.fetchStart,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });
  }
};

// Error tracking
export const trackError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  });
};

// Page view tracking
export const trackPageView = (path: string) => {
  if (hasAnalyticsConsent()) {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      path: path,
    });
  }
};
