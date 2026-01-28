/**
 * VETERAN IDENTITY SYNC ENGINE (VIS)
 *
 * Keeps the veteran's identity consistent across all modules.
 * Automatically triggers updates when identity data changes.
 *
 * INTEGRATIONS:
 * - Digital Twin (source of truth)
 * - Matrix Engine (re-run on changes)
 * - GIE (validate consistency)
 * - Opportunity Radar (refresh opportunities)
 * - Mission Packs (update relevant packs)
 * - All Hubs (Employment, Education, Housing, Family, Local Resources)
 * - Discount Engine (eligibility updates)
 * - Theme Engine (branch identity)
 */

import { DigitalTwin } from '../types/digitalTwin';

/**
 * Core identity data that drives all modules
 */
export interface VeteranIdentity {
  // Service Identity
  branch: 'Army' | 'Navy' | 'Air Force' | 'Marine Corps' | 'Coast Guard' | 'Space Force';
  rank: string;
  serviceEra: string[];
  mos: string;
  units: string[];
  deployments: string[];

  // Disability Identity
  disabilities: Array<{
    conditionName: string;
    diagnosticCode: string;
    percentage: number;
  }>;
  combinedRating: number;

  // Personal Identity
  familyStatus: {
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
    children: number;
    dependents: number;
  };

  // Location Identity
  location: {
    state: string;
    zip: string;
    county?: string;
  };

  // Life Situation
  lifeSituation: {
    currentMode: 'transitioning' | 'filing-claim' | 'appealing' | 'buying-home' |
                 'going-to-school' | 'changing-careers' | 'starting-business' |
                 'retired' | 'disabled-stable' | 'family-focused' | 'not-set';
    goals: string[];
  };

  // Employment & Education
  employment: {
    status: 'employed' | 'unemployed' | 'self-employed' | 'retired' | 'student' | 'disabled';
    industry?: string;
  };
  education: {
    status: 'not-enrolled' | 'enrolled' | 'planning';
    level?: string;
  };
}

/**
 * Modules that need to be notified when identity changes
 */
export type SyncModule =
  | 'digitalTwin'
  | 'matrixEngine'
  | 'gie'
  | 'opportunityRadar'
  | 'missionPacks'
  | 'readinessIndex'
  | 'employmentHub'
  | 'educationHub'
  | 'housingHub'
  | 'familyHub'
  | 'localResourcesHub'
  | 'discountEngine'
  | 'themeEngine'
  | 'dashboard';

/**
 * Change event that triggers syncs
 */
export interface IdentityChangeEvent {
  module: SyncModule;
  field: keyof VeteranIdentity | string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  triggeredBy: 'user' | 'system' | 'upload';
}

/**
 * Sync result for tracking
 */
export interface SyncResult {
  module: SyncModule;
  success: boolean;
  timestamp: Date;
  error?: string;
}

/**
 * Extract current identity from Digital Twin
 */
export function extractIdentity(digitalTwin: DigitalTwin): VeteranIdentity {
  return {
    branch: digitalTwin.branch || 'Army',
    rank: digitalTwin.rank || '',
    serviceEra: digitalTwin.serviceEra || [],
    mos: digitalTwin.mos || '',
    units: digitalTwin.units || [],
    deployments: digitalTwin.deployments || [],

    disabilities: digitalTwin.disabilities || [],
    combinedRating: digitalTwin.combinedRating || 0,

    familyStatus: {
      maritalStatus: digitalTwin.maritalStatus || 'single',
      children: digitalTwin.children || 0,
      dependents: digitalTwin.dependents || 0,
    },

    location: {
      state: digitalTwin.state || '',
      zip: digitalTwin.zip || '',
      county: digitalTwin.county,
    },

    lifeSituation: {
      currentMode: digitalTwin.lifeSituation?.currentMode || 'not-set',
      goals: digitalTwin.lifeSituation?.goals || [],
    },

    employment: {
      status: digitalTwin.employment?.status || 'not-set',
      industry: digitalTwin.employment?.industry,
    },

    education: {
      status: digitalTwin.education?.status || 'not-enrolled',
      level: digitalTwin.education?.level,
    },
  };
}

/**
 * Compare two identity snapshots to detect changes
 */
export function detectIdentityChanges(
  oldIdentity: VeteranIdentity,
  newIdentity: VeteranIdentity
): IdentityChangeEvent[] {
  const changes: IdentityChangeEvent[] = [];
  const now = new Date();

  // Service Identity Changes
  if (oldIdentity.branch !== newIdentity.branch) {
    changes.push({
      module: 'digitalTwin',
      field: 'branch',
      oldValue: oldIdentity.branch,
      newValue: newIdentity.branch,
      timestamp: now,
      triggeredBy: 'user',
    });
  }

  if (oldIdentity.rank !== newIdentity.rank) {
    changes.push({
      module: 'digitalTwin',
      field: 'rank',
      oldValue: oldIdentity.rank,
      newValue: newIdentity.rank,
      timestamp: now,
      triggeredBy: 'user',
    });
  }

  // Disability Changes
  if (oldIdentity.combinedRating !== newIdentity.combinedRating) {
    changes.push({
      module: 'digitalTwin',
      field: 'combinedRating',
      oldValue: oldIdentity.combinedRating,
      newValue: newIdentity.combinedRating,
      timestamp: now,
      triggeredBy: 'system',
    });
  }

  // Location Changes
  if (oldIdentity.location.state !== newIdentity.location.state) {
    changes.push({
      module: 'digitalTwin',
      field: 'location.state',
      oldValue: oldIdentity.location.state,
      newValue: newIdentity.location.state,
      timestamp: now,
      triggeredBy: 'user',
    });
  }

  if (oldIdentity.location.zip !== newIdentity.location.zip) {
    changes.push({
      module: 'digitalTwin',
      field: 'location.zip',
      oldValue: oldIdentity.location.zip,
      newValue: newIdentity.location.zip,
      timestamp: now,
      triggeredBy: 'user',
    });
  }

  // Life Situation Changes
  if (oldIdentity.lifeSituation.currentMode !== newIdentity.lifeSituation.currentMode) {
    changes.push({
      module: 'digitalTwin',
      field: 'lifeSituation.currentMode',
      oldValue: oldIdentity.lifeSituation.currentMode,
      newValue: newIdentity.lifeSituation.currentMode,
      timestamp: now,
      triggeredBy: 'user',
    });
  }

  // Family Changes
  if (oldIdentity.familyStatus.maritalStatus !== newIdentity.familyStatus.maritalStatus) {
    changes.push({
      module: 'digitalTwin',
      field: 'familyStatus.maritalStatus',
      oldValue: oldIdentity.familyStatus.maritalStatus,
      newValue: newIdentity.familyStatus.maritalStatus,
      timestamp: now,
      triggeredBy: 'user',
    });
  }

  if (oldIdentity.familyStatus.children !== newIdentity.familyStatus.children) {
    changes.push({
      module: 'digitalTwin',
      field: 'familyStatus.children',
      oldValue: oldIdentity.familyStatus.children,
      newValue: newIdentity.familyStatus.children,
      timestamp: now,
      triggeredBy: 'user',
    });
  }

  return changes;
}

/**
 * Determine which modules need to sync based on changed fields
 */
export function getAffectedModules(changes: IdentityChangeEvent[]): SyncModule[] {
  const modules = new Set<SyncModule>();

  // Always sync these
  modules.add('digitalTwin');
  modules.add('dashboard');

  changes.forEach(change => {
    // Branch change affects theme
    if (change.field === 'branch') {
      modules.add('themeEngine');
    }

    // Rating changes affect many modules
    if (change.field === 'combinedRating' || change.field === 'disabilities') {
      modules.add('matrixEngine');
      modules.add('opportunityRadar');
      modules.add('missionPacks');
      modules.add('housingHub');
      modules.add('familyHub');
      modules.add('discountEngine');
      modules.add('readinessIndex');
    }

    // Location changes affect local services
    if (change.field.startsWith('location.')) {
      modules.add('localResourcesHub');
      modules.add('discountEngine');
      modules.add('opportunityRadar');
    }

    // Life situation affects priorities
    if (change.field.startsWith('lifeSituation.')) {
      modules.add('missionPacks');
      modules.add('opportunityRadar');
      modules.add('readinessIndex');
      modules.add('dashboard');
    }

    // Family changes affect benefits
    if (change.field.startsWith('familyStatus.')) {
      modules.add('familyHub');
      modules.add('opportunityRadar');
      modules.add('matrixEngine');
    }

    // Employment changes
    if (change.field.startsWith('employment.')) {
      modules.add('employmentHub');
      modules.add('opportunityRadar');
    }

    // Education changes
    if (change.field.startsWith('education.')) {
      modules.add('educationHub');
      modules.add('opportunityRadar');
    }
  });

  // GIE always runs to validate changes
  modules.add('gie');

  return Array.from(modules);
}

/**
 * Sync identity changes to a specific module
 * (In real implementation, this would call module-specific update functions)
 */
export async function syncToModule(
  module: SyncModule,
  identity: VeteranIdentity,
  changes: IdentityChangeEvent[]
): Promise<SyncResult> {
  try {
    // In real implementation, each module would have its own sync handler
    console.log(`[VIS] Syncing to ${module}`, { identity, changes });

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 10));

    return {
      module,
      success: true,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      module,
      success: false,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Main sync orchestrator
 * Call this whenever veteran identity data changes
 */
export async function syncVeteranIdentity(
  oldDigitalTwin: DigitalTwin,
  newDigitalTwin: DigitalTwin
): Promise<SyncResult[]> {
  // Extract identity snapshots
  const oldIdentity = extractIdentity(oldDigitalTwin);
  const newIdentity = extractIdentity(newDigitalTwin);

  // Detect changes
  const changes = detectIdentityChanges(oldIdentity, newIdentity);

  // No changes, skip sync
  if (changes.length === 0) {
    return [];
  }

  console.log(`[VIS] Detected ${changes.length} identity changes`, changes);

  // Determine affected modules
  const modulesToSync = getAffectedModules(changes);

  console.log(`[VIS] Syncing to ${modulesToSync.length} modules`, modulesToSync);

  // Sync to all affected modules in parallel
  const syncPromises = modulesToSync.map(module =>
    syncToModule(module, newIdentity, changes)
  );

  const results = await Promise.all(syncPromises);

  // Log failures
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.error('[VIS] Sync failures:', failures);
  }

  return results;
}

/**
 * Get a human-readable summary of identity
 */
export function getIdentitySummary(identity: VeteranIdentity): string {
  const parts = [];

  if (identity.rank && identity.branch) {
    parts.push(`${identity.rank}, ${identity.branch}`);
  }

  if (identity.combinedRating > 0) {
    parts.push(`${identity.combinedRating}% disabled`);
  }

  if (identity.location.state) {
    parts.push(`in ${identity.location.state}`);
  }

  if (identity.lifeSituation.currentMode !== 'not-set') {
    const modeLabel = identity.lifeSituation.currentMode.replace(/-/g, ' ');
    parts.push(modeLabel);
  }

  return parts.join(' • ');
}
