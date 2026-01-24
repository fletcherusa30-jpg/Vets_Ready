import React from 'react'

export const JobsBusinessPage: React.FC = () => {
  return (
    <div className="vetsready-jobs-business">
      <section className="bg-gradient-to-r from-cyan-900 to-cyan-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Vets Ready Jobs & Business</h1>
          <p className="text-xl text-cyan-100">Connect with veteran-friendly employers and discover business opportunities.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-cyan-900">
            <h2 className="text-2xl font-bold mb-4">💼 Job Board</h2>
            <p className="text-gray-600 mb-6">Discover veteran-friendly employers with matching algorithms.</p>
            <a href="#" className="bg-cyan-900 text-white px-6 py-2 rounded font-bold hover:bg-cyan-800">
              Browse Jobs
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-cyan-900">
            <h2 className="text-2xl font-bold mb-4">🏢 Veteran-Owned Businesses</h2>
            <p className="text-gray-600 mb-6">Support and connect with veteran entrepreneurs.</p>
            <a href="#" className="bg-cyan-900 text-white px-6 py-2 rounded font-bold hover:bg-cyan-800">
              Explore Businesses
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-cyan-900">
            <h2 className="text-2xl font-bold mb-4">🤝 Veteran-Friendly Directory</h2>
            <p className="text-gray-600 mb-6">Find businesses offering veteran discounts and hiring programs.</p>
            <a href="#" className="bg-cyan-900 text-white px-6 py-2 rounded font-bold hover:bg-cyan-800">
              Find Discounts
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-cyan-900">
            <h2 className="text-2xl font-bold mb-4">📊 Employer Dashboard</h2>
            <p className="text-gray-600 mb-6">For employers: Reach veteran talent and post opportunities.</p>
            <a href="#" className="bg-cyan-900 text-white px-6 py-2 rounded font-bold hover:bg-cyan-800">
              For Employers
            </a>
          </div>
        </div>

        <div className="mt-16 bg-cyan-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-6 text-cyan-900">Why Post on Vets Ready?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl mb-2">🎖️</div>
              <h4 className="font-bold mb-2">Veteran Talent</h4>
              <p className="text-gray-600 text-sm">Access a pool of trained, disciplined professionals ready to contribute.</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💡</div>
              <h4 className="font-bold mb-2">Mission Alignment</h4>
              <p className="text-gray-600 text-sm">Attract mission-driven candidates who value service and integrity.</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📈</div>
              <h4 className="font-bold mb-2">Business Growth</h4>
              <p className="text-gray-600 text-sm">Affordable, targeted job posting and partnership opportunities.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
