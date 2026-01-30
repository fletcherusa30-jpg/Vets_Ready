/**
 * Evidence Organizer Component
 * Allows veterans to upload, categorize, and organize evidence for their claims
 */

import React, { useState } from 'react';

export interface EvidenceDocument {
  id: string;
  name: string;
  type: 'medical' | 'service-records' | 'lay-statement' | 'nexus-opinion' | 'other';
  file: File;
  uploadedAt: string;
  ocrText?: string;
  aiSummary?: string;
  relatedConditionIds: string[];
  notes: string;
  tags: string[];
}

interface EvidenceOrganizerProps {
  onEvidenceUpdate?: (evidence: EvidenceDocument[]) => void;
}

export const EvidenceOrganizer: React.FC<EvidenceOrganizerProps> = ({
  onEvidenceUpdate,
}) => {
  const [evidence, setEvidence] = useState<EvidenceDocument[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<EvidenceDocument['type']>('medical');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    // Create evidence document
    const newEvidence: EvidenceDocument = {
      id: Date.now().toString(),
      name: selectedFile.name,
      type: selectedType,
      file: selectedFile,
      uploadedAt: new Date().toISOString(),
      relatedConditionIds: [],
      notes,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    // TODO: Implement OCR processing
    // For now, just add the document
    const updatedEvidence = [...evidence, newEvidence];
    setEvidence(updatedEvidence);

    if (onEvidenceUpdate) {
      onEvidenceUpdate(updatedEvidence);
    }

    // Reset form
    setSelectedFile(null);
    setNotes('');
    setTags('');
    setUploadModalOpen(false);
    setIsProcessing(false);
  };

  const handleDelete = (id: string) => {
    const updated = evidence.filter(e => e.id !== id);
    setEvidence(updated);
    if (onEvidenceUpdate) {
      onEvidenceUpdate(updated);
    }
  };

  const getTypeIcon = (type: EvidenceDocument['type']) => {
    switch (type) {
      case 'medical': return '🏥';
      case 'service-records': return '📋';
      case 'lay-statement': return '✍️';
      case 'nexus-opinion': return '⚖️';
      case 'other': return '📄';
    }
  };

  const getTypeLabel = (type: EvidenceDocument['type']) => {
    switch (type) {
      case 'medical': return 'Medical Records';
      case 'service-records': return 'Service Records';
      case 'lay-statement': return 'Lay Statement';
      case 'nexus-opinion': return 'Nexus Opinion';
      case 'other': return 'Other Document';
    }
  };

  const groupedEvidence = evidence.reduce((acc, doc) => {
    if (!acc[doc.type]) {
      acc[doc.type] = [];
    }
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<string, EvidenceDocument[]>);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Evidence Organizer</h1>
        <p className="text-blue-100">
          Upload and organize all evidence for your VA disability claim
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
        <h3 className="font-bold text-lg text-blue-900 mb-2">📚 How to Use</h3>
        <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
          <li>Upload medical records, service records, nexus opinions, and lay statements</li>
          <li>Categorize each document by type for easy organization</li>
          <li>Add notes and tags to help find documents later</li>
          <li>OCR (text extraction) will be performed automatically on images and PDFs</li>
          <li>Keep all evidence organized in one place for your claim</li>
        </ul>
      </div>

      {/* Upload Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Evidence ({evidence.length})</h2>
          <p className="text-gray-600">Organized by document type</p>
        </div>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Upload Evidence
        </button>
      </div>

      {/* Evidence Groups */}
      {Object.keys(groupedEvidence).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedEvidence).map(([type, docs]) => (
            <div key={type} className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>{getTypeIcon(type as EvidenceDocument['type'])}</span>
                {getTypeLabel(type as EvidenceDocument['type'])} ({docs.length})
              </h3>
              <div className="grid gap-4">
                {docs.map(doc => (
                  <EvidenceCard key={doc.id} document={doc} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Evidence Uploaded Yet</h3>
          <p className="text-gray-600 mb-6">
            Start organizing your claim evidence by uploading documents
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold"
          >
            Upload Your First Document
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Upload Evidence Document</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted: PDF, JPG, PNG, DOC, DOCX (max 10MB)
                </p>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as EvidenceDocument['type'])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="medical">🏥 Medical Records</option>
                  <option value="service-records">📋 Service Records</option>
                  <option value="lay-statement">✍️ Lay Statement</option>
                  <option value="nexus-opinion">⚖️ Nexus Opinion</option>
                  <option value="other">📄 Other Document</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="What is this document? What condition does it relate to?"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., PTSD, 2023, VA Hospital, Nexus"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-bold"
                >
                  {isProcessing ? 'Processing...' : 'Upload Document'}
                </button>
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Evidence Card Component
interface EvidenceCardProps {
  document: EvidenceDocument;
  onDelete: (id: string) => void;
}

const EvidenceCard: React.FC<EvidenceCardProps> = ({ document, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div
        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-1">{document.name}</h4>
            <p className="text-sm text-gray-600">
              Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
            </p>
            {document.tags.length > 0 && (
              <div className="flex gap-2 mt-2">
                {document.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(document.id);
              }}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              ✕
            </button>
            <div className="text-xl text-gray-400">
              {expanded ? '▼' : '▶'}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-white border-t border-gray-300">
          {document.notes && (
            <div className="mb-4">
              <h5 className="font-semibold text-gray-800 mb-1">Notes:</h5>
              <p className="text-gray-700 text-sm">{document.notes}</p>
            </div>
          )}

          {document.ocrText && (
            <div className="mb-4">
              <h5 className="font-semibold text-gray-800 mb-1">Extracted Text (OCR):</h5>
              <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm text-gray-700 max-h-40 overflow-y-auto">
                {document.ocrText}
              </div>
            </div>
          )}

          {document.aiSummary && (
            <div>
              <h5 className="font-semibold text-gray-800 mb-1">🤖 AI Summary:</h5>
              <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm text-gray-700">
                {document.aiSummary}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
