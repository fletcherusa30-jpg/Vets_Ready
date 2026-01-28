import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const Evidence: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      // Simulate analysis (backend needed for real AI analysis)
      setAnalysis(`
        Document Analysis Results:

        File: ${selectedFile.name}
        Type: Medical Record

        Key Findings:
        • Service connection established
        • Medical evidence supports claim
        • Recommend additional nexus letter
        • Estimated rating: 30-50%

        Next Steps:
        1. Obtain buddy statement
        2. Request additional treatment records
        3. Schedule C&P exam
      `);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          ← Back to Home
        </Link>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Evidence Analysis
      </h2>

      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.jpg,.png"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer"
          >
            <div className="text-gray-600">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, JPG, PNG up to 10MB
              </p>
            </div>
          </label>

          {selectedFile && (
            <p className="mt-4 text-sm text-blue-600">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!selectedFile}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Analyze Document
        </button>

        {analysis && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4 text-blue-900">Analysis Results</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {analysis}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
