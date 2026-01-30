import React from 'react'
import { LineageSummary } from '../../../services/crsc/CrscComplianceService'

interface Props {
  summary: LineageSummary
  onDrilldown: (outputHash: string) => void
}

export const CrscLineageSummaryPanel: React.FC<Props> = ({ summary, onDrilldown }) => {
  return (
    <div className="p-4 bg-white rounded shadow space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Data Lineage Overview</h3>
      <div>
        <p className="text-sm text-gray-700 font-semibold">By Module</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {Object.entries(summary.countsByModule).map(([module, count]) => (
            <span key={module} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-100">
              {module}: {count}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-700 font-semibold">By Version</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {Object.entries(summary.countsByVersion).map(([version, count]) => (
            <span key={version} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded border border-purple-100">
              v{version}: {count}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-700 font-semibold">Recent Records</p>
        <div className="space-y-2 mt-2">
          {summary.recent.map(item => (
            <div key={item.outputHash} className="p-2 border rounded text-sm flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">{item.sourceModule}</p>
                <p className="text-gray-500 text-xs">{item.timestamp}</p>
              </div>
              <button
                className="text-blue-600 text-xs underline"
                onClick={() => onDrilldown(item.outputHash)}
              >
                View chain
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
