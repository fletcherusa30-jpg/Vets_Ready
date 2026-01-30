import React from 'react'
import { DocumentScanner } from '../src/components/DocumentScanner'

export const TransitionPage: React.FC = () => {
  return (
    <div className="rallyforge-transition">
      <section className="bg-gradient-to-r from-purple-900 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Rally Forge Transition Center</h1>
          <p className="text-xl text-purple-100">Plan your transition: 24 months before to 24 months after.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-purple-900">
            <h2 className="text-2xl font-bold mb-4">✅ Transition Checklist</h2>
            <p className="text-gray-600 mb-6">Interactive checklist covering all phases of transition.</p>
            <a href="#" className="bg-purple-900 text-white px-6 py-2 rounded font-bold hover:bg-purple-800">
              Open Checklist
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-purple-900">
            <h2 className="text-2xl font-bold mb-4">🔍 MOS to Civilian Translator</h2>
            <p className="text-gray-600 mb-6">Discover civilian career paths matching your military specialty.</p>
            <a href="#" className="bg-purple-900 text-white px-6 py-2 rounded font-bold hover:bg-purple-800">
              Translate MOS
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-purple-900">
            <h2 className="text-2xl font-bold mb-4">📄 Resume Builder</h2>
            <p className="text-gray-600 mb-6">Convert military experience into civilian-friendly resume language.</p>
            <a href="#" className="bg-purple-900 text-white px-6 py-2 rounded font-bold hover:bg-purple-800">
              Build Resume
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-purple-900">
            <h2 className="text-2xl font-bold mb-4">🗂️ Document Vault</h2>
            <p className="text-gray-600 mb-6">Scan and organize DD214, STRs, medical records, and transition documents.</p>
            <div className="mt-4">
              <DocumentScanner 
                onUploadComplete={(docId) => console.log('Document uploaded:', docId)}
              />
            </div>
          </div>
        </div>

        <div className="mt-16 bg-purple-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-6">Transition Timeline</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">-24</div>
                <div className="text-sm text-gray-600">Months Before</div>
              </div>
              <div className="flex-1 border-l-4 border-purple-900 pl-4">
                <h4 className="font-bold">Pre-Separation Phase</h4>
                <p className="text-gray-600 text-sm">TAP eligibility, begin preparation</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">0</div>
                <div className="text-sm text-gray-600">Separation Date</div>
              </div>
              <div className="flex-1 border-l-4 border-purple-900 pl-4">
                <h4 className="font-bold">Separation Phase</h4>
                <p className="text-gray-600 text-sm">Final processing, VA claims filing</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">+24</div>
                <div className="text-sm text-gray-600">Months After</div>
              </div>
              <div className="flex-1 border-l-4 border-purple-900 pl-4">
                <h4 className="font-bold">Post-Separation Phase</h4>
                <p className="text-gray-600 text-sm">Settlement, benefits receipt, career launch</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


