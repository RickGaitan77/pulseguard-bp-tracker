import React, { useState } from 'react';
import { BPReading, TimeframeFilter } from '../types';
import { DualLineChart } from './DualLineChart';
import { AnalyticsTiles } from './AnalyticsTiles';
import { DataLoggingCard } from './DataLoggingCard';
import { LogTable } from './LogTable';
import { AHAGuideCard } from './AHAGuideCard';
import { Plus, Zap, Heart, Pill, Activity, Check, Sparkles } from 'lucide-react';
import { classifyAHA } from '../utils/clinicalCalculations';

interface CommandCenterViewProps {
  readings: BPReading[];
  selectedTimeframe: TimeframeFilter;
  onTimeframeChange: (tf: TimeframeFilter) => void;
  onSaveReading: (reading: Omit<BPReading, 'id'>) => void;
  editingReading: BPReading | null;
  onCancelEdit: () => void;
  onEditReading: (reading: BPReading) => void;
  onDeleteReading: (id: string) => void;
  highlightedReadingId?: string | null;
  onOpenFullLogModal: () => void;
  logFormRef: React.RefObject<HTMLDivElement>;
  logTableRef: React.RefObject<HTMLDivElement>;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  readings,
  selectedTimeframe,
  onTimeframeChange,
  onSaveReading,
  editingReading,
  onCancelEdit,
  onEditReading,
  onDeleteReading,
  highlightedReadingId,
  onOpenFullLogModal,
  logFormRef,
  logTableRef,
}) => {
  // Quick-log strip inline inputs state
  const [quickSys, setQuickSys] = useState<string>('120');
  const [quickDia, setQuickDia] = useState<string>('80');
  const [quickPulse, setQuickPulse] = useState<string>('72');
  const [quickMedTaken, setQuickMedTaken] = useState<boolean>(true);
  const [quickArm, setQuickArm] = useState<'left' | 'right'>('left');
  const [justSavedSuccess, setJustSavedSuccess] = useState<boolean>(false);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sys = parseInt(quickSys, 10);
    const dia = parseInt(quickDia, 10);
    const pulse = parseInt(quickPulse, 10);

    if (isNaN(sys) || isNaN(dia) || isNaN(pulse)) return;

    onSaveReading({
      timestamp: new Date().toISOString(),
      systolic: sys,
      diastolic: dia,
      pulse,
      arm: quickArm,
      position: 'sitting',
      medTaken: quickMedTaken,
      medNames: quickMedTaken ? ['Lisinopril 10mg'] : [],
      notes: 'Quick Command Center Log',
    });

    setJustSavedSuccess(true);
    setTimeout(() => setJustSavedSuccess(false), 2500);
  };

  const previewClass = classifyAHA(parseInt(quickSys) || 120, parseInt(quickDia) || 80);

  return (
    <div className="space-y-6">
      {/* 1. Top Section: Heavy Focus on Full-Width Dual-Line Trending Chart */}
      <section id="command-trend-section" className="w-full">
        <DualLineChart
          readings={readings}
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={onTimeframeChange}
        />
      </section>

      {/* 2. Quick-Log Action Bar Strip */}
      <section className="glass-panel rounded-3xl p-4 sm:p-5 border-cyan-500/30 shadow-[0_8px_32px_rgba(6,182,212,0.2)] bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Title and Telemetry Preview */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono-numeric">
                  Command Rapid-Log HUD
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono-numeric border ${previewClass.badgeClass}`}
                >
                  {previewClass.stageLabel}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                1-Click fast telemetry logging with automatic MAP & pulse pressure indexing
              </p>
            </div>
          </div>

          {/* Inline Quick-Log Form */}
          <form
            onSubmit={handleQuickSubmit}
            className="w-full lg:w-auto flex flex-wrap items-center gap-2.5"
          >
            {/* Systolic Input */}
            <div className="flex items-center bg-slate-950/80 border border-cyan-500/30 rounded-xl px-2.5 py-1.5 focus-within:border-cyan-400">
              <span className="text-[10px] font-mono-numeric text-cyan-400 font-bold mr-1.5 uppercase">
                SYS:
              </span>
              <input
                type="number"
                min="60"
                max="250"
                value={quickSys}
                onChange={(e) => setQuickSys(e.target.value)}
                className="w-12 bg-transparent text-sm font-bold text-white font-mono-numeric focus:outline-none"
              />
            </div>

            {/* Diastolic Input */}
            <div className="flex items-center bg-slate-950/80 border border-purple-500/30 rounded-xl px-2.5 py-1.5 focus-within:border-purple-400">
              <span className="text-[10px] font-mono-numeric text-purple-400 font-bold mr-1.5 uppercase">
                DIA:
              </span>
              <input
                type="number"
                min="40"
                max="160"
                value={quickDia}
                onChange={(e) => setQuickDia(e.target.value)}
                className="w-12 bg-transparent text-sm font-bold text-white font-mono-numeric focus:outline-none"
              />
            </div>

            {/* Pulse Input */}
            <div className="flex items-center bg-slate-950/80 border border-amber-500/30 rounded-xl px-2.5 py-1.5 focus-within:border-amber-400">
              <span className="text-[10px] font-mono-numeric text-amber-400 font-bold mr-1.5 uppercase">
                BPM:
              </span>
              <input
                type="number"
                min="35"
                max="220"
                value={quickPulse}
                onChange={(e) => setQuickPulse(e.target.value)}
                className="w-12 bg-transparent text-sm font-bold text-white font-mono-numeric focus:outline-none"
              />
            </div>

            {/* Arm selector */}
            <div className="flex bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 text-[10px] font-mono-numeric font-bold">
              <button
                type="button"
                onClick={() => setQuickArm('left')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  quickArm === 'left' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'
                }`}
              >
                L
              </button>
              <button
                type="button"
                onClick={() => setQuickArm('right')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  quickArm === 'right' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'
                }`}
              >
                R
              </button>
            </div>

            {/* Med switch toggle */}
            <button
              type="button"
              onClick={() => setQuickMedTaken(!quickMedTaken)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono-numeric font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                quickMedTaken
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>{quickMedTaken ? 'Rx Taken' : 'No Rx'}</span>
            </button>

            {/* Quick Log Submit Button */}
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer ml-auto sm:ml-0"
            >
              {justSavedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950 stroke-[3]" />
                  <span>Logged!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  <span>Quick Record</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* 3. Metric Tiles & AHA Breakdown */}
      <section id="command-metrics-section">
        <AnalyticsTiles readings={readings} />
      </section>

      {/* 4. Side-by-Side: Data Logging Card & Historical Log Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div ref={logFormRef} className="lg:col-span-5">
          <DataLoggingCard
            onSaveReading={onSaveReading}
            editingReading={editingReading}
            onCancelEdit={onCancelEdit}
          />
        </div>

        <div ref={logTableRef} className="lg:col-span-7">
          <LogTable
            readings={readings}
            onEditReading={onEditReading}
            onDeleteReading={onDeleteReading}
            highlightedReadingId={highlightedReadingId}
          />
        </div>
      </div>

      {/* 5. AHA Clinical Standards Reference Matrix */}
      <AHAGuideCard />
    </div>
  );
};
