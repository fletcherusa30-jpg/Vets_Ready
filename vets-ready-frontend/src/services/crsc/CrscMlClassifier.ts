import { CrscEvidenceRecord } from '../../types/crscTypes'

export interface CrscMlClassification {
  documentId: string
  predictedType: string
  predictedCombatTags: string[]
  predictedConditions: string[]
  confidenceScores: {
    type: number
    combatTags: number
    conditions: number
  }
  explanation: string
  modelVersion: string
}

const KEYWORDS: Record<string, string[]> = {
  STR: ['service treatment', 'str', 'clinic', 'medical'],
  DD214: ['dd214', 'separation', 'discharge'],
  DD215: ['dd215'],
  LOD: ['line of duty', 'lod'],
  AAR: ['after action', 'aar'],
  AWARD: ['purple heart', 'award', 'medal'],
  VA_DECISION: ['va decision', 'rating decision']
}

const COMBAT_TAGS: Record<string, string[]> = {
  armed_conflict: ['combat', 'operation', 'iraq', 'afghanistan', 'engagement'],
  hazardous_service: ['hazardous', 'danger pay', 'flight', 'jump'],
  simulated_war: ['exercise', 'training', 'simulation'],
  instrumentality_of_war: ['vehicle', 'equipment', 'weapon', 'blast'],
  purple_heart: ['purple heart']
}

function scoreText(text: string, needles: string[]): number {
  const lower = text.toLowerCase()
  return needles.reduce((acc, n) => (lower.includes(n) ? acc + 1 : acc), 0)
}

export function classifyEvidenceDocument(
  doc: { documentId: string; text: string; metadata?: Record<string, any> },
  conditions?: { id: string; name: string; keywords?: string[]; mosCodes?: string[] }[]
): CrscMlClassification {
  const text = doc.text || ''
  const meta = doc.metadata || {}
  // Predict type
  let bestType = 'OTHER'
  let bestScore = -1
  Object.entries(KEYWORDS).forEach(([type, kws]) => {
    const score = scoreText(text, kws)
    if (score > bestScore) {
      bestType = type
      bestScore = score
    }
  })

  // Predict combat tags
  const predictedCombatTags: string[] = []
  Object.entries(COMBAT_TAGS).forEach(([tag, kws]) => {
    if (scoreText(text, kws) > 0) predictedCombatTags.push(tag)
  })

  // Predict conditions
  const predictedConditions: string[] = []
  if (conditions?.length) {
    conditions.forEach(cond => {
      const hits = scoreText(text, cond.keywords || [])
      if (hits > 0) {
        predictedConditions.push(cond.id)
      }
    })
  }

  const confidenceScores = {
    type: Math.min(1, Math.max(0.1, bestScore / 3)),
    combatTags: Math.min(1, Math.max(0.1, predictedCombatTags.length / 3)),
    conditions: Math.min(1, Math.max(0.1, predictedConditions.length / ((conditions?.length || 1))))
  }

  const explanationPieces = [
    `type:${bestType} score:${confidenceScores.type.toFixed(2)}`,
    `tags:${predictedCombatTags.join(',') || 'none'}`,
    `conditions:${predictedConditions.length}`
  ]

  return {
    documentId: doc.documentId,
    predictedType: bestType,
    predictedCombatTags,
    predictedConditions,
    confidenceScores,
    explanation: explanationPieces.join(' | '),
    modelVersion: 'crsc-ml-v0-heuristic'
  }
}

export function mergeClassificationWithRecord(record: CrscEvidenceRecord, cls: CrscMlClassification): CrscEvidenceRecord {
  const combinedTags = Array.from(new Set([...record.combatTags, ...cls.predictedCombatTags]))
  const combinedConditions = Array.from(new Set([...record.linkedConditions, ...cls.predictedConditions]))
  return {
    ...record,
    type: record.type || cls.predictedType,
    combatTags: combinedTags,
    linkedConditions: combinedConditions,
    confidence: record.confidence
  }
}
