'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { upload } from '@vercel/blob/client';

interface BlobFile {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<BlobFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch files');
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error('Error loading files:', err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      setFile(null);
      await fetchFiles();
    } catch (err) {
      const msg = (err as Error).message || 'Upload failed';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (url: string) => {
    setDeletingUrl(url);
    try {
      const res = await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Delete failed');
      }

      await fetchFiles();
    } catch (err) {
      alert(`Delete failed: ${(err as Error).message}`);
    } finally {
      setDeletingUrl(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <main className="vault-container">
      {/* Upload Box */}
      <div className="vault-card">
        <div className="vault-header">
          <div className="title-group">
            <span className="status-dot" />
            <h1 className="vault-title">Quick Vault</h1>
          </div>
          <span className="badge">OLED Dark</span>
        </div>

        <p className="vault-subtitle">
          Temporary file vault. Direct storage with 30-hour retention.
        </p>

        <form onSubmit={handleUpload}>
          <label className="dropzone">
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="icon-wrapper">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <span className="file-name">
              {file ? file.name : 'Click to select or drop a file'}
            </span>
            <span className="file-hint">
              {file ? formatSize(file.size) : 'Supports files up to 5 GB'}
            </span>
          </label>

          {uploading && (
            <div className="loading-container">
              <span className="loading-text">Vaulting file to storage...</span>
              <div className="loading-bar">
                <div className="loading-progress" />
              </div>
            </div>
          )}

          {file && (
            <button type="submit" disabled={uploading} className="btn-upload">
              {uploading ? 'Uploading...' : 'Upload File to Vault'}
            </button>
          )}
        </form>

        {error && <p className="error-text">{error}</p>}
      </div>

      {/* Shared Files List */}
      <div className="vault-card">
        <div className="vault-header">
          <span className="vault-title" style={{ fontSize: '0.9rem' }}>Vault Contents</span>
          <span className="badge">{files.length} {files.length === 1 ? 'file' : 'files'}</span>
        </div>

        {files.length === 0 ? (
          <div className="empty-vault">Vault is currently empty.</div>
        ) : (
          <ul className="file-list">
            {files.map((f) => (
              <li key={f.url} className="file-item">
                <div className="file-info">
                  <div className="file-title">{f.pathname}</div>
                  <div className="file-size">{formatSize(f.size)}</div>
                </div>

                <div className="file-actions">
                  <a
                    href={f.downloadUrl || f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="btn-action btn-download"
                  >
                    Download
                  </a>

                  <button
                    onClick={() => handleDelete(f.url)}
                    disabled={deletingUrl === f.url}
                    className="btn-action btn-delete"
                  >
                    {deletingUrl === f.url ? '...' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
