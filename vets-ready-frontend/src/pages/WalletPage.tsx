import React, { useState } from 'react';
import { AppLayout } from '../components/Layout/AppLayout';
import { ContentShell } from '../components/Layout/ContentShell';
import { DocumentGrid } from '../components/Wallet/DocumentGrid';
import type { Document } from '../MatrixEngine/wallet/documentTagger';
import { autoTagDocument } from '../MatrixEngine/wallet/documentTagger';

export function WalletPage() {
  const [documents, setDocuments] = useState<Document[]>([
    // Mock documents for demo
    {
      id: 'doc-1',
      filename: 'DD214_Smith_John.pdf',
      uploadDate: new Date('2024-01-15'),
      fileType: 'pdf',
      size: 245760,
      tags: ['DD214', 'Service Record', 'Discharge'],
      autoExtractedData: {
        dates: ['2015-06-01', '2023-05-31'],
        names: ['John Smith'],
      },
    },
    {
      id: 'doc-2',
      filename: 'Rating_Decision_2024.pdf',
      uploadDate: new Date('2024-03-20'),
      fileType: 'pdf',
      size: 512000,
      tags: ['Rating Decision', 'VA Decision', 'Benefits'],
      autoExtractedData: {
        ratings: ['50%', '30%', '10%'],
        conditions: ['tinnitus', 'knee', 'anxiety'],
      },
    },
    {
      id: 'doc-3',
      filename: 'Lay_Statement_Tinnitus.pdf',
      uploadDate: new Date('2024-02-10'),
      fileType: 'pdf',
      size: 128000,
      tags: ['Lay Statement', 'Evidence', 'Personal Statement'],
      autoExtractedData: {
        conditions: ['tinnitus'],
      },
    },
  ]);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredDocuments = filterType === 'all'
    ? documents
    : documents.filter(doc => doc.tags.some(tag => tag.toLowerCase().includes(filterType.toLowerCase())));

  return (
    <AppLayout showSidebar={false}>
      <ContentShell width="wide" padding="large">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '0.5rem',
          }}>
            🗂️ Digital Wallet
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6B7280' }}>
            Securely store and organize your VA documents
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          <StatsCard
            icon="📁"
            label="Total Documents"
            value={documents.length}
            color="#3B82F6"
          />
          <StatsCard
            icon="⭐"
            label="Rating Decisions"
            value={documents.filter(d => d.tags.includes('Rating Decision')).length}
            color="#16A34A"
          />
          <StatsCard
            icon="✍️"
            label="Evidence"
            value={documents.filter(d => d.tags.some(t => t.includes('Statement') || t.includes('Evidence'))).length}
            color="#7C3AED"
          />
          <StatsCard
            icon="📋"
            label="Service Records"
            value={documents.filter(d => d.tags.includes('DD214') || d.tags.includes('Service Record')).length}
            color="#2563EB"
          />
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}>
          <FilterButton
            label="All Documents"
            active={filterType === 'all'}
            onClick={() => setFilterType('all')}
          />
          <FilterButton
            label="DD214"
            active={filterType === 'dd214'}
            onClick={() => setFilterType('dd214')}
          />
          <FilterButton
            label="Rating Decisions"
            active={filterType === 'rating'}
            onClick={() => setFilterType('rating')}
          />
          <FilterButton
            label="Evidence"
            active={filterType === 'evidence'}
            onClick={() => setFilterType('evidence')}
          />
          <FilterButton
            label="Medical"
            active={filterType === 'medical'}
            onClick={() => setFilterType('medical')}
          />
        </div>

        {/* Document Grid */}
        <DocumentGrid
          documents={filteredDocuments}
          onDocumentClick={(doc) => setSelectedDocument(doc)}
        />

        {/* Upload Button (Fixed bottom-right) */}
        <button
          onClick={() => alert('Upload functionality coming soon! This will open a file picker.')}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: '#3B82F6',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '50%',
            width: '64px',
            height: '64px',
            fontSize: '2rem',
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
          }}
          aria-label="Upload document"
        >
          +
        </button>

        {/* Educational Disclaimer */}
        <div style={{
          marginTop: '3rem',
          padding: '1rem',
          backgroundColor: '#FEF3C7',
          border: '1px solid #FCD34D',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#92400E',
        }}>
          <strong>📚 Educational Tool:</strong> This Digital Wallet is for organizing your documents only.
          Always keep original copies of important documents. VetsReady does not store documents on servers
          (all data is local to your device for privacy).
        </div>
      </ContentShell>
    </AppLayout>
  );
}

function StatsCard({ icon, label, value, color }: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <div style={{
        fontSize: '2.5rem',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${color}15`,
        borderRadius: '8px',
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: color,
        }}>
          {value}
        </div>
        <div style={{
          fontSize: '0.875rem',
          color: '#6B7280',
          fontWeight: 500,
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function FilterButton({ label, active, onClick }: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: active ? '#3B82F6' : '#FFFFFF',
        color: active ? '#FFFFFF' : '#374151',
        border: active ? 'none' : '1px solid #D1D5DB',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = '#F3F4F6';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
        }
      }}
    >
      {label}
    </button>
  );
}
