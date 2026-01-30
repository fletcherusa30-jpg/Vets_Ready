/**
 * INTEGRATION GUIDE: VA Dependency System into Veteran Profile
 *
 * This file shows how to integrate the complete VA Dependency system
 * into the existing VeteranProfile component.
 *
 * Implementation Steps:
 * 1. Import the dependency validator and form
 * 2. Add dependency state to profile context
 * 3. Add dependency step(s) to wizard flow
 * 4. Integrate benefit calculations
 */

// ============================================
// IMPORTS (Add to VeteranProfile.tsx)
// ============================================

import { DependentIntakeForm } from '../components/DependentIntakeForm';
import {
  Dependent,
  canAddDependents,
  calculateDependentBenefitIncrease,
  validateSpouseEligibility,
  validateChildEligibility,
  validateDependentParentEligibility
} from '../services/VADependencyValidator';


// ============================================
// STATE ADDITIONS (Add to VeteranProfileSetup component)
// ============================================

// Add these state variables to your component:

// Dependency management
const [showAddDependentForm, setShowAddDependentForm] = useState(false);
const [dependents, setDependents] = useState<Dependent[]>(
  profile.dependents || []
);

const dependencyEligible = canAddDependents(profile.vaDisabilityRating);
const dependentBenefitIncrease = calculateDependentBenefitIncrease(
  dependents,
  profile.vaDisabilityRating
);


// ============================================
// HANDLERS (Add to component)
// ============================================

const handleAddDependent = (newDependent: Dependent) => {
  // Add to local state
  setDependents([...dependents, newDependent]);

  // Update profile context
  updateProfile({
    dependents: [...dependents, newDependent]
  });

  setShowAddDependentForm(false);

  // Show success message
  alert(`${newDependent.firstName} ${newDependent.lastName} has been added as a dependent`);
};

const handleRemoveDependent = (dependentName: string) => {
  const updated = dependents.filter(
    d => `${d.firstName} ${d.lastName}` !== dependentName
  );
  setDependents(updated);
  updateProfile({ dependents: updated });
};

const handleEditDependent = (index: number, updatedDependent: Dependent) => {
  const updated = [...dependents];
  updated[index] = updatedDependent;
  setDependents(updated);
  updateProfile({ dependents: updated });
};


// ============================================
// STEP 2.5: DEPENDENTS (Add after disabilities/VA rating step)
// ============================================

{/* STEP 2.5: DEPENDENTS */}
{step === 2.5 && (
  <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
    <h3 className="text-2xl font-bold text-gray-900 mb-4">Dependents</h3>

    {/* Eligibility Gate */}
    {!dependencyEligible.canAdd && (
      <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg">
        <p className="font-bold text-red-900">❌ Not Eligible to Add Dependents</p>
        <p className="text-red-700 mt-2">
          Your current VA disability rating is {profile.vaDisabilityRating}%.
          You need a rating of 30% or higher to add dependents.
        </p>
        <p className="text-sm text-red-600 mt-2">
          Once your rating increases, you'll be able to add dependents and receive
          additional monthly benefits.
        </p>
      </div>
    )}

    {/* Eligible - Show benefits info */}
    {dependencyEligible.canAdd && (
      <>
        <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-lg">
          <p className="font-bold text-green-900">✓ Eligible to Add Dependents</p>
          <p className="text-green-700 mt-2">
            Your {profile.vaDisabilityRating}% disability rating qualifies you to add dependents
            and receive monthly benefit increases.
          </p>
        </div>

        {/* Dependent Benefits Breakdown */}
        {dependents.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-bold text-blue-900 mb-3">💰 Monthly Benefit Increases</p>
            <div className="space-y-2 text-sm text-blue-800">
              {dependentBenefitIncrease.breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}s: {item.count}</span>
                  <span>+${item.monthlyIncrease.toFixed(2)}/month</span>
                </div>
              ))}
              <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between font-bold">
                <span>Total Monthly Increase:</span>
                <span>+${dependentBenefitIncrease.totalMonthlyIncrease.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Current Dependents List */}
        {dependents.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900">Added Dependents</h4>
            {dependents.map((dep, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {dep.firstName} {dep.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {dep.type.charAt(0).toUpperCase() + dep.type.slice(1)}
                    {dep.type === 'child' && ` (${dep.relationship})`}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveDependent(`${dep.firstName} ${dep.lastName}`)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Dependent Button */}
        {!showAddDependentForm && (
          <button
            onClick={() => setShowAddDependentForm(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            + Add Dependent
          </button>
        )}

        {/* Dependent Intake Form */}
        {showAddDependentForm && (
          <DependentIntakeForm
            veteranRating={profile.vaDisabilityRating}
            existingDependents={dependents}
            onAddDependent={handleAddDependent}
            onCancel={() => setShowAddDependentForm(false)}
          />
        )}
      </>
    )}
  </div>
)}


// ============================================
// STEP 5: REVIEW PAGE UPDATE
// ============================================

{/* Add to Step 5 Review - after current cards */}
{step === 5 && (
  <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
    {/* ... existing review cards ... */}

    {/* NEW: Dependents Review Card */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-bold text-gray-900 mb-3">Dependents</h4>
      {dependents.length === 0 ? (
        <p className="text-sm text-gray-700">No dependents added</p>
      ) : (
        <div className="space-y-2">
          {dependents.map((dep, idx) => (
            <div key={idx} className="text-sm text-gray-700">
              <p>
                <strong>{dep.firstName} {dep.lastName}</strong> - {dep.type}
              </p>
              {dep.type === 'child' && (
                <p className="text-xs text-gray-600 ml-2">
                  {dep.relationship} {new Date().getFullYear() - new Date(dep.dateOfBirth).getFullYear()} years old
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {dependents.length > 0 && (
        <p className="text-sm font-semibold text-green-700 mt-3">
          Monthly benefit increase: +${dependentBenefitIncrease.totalMonthlyIncrease.toFixed(2)}
        </p>
      )}
    </div>
  </div>
)}


// ============================================
// STEP PROGRESSION LOGIC UPDATE
// ============================================

// Update your step progression logic to include new steps:

const handleContinue = () => {
  // Step 1: Personal & Service → Continue
  if (step === 1) {
    if (validateStep1()) {
      setStep(2);
    }
  }
  // Step 2: Disabilities & VA Rating → Continue
  else if (step === 2) {
    if (validateStep2()) {
      setStep(2.5); // NEW: Go to dependents
    }
  }
  // Step 2.5: Dependents → Continue (optional, skip if ineligible)
  else if (step === 2.5) {
    setStep(3); // Or go to next conditional step
  }
  // ... rest of steps ...
};

// Also handle Previous button
const handleBack = () => {
  // When on step 2.5, back goes to step 2
  if (step === 2.5) {
    setStep(2);
  } else if (step === 3) {
    setStep(2.5); // Unless skipped
  }
  // ... etc ...
};


// ============================================
// CONTEXT UPDATE
// ============================================

// Update your VeteranProfileContext to include:

interface VeteranProfile {
  // ... existing fields ...

  // Dependency information
  dependents: Dependent[];
  dependencyEligible: boolean;
  dependentCount: {
    spouses: number;
    children: number;
    parents: number;
  };
  estimatedDependentBenefit: number;
}

// Update initial profile state
const initialProfile: VeteranProfile = {
  // ... existing ...
  dependents: [],
  dependencyEligible: false,
  dependentCount: {
    spouses: 0,
    children: 0,
    parents: 0
  },
  estimatedDependentBenefit: 0
};


// ============================================
// BENEFIT CALCULATION INTEGRATION
// ============================================

// Update your benefits calculator to include dependents:

const calculateTotalMonthlyBenefit = (profile: VeteranProfile): number => {
  let totalBenefit = 0;

  // Base VA compensation for disability rating
  totalBenefit += getVACompensationRate(profile.vaDisabilityRating);

  // Add CRSC if eligible
  if (profile.crscEligible) {
    totalBenefit += calculateCRSCBenefit(profile);
  }

  // Add dependent benefit increase
  if (profile.dependents.length > 0) {
    const dependentIncrease = calculateDependentBenefitIncrease(
      profile.dependents,
      profile.vaDisabilityRating
    );
    totalBenefit += dependentIncrease.totalMonthlyIncrease;
  }

  // Add survivor benefits if applicable
  if (profile.survivorBenefits) {
    totalBenefit += calculateSurvivorBenefits(profile);
  }

  return totalBenefit;
};


// ============================================
// TESTING
// ============================================

// Test scenarios:

// 1. Veteran with 20% rating tries to add dependent
//    → Should see "Not Eligible" message
//    → Cannot click Add Dependent button

// 2. Veteran with 40% rating adds spouse
//    → Spouse form appears
//    → Marriage certificate required
//    → Benefits show +$50-100/month increase

// 3. Veteran adds child age 20, not enrolled in school
//    → Validation error: "Child age 20 must be enrolled in school"
//    → Cannot proceed until school enrollment checked

// 4. Veteran adds child age 16
//    → No school enrollment needed
//    → Shows +$20-30/month benefit
//    → Appears in review with age

// 5. Veteran adds parent with $20,000 income
//    → Validation error: "Income exceeds threshold"
//    → Can reduce income or not add parent

export default VeteranProfileSetup;
