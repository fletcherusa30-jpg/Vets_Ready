/**
 * Disability Service Connection Wizard
 *
 * A multi-step guided experience that helps veterans:
 * 1. Confirm their service-connected disabilities
 * 2. Add current/planned/denied conditions
 * 3. Discover AI-suggested secondary conditions
 * 4. Build theories of entitlement
 * 5. Project effective dates
 * 6. Export their claim strategy
 */

import React, { useState, useEffect } from 'react';
import { useDisabilityContext } from '../contexts/DisabilityContext';
import {
  WizardState,
  WizardStep,
  Disability,
  AiSuggestion,
  ComplexityLevel,
} from '../types/wizard.types';
import { WizardStepper } from './wizard/WizardStepper';
import { StepServiceConnected } from './wizard/StepServiceConnected';
import { StepAddConditions } from './wizard/StepAddConditions';
import { StepAISuggestions } from './wizard/StepAISuggestions';
import { StepTheoryBuilder } from './wizard/StepTheoryBuilder';
import { StepReview } from './wizard/StepReview';

export const DisabilityWizard: React.FC = () => {
  const { serviceConnectedConditions, deniedConditions } = useDisabilityContext();

  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 1,
    completedSteps: [],
    serviceConnectedDisabilities: [],
    candidateConditions: [],
    deniedConditions: [],
    grantedConditions: [],
    aiSuggestions: {},
    activeSuggestions: [],
    includeSecondaryAnalysis: true,
    includePolicyReferences: true,
    includeEffectiveDateProjections: true,
    focusAreas: [],
    claimStrategy: 'balanced',
    complexity: 'simple',
    isDirty: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define wizard steps
  const steps: WizardStep[] = [
    {
      number: 1,
      id: 'service-connected',
      title: 'Confirm Service-Connected Disabilities',
      description: 'Review and confirm your existing service-connected disabilities',
      component: 'StepServiceConnected',
      isComplete: wizardState.serviceConnectedDisabilities.length > 0,
      isRequired: true,
    },
    {
      number: 2,
      id: 'add-conditions',
      title: 'Add Conditions',
      description: 'Add new, planned, or denied conditions to explore',
      component: 'StepAddConditions',
      isComplete: wizardState.candidateConditions.length > 0 || wizardState.deniedConditions.length > 0,
      isRequired: false,
    },
    {
      number: 3,
      id: 'ai-suggestions',
      title: 'AI Secondary Suggestions',
      description: 'Review AI-suggested secondary conditions based on your service-connected disabilities',
      component: 'StepAISuggestions',
      isComplete: Object.keys(wizardState.aiSuggestions).length > 0,
      isRequired: false,
    },
    {
      number: 4,
      id: 'theory-builder',
      title: 'Build Entitlement Theories',
      description: 'Generate service connection theories and evidence recommendations',
      component: 'StepTheoryBuilder',
      isComplete: false,
      isRequired: false,
    },
    {
      number: 5,
      id: 'review',
      title: 'Review & Export',
      description: 'Review your complete claim strategy and export documentation',
      component: 'StepReview',
      isComplete: false,
      isRequired: false,
    },
  ];

  // Initialize from context
  useEffect(() => {
    const initialServiceConnected: Disability[] = serviceConnectedConditions.map(condition => ({
      id: condition.id,
      name: condition.name,
      description: condition.description || '',
      serviceConnectionType: 'direct',
      status: 'service-connected',
      currentRating: condition.rating,
      isServiceConnected: true,
      primaryConditionIds: [],
      secondaryConditionIds: [],
      diagnosedInService: true,
      worsenedOverTime: false,
      symptoms: [],
      treatments: [],
      serviceHistory: '',
      nexusEvidence: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const initialDenied: Disability[] = deniedConditions.map(condition => ({
      id: condition.id,
      name: condition.name,
      description: condition.description,
      serviceConnectionType: condition.connectionType,
      status: 'denied',
      isServiceConnected: false,
      primaryConditionIds: condition.relatedConditionId ? [condition.relatedConditionId] : [],
      secondaryConditionIds: [],
      diagnosedInService: condition.diagnosedDuringService,
      worsenedOverTime: false,
      symptoms: condition.symptoms,
      treatments: condition.treatment,
      serviceHistory: condition.serviceHistory,
      nexusEvidence: condition.nexusEvidence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setWizardState(prev => ({
      ...prev,
      serviceConnectedDisabilities: initialServiceConnected,
      deniedConditions: initialDenied,
    }));
  }, [serviceConnectedConditions, deniedConditions]);

  // Calculate complexity
  useEffect(() => {
    const totalConditions =
      wizardState.serviceConnectedDisabilities.length +
      wizardState.candidateConditions.length +
      wizardState.deniedConditions.length;

    const hasSecondaryChain = wizardState.serviceConnectedDisabilities.some(
      d => d.secondaryConditionIds.length > 2
    );

    const hasDenials = wizardState.deniedConditions.length > 0;

    let complexity: ComplexityLevel = 'simple';
    if (totalConditions > 5 || hasSecondaryChain || hasDenials) {
      complexity = 'medium';
    }
    if (totalConditions > 10 || wizardState.deniedConditions.length > 2) {
      complexity = 'complex';
    }

    setWizardState(prev => ({ ...prev, complexity }));
  }, [wizardState.serviceConnectedDisabilities, wizardState.candidateConditions, wizardState.deniedConditions]);

  const handleNext = () => {
    setWizardState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, steps.length),
      completedSteps: [...new Set([...prev.completedSteps, prev.currentStep])],
    }));
  };

  const handlePrevious = () => {
    setWizardState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  };

  const handleStepClick = (stepNumber: number) => {
    setWizardState(prev => ({ ...prev, currentStep: stepNumber }));
  };

  const updateWizardState = (updates: Partial<WizardState>) => {
    setWizardState(prev => ({ ...prev, ...updates, isDirty: true }));
  };

  const renderCurrentStep = () => {
    const currentStepConfig = steps[wizardState.currentStep - 1];

    switch (currentStepConfig.id) {
      case 'service-connected':
        return (
          <StepServiceConnected
            wizardState={wizardState}
            updateWizardState={updateWizardState}
            onNext={handleNext}
          />
        );

      case 'add-conditions':
        return (
          <StepAddConditions
            wizardState={wizardState}
            updateWizardState={updateWizardState}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );

      case 'ai-suggestions':
        return (
          <StepAISuggestions
            wizardState={wizardState}
            updateWizardState={updateWizardState}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
          />
        );

      case 'theory-builder':
        return (
          <StepTheoryBuilder
            wizardState={wizardState}
            updateWizardState={updateWizardState}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
          />
        );

      case 'review':
        return (
          <StepReview
            wizardState={wizardState}
            onPrevious={handlePrevious}
          />
        );

      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Wizard Header */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">🧭 Disability Service Connection Wizard</h2>
            <p className="text-purple-200">
              Step-by-step guidance to build your VA claim strategy
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-200 mb-1">Complexity</div>
            <div className={`inline-block px-4 py-2 rounded-full font-bold ${
              wizardState.complexity === 'simple' ? 'bg-green-500' :
              wizardState.complexity === 'medium' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}>
              {wizardState.complexity.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <WizardStepper
        steps={steps}
        currentStep={wizardState.currentStep}
        completedSteps={wizardState.completedSteps}
        onStepClick={handleStepClick}
      />

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-8 min-h-[600px]">
        {renderCurrentStep()}
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-yellow-600 text-2xl mr-3">⚠️</span>
          <div>
            <h4 className="font-bold text-yellow-900 mb-1">Important Disclaimer</h4>
            <p className="text-sm text-yellow-800">
              This wizard provides educational information and suggestions to help you understand VA disability claims.
              <strong className="ml-1">This is NOT legal advice.</strong> Always consult with a VSO (Veterans Service Officer),
              accredited attorney, or VA-recognized representative for personalized assistance with your claim.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
