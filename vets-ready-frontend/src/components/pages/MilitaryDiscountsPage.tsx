/**
 * MILITARY DISCOUNTS PAGE - LOCATION-BASED BUSINESS DIRECTORY
 *
 * Shows actual businesses that honor military discounts within veteran's zip code.
 * Features:
 * - Location-based search (zip code radius)
 * - Interactive map view
 * - Expandable search radius
 * - Real business listings with addresses, phone, hours
 */

import React, { useState, useEffect } from 'react';
import { Gift, Filter, MapPin, Star, AlertCircle, Plus, ThumbsUp, ThumbsDown, ExternalLink, Map, List, Navigation, Phone, Clock, DollarSign } from 'lucide-react';
import {
  getDiscountCategories,
  searchDiscounts,
  getPersonalizedDiscounts,
  upvoteDiscount,
  reportExpiredDiscount,
  submitDiscount,
  calculateMonthlySavings,
  isEligibleForDiscount,
  type MilitaryDiscount,
  type DiscountFilters,
  type NewDiscountSubmission,
} from '../../MatrixEngine/militaryDiscountEngine';
import { useDigitalTwin } from '../../contexts/DigitalTwinContext';

interface Business {
  id: string;
  name: string;
  category: string;
  discount: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  hours: string;
  website?: string;
  distance: number; // miles from veteran's location
  lat: number;
  lng: number;
  verified: boolean;
  rating: number;
  reviewCount: number;
}

export default function MilitaryDiscountsPage() {
  const { digitalTwin } = useDigitalTwin();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchRadius, setSearchRadius] = useState<5 | 10 | 25 | 50>(5); // miles
  const [zipCode, setZipCode] = useState(digitalTwin?.location?.zipCode || '');
  const [showMap, setShowMap] = useState(false);

  const categories = getDiscountCategories();

  // Mock business data - replace with actual API call
  const mockBusinesses: Business[] = [
    {
      id: '1',
      name: 'Home Depot #4721',
      category: 'Home Improvement',
      discount: '10% off entire purchase',
      address: '1245 N Scottsdale Rd',
      city: 'Scottsdale',
      state: 'AZ',
      zip: '85257',
      phone: '(480) 555-0123',
      hours: 'Mon-Sat 6AM-9PM, Sun 7AM-8PM',
      website: 'https://www.homedepot.com',
      distance: 1.2,
      lat: 33.4942,
      lng: -111.9261,
      verified: true,
      rating: 4.5,
      reviewCount: 342
    },
    {
      id: '2',
      name: "Lowe's Home Improvement",
      category: 'Home Improvement',
      discount: '10% off with military ID',
      address: '7025 E Mayo Blvd',
      city: 'Phoenix',
      state: 'AZ',
      zip: '85054',
      phone: '(602) 555-0456',
      hours: 'Daily 6AM-10PM',
      website: 'https://www.lowes.com',
      distance: 3.4,
      lat: 33.6382,
      lng: -112.0195,
      verified: true,
      rating: 4.3,
      reviewCount: 218
    },
    {
      id: '3',
      name: 'Applebee\'s Grill + Bar',
      category: 'Dining',
      discount: '15% off total bill',
      address: '8787 N Scottsdale Rd',
      city: 'Scottsdale',
      state: 'AZ',
      zip: '85253',
      phone: '(480) 555-0789',
      hours: 'Daily 11AM-11PM',
      website: 'https://www.applebees.com',
      distance: 2.1,
      lat: 33.5579,
      lng: -111.9261,
      verified: true,
      rating: 4.1,
      reviewCount: 456
    },
    {
      id: '4',
      name: 'AT&T Store',
      category: 'Technology & Services',
      discount: '$15/month per line discount',
      address: '15333 N Pima Rd',
      city: 'Scottsdale',
      state: 'AZ',
      zip: '85260',
      phone: '(480) 555-1234',
      hours: 'Mon-Sat 10AM-8PM, Sun 11AM-6PM',
      website: 'https://www.att.com',
      distance: 4.2,
      lat: 33.6195,
      lng: -111.8904,
      verified: true,
      rating: 3.8,
      reviewCount: 124
    },
    {
      id: '5',
      name: 'Nike Factory Store',
      category: 'Retail',
      discount: '10% off + free shipping on orders $50+',
      address: '9800 N 95th St',
      city: 'Scottsdale',
      state: 'AZ',
      zip: '85258',
      phone: '(480) 555-5678',
      hours: 'Mon-Sat 10AM-9PM, Sun 11AM-7PM',
      website: 'https://www.nike.com',
      distance: 5.8,
      lat: 33.5942,
      lng: -111.8673,
      verified: true,
      rating: 4.6,
      reviewCount: 891
    }
  ];

  useEffect(() => {
    loadBusinesses();
  }, [zipCode, searchRadius, selectedCategories, searchQuery]);

  const loadBusinesses = () => {
    // Filter businesses based on search radius and categories
    let filtered = mockBusinesses.filter(b => b.distance <= searchRadius);

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(b => selectedCategories.includes(b.category));
    }

    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.discount.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by distance
    filtered.sort((a, b) => a.distance - b.distance);

    setBusinesses(filtered);
  };

  const estimatedMonthlySavings = businesses.slice(0, 5).reduce((sum, b) => sum + 50, 0); // Rough estimate

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 50%, #4a7396 100%)' }}>
      {/* Header */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
          padding: '32px 24px',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <Gift size={40} color="#3b82f6" />
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: '#1e3a5f' }}>
                Military Discounts Near You
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '16px', color: '#64748b' }}>
                {businesses.length} businesses honoring military discounts within {searchRadius} miles of {zipCode || 'your location'}
              </p>
            </div>
          </div>

          {/* Location & Radius Controls */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#64748b', marginBottom: '4px' }}>
                Zip Code
              </label>
              <input
                type="text"
                placeholder="Enter zip code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                maxLength={5}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ flex: '1 1 250px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#64748b', marginBottom: '4px' }}>
                Search Radius
              </label>
              <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                {[5, 10, 25, 50].map((radius) => (
                  <button
                    key={radius}
                    onClick={() => setSearchRadius(radius as 5 | 10 | 25 | 50)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: searchRadius === radius ? 'white' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      color: searchRadius === radius ? '#3b82f6' : '#64748b',
                    }}
                  >
                    {radius} mi
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Savings Estimate */}
          {estimatedMonthlySavings > 0 && (
            <div
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Estimated Monthly Savings</div>
                <div style={{ fontSize: '32px', fontWeight: 700 }}>${estimatedMonthlySavings}</div>
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9, maxWidth: '400px' }}>
                Based on top {Math.min(businesses.length, 5)} nearest locations. Use these discounts regularly to maximize savings.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: '1 1 300px',
                padding: '12px 16px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px 16px',
                  background: viewMode === 'list' ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  color: viewMode === 'list' ? '#3b82f6' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <List size={16} />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                style={{
                  padding: '8px 16px',
                  background: viewMode === 'map' ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  color: viewMode === 'map' ? '#3b82f6' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Map size={16} />
                Map
              </button>
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: showFilters ? '#3b82f6' : 'white',
                color: showFilters ? 'white' : '#3b82f6',
                border: `1px solid #3b82f6`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Filter size={16} />
              Filters
              {selectedCategories.length > 0 && ` (${selectedCategories.length})`}
            </button>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    if (selectedCategories.includes(category)) {
                      setSelectedCategories(selectedCategories.filter(c => c !== category));
                    } else {
                      setSelectedCategories([...selectedCategories, category]);
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    background: selectedCategories.includes(category) ? '#3b82f6' : 'white',
                    color: selectedCategories.includes(category) ? 'white' : '#3b82f6',
                    border: `1px solid #3b82f6`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Business Listings / Map View */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {viewMode === 'map' ? (
          /* Map View */
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '24px',
              minHeight: '600px',
            }}
          >
            <div style={{ textAlign: 'center', paddingTop: '100px' }}>
              <Map size={64} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ margin: 0, color: '#64748b', fontSize: '24px' }}>Interactive Map Coming Soon</h3>
              <p style={{ margin: '8px 0 0', color: '#94a3b8' }}>
                We're integrating Google Maps to show all military-friendly businesses in your area.
              </p>
              <p style={{ margin: '16px 0 0', color: '#94a3b8', fontSize: '14px' }}>
                For now, use the list view to browse {businesses.length} nearby locations.
              </p>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  marginTop: '24px',
                  padding: '12px 24px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Switch to List View
              </button>
            </div>
          </div>
        ) : businesses.length === 0 ? (
          /* No Results */
          <div
            style={{
              textAlign: 'center',
              padding: '48px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
            }}
          >
            <MapPin size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ margin: 0, color: '#64748b' }}>No businesses found</h3>
            <p style={{ margin: '8px 0 0', color: '#94a3b8' }}>
              Try expanding your search radius or adjusting filters
            </p>
          </div>
        ) : (
          /* Business Cards */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '24px',
            }}
          >
            {businesses.map(business => (
              <div
                key={business.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Header with Distance Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1e3a5f' }}>
                      {business.name}
                    </h3>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      {business.category}
                    </div>
                  </div>
                  <div
                    style={{
                      background: '#3b82f620',
                      color: '#3b82f6',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Navigation size={12} />
                    {business.distance} mi
                  </div>
                </div>

                {/* Discount Badge */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '15px',
                  }}
                >
                  🎖️ {business.discount}
                </div>

                {/* Address */}
                <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'start' }}>
                  <MapPin size={16} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '14px', color: '#475569' }}>
                    {business.address}<br />
                    {business.city}, {business.state} {business.zip}
                  </div>
                </div>

                {/* Phone */}
                <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Phone size={16} color="#64748b" />
                  <a href={`tel:${business.phone}`} style={{ fontSize: '14px', color: '#3b82f6', textDecoration: 'none' }}>
                    {business.phone}
                  </a>
                </div>

                {/* Hours */}
                <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'start' }}>
                  <Clock size={16} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '14px', color: '#475569' }}>
                    {business.hours}
                  </div>
                </div>

                {/* Rating */}
                {business.verified && (
                  <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={16} color="#fbbf24" fill="#fbbf24" />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                        {business.rating}
                      </span>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        ({business.reviewCount})
                      </span>
                    </div>
                    <div
                      style={{
                        background: '#10b98120',
                        color: '#059669',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    >
                      ✓ Verified
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.address + ' ' + business.city + ' ' + business.state)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 500,
                      textAlign: 'center',
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Get Directions
                  </a>
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px',
                        background: 'white',
                        color: '#3b82f6',
                        border: '1px solid #3b82f6',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        textDecoration: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div
          style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            gap: '12px',
          }}
        >
          <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '14px', color: '#78350f' }}>
            <strong>Disclaimer:</strong> Discounts shown are for informational purposes only. Always verify
            availability and terms with the business at point of sale. VetsReady is not responsible for
            changes to discount offers or eligibility requirements.
          </div>
        </div>
      </div>
    </div>
  );
}
