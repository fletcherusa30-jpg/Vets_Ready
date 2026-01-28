/**
 * PARTNER ONBOARDING FORM
 *
 * Self-service partner registration and onboarding workflow
 * Military-themed professional design
 */

import React, { useState } from 'react';
import './PartnerOnboarding.css';

interface PartnerFormData {
  // Organization Info
  organization_name: string;
  organization_type: string;
  website: string;
  tax_id: string;

  // Contact Info
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;

  // Address
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;

  // Partnership Details
  partnership_type: string;
  referral_commission: number;
  services_offered: string[];
  target_audience: string;
  expected_volume: string;

  // Legal
  accepts_terms: boolean;
  accepts_privacy: boolean;
}

const PartnerOnboarding: React.FC = () => {
  const [formData, setFormData] = useState<PartnerFormData>({
    organization_name: '',
    organization_type: '',
    website: '',
    tax_id: '',
    primary_contact_name: '',
    primary_contact_email: '',
    primary_contact_phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    partnership_type: '',
    referral_commission: 20,
    services_offered: [],
    target_audience: '',
    expected_volume: '',
    accepts_terms: false,
    accepts_privacy: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const organizationTypes = [
    'VSO (Veterans Service Organization)',
    'Law Firm',
    'Healthcare Provider',
    'Mental Health Provider',
    'Educational Institution',
    'Employment Agency',
    'Housing Provider',
    'Other'
  ];

  const partnershipTypes = [
    'Referral Partner',
    'Technology Integration',
    'Service Provider',
    'Content Partner',
    'Reseller'
  ];

  const servicesOptions = [
    'Claims Assistance',
    'Legal Services',
    'Healthcare',
    'Mental Health',
    'Education/Training',
    'Employment',
    'Housing',
    'Financial Planning',
    'Other'
  ];

  const handleInputChange = (field: keyof PartnerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services_offered: prev.services_offered.includes(service)
        ? prev.services_offered.filter(s => s !== service)
        : [...prev.services_offered, service]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.organization_name || !formData.organization_type) {
          setError('Please fill in all organization details');
          return false;
        }
        break;
      case 2:
        if (!formData.primary_contact_name || !formData.primary_contact_email) {
          setError('Please fill in all contact details');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.primary_contact_email)) {
          setError('Please enter a valid email address');
          return false;
        }
        break;
      case 3:
        if (!formData.partnership_type || formData.services_offered.length === 0) {
          setError('Please select partnership type and at least one service');
          return false;
        }
        break;
      case 4:
        if (!formData.accepts_terms || !formData.accepts_privacy) {
          setError('Please accept all terms and conditions');
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      setError(null);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(4)) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/partners/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.detail || 'Submission failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="partner-onboarding">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h1>Application Submitted Successfully!</h1>
          <p>Thank you for your interest in partnering with VetsReady.</p>
          <p>Our team will review your application and contact you within 2-3 business days.</p>
          <div className="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>📧 Check your email for confirmation</li>
              <li>📞 Our team will schedule a call to discuss partnership details</li>
              <li>📝 You'll receive onboarding materials and API access</li>
              <li>🚀 Start referring veterans and earning commissions!</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="partner-onboarding">
      <div className="onboarding-header">
        <h1>🤝 Partner Onboarding</h1>
        <p>Join VetsReady's network of trusted partners serving veterans</p>
      </div>

      {/* Progress Indicator */}
      <div className="progress-steps">
        <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Organization</div>
        </div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Contact</div>
        </div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Partnership</div>
        </div>
        <div className={`step ${currentStep >= 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Review</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="onboarding-form">
        {/* Step 1: Organization Details */}
        {currentStep === 1 && (
          <div className="form-step">
            <h2>Organization Details</h2>

            <div className="form-group">
              <label>Organization Name *</label>
              <input
                type="text"
                value={formData.organization_name}
                onChange={(e) => handleInputChange('organization_name', e.target.value)}
                placeholder="Enter organization name"
              />
            </div>

            <div className="form-group">
              <label>Organization Type *</label>
              <select
                value={formData.organization_type}
                onChange={(e) => handleInputChange('organization_type', e.target.value)}
              >
                <option value="">Select type...</option>
                {organizationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-group">
              <label>Tax ID / EIN</label>
              <input
                type="text"
                value={formData.tax_id}
                onChange={(e) => handleInputChange('tax_id', e.target.value)}
                placeholder="XX-XXXXXXX"
              />
            </div>
          </div>
        )}

        {/* Step 2: Contact Information */}
        {currentStep === 2 && (
          <div className="form-step">
            <h2>Contact Information</h2>

            <div className="form-group">
              <label>Primary Contact Name *</label>
              <input
                type="text"
                value={formData.primary_contact_name}
                onChange={(e) => handleInputChange('primary_contact_name', e.target.value)}
                placeholder="Full name"
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                value={formData.primary_contact_email}
                onChange={(e) => handleInputChange('primary_contact_email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.primary_contact_phone}
                onChange={(e) => handleInputChange('primary_contact_phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label>Address Line 1</label>
              <input
                type="text"
                value={formData.address_line1}
                onChange={(e) => handleInputChange('address_line1', e.target.value)}
                placeholder="Street address"
              />
            </div>

            <div className="form-group">
              <label>Address Line 2</label>
              <input
                type="text"
                value={formData.address_line2}
                onChange={(e) => handleInputChange('address_line2', e.target.value)}
                placeholder="Suite, unit, etc."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  maxLength={2}
                  placeholder="CA"
                />
              </div>
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  maxLength={10}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Partnership Details */}
        {currentStep === 3 && (
          <div className="form-step">
            <h2>Partnership Details</h2>

            <div className="form-group">
              <label>Partnership Type *</label>
              <select
                value={formData.partnership_type}
                onChange={(e) => handleInputChange('partnership_type', e.target.value)}
              >
                <option value="">Select type...</option>
                {partnershipTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Services Offered * (select all that apply)</label>
              <div className="checkbox-group">
                {servicesOptions.map(service => (
                  <label key={service} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.services_offered.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                    />
                    {service}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Target Audience</label>
              <textarea
                value={formData.target_audience}
                onChange={(e) => handleInputChange('target_audience', e.target.value)}
                placeholder="Describe your typical clients..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Expected Monthly Volume</label>
              <select
                value={formData.expected_volume}
                onChange={(e) => handleInputChange('expected_volume', e.target.value)}
              >
                <option value="">Select range...</option>
                <option value="1-10">1-10 referrals</option>
                <option value="11-50">11-50 referrals</option>
                <option value="51-100">51-100 referrals</option>
                <option value="100+">100+ referrals</option>
              </select>
            </div>

            <div className="form-group">
              <label>Referral Commission Rate</label>
              <div className="commission-slider">
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="5"
                  value={formData.referral_commission}
                  onChange={(e) => handleInputChange('referral_commission', parseInt(e.target.value))}
                />
                <span className="commission-value">{formData.referral_commission}%</span>
              </div>
              <p className="helper-text">Standard rates: 15-25% based on volume</p>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="form-step">
            <h2>Review & Submit</h2>

            <div className="review-section">
              <h3>Organization</h3>
              <p><strong>{formData.organization_name}</strong></p>
              <p>{formData.organization_type}</p>
              <p>{formData.website}</p>
            </div>

            <div className="review-section">
              <h3>Contact</h3>
              <p>{formData.primary_contact_name}</p>
              <p>{formData.primary_contact_email}</p>
              <p>{formData.primary_contact_phone}</p>
            </div>

            <div className="review-section">
              <h3>Partnership</h3>
              <p><strong>Type:</strong> {formData.partnership_type}</p>
              <p><strong>Services:</strong> {formData.services_offered.join(', ')}</p>
              <p><strong>Commission:</strong> {formData.referral_commission}%</p>
            </div>

            <div className="legal-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.accepts_terms}
                  onChange={(e) => handleInputChange('accepts_terms', e.target.checked)}
                />
                I accept the Terms and Conditions *
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.accepts_privacy}
                  onChange={(e) => handleInputChange('accepts_privacy', e.target.checked)}
                />
                I accept the Privacy Policy *
              </label>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="btn-secondary">
              ← Previous
            </button>
          )}

          {currentStep < 4 ? (
            <button type="button" onClick={nextStep} className="btn-primary">
              Next →
            </button>
          ) : (
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Submitting...' : '✓ Submit Application'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PartnerOnboarding;
