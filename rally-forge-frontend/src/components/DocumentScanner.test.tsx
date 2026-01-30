/**
 * Tests for DocumentScanner component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DocumentScanner } from './DocumentScanner'

// Mock Tesseract.js
vi.mock('tesseract.js', () => ({
  default: {
    recognize: vi.fn(() => Promise.resolve({
      data: {
        text: 'Army 01/15/2010 05/30/2018 Sergeant Honorable'
      }
    }))
  }
}))

// Mock fetch
global.fetch = vi.fn()

describe('DocumentScanner', () => {
  it('renders the component with upload interface', () => {
    render(<DocumentScanner />)
    
    expect(screen.getByText(/DD-214 Document Scanner/i)).toBeInTheDocument()
    expect(screen.getByText(/Click to upload your DD-214/i)).toBeInTheDocument()
  })

  it('displays file info when file is selected', async () => {
    render(<DocumentScanner />)
    
    const file = new File(['test content'], 'test-dd214.pdf', { type: 'application/pdf' })
    const input = document.querySelector('#file-upload') as HTMLInputElement
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText('test-dd214.pdf')).toBeInTheDocument()
    })
  })

  it('shows error for invalid file type', async () => {
    render(<DocumentScanner />)
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const input = document.querySelector('#file-upload') as HTMLInputElement
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText(/Please upload a PDF or image file/i)).toBeInTheDocument()
    })
  })

  it('shows error for file too large', async () => {
    render(<DocumentScanner />)
    
    // Create a mock large file (11MB)
    const largeContent = new Array(11 * 1024 * 1024).fill('x').join('')
    const file = new File([largeContent], 'large-dd214.pdf', { type: 'application/pdf' })
    const input = document.querySelector('#file-upload') as HTMLInputElement
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText(/File size must be less than 10MB/i)).toBeInTheDocument()
    })
  })

  it('requires consent checkbox before upload', async () => {
    render(<DocumentScanner />)
    
    const file = new File(['test content'], 'test-dd214.pdf', { type: 'application/pdf' })
    const input = document.querySelector('#file-upload') as HTMLInputElement
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      const uploadButton = screen.getByText(/Upload Document/i)
      expect(uploadButton).toBeDisabled()
    })
  })

  it('enables upload button when consent is given', async () => {
    render(<DocumentScanner />)
    
    const file = new File(['test content'], 'test-dd214.pdf', { type: 'application/pdf' })
    const input = document.querySelector('#file-upload') as HTMLInputElement
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      const consentCheckbox = screen.getByRole('checkbox')
      fireEvent.click(consentCheckbox)
      
      const uploadButton = screen.getByText(/Upload Document/i)
      expect(uploadButton).not.toBeDisabled()
    })
  })

  it('allows editing of parsed fields', async () => {
    render(<DocumentScanner />)
    
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('#file-upload') as HTMLInputElement
    
    fireEvent.change(input, { target: { files: [file] } })
    
    // Wait for review form to appear
    await waitFor(() => {
      expect(screen.getByText(/Review Required/i)).toBeInTheDocument()
    })

    // Find and edit the branch field
    const branchInput = screen.getByPlaceholderText(/e.g., Army/i) as HTMLInputElement
    fireEvent.change(branchInput, { target: { value: 'Navy' } })
    
    expect(branchInput.value).toBe('Navy')
  })

  it('calls onUploadComplete callback on successful upload', async () => {
    const mockCallback = vi.fn()
    const mockResponse = {
      ok: true,
      json: async () => ({ success: true, document_id: 'test-id-123' })
    }
    
    ;(global.fetch as any).mockResolvedValueOnce(mockResponse)
    
    render(<DocumentScanner onUploadComplete={mockCallback} />)
    
    const file = new File(['test content'], 'test-dd214.pdf', { type: 'application/pdf' })
    const input = document.querySelector('#file-upload') as HTMLInputElement
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      const consentCheckbox = screen.getByRole('checkbox')
      fireEvent.click(consentCheckbox)
      
      const uploadButton = screen.getByText(/Upload Document/i)
      fireEvent.click(uploadButton)
    })
    
    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith('test-id-123')
    })
  })
})
