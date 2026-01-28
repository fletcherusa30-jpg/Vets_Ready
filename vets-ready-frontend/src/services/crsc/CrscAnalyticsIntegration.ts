import { CRSCComputationInput, CRSCComputationResult, CRSCEvidenceMappingResult } from '../../types/crscTypes'
import { calculateCRSC } from './CRSCRatingCalculator'
import { mapEvidenceToConditions, EvidenceMappingInput } from './CRSCEvidenceMapper'
import { explainCRSC } from './CRSCDecisionExplainer'
import { buildAppealStrategy } from './CRSCAppealStrategy'
import { buildCrscAnalyticsEvent, emitCrscAnalyticsEvent, CrscEnterpriseDashboardView, aggregateCrscEvents, getLocalCrscEvents } from './CrscEnterpriseBridge'

export interface CrscAnalyticsContext {
  cohortId: string
  eligibilityStatus: string
  branch?: string
  installation?: string
  retirementImpactScore?: number
  transport?: (evt: any) => Promise<void>
}

export function calculateCRSCWithAnalytics(
  input: CRSCComputationInput,
  evidenceMap: CRSCEvidenceMappingResult,
  ctx?: CrscAnalyticsContext
): CRSCComputationResult {
  const computation = calculateCRSC(input)
  if (ctx && ctx.cohortId) {
    const event = buildCrscAnalyticsEvent({
      cohortId: ctx.cohortId,
      eligibilityStatus: ctx.eligibilityStatus,
      computation,
      evidenceMap,
      retirementImpactScore: ctx.retirementImpactScore || 0,
      branch: ctx.branch,
      installation: ctx.installation
    })
    void emitCrscAnalyticsEvent(event, ctx.transport || undefined)
  }
  return computation
}

export function mapEvidenceToConditionsWithAnalytics(
  input: EvidenceMappingInput,
  computation: CRSCComputationResult,
  ctx?: CrscAnalyticsContext
): CRSCEvidenceMappingResult {
  const evidenceMap = mapEvidenceToConditions(input)
  if (ctx && ctx.cohortId) {
    const event = buildCrscAnalyticsEvent({
      cohortId: ctx.cohortId,
      eligibilityStatus: ctx.eligibilityStatus,
      computation,
      evidenceMap,
      retirementImpactScore: ctx.retirementImpactScore || 0,
      branch: ctx.branch,
      installation: ctx.installation
    })
    void emitCrscAnalyticsEvent(event, ctx.transport || undefined)
  }
  return evidenceMap
}

export function explainCRSCWithAnalytics(
  params: Parameters<typeof explainCRSC>[0],
  ctx?: CrscAnalyticsContext
) {
  const decision = explainCRSC(params)
  if (ctx && ctx.cohortId && params.computation && params.evidenceMap) {
    const event = buildCrscAnalyticsEvent({
      cohortId: ctx.cohortId,
      eligibilityStatus: ctx.eligibilityStatus,
      computation: params.computation,
      evidenceMap: params.evidenceMap,
      retirementImpactScore: ctx.retirementImpactScore || 0,
      branch: ctx.branch,
      installation: ctx.installation
    })
    void emitCrscAnalyticsEvent(event, ctx.transport || undefined)
  }
  return decision
}

export function buildAppealStrategyWithAnalytics(
  params: Parameters<typeof buildAppealStrategy>[0],
  ctx?: CrscAnalyticsContext
) {
  const appeal = buildAppealStrategy(params)
  if (ctx && ctx.cohortId && params.computation && params.evidenceMap) {
    const event = buildCrscAnalyticsEvent({
      cohortId: ctx.cohortId,
      eligibilityStatus: ctx.eligibilityStatus,
      computation: params.computation,
      evidenceMap: params.evidenceMap,
      retirementImpactScore: ctx.retirementImpactScore || 0,
      branch: ctx.branch,
      installation: ctx.installation
    })
    void emitCrscAnalyticsEvent(event, ctx.transport || undefined)
  }
  return appeal
}

export function getEnterpriseDashboardSnapshot(filters?: { cohortIds?: string[]; branch?: string; installation?: string; from?: string; to?: string }): CrscEnterpriseDashboardView {
  return aggregateCrscEvents(getLocalCrscEvents(), filters)
}
