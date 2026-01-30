/**
 * IntelligenceContext
 * React Context for accessing the intelligence platform across the application
 * Provides predictors, insights, recommendations, and audit trail management
 */

import React, { createContext, useContext, useCallback, useState } from 'react';
import {
  IntelligenceResponse,
  Insight,
  Prediction,
  RecommendedAction,
  DecisionLog,
  AuditEntry,
  Explanation
} from '../intelligence/types/IntelligenceTypes';
import { IntelligenceCore } from '../intelligence/core/IntelligenceCore';
import { EligibilityPredictor } from '../intelligence/predictors/EligibilityPredictor';
import { EvidenceGapAnalyzer } from '../intelligence/predictors/EvidenceGapAnalyzer';
import { EmploymentMatcher } from '../intelligence/predictors/EmploymentMatcher';
import { TransitionRiskCalculator } from '../intelligence/predictors/TransitionRiskCalculator';
import { PersonalizationEngine } from '../intelligence/personalization/PersonalizationEngine';
import { WorkflowAutomationEngine } from '../intelligence/automation/WorkflowAutomationEngine';
import { SelfImprovementEngine } from '../intelligence/improvement/SelfImprovementEngine';
import { OutcomeTracker } from '../intelligence/improvement/OutcomeTracker';

interface IntelligenceContextType {
  // Core Services
  coreEngine: IntelligenceCore;
  eligibilityPredictor: EligibilityPredictor;
  evidenceAnalyzer: EvidenceGapAnalyzer;
  employmentMatcher: EmploymentMatcher;
  transitionRiskCalculator: TransitionRiskCalculator;
  personalizationEngine: PersonalizationEngine;
  automationEngine: WorkflowAutomationEngine;
  selfImprovementEngine: SelfImprovementEngine;
  outcomeTracker: OutcomeTracker;

  // State
  loading: boolean;
  error: string | null;
  insights: Insight[];
  predictions: Prediction<any>[];
  recommendations: RecommendedAction[];
  selectedVeteranId: string | null;

  // Prediction Methods
  getPredictions: (veteranId: string, types?: string[]) => Promise<Prediction<any>[]>;
  getInsights: (veteranId: string) => Promise<Insight[]>;
  getRecommendations: (veteranId: string) => Promise<RecommendedAction[]>;
  getExplanation: (itemId: string, type: string) => Promise<Explanation>;

  // Specialized Predictors
  predictEligibility: (veteranProfile: any) => Promise<any>;
  analyzeEvidenceGaps: (veteranProfile: any) => Promise<any>;
  matchJobs: (veteranProfile: any, jobs: any[]) => Promise<any>;
  assessTransitionRisk: (veteranProfile: any) => Promise<any>;

  // Personalization
  buildPersonalizationContext: (veteranProfile: any) => Promise<any>;
  adaptContent: (text: string, style: 'simple' | 'detailed' | 'technical') => string;

  // Workflows & Automation
  executeWorkflow: (workflowId: string, data: any) => Promise<any>;
  getWorkflows: () => any[];

  // Feedback & Learning
  recordOutcome: (predictionId: string, outcome: any) => Promise<void>;
  addFeedback: (predictionId: string, helpful: boolean, comment?: string) => Promise<void>;
  getModelPerformance: (modelName: string) => Promise<any>;

  // Audit & Compliance
  getAuditTrail: (filters?: any) => Promise<AuditEntry[]>;
  getDecisionHistory: (veteranId: string) => Promise<DecisionLog[]>;
  exportAuditLog: () => string;

  // Setup
  setSelectedVeteran: (veteranId: string) => void;
  clearError: () => void;
}

const IntelligenceContext = createContext<IntelligenceContextType | undefined>(undefined);

export const IntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize services
  const [coreEngine] = useState(() => IntelligenceCore.getInstance());
  const [eligibilityPredictor] = useState(() => new EligibilityPredictor());
  const [evidenceAnalyzer] = useState(() => new EvidenceGapAnalyzer());
  const [employmentMatcher] = useState(() => new EmploymentMatcher());
  const [transitionRiskCalculator] = useState(() => new TransitionRiskCalculator());
  const [personalizationEngine] = useState(() => new PersonalizationEngine());
  const [automationEngine] = useState(() => new WorkflowAutomationEngine());
  const [selfImprovementEngine] = useState(() => new SelfImprovementEngine());
  const [outcomeTracker] = useState(() => new OutcomeTracker());

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [predictions, setPredictions] = useState<Prediction<any>[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedAction[]>([]);
  const [selectedVeteranId, setSelectedVeteran] = useState<string | null>(null);

  // Prediction Methods
  const getPredictions = useCallback(async (veteranId: string, types?: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const results = await coreEngine.getPredictions(veteranId, types);
      setPredictions(results);
      return results;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get predictions';
      setError(errorMsg);
      console.error('Prediction error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [coreEngine]);

  const getInsights = useCallback(async (veteranId: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await coreEngine.getPersonalizedInsights(veteranId);
      setInsights(results);
      return results;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get insights';
      setError(errorMsg);
      console.error('Insights error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [coreEngine]);

  const getRecommendations = useCallback(async (veteranId: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await coreEngine.getRecommendations(veteranId);
      setRecommendations(results);
      return results;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get recommendations';
      setError(errorMsg);
      console.error('Recommendations error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [coreEngine]);

  const getExplanation = useCallback(async (itemId: string, type: string) => {
    try {
      setError(null);
      return await coreEngine.explain(itemId, type);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get explanation';
      setError(errorMsg);
      console.error('Explanation error:', err);
      return { explanation: [], dataUsed: [], reasoning: [], confidence: 0 };
    }
  }, [coreEngine]);

  // Specialized Predictors
  const predictEligibility = useCallback(async (veteranProfile: any) => {
    try {
      setLoading(true);
      setError(null);
      return await eligibilityPredictor.predict(veteranProfile);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Eligibility prediction failed';
      setError(errorMsg);
      console.error('Eligibility error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [eligibilityPredictor]);

  const analyzeEvidenceGaps = useCallback(async (veteranProfile: any) => {
    try {
      setLoading(true);
      setError(null);
      return await evidenceAnalyzer.analyze(veteranProfile);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Evidence analysis failed';
      setError(errorMsg);
      console.error('Evidence error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [evidenceAnalyzer]);

  const matchJobs = useCallback(async (veteranProfile: any, jobs: any[]) => {
    try {
      setLoading(true);
      setError(null);
      return await Promise.all(
        jobs.map(job => employmentMatcher.matchJob(job, veteranProfile))
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Job matching failed';
      setError(errorMsg);
      console.error('Job matching error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [employmentMatcher]);

  const assessTransitionRisk = useCallback(async (veteranProfile: any) => {
    try {
      setLoading(true);
      setError(null);
      return await transitionRiskCalculator.calculateRisk(veteranProfile);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Risk assessment failed';
      setError(errorMsg);
      console.error('Risk assessment error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [transitionRiskCalculator]);

  // Personalization
  const buildPersonalizationContext = useCallback(async (veteranProfile: any) => {
    try {
      setError(null);
      return personalizationEngine.buildContext(veteranProfile);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Personalization context failed';
      setError(errorMsg);
      console.error('Personalization error:', err);
      return null;
    }
  }, [personalizationEngine]);

  const adaptContent = useCallback((text: string, style: 'simple' | 'detailed' | 'technical') => {
    try {
      return personalizationEngine.adaptLanguage(text, style);
    } catch (err) {
      console.error('Content adaptation error:', err);
      return text;
    }
  }, [personalizationEngine]);

  // Workflows & Automation
  const executeWorkflow = useCallback(async (workflowId: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      return await automationEngine.executeWorkflow(workflowId, data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Workflow execution failed';
      setError(errorMsg);
      console.error('Workflow error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [automationEngine]);

  const getWorkflows = useCallback(() => {
    try {
      return automationEngine.getAvailableWorkflows();
    } catch (err) {
      console.error('Get workflows error:', err);
      return [];
    }
  }, [automationEngine]);

  // Feedback & Learning
  const recordOutcome = useCallback(async (predictionId: string, outcome: any) => {
    try {
      await selfImprovementEngine.recordOutcome(predictionId, outcome);
    } catch (err) {
      console.error('Record outcome error:', err);
    }
  }, [selfImprovementEngine]);

  const addFeedback = useCallback(async (predictionId: string, helpful: boolean, comment?: string) => {
    try {
      outcomeTracker.addFeedback(predictionId, helpful, comment);
    } catch (err) {
      console.error('Add feedback error:', err);
    }
  }, [outcomeTracker]);

  const getModelPerformance = useCallback(async (modelName: string) => {
    try {
      setError(null);
      return await selfImprovementEngine.analyzePerformance(modelName);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Model performance fetch failed';
      setError(errorMsg);
      console.error('Model performance error:', err);
      return null;
    }
  }, [selfImprovementEngine]);

  // Audit & Compliance
  const getAuditTrail = useCallback(async (filters?: any) => {
    try {
      setError(null);
      // Note: In production, this would query the database
      return [];
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Audit trail fetch failed';
      setError(errorMsg);
      console.error('Audit error:', err);
      return [];
    }
  }, []);

  const getDecisionHistory = useCallback(async (veteranId: string) => {
    try {
      setError(null);
      // Note: In production, this would query the database
      return [];
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Decision history fetch failed';
      setError(errorMsg);
      console.error('Decision history error:', err);
      return [];
    }
  }, []);

  const exportAuditLog = useCallback(() => {
    try {
      // Export audit logs as JSON
      return JSON.stringify({ exported: new Date().toISOString() });
    } catch (err) {
      console.error('Export error:', err);
      return '{}';
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: IntelligenceContextType = {
    // Services
    coreEngine,
    eligibilityPredictor,
    evidenceAnalyzer,
    employmentMatcher,
    transitionRiskCalculator,
    personalizationEngine,
    automationEngine,
    selfImprovementEngine,
    outcomeTracker,

    // State
    loading,
    error,
    insights,
    predictions,
    recommendations,
    selectedVeteranId,

    // Methods
    getPredictions,
    getInsights,
    getRecommendations,
    getExplanation,
    predictEligibility,
    analyzeEvidenceGaps,
    matchJobs,
    assessTransitionRisk,
    buildPersonalizationContext,
    adaptContent,
    executeWorkflow,
    getWorkflows,
    recordOutcome,
    addFeedback,
    getModelPerformance,
    getAuditTrail,
    getDecisionHistory,
    exportAuditLog,
    setSelectedVeteran,
    clearError
  };

  return (
    <IntelligenceContext.Provider value={value}>
      {children}
    </IntelligenceContext.Provider>
  );
};

/**
 * Hook to use the Intelligence Context
 */
export const useIntelligence = () => {
  const context = useContext(IntelligenceContext);
  if (!context) {
    throw new Error('useIntelligence must be used within IntelligenceProvider');
  }
  return context;
};

/**
 * Hook for predictions specifically
 */
export const usePredictions = (veteranId: string, types?: string[]) => {
  const { getPredictions, predictions, loading, error } = useIntelligence();
  const [isPredicting, setIsPredicting] = React.useState(false);

  React.useEffect(() => {
    if (veteranId) {
      setIsPredicting(true);
      getPredictions(veteranId, types).finally(() => setIsPredicting(false));
    }
  }, [veteranId, types, getPredictions]);

  return {
    predictions,
    loading: loading || isPredicting,
    error
  };
};

/**
 * Hook for insights specifically
 */
export const useInsights = (veteranId: string) => {
  const { getInsights, insights, loading, error } = useIntelligence();
  const [isFetching, setIsFetching] = React.useState(false);

  React.useEffect(() => {
    if (veteranId) {
      setIsFetching(true);
      getInsights(veteranId).finally(() => setIsFetching(false));
    }
  }, [veteranId, getInsights]);

  return {
    insights,
    loading: loading || isFetching,
    error
  };
};

/**
 * Hook for recommendations specifically
 */
export const useRecommendations = (veteranId: string) => {
  const { getRecommendations, recommendations, loading, error } = useIntelligence();
  const [isFetching, setIsFetching] = React.useState(false);

  React.useEffect(() => {
    if (veteranId) {
      setIsFetching(true);
      getRecommendations(veteranId).finally(() => setIsFetching(false));
    }
  }, [veteranId, getRecommendations]);

  return {
    recommendations,
    loading: loading || isFetching,
    error
  };
};
