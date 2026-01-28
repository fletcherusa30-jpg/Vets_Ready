import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import {
  getAllBenefitsEligibility,
  getTotalMonthlyBenefits
} from '../utils/benefitsEligibility';

// State benefits data structure
interface StateBenefit {
  name: string;
  description: string;
  annualValue: number;
  monthlyValue: number;
  eligible: boolean;
  category: 'tax' | 'recreation' | 'education' | 'vehicle' | 'employment' | 'healthcare';
  applicationUrl?: string;
}

interface StateData {
  stateName: string;
  stateCode: string;
  benefits: StateBenefit[];
  hasIncomeTax: boolean;
  incomeTaxSavings?: number;
}

// Military discount categories
interface MilitaryDiscount {
  category: string;
  businesses: string[];
  estimatedMonthlySavings: number;
}

export const MyTotalBenefitsCenter: React.FC = () => {
  const { profile, isProfileComplete } = useVeteranProfile();
  const [activeTab, setActiveTab] = useState<'federal' | 'state' | 'discounts'>('federal');
  const [selectedState, setSelectedState] = useState(profile.state || 'VA');

  // State benefits database (top 10 veteran-friendly states)
  const stateDatabase: Record<string, StateData> = {
    'FL': {
      stateName: 'Florida',
      stateCode: 'FL',
      hasIncomeTax: false,
      incomeTaxSavings: 0,
      benefits: [
        {
          name: '100% Disabled Property Tax Exemption',
          description: 'Complete property tax exemption for 100% P&T disabled veterans',
          annualValue: 4500,
          monthlyValue: 375,
          eligible: profile.vaDisabilityRating === 100,
          category: 'tax',
          applicationUrl: 'https://floridarevenue.com/property/Pages/Exemptions.aspx'
        },
        {
          name: 'Homestead Exemption for Veterans',
          description: 'Additional homestead exemption for disabled veterans (10% or higher rating)',
          annualValue: 2000,
          monthlyValue: 167,
          eligible: profile.vaDisabilityRating >= 10,
          category: 'tax'
        },
        {
          name: 'State Parks Annual Pass',
          description: 'Free annual entrance pass to all Florida state parks',
          annualValue: 60,
          monthlyValue: 5,
          eligible: true,
          category: 'recreation'
        },
        {
          name: 'Hunting & Fishing License Waiver',
          description: 'Free hunting and freshwater fishing licenses for Florida resident disabled veterans',
          annualValue: 150,
          monthlyValue: 13,
          eligible: profile.vaDisabilityRating >= 10,
          category: 'recreation'
        },
        {
          name: 'Vehicle Registration Discount',
          description: 'Reduced vehicle registration fees for disabled veterans',
          annualValue: 50,
          monthlyValue: 4,
          eligible: profile.vaDisabilityRating >= 10,
          category: 'vehicle'
        },
        {
          name: 'No State Income Tax',
          description: 'Florida has no state income tax - major savings for all residents',
          annualValue: 0,
          monthlyValue: 0,
          eligible: true,
          category: 'tax'
        }
      ]
    },
    'TX': {
      stateName: 'Texas',
      stateCode: 'TX',
      hasIncomeTax: false,
      incomeTaxSavings: 0,
      benefits: [
        {
          name: '100% Disabled Property Tax Exemption',
          description: 'Complete property tax exemption for 100% service-connected disabled veterans',
          annualValue: 3800,
          monthlyValue: 317,
          eligible: profile.vaDisabilityRating === 100,
          category: 'tax'
        },
        {
          name: 'Partial Disabled Exemption (70-100%)',
          description: 'Graduated property tax exemptions for veterans with 70% or higher rating',
          annualValue: 2400,
          monthlyValue: 200,
          eligible: profile.vaDisabilityRating >= 70,
          category: 'tax'
        },
        {
          name: 'Hazlewood Act - Education Benefits',
          description: 'Up to 150 credit hours of tuition exemption at Texas public universities',
          annualValue: 12000,
          monthlyValue: 1000,
          eligible: profile.yearsOfService >= 5,
          category: 'education',
          applicationUrl: 'https://www.tvc.texas.gov/education/hazlewood-act/'
        },
        {
          name: 'State Parks Pass',
          description: 'Free Texas State Parks Pass for disabled veterans',
          annualValue: 70,
          monthlyValue: 6,
          eligible: profile.vaDisabilityRating >= 60,
          category: 'recreation'
        },
        {
          name: 'Hunting & Fishing License',
          description: 'Free or reduced-cost hunting and fishing licenses',
          annualValue: 100,
          monthlyValue: 8,
          eligible: profile.vaDisabilityRating >= 50,
          category: 'recreation'
        },
        {
          name: 'No State Income Tax',
          description: 'Texas has no state income tax',
          annualValue: 0,
          monthlyValue: 0,
          eligible: true,
          category: 'tax'
        }
      ]
    },
    'VA': {
      stateName: 'Virginia',
      stateCode: 'VA',
      hasIncomeTax: true,
      incomeTaxSavings: 2500,
      benefits: [
        {
          name: '100% Disabled Property Tax Exemption',
          description: 'Real property tax exemption for 100% P&T disabled veterans or surviving spouses',
          annualValue: 3500,
          monthlyValue: 292,
          eligible: profile.vaDisabilityRating === 100,
          category: 'tax',
          applicationUrl: 'https://www.tax.virginia.gov/property-tax-relief'
        },
        {
          name: 'Disabled Veterans Property Tax Exemption',
          description: 'Exemption for specially adapted housing',
          annualValue: 1500,
          monthlyValue: 125,
          eligible: profile.vaDisabilityRating >= 50,
          category: 'tax'
        },
        {
          name: 'State Parks Annual Pass',
          description: 'Free annual pass to Virginia State Parks for disabled veterans',
          annualValue: 75,
          monthlyValue: 6,
          eligible: profile.vaDisabilityRating >= 50,
          category: 'recreation'
        },
        {
          name: 'Hunting & Fishing License',
          description: 'Free hunting and fishing licenses for 100% disabled veterans',
          annualValue: 120,
          monthlyValue: 10,
          eligible: profile.vaDisabilityRating === 100,
          category: 'recreation'
        },
        {
          name: 'DMV Fee Waiver',
          description: 'Waiver of vehicle registration and license fees for 100% disabled',
          annualValue: 75,
          monthlyValue: 6,
          eligible: profile.vaDisabilityRating === 100,
          category: 'vehicle'
        },
        {
          name: 'In-State Tuition for Veterans',
          description: 'In-state tuition rates for veterans and dependents using VA education benefits',
          annualValue: 8000,
          monthlyValue: 667,
          eligible: true,
          category: 'education'
        },
        {
          name: 'State Income Tax Exemption',
          description: 'Veterans with 100% P&T rating exempt from state income tax on military retirement pay',
          annualValue: 2500,
          monthlyValue: 208,
          eligible: profile.vaDisabilityRating === 100,
          category: 'tax'
        }
      ]
    },
    'CA': {
      stateName: 'California',
      stateCode: 'CA',
      hasIncomeTax: true,
      incomeTaxSavings: 0,
      benefits: [
        {
          name: 'Disabled Veterans Property Tax Exemption',
          description: 'Basic exemption of $4,000-$200,000 depending on income and disability rating',
          annualValue: 3000,
          monthlyValue: 250,
          eligible: profile.vaDisabilityRating >= 10,
          category: 'tax',
          applicationUrl: 'https://www.boe.ca.gov/proptaxes/vetexemption.htm'
        },
        {
          name: 'CalVet Home Loan Program',
          description: 'Low-interest home loans with competitive rates and low down payments',
          annualValue: 2000,
          monthlyValue: 167,
          eligible: true,
          category: 'tax'
        },
        {
          name: 'College Fee Waiver',
          description: 'Waiver of tuition and fees at California community colleges and state universities',
          annualValue: 10000,
          monthlyValue: 833,
          eligible: profile.vaDisabilityRating >= 10,
          category: 'education',
          applicationUrl: 'https://www.calvet.ca.gov/veteran-services-benefits/education'
        },
        {
          name: 'State Parks Pass',
          description: 'Disabled veteran discount pass for California State Parks',
          annualValue: 95,
          monthlyValue: 8,
          eligible: profile.vaDisabilityRating >= 50,
          category: 'recreation'
        },
        {
          name: 'Hunting & Fishing License',
          description: 'Reduced-cost licenses for disabled veterans',
          annualValue: 80,
          monthlyValue: 7,
          eligible: profile.vaDisabilityRating >= 50,
          category: 'recreation'
        }
      ]
    },
    'AZ': {
      stateName: 'Arizona',
      stateCode: 'AZ',
      hasIncomeTax: true,
      incomeTaxSavings: 1500,
      benefits: [
        {
          name: 'Property Valuation Protection',
          description: 'Property tax exemption for disabled veterans',
          annualValue: 2800,
          monthlyValue: 233,
          eligible: profile.vaDisabilityRating >= 50,
          category: 'tax'
        },
        {
          name: 'State Parks Pass',
          description: 'Free or discounted annual parks pass',
          annualValue: 80,
          monthlyValue: 7,
          eligible: profile.vaDisabilityRating >= 50,
          category: 'recreation'
        },
        {
          name: 'Tuition Waiver Program',
          description: 'Tuition waiver at Arizona public universities for dependents of disabled veterans',
          annualValue: 11000,
          monthlyValue: 917,
          eligible: profile.vaDisabilityRating === 100,
          category: 'education'
        },
        {
          name: 'Vehicle License Tax Exemption',
          description: 'Exemption from vehicle license tax for disabled veterans',
          annualValue: 300,
          monthlyValue: 25,
          eligible: profile.vaDisabilityRating >= 50,
          category: 'vehicle'
        }
      ]
    },
    'NC': {
      stateName: 'North Carolina',
      stateCode: 'NC',
      hasIncomeTax: true,
      incomeTaxSavings: 2000,
      benefits: [
        {
          name: '100% Disabled Property Tax Exclusion',
          description: 'Complete property tax exemption for 100% P&T disabled veterans',
          annualValue: 2500,
          monthlyValue: 208,
          eligible: profile.vaDisabilityRating === 100,
          category: 'tax'
        },
        {
          name: 'Disabled Veteran Property Tax Homestead Exclusion',
          description: 'Up to $45,000 exclusion for disabled veterans',
          annualValue: 1800,
          monthlyValue: 150,
          eligible: profile.vaDisabilityRating >= 30,
          category: 'tax'
        },
        {
          name: 'State Parks Pass',
          description: 'Free annual pass to North Carolina state parks',
          annualValue: 50,
          monthlyValue: 4,
          eligible: profile.vaDisabilityRating >= 50,
          category: 'recreation'
        },
        {
          name: 'Free Hunting & Fishing Licenses',
          description: 'Lifetime sportsman license for 100% disabled veterans',
          annualValue: 200,
          monthlyValue: 17,
          eligible: profile.vaDisabilityRating === 100,
          category: 'recreation'
        },
        {
          name: 'Military Retirement Income Exemption',
          description: 'Up to $54,000 military retirement income exempt from state tax',
          annualValue: 2000,
          monthlyValue: 167,
          eligible: true,
          category: 'tax'
        }
      ]
    },
    'TN': {
      stateName: 'Tennessee',
      stateCode: 'TN',
      hasIncomeTax: false,
      incomeTaxSavings: 0,
      benefits: [
        {
          name: '100% Disabled Property Tax Relief',
          description: 'Property tax relief for 100% P&T disabled veterans',
          annualValue: 2000,
          monthlyValue: 167,
          eligible: profile.vaDisabilityRating === 100,
          category: 'tax'
        },
        {
          name: 'Free State Parks Access',
          description: 'Free admission to Tennessee state parks',
          annualValue: 50,
          monthlyValue: 4,
          eligible: profile.vaDisabilityRating >= 50,
          category: 'recreation'
        },
        {
          name: 'Tuition Assistance for Dependents',
          description: 'Free tuition for dependents of 100% disabled veterans',
          annualValue: 9000,
          monthlyValue: 750,
          eligible: profile.vaDisabilityRating === 100,
          category: 'education'
        },
        {
          name: 'No State Income Tax',
          description: 'Tennessee has no state income tax on wages',
          annualValue: 0,
          monthlyValue: 0,
          eligible: true,
          category: 'tax'
        }
      ]
    },
    'WA': {
      stateName: 'Washington',
      stateCode: 'WA',
      hasIncomeTax: false,
      incomeTaxSavings: 0,
      benefits: [
        {
          name: 'Property Tax Exemption for 100% Disabled',
          description: 'Property tax exemption for honorably discharged veterans with 80%+ rating or unemployability',
          annualValue: 3200,
          monthlyValue: 267,
          eligible: profile.vaDisabilityRating >= 80,
          category: 'tax'
        },
        {
          name: 'Discover Pass Waiver',
          description: 'Free Discover Pass for state parks and recreation areas',
          annualValue: 35,
          monthlyValue: 3,
          eligible: profile.vaDisabilityRating >= 50,
          category: 'recreation'
        },
        {
          name: 'Free Hunting & Fishing Licenses',
          description: 'Free hunting and fishing licenses for disabled veterans',
          annualValue: 150,
          monthlyValue: 13,
          eligible: profile.vaDisabilityRating >= 30,
          category: 'recreation'
        },
        {
          name: 'No State Income Tax',
          description: 'Washington has no state income tax',
          annualValue: 0,
          monthlyValue: 0,
          eligible: true,
          category: 'tax'
        }
      ]
    },
    'SC': {
      stateName: 'South Carolina',
      stateCode: 'SC',
      hasIncomeTax: true,
      incomeTaxSavings: 1800,
      benefits: [
        {
          name: 'Property Tax Exemption for 100% Disabled',
          description: 'First $50,000 of home value exempt from property tax',
          annualValue: 2200,
          monthlyValue: 183,
          eligible: profile.vaDisabilityRating === 100,
          category: 'tax'
        },
        {
          name: 'Free Tuition for Veteran Dependents',
          description: 'Free tuition at SC public colleges for children of wartime veterans',
          annualValue: 10000,
          monthlyValue: 833,
          eligible: true,
          category: 'education'
        },
        {
          name: 'State Parks Pass',
          description: 'Discounted or free annual park pass',
          annualValue: 65,
          monthlyValue: 5,
          eligible: profile.vaDisabilityRating >= 50,
          category: 'recreation'
        },
        {
          name: 'Military Retirement Tax Deduction',
          description: 'Military retirement income tax deduction',
          annualValue: 1800,
          monthlyValue: 150,
          eligible: true,
          category: 'tax'
        }
      ]
    },
    'GA': {
      stateName: 'Georgia',
      stateCode: 'GA',
      hasIncomeTax: true,
      incomeTaxSavings: 1500,
      benefits: [
        {
          name: 'Homestead Tax Exemption for 100% Disabled',
          description: 'Full homestead exemption from state, county, municipal, and school taxes',
          annualValue: 3000,
          monthlyValue: 250,
          eligible: profile.vaDisabilityRating === 100,
          category: 'tax'
        },
        {
          name: 'State Parks Pass',
          description: 'Free annual ParkPass for disabled veterans',
          annualValue: 50,
          monthlyValue: 4,
          eligible: profile.vaDisabilityRating >= 50,
          category: 'recreation'
        },
        {
          name: 'Free Hunting & Fishing Licenses',
          description: 'Free licenses for 100% disabled veterans',
          annualValue: 100,
          monthlyValue: 8,
          eligible: profile.vaDisabilityRating === 100,
          category: 'recreation'
        },
        {
          name: 'Military Retirement Income Exclusion',
          description: 'Up to $65,000 retirement income excluded from state tax',
          annualValue: 1500,
          monthlyValue: 125,
          eligible: true,
          category: 'tax'
        }
      ]
    }
  };

  // Military discounts data
  const militaryDiscounts: MilitaryDiscount[] = [
    {
      category: '🏠 Home Improvement',
      businesses: ['Home Depot (10%)', 'Lowe\'s (10%)', 'Ace Hardware (10%)'],
      estimatedMonthlySavings: 200
    },
    {
      category: '📱 Technology & Services',
      businesses: ['AT&T ($15/line)', 'Verizon ($25/month)', 'T-Mobile (up to $40/month)', 'Xfinity (varies)'],
      estimatedMonthlySavings: 50
    },
    {
      category: '🍔 Dining',
      businesses: ['Applebee\'s (10-15%)', 'Chili\'s (10%)', 'Golden Corral (varies)', 'Outback (10%)'],
      estimatedMonthlySavings: 80
    },
    {
      category: '🛍️ Retail',
      businesses: ['Nike (10%)', 'Under Armour (varies)', 'Columbia Sportswear (varies)', 'Oakley (varies)'],
      estimatedMonthlySavings: 100
    },
    {
      category: '🏨 Travel',
      businesses: ['Marriott (varies)', 'Hilton (varies)', 'United Airlines (varies)', 'Hertz Car Rental (varies)'],
      estimatedMonthlySavings: 50
    },
    {
      category: '💳 Financial',
      businesses: ['USAA (10-15% insurance)', 'Navy Federal (fee waivers)', 'AMEX (annual fee waiver)'],
      estimatedMonthlySavings: 120
    }
  ];

  // Calculate totals
  const federalBenefits = useMemo(() => {
    if (!isProfileComplete()) return [];
    return getAllBenefitsEligibility(profile);
  }, [profile, isProfileComplete]);

  const totalMonthlyFederal = useMemo(() => {
    if (!isProfileComplete()) return 0;
    return getTotalMonthlyBenefits(profile);
  }, [profile, isProfileComplete]);

  const currentStateData = stateDatabase[selectedState] || stateDatabase['VA'];

  const totalMonthlyState = useMemo(() => {
    return currentStateData.benefits
      .filter(b => b.eligible)
      .reduce((sum, b) => sum + b.monthlyValue, 0);
  }, [currentStateData]);

  const totalMonthlyDiscounts = militaryDiscounts.reduce((sum, d) => sum + d.estimatedMonthlySavings, 0);

  const grandTotalMonthly = totalMonthlyFederal + totalMonthlyState + totalMonthlyDiscounts;
  const grandTotalAnnual = grandTotalMonthly * 12;
  const lifetimeValue = grandTotalAnnual * 25; // Assuming 25 years

  if (!isProfileComplete()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-8 rounded-xl shadow-lg">
            <div className="flex items-start gap-4">
              <span className="text-6xl">⚠️</span>
              <div>
                <h3 className="font-bold text-yellow-900 text-3xl mb-3">Complete Your Profile First</h3>
                <p className="text-yellow-800 text-lg mb-6">
                  To see your personalized Total Benefits Center with federal, state, and military discount values, please complete your veteran profile first.
                </p>
                <Link
                  to="/profile"
                  className="inline-block px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-lg rounded-lg shadow-md transition-all"
                >
                  Complete Profile Now →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statesList = Object.keys(stateDatabase).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section with Total Value */}
      <div className="bg-gradient-to-r from-blue-700 via-purple-700 to-green-700 text-white py-16 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black mb-4">💰 My Total Benefits Center</h1>
            <p className="text-2xl text-blue-100">Every Dollar You've Earned - All in One Place</p>
          </div>

          {/* Total Value Display */}
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-8 border-2 border-white border-opacity-30">
            <div className="text-center mb-6">
              <p className="text-xl text-blue-100 mb-2">Your Total Monthly Value</p>
              <p className="text-7xl font-black text-yellow-300 mb-4">
                ${grandTotalMonthly.toLocaleString()}
              </p>
              <p className="text-lg text-blue-100">
                Annual Value: <span className="font-bold text-2xl text-white">${grandTotalAnnual.toLocaleString()}</span>
              </p>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-600 bg-opacity-50 rounded-xl p-4 text-center">
                <p className="text-sm text-blue-100 mb-1">Federal Benefits</p>
                <p className="text-3xl font-black">${totalMonthlyFederal.toLocaleString()}</p>
                <p className="text-xs text-blue-100">per month</p>
              </div>
              <div className="bg-green-600 bg-opacity-50 rounded-xl p-4 text-center">
                <p className="text-sm text-green-100 mb-1">State Benefits ({currentStateData.stateName})</p>
                <p className="text-3xl font-black">${totalMonthlyState.toLocaleString()}</p>
                <p className="text-xs text-green-100">per month</p>
              </div>
              <div className="bg-purple-600 bg-opacity-50 rounded-xl p-4 text-center">
                <p className="text-sm text-purple-100 mb-1">Military Discounts</p>
                <p className="text-3xl font-black">${totalMonthlyDiscounts.toLocaleString()}</p>
                <p className="text-xs text-purple-100">estimated savings</p>
              </div>
            </div>

            {/* Lifetime Value */}
            <div className="mt-6 text-center bg-yellow-500 bg-opacity-20 rounded-lg p-4">
              <p className="text-sm text-yellow-100">Estimated Lifetime Value (25 years)</p>
              <p className="text-4xl font-black text-yellow-300">
                ${(lifetimeValue).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8 border-b-2">
            <button
              onClick={() => setActiveTab('federal')}
              className={`py-4 px-6 font-bold text-lg transition-all ${
                activeTab === 'federal'
                  ? 'text-blue-700 border-b-4 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🇺🇸 Federal Benefits
            </button>
            <button
              onClick={() => setActiveTab('state')}
              className={`py-4 px-6 font-bold text-lg transition-all ${
                activeTab === 'state'
                  ? 'text-green-700 border-b-4 border-green-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🗺️ State Benefits
            </button>
            <button
              onClick={() => setActiveTab('discounts')}
              className={`py-4 px-6 font-bold text-lg transition-all ${
                activeTab === 'discounts'
                  ? 'text-purple-700 border-b-4 border-purple-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎁 Military Discounts
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Federal Benefits Tab */}
        {activeTab === 'federal' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-700 p-6 rounded-lg">
              <h2 className="text-3xl font-bold text-blue-900 mb-2">
                🇺🇸 Your Federal VA Benefits
              </h2>
              <p className="text-blue-800">
                Based on your {profile.vaDisabilityRating}% disability rating, {profile.yearsOfService} years of service,
                and current profile information.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {federalBenefits.filter(b => b.eligible).map((benefit, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-900 text-xs font-bold rounded-full uppercase">
                      {benefit.category}
                    </span>
                    <span className="text-3xl">✓</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.name}</h3>
                  <p className="text-gray-700 mb-4">{benefit.description}</p>

                  {benefit.estimatedMonthlyAmount && benefit.estimatedMonthlyAmount > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-700 mb-1">Monthly Value</p>
                      <p className="text-3xl font-black text-blue-900">
                        ${benefit.estimatedMonthlyAmount.toFixed(0)}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Next Steps:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {benefit.nextSteps.slice(0, 3).map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-600">→</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Federal Recreation Benefits */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-8 border-2 border-blue-400">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                🏞️ Federal Recreation Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border-l-4 border-blue-600">
                  <p className="font-bold text-lg text-gray-900 mb-2">
                    🏞️ National Parks Lifetime Access Pass
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    FREE lifetime pass to all federal national parks for veterans with service-connected disabilities
                  </p>
                  <p className="text-green-700 font-bold mb-2">Value: $80 normally, FREE for you</p>
                  <a
                    href="https://www.nps.gov/subjects/accessibility/access-pass.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-all"
                  >
                    Get Your Pass →
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <p className="text-lg text-gray-700 mb-4">
                Want to explore ALL federal benefits in detail?
              </p>
              <Link
                to="/benefits"
                className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all"
              >
                View Complete Benefits Education Center →
              </Link>
            </div>
          </div>
        )}

        {/* State Benefits Tab */}
        {activeTab === 'state' && (
          <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-700 p-6 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-green-900 mb-2">
                    🗺️ {currentStateData.stateName} State Benefits
                  </h2>
                  <p className="text-green-800">
                    State-specific benefits you qualify for based on your disability rating and location.
                  </p>
                </div>
                <div className="ml-4">
                  <label htmlFor="state-selector" className="block text-sm font-bold text-green-900 mb-2">Select State:</label>
                  <select
                    id="state-selector"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="px-4 py-2 border-2 border-green-600 rounded-lg font-bold text-green-900 focus:ring-2 focus:ring-green-500"
                  >
                    {statesList.map(state => (
                      <option key={state} value={state}>
                        {stateDatabase[state].stateName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* State Tax Info */}
              {!currentStateData.hasIncomeTax && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded mt-4">
                  <p className="font-bold text-yellow-900">
                    🎉 {currentStateData.stateName} has NO state income tax! This saves you thousands annually.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentStateData.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl shadow-lg p-6 border-t-4 transition-all ${
                    benefit.eligible
                      ? 'bg-white border-green-600 hover:shadow-2xl'
                      : 'bg-gray-50 border-gray-300 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                      benefit.category === 'tax' ? 'bg-yellow-100 text-yellow-900' :
                      benefit.category === 'education' ? 'bg-blue-100 text-blue-900' :
                      benefit.category === 'recreation' ? 'bg-green-100 text-green-900' :
                      benefit.category === 'vehicle' ? 'bg-purple-100 text-purple-900' :
                      'bg-gray-100 text-gray-900'
                    }`}>
                      {benefit.category}
                    </span>
                    {benefit.eligible && <span className="text-3xl">✓</span>}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.name}</h3>
                  <p className="text-gray-700 mb-4">{benefit.description}</p>

                  {benefit.eligible && benefit.monthlyValue > 0 && (
                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-green-700 mb-1">
                        Value: ${benefit.annualValue.toLocaleString()}/year
                      </p>
                      <p className="text-2xl font-black text-green-900">
                        ${benefit.monthlyValue}/month
                      </p>
                    </div>
                  )}

                  {!benefit.eligible && (
                    <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-600">
                      Not eligible with current {profile.vaDisabilityRating}% rating
                    </div>
                  )}

                  {benefit.applicationUrl && benefit.eligible && (
                    <a
                      href={benefit.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg transition-all"
                    >
                      Learn More & Apply →
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* State Recreation Benefits */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-8 border-2 border-green-400">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                🌲 State Parks & Recreation Access
              </h3>
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-600">
                <p className="font-bold text-lg text-gray-900 mb-2">
                  🏞️ State Parks Annual Pass
                </p>
                <p className="text-gray-700 text-sm mb-2">
                  Most states offer free or discounted annual passes to state parks for disabled veterans. Check your state's specific program.
                </p>
                <p className="text-green-700 font-bold mb-2">Value: $50-150/year (varies by state)</p>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-3">
                  <p className="text-sm text-blue-900">
                    <strong>Remember:</strong> For <strong>federal</strong> National Parks, use your free federal Access Pass (see Federal Benefits tab). State passes are for state parks only.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                💡 State Benefits Tips
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">→</span>
                  <span>Many state benefits require annual renewal - set calendar reminders!</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">→</span>
                  <span>Property tax exemptions may require filing with your county assessor's office</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">→</span>
                  <span>Some states offer additional benefits at the county/city level - check locally!</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">→</span>
                  <span>Keep your VA rating letter and DD-214 handy for benefit applications</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Military Discounts Tab */}
        {activeTab === 'discounts' && (
          <div className="space-y-6">
            <div className="bg-purple-50 border-l-4 border-purple-700 p-6 rounded-lg">
              <h2 className="text-3xl font-bold text-purple-900 mb-2">
                🎁 Military Discounts & Perks
              </h2>
              <p className="text-purple-800">
                Save hundreds every month with military discounts from major retailers and service providers.
                Estimated monthly savings: <span className="font-black text-2xl">${totalMonthlyDiscounts}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {militaryDiscounts.map((discount, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-600 hover:shadow-2xl transition-all"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{discount.category}</h3>

                  <ul className="space-y-2 mb-6">
                    {discount.businesses.map((business, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <span className="text-purple-600">✓</span>
                        <span>{business}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-700 mb-1">Estimated Monthly Savings</p>
                    <p className="text-3xl font-black text-purple-900">
                      ${discount.estimatedMonthlySavings}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Perks Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg p-8 border-2 border-yellow-400">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                🌟 Special Veteran Perks
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="font-bold text-lg text-gray-900 mb-2">
                    � Commissary Access
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    20-30% savings on groceries compared to civilian stores
                  </p>
                  <p className="text-green-700 font-bold">Est. Savings: $200-400/month</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="font-bold text-lg text-gray-900 mb-2">
                    💳 Credit Card Fee Waivers
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    AMEX Platinum, Chase Sapphire Reserve - annual fees waived for active duty
                  </p>
                  <p className="text-green-700 font-bold">Value: $550-695/year</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="font-bold text-lg text-gray-900 mb-2">
                    🏦 Banking Fee Waivers
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    Most banks waive monthly fees, overdraft fees, and ATM fees for veterans
                  </p>
                  <p className="text-green-700 font-bold">Value: $15-25/month</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="font-bold text-lg text-gray-900 mb-2">
                    🎖️ Exchange & MWR Access
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    Access to military exchanges and Morale, Welfare & Recreation facilities
                  </p>
                  <p className="text-green-700 font-bold">Tax-free shopping on base</p>
                </div>
              </div>
            </div>

            {/* Link to Full Discounts Page */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <p className="text-lg text-gray-700 mb-4">
                Want to see ALL 150+ military discounts with location-based recommendations?
              </p>
              <Link
                to="/discounts"
                className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-all"
              >
                View Complete Military Discounts Directory →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-blue-900 to-green-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">You've Earned Every Dollar</h2>
          <p className="text-xl text-blue-100 mb-8">
            Don't leave money on the table. Make sure you're claiming ALL your federal and state benefits,
            plus maximizing your military discounts.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/profile"
              className="px-8 py-4 bg-white text-blue-900 font-bold rounded-lg shadow-lg hover:bg-blue-50 transition-all"
            >
              Update My Profile
            </Link>
            <Link
              to="/benefits"
              className="px-8 py-4 bg-yellow-500 text-gray-900 font-bold rounded-lg shadow-lg hover:bg-yellow-400 transition-all"
            >
              Learn About More Benefits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTotalBenefitsCenter;
