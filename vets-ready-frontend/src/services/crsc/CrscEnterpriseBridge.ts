import { CrscAnalyticsEvent, CRSCComputationResult, CRSCEvidenceMappingResult } from '../../types/crscTypes'

interface BuildCrscEventInput {
  cohortId: string
  eligibilityStatus: string
  computation: CRSCComputationResult
  evidenceMap: CRSCEvidenceMappingResult
  retirementImpactScore: number
  timestamp?: string
  branch?: string
  installation?: string
}

interface CrscAggregationFilters {
  cohortIds?: string[]
  branch?: string
  installation?: string
  from?: string
  to?: string
}

export interface CrscEnterpriseDashboardView {
  eligibilityDistribution: Record<string, number>
  combatCategoryBreakdown: Record<string, number>
  evidenceStrengthDistribution: Record<'LOW' | 'MEDIUM' | 'HIGH', number>
  payableRangeDistribution: Array<{ range: string; count: number }>
  retirementImpactTrend: Array<{ period: string; averageImpact: number }>
}

const localEventBuffer: CrscAnalyticsEvent[] = []

function deriveEvidenceStrength(map: CRSCEvidenceMappingResult): 'LOW' | 'MEDIUM' | 'HIGH' {
  const counts: Record<'LOW' | 'MEDIUM' | 'HIGH', number> = { LOW: 0, MEDIUM: 0, HIGH: 0 }
  map.conditions.forEach(cond => {
    counts[cond.confidence] = (counts[cond.confidence] || 0) + 1
  })
  if (counts.HIGH >= counts.MEDIUM && counts.HIGH >= counts.LOW) return 'HIGH'
  if (counts.MEDIUM >= counts.LOW) return 'MEDIUM'
  return 'LOW'
}

function deriveCombatCategoryCounts(map: CRSCEvidenceMappingResult) {
  return map.conditions.reduce(
    (acc, cond) => {
      switch (cond.combatCategory) {
        case 'armed_conflict':
          acc.armedConflict += 1
          break
        case 'hazardous_service':
          acc.hazardousService += 1
          break
        case 'simulated_war':
          acc.simulatedWar += 1
          break
        case 'instrumentality_of_war':
          acc.instrumentalityOfWar += 1
          break
        case 'purple_heart':
          acc.purpleHeart += 1
          break
        default:
          break
      }
      return acc
    },
    {
      armedConflict: 0,
      hazardousService: 0,
      simulatedWar: 0,
      instrumentalityOfWar: 0,
      purpleHeart: 0
    }
  )
}

export function buildCrscAnalyticsEvent(input: BuildCrscEventInput): CrscAnalyticsEvent {
  return {
    cohortId: input.cohortId,
    timestamp: input.timestamp || new Date().toISOString(),
    eligibilityStatus: input.eligibilityStatus,
    combatRelatedPercentage: input.computation.combatRelatedPercentage,
    evidenceStrength: deriveEvidenceStrength(input.evidenceMap),
    crscPayableEstimate: input.computation.crscFinalPayment,
    retirementImpactScore: input.retirementImpactScore,
    combatCategoryCounts: deriveCombatCategoryCounts(input.evidenceMap),
    branch: input.branch,
    installation: input.installation
  }
}

const defaultTransport = async (event: CrscAnalyticsEvent) => {
  await fetch('/enterprise/crsc/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  })
}

export async function emitCrscAnalyticsEvent(
  event: CrscAnalyticsEvent,
  transport: (evt: CrscAnalyticsEvent) => Promise<void> = defaultTransport
): Promise<boolean> {
  try {
    await transport(event)
    localEventBuffer.push(event)
    return true
  } catch (err) {
    console.error('Failed to emit CRSC analytics event (anonymized):', err)
    return false
  }
}

function filterEvents(events: CrscAnalyticsEvent[], filters?: CrscAggregationFilters) {
  if (!filters) return events
  return events.filter(evt => {
    if (filters.cohortIds && !filters.cohortIds.includes(evt.cohortId)) return false
    if (filters.branch && evt.branch && evt.branch !== filters.branch) return false
    if (filters.installation && evt.installation && evt.installation !== filters.installation) return false
    if (filters.from && new Date(evt.timestamp) < new Date(filters.from)) return false
    if (filters.to && new Date(evt.timestamp) > new Date(filters.to)) return false
    return true
  })
}

function bucketPayable(amount: number): string {
  if (amount < 500) return '$0-499'
  if (amount < 1000) return '$500-999'
  if (amount < 2000) return '$1,000-1,999'
  return '$2,000+'
}

export function aggregateCrscEvents(
  events: CrscAnalyticsEvent[],
  filters?: CrscAggregationFilters
): CrscEnterpriseDashboardView {
  const filtered = filterEvents(events, filters)

  const eligibilityDistribution: Record<string, number> = {}
  const combatCategoryBreakdown = {
    armed_conflict: 0,
    hazardous_service: 0,
    simulated_war: 0,
    instrumentality_of_war: 0,
    purple_heart: 0
  }
  const evidenceStrengthDistribution: Record<'LOW' | 'MEDIUM' | 'HIGH', number> = { LOW: 0, MEDIUM: 0, HIGH: 0 }
  const payableRangeDistribution: Record<string, number> = {}
  const retirementImpactByPeriod: Record<string, number[]> = {}

  filtered.forEach(evt => {
    eligibilityDistribution[evt.eligibilityStatus] = (eligibilityDistribution[evt.eligibilityStatus] || 0) + 1
    combatCategoryBreakdown.armed_conflict += evt.combatCategoryCounts.armedConflict
    combatCategoryBreakdown.hazardous_service += evt.combatCategoryCounts.hazardousService
    combatCategoryBreakdown.simulated_war += evt.combatCategoryCounts.simulatedWar
    combatCategoryBreakdown.instrumentality_of_war += evt.combatCategoryCounts.instrumentalityOfWar
    combatCategoryBreakdown.purple_heart += evt.combatCategoryCounts.purpleHeart

    evidenceStrengthDistribution[evt.evidenceStrength] = (evidenceStrengthDistribution[evt.evidenceStrength] || 0) + 1

    const bucket = bucketPayable(evt.crscPayableEstimate)
    payableRangeDistribution[bucket] = (payableRangeDistribution[bucket] || 0) + 1

    const periodKey = evt.timestamp.slice(0, 7) // YYYY-MM
    retirementImpactByPeriod[periodKey] = retirementImpactByPeriod[periodKey] || []
    retirementImpactByPeriod[periodKey].push(evt.retirementImpactScore)
  })

  const payableRangeArray = Object.entries(payableRangeDistribution).map(([range, count]) => ({ range, count }))

  const retirementImpactTrend = Object.entries(retirementImpactByPeriod)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([period, scores]) => ({
      period,
      averageImpact: scores.reduce((a, b) => a + b, 0) / (scores.length || 1)
    }))

  return {
    eligibilityDistribution,
    combatCategoryBreakdown,
    evidenceStrengthDistribution,
    payableRangeDistribution: payableRangeArray,
    retirementImpactTrend
  }
}

export function getLocalCrscEvents(): CrscAnalyticsEvent[] {
  return [...localEventBuffer]
}
