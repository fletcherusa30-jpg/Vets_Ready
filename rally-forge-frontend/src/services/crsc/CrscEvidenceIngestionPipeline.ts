import { CrscEvidenceRecord } from '../../types/crscTypes'
import { CrscMlClassification, classifyEvidenceDocument, mergeClassificationWithRecord } from './CrscMlClassifier'

export interface IngestionDocumentInput {
  documentId: string
  summary: string
  typeHint?: string
  source: 'STR_REVIEW' | 'DD214_PARSER' | 'DISABILITY_WIZARD' | 'DOCUMENT_VAULT' | 'VETERAN_UPLOAD' | string
  metadata?: Record<string, any>
}

export interface EvidenceConditionContext {
  id: string
  name: string
  keywords?: string[]
  mosCodes?: string[]
}

export interface EvidenceIngestionContext {
  conditions?: EvidenceConditionContext[]
  mosCode?: string
}

function classifyDocument(summary: string, typeHint?: string): string {
  if (typeHint) return typeHint
  const normalized = summary.toLowerCase()
  if (normalized.includes('dd214')) return 'DD214'
  if (normalized.includes('dd215')) return 'DD215'
  if (normalized.includes('line of duty') || normalized.includes('lod')) return 'LOD'
  if (normalized.includes('after action') || normalized.includes('aar')) return 'AAR'
  if (normalized.includes('award') || normalized.includes('purple heart')) return 'AWARD'
  if (normalized.includes('va decision')) return 'VA_DECISION'
  if (normalized.includes('service treatment') || normalized.includes('str')) return 'STR'
  return 'OTHER'
}

function extractStructuredData(summary: string, metadata?: Record<string, any>) {
  const dates = Array.from(summary.matchAll(/\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})\b/g)).map(m => m[0])
  const locations = (metadata?.locations as string[]) || []
  const awards = (metadata?.awards as string[]) || []
  const keywords = (metadata?.keywords as string[]) || []
  return {
    dates,
    locations,
    awards,
    keywords,
    source: metadata?.source || 'unspecified'
  }
}

function tagCombatIndicators(summary: string): string[] {
  const normalized = summary.toLowerCase()
  const tags: string[] = []
  if (normalized.includes('armed conflict') || normalized.includes('combat')) tags.push('armed_conflict')
  if (normalized.includes('hazardous') || normalized.includes('danger pay')) tags.push('hazardous_service')
  if (normalized.includes('training exercise') || normalized.includes('simulation')) tags.push('simulated_war')
  if (normalized.includes('equipment') || normalized.includes('vehicle') || normalized.includes('weapon')) tags.push('instrumentality_of_war')
  if (normalized.includes('purple heart')) tags.push('purple_heart')
  return Array.from(new Set(tags))
}

function mapConditions(summary: string, ctx?: EvidenceIngestionContext): string[] {
  if (!ctx?.conditions?.length) return []
  const normalized = summary.toLowerCase()
  return ctx.conditions
    .filter(cond => {
      const keywordHit = (cond.keywords || []).some(k => normalized.includes(k.toLowerCase()))
      const mosHit = ctx.mosCode && (cond.mosCodes || []).includes(ctx.mosCode)
      return keywordHit || mosHit
    })
    .map(cond => cond.id)
}

function scoreConfidence(record: { combatTags: string[]; extractedData: Record<string, any>; linkedConditions: string[] }): 'LOW' | 'MEDIUM' | 'HIGH' {
  const signals = [
    record.combatTags.length > 0,
    (record.extractedData.dates || []).length > 0,
    record.linkedConditions.length > 0
  ].filter(Boolean).length
  if (signals >= 3) return 'HIGH'
  if (signals === 2) return 'MEDIUM'
  return 'LOW'
}

export function ingestCrscEvidence(
  doc: IngestionDocumentInput,
  ctx?: EvidenceIngestionContext,
  options?: { enableMl?: boolean; text?: string; conditions?: EvidenceConditionContext[] }
): CrscEvidenceRecord {
  const type = classifyDocument(doc.summary, doc.typeHint)
  const extractedData = extractStructuredData(doc.summary, doc.metadata)
  const combatTags = tagCombatIndicators(doc.summary)
  const linkedConditions = mapConditions(doc.summary, ctx)
  const confidence = scoreConfidence({ combatTags, extractedData, linkedConditions })

  let record: CrscEvidenceRecord = {
    documentId: doc.documentId,
    type,
    extractedData,
    combatTags,
    linkedConditions,
    confidence
  }

  if (options?.enableMl) {
    const cls: CrscMlClassification = classifyEvidenceDocument(
      { documentId: doc.documentId, text: options.text || doc.summary, metadata: doc.metadata },
      options.conditions
    )
    record = mergeClassificationWithRecord(record, cls)
  }

  return record
}
