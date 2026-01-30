import React from 'react'
import { ComplianceIndicators } from '../../../services/crsc/CrscComplianceService'

interface Props {
  indicators: ComplianceIndicators
}

export const CrscComplianceIndicatorsPanel: React.FC<Props> = ({ indicators }) => {
  return (
    <div className="p-4 bg-white rounded shadow space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Compliance Indicators</h3>
      <div className="grid grid-cols-3 gap-3">
        <Indicator label="PII Exposures" value={indicators.piiExposureFindings} desired={0} />
        <Indicator label="Raw Document Leakage" value={indicators.rawDocumentLeakage} desired={0} />
        <div className="p-3 border rounded">
          <p className="text-xs text-gray-500">Version Drift</p>
          {indicators.versionDrift.length === 0 ? (
            <p className="text-sm text-green-700 font-semibold">None</p>
          ) : (
            <ul className="text-sm text-red-700 list-disc pl-4">
              {indicators.versionDrift.map(item => (
                <li key={`${item.module}-${item.version}`}>{item.module} @ v{item.version}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

const Indicator = ({ label, value, desired }: { label: string; value: number; desired: number }) => {
  const healthy = value <= desired
  return (
    <div className={`p-3 border rounded ${healthy ? 'bg-green-50' : 'bg-red-50'}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${healthy ? 'text-green-700' : 'text-red-700'}`}>{value}</p>
    </div>
  )
}
