/**
 * VA Dependency Eligibility Validator
 *
 * Implements official VA rules for dependent eligibility:
 * - Spouse (legally valid or common-law marriage)
 * - Child (biological, adopted, stepchild; age requirements)
 * - Dependent Parent (income threshold verification)
 * - Surviving Dependents (for survivor programs)
 *
 * Hard Rule: Veteran must have 30%+ VA disability rating to add ANY dependents
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type DependentType = 'spouse' | 'child' | 'parent' | 'survivor';

export type ChildRelationship = 'biological' | 'adopted' | 'stepchild';

export type ChildEligibilityReason = 'under_18' | 'school_enrolled_18_23' | 'helpless_child' | 'none';

export type MarriageType = 'legal' | 'common_law';

export type VerificationStatus = 'not_started' | 'in_progress' | 'verified' | 'rejected' | 'pending_review';

export interface DependentSpouse {
  type: 'spouse';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  marriageType: MarriageType;
  marriageDate: string;
  marriageCertificateProvided: boolean;
  marriageCertificateFile?: File;
  priorMarriageHistory: PriorMarriage[];
  isCurrentlyDivorced: boolean;
  isCurrentlyRemarried: boolean;
  verificationStatus: VerificationStatus;
  requiredDocuments: RequiredDocument[];
  notes?: string;
}

export interface DependentChild {
  type: 'child';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: ChildRelationship;
  isMarried: boolean;
  eligibilityReason: ChildEligibilityReason; // under_18, school_enrolled_18_23, helpless_child, or none

  // For school enrollment (ages 18-23)
  enrolledInSchool: boolean;
  schoolName?: string;
  enrollmentVerificationFile?: File;
  enrollmentVerificationStatus: VerificationStatus;

  // For helpless child (any age if incapable before age 18)
  isHelplessChild: boolean;
  helplessChildDocumentationFile?: File;
  helplessChildMedicalEvidence?: string;

  // For stepchildren - must be in household
  isInHousehold: boolean;
  householdVerificationFile?: File;

  // Documentation
  birthCertificateProvided: boolean;
  birthCertificateFile?: File;
  adoptionCertificateFile?: File; // If adopted
  relationshipDocumentationFile?: File;

  verificationStatus: VerificationStatus;
  requiredDocuments: RequiredDocument[];
  notes?: string;
}

export interface DependentParent {
  type: 'parent';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: 'biological' | 'adoptive' | 'stepparent';
  annualIncome: number;
  incomeCertificationFile?: File;

  expensesCovered: number; // Veteran's financial support amount
  dependencyVerificationFile?: File;

  relationshipDocumentationFile?: File;

  verificationStatus: VerificationStatus;
  requiredDocuments: RequiredDocument[];
  notes?: string;
}

export interface SurvivingDependent {
  type: 'survivor';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: 'spouse' | 'child' | 'parent'; // Use base definitions
  survivorBenefitType: 'DIC' | 'Dependency_Indemnity_Compensation' | 'survivor_pension' | 'Chapter35';
  verificationStatus: VerificationStatus;
  requiredDocuments: RequiredDocument[];
  notes?: string;
}

export type Dependent = DependentSpouse | DependentChild | DependentParent | SurvivingDependent;

export interface PriorMarriage {
  marriageDate: string;
  divorceDate?: string;
  spouseName: string;
  divorceDecreeFile?: File;
}

export interface RequiredDocument {
  documentType: string;
  description: string;
  isRequired: boolean;
  isProvided: boolean;
  file?: File;
  uploadedAt?: string;
}

export interface DependencyValidationResult {
  isEligible: boolean;
  dependentType: DependentType;
  passedRules: string[];
  failedRules: string[];
  warnings: string[];
  missingDocuments: RequiredDocument[];
  nextSteps?: string[];
}

export interface DependencyModuleState {
  veteranRating: number; // VA disability rating percentage
  dependents: Dependent[];
  ratingEligibilityMet: boolean; // Is rating >= 30%?
  dependencyCount: number;
  spouseCount: number;
  childrenCount: number;
  parentsCount: number;
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * CORE ELIGIBILITY GATE: Check if veteran can add ANY dependents
 *
 * Hard Rule: Must have 30%+ VA disability rating
 */
export function canAddDependents(veteranRating: number): {
  canAdd: boolean;
  reason: string;
  minimumRequired: number;
} {
  const minimumRating = 30;

  return {
    canAdd: veteranRating >= minimumRating,
    reason: veteranRating >= minimumRating
      ? `Eligible: ${veteranRating}% rating meets minimum requirement`
      : `Not eligible: ${veteranRating}% rating is below 30% minimum requirement`,
    minimumRequired: minimumRating
  };
}

/**
 * Validate spouse eligibility
 *
 * Rules:
 * - Marriage must be legally valid OR recognized common-law
 * - Must not be divorced from veteran
 * - Veteran must not be remarried to someone else
 */
export function validateSpouseEligibility(
  spouse: DependentSpouse,
  existingSpouses: DependentSpouse[] = []
): DependencyValidationResult {
  const passedRules: string[] = [];
  const failedRules: string[] = [];
  const warnings: string[] = [];
  const missingDocuments: RequiredDocument[] = [];

  // Rule 1: Marriage type must be valid
  if (!spouse.marriageType || !['legal', 'common_law'].includes(spouse.marriageType)) {
    failedRules.push('Marriage type must be specified (legal or common-law)');
  } else {
    passedRules.push(`Marriage type valid: ${spouse.marriageType}`);
  }

  // Rule 2: Marriage date required
  if (!spouse.marriageDate) {
    failedRules.push('Marriage date is required');
    missingDocuments.push({
      documentType: 'marriage_date',
      description: 'Date of marriage',
      isRequired: true,
      isProvided: false
    });
  } else {
    passedRules.push('Marriage date provided');
  }

  // Rule 3: No current divorce from veteran
  if (spouse.isCurrentlyDivorced) {
    failedRules.push('Veteran cannot add spouse they are currently divorced from');
  } else {
    passedRules.push('No current divorce from veteran');
  }

  // Rule 4: Veteran not remarried to someone else
  if (spouse.isCurrentlyRemarried) {
    failedRules.push('Veteran is remarried to someone else - cannot claim previous spouse');
  } else {
    passedRules.push('Veteran is not remarried to someone else');
  }

  // Rule 5: No duplicate spouses
  if (existingSpouses.length > 0) {
    failedRules.push('Veteran already has a spouse on record. Only one spouse can be claimed.');
  }

  // Rule 6: Marriage certificate
  if (!spouse.marriageCertificateProvided) {
    missingDocuments.push({
      documentType: 'marriage_certificate',
      description: 'Valid marriage certificate or common-law marriage documentation',
      isRequired: true,
      isProvided: false
    });
  } else {
    passedRules.push('Marriage certificate provided');
  }

  // Rule 7: Prior marriage history (if applicable)
  if (spouse.priorMarriageHistory && spouse.priorMarriageHistory.length > 0) {
    const allDivorced = spouse.priorMarriageHistory.every(pm => pm.divorceDate);
    if (allDivorced) {
      passedRules.push('All prior marriages properly documented as divorced');
    } else {
      warnings.push('Some prior marriages are missing divorce dates - VA may require clarification');
    }

    // Check for divorce decrees
    spouse.priorMarriageHistory.forEach((pm, idx) => {
      if (!pm.divorceDecreeFile) {
        missingDocuments.push({
          documentType: `divorce_decree_${idx}`,
          description: `Divorce decree for marriage to ${pm.spouseName}`,
          isRequired: false,
          isProvided: false
        });
      }
    });
  }

  return {
    isEligible: failedRules.length === 0,
    dependentType: 'spouse',
    passedRules,
    failedRules,
    warnings,
    missingDocuments
  };
}

/**
 * Validate child eligibility
 *
 * Rules:
 * - Must be biological, adopted, or stepchild in household
 * - Age requirements:
 *   - Under 18, OR
 *   - 18-23 AND enrolled in school full-time, OR
 *   - Any age if permanently incapable before age 18 (helpless child)
 * - Must be unmarried
 */
export function validateChildEligibility(
  child: DependentChild
): DependencyValidationResult {
  const passedRules: string[] = [];
  const failedRules: string[] = [];
  const warnings: string[] = [];
  const missingDocuments: RequiredDocument[] = [];
  let eligibilityReason: ChildEligibilityReason = 'none';

  // Rule 1: Relationship type
  if (!['biological', 'adopted', 'stepchild'].includes(child.relationship)) {
    failedRules.push('Relationship must be biological, adopted, or stepchild');
  } else {
    passedRules.push(`Relationship valid: ${child.relationship}`);
  }

  // Rule 2: Stepchildren must be in household
  if (child.relationship === 'stepchild') {
    if (!child.isInHousehold) {
      failedRules.push('Stepchildren must be part of the veteran\'s household');
    } else {
      passedRules.push('Stepchild confirmed in household');
    }

    if (!child.householdVerificationFile) {
      missingDocuments.push({
        documentType: 'household_verification',
        description: 'Documentation confirming stepchild is in veteran\'s household',
        isRequired: true,
        isProvided: false
      });
    }
  }

  // Rule 3: Marital status
  if (child.isMarried) {
    failedRules.push('Child must be unmarried to qualify as dependent');
  } else {
    passedRules.push('Child is unmarried');
  }

  // Rule 4: Age eligibility
  const birthDate = new Date(child.dateOfBirth);
  const today = new Date();
  const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  if (age < 18) {
    passedRules.push(`Child is under 18 years old (age ${age})`);
    eligibilityReason = 'under_18';
  } else if (age >= 18 && age <= 23) {
    // Ages 18-23: must be enrolled in school full-time
    if (child.enrolledInSchool) {
      if (!child.enrollmentVerificationFile && child.enrollmentVerificationStatus !== 'verified') {
        missingDocuments.push({
          documentType: 'school_enrollment',
          description: `School enrollment verification for ${child.firstName} (age ${age})`,
          isRequired: true,
          isProvided: child.enrollmentVerificationFile ? true : false
        });
        warnings.push(`Age ${age}: School enrollment must be verified annually`);
      } else {
        passedRules.push(`Child age ${age} is enrolled in school full-time`);
        eligibilityReason = 'school_enrolled_18_23';
      }
    } else {
      failedRules.push(`Child age ${age} must be enrolled in school full-time to qualify`);
    }
  } else if (age > 23) {
    // Over 23: only eligible if helpless child
    if (child.isHelplessChild) {
      if (!child.helplessChildDocumentationFile) {
        missingDocuments.push({
          documentType: 'helpless_child_documentation',
          description: 'Medical documentation of permanent incapacity (must have occurred before age 18)',
          isRequired: true,
          isProvided: false
        });
      } else {
        passedRules.push('Child qualifies as "helpless child" - permanent incapacity before age 18 documented');
        eligibilityReason = 'helpless_child';
      }
    } else {
      failedRules.push(`Child is age ${age} and does not qualify under helpless child provisions`);
    }
  }

  // Rule 5: Birth documentation
  if (!child.birthCertificateProvided && child.relationship === 'biological') {
    missingDocuments.push({
      documentType: 'birth_certificate',
      description: 'Birth certificate',
      isRequired: true,
      isProvided: false
    });
  } else if (child.relationship === 'adopted' && !child.adoptionCertificateFile) {
    missingDocuments.push({
      documentType: 'adoption_certificate',
      description: 'Adoption certificate or adoption decree',
      isRequired: true,
      isProvided: false
    });
  }

  return {
    isEligible: failedRules.length === 0 && eligibilityReason !== 'none',
    dependentType: 'child',
    passedRules,
    failedRules,
    warnings,
    missingDocuments
  };
}

/**
 * Validate dependent parent eligibility
 *
 * Rules:
 * - Biological, adoptive, or stepparent
 * - Relies on veteran for financial support
 * - Annual income below VA threshold
 */
export function validateDependentParentEligibility(
  parent: DependentParent,
  incomeThreshold: number = 16000 // 2024 approximate threshold, varies by year
): DependencyValidationResult {
  const passedRules: string[] = [];
  const failedRules: string[] = [];
  const warnings: string[] = [];
  const missingDocuments: RequiredDocument[] = [];

  // Rule 1: Relationship type
  if (!['biological', 'adoptive', 'stepparent'].includes(parent.relationship)) {
    failedRules.push('Parent relationship must be biological, adoptive, or stepparent');
  } else {
    passedRules.push(`Relationship valid: ${parent.relationship}`);
  }

  // Rule 2: Income threshold
  if (parent.annualIncome > incomeThreshold) {
    failedRules.push(
      `Parent annual income ($${parent.annualIncome}) exceeds VA threshold ($${incomeThreshold})`
    );
  } else {
    passedRules.push(`Parent income ($${parent.annualIncome}) is below threshold`);
  }

  // Rule 3: Income documentation
  if (!parent.incomeCertificationFile) {
    missingDocuments.push({
      documentType: 'income_certification',
      description: 'Documentation of parent\'s annual income (tax return, income statement, etc.)',
      isRequired: true,
      isProvided: false
    });
  }

  // Rule 4: Dependency verification
  if (parent.expensesCovered === 0) {
    warnings.push('No expenses covered - parent dependency may not be recognized');
  } else {
    passedRules.push(`Veteran covers $${parent.expensesCovered}/year for parent support`);
  }

  if (!parent.dependencyVerificationFile) {
    missingDocuments.push({
      documentType: 'dependency_verification',
      description: 'Documentation of veteran\'s financial support',
      isRequired: true,
      isProvided: false
    });
  }

  // Rule 5: Relationship documentation
  if (!parent.relationshipDocumentationFile) {
    missingDocuments.push({
      documentType: 'relationship_documentation',
      description: 'Birth certificate or adoption documents proving relationship',
      isRequired: true,
      isProvided: false
    });
  }

  return {
    isEligible: failedRules.length === 0,
    dependentType: 'parent',
    passedRules,
    failedRules,
    warnings,
    missingDocuments
  };
}

/**
 * Get required documents list for a dependent type
 */
export function getRequiredDocuments(dependentType: DependentType, dependent: Dependent): RequiredDocument[] {
  const docs: RequiredDocument[] = [];

  if (dependentType === 'spouse' && dependent.type === 'spouse') {
    docs.push({
      documentType: 'marriage_certificate',
      description: 'Marriage certificate (legal or common-law documentation)',
      isRequired: true,
      isProvided: dependent.marriageCertificateProvided
    });
    if (dependent.priorMarriageHistory.length > 0) {
      dependent.priorMarriageHistory.forEach((pm, idx) => {
        docs.push({
          documentType: `divorce_decree_${idx}`,
          description: `Divorce decree from marriage to ${pm.spouseName}`,
          isRequired: true,
          isProvided: !!pm.divorceDecreeFile
        });
      });
    }
  } else if (dependentType === 'child' && dependent.type === 'child') {
    if (dependent.relationship === 'biological') {
      docs.push({
        documentType: 'birth_certificate',
        description: 'Birth certificate',
        isRequired: true,
        isProvided: dependent.birthCertificateProvided
      });
    } else if (dependent.relationship === 'adopted') {
      docs.push({
        documentType: 'adoption_certificate',
        description: 'Adoption certificate or adoption decree',
        isRequired: true,
        isProvided: !!dependent.adoptionCertificateFile
      });
    }

    if (dependent.relationship === 'stepchild') {
      docs.push({
        documentType: 'household_verification',
        description: 'Proof that stepchild is in veteran\'s household',
        isRequired: true,
        isProvided: !!dependent.householdVerificationFile
      });
    }

    const age = new Date().getFullYear() - new Date(dependent.dateOfBirth).getFullYear();
    if (age >= 18 && age <= 23 && dependent.enrolledInSchool) {
      docs.push({
        documentType: 'school_enrollment',
        description: `School enrollment verification (required annually for ages 18-23)`,
        isRequired: true,
        isProvided: !!dependent.enrollmentVerificationFile && dependent.enrollmentVerificationStatus === 'verified'
      });
    }

    if (dependent.isHelplessChild) {
      docs.push({
        documentType: 'helpless_child_documentation',
        description: 'Medical evidence of permanent incapacity (must have occurred before age 18)',
        isRequired: true,
        isProvided: !!dependent.helplessChildDocumentationFile
      });
    }
  } else if (dependentType === 'parent' && dependent.type === 'parent') {
    docs.push({
      documentType: 'relationship_documentation',
      description: 'Birth certificate or adoption documents',
      isRequired: true,
      isProvided: !!dependent.relationshipDocumentationFile
    });
    docs.push({
      documentType: 'income_certification',
      description: 'Documentation of annual income (tax return, income statement, etc.)',
      isRequired: true,
      isProvided: !!dependent.incomeCertificationFile
    });
    docs.push({
      documentType: 'dependency_verification',
      description: 'Documentation of veteran\'s financial support',
      isRequired: true,
      isProvided: !!dependent.dependencyVerificationFile
    });
  }

  return docs;
}

/**
 * Calculate total monthly benefit increase for all dependents
 */
export function calculateDependentBenefitIncrease(
  dependents: Dependent[],
  baseVARate: number
): { totalMonthlyIncrease: number; breakdown: { type: string; count: number; monthlyIncrease: number }[] } {
  const breakdown: { type: string; count: number; monthlyIncrease: number }[] = [];

  // These are approximate rates - actual rates vary by rating and year
  const spouseIncreaseRange = { min: 50, max: 100 }; // $50-100/month per spouse
  const childIncreaseRange = { min: 20, max: 30 }; // $20-30/month per child
  const parentIncreaseRange = { min: 40, max: 80 }; // $40-80/month per parent

  const spouses = dependents.filter(d => d.type === 'spouse');
  const children = dependents.filter(d => d.type === 'child');
  const parents = dependents.filter(d => d.type === 'parent');

  if (spouses.length > 0) {
    const avgSpouseIncrease = (spouseIncreaseRange.min + spouseIncreaseRange.max) / 2;
    breakdown.push({
      type: 'spouse',
      count: spouses.length,
      monthlyIncrease: avgSpouseIncrease * spouses.length
    });
  }

  if (children.length > 0) {
    const avgChildIncrease = (childIncreaseRange.min + childIncreaseRange.max) / 2;
    breakdown.push({
      type: 'child',
      count: children.length,
      monthlyIncrease: avgChildIncrease * children.length
    });
  }

  if (parents.length > 0) {
    const avgParentIncrease = (parentIncreaseRange.min + parentIncreaseRange.max) / 2;
    breakdown.push({
      type: 'parent',
      count: parents.length,
      monthlyIncrease: avgParentIncrease * parents.length
    });
  }

  const totalMonthlyIncrease = breakdown.reduce((sum, item) => sum + item.monthlyIncrease, 0);

  return {
    totalMonthlyIncrease,
    breakdown
  };
}
