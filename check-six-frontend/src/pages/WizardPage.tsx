import React, { useState } from 'react';
import { WizardLayout } from '../components/wizard/WizardLayout';
import { StepVeteranBasics } from '../components/wizard/steps/StepVeteranBasics';
import { StepDisabilities } from '../components/wizard/steps/StepDisabilities';
import { StepRetirementCrsc } from '../components/wizard/steps/StepRetirementCrsc';
import { StepUploads } from '../components/wizard/steps/StepUploads';
import { StepHousing } from '../components/wizard/steps/StepHousing';
import { StepAppeals } from '../components/wizard/steps/StepAppeals';
import { StepSummary } from '../components/wizard/steps/StepSummary';

export const WizardPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepVeteranBasics />;
      case 2:
        return <StepDisabilities />;
      case 3:
        return <StepRetirementCrsc />;
      case 4:
        return <StepUploads />;
      case 5:
        return <StepHousing />;
      case 6:
        return <StepAppeals />;
      case 7:
        return <StepSummary />;
      default:
        return <StepVeteranBasics />;
    }
  };

  return (
    <div className="wizard-page">
      <WizardLayout currentStep={currentStep} onStepChange={setCurrentStep}>
        {renderStep()}
      </WizardLayout>
    </div>
  );
};
