import React, { useState } from 'react'
import api from '../services/api'

interface Condition {
  id: string
  code: string
  name: string
  disability_rating_default: number
}

interface MedicalEvidence {
  diagnoses: string[]
  treatments: string[]
  medications: string[]
  hospitalizations: string[]
  severity_notes?: string
}

interface AnalysisResult {
  condition_ratings: Array<{
    code: string
    name: string
    rating: number
    justification: string
  }>
  combined_rating: number
  recommendations: string[]
  next_steps: string[]
}

export const ClaimsAnalyzer: React.FC = () => {
  const [conditions, setConditions] = useState<Condition[]>([])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [claimTitle, setClaimTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [medicalEvidence, setMedicalEvidence] = useState<MedicalEvidence>({
    diagnoses: [],
    treatments: [],
    medications: [],
    hospitalizations: [],
    severity_notes: '',
  })

  React.useEffect(() => {
    // Load conditions on mount
    loadConditions()
  }, [])

  const loadConditions = async () => {
    try {
      const response = await api.get('/conditions')
      setConditions(response.data)
    } catch (err) {
      console.error('Failed to load conditions:', err)
      setError('Failed to load conditions')
    }
  }

  const toggleCondition = (code: string) => {
    setSelectedConditions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!claimTitle.trim()) {
      setError('Claim title is required')
      return
    }

    if (selectedConditions.length === 0) {
      setError('Please select at least one condition')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setAnalysisResult(null)

      const response = await api.post('/claims/analyze', {
        title: claimTitle,
        condition_codes: selectedConditions,
        medical_evidence: medicalEvidence,
      })

      setAnalysisResult(response.data)
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Analysis failed'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Claims Analyzer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Claim Title */}
            <div>
              <label className="block text-sm font-medium mb-1">Claim Title</label>
              <input
                type="text"
                value={claimTitle}
                onChange={(e) => setClaimTitle(e.target.value)}
                placeholder="e.g., PTSD and Depression"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Conditions */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Conditions</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {conditions.map((cond) => (
                  <label key={cond.code} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedConditions.includes(cond.code)}
                      onChange={() => toggleCondition(cond.code)}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {cond.name} ({cond.code}) - Default Rating: {cond.disability_rating_default}%
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Medical Evidence */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Medical Evidence</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block font-medium mb-1">Diagnoses (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="PTSD, Depression, TBI"
                    className="w-full px-3 py-2 border rounded-lg"
                    onChange={(e) =>
                      setMedicalEvidence({
                        ...medicalEvidence,
                        diagnoses: e.target.value.split(',').map((d) => d.trim()),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Treatments</label>
                  <input
                    type="text"
                    placeholder="VA hospital therapy, Counseling"
                    className="w-full px-3 py-2 border rounded-lg"
                    onChange={(e) =>
                      setMedicalEvidence({
                        ...medicalEvidence,
                        treatments: e.target.value.split(',').map((t) => t.trim()),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Medications</label>
                  <input
                    type="text"
                    placeholder="Sertraline, Prazosin"
                    className="w-full px-3 py-2 border rounded-lg"
                    onChange={(e) =>
                      setMedicalEvidence({
                        ...medicalEvidence,
                        medications: e.target.value.split(',').map((m) => m.trim()),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Severity Notes</label>
                  <textarea
                    placeholder="Service-connected condition verified, Severe symptoms..."
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    onChange={(e) =>
                      setMedicalEvidence({
                        ...medicalEvidence,
                        severity_notes: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Errors */}
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Analyzing...' : 'Analyze Claim'}
            </button>
          </form>
        </div>

        {/* Results */}
        {analysisResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>

            {/* Combined Rating */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-gray-600">Combined Disability Rating</p>
              <p className="text-4xl font-bold text-blue-600">{analysisResult.combined_rating}%</p>
            </div>

            {/* Condition Ratings */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Condition Ratings</h3>
              <div className="space-y-2">
                {analysisResult.condition_ratings.map((rating) => (
                  <div key={rating.code} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{rating.name}</span>
                      <span className="text-lg font-bold text-blue-600">{rating.rating}%</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{rating.justification}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Recommendations</h3>
              <ul className="space-y-1 text-sm">
                {analysisResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Steps */}
            <div>
              <h3 className="font-semibold mb-2">Next Steps</h3>
              <ol className="space-y-1 text-sm list-decimal list-inside">
                {analysisResult.next_steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClaimsAnalyzer
