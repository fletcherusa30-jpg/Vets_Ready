import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './BackgroundSelector.module.css';
import { profileAPI } from '../../services/api';
import type {
  BackgroundInventoryResponse,
  BackgroundOption,
  BackgroundSelectionRequest,
} from '../../types/models';

interface BackgroundSelectorProps {
  veteranId?: string | null;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ veteranId }) => {
  const [inventory, setInventory] = useState<BackgroundInventoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadInventory = useCallback(async () => {
    if (!veteranId) {
      setInventory(null);
      return;
    }
    setLoading(true);
    setError(null);
    setStatusMessage(null);
    try {
      const data = await profileAPI.getBackgrounds(veteranId);
      setInventory(data);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Unable to load backgrounds';
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, [veteranId]);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const handleSelect = async (option: BackgroundOption) => {
    if (!veteranId) {
      return;
    }
    setSelecting(true);
    setStatusMessage(null);
    const payload: BackgroundSelectionRequest = {
      veteran_id: veteranId,
      selected_path: option.path,
    };

    try {
      await profileAPI.selectBackground(payload);
      setStatusMessage('Background updated successfully.');
      await loadInventory();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Unable to update background';
      setError(detail);
    } finally {
      setSelecting(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!veteranId) {
      return;
    }
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setUploading(true);
    setStatusMessage(null);
    try {
      await profileAPI.uploadBackground(veteranId, file);
      setStatusMessage('Upload complete. Select the new background to apply it.');
      await loadInventory();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Upload failed';
      setError(detail);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const previewUrl = useMemo(() => inventory?.current_background_url || '', [inventory]);
  const currentLabel = useMemo(() => {
    if (!inventory?.current_background) {
      return 'No background selected yet';
    }
    const match = [...(inventory.branch_backgrounds || []), ...(inventory.custom_backgrounds || [])].find(
      (option) => option.path === inventory.current_background
    );
    return match?.label || inventory.current_background;
  }, [inventory]);

  if (!veteranId) {
    return (
      <div className={styles.selector}>
        <div className={styles.notice}>
          Provide a veteran profile to enable background personalization.
        </div>
      </div>
    );
  }

  return (
    <section className={styles.selector}>
      <header className={styles.summary}>
        <div>
          <p className={styles.label}>Service Branch</p>
          <p className={styles.value}>{inventory?.service_branch || 'Loading...'}</p>
        </div>
        <div>
          <p className={styles.label}>Current Background</p>
          <p className={styles.value}>{currentLabel}</p>
        </div>
        <div>
          <p className={styles.label}>Status</p>
          <p className={styles.value}>{loading ? 'Refreshing…' : selecting ? 'Applying…' : 'Ready'}</p>
        </div>
      </header>

      {error && <div className={styles.error}>{error}</div>}
      {statusMessage && <div className={styles.status}>{statusMessage}</div>}

      <div className={styles.preview}>
        {previewUrl ? (
          <div className={styles.previewImage} style={{ backgroundImage: `url(${previewUrl})` }} aria-label="Selected background preview" />
        ) : (
          <div className={styles.previewPlaceholder}>Pick a background to preview it here.</div>
        )}
      </div>

      <div className={styles.sectionHeader}>
        <div>
          <h3>Branch Backgrounds</h3>
          <p>Curated imagery that aligns with your branch.</p>
        </div>
      </div>

      <div className={styles.grid}>
        {(inventory?.branch_backgrounds || []).map((option) => {
          const isSelected = inventory?.current_background === option.path;
          return (
            <button
              key={option.path}
              type="button"
              className={classNames(styles.card, { [styles.cardSelected]: isSelected })}
              onClick={() => handleSelect(option)}
              disabled={selecting || loading}
              aria-pressed={isSelected}
              style={{ backgroundImage: `url(${option.preview_url})` }}
            >
              <span className={styles.cardLabel}>{option.label}</span>
            </button>
          );
        })}
        {!inventory?.branch_backgrounds?.length && !loading && (
          <div className={styles.emptyState}>No branch imagery available yet.</div>
        )}
      </div>

      <div className={styles.sectionHeader}>
        <div>
          <h3>Custom Uploads</h3>
          <p>Upload meaningful imagery—unit patches, hometown skylines, or mission photos.</p>
        </div>
        <label className={styles.uploadButton}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleUpload}
            disabled={uploading}
          />
          {uploading ? 'Uploading…' : 'Upload Image'}
        </label>
      </div>

      <div className={styles.grid}>
        {(inventory?.custom_backgrounds || []).map((option) => {
          const isSelected = inventory?.current_background === option.path;
          return (
            <button
              key={option.path}
              type="button"
              className={classNames(styles.card, { [styles.cardSelected]: isSelected })}
              onClick={() => handleSelect(option)}
              disabled={selecting || loading}
              aria-pressed={isSelected}
              style={{ backgroundImage: `url(${option.preview_url})` }}
            >
              <span className={styles.cardLabel}>{option.label}</span>
            </button>
          );
        })}
        {!inventory?.custom_backgrounds?.length && !loading && (
          <div className={styles.emptyState}>No uploads yet. Add your first background above.</div>
        )}
      </div>
    </section>
  );
};

export default BackgroundSelector;
