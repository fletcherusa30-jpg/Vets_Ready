import React, { useState, useEffect } from 'react';

interface ClaimResponse {
  id: string;
  user_id: string;
  title: string;
  combined_rating: number;
  created_at: string;
  updated_at: string;
}

interface DisabilityRating {
  code: string;
  name: string;
  rating: number;
  justification: string;
}

interface ClaimDetails extends ClaimResponse {
  condition_ratings: DisabilityRating[];
  recommendations: string[];
  next_steps: string[];
  analysis_timestamp: string;
}

interface MedicalEvidence {
  diagnoses: string[];
  treatments: string[];
  medications: string[];
  hospitalizations: string[];
  severity_notes?: string;
}

interface ClaimAnalysisRequest {
  title: string;
  condition_codes: string[];
  medical_evidence: MedicalEvidence;
}

export const ClaimsList: React.FC = () => {
  const [claims, setClaims] = useState<ClaimResponse[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ClaimDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewClaimForm, setShowNewClaimForm] = useState(false);

  // New claim form state
  const [newClaim, setNewClaim] = useState<ClaimAnalysisRequest>({
    title: '',
    condition_codes: [],
    medical_evidence: {
      diagnoses: [],
      treatments: [],
      medications: [],
      hospitalizations: [],
      severity_notes: '',
    },
  });

  // Fetch user's claims on component mount
  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your claims');
        return;
      }

      const response = await fetch('http://localhost:8000/api/claims', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          return;
        }
        throw new Error(`Failed to fetch claims: ${response.statusText}`);
      }

      const data = await response.json();
      setClaims(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load claims');
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClaimDetails = async (claimId: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/claims/${claimId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch claim details');
      }

      const data = await response.json();
      setSelectedClaim(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load claim details');
    } finally {
      setLoading(false);
    }
  };

  const submitNewClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to submit a claim');
        return;
      }

      const response = await fetch('http://localhost:8000/api/claims/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClaim),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit claim');
      }

      const createdClaim = await response.json();

      // Refresh claims list
      await fetchClaims();

      // Reset form
      setShowNewClaimForm(false);
      setNewClaim({
        title: '',
        condition_codes: [],
        medical_evidence: {
          diagnoses: [],
          treatments: [],
          medications: [],
          hospitalizations: [],
          severity_notes: '',
        },
      });

      // Show success message
      alert(`Claim "${createdClaim.title}" submitted successfully! Combined Rating: ${createdClaim.combined_rating}%`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit claim');
      console.error('Error submitting claim:', err);
    } finally {
      setLoading(false);
    }
  };

  const addDiagnosis = (diagnosis: string) => {
    if (diagnosis.trim()) {
      setNewClaim({
        ...newClaim,
        medical_evidence: {
          ...newClaim.medical_evidence,
          diagnoses: [...newClaim.medical_evidence.diagnoses, diagnosis.trim()],
        },
      });
    }
  };

  const addTreatment = (treatment: string) => {
    if (treatment.trim()) {
      setNewClaim({
        ...newClaim,
        medical_evidence: {
          ...newClaim.medical_evidence,
          treatments: [...newClaim.medical_evidence.treatments, treatment.trim()],
        },
      });
    }
  };

  const addMedication = (medication: string) => {
    if (medication.trim()) {
      setNewClaim({
        ...newClaim,
        medical_evidence: {
          ...newClaim.medical_evidence,
          medications: [...newClaim.medical_evidence.medications, medication.trim()],
        },
      });
    }
  };

  const addConditionCode = (code: string) => {
    if (code.trim() && !newClaim.condition_codes.includes(code.trim())) {
      setNewClaim({
        ...newClaim,
        condition_codes: [...newClaim.condition_codes, code.trim()],
      });
    }
  };

  if (loading && claims.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        <span className="ml-4 text-xl text-gray-600">Loading claims...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with New Claim Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-900">My Claims</h2>
        <button
          onClick={() => setShowNewClaimForm(!showNewClaimForm)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          {showNewClaimForm ? '✖ Cancel' : '➕ New Claim'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* New Claim Form */}
      {showNewClaimForm && (
        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-900 p-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-6">Submit New Claim</h3>
          <form onSubmit={submitNewClaim} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Claim Title *
              </label>
              <input
                type="text"
                value={newClaim.title}
                onChange={(e) => setNewClaim({ ...newClaim, title: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., PTSD and Depression Claim"
                required
              />
            </div>

            {/* Condition Codes */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Condition Codes * (e.g., F4310 for PTSD, F3229 for Depression)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  id="condition-code-input"
                  className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter condition code"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      addConditionCode(input.value);
                      input.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('condition-code-input') as HTMLInputElement;
                    addConditionCode(input.value);
                    input.value = '';
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newClaim.condition_codes.map((code, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                    {code}
                    <button
                      type="button"
                      onClick={() => setNewClaim({
                        ...newClaim,
                        condition_codes: newClaim.condition_codes.filter((_, i) => i !== idx)
                      })}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      ✖
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">Common codes: F4310 (PTSD), F3229 (Depression), S06 (TBI), H9311 (Tinnitus), G89.29 (Pain)</p>
            </div>

            {/* Diagnoses */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Diagnoses
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  id="diagnosis-input"
                  className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Add diagnosis"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('diagnosis-input') as HTMLInputElement;
                    addDiagnosis(input.value);
                    input.value = '';
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-1">
                {newClaim.medical_evidence.diagnoses.map((diagnosis, idx) => (
                  <li key={idx} className="text-gray-700">• {diagnosis}</li>
                ))}
              </ul>
            </div>

            {/* Treatments */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Treatments
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  id="treatment-input"
                  className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Add treatment"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('treatment-input') as HTMLInputElement;
                    addTreatment(input.value);
                    input.value = '';
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-1">
                {newClaim.medical_evidence.treatments.map((treatment, idx) => (
                  <li key={idx} className="text-gray-700">• {treatment}</li>
                ))}
              </ul>
            </div>

            {/* Medications */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Medications
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  id="medication-input"
                  className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Add medication"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('medication-input') as HTMLInputElement;
                    addMedication(input.value);
                    input.value = '';
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-1">
                {newClaim.medical_evidence.medications.map((medication, idx) => (
                  <li key={idx} className="text-gray-700">• {medication}</li>
                ))}
              </ul>
            </div>

            {/* Severity Notes */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Severity Notes
              </label>
              <textarea
                value={newClaim.medical_evidence.severity_notes}
                onChange={(e) => setNewClaim({
                  ...newClaim,
                  medical_evidence: {
                    ...newClaim.medical_evidence,
                    severity_notes: e.target.value
                  }
                })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                rows={4}
                placeholder="Describe the severity of your conditions and their impact on daily life..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !newClaim.title || newClaim.condition_codes.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                {loading ? 'Submitting...' : 'Submit Claim Analysis'}
              </button>
              <button
                type="button"
                onClick={() => setShowNewClaimForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Claims List */}
      {claims.length === 0 && !showNewClaimForm ? (
        <div className="bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg p-12 text-center">
          <p className="text-xl text-gray-600 mb-4">You haven't submitted any claims yet.</p>
          <button
            onClick={() => setShowNewClaimForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Submit Your First Claim
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white rounded-lg shadow-lg border-2 border-gray-300 hover:border-blue-500 p-6 transition cursor-pointer"
              onClick={() => fetchClaimDetails(claim.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-blue-900">{claim.title}</h3>
                  <p className="text-gray-600">Submitted: {new Date(claim.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{claim.combined_rating}%</div>
                  <p className="text-sm text-gray-600">Combined Rating</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Details Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedClaim(null)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-blue-900">{selectedClaim.title}</h2>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-gray-600 hover:text-gray-800 text-3xl font-bold"
              >
                ✖
              </button>
            </div>

            {/* Combined Rating */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold mb-2">Combined Disability Rating</h3>
              <p className="text-5xl font-bold">{selectedClaim.combined_rating}%</p>
            </div>

            {/* Condition Ratings */}
            {selectedClaim.condition_ratings && (
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Condition Ratings</h3>
                <div className="space-y-3">
                  {selectedClaim.condition_ratings.map((rating, idx) => (
                    <div key={idx} className="bg-gray-50 border-l-4 border-blue-600 p-4 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-lg">{rating.name} ({rating.code})</h4>
                        <span className="text-2xl font-bold text-blue-600">{rating.rating}%</span>
                      </div>
                      <p className="text-gray-700">{rating.justification}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedClaim.recommendations && selectedClaim.recommendations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Recommendations</h3>
                <ul className="space-y-2">
                  {selectedClaim.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            {selectedClaim.next_steps && selectedClaim.next_steps.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Next Steps</h3>
                <ul className="space-y-2">
                  {selectedClaim.next_steps.map((step, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-600 mr-2 font-bold">{idx + 1}.</span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedClaim(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-8 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
