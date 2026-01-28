// Cookie consent banner component
import React, { useState, useEffect } from 'react';

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const saved = JSON.parse(consent);
      setPreferences(saved);
      applyConsent(saved);
    }
  }, []);

  const applyConsent = (prefs: typeof preferences) => {
    // Apply analytics consent
    if (prefs.analytics) {
      // Enable PostHog
      import('../lib/monitoring').then(({ setAnalyticsConsent }) => {
        setAnalyticsConsent(true);
      });
    }

    // Marketing cookies would go here
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie_consent', JSON.stringify(allAccepted));
    applyConsent(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    localStorage.setItem('cookie_consent', JSON.stringify(onlyNecessary));
    applyConsent(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie_consent', JSON.stringify(preferences));
    applyConsent(preferences);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Cookie Preferences</h3>
            <p className="mt-2 text-sm text-gray-600">
              We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts.
              {' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Learn more
              </a>
            </p>

            <div className="mt-4 space-y-3">
              {/* Necessary Cookies (Always On) */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded opacity-50 cursor-not-allowed"
                />
                <span className="ml-3 text-sm">
                  <span className="font-medium text-gray-900">Necessary</span>
                  <span className="text-gray-500"> - Required for the site to function</span>
                </span>
              </label>

              {/* Analytics Cookies */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm">
                  <span className="font-medium text-gray-900">Analytics</span>
                  <span className="text-gray-500"> - Help us improve by understanding usage</span>
                </span>
              </label>

              {/* Marketing Cookies */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm">
                  <span className="font-medium text-gray-900">Marketing</span>
                  <span className="text-gray-500"> - Personalized content and ads</span>
                </span>
              </label>
            </div>
          </div>

          <div className="mt-6 lg:mt-0 lg:ml-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRejectAll}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Reject All
            </button>
            <button
              onClick={handleSavePreferences}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              Save Preferences
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
