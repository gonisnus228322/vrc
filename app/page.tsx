'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

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
  const [files, setFiles] = useState<BlobFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files');
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
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }

      setFile(null);
      await fetchFiles();
    } catch (err) {
      const msg = (err as Error).message || 'Upload failed';
      setError(msg);
      alert(`Upload failed: ${msg}`);
    } finally {
      setUploading(false);
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
    <main className="min-h-screen bg-[#0b0c0e] text-zinc-200 p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Upload Card */}
        <div className="bg-[#121418] border border-zinc-800/80 rounded-xl p-6 shadow-2xl">
          <h1 className="text-xl font-bold text-white mb-1">Quick Vault</h1>
          <p className="text-xs text-zinc-400 mb-6">
            Temporary file sharing. Files automatically clear after 30 hours.
          </p>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border border-dashed border-zinc-700/60 hover:border-zinc-500 rounded-lg p-8 text-center transition-colors relative flex items-center justify-center bg-[#0e1013]">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center space-x-3 pointer-events-none">
                <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded text-xs font-medium border border-zinc-700">
                  Browse...
                </span>
                <span className="text-xs text-zinc-400 truncate max-w-[200px]">
                  {file ? file.name : 'No file chosen'}
                </span>
              </div>
            </div>

            {file && (
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 text-white text-xs font-semibold rounded transition-colors"
              >
                {uploading ? 'Uploading file...' : 'Upload File'}
              </button>
            )}
          </form>

          {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
        </div>

        {/* Shared Files List */}
        <div className="bg-[#121418] border border-zinc-800/80 rounded-xl p-6 shadow-2xl">
          <h2 className="text-base font-semibold text-white mb-4">Shared Files</h2>

          {files.length === 0 ? (
            <p className="text-xs text-zinc-500">No files currently uploaded.</p>
          ) : (
            <ul className="divide-y divide-zinc-800/50">
              {files.map((f) => (
                <li key={f.url} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-200 truncate">{f.pathname}</p>
                    <p className="text-[10px] text-zinc-500">{formatSize(f.size)}</p>
                  </div>
                  <a
                    href={f.downloadUrl || f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded border border-cyan-500/30 transition-colors shrink-0"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </main>
  );
}
