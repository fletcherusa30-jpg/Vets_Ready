import React, { createContext, useContext, useState, ReactNode } from 'react';

// Shared disability interface
export interface ServiceConnectedCondition {
  id: string;
  name: string;
  rating: number;
  isBilateral: boolean;
  bodyPart: 'arm' | 'leg' | 'other' | '';
  dateGranted?: string;
  description?: string;
}

export interface DeniedCondition {
  id: string;
  name: string;
  connectionType: 'direct' | 'secondary' | 'aggravation' | 'presumptive' | 'concurrent';
  description: string;
  serviceHistory: string;
  diagnosedDuringService: boolean;
  ongoingSymptoms: boolean;
  mentionedInVAExams: boolean;
  believedSecondary: boolean;
  relatedConditionId?: string;
  symptoms: string[];
  treatment: string[];
  nexusEvidence: string[];
  aiTheory?: string;
  aiReferences?: string[];
  aiMedicalRationale?: string;
  questionnaire?: {
    diagnosedDuringService: boolean;
    ongoingSymptoms: boolean;
    mentionedInVAExams: boolean;
    believedSecondary: boolean;
    relatedCondition: string;
    symptomsDescription: string;
    treatmentHistory: string;
    additionalNotes: string;
  };
}

interface DisabilityContextType {
  // Service-connected conditions (from calculator)
  serviceConnectedConditions: ServiceConnectedCondition[];
  setServiceConnectedConditions: (conditions: ServiceConnectedCondition[]) => void;
  addServiceConnectedCondition: (condition: ServiceConnectedCondition) => void;
  updateServiceConnectedCondition: (id: string, updates: Partial<ServiceConnectedCondition>) => void;
  removeServiceConnectedCondition: (id: string) => void;

  // Denied conditions (for entitlement helper)
  deniedConditions: DeniedCondition[];
  setDeniedConditions: (conditions: DeniedCondition[]) => void;
  addDeniedCondition: (condition: DeniedCondition) => void;
  updateDeniedCondition: (id: string, updates: Partial<DeniedCondition>) => void;
  removeDeniedCondition: (id: string) => void;

  // Combined rating from calculator
  combinedRating: number;
  setCombinedRating: (rating: number) => void;
}

const DisabilityContext = createContext<DisabilityContextType | undefined>(undefined);

export const useDisabilityContext = () => {
  const context = useContext(DisabilityContext);
  if (!context) {
    throw new Error('useDisabilityContext must be used within a DisabilityProvider');
  }
  return context;
};

interface DisabilityProviderProps {
  children: ReactNode;
}

export const DisabilityProvider: React.FC<DisabilityProviderProps> = ({ children }) => {
  const [serviceConnectedConditions, setServiceConnectedConditions] = useState<ServiceConnectedCondition[]>([]);
  const [deniedConditions, setDeniedConditions] = useState<DeniedCondition[]>([]);
  const [combinedRating, setCombinedRating] = useState<number>(0);

  const addServiceConnectedCondition = (condition: ServiceConnectedCondition) => {
    setServiceConnectedConditions(prev => [...prev, condition]);
  };

  const updateServiceConnectedCondition = (id: string, updates: Partial<ServiceConnectedCondition>) => {
    setServiceConnectedConditions(prev =>
      prev.map(condition => condition.id === id ? { ...condition, ...updates } : condition)
    );
  };

  const removeServiceConnectedCondition = (id: string) => {
    setServiceConnectedConditions(prev => prev.filter(condition => condition.id !== id));
  };

  const addDeniedCondition = (condition: DeniedCondition) => {
    setDeniedConditions(prev => [...prev, condition]);
  };

  const updateDeniedCondition = (id: string, updates: Partial<DeniedCondition>) => {
    setDeniedConditions(prev =>
      prev.map(condition => condition.id === id ? { ...condition, ...updates } : condition)
    );
  };

  const removeDeniedCondition = (id: string) => {
    setDeniedConditions(prev => prev.filter(condition => condition.id !== id));
  };

  const value: DisabilityContextType = {
    serviceConnectedConditions,
    setServiceConnectedConditions,
    addServiceConnectedCondition,
    updateServiceConnectedCondition,
    removeServiceConnectedCondition,
    deniedConditions,
    setDeniedConditions,
    addDeniedCondition,
    updateDeniedCondition,
    removeDeniedCondition,
    combinedRating,
    setCombinedRating,
  };

  return (
    <DisabilityContext.Provider value={value}>
      {children}
    </DisabilityContext.Provider>
  );
};
