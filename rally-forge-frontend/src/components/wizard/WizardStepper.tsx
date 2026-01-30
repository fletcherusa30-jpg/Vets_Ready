/**
 * Wizard Stepper Component
 *
 * Visual progress indicator showing all wizard steps
 */

import React from 'react';
import { WizardStep } from '../../types/wizard.types';

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepNumber: number) => void;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 z-0">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${((completedSteps.length) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = completedSteps.includes(step.number);
          const isAccessible = isCompleted || step.number <= currentStep;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10"
              style={{ flex: 1 }}
            >
              {/* Step Circle */}
              <button
                onClick={() => isAccessible && onStepClick(step.number)}
                disabled={!isAccessible}
                className={`
                  w-12 h-12 rounded-full font-bold text-sm flex items-center justify-center
                  transition-all duration-300 mb-2
                  ${isActive
                    ? 'bg-blue-600 text-white ring-4 ring-blue-200 scale-110'
                    : isCompleted
                    ? 'bg-green-500 text-white hover:scale-105'
                    : isAccessible
                    ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
                aria-label={`Step ${step.number}: ${step.title}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  <span className="text-xl">✓</span>
                ) : (
                  <span>{step.number}</span>
                )}
              </button>

              {/* Step Label */}
              <div className="text-center max-w-[120px]">
                <div className={`
                  font-semibold text-xs mb-1
                  ${isActive ? 'text-blue-900' : 'text-gray-600'}
                `}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 hidden md:block">
                  {step.description}
                </div>
              </div>

              {/* Required Badge */}
              {step.isRequired && !isCompleted && (
                <div className="absolute -top-2 -right-2">
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    Required
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile View - Current Step Only */}
      <div className="md:hidden mt-4 text-center">
        <div className="text-sm text-gray-600">
          Step {currentStep} of {steps.length}
        </div>
        <div className="font-bold text-lg text-gray-900">
          {steps[currentStep - 1].title}
        </div>
      </div>
    </div>
  );
};
