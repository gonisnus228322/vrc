'use client';

import { upload } from '@vercel/blob/client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      if (data.files) setFiles(data.files);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    setUploading(true);
    try {
      await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      await fetchFiles();
    } catch (err) {
      alert('Upload failed: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main>
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#f0f6fc' }}>
          Dark File Hub
        </h1>
        <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Upload files up to 1 GB. All uploads auto-delete after 30 hours.
        </p>

        <div className="upload-area">
          <input
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            style={{ color: '#c9d1d9' }}
          />
          {uploading && <p style={{ marginTop: '0.5rem', color: '#58a6ff' }}>Uploading file...</p>}
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#f0f6fc' }}>
          Uploaded Files
        </h2>

        {loading ? (
          <p style={{ color: '#8b949e' }}>Loading files...</p>
        ) : files.length === 0 ? (
          <p style={{ color: '#8b949e' }}>No files active right now.</p>
        ) : (
          files.map((file, idx) => (
            <div key={idx} className="file-item">
              <div>
                <p style={{ color: '#f0f6fc', fontWeight: 500 }}>{file.pathname}</p>
                <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>
                  {file.size} • Expires in {file.hoursLeft}h
                </span>
              </div>
              <a href={file.url} download className="btn">
                Download
              </a>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
