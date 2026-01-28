/**
 * Veteran Basics Wizard Page
 *
 * Enhanced with DD-214 and Narrative Letter upload, auto-population,
 * and integrity checking per Master Instructions.
 *
 * Features:
 * - DD-214 upload with automatic data extraction
 * - VA Rating Decision upload with automatic extraction
 * - Auto-population of all fields from documents
 * - Rank dropdown (E-1 to O-10, all branches)
 * - Cross-module integration with GIE
 * - Missing document detection and helper
 */

import React, { useState } from 'react';
import { extractDD214Data } from '../../services/DD214Scanner';
import { extractRatingNarrativeData } from '../../services/RatingNarrativeScanner';
import { runIntegrityChecks } from '../../MatrixEngine/integrity/integrityOrchestrator';
import {
  downloadMyDD214,
  downloadMyRatingLetter,
  findMyMOSEquivalents,
  checkMyStateBenefits,
  checkMyFederalBenefits,
  checkMyDeploymentExposures,
  checkMyGIBillEligibility,
  checkMyHousingEligibility,
  checkMyFamilyBenefits,
  checkMyTransitionTasks,
} from '../../MatrixEngine/quickAccess/quickAccessTools';
import DisabilityCalculator from './DisabilityCalculator';
import { Disability } from '../../MatrixEngine/disabilityCalculator';

interface VeteranBasicsProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

interface ServicePeriod {
  id: string;
  branch: string;
  rank: string;
  entryDate: string;
  separationDate: string;
  characterOfService: string;
  mos: string;
}

const VeteranBasicsPage: React.FC<VeteranBasicsProps> = ({ onNext, onBack, initialData = {} }) => {
  // Multiple service periods support
  const [servicePeriods, setServicePeriods] = useState<ServicePeriod[]>(initialData.servicePeriods || [
    {
      id: 'period-1',
      branch: initialData.branch || '',
      rank: initialData.rank || '',
      entryDate: initialData.entryDate || '',
      separationDate: initialData.separationDate || '',
      characterOfService: initialData.characterOfService || '',
      mos: initialData.mos || ''
    }
  ]);

  // Legacy single-period state (for backward compatibility)
  const [branch, setBranch] = useState(initialData.branch || '');
  const [rank, setRank] = useState(initialData.rank || '');
  const [entryDate, setEntryDate] = useState(initialData.entryDate || '');
  const [separationDate, setSeparationDate] = useState(initialData.separationDate || '');
  const [characterOfService, setCharacterOfService] = useState(initialData.characterOfService || '');
  const [mos, setMos] = useState(initialData.mos || '');

  // Location state
  const [stateOfResidence, setStateOfResidence] = useState(initialData.stateOfResidence || '');
  const [isOutOfCountry, setIsOutOfCountry] = useState(initialData.isOutOfCountry || false);
  const [countryOfResidence, setCountryOfResidence] = useState(initialData.countryOfResidence || '');

  // Retirement state
  const [has20YearRetirement, setHas20YearRetirement] = useState(initialData.has20YearRetirement || false);
  const [isMedicallyRetired, setIsMedicallyRetired] = useState(initialData.isMedicallyRetired || false);

  // CRSC state
  const [isCollectingCRSC, setIsCollectingCRSC] = useState(initialData.isCollectingCRSC || false);

  // Upload state
  const [dd214File, setDD214File] = useState<File | null>(null);
  const [dd214Uploaded, setDD214Uploaded] = useState(initialData.documents?.dd214?.uploaded || false);
  const [dd214Extracting, setDD214Extracting] = useState(false);
  const [dd214Data, setDD214Data] = useState<any>(null);

  const [narrativeFile, setNarrativeFile] = useState<File | null>(null);
  const [narrativeUploaded, setNarrativeUploaded] = useState(initialData.documents?.ratingNarrative?.uploaded || false);
  const [narrativeExtracting, setNarrativeExtracting] = useState(false);
  const [narrativeData, setNarrativeData] = useState<any>(null);

  // UI state
  const [showDD214Helper, setShowDD214Helper] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showQuickAccessTools, setShowQuickAccessTools] = useState(false);
  const [quickAccessResult, setQuickAccessResult] = useState<any>(null);

  // Disability calculator state
  const [disabilities, setDisabilities] = useState<Disability[]>([]);

  // Add new service period
  const addServicePeriod = () => {
    const newPeriod: ServicePeriod = {
      id: `period-${Date.now()}`,
      branch: '',
      rank: '',
      entryDate: '',
      separationDate: '',
      characterOfService: '',
      mos: ''
    };
    setServicePeriods([...servicePeriods, newPeriod]);
  };

  // Remove service period
  const removeServicePeriod = (id: string) => {
    if (servicePeriods.length > 1) {
      setServicePeriods(servicePeriods.filter(p => p.id !== id));
    }
  };

  // Update service period
  const updateServicePeriod = (id: string, field: keyof ServicePeriod, value: string) => {
    setServicePeriods(servicePeriods.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));

    // Also update legacy single-period state for first period (backward compatibility)
    if (id === servicePeriods[0]?.id) {
      if (field === 'branch') setBranch(value);
      else if (field === 'rank') setRank(value);
      else if (field === 'entryDate') setEntryDate(value);
      else if (field === 'separationDate') setSeparationDate(value);
      else if (field === 'characterOfService') setCharacterOfService(value);
      else if (field === 'mos') setMos(value);
    }
  };

  // Handle DD-214 upload
  const handleDD214Upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setDD214File(file);
    setDD214Extracting(true);

    console.log('📄 Starting DD-214 upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    try {
      console.log('🔍 Calling extractDD214Data...');

      // Extract data from DD-214 using backend OCR scanner
      const extractedData = await extractDD214Data(file);

      console.log('✅ DD-214 extraction successful:', extractedData);

      // Auto-populate first service period from extracted data
      if (servicePeriods.length > 0) {
        const updatedPeriod = { ...servicePeriods[0] };
        if (extractedData.branch) updatedPeriod.branch = extractedData.branch;
        if (extractedData.rank) updatedPeriod.rank = extractedData.rank;
        if (extractedData.entryDate) updatedPeriod.entryDate = extractedData.entryDate;
        if (extractedData.separationDate) updatedPeriod.separationDate = extractedData.separationDate;
        if (extractedData.characterOfService) updatedPeriod.characterOfService = extractedData.characterOfService;
        if (extractedData.mosCode) updatedPeriod.mos = extractedData.mosCode;

        setServicePeriods([updatedPeriod, ...servicePeriods.slice(1)]);
      }

      // Also update legacy single-period state
      if (extractedData.branch) setBranch(extractedData.branch);
      if (extractedData.rank) setRank(extractedData.rank);
      if (extractedData.entryDate) setEntryDate(extractedData.entryDate);
      if (extractedData.separationDate) setSeparationDate(extractedData.separationDate);
      if (extractedData.characterOfService) setCharacterOfService(extractedData.characterOfService);
      if (extractedData.mosCode) setMos(extractedData.mosCode);

      setDD214Data(extractedData);
      setDD214Uploaded(true);
      setAutoFilled(true);

      // Show detailed success message with extraction log
      const confidence = extractedData.extractionConfidence;
      const fieldsCount = extractedData.extractedFields.length;

      let message = `✅ DD-214 processed successfully!\n\n`;
      message += `Confidence: ${confidence.toUpperCase()}\n`;
      message += `Fields extracted: ${fieldsCount}\n\n`;

      if (extractedData.requiresReview) {
        message += `⚠️ Please review the auto-filled fields for accuracy.\n\n`;
      }

      message += `Extraction Summary:\n`;
      message += extractedData.extractionLog.slice(-5).join('\n');

      alert(message);
    } catch (error) {
      console.error('❌ DD-214 extraction error:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // More detailed error message for user
      let userMessage = `❌ Failed to scan DD-214\n\n`;
      userMessage += `Error: ${errorMessage}\n\n`;

      // Check for common issues
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        userMessage += `This appears to be a connection issue. Please ensure:\n`;
        userMessage += `• The backend server is running\n`;
        userMessage += `• You have internet connectivity\n\n`;
      } else if (errorMessage.includes('timeout')) {
        userMessage += `The scan is taking longer than expected. Please:\n`;
        userMessage += `• Try a smaller or clearer image\n`;
        userMessage += `• Check that the file is a valid DD-214\n\n`;
      }

      userMessage += `You can enter your information manually below.`;

      alert(userMessage);
    } finally {
      setDD214Extracting(false);
    }
  };

  // Handle Narrative Letter upload
  const handleNarrativeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setNarrativeFile(file);
    setNarrativeExtracting(true);

    try {
      // Extract data from rating narrative using backend OCR scanner
      const extractedData = await extractRatingNarrativeData(file);

      setNarrativeData(extractedData);
      setNarrativeUploaded(true);

      // Auto-populate disabilities from rating decision
      if (extractedData.serviceConnectedConditions && extractedData.serviceConnectedConditions.length > 0) {
        const importedDisabilities: Disability[] = extractedData.serviceConnectedConditions.map((c, index) => ({
          id: `disability-${Date.now()}-${index}`,
          conditionName: c.conditionName,
          diagnosticCode: c.diagnosticCode || '',
          percentage: c.rating || 0,
          bodyPart: c.extremity || '',
          side: 'n/a' as const,
          effectiveDate: c.effectiveDate || new Date().toISOString().split('T')[0],
          isServiceConnected: c.serviceConnected,
          isPermanentAndTotal: extractedData.isPermanentAndTotal || false,
          source: 'narrative' as const,
        }));
        setDisabilities(importedDisabilities);
      }

      // Show detailed success message
      const conditionsCount = extractedData.serviceConnectedConditions.length;
      const deniedCount = extractedData.deniedConditions.length;
      const confidence = extractedData.extractionConfidence;

      let message = `✅ Rating Decision processed successfully!\n\n`;
      message += `Confidence: ${confidence.toUpperCase()}\n`;
      message += `Service-Connected Conditions: ${conditionsCount}\n`;
      if (deniedCount > 0) message += `Denied Conditions: ${deniedCount}\n`;
      if (extractedData.isPermanentAndTotal) message += `\n⭐ P&T Status Detected!\n`;
      if (extractedData.hasTDIU) message += `TDIU Status Detected!\n`;
      if (extractedData.hasSMC) message += `SMC Status Detected (${extractedData.smcLevel})\n`;

      if (extractedData.requiresReview) {
        message += `\n⚠️ Please review the auto-filled conditions for accuracy.\n`;
      }

      if (conditionsCount > 0) {
        message += `\n✅ ${conditionsCount} disabilities added to calculator!`;
      }

      alert(message);
    } catch (error) {
      console.error('Error extracting rating narrative:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`❌ ${errorMessage}\n\nYou can enter your conditions manually in the calculator below.`);
    } finally {
      setNarrativeExtracting(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Validate each service period
    servicePeriods.forEach((period, index) => {
      if (!period.branch) errors.push(`Service Period ${index + 1}: Branch is required`);
      if (!period.entryDate) errors.push(`Service Period ${index + 1}: Entry date is required`);
      if (!period.separationDate) errors.push(`Service Period ${index + 1}: Separation date is required`);
      if (!period.characterOfService) errors.push(`Service Period ${index + 1}: Character of service is required`);

      if (period.entryDate && period.separationDate && new Date(period.separationDate) <= new Date(period.entryDate)) {
        errors.push(`Service Period ${index + 1}: Separation date must be after entry date`);
      }
    });

    // Validate location
    if (!isOutOfCountry && !stateOfResidence) errors.push('State of residence is required');
    if (isOutOfCountry && !countryOfResidence) errors.push('Country of residence is required');

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Handle continue
  const handleContinue = () => {
    if (!validateForm()) {
      alert('Please fix the following errors:\n' + validationErrors.join('\n'));
      return;
    }

    // Build data object with service periods
    const data = {
      // Primary service period (first one, for backward compatibility)
      branch: servicePeriods[0]?.branch || branch,
      rank: servicePeriods[0]?.rank || rank,
      entryDate: servicePeriods[0]?.entryDate || entryDate,
      separationDate: servicePeriods[0]?.separationDate || separationDate,
      characterOfService: servicePeriods[0]?.characterOfService || characterOfService,
      mos: servicePeriods[0]?.mos || mos,

      // All service periods
      servicePeriods,
      hasMultipleServicePeriods: servicePeriods.length > 1,

      // Location
      stateOfResidence,
      isOutOfCountry,
      countryOfResidence,

      // Retirement & CRSC
      has20YearRetirement,
      isMedicallyRetired,
      isCollectingCRSC,

      // Documents
      documents: {
        dd214: dd214Uploaded ? {
          uploaded: true,
          uploadedAt: new Date(),
          extractedData: dd214Data,
        } : undefined,
        ratingNarrative: narrativeUploaded ? {
          uploaded: true,
          uploadedAt: new Date(),
          extractedData: narrativeData,
        } : undefined,
      },
    };

    // Run integrity check
    const integrityReport = runIntegrityChecks({ digitalTwin: data as any });
    console.log('Integrity Report:', integrityReport);

    onNext(data);
  };

  // Quick Access Tool Handlers
  const handleQuickAccessTool = async (toolName: string) => {
    let result;

    try {
      switch (toolName) {
        case 'dd214':
          result = downloadMyDD214();
          break;
        case 'rating':
          result = downloadMyRatingLetter();
          break;
        case 'mos':
          result = findMyMOSEquivalents(mos || '11B', branch || 'Army');
          break;
        case 'state':
          result = checkMyStateBenefits('California', narrativeData?.combinedRating);
          break;
        case 'federal':
          result = checkMyFederalBenefits({ combinedRating: narrativeData?.combinedRating || 0, isPermanentAndTotal: narrativeData?.isPermanentAndTotal || false });
          break;
        case 'exposures':
          result = checkMyDeploymentExposures({ deployments: [] });
          break;
        case 'gibill':
          result = checkMyGIBillEligibility({ entryDate, separationDate });
          break;
        case 'housing':
          result = checkMyHousingEligibility({ combinedRating: narrativeData?.combinedRating || 0 });
          break;
        case 'family':
          result = checkMyFamilyBenefits({ combinedRating: narrativeData?.combinedRating || 0, isPermanentAndTotal: narrativeData?.isPermanentAndTotal || false });
          break;
        case 'transition':
          result = checkMyTransitionTasks(separationDate || new Date().toISOString());
          break;
      }

      setQuickAccessResult(result);
      setShowQuickAccessTools(true);
    } catch (error) {
      console.error('Quick Access Tool Error:', error);
      alert('Error running quick access tool. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 50%, #4a7396 100%)',
      backgroundImage: `
        linear-gradient(135deg, rgba(30, 58, 95, 0.95) 0%, rgba(45, 90, 123, 0.95) 50%, rgba(74, 115, 150, 0.95) 100%),
        repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 2px, transparent 2px, transparent 4px),
        repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 2px, transparent 2px, transparent 4px)
      `,
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '32px',
        }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>
            Veteran Basics
          </h1>
          <p style={{ fontSize: '16px', color: '#d7dde5', marginBottom: '0' }}>
            Upload your DD-214 and VA rating decision for automatic data extraction, or enter information manually.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {/* Left Column - Service Information */}
          <div className="space-y-6">
            {/* Document Upload Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>
                📄 Document Upload (Recommended)
              </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* DD-214 Upload */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              DD-214 Upload (Member 4 Copy)
            </label>
            <div style={{
              padding: '24px', border: '2px dashed #cbd5e1', borderRadius: '8px',
              textAlign: 'center', background: dd214Uploaded ? '#dcfce7' : '#f8fafc',
            }}>
              {dd214Extracting ? (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                  <div>Extracting data from DD-214...</div>
                </div>
              ) : dd214Uploaded ? (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                  <div style={{ fontWeight: '500', color: '#166534' }}>DD-214 Uploaded</div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                    {dd214File?.name || 'Document processed'}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📑</div>
                  <div style={{ marginBottom: '12px' }}>Upload your DD-214</div>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDD214Upload}
                    style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    PDF, JPG, or PNG • Automatically extracts data
                  </div>
                </>
              )}
            </div>
            {!dd214Uploaded && (
              <button onClick={() => setShowDD214Helper(!showDD214Helper)} style={{
                marginTop: '12px', padding: '8px 16px', background: 'none', border: '1px solid #cbd5e1',
                borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
              }}>
                Need help getting your DD-214?
              </button>
            )}
          </div>

          {/* Narrative Letter Upload */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              VA Rating Decision (Optional)
            </label>
            <div style={{
              padding: '24px', border: '2px dashed #cbd5e1', borderRadius: '8px',
              textAlign: 'center', background: narrativeUploaded ? '#dcfce7' : '#f8fafc',
            }}>
              {narrativeExtracting ? (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                  <div>Extracting rating data...</div>
                </div>
              ) : narrativeUploaded ? (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                  <div style={{ fontWeight: '500', color: '#166534' }}>Rating Decision Uploaded</div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                    {narrativeFile?.name || 'Document processed'}
                  </div>
                  {narrativeData && (
                    <div style={{ fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>
                      Combined Rating: {narrativeData.combinedRating}%
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                  <div style={{ marginBottom: '12px' }}>Upload rating decision</div>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleNarrativeUpload}
                    style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Automatically extracts disabilities & ratings
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {autoFilled && (
          <div style={{
            marginTop: '20px', padding: '12px 16px', background: '#eff6ff', borderRadius: '6px',
            border: '1px solid #3b82f6', color: '#1e40af',
          }}>
            ✨ Fields below have been auto-filled from your DD-214. You can edit any field if needed.
          </div>
        )}

        {showDD214Helper && (
          <div style={{
            marginTop: '20px', padding: '16px', background: '#fef3c7', borderRadius: '6px',
            border: '1px solid #f59e0b',
          }}>
            <div style={{ fontWeight: '600', marginBottom: '8px', color: '#92400e' }}>How to get your DD-214:</div>
            <ol style={{ paddingLeft: '24px', marginBottom: '12px', color: '#92400e' }}>
              <li>Visit <a href="https://milconnect.dmdc.osd.mil" target="_blank" rel="noopener noreferrer">milConnect</a> (fastest, if registered)</li>
              <li>Request from <a href="https://www.archives.gov/veterans/military-service-records" target="_blank" rel="noopener noreferrer">National Archives</a> (free)</li>
              <li>Visit your local Veterans Service Office (VSO) for assistance</li>
            </ol>
            <div style={{ fontSize: '14px', color: '#92400e' }}>
              💡 Tip: You need the Member 4 copy (the long version with all your information)
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '32px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>Service Information</h2>

        <div style={{ marginBottom: '16px', padding: '12px', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
            💡 <strong>Multiple Service Periods:</strong> If you served in multiple branches or had breaks in service, add additional periods below.
          </p>
        </div>

        {servicePeriods.map((period, index) => (
          <div key={period.id} style={{
            marginBottom: '24px',
            padding: '20px',
            background: index === 0 ? '#ffffff' : '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                {index === 0 ? '📋 Primary Service Period' : `📋 Service Period ${index + 1}`}
              </h3>
              {servicePeriods.length > 1 && index > 0 && (
                <button
                  onClick={() => removeServicePeriod(period.id)}
                  style={{
                    padding: '6px 12px',
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    color: '#991b1b',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ✕ Remove
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Branch */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Branch of Service <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={period.branch}
                  onChange={(e) => updateServicePeriod(period.id, 'branch', e.target.value)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1',
                  }}>
                  <option value="">Select branch...</option>
                  <option value="Army">Army</option>
                  <option value="Navy">Navy</option>
                  <option value="Air Force">Air Force</option>
                  <option value="Marine Corps">Marine Corps</option>
                  <option value="Coast Guard">Coast Guard</option>
                  <option value="Space Force">Space Force</option>
                  <option value="National Guard">National Guard</option>
                  <option value="Reserves">Reserves</option>
                </select>
              </div>

              {/* Rank */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Rank at Separation <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={period.rank}
                  onChange={(e) => updateServicePeriod(period.id, 'rank', e.target.value)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1',
                  }}>
                  <option value="">Select rank...</option>
                  <optgroup label="Enlisted (E-1 to E-9)">
                    <option value="E-1">E-1</option>
                    <option value="E-2">E-2</option>
                    <option value="E-3">E-3</option>
                    <option value="E-4">E-4</option>
                    <option value="E-5">E-5 (Sergeant/Petty Officer 2nd Class)</option>
                    <option value="E-6">E-6 (Staff Sergeant/Petty Officer 1st Class)</option>
                    <option value="E-7">E-7 (Sergeant First Class/Chief Petty Officer)</option>
                    <option value="E-8">E-8 (Master Sergeant/Senior Chief Petty Officer)</option>
                    <option value="E-9">E-9 (Sergeant Major/Master Chief Petty Officer)</option>
                  </optgroup>
                  <optgroup label="Warrant Officers (W-1 to W-5)">
                    <option value="W-1">W-1 (Warrant Officer 1)</option>
                    <option value="W-2">W-2 (Chief Warrant Officer 2)</option>
                    <option value="W-3">W-3 (Chief Warrant Officer 3)</option>
                    <option value="W-4">W-4 (Chief Warrant Officer 4)</option>
                    <option value="W-5">W-5 (Chief Warrant Officer 5)</option>
                  </optgroup>
                  <optgroup label="Officers (O-1 to O-10)">
                    <option value="O-1">O-1 (Second Lieutenant/Ensign)</option>
                    <option value="O-2">O-2 (First Lieutenant/Lieutenant JG)</option>
                    <option value="O-3">O-3 (Captain/Lieutenant)</option>
                    <option value="O-4">O-4 (Major/Lieutenant Commander)</option>
                    <option value="O-5">O-5 (Lieutenant Colonel/Commander)</option>
                    <option value="O-6">O-6 (Colonel/Captain)</option>
                    <option value="O-7">O-7 (Brigadier General/Rear Admiral Lower Half)</option>
                    <option value="O-8">O-8 (Major General/Rear Admiral Upper Half)</option>
                    <option value="O-9">O-9 (Lieutenant General/Vice Admiral)</option>
                    <option value="O-10">O-10 (General/Admiral)</option>
                  </optgroup>
                </select>
              </div>

              {/* Entry Date */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Entry Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={period.entryDate}
                  onChange={(e) => updateServicePeriod(period.id, 'entryDate', e.target.value)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1',
                  }}
                />
              </div>

              {/* Separation Date */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Separation Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={period.separationDate}
                  onChange={(e) => updateServicePeriod(period.id, 'separationDate', e.target.value)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1',
                  }}
                />
              </div>

              {/* Character of Service */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Character of Service <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={period.characterOfService}
                  onChange={(e) => updateServicePeriod(period.id, 'characterOfService', e.target.value)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1',
                  }}>
                  <option value="">Select...</option>
                  <option value="Honorable">Honorable</option>
                  <option value="General">General (Under Honorable Conditions)</option>
                  <option value="OTH">Other Than Honorable (OTH)</option>
                  <option value="Bad Conduct">Bad Conduct</option>
                  <option value="Dishonorable">Dishonorable</option>
                </select>
              </div>

              {/* MOS/AFSC */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  MOS/AFSC/Rating
                </label>
                <input
                  type="text"
                  value={period.mos}
                  onChange={(e) => updateServicePeriod(period.id, 'mos', e.target.value)}
                  placeholder="e.g., 11B, 2T2X1, HM"
                  style={{
                    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1',
                  }}
                />
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  Helps match you to civilian jobs and certifications
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Another Service Period Button */}
        <button
          onClick={addServicePeriod}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '24px',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          + Add Another Service Period
        </button>

        {/* Location Section */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
            📍 Location Information
          </h3>

          {/* Out of Country Checkbox */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isOutOfCountry}
                onChange={(e) => {
                  setIsOutOfCountry(e.target.checked);
                  if (!e.target.checked) setCountryOfResidence('');
                }}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: '500' }}>I currently reside outside the United States</span>
            </label>
          </div>

          {!isOutOfCountry ? (
            /* State Selector */
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                State of Residence <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select value={stateOfResidence} onChange={(e) => setStateOfResidence(e.target.value)} style={{
                width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1',
              }}>
                <option value="">Select state or territory...</option>
                <optgroup label="States">
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                </optgroup>
                <optgroup label="US Territories">
                  <option value="AS">American Samoa</option>
                  <option value="GU">Guam</option>
                  <option value="MP">Northern Mariana Islands</option>
                  <option value="PR">Puerto Rico</option>
                  <option value="VI">US Virgin Islands</option>
                </optgroup>
              </select>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Helps determine state-specific veteran benefits
              </div>
            </div>
          ) : (
            /* Country Selector */
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Country of Residence <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={countryOfResidence}
                onChange={(e) => setCountryOfResidence(e.target.value)}
                placeholder="e.g., Germany, Japan, United Kingdom"
                style={{
                  width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1',
                }}
              />
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Enter the country where you currently reside
              </div>
            </div>
          )}
        </div>

        {/* Retirement Section */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
            🎖️ Retirement Status
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* 20+ Year Retirement */}
            <div style={{
              padding: '16px',
              background: has20YearRetirement ? '#eff6ff' : '#f8fafc',
              border: has20YearRetirement ? '2px solid #3b82f6' : '2px solid #e2e8f0',
              borderRadius: '8px',
            }}>
              <label style={{ display: 'flex', alignItems: 'start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={has20YearRetirement}
                  onChange={(e) => setHas20YearRetirement(e.target.checked)}
                  style={{ width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                    20+ Year Retirement
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Retired with 20 or more years of service
                  </div>
                </div>
              </label>
            </div>

            {/* Medically Retired */}
            <div style={{
              padding: '16px',
              background: isMedicallyRetired ? '#fef3c7' : '#f8fafc',
              border: isMedicallyRetired ? '2px solid #f59e0b' : '2px solid #e2e8f0',
              borderRadius: '8px',
            }}>
              <label style={{ display: 'flex', alignItems: 'start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isMedicallyRetired}
                  onChange={(e) => setIsMedicallyRetired(e.target.checked)}
                  style={{ width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                    Medically Retired
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Retired due to disability (any years of service)
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* CRSC Section */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
            ⚔️ Combat-Related Special Compensation (CRSC)
          </h3>

          <div style={{
            padding: '16px',
            background: isCollectingCRSC ? '#dcfce7' : '#f8fafc',
            border: isCollectingCRSC ? '2px solid #22c55e' : '2px solid #e2e8f0',
            borderRadius: '8px',
          }}>
            <label style={{ display: 'flex', alignItems: 'start', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isCollectingCRSC}
                onChange={(e) => setIsCollectingCRSC(e.target.checked)}
                style={{ width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                  I am currently receiving CRSC
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  Combat-Related Special Compensation - Tax-free payment for combat-related disabilities
                </div>
                {isCollectingCRSC && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#ffffff',
                    border: '1px solid #22c55e',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#166534',
                  }}>
                    ✓ CRSC status will be included in your benefits analysis
                  </div>
                )}
              </div>
            </label>
          </div>

          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#92400e',
          }}>
            <strong>Note:</strong> CRSC provides tax-free compensation for disabilities incurred in combat or combat-related activities. You cannot receive both CRSC and CRDP simultaneously.
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div style={{
            marginTop: '20px', padding: '12px 16px', background: '#fef2f2', borderRadius: '6px',
            border: '1px solid #ef4444', color: '#dc2626',
          }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Please fix the following:</div>
            <ul style={{ paddingLeft: '24px', margin: 0 }}>
              {validationErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
          </div>

          {/* Right Column - Disability Calculator & Quick Tools */}
          <div className="space-y-6">
            {/* VA Disability Calculator */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}>
              <DisabilityCalculator
                initialDisabilities={disabilities}
                onCalculationChange={() => {}}
              />
            </div>

            {/* Quick Access Tools */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>⚡ Quick Access Tools</h2>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                Instant access to critical veteran resources
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <button
                  onClick={() => handleQuickAccessTool('dd214')}
                  style={{
                    padding: '12px 16px',
                    background: '#eff6ff',
                    border: '1px solid #3b82f6',
                    borderRadius: '6px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>📄</span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e3a8a', fontSize: '14px' }}>Download My DD-214</div>
                  </div>
                </button>
                <button
                  onClick={() => handleQuickAccessTool('rating')}
                  style={{
                    padding: '12px 16px',
                    background: '#f0fdf4',
                    border: '1px solid #22c55e',
                    borderRadius: '6px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>📋</span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#166534', fontSize: '14px' }}>Download My Rating Letter</div>
                  </div>
                </button>
                <button
                  onClick={() => handleQuickAccessTool('state')}
                  style={{
                    padding: '12px 16px',
                    background: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '6px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>🏛️</span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#92400e', fontSize: '14px' }}>Check My State Benefits</div>
                  </div>
                </button>
                <button
                  onClick={() => handleQuickAccessTool('federal')}
                  style={{
                    padding: '12px 16px',
                    background: '#eff6ff',
                    border: '1px solid #3b82f6',
                    borderRadius: '6px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>🦅</span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e3a8a', fontSize: '14px' }}>Check My Federal Benefits</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Full-Width Quick Access Tools Section (Old - can be removed) */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '32px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        marginBottom: '32px',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>⚡ Quick Access Tools</h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
          Instant access to critical veteran resources and eligibility checks
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Tool 1: Download DD-214 */}
          <button
            onClick={() => handleQuickAccessTool('dd214')}
            style={{
              padding: '16px',
              background: '#eff6ff',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📄</div>
            <div style={{ fontWeight: '600', color: '#1e3a8a' }}>Download My DD-214</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Get links to download your service records
            </div>
          </button>

          {/* Tool 2: Download Rating Letter */}
          <button
            onClick={() => handleQuickAccessTool('rating')}
            style={{
              padding: '16px',
              background: '#eff6ff',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
            <div style={{ fontWeight: '600', color: '#1e3a8a' }}>Download My VA Rating Letter</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Access your rating decision and conditions
            </div>
          </button>

          {/* Tool 3: MOS Equivalents */}
          <button
            onClick={() => handleQuickAccessTool('mos')}
            disabled={!mos}
            style={{
              padding: '16px',
              background: mos ? '#f0fdf4' : '#f8fafc',
              border: `1px solid ${mos ? '#10b981' : '#cbd5e1'}`,
              borderRadius: '8px',
              textAlign: 'left',
              cursor: mos ? 'pointer' : 'not-allowed',
              opacity: mos ? 1 : 0.6,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => mos && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💼</div>
            <div style={{ fontWeight: '600', color: '#064e3b' }}>Find My MOS Civilian Equivalents</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              {mos ? 'Translate MOS to civilian job matches' : 'Enter MOS above first'}
            </div>
          </button>

          {/* Tool 4: State Benefits */}
          <button
            onClick={() => handleQuickAccessTool('state')}
            style={{
              padding: '16px',
              background: '#fefce8',
              border: '1px solid #eab308',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗺️</div>
            <div style={{ fontWeight: '600', color: '#713f12' }}>Check My State Benefits</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Discover state-specific veteran benefits
            </div>
          </button>

          {/* Tool 5: Federal Benefits */}
          <button
            onClick={() => handleQuickAccessTool('federal')}
            style={{
              padding: '16px',
              background: '#eff6ff',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🇺🇸</div>
            <div style={{ fontWeight: '600', color: '#1e3a8a' }}>Check My Federal Benefits</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              See VA healthcare, loans, and more
            </div>
          </button>

          {/* Tool 6: Deployment Exposures */}
          <button
            onClick={() => handleQuickAccessTool('exposures')}
            style={{
              padding: '16px',
              background: '#fef2f2',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
            <div style={{ fontWeight: '600', color: '#7f1d1d' }}>Check My Deployment Exposures</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Burn pits, Agent Orange, and more
            </div>
          </button>

          {/* Tool 7: GI Bill Eligibility */}
          <button
            onClick={() => handleQuickAccessTool('gibill')}
            style={{
              padding: '16px',
              background: '#f0fdf4',
              border: '1px solid #10b981',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎓</div>
            <div style={{ fontWeight: '600', color: '#064e3b' }}>Check My GI Bill Eligibility</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Calculate GI Bill percentage and BAH
            </div>
          </button>

          {/* Tool 8: Housing Eligibility */}
          <button
            onClick={() => handleQuickAccessTool('housing')}
            style={{
              padding: '16px',
              background: '#fefce8',
              border: '1px solid #eab308',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏠</div>
            <div style={{ fontWeight: '600', color: '#713f12' }}>Check My Housing Eligibility</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              VA loans, SAH/SHA grants, and more
            </div>
          </button>

          {/* Tool 9: Family Benefits */}
          <button
            onClick={() => handleQuickAccessTool('family')}
            style={{
              padding: '16px',
              background: '#fdf2f8',
              border: '1px solid #ec4899',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>👨‍👩‍👧‍👦</div>
            <div style={{ fontWeight: '600', color: '#831843' }}>Check My Family Benefits</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              CHAMPVA, DEA, and caregiver support
            </div>
          </button>

          {/* Tool 10: Transition Tasks */}
          <button
            onClick={() => handleQuickAccessTool('transition')}
            disabled={!separationDate}
            style={{
              padding: '16px',
              background: separationDate ? '#eff6ff' : '#f8fafc',
              border: `1px solid ${separationDate ? '#3b82f6' : '#cbd5e1'}`,
              borderRadius: '8px',
              textAlign: 'left',
              cursor: separationDate ? 'pointer' : 'not-allowed',
              opacity: separationDate ? 1 : 0.6,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => separationDate && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontWeight: '600', color: '#1e3a8a' }}>Check My Transition Tasks</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              {separationDate ? 'TAP checklist and timeline' : 'Enter separation date first'}
            </div>
          </button>
        </div>
      </div>

      {/* Quick Access Results Modal */}
      {showQuickAccessTools && quickAccessResult && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowQuickAccessTools(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '12px',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: '32px',
              margin: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                  {quickAccessResult.success ? '✅' : '❌'} {quickAccessResult.message}
                </h2>
                {quickAccessResult.nextSteps && (
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {quickAccessResult.nextSteps.length} next steps
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowQuickAccessTools(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '13px' }}>
                {JSON.stringify(quickAccessResult.data, null, 2)}
              </pre>
            </div>

            {quickAccessResult.nextSteps && quickAccessResult.nextSteps.length > 0 && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Next Steps:</h3>
                <ul style={{ paddingLeft: '24px', marginBottom: '20px' }}>
                  {quickAccessResult.nextSteps.map((step: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: '8px', color: '#334155' }}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setShowQuickAccessTools(false)}
              style={{
                padding: '12px 24px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
        <button onClick={onBack} style={{
          padding: '14px 40px',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          color: '#1e293b',
          fontSize: '16px',
          backdropFilter: 'blur(10px)',
        }}>
          ← Back
        </button>
        <button onClick={handleContinue} style={{
          padding: '14px 40px',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '16px',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
        }}>
          Continue →
        </button>
      </div>
      </div>
    </div>
  );
};

export default VeteranBasicsPage;
