/**
 * STR UPLOAD COMPONENT
 *
 * Allows veterans to upload their Service Treatment Records for automated analysis.
 * Can be embedded in multiple locations: Veteran Basics, Document Vault, Claims Assistant.
 *
 * IMPORTANT: This component now uses the BACKEND API to process STRs.
 * Files are uploaded to the server, not processed in the browser.
 */

import React, { useState, useRef } from 'react';
import { uploadSTRFile, pollSTRStatus, ScannerJob } from '../../services/scannerAPI';
import { DigitalTwin } from '../../MatrixEngine/types/DigitalTwin';
import { STRDocument } from '../../MatrixEngine/strIntelligenceEngine';

interface STRUploadProps {
  digitalTwin: DigitalTwin;
  onUploadComplete: (result: any) => void;
  location: 'veteran_basics' | 'document_vault' | 'claims_assistant' | 'evidence_builder';
  compact?: boolean;
}

export const STRUpload: React.FC<STRUploadProps> = ({
  digitalTwin,
  onUploadComplete,
  location,
  compact = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [volume, setVolume] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setProgress(0);
    setUploadStatus('Preparing upload...');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        setUploadStatus(`Uploading ${file.name}...`);

        // Upload to backend
        const uploadResponse = await uploadSTRFile(file, volume || undefined);

        setUploadStatus(`Processing ${file.name}...`);

        // Poll for completion
        await pollSTRStatus(
          uploadResponse.job_id,
          (job: ScannerJob) => {
            setProgress(job.progress);
            setUploadStatus(job.message);
          }
        );

        // Get final result
        const result = await fetch(`http://localhost:8000/api/scanners/str/result/${uploadResponse.job_id}`)
          .then(r => r.json());

        onUploadComplete(result);
        setUploadStatus(`✅ ${file.name} processed successfully!`);
      }
    } catch (error) {
      console.error('[STR Upload] Error:', error);
      setUploadStatus(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setVolume('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (compact) {
    return (
      <div className="bg-white border-2 border-blue-300 rounded-lg p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.tiff,.tif,.jpg,.jpeg,.png,.heic"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id={`str-upload-${location}`}
        />
        <label
          htmlFor={`str-upload-${location}`}
          className={`flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>{isUploading ? 'Uploading...' : 'Upload STRs'}</span>
        </label>
        {isUploading && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">{uploadStatus}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-400 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Service Treatment Records (STRs)
            </h3>
            <p className="text-gray-700 mb-2">
              Upload your complete STRs for automated claims intelligence
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
        >
          {showInfo ? 'Hide Info' : 'What are STRs?'}
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-gray-900 mb-2">📋 What are Service Treatment Records?</h4>
          <p className="text-gray-700 text-sm mb-3">
            STRs are your complete medical records from your time in service. They document every sick call,
            injury, physical exam, mental health visit, medication, and treatment you received.
          </p>

          <h4 className="font-bold text-gray-900 mb-2">💡 Why are they important?</h4>
          <ul className="space-y-1 text-sm text-gray-700 mb-3">
            <li>✓ Prove you had a condition <strong>during service</strong> (direct service connection)</li>
            <li>✓ Prove you had symptoms <strong>during service</strong> (establishes chronicity)</li>
            <li>✓ Prove an injury/event happened <strong>during service</strong> (establishes nexus)</li>
            <li>✓ Prove a pre-existing condition got <strong>worse during service</strong> (aggravation)</li>
          </ul>

          <h4 className="font-bold text-gray-900 mb-2">📥 How to get your STRs:</h4>
          <ul className="space-y-1 text-sm text-gray-700 mb-3">
            <li>• Request from National Archives (NARA) using <strong>SF-180 form</strong></li>
            <li>• Download from <strong>VA.gov</strong> (if already in your file)</li>
            <li>• Request from your <strong>service branch</strong></li>
            <li>• ⏱️ May take 6-12 months to receive</li>
          </ul>

          <h4 className="font-bold text-gray-900 mb-2">🤖 What VetsReady does with your STRs:</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>✓ Reads <strong>every page</strong> using advanced OCR</li>
            <li>✓ Extracts <strong>every medical entry</strong></li>
            <li>✓ Identifies <strong>conditions you can claim</strong></li>
            <li>✓ Finds <strong>evidence for existing claims</strong></li>
            <li>✓ Builds <strong>timelines</strong> of symptoms and treatment</li>
            <li>✓ Identifies <strong>secondary conditions</strong></li>
            <li>✓ Detects <strong>aggravation patterns</strong></li>
            <li>✓ Generates <strong>lay statement prompts</strong></li>
            <li>✓ Creates <strong>custom Mission Packs</strong></li>
          </ul>

          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>🔒 Privacy:</strong> Your STRs are encrypted and stored securely.
              We never share your medical records with anyone.
            </p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.tiff,.tif,.jpg,.jpeg,.png,.heic"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id={`str-upload-full-${location}`}
        />

        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>

          <label
            htmlFor={`str-upload-full-${location}`}
            className={`inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg cursor-pointer hover:bg-green-700 transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading STRs...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Choose Files to Upload</span>
              </>
            )}
          </label>

          <p className="text-sm text-gray-600 mt-3">
            Accepted formats: PDF, TIFF, JPG, PNG, HEIC
          </p>
          <p className="text-sm text-gray-600">
            You can upload multiple files at once (e.g., Volume 1, Volume 2, Disc 1)
          </p>
        </div>

        {/* Volume Label (Optional) */}
        <div className="mt-4 max-w-sm mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Volume/Disc Label (optional)
          </label>
          <input
            type="text"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            placeholder="e.g., Volume 1, Disc 2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Helps organize multiple STR uploads
          </p>
        </div>
      </div>

      {/* Benefits Callout */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 text-center border border-green-200">
          <div className="text-2xl font-bold text-green-600">Auto-Detect</div>
          <div className="text-sm text-gray-700">Conditions you can claim</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-green-200">
          <div className="text-2xl font-bold text-green-600">Build Evidence</div>
          <div className="text-sm text-gray-700">Timelines & statements</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-green-200">
          <div className="text-2xl font-bold text-green-600">Save Hours</div>
          <div className="text-sm text-gray-700">Automated analysis</div>
        </div>
      </div>
    </div>
  );
};

/**
 * STR Processing Status Component
 */
interface STRProcessingStatusProps {
  strDoc: STRDocument;
}

export const STRProcessingStatus: React.FC<STRProcessingStatusProps> = ({ strDoc }) => {
  const getStatusColor = () => {
    switch (strDoc.processingStatus) {
      case 'completed': return 'green';
      case 'processing': return 'blue';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const statusColor = getStatusColor();

  return (
    <div className={`bg-${statusColor}-50 border border-${statusColor}-200 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full bg-${statusColor}-500`} />
          <span className="font-semibold text-gray-900">{strDoc.fileName}</span>
        </div>
        <span className={`text-sm font-medium text-${statusColor}-700`}>
          {strDoc.processingStatus === 'completed' ? 'Complete' :
           strDoc.processingStatus === 'processing' ? `${strDoc.processingProgress}%` :
           strDoc.processingStatus === 'error' ? 'Error' : 'Pending'}
        </span>
      </div>

      {strDoc.processingStatus === 'processing' && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${strDoc.processingProgress}%` }}
          />
        </div>
      )}

      {strDoc.processingStatus === 'completed' && (
        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-gray-600">Pages</div>
            <div className="font-bold text-gray-900">{strDoc.pageCount}</div>
          </div>
          <div>
            <div className="text-gray-600">Entries</div>
            <div className="font-bold text-gray-900">{strDoc.extractedEntries.length}</div>
          </div>
          <div>
            <div className="text-gray-600">Claims Found</div>
            <div className="font-bold text-green-600">{strDoc.claimOpportunities.length}</div>
          </div>
        </div>
      )}

      {strDoc.processingStatus === 'error' && strDoc.errorMessage && (
        <p className="mt-2 text-sm text-red-700">{strDoc.errorMessage}</p>
      )}
    </div>
  );
};
