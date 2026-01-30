import React from 'react'

export const ClaimsPage: React.FC = () => {
  return (
    <div className="rallyforge-claims">
      <section className="bg-gradient-to-r from-orange-900 to-orange-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Rally Forge Claims Readiness</h1>
          <p className="text-xl text-orange-100">Prepare, educate, and organize. Not a VSO. Not legal advice.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-orange-900">
            <h2 className="text-2xl font-bold mb-4">📋 Claim Readiness Checklist</h2>
            <p className="text-gray-600 mb-4">Create and track your claim preparation journey.</p>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>✓ Organize your conditions</li>
              <li>✓ Gather evidence</li>
              <li>✓ Document service connections</li>
              <li>✓ Track progress</li>
            </ul>
            <a href="#" className="bg-orange-900 text-white px-6 py-2 rounded font-bold hover:bg-orange-800">
              Start Checklist
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-orange-900">
            <h2 className="text-2xl font-bold mb-4">🎓 Rating Education</h2>
            <p className="text-gray-600 mb-4">Understand the VA rating system and CFR Part 4.</p>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>✓ How ratings are determined</li>
              <li>✓ Example conditions and ratings</li>
              <li>✓ Combined rating calculator</li>
              <li>✓ Effective dates explained</li>
            </ul>
            <a href="#" className="bg-orange-900 text-white px-6 py-2 rounded font-bold hover:bg-orange-800">
              Learn Ratings
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-orange-900">
            <h2 className="text-2xl font-bold mb-4">📸 Evidence Mapping</h2>
            <p className="text-gray-600 mb-4">Understand what evidence supports service connections.</p>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>✓ Lay evidence basics</li>
              <li>✓ Medical evidence needed</li>
              <li>✓ DBQ forms explained</li>
              <li>✓ Buddy statements & SEP</li>
            </ul>
            <a href="#" className="bg-orange-900 text-white px-6 py-2 rounded font-bold hover:bg-orange-800">
              Map Evidence
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-orange-900">
            <h2 className="text-2xl font-bold mb-4">🏥 C&P Exam Prep</h2>
            <p className="text-gray-600 mb-4">Educational preparation for Compensation & Pension exams.</p>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>✓ What to expect at the exam</li>
              <li>✓ Questions they may ask</li>
              <li>✓ How to present your case</li>
              <li>✓ Common mistakes to avoid</li>
            </ul>
            <a href="#" className="bg-orange-900 text-white px-6 py-2 rounded font-bold hover:bg-orange-800">
              Prepare
            </a>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-8">
          <h3 className="text-lg font-bold text-orange-900 mb-2">⚠️ Important Disclaimer</h3>
          <p className="text-gray-700">
            Rally Forge provides education and preparation tools only. We do not:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
            <li>File claims or represent you as a VSO or attorney</li>
            <li>Provide legal or medical advice</li>
            <li>Guarantee claim outcomes</li>
            <li>Represent you before the VA</li>
          </ul>
          <p className="mt-4 text-gray-700">
            For claim filing or representation, work with an accredited VSO, attorney, or agent.
          </p>
        </div>
      </section>
    </div>
  )
}


