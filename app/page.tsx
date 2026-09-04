'use client';

import { upload } from '@vercel/blob/client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  // Fetch active files from Vercel Blob
  const fetchFiles = async () => {
    const res = await fetch('/api/cleanup');
    const data = await res.json();
    // Re-list active blobs by calling Vercel Blob SDK or an API route
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    setUploading(true);
    try {
      await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      alert('File uploaded! It will automatically expire in 30 hours.');
      window.location.reload();
    } catch (err) {
      alert('Upload failed: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Temporary File Hub</h1>
      <p>Files uploaded here self-destruct after 30 hours.</p>

      <div style={{ margin: '20px 0', padding: '20px', border: '2px dashed #ccc' }}>
        <input type="file" onChange={handleUpload} disabled={uploading} />
        {uploading && <p>Uploading... Please wait.</p>}
      </div>
    </main>
  );
}
