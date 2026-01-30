import React from 'react'

export const FinancePage: React.FC = () => {
  return (
    <div className="rallyforge-finance">
      <section className="bg-gradient-to-r from-emerald-900 to-emerald-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Rally Forge Finance & Retirement</h1>
          <p className="text-xl text-emerald-100">Plan your financial future and retirement with confidence.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-emerald-900">
            <h2 className="text-2xl font-bold mb-4">💵 Budget Planner</h2>
            <p className="text-gray-600 mb-6">Track income, expenses, and plan your monthly budget.</p>
            <a href="#" className="bg-emerald-900 text-white px-6 py-2 rounded font-bold hover:bg-emerald-800">
              Plan Budget
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-emerald-900">
            <h2 className="text-2xl font-bold mb-4">📈 Retirement Calculator</h2>
            <p className="text-gray-600 mb-6">Model your retirement with VA benefits, TSP, pension, and Social Security.</p>
            <a href="#" className="bg-emerald-900 text-white px-6 py-2 rounded font-bold hover:bg-emerald-800">
              Calculate Retirement
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-emerald-900">
            <h2 className="text-2xl font-bold mb-4">📊 TSP Modeling</h2>
            <p className="text-gray-600 mb-6">Analyze TSP fund allocations and growth projections.</p>
            <a href="#" className="bg-emerald-900 text-white px-6 py-2 rounded font-bold hover:bg-emerald-800">
              Model TSP
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-emerald-900">
            <h2 className="text-2xl font-bold mb-4">🎯 Scenario Engine</h2>
            <p className="text-gray-600 mb-6">Compare multiple what-if scenarios (100% P&T, work, retire early).</p>
            <a href="#" className="bg-emerald-900 text-white px-6 py-2 rounded font-bold hover:bg-emerald-800">
              Run Scenarios
            </a>
          </div>
        </div>

        <div className="mt-16 bg-emerald-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4 text-emerald-900">Income Stacking</h3>
          <p className="text-gray-600 mb-6">Rally Forge helps you understand how these income sources work together:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded p-4 border-l-4 border-emerald-900">
              <h4 className="font-bold text-emerald-900">VA Benefits</h4>
              <p className="text-sm text-gray-600">Disability, pension, education</p>
            </div>
            <div className="bg-white rounded p-4 border-l-4 border-emerald-900">
              <h4 className="font-bold text-emerald-900">TSP/401k</h4>
              <p className="text-sm text-gray-600">Military savings accounts</p>
            </div>
            <div className="bg-white rounded p-4 border-l-4 border-emerald-900">
              <h4 className="font-bold text-emerald-900">Pension</h4>
              <p className="text-sm text-gray-600">Military retirement pay</p>
            </div>
            <div className="bg-white rounded p-4 border-l-4 border-emerald-900">
              <h4 className="font-bold text-emerald-900">Social Security</h4>
              <p className="text-sm text-gray-600">Future retirement benefits</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


