import React from 'react'
import { AuditSummary } from '../../../services/crsc/CrscComplianceService'

interface Props {
  summary: AuditSummary
}

export const CrscAuditSummaryPanel: React.FC<Props> = ({ summary }) => {
  return (
    <div className="p-4 bg-white rounded shadow space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Audit Trail Overview</h3>
      <div>
        <p className="text-sm text-gray-700 font-semibold">Actions by Module</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {Object.entries(summary.actionsByModule).map(([module, count]) => (
            <span key={module} className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-100">
              {module}: {count}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-700 font-semibold">Actions by Type</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {Object.entries(summary.actionsByType).map(([action, count]) => (
            <span key={action} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-100">
              {action}: {count}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-700 font-semibold">Recent Events</p>
        <div className="space-y-2 mt-2">
          {summary.recent.map((item, idx) => (
            <div key={`${item.module}-${idx}`} className="p-2 border rounded text-sm">
              <p className="font-semibold text-gray-900">{item.module}</p>
              <p className="text-gray-500 text-xs">{item.action} • {item.actorType} • {item.timestamp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
