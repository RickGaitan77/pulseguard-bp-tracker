import React, { useState } from 'react';
import { X, Download, Upload, Copy, Check, Database, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { BPReading } from '../types';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  readings: BPReading[];
  onRestoreReadings: (newReadings: BPReading[]) => void;
  onResetToSample: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  readings,
  onRestoreReadings,
  onResetToSample,
}) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(readings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulseguard-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) {
          throw new Error('Invalid JSON format: Expected an array of readings.');
        }

        // Basic verification
        for (const item of parsed) {
          if (
            typeof item.systolic !== 'number' ||
            typeof item.diastolic !== 'number' ||
            typeof item.pulse !== 'number'
          ) {
            throw new Error('Reading items must contain systolic, diastolic, and pulse numbers.');
          }
        }

        onRestoreReadings(parsed);
        setSuccessMsg(`Successfully restored ${parsed.length} readings!`);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handlePasteRestore = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!jsonText.trim()) {
      setErrorMsg('Please paste JSON data first.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText.trim());
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid JSON format: Must be an array of readings.');
      }

      onRestoreReadings(parsed);
      setSuccessMsg(`Successfully restored ${parsed.length} readings!`);
      setJsonText('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON syntax.');
    }
  };

  const handleCopyCurrentJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(readings, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Database Backup & Data Portability
              </h2>
              <p className="text-xs text-slate-400">
                100% offline local storage. Export or restore your logs anytime.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback messages */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON Block */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono-numeric">
              1. Export / Backup
            </h3>
            <p className="text-xs text-slate-400">
              Download your complete database of {readings.length} readings as a clean JSON file.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleDownloadJSON}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download JSON File
              </button>
              <button
                onClick={handleCopyCurrentJSON}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Raw JSON'}</span>
              </button>
            </div>
          </div>

          {/* Import JSON File Block */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono-numeric">
              2. Restore from File
            </h3>
            <p className="text-xs text-slate-400">
              Select a previously exported PulseGuard `.json` file to restore.
            </p>
            <div className="pt-1">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-900 hover:bg-slate-850 hover:border-cyan-500/50 transition">
                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                  <Upload className="w-6 h-6 mb-1 text-slate-400" />
                  <p className="text-xs text-slate-300 font-medium">Click to choose JSON file</p>
                </div>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Paste JSON Raw Text */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono-numeric">
            3. Paste Raw JSON Text
          </h3>
          <textarea
            rows={3}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Paste JSON array format: [ { systolic: 120, diastolic: 80, pulse: 72, timestamp: '...' }, ... ]"
            className="glass-input w-full p-3 rounded-xl text-xs font-mono-numeric text-slate-200 placeholder:text-slate-600 resize-none"
          />
          <button
            onClick={handlePasteRestore}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer"
          >
            Restore Pasted JSON
          </button>
        </div>

        {/* Reset / Demo seed helper */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <div className="text-slate-400">Want to reload sample test data?</div>
          <button
            onClick={() => {
              if (window.confirm('Reset database to preloaded 30-day realistic sample data?')) {
                onResetToSample();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
