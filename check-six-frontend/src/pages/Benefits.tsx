import React, { useState } from 'react';
import { Claims } from './Claims';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import VAJobsWidget from '../components/VAJobsWidget';

type TabType =
  | 'overview'
  | 'claims'
  | 'crsc'
  | 'compensation'
  | 'healthcare'
  | 'education'
  | 'housing'
  | 'state-benefits'
  | 'survivor-family'
  | 'special-programs'
  | 'tools-calculators';

export const Benefits: React.FC = () => {
  const { profile } = useVeteranProfile();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // CRSC Wizard State
  const [crscWizardStep, setCrscWizardStep] = useState(1);
  const [crscQualifies, setCrscQualifies] = useState(false);
  const [crscData, setCrscData] = useState({
    hasRetirementPay: false,
    isMedicallyRetired: false,
    hasDisabilityRating: false,
    disabilityIsCombatRelated: false,
    disabilityPercentage: profile.disabilityRating || 0,
    yearsOfService: profile.yearsOfService || 0,
    hasMedicalDocumentation: false,
    injuryDate: '',
    deploymentInfo: '',
    branchOfService: profile.branch || 'Army'
  });

  // Helper function to calculate disability pay (2024 rates)
  const getDisabilityPay = (rating: number): number => {
    const rates: { [key: number]: number } = {
      10: 171.23, 20: 338.49, 30: 524.31, 40: 755.28, 50: 1075.16,
      60: 1361.88, 70: 1716.28, 80: 1995.01, 90: 2241.91, 100: 3737.85
    };
    return rates[rating] || 0;
  };

  // Waving Flag Animation CSS (moved to global CSS or Tailwind config)

  // Patriotic Stars Pattern
  const PatrioticStars = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="stars" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M40 15 L43 28 L56 28 L45 36 L49 49 L40 41 L31 49 L35 36 L24 28 L37 28 Z" fill="white" opacity="0.9"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stars)"/>
      </svg>
    </div>
  );

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '🏛️' },
    { id: 'claims' as TabType, label: 'Claims & Service Connection', icon: '📋' },
    { id: 'crsc' as TabType, label: 'CRSC (Combat Pay)', icon: '🎖️' },
    { id: 'compensation' as TabType, label: 'Compensation & Income', icon: '💰' },
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
      {/* Waving American Flag Hero Banner */}
      <div className="relative overflow-hidden h-[300px]">
        {/* Animated Waving Flag Background */}
        <div className="absolute inset-0 animate-wave">
          {/* Red Stripes with wave effect */}
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-gradient-to-r from-[#B22234] via-[#B22234] to-[#9B1B2F]"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-gradient-to-r from-[#B22234] via-[#B22234] to-[#9B1B2F]"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-gradient-to-r from-[#B22234] via-[#B22234] to-[#9B1B2F]"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-gradient-to-r from-[#B22234] via-[#B22234] to-[#9B1B2F]"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-gradient-to-r from-[#B22234] via-[#B22234] to-[#9B1B2F]"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-gradient-to-r from-[#B22234] via-[#B22234] to-[#9B1B2F]"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-gradient-to-r from-[#B22234] via-[#B22234] to-[#9B1B2F]"></div>
          </div>
        </div>

        {/* Blue Canton (Stars Section) with wave */}
        <div className="absolute top-0 left-0 h-[54%] w-[40%] animate-wave bg-gradient-to-br from-[#3C3B6E] via-[#3C3B6E] to-[#2B2A4C] shadow-inner-canton">
          <PatrioticStars />
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>

        {/* Content with white text on dark background */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 h-full flex flex-col justify-center">
          <div className="text-center">
            <div className="mb-4">
              <h1 className="text-6xl font-black tracking-tight text-white drop-shadow-2xl mb-3 shadow-title">
                🇺🇸 rallyforge Benefits Education Center
              </h1>
              <p className="text-2xl font-bold text-white drop-shadow-2xl shadow-title">
                Comprehensive VA Benefits Education & Resources
              </p>
            </div>
            <div className="inline-flex items-center gap-3 bg-yellow-400 text-red-900 font-bold px-8 py-4 rounded-lg shadow-2xl">
              <span className="text-2xl">⚠️</span>
              <span className="text-lg">EDUCATIONAL ADVISORY ONLY — NO CLAIM SUBMISSION</span>
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

              {/* VA Jobs & Resources Widget */}
              <div className="mt-8">
                <VAJobsWidget />
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

        {/* CRSC (Combat-Related Special Compensation) Tab */}
        {activeTab === 'crsc' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-orange-600">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-4xl">🎖️</span>
                <span>CRSC - Combat-Related Special Compensation</span>
              </h2>

              {/* Qualification Wizard - Moved to Top */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 mb-8 border-2 border-orange-300 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-3xl">🎯</span>
                  <span>CRSC Qualification Wizard</span>
                </h3>
                <p className="text-gray-700 mb-6">Answer a few questions to see if you qualify and get your personalized application guide.</p>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className={`bg-orange-500 h-3 rounded-full transition-all duration-300 ${
                          crscWizardStep === 1 ? 'w-1/4' : crscWizardStep === 2 ? 'w-2/4' : crscWizardStep === 3 ? 'w-3/4' : 'w-full'
                        }`}
                        role="progressbar"
                        aria-label="CRSC Wizard Progress"
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-600">Step {crscWizardStep} of 4</span>
                  </div>
                </div>

                {/* Step 1: Basic Qualification */}
                {crscWizardStep === 1 && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-gray-800">Step 1: Basic Qualification Check</h4>
                    <p className="text-gray-600">Let's determine if you meet the basic requirements for CRSC benefits.</p>

                    <div className="space-y-4">
                      <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                        <input
                          type="checkbox"
                          checked={crscData.hasRetirementPay}
                          onChange={(e) => setCrscData({ ...crscData, hasRetirementPay: e.target.checked, isMedicallyRetired: e.target.checked ? crscData.isMedicallyRetired : false })}
                          className="w-5 h-5 text-orange-600 mt-1 rounded"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-gray-900 block mb-1">✓ I receive regular military retirement pay (20+ years of service)</span>
                          <p className="text-sm text-gray-600">For service members who retired after completing 20 or more years of active duty service</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                        <input
                          type="checkbox"
                          checked={crscData.isMedicallyRetired}
                          onChange={(e) => setCrscData({ ...crscData, isMedicallyRetired: e.target.checked, hasRetirementPay: e.target.checked ? true : crscData.hasRetirementPay })}
                          className="w-5 h-5 text-orange-600 mt-1 rounded"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-gray-900 block mb-1">✓ I am medically retired from the military</span>
                          <p className="text-sm text-gray-600">For service members retired due to medical reasons, regardless of years of service (may have less than 20 years)</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                        <input
                          type="checkbox"
                          checked={crscData.hasDisabilityRating}
                          onChange={(e) => setCrscData({ ...crscData, hasDisabilityRating: e.target.checked })}
                          className="w-5 h-5 text-orange-600 mt-1 rounded"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-gray-900 block mb-1">✓ I have a VA disability rating of 10% or higher</span>
                          <p className="text-sm text-gray-600">Required minimum rating to qualify for CRSC</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                        <input
                          type="checkbox"
                          checked={crscData.disabilityIsCombatRelated}
                          onChange={(e) => setCrscData({ ...crscData, disabilityIsCombatRelated: e.target.checked })}
                          className="w-5 h-5 text-orange-600 mt-1 rounded"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-gray-900 block mb-1">✓ My disability is combat-related</span>
                          <p className="text-sm text-gray-600 mb-2">
                            Qualifies if your disability resulted from any of these 4 categories:
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1 ml-4">
                            <li>• <strong>Armed Conflict:</strong> Direct combat operations, enemy fire, IED attacks</li>
                            <li>• <strong>Hazardous Duty:</strong> Parachuting, flight ops, diving, EOD, special operations</li>
                            <li>• <strong>Instrumentality of War:</strong> Training with weapons, vehicles, or equipment</li>
                            <li>• <strong>Simulated War:</strong> Combat training exercises, war games, field operations</li>
                          </ul>
                        </div>
                      </label>

                      <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg">
                        <p className="font-semibold text-blue-900 mb-2">💡 Important: "Combat-Related" Includes MORE Than Just Combat</p>
                        <p className="text-sm text-blue-800 mb-3">
                          Many veterans don't realize their disabilities qualify as "combat-related" even if they never saw direct combat.
                        </p>
                        <div className="text-sm text-blue-800 space-y-2">
                          <p><strong>✓ Hazardous Duty Examples:</strong></p>
                          <ul className="ml-6 space-y-1 list-disc">
                            <li>Parachute/airborne operations injuries (knees, back, ankles)</li>
                            <li>Flight operations (hearing loss, back injuries, crashes)</li>
                            <li>Diving operations (hearing, TBI, decompression sickness)</li>
                            <li>Explosive Ordnance Disposal (blast exposure, TBI, hearing loss)</li>
                            <li>Special operations training injuries</li>
                          </ul>
                          <p className="mt-2"><strong>✓ Instrumentality of War Examples:</strong></p>
                          <ul className="ml-6 space-y-1 list-disc">
                            <li>Weapons training accidents (hearing loss from firing ranges)</li>
                            <li>Vehicle accidents during military operations</li>
                            <li>Equipment-related injuries during duty</li>
                          </ul>
                          <p className="mt-2"><strong>✓ Simulated War Examples:</strong></p>
                          <ul className="ml-6 space-y-1 list-disc">
                            <li>Field training exercise injuries</li>
                            <li>Combat drills and war games</li>
                            <li>Live-fire exercises</li>
                          </ul>
                        </div>
                      </div>

                      {crscData.hasDisabilityRating && (
                        <div className="bg-white p-6 rounded-lg border-2 border-orange-200">
                          <label className="block text-sm font-semibold text-gray-900 mb-3" htmlFor="benefits-crsc-disability">Your VA Disability Rating (%)</label>
                          <input
                            type="range"
                            id="benefits-crsc-disability"
                            name="benefits-crsc-disability"
                            min="0"
                            max="100"
                            step="10"
                            value={crscData.disabilityPercentage}
                            onChange={(e) => setCrscData({ ...crscData, disabilityPercentage: parseInt(e.target.value) })}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                          <div className="text-center mt-4">
                            <div className="text-4xl font-black text-orange-600">{crscData.disabilityPercentage}%</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Estimated Monthly CRSC: <strong className="text-green-700">${getDisabilityPay(crscData.disabilityPercentage).toFixed(2)}</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-6 border-t">
                      <button
                        onClick={() => {
                          const qualifies = (crscData.hasRetirementPay || crscData.isMedicallyRetired) &&
                                          crscData.hasDisabilityRating &&
                                          crscData.disabilityIsCombatRelated &&
                                          crscData.disabilityPercentage >= 10;
                          setCrscQualifies(qualifies);
                          setCrscWizardStep(2);
                        }}
                        className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 shadow-lg transition-colors"
                      >
                        Continue to Step 2 →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2, 3, 4 will be added after this - keeping rest of wizard content */}

                {/* Step 2: Combat Documentation */}
                {crscWizardStep === 2 && (
                  <div className="space-y-6">
                    {crscQualifies ? (
                      <>
                        <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-lg">
                          <p className="font-bold text-green-900 text-lg">✓ Great News! You Appear to Qualify for CRSC</p>
                          <p className="text-sm text-green-800 mt-2">Estimated monthly benefit: <strong>${getDisabilityPay(crscData.disabilityPercentage).toFixed(2)}</strong> (tax-free)</p>
                        </div>

                        <h4 className="text-lg font-bold text-gray-800">Step 2: Military Activity Documentation</h4>
                        <p className="text-gray-600">Now let's gather information to prove your disability is combat-related (includes combat, hazardous duty, training, and instrumentality of war).</p>

                        <div className="space-y-4">
                          <div className="bg-white p-5 rounded-lg border-2 border-gray-300">
                            <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="benefits-branch">
                              Branch of Service {profile.branch && <span className="text-green-600 text-xs ml-2">✓ From profile</span>}
                            </label>
                            <select
                              id="benefits-branch"
                              name="benefits-branch"
                              value={crscData.branchOfService}
                              onChange={(e) => setCrscData({ ...crscData, branchOfService: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="Army">Army</option>
                              <option value="Navy">Navy</option>
                              <option value="Air Force">Air Force</option>
                              <option value="Marine Corps">Marine Corps</option>
                              <option value="Coast Guard">Coast Guard</option>
                              <option value="Space Force">Space Force</option>
                            </select>
                          </div>

                          <div className="bg-white p-5 rounded-lg border-2 border-gray-300">
                            <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="benefits-years-service">
                              Years of Service {profile.yearsOfService && <span className="text-green-600 text-xs ml-2">✓ From profile</span>}
                            </label>
                            <input
                              type="number"
                              id="benefits-years-service"
                              name="benefits-years-service"
                              min="0"
                              max="50"
                              value={crscData.yearsOfService}
                              onChange={(e) => setCrscData({ ...crscData, yearsOfService: parseInt(e.target.value) || 0 })}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                              placeholder="Enter years of service"
                            />
                          </div>

                          <div className="bg-white p-5 rounded-lg border-2 border-gray-300">
                            <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="benefits-injury-date">Date of Combat-Related Injury</label>
                            <input
                              type="date"
                              id="benefits-injury-date"
                              name="benefits-injury-date"
                              value={crscData.injuryDate}
                              onChange={(e) => setCrscData({ ...crscData, injuryDate: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                            <p className="text-xs text-gray-500 mt-2">When did the injury or exposure occur?</p>
                          </div>

                          <div className="bg-white p-5 rounded-lg border-2 border-gray-300">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Military Activity Details (Combat, Hazardous Duty, Training)</label>
                            <textarea
                              value={crscData.deploymentInfo}
                              onChange={(e) => setCrscData({ ...crscData, deploymentInfo: e.target.value })}
                              placeholder="COMBAT EXAMPLE: Deployed to Afghanistan 2010-2011, injured during IED attack on convoy near Kandahar. Received Purple Heart. Unit: 101st Airborne Division.&#10;&#10;HAZARDOUS DUTY EXAMPLE: Airborne qualified, sustained knee and back injuries during parachute training jump at Fort Bragg in 2015. Jump master verified incident. Unit: 82nd Airborne Division.&#10;&#10;TRAINING EXAMPLE: Hearing loss from repeated exposure to live-fire artillery exercises at Fort Sill, OK 2012-2014. Audiograms show progressive hearing damage."
                              className="w-full p-3 border border-gray-300 rounded-lg h-40 focus:ring-2 focus:ring-orange-500"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              <strong>Include:</strong> Location, dates, unit, specific incident/activity type, injuries sustained, witnesses, and any awards (Purple Heart, CAB, CIB, Airborne Badge, etc.)
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              💡 Remember: Parachuting, flight operations, diving, and weapons training ALL qualify as combat-related activities!
                            </p>
                          </div>

                          <label className="flex items-start gap-3 p-5 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                            <input
                              type="checkbox"
                              checked={crscData.hasMedicalDocumentation}
                              onChange={(e) => setCrscData({ ...crscData, hasMedicalDocumentation: e.target.checked })}
                              className="w-5 h-5 text-orange-600 mt-1 rounded"
                            />
                            <div className="flex-1">
                              <span className="font-semibold text-gray-900 block mb-1">✓ I have documentation linking my disability to military activity</span>
                              <p className="text-sm text-gray-600 mb-2">
                                Required documents (check all that apply to your situation):
                              </p>
                              <ul className="text-xs text-gray-600 space-y-1 ml-4">
                                <li>• <strong>Medical Records:</strong> Service treatment records (STRs), VA C&P exam results, diagnosis</li>
                                <li>• <strong>DD Form 214:</strong> Discharge papers (shows service dates and MOS/specialty)</li>
                                <li>• <strong>VA Rating Letter:</strong> Current disability rating decision</li>
                                <li>• <strong>Deployment/Assignment Orders:</strong> Combat zone, hazardous duty location, training base</li>
                                <li>• <strong>Incident Documentation:</strong> After-action reports, accident reports, jump logs, flight records</li>
                                <li>• <strong>Award Documentation:</strong> Purple Heart, CAB, CIB, CAR, Airborne Badge, Flight Wings, Diver Badge, EOD Badge</li>
                                <li>• <strong>Witness Statements:</strong> Battle buddies, jump masters, flight crew, medics, commanders</li>
                              </ul>
                              <p className="text-xs text-blue-600 mt-2">
                                💡 <strong>Airborne/Flight/Dive qualified?</strong> Your specialty badges and jump/flight/dive logs are KEY evidence!
                              </p>
                            </div>
                          </label>
                        </div>
                      </>
                    ) : (
                      <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg">
                        <p className="font-bold text-red-900 text-lg">Based on your answers, you may not qualify for CRSC</p>
                        <p className="text-sm text-red-800 mt-3 mb-2">Requirements to qualify:</p>
                        <ul className="text-sm text-red-800 space-y-1 ml-5 list-disc">
                          <li>Must receive military retirement pay (20+ years or medical retirement)</li>
                          <li>Must have VA disability rating of 10% or higher</li>
                          <li>Disability must be combat-related (direct result of combat operations)</li>
                        </ul>
                        <p className="text-sm text-red-800 mt-3 font-semibold">
                          However, you may qualify for CRDP if you have 50%+ rating and 20+ years of service (automatic, no application needed).
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between pt-6 border-t">
                      <button
                        onClick={() => setCrscWizardStep(1)}
                        className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        ← Back
                      </button>
                      {crscQualifies && (
                        <button
                          onClick={() => setCrscWizardStep(3)}
                          className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 shadow-lg transition-colors"
                        >
                          Continue to Step 3 →
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Required Forms & Filing Instructions */}
                {crscWizardStep === 3 && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-gray-800">Step 3: Required Forms & Filing Instructions</h4>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg">
                      <p className="font-semibold text-blue-900 text-lg mb-2">📋 Application Process Overview</p>
                      <p className="text-sm text-blue-800">
                        CRSC applications are processed by your military branch's personnel office. Each branch has slightly different forms and procedures.
                      </p>
                    </div>

                    {/* Branch-Specific Forms */}
                    <div className="bg-white p-6 rounded-lg border-2 border-orange-300">
                      <h5 className="font-bold text-orange-900 mb-4">Required Forms for {crscData.branchOfService}</h5>

                      <div className="space-y-4">
                        <div className="border-l-4 border-orange-500 pl-4 py-2">
                          <p className="font-semibold text-gray-900">1. DD Form 2860 - Application for CRSC</p>
                          <p className="text-sm text-gray-600 mt-1">Primary application form (all branches use this)</p>
                          <p className="text-xs text-blue-600 mt-1">Available at: <a href="https://www.esd.whs.mil/DD/" target="_blank" rel="noopener noreferrer" className="underline">esd.whs.mil/DD/</a></p>
                        </div>

                        <div className="border-l-4 border-orange-500 pl-4 py-2">
                          <p className="font-semibold text-gray-900">2. DD Form 214 - Certificate of Release or Discharge</p>
                          <p className="text-sm text-gray-600 mt-1">Proof of military service (must show honorable discharge)</p>
                        </div>

                        <div className="border-l-4 border-orange-500 pl-4 py-2">
                          <p className="font-semibold text-gray-900">3. VA Rating Decision Letter</p>
                          <p className="text-sm text-gray-600 mt-1">Shows your current VA disability rating and conditions</p>
                          <p className="text-xs text-gray-500 mt-1">Get from VA.gov or call 1-800-827-1000</p>
                        </div>

                        <div className="border-l-4 border-orange-500 pl-4 py-2">
                          <p className="font-semibold text-gray-900">4. Medical Documentation</p>
                          <p className="text-sm text-gray-600 mt-1">Medical records linking your disability to combat (service treatment records, VA C&P exam results)</p>
                        </div>

                        <div className="border-l-4 border-orange-500 pl-4 py-2">
                          <p className="font-semibold text-gray-900">5. Deployment Records</p>
                          <p className="text-sm text-gray-600 mt-1">Deployment orders, combat action documentation, unit records</p>
                        </div>

                        <div className="border-l-4 border-orange-500 pl-4 py-2">
                          <p className="font-semibold text-gray-900">6. Award Documentation (if applicable)</p>
                          <p className="text-sm text-gray-600 mt-1">Purple Heart, Combat Action Badge/Ribbon, Combat Infantryman Badge, etc.</p>
                        </div>
                      </div>
                    </div>

                    {/* Mailing Address */}
                    <div className="bg-white p-6 rounded-lg border-2 border-blue-300">
                      <h5 className="font-bold text-blue-900 mb-3">📮 Where to Mail Your Application</h5>
                      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                        {crscData.branchOfService === 'Army' && (
                          <>
                            <p className="font-semibold text-gray-900 mb-2">U.S. Army - CRSC:</p>
                            <p>Department of the Army</p>
                            <p>U.S. Army Physical Disability Agency</p>
                            <p>CRSC Team</p>
                            <p>200 Stovall Street, Room 5S82</p>
                            <p>Alexandria, VA 22332-0470</p>
                          </>
                        )}
                        {crscData.branchOfService === 'Navy' && (
                          <>
                            <p className="font-semibold text-gray-900 mb-2">U.S. Navy - CRSC:</p>
                            <p>Secretary of the Navy Council of Review Boards</p>
                            <p>Attn: Combat-Related Special Compensation Branch</p>
                            <p>720 Kennon Street SE, Suite 309</p>
                            <p>Washington Navy Yard, DC 20374-5023</p>
                          </>
                        )}
                        {crscData.branchOfService === 'Air Force' && (
                          <>
                            <p className="font-semibold text-gray-900 mb-2">U.S. Air Force - CRSC:</p>
                            <p>AFPC/DPFDC</p>
                            <p>550 C Street West, Suite 6</p>
                            <p>Randolph AFB, TX 78150-4708</p>
                          </>
                        )}
                        {crscData.branchOfService === 'Marine Corps' && (
                          <>
                            <p className="font-semibold text-gray-900 mb-2">U.S. Marine Corps - CRSC:</p>
                            <p>Headquarters U.S. Marine Corps</p>
                            <p>Personnel Management Support Branch (MMSB-17)</p>
                            <p>3280 Russell Road</p>
                            <p>Quantico, VA 22134-5103</p>
                          </>
                        )}
                        {(crscData.branchOfService === 'Coast Guard' || crscData.branchOfService === 'Space Force') && (
                          <>
                            <p className="font-semibold text-gray-900 mb-2">{crscData.branchOfService} - CRSC:</p>
                            <p>Contact your branch's personnel office for specific mailing address</p>
                            <p className="text-xs mt-2 text-gray-600">Call DFAS at 1-800-321-1080 for guidance</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Processing Timeline */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-lg">
                      <p className="font-semibold text-yellow-900 mb-2">⏱️ Processing Timeline</p>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• <strong>Initial Review:</strong> 4-6 weeks (acknowledgment letter sent)</li>
                        <li>• <strong>Full Processing:</strong> 6-12 months (can be longer if additional documentation needed)</li>
                        <li>• <strong>Decision Letter:</strong> Mailed to your address on file</li>
                        <li>• <strong>If Approved:</strong> Payments begin the month after approval, with retroactive pay to application date</li>
                      </ul>
                    </div>

                    <div className="flex justify-between pt-6 border-t">
                      <button
                        onClick={() => setCrscWizardStep(2)}
                        className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => setCrscWizardStep(4)}
                        className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 shadow-lg transition-colors"
                      >
                        Generate Application Guide →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Generate Application Guide */}
                {crscWizardStep === 4 && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-gray-800">Step 4: Your Personalized CRSC Application Guide</h4>

                    <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-500 p-6 rounded-xl">
                      <h5 className="font-bold text-green-900 text-xl mb-4 flex items-center gap-2">
                        <span className="text-2xl">✓</span>
                        <span>Ready to Apply for CRSC!</span>
                      </h5>

                      <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-5 rounded-lg shadow-md">
                          <p className="text-sm text-gray-600 mb-1">Your VA Rating</p>
                          <p className="text-3xl font-black text-orange-600">{crscData.disabilityPercentage}%</p>
                        </div>
                        <div className="bg-white p-5 rounded-lg shadow-md">
                          <p className="text-sm text-gray-600 mb-1">Estimated Monthly CRSC</p>
                          <p className="text-3xl font-black text-green-700">${getDisabilityPay(crscData.disabilityPercentage).toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-5 rounded-lg shadow-md">
                          <p className="text-sm text-gray-600 mb-1">Branch</p>
                          <p className="text-xl font-bold text-gray-900">{crscData.branchOfService}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const guideContent = `
═══════════════════════════════════════════════════════════════
  CRSC APPLICATION GUIDE - PERSONALIZED FOR YOU
  Generated: ${new Date().toLocaleDateString()} via rallyforge
═══════════════════════════════════════════════════════════════

VETERAN INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Branch of Service: ${crscData.branchOfService}
Years of Service: ${crscData.yearsOfService}
VA Disability Rating: ${crscData.disabilityPercentage}%
Injury Date: ${crscData.injuryDate || 'Not provided'}
Deployment Info: ${crscData.deploymentInfo || 'Not provided'}

ESTIMATED BENEFIT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Monthly CRSC Payment: $${getDisabilityPay(crscData.disabilityPercentage).toFixed(2)} (TAX-FREE)
Annual CRSC Payment: $${(getDisabilityPay(crscData.disabilityPercentage) * 12).toFixed(2)} (TAX-FREE)

REQUIRED DOCUMENTS CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ DD Form 2860 (Application for CRSC) - PRIMARY FORM
□ DD Form 214 (Discharge papers - must show honorable discharge)
□ VA Rating Decision Letter (shows current disability rating)
□ Medical records linking disability to combat
□ Deployment orders and combat documentation
□ Purple Heart or combat award documentation (if applicable)
□ Service treatment records (STRs)
□ Unit records or after-action reports (if available)

WHERE TO GET FORMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• DD Form 2860: https://www.esd.whs.mil/DD/
• DD Form 214: Request from NPRC (archives.gov) or use eVetRecs
• VA Rating Letter: VA.gov or call 1-800-827-1000

MAILING ADDRESS FOR ${crscData.branchOfService}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${
  crscData.branchOfService === 'Army'
    ? `Department of the Army
U.S. Army Physical Disability Agency
CRSC Team
200 Stovall Street, Room 5S82
Alexandria, VA 22332-0470`
    : crscData.branchOfService === 'Navy'
    ? `Secretary of the Navy Council of Review Boards
Attn: Combat-Related Special Compensation Branch
720 Kennon Street SE, Suite 309
Washington Navy Yard, DC 20374-5023`
    : crscData.branchOfService === 'Air Force'
    ? `AFPC/DPFDC
550 C Street West, Suite 6
Randolph AFB, TX 78150-4708`
    : crscData.branchOfService === 'Marine Corps'
    ? `Headquarters U.S. Marine Corps
Personnel Management Support Branch (MMSB-17)
3280 Russell Road
Quantico, VA 22134-5103`
    : `Contact your branch's personnel office for mailing address
Call DFAS: 1-800-321-1080`
}

FILING INSTRUCTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Download and complete DD Form 2860
2. Gather ALL required supporting documents (see checklist above)
3. Make COPIES of everything (keep originals for your records)
4. Write a personal statement explaining how your disability is combat-related
5. Mail complete package to address above (use certified mail with tracking)
6. Keep tracking number and delivery confirmation
7. Expect acknowledgment letter in 4-6 weeks
8. Full decision in 6-12 months

WHAT TO INCLUDE IN YOUR PERSONAL STATEMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• When and where you deployed
• Specific combat incident(s) that caused your disability
• How the injury occurred (IED, enemy fire, training accident in combat zone, etc.)
• Any awards received (Purple Heart, CAB, CIB, CAR, etc.)
• Link between the combat event and your current VA-rated disability
• Supporting witness statements (battle buddies, commanders, medics)

CRSC vs CRDP DECISION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ CRSC is best for you if:
  - Your disability rating is below 50%, OR
  - You want tax-free payments, OR
  - Your disability is clearly combat-related

✓ CRDP is best for you if:
  - You have 50%+ rating AND 20+ years of service
  - You want automatic approval (no application needed)
  - Amount is higher than CRSC

Note: You CANNOT receive both. Choose the option with the higher benefit.

PROCESSING TIMELINE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Initial Review: 4-6 weeks (acknowledgment letter)
• Full Processing: 6-12 months
• Decision Letter: Mailed to your address on file
• If Approved: Retroactive pay to application date

IMPORTANT REMINDERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRSC is TAX-FREE (unlike retirement pay)
⚠️ CRSC does NOT reduce your VA disability compensation
⚠️ If denied, you can appeal or reapply with more evidence
⚠️ Get help from a Veterans Service Officer (VSO) - it's FREE
⚠️ Keep all correspondence from the military

NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• DFAS Help Line: 1-800-321-1080
• VA Help Line: 1-800-827-1000
• Find a VSO: va.gov/vso
• Military OneSource: 1-800-342-9647
• Wounded Warrior Project: woundedwarriorproject.org

═══════════════════════════════════════════════════════════════
This guide is for educational purposes only and does not
constitute legal or financial advice. Contact a Veterans Service
Officer (VSO) or base legal assistance office for help.
═══════════════════════════════════════════════════════════════
`;
                          const blob = new Blob([guideContent], { type: 'text/plain; charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `CRSC_Application_Guide_${new Date().getTime()}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="w-full px-8 py-5 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-green-800 shadow-xl transition-all flex items-center justify-center gap-4"
                      >
                        <span className="text-3xl">📄</span>
                        <span>Download Your CRSC Application Guide</span>
                      </button>

                      <p className="text-sm text-gray-600 mt-4 text-center">
                        This personalized guide includes your information, required documents, forms, and complete filing instructions.
                      </p>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-lg">
                      <p className="font-semibold text-yellow-900 mb-2">💡 Pro Tips for Success</p>
                      <ul className="text-sm text-yellow-800 space-y-2">
                        <li>• <strong>Get VSO Help:</strong> Veterans Service Officers can help you file for FREE (find one at va.gov/vso)</li>
                        <li>• <strong>Be Specific:</strong> The more detailed your combat documentation, the better your chances</li>
                        <li>• <strong>Purple Heart = Strong Evidence:</strong> If you have a Purple Heart, include that documentation</li>
                        <li>• <strong>Buddy Statements:</strong> Get statements from fellow service members who witnessed the injury</li>
                        <li>• <strong>Keep Copies:</strong> Make copies of EVERYTHING before mailing</li>
                        <li>• <strong>Use Certified Mail:</strong> Always use tracking to confirm delivery</li>
                        <li>• <strong>Follow Up:</strong> Call DFAS after 6-8 weeks to confirm receipt</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg">
                      <p className="font-semibold text-red-900 mb-2">⚠️ Common Mistakes to Avoid</p>
                      <ul className="text-sm text-red-800 space-y-1">
                        <li>• ❌ Incomplete application (missing required documents)</li>
                        <li>• ❌ Vague combat description (be specific about when, where, how)</li>
                        <li>• ❌ Not explaining link between combat and disability</li>
                        <li>• ❌ Missing signatures or dates on forms</li>
                        <li>• ❌ Sending originals instead of copies</li>
                        <li>• ❌ Not keeping records of what you sent</li>
                      </ul>
                    </div>

                    <div className="flex justify-between pt-6 border-t">
                      <button
                        onClick={() => setCrscWizardStep(3)}
                        className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => {
                          setCrscWizardStep(1);
                          setCrscData({
                            hasRetirementPay: false,
                            isMedicallyRetired: false,
                            hasDisabilityRating: false,
                            disabilityIsCombatRelated: false,
                            disabilityPercentage: 0,
                            yearsOfService: 0,
                            hasMedicalDocumentation: false,
                            injuryDate: '',
                            deploymentInfo: '',
                            branchOfService: 'Army'
                          });
                        }}
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Start New Application
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Overview Section */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-600 p-6 rounded-lg mb-8">
                <h3 className="font-bold text-orange-900 text-xl mb-3">🇺🇸 What is CRSC?</h3>
                <p className="text-gray-800 mb-3">
                  <strong>Combat-Related Special Compensation (CRSC)</strong> is a <strong>Department of Defense (DOD)</strong> benefit that provides tax-free monthly payments to military retirees with combat-related disabilities. This benefit is separate from VA disability compensation.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="font-semibold text-orange-900 mb-2">✓ Key Benefits</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• 100% Tax-Free (unlike retirement pay)</li>
                      <li>• Restores retirement pay offset by VA disability</li>
                      <li>• No reduction to VA disability compensation</li>
                      <li>• Covers combat-related disabilities only</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="font-semibold text-orange-900 mb-2">⚠️ Important Notes</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• CRSC vs CRDP: Cannot receive both</li>
                      <li>• Must apply (not automatic like CRDP)</li>
                      <li>• Requires proof of combat-related injury</li>
                      <li>• Processing time: 6-12 months</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CRSC vs CRDP Comparison */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-8">
                <h3 className="font-bold text-blue-900 text-lg mb-4">🔄 CRSC vs CRDP: Which One Is Right for You?</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-orange-400">
                    <h4 className="font-bold text-orange-900 mb-2">CRSC (Combat-Related Special Compensation)</h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li><strong>Eligibility:</strong> Any retiree with 10%+ combat-related disability</li>
                      <li><strong>Rating Required:</strong> 10% or higher (any percentage)</li>
                      <li><strong>Service Required:</strong> Military retiree (20+ years or medical retirement)</li>
                      <li><strong>Tax Status:</strong> 100% Tax-Free</li>
                      <li><strong>Application:</strong> Must apply with documentation</li>
                      <li><strong>Best For:</strong> Veterans with &lt;50% rating OR combat-specific disabilities</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-400">
                    <h4 className="font-bold text-blue-900 mb-2">CRDP (Concurrent Retirement and Disability Pay)</h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li><strong>Eligibility:</strong> 20+ years of service AND 50%+ VA rating</li>
                      <li><strong>Rating Required:</strong> 50% or higher (only)</li>
                      <li><strong>Service Required:</strong> 20+ years of active service</li>
                      <li><strong>Tax Status:</strong> Partially taxable (like regular retirement pay)</li>
                      <li><strong>Application:</strong> Automatic (DFAS applies it for you)</li>
                      <li><strong>Best For:</strong> Veterans with 50%+ rating and 20+ years</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="text-sm font-semibold text-yellow-900">💡 Decision Guide:</p>
                  <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                    <li>• If you have <strong>50%+ rating and 20+ years</strong>: CRDP is automatic and usually higher (but taxable)</li>
                    <li>• If you have <strong>&lt;50% rating</strong>: Apply for CRSC (tax-free, but requires combat-related proof)</li>
                    <li>• If you qualify for both: Compare amounts and choose higher benefit (DFAS will help)</li>
                  </ul>
                </div>
              </div>

              {/* Additional Resources */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Additional CRSC Resources</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Official Resources</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• DFAS CRSC: <a href="https://www.dfas.mil/RetiredMilitary/disability/crsc/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">dfas.mil/crsc</a></li>
                      <li>• DD Forms: <a href="https://www.esd.whs.mil/DD/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">esd.whs.mil/DD</a></li>
                      <li>• DFAS Helpline: 1-800-321-1080</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Get Free Help</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Find a VSO: <a href="https://www.va.gov/vso/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">va.gov/vso</a></li>
                      <li>• DAV: <a href="https://www.dav.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">dav.org</a></li>
                      <li>• VFW: <a href="https://www.vfw.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">vfw.org</a></li>
                      <li>• American Legion: <a href="https://www.legion.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">legion.org</a></li>
                    </ul>
                  </div>
                </div>
              </div>
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
                <h3 className="text-xl font-bold mb-4">Select Your State</h3>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                  aria-label="Select your state for benefits information"
                  title="Select State"
                >
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
                <strong>rallyforge Benefits Education Center</strong> is an advisory and educational platform only.
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

