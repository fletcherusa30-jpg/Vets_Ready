/**
 * Rules Engine Service
 * Config-driven engine for evaluating eligibility and generating recommendations
 */

export interface Rule {
  id: string;
  name: string;
  description: string;
  domain: string;
  priority: number;
  isActive: boolean;
  conditions: Condition[];
  actions: Action[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in_list';
  value: any;
  logic?: 'AND' | 'OR';
}

export interface Action {
  type: 'eligibility' | 'recommendation' | 'nudge' | 'alert';
  payload: Record<string, any>;
}

export interface EligibilityResult {
  isEligible: boolean;
  ruleId: string;
  reason: string;
  metadata?: Record<string, any>;
}

export interface Recommendation {
  id: string;
  domain: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  relevance: number; // 0-1
  metadata?: Record<string, any>;
}

export interface Nudge {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'action_required';
  actionUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface IRulesEngine {
  // Rule Management
  createRule(rule: Rule): Promise<Rule>;
  updateRule(id: string, rule: Partial<Rule>): Promise<Rule>;
  deleteRule(id: string): Promise<void>;
  getRule(id: string): Promise<Rule | null>;
  getAllRules(domain?: string): Promise<Rule[]>;

  // Evaluation
  evaluateEligibility(veteranId: string, rule: Rule): Promise<EligibilityResult>;
  evaluateMultipleRules(veteranId: string, rules: Rule[]): Promise<EligibilityResult[]>;

  // Recommendations
  generateRecommendations(veteranId: string, domain?: string): Promise<Recommendation[]>;
  scoreRecommendation(veteranId: string, recommendation: Recommendation): Promise<number>;

  // Nudges
  evaluateNudges(veteranId: string): Promise<Nudge[]>;
  createNudge(nudge: Nudge): Promise<Nudge>;
  dismissNudge(userId: string, nudgeId: string): Promise<void>;
}
