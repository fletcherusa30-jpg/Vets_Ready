/**
 * UPLOAD-ONLY SCANNER PAGE
 *
 * Clean, minimal interface for veterans to upload service documents.
 * Scanner runs silently in background. No technical output displayed.
 * Automatically updates profile without user interaction.
 */

import React, { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Scanner.css';

interface UploadStatus {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message: string;
  fileName?: string;
  error?: string;
}

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    message: ''
  });
  const [isDragging, setIsDragging] = useState(false);

  const ACCEPTED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Validate file before upload
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported. Please upload PDF, DOCX, TXT, JPG, or PNG.'
      };
    }

    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: 'File size exceeds 10MB limit. Please upload a smaller file.'
      };
    }

    return { valid: true };
  };

  /**
   * Handle file upload to backend
   */
  const uploadFile = useCallback(async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadStatus({
        status: 'error',
        message: validation.error || 'Invalid file',
        fileName: file.name,
        error: validation.error
      });
      return;
    }

    setUploadStatus({
      status: 'uploading',
      message: 'Uploading document...',
      fileName: file.name
    });

    try {
      // Upload to backend - scanner runs silently
      const response = await api.scannerUpload(file);

      setUploadStatus({
        status: 'success',
        message: 'Document uploaded successfully. Processing in background.',
        fileName: file.name
      });

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setUploadStatus({
          status: 'idle',
          message: '',
          fileName: undefined
        });
      }, 5000);
    } catch (error: any) {
      setUploadStatus({
        status: 'error',
        message: 'Upload failed. Please try again.',
        fileName: file.name,
        error: error.message || 'Unknown error occurred'
      });
    }
  }, []);

  /**
   * Handle file selection from input
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
      // Reset input so same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  /**
   * Open file picker
   */
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="scanner-page">
      <header className="scanner-header">
        <h1>Upload Your Service Documents</h1>
        <p className="subtitle">
          Help us learn more about your military service. Your documents will be analyzed
          and your profile will be updated automatically.
        </p>
      </header>

      <main className="scanner-main">
        {/* Drop Zone */}
        <div
          ref={dropZoneRef}
          className={`drop-zone ${isDragging ? 'dragging' : ''} ${uploadStatus.status !== 'idle' ? 'processed' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="drop-zone-content">
            <div className="upload-icon">📄</div>
            <h2>Drag documents here or</h2>
            <button
              className="browse-button"
              onClick={handleBrowseClick}
              disabled={uploadStatus.status === 'uploading'}
            >
              Browse Files
            </button>
            <p className="file-types">
              Accepted: PDF, DOCX, TXT, JPG, PNG (max 10MB)
            </p>
          </div>
        </div>

        {/* Status Message */}
        {uploadStatus.message && (
          <div className={`status-message status-${uploadStatus.status}`}>
            <div className="status-content">
              {uploadStatus.status === 'uploading' && (
                <div className="spinner"></div>
              )}
              {uploadStatus.status === 'success' && (
                <div className="success-icon">✓</div>
              )}
              {uploadStatus.status === 'error' && (
                <div className="error-icon">!</div>
              )}
              <div className="status-text">
                <p className="status-message-text">{uploadStatus.message}</p>
                {uploadStatus.fileName && (
                  <p className="file-name">{uploadStatus.fileName}</p>
                )}
                {uploadStatus.error && (
                  <p className="error-detail">{uploadStatus.error}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {uploadStatus.status === 'success' && (
          <div className="action-buttons">
            <button
              className="button button-primary"
              onClick={() => navigate('/profile')}
            >
              Review Profile
            </button>
            <button
              className="button button-secondary"
              onClick={() => {
                setUploadStatus({ status: 'idle', message: '' });
                handleBrowseClick();
              }}
            >
              Upload Another Document
            </button>
          </div>
        )}
      </main>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={ACCEPTED_TYPES.join(',')}
        style={{ display: 'none' }}
        aria-label="Upload service document"
      />
    </div>
  );
};

export default Scanner;
