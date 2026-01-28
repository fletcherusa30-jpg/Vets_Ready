import React from 'react'
import { SystemHealthMetrics } from '../../../services/crsc/CrscComplianceService'

interface Props {
  metrics: SystemHealthMetrics
}

export const CrscSystemHealthPanel: React.FC<Props> = ({ metrics }) => {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold text-gray-900">System Health & Activity</h3>
      <div className="grid grid-cols-3 gap-3 mt-3">
        <Metric label="Ops (24h)" value={metrics.operationsDaily} />
        <Metric label="Ops (7d)" value={metrics.operationsWeekly} />
        <Metric label="Ops (30d)" value={metrics.operationsMonthly} />
      </div>
      <div className="mt-3">
        <p className="text-sm text-gray-700 font-semibold">Active Modules</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {metrics.activeModules.map(mod => (
            <span key={mod} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
              {mod}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-700">Error rate: {Math.round((metrics.errorRate || 0) * 100)}%</div>
    </div>
  )
}

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="p-3 border rounded">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-xl font-bold text-gray-900">{value}</p>
  </div>
)
