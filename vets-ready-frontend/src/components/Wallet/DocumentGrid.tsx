import React from 'react';
import type { Document } from '../../MatrixEngine/wallet/documentTagger';

interface DocumentGridProps {
  documents: Document[];
  onDocumentClick: (document: Document) => void;
  selectedDocuments?: string[]; // For packet builder
  onDocumentSelect?: (documentId: string) => void;
}

export function DocumentGrid({
  documents,
  onDocumentClick,
  selectedDocuments = [],
  onDocumentSelect,
}: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        color: '#6B7280',
        backgroundColor: '#F9FAFB',
        borderRadius: '8px',
        border: '2px dashed #D1D5DB',
      }}>
        <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
          📁 No Documents Yet
        </p>
        <p style={{ fontSize: '0.875rem' }}>
          Upload your DD214, rating decisions, and other documents to get started
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.5rem',
    }}>
      {documents.map(doc => {
        const isSelected = selectedDocuments.includes(doc.id);

        return (
          <div
            key={doc.id}
            onClick={() => onDocumentClick(doc)}
            style={{
              backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
              border: isSelected ? '2px solid #3B82F6' : '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: isSelected
                ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)'
                : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            {/* Header with icon and select checkbox */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '2rem' }}>
                {getDocumentIcon(doc.tags)}
              </div>
              {onDocumentSelect && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    onDocumentSelect(doc.id);
                  }}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  aria-label={`Select ${doc.filename}`}
                />
              )}
            </div>

            {/* Filename */}
            <div style={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#111827',
              marginBottom: '0.5rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {doc.filename}
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
              {doc.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.5rem',
                    backgroundColor: getTagColor(tag),
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
              {doc.tags.length > 3 && (
                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  +{doc.tags.length - 3}
                </span>
              )}
            </div>

            {/* Metadata */}
            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              <div>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</div>
              <div>{formatFileSize(doc.size)}</div>
            </div>

            {/* Auto-extracted data indicators */}
            {doc.autoExtractedData && (
              <div style={{
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #E5E7EB',
                fontSize: '0.75rem',
                color: '#059669',
              }}>
                ✓ Data extracted
                {doc.autoExtractedData.ratings && ` • ${doc.autoExtractedData.ratings.length} ratings`}
                {doc.autoExtractedData.conditions && ` • ${doc.autoExtractedData.conditions.length} conditions`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getDocumentIcon(tags: string[]): string {
  const tagString = tags.join(' ').toLowerCase();

  if (tagString.includes('dd214')) return '📋';
  if (tagString.includes('rating')) return '⭐';
  if (tagString.includes('medical')) return '🏥';
  if (tagString.includes('lay statement') || tagString.includes('buddy statement')) return '✍️';
  if (tagString.includes('award')) return '🏆';
  if (tagString.includes('deployment') || tagString.includes('order')) return '🌍';
  if (tagString.includes('claim') || tagString.includes('appeal')) return '📄';

  return '📁';
}

function getTagColor(tag: string): string {
  const lowerTag = tag.toLowerCase();

  if (lowerTag.includes('dd214') || lowerTag.includes('discharge')) return '#2563EB';
  if (lowerTag.includes('rating') || lowerTag.includes('decision')) return '#16A34A';
  if (lowerTag.includes('medical') || lowerTag.includes('evidence')) return '#DC2626';
  if (lowerTag.includes('lay') || lowerTag.includes('buddy')) return '#7C3AED';
  if (lowerTag.includes('claim')) return '#EA580C';
  if (lowerTag.includes('appeal')) return '#DC2626';
  if (lowerTag.includes('award')) return '#CA8A04';

  return '#6B7280';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
