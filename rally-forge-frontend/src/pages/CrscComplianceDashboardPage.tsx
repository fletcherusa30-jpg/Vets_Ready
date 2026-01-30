import React, { useEffect, useState } from 'react'
import { CrscSystemHealthPanel } from '../components/crsc/compliance/CrscSystemHealthPanel'
import { CrscLineageSummaryPanel } from '../components/crsc/compliance/CrscLineageSummaryPanel'
import { CrscAuditSummaryPanel } from '../components/crsc/compliance/CrscAuditSummaryPanel'
import { CrscComplianceIndicatorsPanel } from '../components/crsc/compliance/CrscComplianceIndicatorsPanel'
import { CrscLineageDrilldownModal } from '../components/crsc/compliance/CrscLineageDrilldownModal'
import {
  getSystemHealth,
  getLineageSummary,
  getAuditSummary,
  getComplianceIndicators
} from '../services/crsc/CrscComplianceService'
import { CrscLineageRecord } from '../types/crscTypes'
import { recordAuditEvent } from '../services/crsc/CrscLineageService'

const ALLOWED_ROLES = ['COMPLIANCE_ADMIN', 'SYSTEM_OWNER', 'SECURITY_ANALYST']

export const CrscComplianceDashboardPage: React.FC<{ role: string; authHeaders?: Record<string, string> }> = ({ role, authHeaders }) => {
  const [health, setHealth] = useState(getSystemHealth())
  const [lineageSummary, setLineageSummary] = useState(getLineageSummary())
  const [auditSummary, setAuditSummary] = useState(getAuditSummary())
  const [indicators, setIndicators] = useState(getComplianceIndicators())
  const [drillRecord, setDrillRecord] = useState<CrscLineageRecord | null>(null)

  useEffect(() => {
    if (!ALLOWED_ROLES.includes(role)) return
    if (authHeaders) {
      registerComplianceDataProvider(async () => {
        const resp = await fetch('/enterprise/crsc/audit', { headers: authHeaders })
        const audits = resp.ok ? await resp.json() : []
        return { audits }
      })
      void refreshComplianceDataFromBackend()
    }
    const refresh = () => {
      setHealth(getSystemHealth())
      setLineageSummary(getLineageSummary())
      setAuditSummary(getAuditSummary())
      setIndicators(getComplianceIndicators())
    }
    refresh()
    recordAuditEvent({ actorType: 'SYSTEM', action: 'VIEW_DASHBOARD', module: 'CRSC_COMPLIANCE', metadata: { role } })
  }, [role])

  if (!ALLOWED_ROLES.includes(role)) {
    return <div className="p-6 text-red-700">Access denied: insufficient role.</div>
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">CRSC Compliance & Audit Dashboard</h2>
      <p className="text-sm text-gray-600">PII-free view of CRSC lineage, audit, and compliance indicators.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CrscSystemHealthPanel metrics={health} />
        <CrscComplianceIndicatorsPanel indicators={indicators} />
        <CrscLineageSummaryPanel summary={lineageSummary} onDrilldown={hash => setDrillRecord(lineageSummary.recent.find(r => r.outputHash === hash) as any)} />
        <CrscAuditSummaryPanel summary={auditSummary} />
      </div>
      <CrscLineageDrilldownModal record={drillRecord} onClose={() => setDrillRecord(null)} />
    </div>
  )
}

export default CrscComplianceDashboardPage
