import React, { useState, useEffect } from 'react'

interface FederalBenefit {
  id: string
  name: string
  description: string
  eligibility: string
  link: string
}

interface StateBenefit {
  id: string
  state: string
  benefitType: string
  title: string
  description: string
  link: string
}

export const BenefitsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'federal' | 'state'>('federal')
  const [selectedState, setSelectedState] = useState<string>('AL')
  const [federalBenefits, setFederalBenefits] = useState<FederalBenefit[]>([])
  const [stateBenefits, setStateBenefits] = useState<StateBenefit[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBenefits()
  }, [activeTab, selectedState])

  const loadBenefits = async () => {
    setLoading(true)
    try {
      if (activeTab === 'federal') {
        const res = await fetch('/api/rallyforge/benefits/federal')
        const data = await res.json()
        setFederalBenefits(data || [])
      } else {
        const res = await fetch(`/api/rallyforge/benefits/state/${selectedState}`)
        const data = await res.json()
        setStateBenefits(data || [])
      }
    } catch (error) {
      console.error('Failed to load benefits:', error)
    } finally {
      setLoading(false)
    }
  }

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]

  return (
    <div className="rallyforge-benefits">
      {/* Hero */}
      <section className="bg-gradient-to-r from-green-900 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Rally Forge Benefits Navigator</h1>
          <p className="text-xl text-green-100">Explore federal VBA benefits and state-by-state programs.</p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('federal')}
            className={`py-4 px-6 font-bold transition ${
              activeTab === 'federal'
                ? 'text-green-900 border-b-2 border-green-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Federal Benefits (VBA)
          </button>
          <button
            onClick={() => setActiveTab('state')}
            className={`py-4 px-6 font-bold transition ${
              activeTab === 'state'
                ? 'text-green-900 border-b-2 border-green-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            State Benefits
          </button>
        </div>

        {/* Federal Benefits */}
        {activeTab === 'federal' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Federal VA Benefits</h2>
            {loading ? (
              <p>Loading benefits...</p>
            ) : federalBenefits.length > 0 ? (
              <div className="grid gap-6">
                {federalBenefits.map((benefit) => (
                  <div key={benefit.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-green-900">
                    <h3 className="text-xl font-bold mb-2">{benefit.name}</h3>
                    <p className="text-gray-600 mb-4">{benefit.description}</p>
                    <div className="bg-green-50 p-4 rounded mb-4">
                      <p className="text-sm text-gray-700"><strong>Eligibility:</strong> {benefit.eligibility}</p>
                    </div>
                    <a href={benefit.link} target="_blank" rel="noopener noreferrer" className="text-green-900 font-bold hover:underline">
                      Learn More →
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No federal benefits found. Loading seed data...</p>
            )}
          </div>
        )}

        {/* State Benefits */}
        {activeTab === 'state' && (
          <div>
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-2">Select State:</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="block w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900"
              >
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <h2 className="text-2xl font-bold mb-6">{selectedState} State Benefits</h2>
            {loading ? (
              <p>Loading benefits...</p>
            ) : stateBenefits.length > 0 ? (
              <div className="grid gap-6">
                {stateBenefits.map((benefit) => (
                  <div key={benefit.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-green-900">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold bg-green-100 text-green-900 px-3 py-1 rounded">
                        {benefit.benefitType}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 mb-4">{benefit.description}</p>
                    <a href={benefit.link} target="_blank" rel="noopener noreferrer" className="text-green-900 font-bold hover:underline">
                      Official Link →
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No state benefits found for {selectedState}.</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}


