import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CRSCProfileData, EvidenceInventory } from '../types/crscTypes';

export interface VeteranProfile {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;

  // Service Information
  branch: 'Army' | 'Navy' | 'Air Force' | 'Marine Corps' | 'Coast Guard' | 'Space Force' | '';
  serviceStartDate: string;
  serviceEndDate: string;
  yearsOfService: number;
  rank: string;
  mos: string;

  // Multiple Service Periods (for veterans who separated and rejoined)
  servicePeriods?: Array<{
    branch: string;
    startDate: string;
    endDate: string;
    rank: string;
    characterOfDischarge?: string;
    isPrimaryPeriod?: boolean; // Mark the main period for DD-214
  }>;

  // Discharge Information
  characterOfDischarge?: 'Honorable' | 'General Under Honorable Conditions' | 'Other Than Honorable' | 'Bad Conduct' | 'Dishonorable' | '';
  separationCode?: string;
  narrativeReasonForSeparation?: string;
  misconductBasis?: string;

  // Discharge Upgrade Context
  hasMentalHealthHistory?: boolean;
  hasPTSD?: boolean;
  hasTBI?: boolean;
  hasMST?: boolean;
  hasOtherMentalHealth?: boolean;
  mentalHealthDetails?: string;
  hasPostServiceTreatment?: boolean;
  postServiceTreatmentDetails?: string;
  hasPriorUpgradeAttempts?: boolean;
  priorUpgradeAttemptsDetails?: string;

  // Retirement Status
  isRetired: boolean;
  isMedicallyRetired: boolean;
  retirementStatus?: '20+ retiree' | 'medical retiree' | 'medical <20 years' | null;
  medicalRetirementYears?: '20+' | '<20' | null;
  hasRetirementPay: boolean;
  retirementPayAmount: number;
  receivesDoDRetirementPay: boolean;
  crscEligible: boolean;
  crscIndicators: string[];
  crscData?: CRSCProfileData;

  // CRSC Eligibility Screening
  crscSelfIdentified?: boolean; // Veteran believes disability is combat-related
  crscCombatInjury: boolean;
  crscCombatTraining: boolean;
  crscHazardousDuty: boolean;
  crscToxicExposure: boolean;
  crscMentalHealthCombat: boolean;
  crscMayQualify: boolean;

  // Disability Information
  vaDisabilityRating: number;
  serviceConnectedConditions: Array<{
    name: string;
    rating: number;
    effectiveDate: string;
  }>;
  isPermanentAndTotal?: boolean;
  isTDIU?: boolean;
  hasSMC?: boolean;

  // Dependent Information
  isMarried: boolean;
  hasSpouse: boolean;
  numberOfChildren: number;
  numberOfDependents: number;
  hasDependentParents: boolean;

  // Special Circumstances
  hasAidAndAttendanceNeeds: boolean;
  isHousebound: boolean;
  hasLossOfUseOfLimb: boolean;
  hasBlindness: boolean;
  needsSpecialAdaptedHousing: boolean;

  // Combat/Deployment
  hasCombatService: boolean;
  deployments: Array<{
    location: string;
    startDate: string;
    endDate: string;
  }>;

  // Education
  hasDependentsInSchool: boolean;
  spouseInSchool: boolean;

  // Location
  state?: string;
  isHomeowner?: boolean;
  homeownershipStatus?: 'own' | 'rent' | 'other';
  accessibilityNeeds?: string[];

  // Special Benefits Qualifications
  hasProstheticDevice?: boolean;
  hadSGLI?: boolean;
  hasSAHGrant?: boolean;
  requiresCaregiver?: boolean;
  isPost911?: boolean;
  qualifyingDisabilities?: string[];

  // Financial
  annualIncome: number;

  // Profile Completion
  profileCompleted: boolean;
  lastUpdated: string;
  // Contact / identifiers (for packet generation)
  contactEmail?: string;
  contactPhone?: string;
  ssnLast4?: string;
  crscEvidenceInventory?: EvidenceInventory;
}

interface VeteranProfileContextType {
  profile: VeteranProfile;
  updateProfile: (updates: Partial<VeteranProfile>) => void;
  resetProfile: () => void;
  isProfileComplete: () => boolean;
}

const defaultProfile: VeteranProfile = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  branch: '',
  serviceStartDate: '',
  serviceEndDate: '',
  yearsOfService: 0,
  rank: '',
  mos: '',
  isRetired: false,
  isMedicallyRetired: false,
  retirementStatus: null,
  medicalRetirementYears: null,
  hasRetirementPay: false,
  retirementPayAmount: 0,
  receivesDoDRetirementPay: false,
  crscEligible: false,
  crscIndicators: [],
  crscData: {},
  crscCombatInjury: false,
  crscCombatTraining: false,
  crscHazardousDuty: false,
  crscToxicExposure: false,
  crscMentalHealthCombat: false,
  crscMayQualify: false,
  vaDisabilityRating: 0,
  serviceConnectedConditions: [],
  isPermanentAndTotal: false,
  isTDIU: false,
  hasSMC: false,
  isMarried: false,
  hasSpouse: false,
  numberOfChildren: 0,
  numberOfDependents: 0,
  hasDependentParents: false,
  hasAidAndAttendanceNeeds: false,
  isHousebound: false,
  hasLossOfUseOfLimb: false,
  hasBlindness: false,
  needsSpecialAdaptedHousing: false,
  hasCombatService: false,
  deployments: [],
  hasDependentsInSchool: false,
  spouseInSchool: false,
  state: '',
  isHomeowner: false,
  hasProstheticDevice: false,
  hadSGLI: false,
  hasSAHGrant: false,
  requiresCaregiver: false,
  isPost911: false,
  qualifyingDisabilities: [],
  annualIncome: 0,
  contactEmail: '',
  contactPhone: '',
  ssnLast4: '',
  crscEvidenceInventory: {},
  profileCompleted: false,
  lastUpdated: new Date().toISOString()
};

const VeteranProfileContext = createContext<VeteranProfileContextType | undefined>(undefined);

export const VeteranProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<VeteranProfile>(() => {
    // Load from localStorage if available
    const savedProfile = localStorage.getItem('veteranProfile');
    return savedProfile ? JSON.parse(savedProfile) : defaultProfile;
  });

  // Save to localStorage whenever profile changes
  useEffect(() => {
    localStorage.setItem('veteranProfile', JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates: Partial<VeteranProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...updates,
      lastUpdated: new Date().toISOString()
    }));
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
    localStorage.removeItem('veteranProfile');
  };

  const isProfileComplete = () => {
    return profile.firstName !== '' &&
           profile.branch !== '' &&
           profile.vaDisabilityRating > 0;
  };

  return (
    <VeteranProfileContext.Provider value={{ profile, updateProfile, resetProfile, isProfileComplete }}>
      {children}
    </VeteranProfileContext.Provider>
  );
};

export const useVeteranProfile = () => {
  const context = useContext(VeteranProfileContext);
  if (context === undefined) {
    throw new Error('useVeteranProfile must be used within a VeteranProfileProvider');
  }
  return context;
};
