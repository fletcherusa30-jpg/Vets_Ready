import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import { extractDD214Data, DD214ExtractedData } from '../services/DD214Scanner';

export const VeteranProfileSetup: React.FC = () => {
  const { profile, updateProfile } = useVeteranProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // DD-214 Upload State
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<DD214ExtractedData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // DD-214 Upload Handlers
  const handleFileUpload = async (file: File) => {
    setScanError(null);
    setIsScanning(true);

    try {
      const data = await extractDD214Data(file);
      setExtractedData(data);

      // Auto-populate profile fields from extracted data
      updateProfile({
        branch: data.branch,
        serviceStartDate: data.entryDate,
        serviceEndDate: data.separationDate,
        characterOfDischarge: data.characterOfService as any,
        separationCode: data.separationCode,
        narrativeReasonForSeparation: data.narrativeReasonForSeparation,
        rank: data.rank,
        hasCombatService: data.hasCombatService
      });

      setShowManualEntry(true); // Show fields so veteran can review/edit
    } catch (error) {
      setScanError('Failed to scan DD-214. Please try again or enter information manually.');
      console.error('DD-214 scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSaveAndContinue = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      updateProfile({ profileCompleted: true });
      navigate('/benefits');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Veteran Profile Setup</h2>
        <p className="text-gray-600 mb-4">Complete your profile once, and we'll automatically show you all benefits you qualify for</p>

        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-600">Step {step} of 5</span>
        </div>
      </div>

      {/* Step 1: Personal & Service Information */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Personal & Service Information</h3>

          {/* DD-214 Upload Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">📄 Upload DD-214 (Optional)</h4>
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showManualEntry ? 'Hide Manual Entry' : 'Show Manual Entry'}
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Upload your DD-214 for automatic extraction of service information, or enter manually below.
            </p>

            {/* Drag-and-Drop Upload Box */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload DD-214 file"
              />

              {isScanning ? (
                <div className="space-y-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-700 font-medium">Scanning DD-214...</p>
                  <p className="text-sm text-gray-500">This may take a moment</p>
                </div>
              ) : extractedData ? (
                <div className="space-y-3">
                  <div className="text-green-600 text-4xl">✓</div>
                  <p className="text-gray-900 font-semibold">DD-214 Scanned Successfully!</p>
                  <p className="text-sm text-gray-600">
                    {extractedData.extractedFields.length} fields extracted • Confidence: {extractedData.extractionConfidence}
                  </p>
                  <p className="text-xs text-gray-500">Review and edit the information below</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExtractedData(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Upload Different DD-214
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-gray-400 text-5xl">📄</div>
                  <div>
                    <p className="text-gray-900 font-semibold mb-1">Drag and drop your DD-214 here</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                  </div>
                  <p className="text-xs text-gray-400">Accepts PDF, JPG, PNG (max 10MB)</p>
                </div>
              )}
            </div>

            {/* Scan Error Message */}
            {scanError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">⚠️</span>
                  <div>
                    <p className="text-red-900 font-semibold">Scan Error</p>
                    <p className="text-sm text-red-700">{scanError}</p>
                    <button
                      onClick={() => setScanError(null)}
                      className="text-sm text-red-600 hover:text-red-700 underline mt-2"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Extraction Warnings */}
            {extractedData?.extractionLog && extractedData.extractionLog.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-900 font-semibold mb-2">⚠️ Please Review Extracted Data</p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {extractedData.extractionLog.slice(-3).map((log, idx) => (
                    <li key={idx}>• {log}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Data Privacy Notice */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Privacy:</strong> Your DD-214 file is processed locally and is NOT stored.
                Only the extracted information is saved to your profile. You can edit or delete it at any time.
              </p>
            </div>
          </div>

          {/* Manual Entry Fields (Always Available) */}
          {showManualEntry && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {extractedData ? '✏️ Review & Edit Information' : '✍️ Manual Entry'}
              </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">First Name</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => updateProfile({ firstName: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="John"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => updateProfile({ lastName: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="date-of-birth">Date of Birth</label>
              <input
                type="date"
                id="date-of-birth"
                name="date-of-birth"
                value={profile.dateOfBirth}
                onChange={(e) => updateProfile({ dateOfBirth: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="branch-select" className="block text-sm font-semibold text-gray-900 mb-2">Branch of Service</label>
              <select
                id="branch-select"
                value={profile.branch || ''}
                onChange={(e) => updateProfile({ branch: e.target.value as any })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="" disabled>Select your branch...</option>
                <option value="Army">Army</option>
                <option value="Navy">Navy</option>
                <option value="Air Force">Air Force</option>
                <option value="Marine Corps">Marine Corps</option>
                <option value="Coast Guard">Coast Guard</option>
                <option value="Space Force">Space Force</option>
                <option value="National Guard">National Guard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Years of Service</label>
              <input
                type="number"
                min="0"
                max="50"
                value={profile.yearsOfService}
                onChange={(e) => updateProfile({ yearsOfService: parseInt(e.target.value) || 0 })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Rank (at separation)</label>
              <input
                type="text"
                value={profile.rank}
                onChange={(e) => updateProfile({ rank: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="E-7, O-3, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Character of Discharge</label>
              <select
                value={profile.characterOfDischarge || ''}
                onChange={(e) => updateProfile({ characterOfDischarge: e.target.value as any })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="Honorable">Honorable</option>
                <option value="General Under Honorable Conditions">General Under Honorable Conditions</option>
                <option value="Other Than Honorable">Other Than Honorable</option>
                <option value="Bad Conduct">Bad Conduct</option>
                <option value="Dishonorable">Dishonorable</option>
              </select>
            </div>
          </div>

          {/* Discharge Upgrade CTA */}
          {profile.characterOfDischarge &&
           profile.characterOfDischarge !== 'Honorable' && (
            <div className="mt-6 p-6 bg-purple-50 border-2 border-purple-300 rounded-lg">
              <h4 className="font-bold text-purple-900 text-lg mb-2">📋 Need Help with Discharge Upgrade?</h4>
              <p className="text-gray-700 mb-4">
                Based on your discharge characterization, you may be eligible to apply for an upgrade.
                Our Discharge Upgrade Helper provides educational guidance on the process.
              </p>
              <button
                onClick={() => {
                  // Navigate to dashboard discharge-upgrade tab
                  window.location.href = '/dashboard?tab=discharge-upgrade';
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Access Discharge Upgrade Helper →
              </button>
            </div>
          )}

          </div>
          )}

          <div className="flex items-start gap-3 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <input
              type="checkbox"
              id="combat-service"
              name="combat-service"
              checked={profile.hasCombatService}
              onChange={(e) => updateProfile({ hasCombatService: e.target.checked })}
              className="w-5 h-5 text-blue-600 mt-1 rounded"
            />
            <label htmlFor="combat-service">
              <span className="font-semibold text-gray-900 block">I have combat or deployment service</span>
              <p className="text-sm text-gray-600">Check if you deployed to combat zone or have combat-related service</p>
            </label>
          </div>
        </div>
      )}

      {/* Step 2: Disability & VA Rating */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Disability & VA Rating</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="va-disability-rating">VA Disability Rating (%)</label>
            <input
              type="range"
              id="va-disability-rating"
              name="va-disability-rating"
              min="0"
              max="100"
              step="10"
              value={profile.vaDisabilityRating}
              onChange={(e) => updateProfile({ vaDisabilityRating: parseInt(e.target.value) })}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <div className="text-center mt-4">
              <div className="text-6xl font-black text-blue-600">{profile.vaDisabilityRating}%</div>
              <p className="text-sm text-gray-600 mt-2">Your current VA disability rating</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={profile.hasAidAndAttendanceNeeds}
                onChange={(e) => updateProfile({ hasAidAndAttendanceNeeds: e.target.checked })}
                className="w-5 h-5 text-blue-600 mt-1 rounded"
              />
              <div>
                <span className="font-semibold text-gray-900 block">Aid & Attendance Needs</span>
                <p className="text-sm text-gray-600">Require daily assistance with activities</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={profile.isHousebound}
                onChange={(e) => updateProfile({ isHousebound: e.target.checked })}
                className="w-5 h-5 text-blue-600 mt-1 rounded"
              />
              <div>
                <span className="font-semibold text-gray-900 block">Housebound</span>
                <p className="text-sm text-gray-600">Substantially confined to home</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={profile.hasLossOfUseOfLimb}
                onChange={(e) => updateProfile({ hasLossOfUseOfLimb: e.target.checked })}
                className="w-5 h-5 text-blue-600 mt-1 rounded"
              />
              <div>
                <span className="font-semibold text-gray-900 block">Loss of Use of Limb</span>
                <p className="text-sm text-gray-600">Loss or loss of use of extremity</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={profile.hasBlindness}
                onChange={(e) => updateProfile({ hasBlindness: e.target.checked })}
                className="w-5 h-5 text-blue-600 mt-1 rounded"
              />
              <div>
                <span className="font-semibold text-gray-900 block">Blindness</span>
                <p className="text-sm text-gray-600">Blindness in one or both eyes</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={profile.needsSpecialAdaptedHousing}
                onChange={(e) => updateProfile({ needsSpecialAdaptedHousing: e.target.checked })}
                className="w-5 h-5 text-blue-600 mt-1 rounded"
              />
              <div>
                <span className="font-semibold text-gray-900 block">Need Home Adaptations</span>
                <p className="text-sm text-gray-600">Wheelchair accessibility, ramps, etc.</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Step 3: Retirement Status */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Retirement Status</h3>

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={profile.isRetired}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateProfile({
                      isRetired: true,
                      isMedicallyRetired: false,
                      retirementStatus: '20+ retiree',
                      medicalRetirementYears: null,
                      hasRetirementPay: true,
                      receivesDoDRetirementPay: true
                    });
                  } else {
                    updateProfile({
                      isRetired: false,
                      retirementStatus: null,
                      hasRetirementPay: false,
                      receivesDoDRetirementPay: false
                    });
                  }
                }}
                className="w-5 h-5 text-blue-600 mt-1 rounded"
              />
              <div>
                <span className="font-semibold text-gray-900 block">I am a military retiree (20+ years)</span>
                <p className="text-sm text-gray-600">Retired after 20 or more years of service</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={profile.isMedicallyRetired}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateProfile({
                      isMedicallyRetired: true,
                      isRetired: false,
                      retirementStatus: 'medical retiree',
                      medicalRetirementYears: null
                    });
                  } else {
                    updateProfile({
                      isMedicallyRetired: false,
                      retirementStatus: null,
                      medicalRetirementYears: null,
                      hasRetirementPay: false,
                      receivesDoDRetirementPay: false
                    });
                  }
                }}
                className="w-5 h-5 text-blue-600 mt-1 rounded"
              />
              <div>
                <span className="font-semibold text-gray-900 block">I am medically retired</span>
                <p className="text-sm text-gray-600">Retired due to medical reasons</p>
              </div>
            </label>
          </div>

          {/* Medical Retirement Years Question */}
          {profile.isMedicallyRetired && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                How many years of service did you complete?
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                  <input
                    type="radio"
                    name="medical-years"
                    checked={profile.medicalRetirementYears === '20+'}
                    onChange={() => {
                      updateProfile({
                        medicalRetirementYears: '20+',
                        retirementStatus: '20+ retiree',
                        hasRetirementPay: true,
                        receivesDoDRetirementPay: true,
                        yearsOfService: 20
                      });
                    }}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 block">20 or more years</span>
                    <p className="text-xs text-gray-600">You receive DoD retirement pay</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                  <input
                    type="radio"
                    name="medical-years"
                    checked={profile.medicalRetirementYears === '<20'}
                    onChange={() => {
                      updateProfile({
                        medicalRetirementYears: '<20',
                        retirementStatus: 'medical <20 years',
                        hasRetirementPay: false,
                        receivesDoDRetirementPay: false,
                        retirementPayAmount: 0
                      });
                    }}
                    className="w-5 h-5 text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 block">Less than 20 years</span>
                    <p className="text-xs text-gray-600">No DoD retirement pay (may qualify for CRSC)</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Retirement Pay Field (Only for 20+ years) */}
          {((profile.isRetired) || (profile.isMedicallyRetired && profile.medicalRetirementYears === '20+')) && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Monthly Retirement Pay (before VA offset)</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  value={profile.retirementPayAmount}
                  onChange={(e) => updateProfile({ retirementPayAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="2500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">This helps us calculate CRSC and CRDP eligibility</p>
            </div>
          )}

          {/* CRSC Eligibility for <20 year medical retirees */}
          {profile.isMedicallyRetired && profile.medicalRetirementYears === '<20' && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">CRSC (Combat-Related Special Compensation)</h4>
              <p className="text-sm text-gray-700 mb-3">
                Medically retired veterans with fewer than 20 years of service do not receive DoD retirement pay.
                However, you may qualify for CRSC if your disability is combat-related.
              </p>

              <label className="flex items-start gap-3 p-3 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-yellow-400 transition-colors">
                <input
                  type="checkbox"
                  checked={profile.crscEligible}
                  onChange={(e) => updateProfile({ crscEligible: e.target.checked })}
                  className="w-5 h-5 text-yellow-600 mt-1 rounded"
                />
                <div>
                  <span className="font-semibold text-gray-900 block">I believe I may qualify for CRSC</span>
                  <p className="text-xs text-gray-600">Check this if your disability is combat-related</p>
                </div>
              </label>

              {profile.crscEligible && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-900">CRSC Qualification Indicators (check all that apply):</p>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={profile.crscCombatInjury}
                      onChange={(e) => updateProfile({ crscCombatInjury: e.target.checked })}
                      className="w-4 h-4 text-yellow-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Combat injury or wound</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={profile.crscCombatTraining}
                      onChange={(e) => updateProfile({ crscCombatTraining: e.target.checked })}
                      className="w-4 h-4 text-yellow-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Combat training accident</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={profile.crscHazardousDuty}
                      onChange={(e) => updateProfile({ crscHazardousDuty: e.target.checked })}
                      className="w-4 h-4 text-yellow-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Hazardous duty</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={profile.crscMentalHealthCombat}
                      onChange={(e) => updateProfile({ crscMentalHealthCombat: e.target.checked })}
                      className="w-4 h-4 text-yellow-600 rounded"
                    />
                    <span className="text-sm text-gray-700">PTSD or mental health from combat</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Dependents */}
      {step === 4 && (
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Dependent Information</h3>

          <div className="space-y-6">
            <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={profile.hasSpouse}
                onChange={(e) => updateProfile({ hasSpouse: e.target.checked, isMarried: e.target.checked })}
                className="w-5 h-5 text-blue-600 mt-1 rounded"
              />
              <div>
                <span className="font-semibold text-gray-900 block">I have a spouse</span>
                <p className="text-sm text-gray-600">Married with dependent spouse</p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Number of Dependent Children</label>
              <input
                type="number"
                min="0"
                max="20"
                value={profile.numberOfChildren}
                onChange={(e) => {
                  const children = parseInt(e.target.value) || 0;
                  updateProfile({
                    numberOfChildren: children,
                    numberOfDependents: children + (profile.hasSpouse ? 1 : 0)
                  });
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={profile.hasDependentParents}
                onChange={(e) => updateProfile({ hasDependentParents: e.target.checked })}
                className="w-5 h-5 text-blue-600 mt-1 rounded"
              />
              <div>
                <span className="font-semibold text-gray-900 block">I have dependent parent(s)</span>
                <p className="text-sm text-gray-600">Parent(s) who depend on you financially</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={profile.hasDependentsInSchool}
                onChange={(e) => updateProfile({ hasDependentsInSchool: e.target.checked })}
                className="w-5 h-5 text-blue-600 mt-1 rounded"
              />
              <div>
                <span className="font-semibold text-gray-900 block">I have dependents in school</span>
                <p className="text-sm text-gray-600">Spouse or children enrolled in education programs</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Review Your Profile</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">Personal Info</h4>
              <p className="text-sm text-gray-700"><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
              <p className="text-sm text-gray-700"><strong>Branch:</strong> {profile.branch}</p>
              <p className="text-sm text-gray-700"><strong>Years of Service:</strong> {profile.yearsOfService}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">Disability</h4>
              <p className="text-sm text-gray-700"><strong>VA Rating:</strong> {profile.vaDisabilityRating}%</p>
              <p className="text-sm text-gray-700"><strong>Aid & Attendance:</strong> {profile.hasAidAndAttendanceNeeds ? 'Yes' : 'No'}</p>
              <p className="text-sm text-gray-700"><strong>Housebound:</strong> {profile.isHousebound ? 'Yes' : 'No'}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">Retirement</h4>
              <p className="text-sm text-gray-700">
                <strong>Status:</strong> {
                  profile.isRetired ? '20+ Year Retiree' :
                  profile.isMedicallyRetired && profile.medicalRetirementYears === '20+' ? 'Medical Retiree (20+ years)' :
                  profile.isMedicallyRetired && profile.medicalRetirementYears === '<20' ? 'Medical Retiree (<20 years)' :
                  'Not Retired'
                }
              </p>
              <p className="text-sm text-gray-700">
                <strong>DoD Retirement Pay:</strong> {profile.receivesDoDRetirementPay ? 'Yes' : 'No'}
              </p>
              {profile.receivesDoDRetirementPay && profile.retirementPayAmount > 0 && (
                <p className="text-sm text-gray-700">
                  <strong>Monthly Amount:</strong> ${profile.retirementPayAmount.toFixed(2)}
                </p>
              )}
              {profile.crscEligible && (
                <p className="text-sm text-gray-700">
                  <strong>CRSC Eligible:</strong> Yes (combat-related)
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">Dependents</h4>
              <p className="text-sm text-gray-700"><strong>Spouse:</strong> {profile.hasSpouse ? 'Yes' : 'No'}</p>
              <p className="text-sm text-gray-700"><strong>Children:</strong> {profile.numberOfChildren}</p>
              <p className="text-sm text-gray-700"><strong>In School:</strong> {profile.hasDependentsInSchool ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-lg">
            <p className="font-bold text-green-900 text-lg mb-2">✓ Profile Complete!</p>
            <p className="text-sm text-green-800">
              We'll use this information to automatically show you all benefits you qualify for. You can update your profile anytime.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Previous
          </button>
        )}
        <button
          onClick={handleSaveAndContinue}
          className="ml-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-lg transition-colors"
        >
          {step === 5 ? 'Complete Profile →' : 'Continue →'}
        </button>
      </div>
    </div>
  );
};

export default VeteranProfileSetup;
