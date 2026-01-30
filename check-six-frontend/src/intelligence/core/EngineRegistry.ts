/**
 * Engine Registry
 * Manages registration, discovery, and communication with all rallyforge engines
 */

import { EngineType, DataContract } from '../types/IntelligenceTypes';

/**
 * Interface for rallyforge engines
 */
export interface IEngine {
  getId(): EngineType;
  getVersion(): string;
  getData(veteranId: string): Promise<any>;
  processEvent(event: EngineEvent): Promise<void>;
  getCapabilities(): string[];
}

/**
 * Event published between engines
 */
export interface EngineEvent {
  id: string;
  type: string;
  source: EngineType;
  target?: EngineType | 'broadcast';
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}

/**
 * Engine registry for cross-engine communication
 */
export class EngineRegistry {
  private static instance: EngineRegistry;
  private engines: Map<EngineType, IEngine>;
  private eventSubscriptions: Map<string, Set<EngineType>>;
  private eventHistory: EngineEvent[];
  private readonly MAX_HISTORY = 1000;

  private constructor() {
    this.engines = new Map();
    this.eventSubscriptions = new Map();
    this.eventHistory = [];
    this.initializeDefaultEngines();
  }

  public static getInstance(): EngineRegistry {
    if (!EngineRegistry.instance) {
      EngineRegistry.instance = new EngineRegistry();
    }
    return EngineRegistry.instance;
  }

  /**
   * Register an engine
   */
  public registerEngine(engine: IEngine): void {
    const id = engine.getId();
    this.engines.set(id, engine);
    console.log(`[EngineRegistry] Registered ${id} engine v${engine.getVersion()}`);
  }

  /**
   * Get a specific engine
   */
  public getEngine(engineId: EngineType): IEngine | undefined {
    return this.engines.get(engineId);
  }

  /**
   * Get all registered engines
   */
  public getAllEngines(): EngineType[] {
    return Array.from(this.engines.keys());
  }

  /**
   * Subscribe to events
   */
  public subscribe(eventType: string, engineId: EngineType): void {
    if (!this.eventSubscriptions.has(eventType)) {
      this.eventSubscriptions.set(eventType, new Set());
    }
    this.eventSubscriptions.get(eventType)!.add(engineId);
  }

  /**
   * Publish an event (async communication between engines)
   */
  public async publishEvent(event: EngineEvent): Promise<void> {
    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.MAX_HISTORY) {
      this.eventHistory.shift();
    }

    // Determine targets
    const targets: EngineType[] = [];

    if (event.target && event.target !== 'broadcast') {
      targets.push(event.target);
    } else {
      // Broadcast or subscription-based
      const subscribers = this.eventSubscriptions.get(event.type);
      if (subscribers) {
        targets.push(...Array.from(subscribers));
      }
    }

    // Deliver to targets
    for (const targetId of targets) {
      const engine = this.engines.get(targetId);
      if (engine) {
        try {
          await engine.processEvent(event);
        } catch (error) {
          console.error(`[EngineRegistry] Error delivering event to ${targetId}:`, error);
        }
      }
    }
  }

  /**
   * Get event history for debugging/audit
   */
  public getEventHistory(filter?: {
    source?: EngineType;
    target?: EngineType;
    type?: string;
    since?: Date;
  }): EngineEvent[] {
    let events = this.eventHistory;

    if (filter) {
      events = events.filter(e => {
        if (filter.source && e.source !== filter.source) return false;
        if (filter.target && e.target !== filter.target) return false;
        if (filter.type && e.type !== filter.type) return false;
        if (filter.since && e.timestamp < filter.since) return false;
        return true;
      });
    }

    return events;
  }

  /**
   * Initialize default engine implementations
   */
  private initializeDefaultEngines(): void {
    // Register mock engines for each type
    // Real implementations will replace these
    this.registerEngine(new BenefitsEngineAdapter());
    this.registerEngine(new EvidenceEngineAdapter());
    this.registerEngine(new RetirementEngineAdapter());
    this.registerEngine(new TransitionEngineAdapter());
    this.registerEngine(new EmploymentEngineAdapter());
    this.registerEngine(new ResourcesEngineAdapter());
  }
}

/**
 * Base adapter for existing engines
 */
abstract class EngineAdapter implements IEngine {
  abstract getId(): EngineType;
  abstract getVersion(): string;
  abstract getData(veteranId: string): Promise<any>;
  abstract getCapabilities(): string[];

  async processEvent(event: EngineEvent): Promise<void> {
    console.log(`[${this.getId()}] Received event:`, event.type);
    // Engines can override this to handle cross-engine events
  }
}

/**
 * Benefits Engine Adapter
 */
class BenefitsEngineAdapter extends EngineAdapter {
  getId(): EngineType {
    return 'benefits';
  }

  getVersion(): string {
    return '2.0.0';
  }

  async getData(veteranId: string): Promise<any> {
    // Will integrate with existing benefits calculation
    return {
      eligibleBenefits: [],
      totalMonthly: 0,
      opportunities: []
    };
  }

  getCapabilities(): string[] {
    return [
      'calculate-benefits',
      'check-eligibility',
      'estimate-value',
      'compare-options'
    ];
  }
}

/**
 * Evidence Engine Adapter
 */
class EvidenceEngineAdapter extends EngineAdapter {
  getId(): EngineType {
    return 'evidence';
  }

  getVersion(): string {
    return '1.0.0';
  }

  async getData(veteranId: string): Promise<any> {
    return {
      uploadedDocuments: [],
      requiredEvidence: [],
      gaps: []
    };
  }

  getCapabilities(): string[] {
    return [
      'analyze-documents',
      'detect-gaps',
      'suggest-evidence',
      'validate-completeness'
    ];
  }
}

/**
 * Retirement Engine Adapter
 */
class RetirementEngineAdapter extends EngineAdapter {
  getId(): EngineType {
    return 'retirement';
  }

  getVersion(): string {
    return '1.0.0';
  }

  async getData(veteranId: string): Promise<any> {
    return {
      retirementDate: null,
      projectedBenefits: 0,
      scenarios: []
    };
  }

  getCapabilities(): string[] {
    return [
      'calculate-retirement',
      'project-benefits',
      'simulate-scenarios',
      'optimize-timing'
    ];
  }
}

/**
 * Transition Engine Adapter
 */
class TransitionEngineAdapter extends EngineAdapter {
  getId(): EngineType {
    return 'transition';
  }

  getVersion(): string {
    return '1.0.0';
  }

  async getData(veteranId: string): Promise<any> {
    return {
      transitionStage: 'pre-separation',
      completedMilestones: [],
      upcomingTasks: []
    };
  }

  getCapabilities(): string[] {
    return [
      'track-milestones',
      'assess-readiness',
      'predict-challenges',
      'recommend-resources'
    ];
  }
}

/**
 * Employment Engine Adapter
 */
class EmploymentEngineAdapter extends EngineAdapter {
  getId(): EngineType {
    return 'employment';
  }

  getVersion(): string {
    return '1.0.0';
  }

  async getData(veteranId: string): Promise<any> {
    return {
      profile: {},
      matches: [],
      applications: []
    };
  }

  getCapabilities(): string[] {
    return [
      'match-jobs',
      'translate-mos',
      'build-resume',
      'track-applications'
    ];
  }
}

/**
 * Resources Engine Adapter
 */
class ResourcesEngineAdapter extends EngineAdapter {
  getId(): EngineType {
    return 'resources';
  }

  getVersion(): string {
    return '1.0.0';
  }

  async getData(veteranId: string): Promise<any> {
    return {
      localResources: [],
      recommendations: [],
      utilized: []
    };
  }

  getCapabilities(): string[] {
    return [
      'find-resources',
      'predict-needs',
      'rank-relevance',
      'track-usage'
    ];
  }
}

export const engineRegistry = EngineRegistry.getInstance();

