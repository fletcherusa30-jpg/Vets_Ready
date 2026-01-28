import React from 'react'
import { CrscLineageRecord } from '../../../types/crscTypes'

interface Props {
  record: CrscLineageRecord | null
  onClose: () => void
}

export const CrscLineageDrilldownModal: React.FC<Props> = ({ record, onClose }) => {
  if (!record) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded shadow-lg p-4 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Lineage Chain</h3>
          <button className="text-gray-500" onClick={onClose}>×</button>
        </div>
        <div className="space-y-2 text-sm text-gray-800">
          <p><span className="font-semibold">Source:</span> {record.sourceModule}</p>
          <p><span className="font-semibold">Timestamp:</span> {record.timestamp}</p>
          <p><span className="font-semibold">Version:</span> {record.version}</p>
          <p><span className="font-semibold">Inputs (hashes):</span> {record.inputHashes.join(', ')}</p>
          <p><span className="font-semibold">Output Hash:</span> {record.outputHash}</p>
          <p><span className="font-semibold">Summary:</span> {record.transformationSummary}</p>
        </div>
        <div className="mt-4 text-right">
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
