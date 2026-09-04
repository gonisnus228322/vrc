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
    <main className="min-h-screen bg-black text-zinc-100 p-4 sm:p-10 flex flex-col items-center justify-center font-sans antialiased">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Header / Upload Card */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_-12px_rgba(0,255,255,0.08)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">Quick Vault</h1>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400">
              OLED Dark
            </span>
          </div>

          <p className="text-xs text-zinc-400 mb-6">
            Temporary file vault. Direct CDN storage with 30-hour retention.
          </p>

          <form onSubmit={handleUpload} className="space-y-4">
            <label className="border-2 border-dashed border-zinc-800 hover:border-cyan-500/50 rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center bg-black group relative overflow-hidden">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-zinc-900 group-hover:bg-cyan-950/40 text-zinc-400 group-hover:text-cyan-400 flex items-center justify-center mb-3 transition-colors border border-zinc-800 group-hover:border-cyan-500/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors mb-1">
                {file ? file.name : 'Select or drop a file'}
              </span>
              <span className="text-[11px] text-zinc-500">
                {file ? formatSize(file.size) : 'Supports files up to 5 GB'}
              </span>
            </label>

            {file && (
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 active:scale-[0.99] disabled:bg-zinc-800 disabled:text-zinc-500 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)]"
              >
                {uploading ? 'Vaulting File...' : 'Upload File'}
              </button>
            )}
          </form>

          {error && <p className="mt-3 text-xs text-red-400 text-center font-mono">{error}</p>}
        </div>

        {/* Shared Files Section */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">Vault Contents</h2>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md font-mono">
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </span>
          </div>

          {files.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-600 border border-zinc-900 rounded-xl bg-black font-mono">
              Vault is currently empty.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {files.map((f) => (
                <li
                  key={f.url}
                  className="p-3.5 bg-black border border-zinc-800/80 rounded-xl flex items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-100 truncate">{f.pathname}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{formatSize(f.size)}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={f.downloadUrl || f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 text-xs font-semibold rounded-lg border border-zinc-800 hover:border-cyan-500/40 transition-all"
                    >
                      Download
                    </a>

                    <button
                      onClick={() => handleDelete(f.url)}
                      disabled={deletingUrl === f.url}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 text-xs font-semibold rounded-lg border border-zinc-800 hover:border-red-500/40 transition-all disabled:opacity-50"
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
