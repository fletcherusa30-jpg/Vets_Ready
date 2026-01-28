/**
 * Complete 6-Step Claim Preparation Wizard
 * VetsReady Platform - Educational & Preparatory Tool
 *
 * Guides veterans through comprehensive claim preparation process.
 * DOES NOT file claims - prepares veterans for VA.gov submission.
 *
 * Steps:
 * 1. Veteran Basics
 * 2. Disability Information
 * 3. Symptoms & Evidence
 * 4. Claim Goals
 * 5. Benefits Matrix (auto-populated)
 * 6. Claim Preparation Summary
 */

import React, { useState, useEffect } from 'react';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import { evaluateBenefits } from '../services/BenefitsEvaluator';
import {
  generateClaimStrategy,
  generateEvidenceChecklist,
  suggestSecondaryConditions
} from '../services/ClaimPreparationEngine';
import type { VeteranWizardData } from '../types/wizardTypes';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  ExternalLink,
  Info,
  Shield,
  Stethoscope,
  Target,
  Gift,
  ClipboardCheck
} from 'lucide-react';

const CompleteClaimWizard: React.FC = () => {
  const { profile } = useVeteranProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<VeteranWizardData>({
    basics: {
      branch: profile.branch || '',
      serviceStartDate: profile.serviceStartDate || '',
      serviceEndDate: profile.serviceEndDate || '',
      deployments: (profile.deployments || []).map(d => ({ ...d, combatZone: (d as any).combatZone || false })),
      combatVeteran: profile.hasCombatService || false,
      dischargeType: ''
    },
    disability: {
      currentRating: profile.vaDisabilityRating || 0,
      isPermanentAndTotal: profile.isPermanentAndTotal || false,
      isTDIU: profile.isTDIU || false,
      hasSMC: profile.hasSMC || false,
      conditions: (profile.serviceConnectedConditions || []).map(c => ({ ...c, bilateral: false, diagnosticCode: undefined }))
    },
    symptomsEvidence: {
      symptoms: [],
      evidenceUploaded: [],
      layStatements: [],
      buddyStatements: 0,
      hasDBQ: false,
      hasPrivateMedicalOpinion: false
    },
    claimGoals: {
      goalType: 'help_decide',
      targetCondition: '',
      primaryCondition: '',
      targetRating: undefined,
      reasoning: ''
    },
    benefits: {
      federalBenefits: [],
      stateBenefits: [],
      estimatedValue: ''
    },
    claimPrep: {
      cfrCriteria: '',
      evidenceChecklist: [],
      missingEvidence: [],
      suggestedStrategy: '',
      secondaryConnections: [],
      layStatementTemplates: [],
      dbqGuidance: '',
      nextSteps: []
    }
  });

  const steps = [
    { number: 1, name: 'Veteran Basics', icon: Shield },
    { number: 2, name: 'Disability Info', icon: Stethoscope },
    { number: 3, name: 'Symptoms & Evidence', icon: FileText },
    { number: 4, name: 'Claim Goals', icon: Target },
    { number: 5, name: 'Benefits Matrix', icon: Gift },
    { number: 6, name: 'Claim Summary', icon: ClipboardCheck }
  ];

  /**
   * Save wizard data to localStorage
   */
  useEffect(() => {
    localStorage.setItem('vetsReadyWizardData', JSON.stringify(wizardData));
  }, [wizardData]);

  /**
   * Load wizard data from localStorage
   */
  useEffect(() => {
    const saved = localStorage.getItem('vetsReadyWizardData');
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        setWizardData(loaded);
      } catch (err) {
        console.error('[Wizard] Failed to load saved data:', err);
      }
    }
  }, []);

  /**
   * Navigate to next step
   */
  const nextStep = () => {
    if (currentStep < 6) {
      // Auto-populate benefits matrix at step 5
      if (currentStep === 4) {
        evaluateBenefitsMatrix();
      }
      // Generate claim prep summary at step 6
      if (currentStep === 5) {
        generateClaimPrepSummary();
      }
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  /**
   * Navigate to previous step
   */
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  /**
   * Jump to specific step
   */
  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };

  /**
   * Evaluate benefits matrix (Step 5)
   */
  const evaluateBenefitsMatrix = () => {
    const inputs = {
      vaDisabilityRating: wizardData.disability.currentRating,
      isPermanentAndTotal: wizardData.disability.isPermanentAndTotal,
      isTDIU: wizardData.disability.isTDIU,
      hasSMC: wizardData.disability.hasSMC,
      state: profile.state || '',
      serviceConnectedDisabilities: wizardData.disability.conditions,
      hasDependents: (profile.numberOfDependents || 0) > 0,
      numberOfDependents: profile.numberOfDependents,
      isHomeowner: profile.isHomeowner,
      branchOfService: wizardData.basics.branch,
      yearsOfService: profile.yearsOfService
    };

    const result = evaluateBenefits(inputs as any);

    setWizardData(prev => ({
      ...prev,
      benefits: {
        federalBenefits: result.matchedBenefits.federal,
        stateBenefits: result.matchedBenefits.state,
        estimatedValue: `${result.totalMatches} benefits found`
      }
    }));
  };

  /**
   * Generate claim preparation summary (Step 6)
   */
  const generateClaimPrepSummary = () => {
    const { goalType, targetCondition, primaryCondition, targetRating } = wizardData.claimGoals;
    const { currentRating } = wizardData.disability;

    if (!targetCondition) return;

    const strategy = generateClaimStrategy(
      targetCondition,
      goalType === 'help_decide' ? 'new' : goalType as any,
      currentRating,
      targetRating,
      primaryCondition
    );

    const evidenceChecklists = generateEvidenceChecklist(
      targetCondition,
      goalType === 'help_decide' ? 'new' : goalType as any
    );

    const secondaryConnections = suggestSecondaryConditions(targetCondition);

    const nextSteps = [
      'Review your evidence checklist and gather missing documents',
      'Complete your lay statement using the provided template',
      'Obtain medical nexus opinion from healthcare provider',
      'Consider filing secondary claims for suggested conditions',
      'Visit VA.gov to file your claim online',
      'Contact an accredited VSO for free assistance'
    ];

    setWizardData(prev => ({
      ...prev,
      claimPrep: {
        cfrCriteria: strategy.cfrCriteria,
        evidenceChecklist: evidenceChecklists,
        missingEvidence: strategy.evidenceMissing,
        suggestedStrategy: strategy.suggestedStrategy,
        secondaryConnections,
        layStatementTemplates: strategy.layStatementTopics,
        dbqGuidance: `DBQ (Disability Benefits Questionnaire) for ${targetCondition} can expedite your claim. Ask your healthcare provider to complete the DBQ form.`,
        nextSteps
      }
    }));
  };

  /**
   * Export claim preparation summary
   */
  const exportSummary = () => {
    const summary = generateHTMLSummary();
    const blob = new Blob([summary], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VetsReady-ClaimPrep-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Generate HTML summary for export
   */
  const generateHTMLSummary = (): string => {
    const { targetCondition } = wizardData.claimGoals;
    const veteranName = `${profile.firstName} ${profile.lastName}`;

    return `
<!DOCTYPE html>
<html>
<head>
  <title>VetsReady Claim Preparation Summary</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #1a56db; }
    h2 { color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    h3 { color: #6b7280; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
    .checklist { list-style: none; padding: 0; }
    .checklist li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .required { color: #dc2626; font-weight: bold; }
    .next-steps { background: #dbeafe; padding: 16px; border-radius: 8px; }
    pre { background: #f3f4f6; padding: 12px; border-radius: 4px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>🎖️ VetsReady Claim Preparation Summary</h1>
  <p><strong>Veteran:</strong> ${veteranName}</p>
  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  <p><strong>Target Condition:</strong> ${targetCondition || 'Not specified'}</p>
  <p><strong>Claim Type:</strong> ${wizardData.claimGoals.goalType}</p>
  <p><strong>Current VA Rating:</strong> ${wizardData.disability.currentRating}%</p>

  <div class="warning">
    <strong>⚠️ IMPORTANT DISCLAIMER:</strong><br>
    This document is for educational and preparatory purposes only. It does NOT file a VA claim.
    All claims must be filed through the official VA website at <a href="https://www.va.gov/disability/file-disability-claim/">VA.gov</a>.
  </div>

  <h2>📋 Claim Strategy</h2>
  <pre>${wizardData.claimPrep.suggestedStrategy}</pre>

  <h2>⚖️ CFR Rating Criteria</h2>
  <pre>${wizardData.claimPrep.cfrCriteria}</pre>

  <h2>✅ Evidence Checklist</h2>
  ${wizardData.claimPrep.evidenceChecklist.map(checklist => `
    <h3>${checklist.category}</h3>
    <ul class="checklist">
      ${checklist.items.map(item => `
        <li>
          <input type="checkbox" ${item.provided ? 'checked' : ''}>
          ${item.required ? '<span class="required">[REQUIRED]</span> ' : ''}
          ${item.item}
          ${item.notes ? `<br><em>${item.notes}</em>` : ''}
        </li>
      `).join('')}
    </ul>
  `).join('')}

  <h2>🔗 Suggested Secondary Conditions</h2>
  <ul>
    ${wizardData.claimPrep.secondaryConnections.map(cond => `<li>${cond}</li>`).join('')}
  </ul>

  <h2>📝 Lay Statement Topics</h2>
  <ul>
    ${wizardData.claimPrep.layStatementTemplates.map(topic => `<li>${topic}</li>`).join('')}
  </ul>

  <h2>🎯 Next Steps</h2>
  <div class="next-steps">
    <ol>
      ${wizardData.claimPrep.nextSteps.map(step => `<li>${step}</li>`).join('')}
    </ol>
  </div>

  <h2>🌐 File Your Claim at VA.gov</h2>
  <p><strong>Ready to file? Visit:</strong></p>
  <p><a href="https://www.va.gov/disability/file-disability-claim/" style="font-size: 18px; color: #1a56db;">
    https://www.va.gov/disability/file-disability-claim/
  </a></p>

  <hr style="margin: 40px 0;">
  <p style="font-size: 12px; color: #6b7280;">
    Generated by VetsReady.com - Educational Tool Only<br>
    Not affiliated with the Department of Veterans Affairs
  </p>
</body>
</html>
    `.trim();
  };

  /**
   * Render Step 1: Veteran Basics
   */
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-blue-800 dark:text-blue-200 flex items-start">
          <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>This information helps us understand your service history and eligibility for benefits.</span>
        </p>
      </div>

      {/* Branch */}
      <div>
        <label htmlFor="branch" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Branch of Service
        </label>
        <select
          id="branch"
          name="branch"
          value={wizardData.basics.branch}
          onChange={(e) => setWizardData(prev => ({
            ...prev,
            basics: { ...prev.basics, branch: e.target.value }
          }))}
          className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Branch</option>
          <option value="Army">Army</option>
          <option value="Navy">Navy</option>
          <option value="Air Force">Air Force</option>
          <option value="Marine Corps">Marine Corps</option>
          <option value="Coast Guard">Coast Guard</option>
          <option value="Space Force">Space Force</option>
        </select>
      </div>

      {/* Service Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="service-start" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Service Start Date
          </label>
          <input
            type="date"
            id="service-start"
            name="service-start"
            value={wizardData.basics.serviceStartDate}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              basics: { ...prev.basics, serviceStartDate: e.target.value }
            }))}
            className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="service-end" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Service End Date
          </label>
          <input
            type="date"
            id="service-end"
            name="service-end"
            value={wizardData.basics.serviceEndDate}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              basics: { ...prev.basics, serviceEndDate: e.target.value }
            }))}
            className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Combat Veteran */}
      <div>
        <label htmlFor="combat-veteran" className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="combat-veteran"
            name="combat-veteran"
            checked={wizardData.basics.combatVeteran}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              basics: { ...prev.basics, combatVeteran: e.target.checked }
            }))}
            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
          <span className="ml-3 text-gray-900 dark:text-white font-medium">
            I am a combat veteran
          </span>
        </label>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 ml-8">
          Combat veterans have reduced burden of proof for service connection
        </p>
      </div>

      {/* Discharge Type */}
      <div>
        <label htmlFor="discharge-type" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Discharge Type
        </label>
        <select
          id="discharge-type"
          name="discharge-type"
          value={wizardData.basics.dischargeType}
          onChange={(e) => setWizardData(prev => ({
            ...prev,
            basics: { ...prev.basics, dischargeType: e.target.value }
          }))}
          className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">Select Discharge Type</option>
          <option value="Honorable">Honorable</option>
          <option value="General Under Honorable Conditions">General Under Honorable Conditions</option>
          <option value="Other Than Honorable">Other Than Honorable</option>
          <option value="Medical">Medical</option>
        </select>
      </div>
    </div>
  );

  /**
   * Render Step 2: Disability Information
   */
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-blue-800 dark:text-blue-200 flex items-start">
          <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>Provide your current VA disability rating and service-connected conditions.</span>
        </p>
      </div>

      {/* Current Rating */}
      <div>
        <label htmlFor="current-rating" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Current VA Disability Rating: {wizardData.disability.currentRating}%
        </label>
        <input
          type="range"
          id="current-rating"
          name="current-rating"
          min="0"
          max="100"
          step="10"
          value={wizardData.disability.currentRating}
          onChange={(e) => setWizardData(prev => ({
            ...prev,
            disability: { ...prev.disability, currentRating: Number(e.target.value) }
          }))}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Special Statuses */}
      <div className="space-y-3">
        <label htmlFor="p-and-t" className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="p-and-t"
            name="p-and-t"
            checked={wizardData.disability.isPermanentAndTotal}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              disability: { ...prev.disability, isPermanentAndTotal: e.target.checked }
            }))}
            className="h-5 w-5 text-blue-600 rounded"
          />
          <span className="ml-3 text-gray-900 dark:text-white">
            Permanent & Total (P&T)
          </span>
        </label>

        <label htmlFor="tdiu" className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="tdiu"
            name="tdiu"
            checked={wizardData.disability.isTDIU}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              disability: { ...prev.disability, isTDIU: e.target.checked }
            }))}
            className="h-5 w-5 text-blue-600 rounded"
          />
          <span className="ml-3 text-gray-900 dark:text-white">
            TDIU (Total Disability Individual Unemployability)
          </span>
        </label>

        <label htmlFor="smc" className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="smc"
            name="smc"
            checked={wizardData.disability.hasSMC}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              disability: { ...prev.disability, hasSMC: e.target.checked }
            }))}
            className="h-5 w-5 text-blue-600 rounded"
          />
          <span className="ml-3 text-gray-900 dark:text-white">
            SMC (Special Monthly Compensation)
          </span>
        </label>
      </div>
    </div>
  );

  /**
   * Render Step 3: Symptoms & Evidence
   */
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-blue-800 dark:text-blue-200 flex items-start">
          <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>Document your symptoms and evidence. This will help us prepare your claim checklist.</span>
        </p>
      </div>

      {/* Evidence Checklist */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Evidence Available</h3>

        <label htmlFor="has-dbq" className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="has-dbq"
            name="has-dbq"
            checked={wizardData.symptomsEvidence.hasDBQ}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              symptomsEvidence: { ...prev.symptomsEvidence, hasDBQ: e.target.checked }
            }))}
            className="h-5 w-5 text-blue-600 rounded"
          />
          <span className="ml-3 text-gray-900 dark:text-white">
            I have a completed DBQ (Disability Benefits Questionnaire)
          </span>
        </label>

        <label htmlFor="has-private-opinion" className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="has-private-opinion"
            name="has-private-opinion"
            checked={wizardData.symptomsEvidence.hasPrivateMedicalOpinion}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              symptomsEvidence: { ...prev.symptomsEvidence, hasPrivateMedicalOpinion: e.target.checked }
            }))}
            className="h-5 w-5 text-blue-600 rounded"
          />
          <span className="ml-3 text-gray-900 dark:text-white">
            I have a private medical opinion / Nexus letter
          </span>
        </label>

        <div>
          <label htmlFor="buddy-statements" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Number of Buddy Statements
          </label>
          <input
            type="number"
            id="buddy-statements"
            name="buddy-statements"
            min="0"
            value={wizardData.symptomsEvidence.buddyStatements}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              symptomsEvidence: { ...prev.symptomsEvidence, buddyStatements: Number(e.target.value) }
            }))}
            className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );

  /**
   * Render Step 4: Claim Goals
   */
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-blue-800 dark:text-blue-200 flex items-start">
          <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>What type of claim are you preparing?</span>
        </p>
      </div>

      {/* Claim Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { value: 'new', label: 'New Service Connection', desc: 'Connecting a new condition to service' },
          { value: 'increase', label: 'Increase Existing Rating', desc: 'Condition has worsened' },
          { value: 'secondary', label: 'Secondary Service Connection', desc: 'Caused by existing condition' },
          { value: 'supplemental', label: 'Supplemental Claim', desc: 'New evidence for denied claim' }
        ].map(type => (
          <button
            key={type.value}
            onClick={() => setWizardData(prev => ({
              ...prev,
              claimGoals: { ...prev.claimGoals, goalType: type.value as any }
            }))}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              wizardData.claimGoals.goalType === type.value
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            <div className="font-semibold text-gray-900 dark:text-white">{type.label}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{type.desc}</div>
          </button>
        ))}
      </div>

      {/* Target Condition */}
      <div>
        <label htmlFor="target-condition" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Condition Name
        </label>
        <input
          type="text"
          id="target-condition"
          name="target-condition"
          value={wizardData.claimGoals.targetCondition}
          onChange={(e) => setWizardData(prev => ({
            ...prev,
            claimGoals: { ...prev.claimGoals, targetCondition: e.target.value }
          }))}
          placeholder="e.g., PTSD, Knee pain, Tinnitus"
          className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Secondary Claim - Primary Condition */}
      {wizardData.claimGoals.goalType === 'secondary' && (
        <div>
          <label htmlFor="primary-condition" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Primary Service-Connected Condition
          </label>
          <input
            type="text"
            id="primary-condition"
            name="primary-condition"
            value={wizardData.claimGoals.primaryCondition}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              claimGoals: { ...prev.claimGoals, primaryCondition: e.target.value }
            }))}
            placeholder="e.g., PTSD"
            className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            The existing service-connected condition that caused or aggravated this condition
          </p>
        </div>
      )}

      {/* Increase Claim - Target Rating */}
      {wizardData.claimGoals.goalType === 'increase' && (
        <div>
          <label htmlFor="target-rating" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Target Rating: {wizardData.claimGoals.targetRating || 0}%
          </label>
          <input
            type="range"
            id="target-rating"
            name="target-rating"
            min={wizardData.disability.currentRating}
            max="100"
            step="10"
            value={wizardData.claimGoals.targetRating || wizardData.disability.currentRating}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              claimGoals: { ...prev.claimGoals, targetRating: Number(e.target.value) }
            }))}
            className="w-full"
          />
        </div>
      )}
    </div>
  );

  /**
   * Render Step 5: Benefits Matrix
   */
  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <p className="text-green-800 dark:text-green-200 flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>Based on your information, you may qualify for these benefits:</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {wizardData.benefits.federalBenefits.length}
          </div>
          <div className="text-gray-700 dark:text-gray-300 mt-1">Federal Benefits</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {wizardData.benefits.stateBenefits.length}
          </div>
          <div className="text-gray-700 dark:text-gray-300 mt-1">State Benefits</div>
        </div>
      </div>

      <div className="text-center">
        <a
          href="/benefits-matrix"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          View Full Benefits Matrix
          <ExternalLink className="ml-2 h-5 w-5" />
        </a>
      </div>
    </div>
  );

  /**
   * Render Step 6: Claim Preparation Summary
   */
  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <p className="text-green-800 dark:text-green-200 flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>Your personalized claim preparation summary is ready!</span>
        </p>
      </div>

      {/* CFR Criteria */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">⚖️ CFR Rating Criteria</h3>
        <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded">
          {wizardData.claimPrep.cfrCriteria || 'Enter a condition in Step 4 to see rating criteria'}
        </pre>
      </div>

      {/* Suggested Strategy */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🎯 Claim Strategy</h3>
        <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded">
          {wizardData.claimPrep.suggestedStrategy}
        </pre>
      </div>

      {/* Evidence Checklist */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">✅ Evidence Checklist</h3>
        {wizardData.claimPrep.evidenceChecklist.map((checklist, idx) => (
          <div key={idx} className="mb-4">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{checklist.category}</h4>
            <ul className="space-y-2">
              {checklist.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start text-sm">
                  <input type="checkbox" className="mt-1 mr-2" aria-label="Accept acknowledgment" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.required && <span className="text-red-600 font-bold">[REQUIRED] </span>}
                    {item.item}
                    {item.notes && <span className="text-gray-500 italic"> - {item.notes}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Secondary Conditions */}
      {wizardData.claimPrep.secondaryConnections.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🔗 Consider Secondary Claims For:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {wizardData.claimPrep.secondaryConnections.map((cond, idx) => (
              <li key={idx} className="text-gray-700 dark:text-gray-300 flex items-center">
                <ChevronRight className="h-4 w-4 text-blue-600 mr-2" />
                {cond}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-200 mb-4">🎯 Next Steps</h3>
        <ol className="space-y-2 list-decimal list-inside">
          {wizardData.claimPrep.nextSteps.map((step, idx) => (
            <li key={idx} className="text-blue-800 dark:text-blue-300">{step}</li>
          ))}
        </ol>
      </div>

      {/* Export & File */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={exportSummary}
          className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
        >
          <Download className="mr-2 h-5 w-5" />
          Download Summary
        </button>
        <a
          href="https://www.va.gov/disability/file-disability-claim/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          File Claim at VA.gov
          <ExternalLink className="ml-2 h-5 w-5" />
        </a>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>Important:</strong> This tool prepares you for filing. It does NOT file your VA claim.
            All claims must be filed through the official VA website. Consider consulting with an accredited
            Veterans Service Officer (VSO) for free assistance.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Claim Preparation Wizard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Step-by-step guidance to prepare your VA disability claim
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;

              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => goToStep(step.number)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                    </button>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center max-w-[80px]">
                      {step.name}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${isCompleted ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Step {currentStep}: {steps[currentStep - 1].name}
          </h2>

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Previous
          </button>
          <button
            onClick={nextStep}
            disabled={currentStep === 6}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {currentStep === 5 ? 'Generate Summary' : 'Next'}
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteClaimWizard;
