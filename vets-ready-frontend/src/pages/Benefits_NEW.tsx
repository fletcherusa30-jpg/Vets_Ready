import React, { useState } from 'react';
import { Claims } from './Claims';

type TabType =
  | 'overview'
  | 'claims'
  | 'compensation'
  | 'retirement'
  | 'healthcare'
  | 'education'
  | 'housing'
  | 'state-benefits'
  | 'survivor-family'
  | 'special-programs'
  | 'tools-calculators';

export const Benefits: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Patriotic Background SVG Pattern
  const PatrioticBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="stars" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M25 10 L27.5 17.5 L35 17.5 L29 22 L31.5 29.5 L25 25 L18.5 29.5 L21 22 L15 17.5 L22.5 17.5 Z" fill="white" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stars)"/>
      </svg>
    </div>
  );

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '🏛️' },
    { id: 'claims' as TabType, label: 'Claims & Service Connection', icon: '📋' },
    { id: 'compensation' as TabType, label: 'Compensation & Income', icon: '💰' },
    { id: 'retirement' as TabType, label: 'Retirement & Budget Planner', icon: '📊' },
    { id: 'healthcare' as TabType, label: 'Healthcare & Wellness', icon: '🏥' },
    { id: 'education' as TabType, label: 'Education & Employment', icon: '🎓' },
    { id: 'housing' as TabType, label: 'Housing & Home Loans', icon: '🏠' },
    { id: 'state-benefits' as TabType, label: 'State Benefits Navigator', icon: '🗺️' },
    { id: 'survivor-family' as TabType, label: 'Survivor & Family Benefits', icon: '👨‍👩‍👧‍👦' },
    { id: 'special-programs' as TabType, label: 'Special Programs & Toxic Exposure', icon: '☣️' },
    { id: 'tools-calculators' as TabType, label: 'Tools & Calculators Library', icon: '🧮' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      {/* Patriotic Hero Banner */}
      <div className="relative overflow-hidden">
        {/* American Flag Stripes Background */}
        <div className="absolute inset-0">
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-gradient-to-r from-red-700 to-red-600"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-gradient-to-r from-red-700 to-red-600"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-gradient-to-r from-red-700 to-red-600"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-gradient-to-r from-red-700 to-red-600"></div>
          </div>
        </div>

        {/* Stars Section Overlay */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-900 to-blue-800">
          <PatrioticBackground />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          <div className="text-white">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-6xl">🇺🇸</span>
              <div>
                <h1 className="text-5xl font-black tracking-tight drop-shadow-lg">
                  VetsReady Benefits Education Center
                </h1>
                <p className="text-xl font-semibold mt-2 text-blue-100 drop-shadow">
                  Educational Guidance on VA, DoD, and State Benefits
                </p>
              </div>
            </div>
            <div className="bg-yellow-400 text-red-900 font-bold px-6 py-3 rounded-lg inline-block mt-4 shadow-xl">
              ⚠️ ADVISORY ONLY — NO CLAIM SUBMISSION
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-lg sticky top-0 z-40 border-b-4 border-blue-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto scrollbar-thin">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 text-sm font-semibold border-b-4 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-700 bg-red-50'
                    : 'border-transparent text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-blue-700">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-4xl">🏛️</span>
                <span>Welcome to the Benefits Education Center</span>
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Your comprehensive resource for understanding VA, DoD, and state benefits. This center provides
                educational guidance and advisory information only. <strong className="text-red-600">This is not a claims submission platform.</strong>
              </p>

              {/* Quick Access Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <button
                  onClick={() => setActiveTab('claims')}
                  className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <div className="text-5xl mb-3">📋</div>
                  <h3 className="text-xl font-bold mb-2">Claims & Service Connection</h3>
                  <p className="text-blue-100 text-sm">Analyzer, Wizard, Theories & Guides</p>
                </button>

                <button
                  onClick={() => setActiveTab('retirement')}
                  className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <div className="text-5xl mb-3">📊</div>
                  <h3 className="text-xl font-bold mb-2">Retirement & Budget Planner</h3>
                  <p className="text-green-100 text-sm">Monthly Budget, Projections & Scenarios</p>
                </button>

                <button
                  onClick={() => setActiveTab('healthcare')}
                  className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <div className="text-5xl mb-3">🏥</div>
                  <h3 className="text-xl font-bold mb-2">Healthcare & Wellness</h3>
                  <p className="text-red-100 text-sm">Eligibility, Priority Groups & CHAMPVA</p>
                </button>

                <button
                  onClick={() => setActiveTab('education')}
                  className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <div className="text-5xl mb-3">🎓</div>
                  <h3 className="text-xl font-bold mb-2">Education & Employment</h3>
                  <p className="text-purple-100 text-sm">GI Bill, VR&E & Job Readiness</p>
                </button>

                <button
                  onClick={() => setActiveTab('housing')}
                  className="bg-gradient-to-br from-orange-600 to-orange-700 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <div className="text-5xl mb-3">🏠</div>
                  <h3 className="text-xl font-bold mb-2">Housing & Home Loans</h3>
                  <p className="text-orange-100 text-sm">VA Loans, COE & SAH/SHA Grants</p>
                </button>

                <button
                  onClick={() => setActiveTab('special-programs')}
                  className="bg-gradient-to-br from-yellow-600 to-yellow-700 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <div className="text-5xl mb-3">☣️</div>
                  <h3 className="text-xl font-bold mb-2">Special Programs</h3>
                  <p className="text-yellow-100 text-sm">PACT Act, Burn Pits & Toxic Exposure</p>
                </button>
              </div>

              {/* Advisory Notice */}
              <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">⚖️</span>
                  <div>
                    <h4 className="font-bold text-yellow-900 text-lg mb-2">Important Legal Notice</h4>
                    <p className="text-yellow-800 text-sm">
                      This Benefits Education Center provides educational and advisory information only.
                      It does not submit claims, provide legal advice, or represent official VA determinations.
                      For claim submission, contact VA at <strong>1-800-827-1000</strong> or consult an
                      accredited Veterans Service Officer (VSO).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Claims & Service Connection Tab */}
        {activeTab === 'claims' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-blue-700">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-4xl">📋</span>
                <span>Claims & Service Connection Tools</span>
              </h2>
              <Claims />
            </div>
          </div>
        )}

        {/* Compensation & Income Tab */}
        {activeTab === 'compensation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-green-700">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-4xl">💰</span>
                <span>Compensation & Income Tools</span>
              </h2>
              <p className="text-gray-600 mb-6">
                Calculate your potential VA disability compensation, retro pay, and income benefits.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">💵</div>
                  <h3 className="text-xl font-bold mb-3">VA Compensation Calculator</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Calculate monthly compensation based on disability rating and dependents.
                  </p>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-semibold">
                    Calculate Compensation
                  </button>
                </div>

                <div className="border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">⏰</div>
                  <h3 className="text-xl font-bold mb-3">Retro Pay Estimator</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Estimate retroactive pay based on effective date and rating increase.
                  </p>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold">
                    Estimate Retro Pay
                  </button>
                </div>

                <div className="border-2 border-purple-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">📈</div>
                  <h3 className="text-xl font-bold mb-3">Income Overview</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Comprehensive view of all VA compensation and pension sources.
                  </p>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 font-semibold">
                    View Income Overview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Retirement & Budget Planner Tab */}
        {activeTab === 'retirement' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-green-700">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-4xl">📊</span>
                <span>Retirement & Budget Planner</span>
              </h2>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
                <h3 className="font-bold text-blue-900 mb-2">🔄 Integrated System</h3>
                <p className="text-blue-800 text-sm">
                  This planner combines retirement projections with monthly budget analysis to provide
                  comprehensive financial planning guidance. Choose your path below.
                </p>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <button className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all">
                  <div className="text-5xl mb-3">✅</div>
                  <h3 className="text-xl font-bold mb-2">Already Retired</h3>
                  <p className="text-blue-100 text-sm">Stability projection & budget management</p>
                </button>

                <button className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all">
                  <div className="text-5xl mb-3">🛤️</div>
                  <h3 className="text-xl font-bold mb-2">Road to Retirement</h3>
                  <p className="text-green-100 text-sm">Timeline & projection planning</p>
                </button>

                <button className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all">
                  <div className="text-5xl mb-3">🔀</div>
                  <h3 className="text-xl font-bold mb-2">Show Both (Hybrid)</h3>
                  <p className="text-purple-100 text-sm">View all planning tools together</p>
                </button>
              </div>

              {/* Shared Budget Engine Preview */}
              <div className="border-2 border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">💵 Monthly Budget Calculator (Shared Engine)</h3>
                <p className="text-gray-600 mb-4">
                  The budget calculator powers both retirement paths, providing real-time analysis of
                  income, expenses, savings, and financial readiness.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="font-semibold text-green-900">Income Sources</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">💸</div>
                    <div className="font-semibold text-red-900">Expenses</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">💳</div>
                    <div className="font-semibold text-blue-900">Debt</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">🏦</div>
                    <div className="font-semibold text-purple-900">Savings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Healthcare & Wellness Tab */}
        {activeTab === 'healthcare' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-red-700">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-4xl">🏥</span>
                <span>Healthcare & Wellness Tools</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="border-2 border-red-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🩺</div>
                  <h3 className="text-lg font-bold mb-3">VA Healthcare Eligibility Wizard</h3>
                  <p className="text-gray-600 text-sm mb-4">Determine your healthcare eligibility</p>
                  <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 text-sm font-semibold">
                    Check Eligibility
                  </button>
                </div>

                <div className="border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">📊</div>
                  <h3 className="text-lg font-bold mb-3">Priority Group Estimator</h3>
                  <p className="text-gray-600 text-sm mb-4">Find your VA priority group (1-8)</p>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm font-semibold">
                    Estimate Priority
                  </button>
                </div>

                <div className="border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">💊</div>
                  <h3 className="text-lg font-bold mb-3">CHAMPVA Eligibility</h3>
                  <p className="text-gray-600 text-sm mb-4">Check family healthcare eligibility</p>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm font-semibold">
                    Check CHAMPVA
                  </button>
                </div>

                <div className="border-2 border-purple-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🧠</div>
                  <h3 className="text-lg font-bold mb-3">Mental Health Resources</h3>
                  <p className="text-gray-600 text-sm mb-4">Crisis support & mental wellness</p>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 text-sm font-semibold">
                    Get Resources
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Education & Employment Tab */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-purple-700">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-4xl">🎓</span>
                <span>Education & Employment Tools</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="border-2 border-purple-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-lg font-bold mb-3">GI Bill Eligibility Wizard</h3>
                  <p className="text-gray-600 text-sm mb-4">Determine GI Bill benefits</p>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 text-sm font-semibold">
                    Check GI Bill
                  </button>
                </div>

                <div className="border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🛤️</div>
                  <h3 className="text-lg font-bold mb-3">VR&E Pathfinder</h3>
                  <p className="text-gray-600 text-sm mb-4">Vocational rehab & employment</p>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm font-semibold">
                    Explore VR&E
                  </button>
                </div>

                <div className="border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-lg font-bold mb-3">Resume Builder</h3>
                  <p className="text-gray-600 text-sm mb-4">Military to civilian resume</p>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm font-semibold">
                    Build Resume
                  </button>
                </div>

                <div className="border-2 border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">📊</div>
                  <h3 className="text-lg font-bold mb-3">Job Readiness Score</h3>
                  <p className="text-gray-600 text-sm mb-4">Assess civilian job readiness</p>
                  <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 text-sm font-semibold">
                    Get Score
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Housing & Home Loans Tab */}
        {activeTab === 'housing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-orange-700">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-4xl">🏠</span>
                <span>Housing & Home Loan Tools</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-2 border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🏡</div>
                  <h3 className="text-xl font-bold mb-3">VA Home Loan Wizard</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Determine eligibility for VA-backed home loans with zero down payment.
                  </p>
                  <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 font-semibold">
                    Check Eligibility
                  </button>
                </div>

                <div className="border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">📜</div>
                  <h3 className="text-xl font-bold mb-3">COE Logic</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Certificate of Eligibility requirements and application guidance.
                  </p>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold">
                    Get COE Info
                  </button>
                </div>

                <div className="border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🏗️</div>
                  <h3 className="text-xl font-bold mb-3">SAH/SHA Grant Estimator</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Specially Adapted Housing grants for disabled veterans.
                  </p>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-semibold">
                    Estimate Grant
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State Benefits Navigator Tab */}
        {activeTab === 'state-benefits' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-indigo-700">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-4xl">🗺️</span>
                <span>State Benefits Navigator</span>
              </h2>
              <p className="text-gray-600 mb-6">
                Discover veteran benefits specific to your state, including tax exemptions, education benefits,
                employment programs, and more.
              </p>

              <div className="border-2 border-indigo-200 rounded-lg p-6">
                <label htmlFor="state-select">
                  <h3 className="text-xl font-bold mb-4">Select Your State</h3>
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg mb-4" id="state-select" name="state-select">
                  <option value="">Choose a state...</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  {/* Add all states */}
                </select>
                <button className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 font-semibold">
                  View State Benefits
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Survivor & Family Benefits Tab */}
        {activeTab === 'survivor-family' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-pink-700">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-4xl">👨‍👩‍👧‍👦</span>
                <span>Survivor & Family Benefits</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">💔</div>
                  <h3 className="text-xl font-bold mb-3">DIC Eligibility Wizard</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Dependency and Indemnity Compensation for survivors.
                  </p>
                  <button className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 font-semibold">
                    Check DIC
                  </button>
                </div>

                <div className="border-2 border-purple-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">💰</div>
                  <h3 className="text-xl font-bold mb-3">Survivor Pension Estimator</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Needs-based pension for surviving spouses and children.
                  </p>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 font-semibold">
                    Estimate Pension
                  </button>
                </div>

                <div className="border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🤝</div>
                  <h3 className="text-xl font-bold mb-3">Caregiver Program Logic</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Support for family caregivers of disabled veterans.
                  </p>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Special Programs & Toxic Exposure Tab */}
        {activeTab === 'special-programs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-yellow-600">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-4xl">☣️</span>
                <span>Special Programs & Toxic Exposure</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🏛️</div>
                  <h3 className="text-xl font-bold mb-3">PACT Act Coverage</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Expanded benefits for toxic exposure during service.
                  </p>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-semibold">
                    Learn About PACT Act
                  </button>
                </div>

                <div className="border-2 border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🔥</div>
                  <h3 className="text-xl font-bold mb-3">Burn Pit Registry</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Registration and presumptive conditions for burn pit exposure.
                  </p>
                  <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 font-semibold">
                    Register Now
                  </button>
                </div>

                <div className="border-2 border-yellow-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🌿</div>
                  <h3 className="text-xl font-bold mb-3">Agent Orange</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Presumptive conditions and eligibility for Agent Orange exposure.
                  </p>
                  <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 font-semibold">
                    Check Eligibility
                  </button>
                </div>

                <div className="border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🏜️</div>
                  <h3 className="text-xl font-bold mb-3">Gulf War Illness</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Medically unexplained chronic multisymptom illness.
                  </p>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold">
                    Get Information
                  </button>
                </div>

                <div className="border-2 border-red-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🎗️</div>
                  <h3 className="text-xl font-bold mb-3">MST Resources</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Military Sexual Trauma support and benefits.
                  </p>
                  <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-semibold">
                    Get Support
                  </button>
                </div>

                <div className="border-2 border-purple-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">💧</div>
                  <h3 className="text-xl font-bold mb-3">Camp Lejeune</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Water contamination exposure claims and benefits.
                  </p>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 font-semibold">
                    File Claim
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tools & Calculators Library Tab */}
        {activeTab === 'tools-calculators' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-cyan-700">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-4xl">🧮</span>
                <span>Tools & Calculators Library</span>
              </h2>
              <p className="text-gray-600 mb-6">
                Comprehensive collection of all calculators, wizards, and planning tools in one place.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4">
                  <div className="text-3xl mb-2">💵</div>
                  <h4 className="font-bold text-sm">VA Compensation Calculator</h4>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4">
                  <div className="text-3xl mb-2">📊</div>
                  <h4 className="font-bold text-sm">Retirement Projection Engine</h4>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-lg p-4">
                  <div className="text-3xl mb-2">⏰</div>
                  <h4 className="font-bold text-sm">Effective Date Calculator</h4>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-4">
                  <div className="text-3xl mb-2">🏥</div>
                  <h4 className="font-bold text-sm">Priority Group Estimator</h4>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-4">
                  <div className="text-3xl mb-2">💰</div>
                  <h4 className="font-bold text-sm">Retro Pay Estimator</h4>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg p-4">
                  <div className="text-3xl mb-2">📈</div>
                  <h4 className="font-bold text-sm">Scenario Builder</h4>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-300 rounded-lg p-4">
                  <div className="text-3xl mb-2">🏦</div>
                  <h4 className="font-bold text-sm">Monthly Budget Calculator</h4>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-300 rounded-lg p-4">
                  <div className="text-3xl mb-2">📝</div>
                  <h4 className="font-bold text-sm">Readiness Score Engine</h4>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Advisory */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-red-700 via-white to-blue-700 rounded-xl shadow-xl p-1">
          <div className="bg-white rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🇺🇸 Serving Those Who Served</h3>
              <p className="text-gray-700 mb-4">
                <strong>VetsReady Benefits Education Center</strong> is an advisory and educational platform only.
                We do not submit claims, provide legal advice, or make official VA determinations.
              </p>
              <p className="text-sm text-gray-600">
                For official claim submission: <strong>1-800-827-1000</strong> | For crisis support: <strong>988 then Press 1</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
