// frontend/src/pages/Scanner.tsx
import React, { useRef, useState } from 'react';
import Page from '../components/layout/Page';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';

const Scanner = () => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const setScannerProgress = useAppStore((s) => s.setScannerProgress);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    setScannerProgress(0);
    try {
      const file = e.target.files[0];
      const res = await api.upload('/scanner/dd214', file);
      setResult(res);
      setScannerProgress(100);
    } catch (err) {
      setResult({ error: 'Upload failed' });
      setScannerProgress(0);
    }
    setUploading(false);
  };

  return (
    <Page title="Document Scanner">
      <input type="file" ref={fileInput} onChange={handleUpload} disabled={uploading} />
      {uploading && <p>Uploading...</p>}
      {result && (
        <pre style={{ marginTop: 16 }}>{JSON.stringify(result, null, 2)}</pre>
      )}
    </Page>
  );
};

export default Scanner;
