import React from 'react'

export const ResourcesPage: React.FC = () => {
  return (
    <div className="rallyforge-resources">
      <section className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Rally Forge Resource Hub</h1>
          <p className="text-xl text-indigo-100">Centralized access to federal resources, state guides, and official forms.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-indigo-900">
            <h2 className="text-2xl font-bold mb-4">🏛️ Federal Resources</h2>
            <p className="text-gray-600 mb-6">VA.gov resources, guides, and official documentation.</p>
            <a href="#" className="bg-indigo-900 text-white px-6 py-2 rounded font-bold hover:bg-indigo-800">
              Explore Federal
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-indigo-900">
            <h2 className="text-2xl font-bold mb-4">🗺️ State Resources</h2>
            <p className="text-gray-600 mb-6">State-specific veterans resources and programs.</p>
            <a href="#" className="bg-indigo-900 text-white px-6 py-2 rounded font-bold hover:bg-indigo-800">
              Explore States
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-indigo-900">
            <h2 className="text-2xl font-bold mb-4">📋 Official Forms</h2>
            <p className="text-gray-600 mb-6">Direct links to VA forms (we don't host them).</p>
            <a href="#" className="bg-indigo-900 text-white px-6 py-2 rounded font-bold hover:bg-indigo-800">
              Browse Forms
            </a>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-6 text-indigo-900">Featured Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Health & Benefits', icon: '🏥', count: '45 resources' },
              { title: 'Education & Training', icon: '🎓', count: '32 resources' },
              { title: 'Housing & Loans', icon: '🏠', count: '28 resources' },
              { title: 'Employment Support', icon: '💼', count: '36 resources' },
              { title: 'Mental Health', icon: '🧠', count: '22 resources' },
              { title: 'Disability Support', icon: '♿', count: '18 resources' },
            ].map((topic, idx) => (
              <a key={idx} href="#" className="group">
                <div className="bg-white rounded p-6 hover:shadow-lg transition">
                  <div className="text-4xl mb-2">{topic.icon}</div>
                  <h4 className="font-bold mb-2 group-hover:text-indigo-900">{topic.title}</h4>
                  <p className="text-sm text-gray-600">{topic.count}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-xl font-bold mb-4">📚 Guides & Explainers</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-indigo-900 hover:underline">What is a Disability Rating?</a></li>
              <li><a href="#" className="text-indigo-900 hover:underline">Understanding Service Connection</a></li>
              <li><a href="#" className="text-indigo-900 hover:underline">VA Claims Process Overview</a></li>
              <li><a href="#" className="text-indigo-900 hover:underline">Veteran Preference Explained</a></li>
              <li><a href="#" className="text-indigo-900 hover:underline">GI Bill Benefits Breakdown</a></li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-xl font-bold mb-4">🔗 Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="https://www.va.gov" target="_blank" rel="noopener noreferrer" className="text-indigo-900 hover:underline">VA.gov →</a></li>
              <li><a href="https://www.benefits.va.gov" target="_blank" rel="noopener noreferrer" className="text-indigo-900 hover:underline">VA Benefits →</a></li>
              <li><a href="https://www.myhealth.va.gov" target="_blank" rel="noopener noreferrer" className="text-indigo-900 hover:underline">My HealtheVet →</a></li>
              <li><a href="https://www.va.gov/disability" target="_blank" rel="noopener noreferrer" className="text-indigo-900 hover:underline">Disability Benefits →</a></li>
              <li><a href="https://www.ebenefits.va.gov" target="_blank" rel="noopener noreferrer" className="text-indigo-900 hover:underline">eBenefits →</a></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}


