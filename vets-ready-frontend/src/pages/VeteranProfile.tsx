import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import { extractDD214Data, DD214ExtractedData } from '../services/DD214Scanner';
import { BenefitsCounter } from '../components/BenefitsCounter';

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

  // Rating Narrative Upload State
  const [ratingNarrativeFile, setRatingNarrativeFile] = useState<File | null>(null);
  const [ratingNarrativeExtracting, setRatingNarrativeExtracting] = useState(false);
  const [ratingNarrativeData, setRatingNarrativeData] = useState<any>(null);
  const [editingConditionIndex, setEditingConditionIndex] = useState<number | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const ratingNarrativeRef = React.useRef<HTMLInputElement>(null);

  // Service Periods State
  const [showServicePeriods, setShowServicePeriods] = useState(false);
  const [editingPeriodIndex, setEditingPeriodIndex] = useState<number | null>(null);

  // Condition data structure with enhanced fields
  interface VACondition {
    name: string;
    rating: number;
    diagnosticCode?: string;
    effectiveDate?: string;
    bilateral?: boolean;
    original?: string; // Original extracted text
  }

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

  // Enhanced Rating Narrative Upload Handler with advanced extraction
  const handleRatingNarrativeUpload = async (file: File) => {
    setRatingNarrativeExtracting(true);
    setValidationWarnings([]);

    try {
      // Production Note: Replace FileReader with OCR service (Google Vision, Azure Computer Vision, AWS Textract)
      // This implementation demonstrates enhanced parsing capabilities
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;

        // Extract combined rating with multiple pattern matching
        const ratingPatterns = [
          /(?:Combined|Total|Overall)\s*(?:Service[- ]Connected)?\s*(?:Rating|Disability).*?(\d{1,3})%/i,
          /Combined\s*Rating.*?(\d{1,3})%/i,
          /Total.*?Rating.*?(\d{1,3})%/i
        ];
        let combinedRating: number | null = null;
        for (const pattern of ratingPatterns) {
          const match = text.match(pattern);
          if (match) {
            combinedRating = parseInt(match[1]);
            break;
          }
        }

        // Enhanced condition extraction with diagnostic codes, ratings, and effective dates
        const conditionLines = text.split('\n').filter(line =>
          /^\s*[•\-\d]/.test(line) && line.trim().length > 5 && /\d+%/.test(line)
        );

        const extractedConditions: VACondition[] = conditionLines.map(line => {
          const original = line.trim();

          // Extract rating percentage
          const ratingMatch = line.match(/(\d{1,3})%/);
          const rating = ratingMatch ? parseInt(ratingMatch[1]) : 0;

          // Extract diagnostic code (format: 9411, 5321, etc.)
          const diagCodeMatch = line.match(/\b(\d{4})\b/);
          const diagnosticCode = diagCodeMatch ? diagCodeMatch[1] : undefined;

          // Extract effective date (various formats)
          const dateMatch = line.match(/(?:effective|from)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
          const effectiveDate = dateMatch ? dateMatch[1] : undefined;

          // Detect bilateral conditions
          const bilateral = /bilateral/i.test(line);

          // Clean condition name (remove rating, code, dates)
          let name = line
            .replace(/^\s*[•\-\d\.]+\s*/, '') // Remove bullets/numbers
            .replace(/\d{1,3}%/g, '') // Remove percentage
            .replace(/\b\d{4}\b/, '') // Remove diagnostic code
            .replace(/(?:effective|from)\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/i, '') // Remove dates
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();

          // Capitalize condition name properly
          name = name.charAt(0).toUpperCase() + name.slice(1);

          return { name, rating, diagnosticCode, effectiveDate, bilateral, original };
        });

        // Data validation
        const warnings: string[] = [];

        // Validate combined rating range
        if (combinedRating && (combinedRating < 0 || combinedRating > 100)) {
          warnings.push('Combined rating appears invalid (should be 0-100%). Please verify.');
        }

        // Validate individual ratings (should be 0, 10, 20, ..., 100)
        const invalidRatings = extractedConditions.filter(c =>
          c.rating % 10 !== 0 || c.rating < 0 || c.rating > 100
        );
        if (invalidRatings.length > 0) {
          warnings.push(`${invalidRatings.length} condition(s) have non-standard ratings. Please review.`);
        }

        // Check for duplicate conditions
        const conditionNames = extractedConditions.map(c => c.name.toLowerCase());
        const duplicates = conditionNames.filter((name, index) => conditionNames.indexOf(name) !== index);
        if (duplicates.length > 0) {
          warnings.push('Duplicate conditions detected. Please review and remove duplicates.');
        }

        // Verify VA math (basic check - actual VA math is complex)
        if (combinedRating && extractedConditions.length > 0) {
          const highestRating = Math.max(...extractedConditions.map(c => c.rating));
          if (combinedRating < highestRating) {
            warnings.push('Combined rating is lower than highest individual rating. Please verify extraction.');
          }
        }

        // Sort conditions by rating (highest to lowest)
        const sortedConditions = extractedConditions.sort((a, b) => b.rating - a.rating);

        setRatingNarrativeData({
          combinedRating,
          conditions: sortedConditions,
          fileName: file.name,
          uploadedAt: new Date().toLocaleString(),
          warnings: warnings.length > 0 ? warnings : undefined
        });

        setValidationWarnings(warnings);

        // Auto-save combined rating to profile
        if (combinedRating && warnings.length === 0) {
          updateProfile({ vaDisabilityRating: combinedRating });
        }

        setTimeout(() => setRatingNarrativeExtracting(false), 500);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Rating narrative extraction error:', error);
      setRatingNarrativeData({
        combinedRating: null,
        conditions: [],
        error: 'Unable to extract data. Please review and enter manually.'
      });
      setRatingNarrativeExtracting(false);
    }
  };

  // Edit condition handler
  const handleEditCondition = (index: number, field: keyof VACondition, value: any) => {
    if (!ratingNarrativeData?.conditions) return;

    const updatedConditions = [...ratingNarrativeData.conditions];
    updatedConditions[index] = {
      ...updatedConditions[index],
      [field]: value
    };

    // Re-sort if rating changed
    if (field === 'rating') {
      updatedConditions.sort((a, b) => b.rating - a.rating);
    }

    setRatingNarrativeData({
      ...ratingNarrativeData,
      conditions: updatedConditions
    });
  };

  // Delete condition handler
  const handleDeleteCondition = (index: number) => {
    if (!ratingNarrativeData?.conditions) return;

    const updatedConditions = ratingNarrativeData.conditions.filter((_: any, i: number) => i !== index);
    setRatingNarrativeData({
      ...ratingNarrativeData,
      conditions: updatedConditions
    });
  };

  // Add new condition handler
  const handleAddCondition = () => {
    const newCondition: VACondition = {
      name: '',
      rating: 0
    };

    setRatingNarrativeData({
      ...ratingNarrativeData,
      conditions: [...(ratingNarrativeData?.conditions || []), newCondition]
    });

    setEditingConditionIndex(ratingNarrativeData?.conditions?.length || 0);
  };

  // Service Period Handlers
  const handleAddServicePeriod = () => {
    const newPeriod = {
      branch: profile.branch || '',
      startDate: '',
      endDate: '',
      rank: '',
      characterOfDischarge: '',
      isPrimaryPeriod: (profile.servicePeriods?.length || 0) === 0
    };
    updateProfile({
      servicePeriods: [...(profile.servicePeriods || []), newPeriod]
    });
    setEditingPeriodIndex(profile.servicePeriods?.length || 0);
  };

  const handleEditServicePeriod = (index: number, field: string, value: any) => {
    if (!profile.servicePeriods) return;
    const updatedPeriods = [...profile.servicePeriods];
    updatedPeriods[index] = { ...updatedPeriods[index], [field]: value };
    updateProfile({ servicePeriods: updatedPeriods });
  };

  const handleDeleteServicePeriod = (index: number) => {
    if (!profile.servicePeriods) return;
    const updatedPeriods = profile.servicePeriods.filter((_, i) => i !== index);
    updateProfile({ servicePeriods: updatedPeriods });
    if (editingPeriodIndex === index) setEditingPeriodIndex(null);
  };

  const handleSetPrimaryPeriod = (index: number) => {
    if (!profile.servicePeriods) return;
    const updatedPeriods = profile.servicePeriods.map((period, i) => ({
      ...period,
      isPrimaryPeriod: i === index
    }));
    updateProfile({ servicePeriods: updatedPeriods });
  };

  // Simple toast notification
  const toast = {
    success: (msg: string) => alert(msg),
    error: (msg: string) => alert(msg)
  };

  // Smart navigation that skips unnecessary steps
  const handleSaveAndContinue = () => {
    if (step < 6) {
      let nextStep = step + 1;

      // Skip CRSC step (4) if veteran doesn't meet basic eligibility
      if (step === 3 && nextStep === 4) {
        const crscEligible = (profile.isMedicallyRetired || (profile.isRetired && profile.yearsOfService >= 20)) &&
                            profile.vaDisabilityRating >= 10 &&
                            profile.hasCombatService;

        if (!crscEligible) {
          nextStep = 5; // Skip to Dependents
        }
      }

      // Skip Dependents step (5) if veteran has no dependents
      if (step === 4 && nextStep === 5) {
        if (!profile.hasSpouse && (!profile.numberOfChildren || profile.numberOfChildren === 0)) {
          nextStep = 6; // Skip to Review
        }
      }

      setStep(nextStep);
    } else {
      updateProfile({ profileCompleted: true });
      navigate('/benefits');
    }
  };

  // Smart back navigation
  const handleBack = () => {
    if (step > 1) {
      let prevStep = step - 1;

      // Skip CRSC step when going back if not eligible
      if (step === 5 && prevStep === 4) {
        const crscEligible = (profile.isMedicallyRetired || (profile.isRetired && profile.yearsOfService >= 20)) &&
                            profile.vaDisabilityRating >= 10 &&
                            profile.hasCombatService;

        if (!crscEligible) {
          prevStep = 3; // Go back to Retirement
        }
      }

      setStep(prevStep);
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
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-600">Step {step} of 6</span>
        </div>
      </div>

      {/* Real-Time Benefits Counter */}
      <BenefitsCounter profile={profile} step={step} />

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

          {/* Multiple Service Periods Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">⏱️ Multiple Service Periods</h4>
              <button
                onClick={() => setShowServicePeriods(!showServicePeriods)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showServicePeriods ? 'Hide' : 'Show'} Service Periods
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              If you separated from service and later rejoined, you can track multiple service periods here.
              This helps calculate total service time and benefits eligibility.
            </p>

            {showServicePeriods && (
              <div className="space-y-4">
                {profile.servicePeriods && profile.servicePeriods.length > 0 ? (
                  <div className="space-y-3">
                    {profile.servicePeriods.map((period, index) => (
                      <div
                        key={index}
                        className={`border-2 rounded-lg p-4 ${
                          period.isPrimaryPeriod
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {editingPeriodIndex === index ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-900">
                                Service Period #{index + 1}
                              </span>
                              {period.isPrimaryPeriod && (
                                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                  Primary
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Branch
                                </label>
                                <select
                                  value={period.branch}
                                  onChange={(e) =>
                                    handleEditServicePeriod(index, 'branch', e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="">Select branch...</option>
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
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Rank (at separation)
                                </label>
                                <input
                                  type="text"
                                  value={period.rank}
                                  onChange={(e) =>
                                    handleEditServicePeriod(index, 'rank', e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded text-sm"
                                  placeholder="E-5, O-3, etc."
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  value={period.startDate}
                                  onChange={(e) =>
                                    handleEditServicePeriod(index, 'startDate', e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded text-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  End Date
                                </label>
                                <input
                                  type="date"
                                  value={period.endDate}
                                  onChange={(e) =>
                                    handleEditServicePeriod(index, 'endDate', e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded text-sm"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Character of Discharge
                                </label>
                                <select
                                  value={period.characterOfDischarge || ''}
                                  onChange={(e) =>
                                    handleEditServicePeriod(index, 'characterOfDischarge', e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="">Select...</option>
                                  <option value="Honorable">Honorable</option>
                                  <option value="General Under Honorable Conditions">
                                    General Under Honorable Conditions
                                  </option>
                                  <option value="Other Than Honorable">Other Than Honorable</option>
                                  <option value="Bad Conduct">Bad Conduct</option>
                                  <option value="Dishonorable">Dishonorable</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => setEditingPeriodIndex(null)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium"
                              >
                                ✓ Save
                              </button>
                              {!period.isPrimaryPeriod && (
                                <button
                                  onClick={() => handleSetPrimaryPeriod(index)}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium"
                                >
                                  Set as Primary
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteServicePeriod(index)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingPeriodIndex(index)}
                            className="w-full text-left"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">
                                    Period #{index + 1}
                                  </span>
                                  {period.isPrimaryPeriod && (
                                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                      Primary
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-700">
                                  <span className="font-medium">{period.branch || 'Not specified'}</span>
                                  {period.rank && ` • ${period.rank}`}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {period.startDate || 'No start date'} →{' '}
                                  {period.endDate || 'No end date'}
                                  {period.characterOfDischarge && ` • ${period.characterOfDischarge}`}
                                </div>
                              </div>
                              <span className="text-gray-400 text-sm">Click to edit</span>
                            </div>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-600 text-sm mb-3">No additional service periods added yet</p>
                  </div>
                )}

                <button
                  onClick={handleAddServicePeriod}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <span className="text-xl">+</span> Add Service Period
                </button>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>💡 Tip:</strong> If you served multiple times (e.g., Active Duty, then
                    National Guard, then reactivated), add each period separately. Mark your most
                    recent or primary service as "Primary" for DD-214 matching.
                  </p>
                </div>
              </div>
            )}
          </div>

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

          {/* VA Rating Narrative Scanner */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">📄 Upload VA Rating Letter</h4>
              <span className="text-sm text-blue-600 font-medium">Auto-extract your rating & conditions</span>
            </div>

            <p className="text-sm text-gray-700 mb-4">
              Upload your VA Rating Decision Letter to automatically extract your combined disability rating and all service-connected conditions. We'll scan the document and list your conditions from highest to lowest rating.
            </p>

            {/* Rating Narrative Upload Box */}
            <div
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  setRatingNarrativeFile(file);
                  handleRatingNarrativeUpload(file);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
              }}
              onClick={() => ratingNarrativeRef.current?.click()}
              className="relative border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <input
                ref={ratingNarrativeRef}
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setRatingNarrativeFile(file);
                    handleRatingNarrativeUpload(file);
                  }
                }}
                className="hidden"
                aria-label="Upload VA rating letter"
              />

              {ratingNarrativeExtracting ? (
                <div className="space-y-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-700 font-medium">Scanning rating letter...</p>
                  <p className="text-sm text-gray-600">Extracting disability information</p>
                </div>
              ) : ratingNarrativeFile ? (
                <div className="space-y-3">
                  <div className="text-green-600 text-3xl">✓</div>
                  <p className="text-gray-900 font-semibold">Rating Letter Uploaded</p>
                  <p className="text-sm text-gray-700">{ratingNarrativeFile.name}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRatingNarrativeFile(null);
                      setRatingNarrativeData(null);
                      if (ratingNarrativeRef.current) ratingNarrativeRef.current.value = '';
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Upload Different File
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-blue-400 text-4xl">📋</div>
                  <p className="text-gray-900 font-semibold">Drag your rating letter here</p>
                  <p className="text-sm text-gray-600">or click to browse</p>
                  <p className="text-xs text-gray-500 mt-2">PDF, JPG, or PNG format (max 10MB)</p>
                </div>
              )}
            </div>

            {/* Validation Warnings */}
            {validationWarnings.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg" role="alert" aria-live="polite">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-600 text-xl" aria-hidden="true">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-900 mb-2">Data Validation Warnings</p>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {validationWarnings.map((warning, i) => (
                        <li key={i}>• {warning}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-yellow-700 mt-2">Please review the extracted data below and make corrections if needed.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Extracted Data Display */}
            {ratingNarrativeData && (
              <div className="mt-4 space-y-4">
                {/* Combined Rating */}
                {ratingNarrativeData.combinedRating && (
                  <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-green-900">✅ Combined VA Rating Extracted</p>
                        <p className="text-xs text-green-700 mt-1">From your rating decision letter</p>
                        {validationWarnings.length === 0 && (
                          <p className="text-xs text-green-600 mt-1" role="status" aria-live="polite">✓ Auto-applied to your profile</p>
                        )}
                      </div>
                      <div className="text-5xl font-black text-green-600" aria-label={`${ratingNarrativeData.combinedRating} percent combined rating`}>
                        {ratingNarrativeData.combinedRating}%
                      </div>
                    </div>
                    {validationWarnings.length > 0 && (
                      <button
                        onClick={() => {
                          updateProfile({ vaDisabilityRating: parseInt(ratingNarrativeData.combinedRating) });
                          toast.success('Combined rating applied!');
                        }}
                        className="mt-3 w-full py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        aria-label="Apply combined rating to profile"
                      >
                        Apply Combined Rating to Profile
                      </button>
                    )}
                  </div>
                )}

                {/* Service-Connected Conditions (Editable, Sorted Highest to Lowest) */}
                {ratingNarrativeData.conditions && ratingNarrativeData.conditions.length > 0 && (
                  <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-blue-900">📋 Service-Connected Conditions</p>
                        <p className="text-xs text-blue-700 mt-1">Sorted from highest to lowest rating • Click to edit</p>
                      </div>
                      <button
                        onClick={handleAddCondition}
                        className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Add new condition"
                      >
                        + Add Condition
                      </button>
                    </div>
                    <div className="space-y-2" role="list" aria-label="Service-connected conditions">
                      {ratingNarrativeData.conditions.map((condition: VACondition, i: number) => {
                        const isEditing = editingConditionIndex === i;

                        return (
                          <div key={i} className="bg-white border border-blue-200 rounded-lg" role="listitem">
                            {isEditing ? (
                              // Edit mode
                              <div className="p-3 space-y-3">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={condition.name}
                                    onChange={(e) => handleEditCondition(i, 'name', e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Condition name"
                                    aria-label="Condition name"
                                  />
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="10"
                                    value={condition.rating}
                                    onChange={(e) => handleEditCondition(i, 'rating', parseInt(e.target.value) || 0)}
                                    className="w-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    aria-label="Rating percentage"
                                  />
                                  <span className="flex items-center text-blue-600 font-bold">%</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={condition.diagnosticCode || ''}
                                    onChange={(e) => handleEditCondition(i, 'diagnosticCode', e.target.value)}
                                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Diagnostic code (e.g., 9411)"
                                    aria-label="Diagnostic code"
                                  />
                                  <input
                                    type="text"
                                    value={condition.effectiveDate || ''}
                                    onChange={(e) => handleEditCondition(i, 'effectiveDate', e.target.value)}
                                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Effective date (MM/DD/YYYY)"
                                    aria-label="Effective date"
                                  />
                                </div>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={condition.bilateral || false}
                                    onChange={(e) => handleEditCondition(i, 'bilateral', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                  <span>Bilateral condition (affects both sides)</span>
                                </label>
                                <div className="flex gap-2 pt-2">
                                  <button
                                    onClick={() => setEditingConditionIndex(null)}
                                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                    aria-label="Save changes"
                                  >
                                    ✓ Save
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCondition(i)}
                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    aria-label="Delete condition"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // View mode
                              <button
                                onClick={() => setEditingConditionIndex(i)}
                                className="w-full p-3 text-left hover:bg-blue-50 transition rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                                aria-label={`Edit condition ${i + 1}: ${condition.name}, rated at ${condition.rating} percent`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 flex-1">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded" aria-label={`Rank ${i + 1}`}>
                                      #{i + 1}
                                    </span>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900">{condition.name}</span>
                                        {condition.bilateral && (
                                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded" aria-label="Bilateral condition">
                                            Bilateral
                                          </span>
                                        )}
                                      </div>
                                      {(condition.diagnosticCode || condition.effectiveDate) && (
                                        <div className="flex gap-3 mt-1 text-xs text-gray-600">
                                          {condition.diagnosticCode && (
                                            <span aria-label={`Diagnostic code ${condition.diagnosticCode}`}>
                                              Code: {condition.diagnosticCode}
                                            </span>
                                          )}
                                          {condition.effectiveDate && (
                                            <span aria-label={`Effective date ${condition.effectiveDate}`}>
                                              Effective: {condition.effectiveDate}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {condition.rating > 0 && (
                                    <span className="text-lg font-bold text-blue-600 min-w-max" aria-label={`${condition.rating} percent rating`}>
                                      {condition.rating}%
                                    </span>
                                  )}
                                </div>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 p-3 bg-white border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>💡 Tip:</strong> These conditions are automatically sorted by severity. Your highest-rated conditions contribute most to your combined rating using VA math. Click any condition to edit details.
                      </p>
                    </div>
                  </div>
                )}

                {/* Upload Info */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>📄 {ratingNarrativeData.fileName}</span>
                    <span>Uploaded: {ratingNarrativeData.uploadedAt}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900 mb-2">
                <strong>💡 Pro tip:</strong> Upload your VA Rating Decision Letter (from VA.gov or eBenefits) for best results. We'll automatically extract and sort your conditions by rating percentage.
              </p>
              <p className="text-xs text-blue-800">
                <strong>🔒 Security:</strong> Your document is processed locally in your browser. Files are NOT uploaded to servers or stored. Only the extracted text data is saved to your profile. You maintain full control and can edit or delete any information.
              </p>
            </div>

            {/* Production Enhancement Recommendations */}
            {ratingNarrativeData?.error && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">📈 Production Enhancement Recommendations:</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• <strong>OCR Integration:</strong> Connect Google Cloud Vision, Azure Computer Vision, or AWS Textract for accurate image-based PDF scanning</li>
                  <li>• <strong>VA.gov API:</strong> Auto-fetch rating data via VA Lighthouse API with veteran authentication</li>
                  <li>• <strong>Data Validation:</strong> Verify extracted data against official VA records and diagnostic code database</li>
                  <li>• <strong>HIPAA Compliance:</strong> Implement encryption, audit logging, and secure document retention policies</li>
                </ul>
              </div>
            )}
          </div>

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

      {/* Step 4: CRSC Qualification (for eligible veterans) */}
      {step === 4 && (
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="flex items-start gap-3 mb-6">
            <span className="text-4xl">⚔️</span>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Combat-Related Special Compensation (CRSC)</h3>
              <p className="text-gray-600 mt-1">
                Tax-free compensation for combat-related disabilities that offsets the VA waiver
              </p>
            </div>
          </div>

          {/* Show eligibility check */}
          {(profile.isMedicallyRetired || (profile.isRetired && profile.yearsOfService >= 20)) &&
           profile.vaDisabilityRating >= 10 &&
           profile.hasCombatService ? (
            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <h4 className="font-bold text-green-900 text-lg mb-2">✅ You may qualify for CRSC!</h4>
                <p className="text-green-800 mb-4">
                  Based on your profile, you meet the basic requirements for CRSC. Complete the wizard below to
                  determine full qualification and get personalized application guidance.
                </p>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• ✅ Military/Medical retirement status</li>
                  <li>• ✅ VA disability rating of {profile.vaDisabilityRating}%</li>
                  <li>• ✅ Combat service indicated</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
                <h4 className="font-bold text-yellow-900 mb-3">📋 CRSC Qualification Assessment</h4>
                <p className="text-yellow-800 text-sm mb-4">
                  Answer a few questions about your service and disabilities to determine if your conditions qualify as combat-related.
                </p>

                <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-yellow-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={profile.crscSelfIdentified || false}
                    onChange={(e) => updateProfile({ crscSelfIdentified: e.target.checked })}
                    className="w-5 h-5 text-yellow-600 mt-1 rounded"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 block">I believe my disability is combat-related</span>
                    <p className="text-xs text-gray-600 mt-1">
                      Check if your service-connected disability resulted from combat operations, hostile fire zones,
                      hazardous duty (parachuting, diving, flight operations), or training exercises
                    </p>
                  </div>
                </label>

                {profile.crscSelfIdentified && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-900">Select all that apply to your situation:</p>

                    <label className="flex items-center gap-2 p-3 bg-white border rounded-lg hover:border-yellow-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={profile.crscCombatInjury}
                        onChange={(e) => updateProfile({ crscCombatInjury: e.target.checked })}
                        className="w-4 h-4 text-yellow-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Combat injury or wound (IED, gunfire, shrapnel, explosion)</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-white border rounded-lg hover:border-yellow-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={profile.crscCombatTraining}
                        onChange={(e) => updateProfile({ crscCombatTraining: e.target.checked })}
                        className="w-4 h-4 text-yellow-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Training accident or field exercise injury</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-white border rounded-lg hover:border-yellow-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={profile.crscHazardousDuty}
                        onChange={(e) => updateProfile({ crscHazardousDuty: e.target.checked })}
                        className="w-4 h-4 text-yellow-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Hazardous duty (airborne, diving, flight ops, EOD, special operations)</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-white border rounded-lg hover:border-yellow-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={profile.crscToxicExposure}
                        onChange={(e) => updateProfile({ crscToxicExposure: e.target.checked })}
                        className="w-4 h-4 text-yellow-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Toxic exposure in combat zone (burn pits, Agent Orange, Gulf War syndrome)</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-white border rounded-lg hover:border-yellow-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={profile.crscMentalHealthCombat}
                        onChange={(e) => updateProfile({ crscMentalHealthCombat: e.target.checked })}
                        className="w-4 h-4 text-yellow-600 rounded"
                      />
                      <span className="text-sm text-gray-700">PTSD or mental health condition from combat operations</span>
                    </label>

                    {(profile.crscCombatInjury || profile.crscCombatTraining || profile.crscHazardousDuty ||
                      profile.crscToxicExposure || profile.crscMentalHealthCombat) && (
                      <div className="mt-4 p-4 bg-green-100 border-2 border-green-400 rounded-lg">
                        <p className="font-semibold text-green-900 flex items-center gap-2">
                          <span className="text-xl">✓</span>
                          <span>Strong CRSC Qualification Indicators</span>
                        </p>
                        <p className="text-sm text-green-800 mt-2">
                          Based on your selections, you have strong indicators for CRSC qualification. Your next steps:
                        </p>
                        <ol className="text-sm text-green-800 mt-2 ml-4 list-decimal space-y-1">
                          <li>Complete DD Form 2860 (CRSC Application)</li>
                          <li>Gather combat/deployment documentation</li>
                          <li>Obtain VA rating decision letter</li>
                          <li>Collect medical evidence linking disability to combat</li>
                          <li>Submit to your branch's CRSC office</li>
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>ℹ️ Educational Information:</strong> CRSC is determined by your branch's retirement system, not the VA.
                  This assessment helps identify potential eligibility for educational purposes only.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <span className="text-4xl block mb-3">ℹ️</span>
              <h4 className="font-bold text-gray-900 mb-2">CRSC Pre-Qualification Not Met</h4>
              <p className="text-gray-700 mb-4">
                CRSC is available to military retirees with combat-related disabilities. Based on your current profile:
              </p>
              <ul className="text-sm text-gray-600 space-y-2 text-left max-w-xl mx-auto">
                {!profile.isRetired && !profile.isMedicallyRetired && (
                  <li>• ❌ Not currently indicated as retired or medically retired</li>
                )}
                {profile.vaDisabilityRating < 10 && (
                  <li>• ❌ VA disability rating must be at least 10%</li>
                )}
                {!profile.hasCombatService && (
                  <li>• ❌ Combat service not indicated</li>
                )}
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                If you believe you should qualify, update your information in previous steps or continue to complete your profile.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 5: Dependents */}
      {step === 5 && (
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

      {/* Step 6: Review */}
      {step === 6 && (
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
            onClick={handleBack}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Previous
          </button>
        )}
        <button
          onClick={handleSaveAndContinue}
          className="ml-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-lg transition-colors"
        >
          {step === 6 ? 'Complete Profile →' : 'Continue →'}
        </button>
      </div>
    </div>
  );
};

export default VeteranProfileSetup;
