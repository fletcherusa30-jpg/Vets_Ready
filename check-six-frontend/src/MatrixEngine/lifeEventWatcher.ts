/**
 * VETERAN LIFE EVENT WATCHER
 *
 * Monitors for major life events and triggers updates across all modules.
 *
 * INTEGRATIONS:
 * - Digital Twin (event detection)
 * - Matrix Engine (re-run on events)
 * - GIE (validate changes)
 * - Opportunity Radar, Mission Packs, Local Resources (refresh all)
 * - Readiness Index (recalculate)
 */

import { DigitalTwin } from '../types/digitalTwin';
import { syncVeteranIdentity } from './veteranIdentitySync';

/**
 * Life event types
 */
export type LifeEventType =
  | 'moved'
  | 'married'
  | 'divorced'
  | 'child-born'
  | 'child-adopted'
  | 'job-changed'
  | 'rating-changed'
  | 'new-diagnosis'
  | 'school-enrolled'
  | 'retired'
  | 'home-purchased'
  | 'business-started';

/**
 * Life event structure
 */
export interface LifeEvent {
  id: string;
  type: LifeEventType;
  date: Date;
  description: string;
  metadata: Record<string, any>;
  triggeredBy: 'user' | 'system' | 'upload';
  processed: boolean;
  syncResults?: any[];
}

/**
 * Detect life events by comparing Digital Twin snapshots
 */
export function detectLifeEvents(
  oldDigitalTwin: DigitalTwin,
  newDigitalTwin: DigitalTwin
): LifeEvent[] {
  const events: LifeEvent[] = [];
  const now = new Date();

  // Moved (address change)
  if (oldDigitalTwin.state !== newDigitalTwin.state ||
      oldDigitalTwin.zip !== newDigitalTwin.zip) {
    events.push({
      id: `event-${Date.now()}-moved`,
      type: 'moved',
      date: now,
      description: `Moved from ${oldDigitalTwin.state || 'unknown'} to ${newDigitalTwin.state || 'unknown'}`,
      metadata: {
        oldState: oldDigitalTwin.state,
        newState: newDigitalTwin.state,
        oldZip: oldDigitalTwin.zip,
        newZip: newDigitalTwin.zip,
      },
      triggeredBy: 'user',
      processed: false,
    });
  }

  // Marriage / Divorce
  if (oldDigitalTwin.maritalStatus !== newDigitalTwin.maritalStatus) {
    const type = newDigitalTwin.maritalStatus === 'married' ? 'married' :
                 newDigitalTwin.maritalStatus === 'divorced' ? 'divorced' : null;

    if (type) {
      events.push({
        id: `event-${Date.now()}-${type}`,
        type: type as LifeEventType,
        date: now,
        description: `Marital status changed to ${newDigitalTwin.maritalStatus}`,
        metadata: {
          oldStatus: oldDigitalTwin.maritalStatus,
          newStatus: newDigitalTwin.maritalStatus,
        },
        triggeredBy: 'user',
        processed: false,
      });
    }
  }

  // Child born/adopted (children count increased)
  if ((newDigitalTwin.children || 0) > (oldDigitalTwin.children || 0)) {
    events.push({
      id: `event-${Date.now()}-child`,
      type: 'child-born',
      date: now,
      description: `Added ${(newDigitalTwin.children || 0) - (oldDigitalTwin.children || 0)} child(ren)`,
      metadata: {
        oldCount: oldDigitalTwin.children || 0,
        newCount: newDigitalTwin.children || 0,
      },
      triggeredBy: 'user',
      processed: false,
    });
  }

  // Job change
  if (oldDigitalTwin.employment?.status !== newDigitalTwin.employment?.status) {
    events.push({
      id: `event-${Date.now()}-job-change`,
      type: 'job-changed',
      date: now,
      description: `Employment status changed from ${oldDigitalTwin.employment?.status || 'unknown'} to ${newDigitalTwin.employment?.status || 'unknown'}`,
      metadata: {
        oldStatus: oldDigitalTwin.employment?.status,
        newStatus: newDigitalTwin.employment?.status,
        oldIndustry: oldDigitalTwin.employment?.industry,
        newIndustry: newDigitalTwin.employment?.industry,
      },
      triggeredBy: 'user',
      processed: false,
    });
  }

  // Rating change
  if (oldDigitalTwin.combinedRating !== newDigitalTwin.combinedRating) {
    events.push({
      id: `event-${Date.now()}-rating-change`,
      type: 'rating-changed',
      date: now,
      description: `VA rating changed from ${oldDigitalTwin.combinedRating || 0}% to ${newDigitalTwin.combinedRating || 0}%`,
      metadata: {
        oldRating: oldDigitalTwin.combinedRating || 0,
        newRating: newDigitalTwin.combinedRating || 0,
        increase: (newDigitalTwin.combinedRating || 0) > (oldDigitalTwin.combinedRating || 0),
      },
      triggeredBy: 'system',
      processed: false,
    });
  }

  // New diagnosis (new condition added)
  const oldConditionCount = oldDigitalTwin.disabilities?.length || 0;
  const newConditionCount = newDigitalTwin.disabilities?.length || 0;
  if (newConditionCount > oldConditionCount) {
    const newConditions = newDigitalTwin.disabilities?.slice(oldConditionCount) || [];
    events.push({
      id: `event-${Date.now()}-diagnosis`,
      type: 'new-diagnosis',
      date: now,
      description: `Added ${newConditions.length} new condition(s)`,
      metadata: {
        newConditions: newConditions.map(c => c.conditionName),
      },
      triggeredBy: 'user',
      processed: false,
    });
  }

  // School enrollment
  if (oldDigitalTwin.education?.status !== newDigitalTwin.education?.status &&
      newDigitalTwin.education?.status === 'enrolled') {
    events.push({
      id: `event-${Date.now()}-school`,
      type: 'school-enrolled',
      date: now,
      description: 'Enrolled in school',
      metadata: {
        level: newDigitalTwin.education?.level,
      },
      triggeredBy: 'user',
      processed: false,
    });
  }

  // Retirement
  if (oldDigitalTwin.employment?.status !== 'retired' &&
      newDigitalTwin.employment?.status === 'retired') {
    events.push({
      id: `event-${Date.now()}-retired`,
      type: 'retired',
      date: now,
      description: 'Retired',
      metadata: {},
      triggeredBy: 'user',
      processed: false,
    });
  }

  return events;
}

/**
 * Process a life event - trigger all necessary updates
 */
export async function processLifeEvent(
  event: LifeEvent,
  digitalTwin: DigitalTwin
): Promise<LifeEvent> {
  console.log(`[Life Event Watcher] Processing event: ${event.type}`, event);

  // Build updated Digital Twin with event-specific changes
  let updatedDigitalTwin = { ...digitalTwin };

  // Apply event-specific logic
  switch (event.type) {
    case 'moved':
      // Already updated in Digital Twin
      // Trigger local resources refresh
      console.log('[Life Event Watcher] Triggering local resources refresh');
      break;

    case 'married':
    case 'divorced':
      // Already updated in Digital Twin
      // Trigger family benefits refresh
      console.log('[Life Event Watcher] Triggering family benefits refresh');
      break;

    case 'child-born':
    case 'child-adopted':
      // Already updated in Digital Twin
      // Trigger dependent benefits refresh
      console.log('[Life Event Watcher] Triggering dependent benefits refresh');
      break;

    case 'rating-changed':
      // Already updated in Digital Twin
      // Trigger all benefit calculations
      console.log('[Life Event Watcher] Triggering benefit recalculations');
      break;

    case 'new-diagnosis':
      // Already updated in Digital Twin
      // Trigger secondary condition finder
      // Trigger evidence builder
      console.log('[Life Event Watcher] Triggering secondary condition analysis');
      break;

    case 'job-changed':
      // Update employment hub
      console.log('[Life Event Watcher] Triggering employment resources update');
      break;

    case 'school-enrolled':
      // Update education hub
      console.log('[Life Event Watcher] Triggering education benefits check');
      break;

    case 'retired':
      // Suggest life situation change
      updatedDigitalTwin.lifeSituation = {
        ...updatedDigitalTwin.lifeSituation,
        currentMode: 'retired',
      };
      console.log('[Life Event Watcher] Suggesting "retired" life situation');
      break;
  }

  // Trigger identity sync (which cascades to all modules)
  const syncResults = await syncVeteranIdentity(digitalTwin, updatedDigitalTwin);

  // Mark event as processed
  return {
    ...event,
    processed: true,
    syncResults,
  };
}

/**
 * Get suggested actions for a life event
 */
export function getSuggestedActionsForEvent(event: LifeEvent): Array<{
  title: string;
  description: string;
  url: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const actions: Array<{ title: string; description: string; url: string; priority: 'high' | 'medium' | 'low' }> = [];

  switch (event.type) {
    case 'moved':
      actions.push(
        {
          title: 'Update VA Address',
          description: 'Notify the VA of your address change',
          url: '/mission-packs/update-va-address',
          priority: 'high',
        },
        {
          title: 'Find Local Resources',
          description: 'Explore veteran resources in your new area',
          url: '/local-resources',
          priority: 'medium',
        },
        {
          title: 'Check State Benefits',
          description: 'See what benefits are available in your new state',
          url: '/benefits/state-benefits',
          priority: 'medium',
        }
      );
      break;

    case 'married':
      actions.push(
        {
          title: 'Add Spouse as Dependent',
          description: 'Update your VA records to add your spouse',
          url: '/mission-packs/add-dependent',
          priority: 'high',
        },
        {
          title: 'Check Spouse Benefits',
          description: 'Explore benefits available to your spouse',
          url: '/benefits/family-benefits',
          priority: 'medium',
        }
      );
      break;

    case 'child-born':
    case 'child-adopted':
      actions.push(
        {
          title: 'Add Child as Dependent',
          description: 'Update your VA records to add your child',
          url: '/mission-packs/add-dependent',
          priority: 'high',
        },
        {
          title: 'Education Benefits for Dependents',
          description: 'Learn about education benefits for your children',
          url: '/benefits/dependent-education',
          priority: 'medium',
        },
        {
          title: 'Healthcare for Dependents',
          description: 'Explore healthcare options for your children',
          url: '/benefits/family-healthcare',
          priority: 'medium',
        }
      );
      break;

    case 'rating-changed':
      if (event.metadata.increase) {
        actions.push(
          {
            title: 'Check New Benefits',
            description: 'See what new benefits you qualify for at your new rating',
            url: '/benefits',
            priority: 'high',
          },
          {
            title: 'Update Compensation',
            description: 'Verify your new monthly compensation amount',
            url: '/tools/disability-calculator',
            priority: 'high',
          }
        );
      }
      break;

    case 'new-diagnosis':
      actions.push(
        {
          title: 'Find Secondary Conditions',
          description: 'Check for related conditions you may be eligible for',
          url: '/tools/secondary-condition-finder',
          priority: 'high',
        },
        {
          title: 'Gather Evidence',
          description: 'Start collecting medical evidence for your new condition',
          url: '/tools/evidence-builder',
          priority: 'high',
        },
        {
          title: 'File Increase or New Claim',
          description: 'File for service connection of your new condition',
          url: '/mission-packs/file-disability-claim',
          priority: 'medium',
        }
      );
      break;

    case 'school-enrolled':
      actions.push(
        {
          title: 'Apply for GI Bill',
          description: 'Use your education benefits',
          url: '/mission-packs/apply-gi-bill',
          priority: 'high',
        },
        {
          title: 'Check VR&E Eligibility',
          description: 'See if you qualify for Vocational Rehabilitation',
          url: '/benefits/vre',
          priority: 'medium',
        }
      );
      break;

    case 'retired':
      actions.push(
        {
          title: 'Maximize Retirement Benefits',
          description: 'Explore all benefits available to retired veterans',
          url: '/mission-packs/retirement-benefits',
          priority: 'high',
        },
        {
          title: 'Healthcare Enrollment',
          description: 'Ensure you\'re enrolled in VA healthcare',
          url: '/benefits/healthcare',
          priority: 'medium',
        }
      );
      break;
  }

  return actions;
}

/**
 * Get life event history
 */
export function getLifeEventHistory(
  digitalTwin: DigitalTwin
): LifeEvent[] {
  // In real implementation, would load from database
  return digitalTwin.lifeEvents || [];
}

/**
 * Save life event to history
 */
export function saveLifeEvent(
  digitalTwin: DigitalTwin,
  event: LifeEvent
): DigitalTwin {
  const events = digitalTwin.lifeEvents || [];
  return {
    ...digitalTwin,
    lifeEvents: [...events, event],
  };
}
