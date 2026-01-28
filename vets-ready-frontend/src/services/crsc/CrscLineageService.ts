import { CrscAuditEvent, CrscLineageRecord } from '../../types/crscTypes'

interface LineageFilters {
  module?: string
  from?: string
  to?: string
  version?: string
}

interface AuditFilters {
  module?: string
  action?: string
  from?: string
  to?: string
}

const lineageLog: CrscLineageRecord[] = []
const auditLog: CrscAuditEvent[] = []

type TransportFns = {
  lineage?: (record: CrscLineageRecord) => Promise<void>
  audit?: (record: CrscAuditEvent) => Promise<void>
}

let transportFns: TransportFns = {}

export function registerLineageTransports(fns: TransportFns) {
  transportFns = fns
}

export function replaceLineageLog(records: CrscLineageRecord[]) {
  lineageLog.splice(0, lineageLog.length, ...records)
}

export function replaceAuditLog(records: CrscAuditEvent[]) {
  auditLog.splice(0, auditLog.length, ...records)
}

async function hashObject(payload: any): Promise<string> {
  const serialized = JSON.stringify(payload || {})
  const cryptoObj: Crypto | undefined = typeof globalThis !== 'undefined' ? (globalThis as any).crypto : undefined
  if (!cryptoObj?.subtle) {
    let hash = 0
    for (let i = 0; i < serialized.length; i += 1) {
      hash = (hash << 5) - hash + serialized.charCodeAt(i)
      hash |= 0
    }
    return `fallback-${Math.abs(hash)}`
  }
  const data = new TextEncoder().encode(serialized)
  const digest = await cryptoObj.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function recordLineage(options: {
  sourceModule: string
  inputs: any[]
  output: any
  summary: string
  version: string
}): Promise<CrscLineageRecord> {
  const inputHashes = await Promise.all(options.inputs.map(hashObject))
  const outputHash = await hashObject(options.output)
  const record: CrscLineageRecord = Object.freeze({
    recordId: `lineage-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    sourceModule: options.sourceModule,
    inputHashes,
    outputHash,
    transformationSummary: options.summary,
    version: options.version
  })
  lineageLog.push(record)
  if (transportFns.lineage) {
    void transportFns.lineage(record)
  }
  return record
}

export async function recordAuditEvent(event: {
  actorType: 'VETERAN' | 'SYSTEM'
  action: string
  module: string
  metadata?: Record<string, any>
}): Promise<CrscAuditEvent> {
  const auditEvent: CrscAuditEvent = Object.freeze({
    eventId: `audit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    actorType: event.actorType,
    action: event.action,
    module: event.module,
    metadata: event.metadata || {}
  })
  auditLog.push(auditEvent)
  if (transportFns.audit) {
    void transportFns.audit(auditEvent)
  }
  return auditEvent
}

export function queryLineage(filters?: LineageFilters): CrscLineageRecord[] {
  return lineageLog.filter(entry => {
    if (filters?.module && entry.sourceModule !== filters.module) return false
    if (filters?.version && entry.version !== filters.version) return false
    if (filters?.from && new Date(entry.timestamp) < new Date(filters.from)) return false
    if (filters?.to && new Date(entry.timestamp) > new Date(filters.to)) return false
    return true
  })
}

export function queryAuditEvents(filters?: AuditFilters): CrscAuditEvent[] {
  return auditLog.filter(entry => {
    if (filters?.module && entry.module !== filters.module) return false
    if (filters?.action && entry.action !== filters.action) return false
    if (filters?.from && new Date(entry.timestamp) < new Date(filters.from)) return false
    if (filters?.to && new Date(entry.timestamp) > new Date(filters.to)) return false
    return true
  })
}
