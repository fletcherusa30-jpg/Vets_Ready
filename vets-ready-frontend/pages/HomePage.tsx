import React from 'react'

export const HomePage: React.FC = () => {
  return (
    <div className="vetsready-home">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to Vets Ready</h1>
          <p className="text-2xl text-blue-100 mb-8">
            The ultimate veteran-first platform for benefits, claims readiness, transition support, and life planning
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/benefits" className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
              Explore Benefits
            </a>
            <a href="/claims" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
              Start Claims Journey
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Modules</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Benefits */}
          <a href="/benefits" className="group">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-8 h-full">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-900">Benefits Navigator</h3>
              <p className="text-gray-600">Explore VBA and state-by-state benefits. Filter by state, benefit type, and your service.</p>
            </div>
          </a>

          {/* Claims */}
          <a href="/claims" className="group">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-8 h-full">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-900">Claims Readiness</h3>
              <p className="text-gray-600">Prepare for your VA claim with evidence mapping, rating education, and C&P exam prep.</p>
            </div>
          </a>

          {/* Transition */}
          <a href="/transition" className="group">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-8 h-full">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-900">Transition Center</h3>
              <p className="text-gray-600">Plan your transition with checklists, MOS translator, resume builder, and documents.</p>
            </div>
          </a>

          {/* Finance */}
          <a href="/finance" className="group">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-8 h-full">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-900">Finance & Retirement</h3>
              <p className="text-gray-600">Plan your financial future with budget calculator, retirement scenarios, and TSP modeling.</p>
            </div>
          </a>

          {/* Jobs */}
          <a href="/jobs-business" className="group">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-8 h-full">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-900">Jobs & Business</h3>
              <p className="text-gray-600">Find veteran-friendly employers, veteran-owned business directory, and business resources.</p>
            </div>
          </a>

          {/* Resources */}
          <a href="/resources" className="group">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-8 h-full">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-900">Resource Hub</h3>
              <p className="text-gray-600">Access federal resources, state guides, official forms, and educational explainers.</p>
            </div>
          </a>
        </div>
      </section>

      {/* Why Vets Ready Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Vets Ready?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold mb-2">Veteran-First</h3>
              <p className="text-gray-600">Built by veterans, for veterans. Low-cost tools and free education.</p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold mb-2">Comprehensive</h3>
              <p className="text-gray-600">All the tools you need in one platform. From benefits to business.</p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold mb-2">Trustworthy</h3>
              <p className="text-gray-600">No legal advice. No claim filing. Pure education and preparation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">Explore the module that matters most to you right now.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/benefits" className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
              Benefits
            </a>
            <a href="/claims" className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
              Claims
            </a>
            <a href="/transition" className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
              Transition
            </a>
            <a href="/finance" className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
              Finance
            </a>
            <a href="/partners" className="bg-transparent text-white px-8 py-3 rounded-lg font-bold border border-white hover:bg-white hover:text-blue-900 transition">
              For Partners
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
