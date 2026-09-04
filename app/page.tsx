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
    <main className="min-h-screen bg-[#090a0f] text-zinc-200 p-4 sm:p-8 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Upload Card */}
        <div className="bg-[#111318] border border-zinc-800/80 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
            <h1 className="text-xl font-bold text-white tracking-wide">Quick Vault</h1>
          </div>
          <p className="text-xs text-zinc-400 mb-6">
            Temporary file sharing. Files automatically clear after 30 hours.
          </p>

          <form onSubmit={handleUpload} className="space-y-4">
            <label className="border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center bg-[#0d0e12] group">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="bg-zinc-800 group-hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-lg text-xs font-semibold border border-zinc-700 transition-colors mb-2">
                Choose File
              </span>
              <span className="text-xs text-zinc-400 truncate max-w-[280px]">
                {file ? file.name : 'Click to select a file from your device'}
              </span>
            </label>

            {file && (
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-950/50"
              >
                {uploading ? 'Uploading file...' : 'Upload File to Vault'}
              </button>
            )}
          </form>

          {error && <p className="mt-3 text-xs text-red-400 text-center">{error}</p>}
        </div>

        {/* Shared Files List */}
        <div className="bg-[#111318] border border-zinc-800/80 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Shared Files</h2>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </span>
          </div>

          {files.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 border border-zinc-800/50 rounded-xl bg-[#0d0e12]">
              No files currently uploaded.
            </div>
          ) : (
            <ul className="space-y-2">
              {files.map((f) => (
                <li
                  key={f.url}
                  className="p-3 bg-[#0d0e12] border border-zinc-800/60 rounded-xl flex items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-200 truncate">{f.pathname}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{formatSize(f.size)}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={f.downloadUrl || f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-lg border border-cyan-500/30 transition-colors"
                    >
                      Download
                    </a>

                    <button
                      onClick={() => handleDelete(f.url)}
                      disabled={deletingUrl === f.url}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg border border-red-500/30 transition-colors disabled:opacity-50"
                    >
                      {deletingUrl === f.url ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </main>
  );
}
