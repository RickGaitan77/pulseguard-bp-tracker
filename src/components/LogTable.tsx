import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit3,
  Calendar,
  Pill,
  Activity,
  Heart,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { BPReading, AHAStage } from '../types';
import { classifyAHA, exportToCSV } from '../utils/clinicalCalculations';

interface LogTableProps {
  readings: BPReading[];
  onEditReading: (reading: BPReading) => void;
  onDeleteReading: (id: string) => void;
  highlightedReadingId?: string | null;
}

export const LogTable: React.FC<LogTableProps> = ({
  readings,
  onEditReading,
  onDeleteReading,
  highlightedReadingId,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [medFilter, setMedFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter and sort readings (newest first for log view)
  const filteredReadings = useMemo(() => {
    return readings
      .filter((r) => {
        // Stage filter
        if (stageFilter !== 'all') {
          const classification = classifyAHA(r.systolic, r.diastolic);
          if (classification.stage !== stageFilter) return false;
        }

        // Med filter
        if (medFilter === 'taken' && !r.medTaken) return false;
        if (medFilter === 'missed' && r.medTaken) return false;

        // Search term
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchNotes = (r.notes || '').toLowerCase().includes(query);
          const matchMeds = (r.medNames || []).some((m) => m.toLowerCase().includes(query));
          const matchArm = r.arm.toLowerCase().includes(query);
          const matchPos = r.position.toLowerCase().includes(query);
          const matchNumbers = `${r.systolic}/${r.diastolic}`.includes(query);
          return matchNotes || matchMeds || matchArm || matchPos || matchNumbers;
        }

        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [readings, stageFilter, medFilter, searchTerm]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredReadings.length / pageSize) || 1;
  const paginatedReadings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReadings.slice(start, start + pageSize);
  }, [filteredReadings, currentPage, pageSize]);

  const handleExportFiltered = () => {
    const csv = exportToCSV(filteredReadings);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blood-pressure-filtered-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-5">
      {/* Header with Title and Search/Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Measurement History & Clinical Log
              <span className="px-2 py-0.5 text-xs font-mono-numeric font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 rounded-full">
                {filteredReadings.length} entries
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Complete chronological audit trail with context and medication tagging
            </p>
          </div>
        </div>

        {/* Action Controls & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportFiltered}
            title="Export filtered records as CSV"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900/90 hover:bg-slate-800 hover:text-cyan-300 border border-slate-700/70 rounded-xl transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export View ({filteredReadings.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Query */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes, meds (e.g. Lisinopril), posture..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="glass-input w-full pl-9 pr-4 py-2 rounded-xl text-xs text-slate-200 placeholder:text-slate-500"
          />
        </div>

        {/* Stage Filter */}
        <div className="sm:col-span-3">
          <select
            value={stageFilter}
            onChange={(e) => {
              setStageFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="glass-input w-full px-3 py-2 rounded-xl text-xs text-slate-200 bg-slate-950 cursor-pointer"
          >
            <option value="all">All AHA Stages</option>
            <option value="normal">Normal (&lt;120/80)</option>
            <option value="elevated">Elevated (120-129/&lt;80)</option>
            <option value="stage1">Stage 1 (130-139/80-89)</option>
            <option value="stage2">Stage 2 (≥140/90)</option>
            <option value="crisis">Hypertensive Crisis (&gt;180/120)</option>
            <option value="hypotension">Hypotension (&lt;90/60)</option>
          </select>
        </div>

        {/* Medication Taken Filter */}
        <div className="sm:col-span-3">
          <select
            value={medFilter}
            onChange={(e) => {
              setMedFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="glass-input w-full px-3 py-2 rounded-xl text-xs text-slate-200 bg-slate-950 cursor-pointer"
          >
            <option value="all">All Medication States</option>
            <option value="taken">Medication Taken (✓)</option>
            <option value="missed">Medication Missed (✗)</option>
          </select>
        </div>
      </div>

      {/* Delete Confirmation Modal Toast */}
      {deleteConfirmId && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Are you sure you want to permanently delete this reading?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDeleteReading(deleteConfirmId);
                setDeleteConfirmId(null);
              }}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.4)]"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Responsive Glass Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono-numeric uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 font-semibold">Date & Time</th>
              <th className="py-3 px-4 font-semibold">Systolic / Diastolic</th>
              <th className="py-3 px-4 font-semibold">Pulse</th>
              <th className="py-3 px-4 font-semibold">MAP & PP</th>
              <th className="py-3 px-4 font-semibold">AHA Stage</th>
              <th className="py-3 px-4 font-semibold">Medication</th>
              <th className="py-3 px-4 font-semibold">Context & Notes</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono-numeric">
            {paginatedReadings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No readings matched your search or filters.
                </td>
              </tr>
            ) : (
              paginatedReadings.map((r) => {
                const classification = classifyAHA(r.systolic, r.diastolic);
                const isHighlighted = highlightedReadingId === r.id;
                const d = new Date(r.timestamp);

                return (
                  <tr
                    key={r.id}
                    className={`transition-colors hover:bg-slate-800/40 ${
                      isHighlighted
                        ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                        : ''
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                      <div className="font-semibold text-slate-200">
                        {d.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* SYS / DIA */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-sm font-extrabold tracking-tight">
                        <span className="text-cyan-400">{r.systolic}</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-purple-400">{r.diastolic}</span>
                        <span className="text-[10px] text-slate-500 font-normal ml-1.5">mmHg</span>
                      </div>
                    </td>

                    {/* Pulse */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                      <div className="flex items-center gap-1 font-semibold text-amber-300">
                        <Heart className="w-3.5 h-3.5 text-amber-400" />
                        <span>{r.pulse}</span>
                        <span className="text-[10px] text-slate-500 font-normal">bpm</span>
                      </div>
                    </td>

                    {/* MAP & Pulse Pressure */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      <div>
                        MAP: <span className="text-purple-300 font-semibold">{classification.map}</span>
                      </div>
                      <div>
                        PP: <span className="text-cyan-300 font-semibold">{classification.pulsePressure}</span>
                      </div>
                    </td>

                    {/* AHA Stage Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${classification.badgeClass} ${
                          classification.stage === 'crisis' ? 'animate-pulse' : ''
                        }`}
                      >
                        {classification.stageLabel}
                      </span>
                    </td>

                    {/* Medication */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 max-w-[160px]">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            r.medTaken ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          <Pill className="w-3 h-3" />
                          {r.medTaken ? 'Taken' : 'Missed'}
                        </span>
                        {r.medTaken && r.medNames && r.medNames.length > 0 && (
                          <div className="text-[10px] text-slate-400 truncate" title={r.medNames.join(', ')}>
                            {r.medNames.join(', ')}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Arm, Posture & Notes */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5 max-w-[200px]">
                        <div className="text-[11px] text-slate-400 capitalize">
                          {r.arm} arm • {r.position}
                        </div>
                        {r.notes && (
                          <div
                            className="text-[11px] text-slate-300 truncate italic"
                            title={r.notes}
                          >
                            "{r.notes}"
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditReading(r)}
                          title="Edit reading"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(r.id)}
                          title="Delete reading"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 font-mono-numeric pt-2">
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="glass-input px-2 py-1 rounded-lg text-xs text-slate-200 bg-slate-950"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>of {filteredReadings.length} records</span>
        </div>

        <div className="flex items-center gap-2">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
