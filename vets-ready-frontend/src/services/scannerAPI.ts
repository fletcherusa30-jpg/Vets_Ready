/**
 * SCANNER API SERVICE
 *
 * Connects frontend to backend scanner endpoints.
 * All scanners (STR, BOM, forensic, project) execute on the backend server.
 */

const API_BASE_URL = 'http://localhost:8000/api/scanners';

export interface ScannerJob {
  id: string;
  type: 'str' | 'bom' | 'forensic' | 'project';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  result?: any;
  error?: string;
}

export interface STRUploadResponse {
  job_id: string;
  filename: string;
  file_size: number;
  status: string;
  message: string;
}

export interface ScannerDiagnostic {
  scanner_type: string;
  current_directory: string;
  project_root: string;
  folders_checked: string[];
  folders_exist: Record<string, boolean>;
  files_found: number;
  errors: string[];
  warnings: string[];
}

/**
 * Upload STR file for processing
 */
export async function uploadSTRFile(
  file: File,
  volume?: string
): Promise<STRUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  if (volume) {
    formData.append('volume', volume);
  }

  const response = await fetch(`${API_BASE_URL}/str/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }

  return response.json();
}

/**
 * Get STR processing status
 */
export async function getSTRStatus(jobId: string): Promise<ScannerJob> {
  const response = await fetch(`${API_BASE_URL}/str/status/${jobId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get status');
  }

  return response.json();
}

/**
 * Get STR processing result
 */
export async function getSTRResult(jobId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/str/result/${jobId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get result');
  }

  return response.json();
}

/**
 * Poll STR status until completed or failed
 */
export async function pollSTRStatus(
  jobId: string,
  onProgress: (job: ScannerJob) => void,
  intervalMs: number = 2000,
  timeoutMs: number = 300000 // 5 minutes
): Promise<ScannerJob> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const job = await getSTRStatus(jobId);
        onProgress(job);

        if (job.status === 'completed') {
          resolve(job);
          return;
        }

        if (job.status === 'failed') {
          reject(new Error(job.error || 'Processing failed'));
          return;
        }

        if (Date.now() - startTime > timeoutMs) {
          reject(new Error('Processing timeout'));
          return;
        }

        setTimeout(poll, intervalMs);
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}

/**
 * Run BOM scanner
 */
export async function runBOMScanner(): Promise<{ job_id: string; status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/bom/scan`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'BOM scan failed');
  }

  return response.json();
}

/**
 * Run forensic/integrity scanner
 */
export async function runForensicScanner(): Promise<{ job_id: string; status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/forensic/scan`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Forensic scan failed');
  }

  return response.json();
}

/**
 * Run project health scanner
 */
export async function runProjectScanner(): Promise<{ job_id: string; status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/project/scan`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Project scan failed');
  }

  return response.json();
}

/**
 * Get any scanner job status
 */
export async function getScannerStatus(jobId: string): Promise<ScannerJob> {
  const response = await fetch(`${API_BASE_URL}/status/${jobId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get status');
  }

  return response.json();
}

/**
 * Run scanner diagnostics
 */
export async function runScannerDiagnostics(): Promise<ScannerDiagnostic> {
  const response = await fetch(`${API_BASE_URL}/diagnostics`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Diagnostics failed');
  }

  return response.json();
}

/**
 * Get scanner service health
 */
export async function getScannerHealth(): Promise<{
  status: string;
  service: string;
  timestamp: string;
  project_root: string;
  project_root_exists: boolean;
  active_jobs: number;
  total_jobs: number;
}> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Health check failed');
  }

  return response.json();
}

/**
 * List all scanner jobs
 */
export async function listScannerJobs(statusFilter?: string): Promise<{
  total: number;
  jobs: ScannerJob[];
}> {
  const url = statusFilter
    ? `${API_BASE_URL}/jobs?status_filter=${statusFilter}`
    : `${API_BASE_URL}/jobs`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to list jobs');
  }

  return response.json();
}
