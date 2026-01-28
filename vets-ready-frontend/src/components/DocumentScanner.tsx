import React, { useState, useRef } from 'react'
import Tesseract from 'tesseract.js'

interface ParsedFields {
  branch?: string
  entryDate?: string
  separationDate?: string
  rank?: string
  characterOfService?: string
  [key: string]: string | undefined
}

interface DocumentScannerProps {
  onUploadComplete?: (documentId: string) => void
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [parsedFields, setParsedFields] = useState<ParsedFields>({})
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or image file (JPEG, PNG, or TIFF)')
      return
    }

    // Validate file size (max 10MB for MVP)
    const maxSize = 10 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
    setError(null)
    setUploadSuccess(false)

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }

    // Start OCR processing
    await performOCR(selectedFile)
  }

  const performOCR = async (file: File) => {
    setIsProcessing(true)
    setOcrProgress(0)
    setError(null)

    try {
      // For PDF files, we need to convert to image first
      // PRODUCTION TODO: Use pdf.js to convert PDF pages to images for OCR
      // For MVP, PDFs require manual field entry since client-side PDF OCR
      // would require additional libraries (pdf.js + canvas rendering)
      if (file.type === 'application/pdf') {
        // In a full implementation, use pdf.js to convert PDF to images
        // For MVP, we'll skip OCR on PDFs and let user enter fields manually
        setOcrProgress(100)
        setParsedFields({})
        setShowReviewForm(true)
        setIsProcessing(false)
        return
      }

      // Perform OCR on image
      const result = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100))
            }
          }
        }
      )

      const text = result.data.text

      // Parse fields from OCR text
      const fields = extractFieldsFromText(text)
      setParsedFields(fields)
      setShowReviewForm(true)
      setIsProcessing(false)
    } catch (err) {
      console.error('OCR error:', err)
      setError('Failed to process document. Please try again or enter fields manually.')
      setIsProcessing(false)
      setShowReviewForm(true)
      setParsedFields({})
    }
  }

  const extractFieldsFromText = (text: string): ParsedFields => {
    const fields: ParsedFields = {}

    // Simple pattern matching for common DD-214 fields
    // This is a basic implementation - production would use more sophisticated parsing
    
    // Branch of service
    const branches = ['Army', 'Navy', 'Air Force', 'Marine Corps', 'Coast Guard', 'Space Force']
    for (const branch of branches) {
      if (text.includes(branch)) {
        fields.branch = branch
        break
      }
    }

    // Dates (MM/DD/YYYY format)
    const datePattern = /\d{2}\/\d{2}\/\d{4}/g
    const dates = text.match(datePattern)
    if (dates && dates.length >= 2) {
      fields.entryDate = dates[0]
      fields.separationDate = dates[dates.length - 1]
    }

    // Rank patterns
    const rankPatterns = [
      'Private', 'Specialist', 'Corporal', 'Sergeant', 'Staff Sergeant',
      'Lieutenant', 'Captain', 'Major', 'Colonel', 'General',
      'Seaman', 'Petty Officer', 'Chief', 'Ensign', 'Admiral',
      'Airman', 'Senior Airman', 'Technical Sergeant', 'Master Sergeant'
    ]
    for (const rank of rankPatterns) {
      if (text.includes(rank)) {
        fields.rank = rank
        break
      }
    }

    // Character of service
    const characterPatterns = [
      { value: 'Honorable', pattern: /\b(honorable discharge|hon discharge)\b/i },
      { value: 'General (Under Honorable Conditions)', pattern: /\b(general under honorable|general discharge)\b/i },
      { value: 'Other Than Honorable', pattern: /\b(other than honorable|oth discharge)\b/i }
    ]
    
    for (const { value, pattern } of characterPatterns) {
      if (pattern.test(text)) {
        fields.characterOfService = value
        break
      }
    }

    return fields
  }

  const handleFieldChange = (field: string, value: string) => {
    setParsedFields(prev => ({ ...prev, [field]: value }))
  }

  const handleUpload = async () => {
    if (!file || !consent) {
      setError('Please select a file and agree to the consent.')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('document_type', 'dd214')
      formData.append('parsed_fields', JSON.stringify(parsedFields))
      formData.append('consent', consent.toString())

      // PRODUCTION TODO: Replace with actual API endpoint URL from config
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/documents/upload`, {
        method: 'POST',
        body: formData,
        // PRODUCTION TODO: Add authentication headers
        // headers: {
        //   'Authorization': `Bearer ${authToken}`
        // }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const data = await response.json()
      setUploadSuccess(true)
      setIsProcessing(false)

      if (onUploadComplete) {
        onUploadComplete(data.document_id)
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm()
      }, 2000)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setPreview(null)
    setParsedFields({})
    setShowReviewForm(false)
    setConsent(false)
    setUploadSuccess(false)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="document-scanner bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-purple-900">
        📄 DD-214 Document Scanner
      </h2>

      {/* File Upload Section */}
      {!showReviewForm && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.tiff"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={isProcessing}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-purple-900 hover:text-purple-700"
            >
              <div className="text-4xl mb-2">📁</div>
              <div className="text-lg font-semibold mb-1">
                Click to upload your DD-214
              </div>
              <div className="text-sm text-gray-600">
                Supports PDF, JPEG, PNG, TIFF (max 10MB)
              </div>
            </label>
          </div>

          {file && (
            <div className="bg-purple-50 rounded p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{file.name}</div>
                  <div className="text-sm text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="text-red-600 hover:text-red-800"
                  disabled={isProcessing}
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-700">
                Processing document... {ocrProgress}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review/Edit Form */}
      {showReviewForm && !uploadSuccess && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Review Required:</strong> Please review and correct any fields below before uploading.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Branch of Service</label>
              <input
                type="text"
                value={parsedFields.branch || ''}
                onChange={(e) => handleFieldChange('branch', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., Army, Navy, Air Force"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Entry Date</label>
              <input
                type="text"
                value={parsedFields.entryDate || ''}
                onChange={(e) => handleFieldChange('entryDate', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="MM/DD/YYYY"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Separation Date</label>
              <input
                type="text"
                value={parsedFields.separationDate || ''}
                onChange={(e) => handleFieldChange('separationDate', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="MM/DD/YYYY"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Rank</label>
              <input
                type="text"
                value={parsedFields.rank || ''}
                onChange={(e) => handleFieldChange('rank', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., Sergeant, Captain"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Character of Service</label>
              <input
                type="text"
                value={parsedFields.characterOfService || ''}
                onChange={(e) => handleFieldChange('characterOfService', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., Honorable"
              />
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="bg-purple-50 border border-purple-200 rounded p-4">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                <strong>Consent:</strong> I consent to securely upload and store this document. 
                I understand this is for educational and preparatory purposes only.
                {/* PRODUCTION TODO: Add link to privacy policy */}
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={isProcessing || !consent}
              className="flex-1 bg-purple-900 text-white px-6 py-3 rounded font-bold hover:bg-purple-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Uploading...' : 'Upload Document'}
            </button>
            <button
              onClick={resetForm}
              disabled={isProcessing}
              className="px-6 py-3 border border-gray-300 rounded font-bold hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-xl font-bold text-green-800 mb-2">
            Upload Successful!
          </div>
          <div className="text-sm text-green-700">
            Your DD-214 has been securely uploaded and processed.
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mt-4">
          <div className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}
    </div>
  )
}
