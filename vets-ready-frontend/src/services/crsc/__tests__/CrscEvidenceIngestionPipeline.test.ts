import { describe, it, expect } from 'vitest'
import { ingestCrscEvidence } from '../CrscEvidenceIngestionPipeline'

describe('CrscEvidenceIngestionPipeline', () => {
  it('ingests evidence and applies ML suggestions without overwriting human data', () => {
    const record = ingestCrscEvidence(
      {
        documentId: 'doc-1',
        summary: 'Purple Heart award for combat injury on 2020-01-01',
        source: 'VETERAN_UPLOAD'
      },
      {
        conditions: [{ id: 'cond-1', name: 'TBI', keywords: ['injury', 'blast'] }]
      },
      { enableMl: true, text: 'Purple Heart award for combat injury and blast', conditions: [{ id: 'cond-1', name: 'TBI', keywords: ['injury', 'blast'] }] }
    )

    expect(record.documentId).toBe('doc-1')
    expect(record.combatTags).toContain('purple_heart')
    expect(record.linkedConditions).toContain('cond-1')
    expect(record.type).toBe('AWARD')
    expect(record.confidence).toBeDefined()
  })
})
