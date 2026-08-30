import React, { useState } from 'react';
import { BPReading, TimeframeFilter } from '../types';
import { classifyAHA, computeMetrics, filterReadingsByTimeframe } from '../utils/clinicalCalculations';
import {
  Activity,
  Heart,
  Pill,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  ChevronRight,
  TrendingUp,
  Search,
  SlidersHorizontal,
  Sun,
  Moon,
  Sparkles,
  ShieldAlert,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DualLineChart } from './DualLineChart';

interface FeedAndCardsViewProps {
  readings: BPReading[];
  onOpenLogModal: () => void;
  onEditReading: (reading: BPReading) => void;
  onDeleteReading: (id: string) => void;
  highlightedReadingId?: string | null;
  selectedTimeframe: TimeframeFilter;
  onTimeframeChange: (tf: TimeframeFilter) => void;
}

export const FeedAndCardsView: React.FC<FeedAndCardsViewProps> = ({
  readings,
  onOpenLogModal,
  onEditReading,
  onDeleteReading,
  highlightedReadingId,
  selectedTimeframe,
  onTimeframeChange,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterMed, setFilterMed] = useState<'all' | 'taken' | 'missed'>('all');
  const [isChartExpanded, setIsChartExpanded] = useState<boolean>(false);
  const [avgCardTimeframe, setAvgCardTimeframe] = useState<'7d' | '30d'>('7d');

  // Filter readings for the feed
  const filteredFeed = readings.filter((r) => {
    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNotes = r.notes?.toLowerCase().includes(q);
      const matchMeds = r.medNames?.some((m) => m.toLowerCase().includes(q));
      const matchNums = `${r.systolic}/${r.diastolic}`.includes(q) || `${r.pulse}`.includes(q);
      if (!matchNotes && !matchMeds && !matchNums) return false;
    }

    // Stage filter
    if (filterStage !== 'all') {
      const cls = classifyAHA(r.systolic, r.diastolic);
      if (cls.stage !== filterStage) return false;
    }

    // Med filter
    if (filterMed === 'taken' && !r.medTaken) return false;
    if (filterMed === 'missed' && r.medTaken) return false;

    return true;
  });

  // Calculate AM vs PM averages for Circadian insight
  const morningReadings = readings.filter((r) => {
    const hour = new Date(r.timestamp).getHours();
    return hour >= 5 && hour < 12;
  });
  const eveningReadings = readings.filter((r) => {
    const hour = new Date(r.timestamp).getHours();
    return hour >= 17 && hour < 23;
  });

  const amAvgSys =
    morningReadings.length > 0
      ? Math.round(
          (morningReadings.reduce((sum, r) => sum + r.systolic, 0) / morningReadings.length) * 10
        ) / 10
      : null;
  const amAvgDia =
    morningReadings.length > 0
      ? Math.round(
          (morningReadings.reduce((sum, r) => sum + r.diastolic, 0) / morningReadings.length) * 10
        ) / 10
      : null;

  const pmAvgSys =
    eveningReadings.length > 0
      ? Math.round(
          (eveningReadings.reduce((sum, r) => sum + r.systolic, 0) / eveningReadings.length) * 10
        ) / 10
      : null;
  const pmAvgDia =
    eveningReadings.length > 0
      ? Math.round(
          (eveningReadings.reduce((sum, r) => sum + r.diastolic, 0) / eveningReadings.length) * 10
        ) / 10
      : null;

  const metrics7d = computeMetrics(filterReadingsByTimeframe(readings, '7d'));
  const metrics30d = computeMetrics(filterReadingsByTimeframe(readings, '30d'));
  const latest = readings[0];

  return (
    <div className="space-y-6">
      {/* 1. Swipeable / Horizontal Scrolling Summary Cards Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono-numeric flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Cardio Snapshot Cards
          </span>
          <span className="text-[11px] text-slate-500 font-mono-numeric">Swipe / Scroll ➔</span>
        </div>

        <div className="flex overflow-x-auto pb-3 pt-1 gap-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {/* Card 1: Latest Reading Spotlight */}
          <div className="snap-center shrink-0 w-80 glass-panel rounded-3xl p-5 border-cyan-500/30 shadow-[0_8px_32px_rgba(6,182,212,0.15)] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-cyan-500/15 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 font-mono-numeric">
                Latest Reading
              </span>
              {latest && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono-numeric border ${classifyAHA(latest.systolic, latest.diastolic).badgeClass}`}
                >
                  {classifyAHA(latest.systolic, latest.diastolic).stageLabel.replace('Hypertension ', '')}
                </span>
              )}
            </div>

            {latest ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white font-mono-numeric tracking-tight">
                    {latest.systolic}/{latest.diastolic}
                  </span>
                  <span className="text-xs text-slate-400 font-mono-numeric">mmHg</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono-numeric text-slate-300">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Heart className="w-3.5 h-3.5" /> {latest.pulse} bpm
                  </span>
                  <span>•</span>
                  <span>MAP: {Math.round((latest.diastolic + (latest.systolic - latest.diastolic) / 3) * 10) / 10}</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm">No readings logged yet</div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono-numeric text-slate-400">
              <span>{latest ? new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
              <span>{latest ? `${latest.arm.toUpperCase()} arm (${latest.position})` : '—'}</span>
            </div>
          </div>

          {/* Card 2: Interactive Telemetry Trend (7D / 30D) */}
          <button
            onClick={() => setAvgCardTimeframe(prev => prev === '7d' ? '30d' : '7d')}
            className="snap-center shrink-0 w-80 glass-panel rounded-3xl p-5 border-purple-500/30 shadow-[0_8px_32px_rgba(192,132,252,0.15)] relative overflow-hidden flex flex-col justify-between text-left cursor-pointer hover:border-purple-400 hover:shadow-[0_8px_32px_rgba(192,132,252,0.25)] transition-all group"
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-purple-500/15 blur-xl pointer-events-none group-hover:bg-purple-400/20 transition-all" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 font-mono-numeric transition-all">
                {avgCardTimeframe === '7d' ? '7-Day Moving Avg' : '30-Day Moving Avg'}
              </span>
              <div className="p-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 group-hover:bg-purple-500/20">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono-numeric tracking-tight">
                  {avgCardTimeframe === '7d' ? (metrics7d.avgSys || '—') : (metrics30d.avgSys || '—')}/
                  {avgCardTimeframe === '7d' ? (metrics7d.avgDia || '—') : (metrics30d.avgDia || '—')}
                </span>
                <span className="text-xs text-slate-400 font-mono-numeric">mmHg</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono-numeric text-slate-300">
                <span className="text-slate-400">{avgCardTimeframe === '7d' ? '7D' : '30D'} MAP: <b className="text-cyan-300">{avgCardTimeframe === '7d' ? (metrics7d.avgMap || '—') : (metrics30d.avgMap || '—')}</b></span>
                <span className="text-slate-400">Pulse: <b className="text-amber-400">{avgCardTimeframe === '7d' ? (metrics7d.avgPulse || '—') : (metrics30d.avgPulse || '—')} bpm</b></span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono-numeric text-slate-400">
              <span>Range: {avgCardTimeframe === '7d' ? (metrics7d.minSys || 0) : (metrics30d.minSys || 0)}-{avgCardTimeframe === '7d' ? (metrics7d.maxSys || 0) : (metrics30d.maxSys || 0)} SYS</span>
              <span className="text-purple-300 font-medium">{avgCardTimeframe === '7d' ? metrics7d.count : metrics30d.count} readings</span>
            </div>
          </button>

          {/* Card 3: Circadian AM / PM Split */}
          <div className="snap-center shrink-0 w-80 glass-panel rounded-3xl p-5 border-amber-500/30 shadow-[0_8px_32px_rgba(245,158,11,0.15)] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-amber-500/15 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 font-mono-numeric">
                Circadian AM / PM
              </span>
              <div className="flex items-center gap-1 text-amber-400">
                <Sun className="w-3.5 h-3.5" />
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-1 text-[10px] text-amber-300 font-mono-numeric uppercase">
                  <Sun className="w-3 h-3 text-amber-400" /> Morning
                </div>
                <div className="text-lg font-bold text-white font-mono-numeric mt-1">
                  {amAvgSys ? `${amAvgSys}/${amAvgDia}` : '—'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono-numeric">{morningReadings.length} logs</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-1 text-[10px] text-indigo-300 font-mono-numeric uppercase">
                  <Moon className="w-3 h-3 text-indigo-400" /> Evening
                </div>
                <div className="text-lg font-bold text-white font-mono-numeric mt-1">
                  {pmAvgSys ? `${pmAvgSys}/${pmAvgDia}` : '—'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono-numeric">{eveningReadings.length} logs</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono-numeric text-slate-400">
              <span>Circadian Rhythm</span>
              <span className="text-emerald-400">Normal Nocturnal Dip</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Expandable Trend Chart Accordion */}
      <div className="glass-panel rounded-3xl p-5 border-slate-800/90 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <button
          onClick={() => setIsChartExpanded(!isChartExpanded)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono-numeric flex items-center gap-2">
                Cardiovascular Trend Timeline
                <span className="text-[10px] text-cyan-400 normal-case">
                  ({selectedTimeframe.toUpperCase()} Filter)
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Continuous dual-line systolic/diastolic telemetry graph
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-numeric text-cyan-400 hidden sm:inline">
              {isChartExpanded ? 'Hide Chart' : 'Show Chart'}
            </span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              {isChartExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {isChartExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-800 animate-in fade-in">
            <DualLineChart
              readings={readings}
              selectedTimeframe={selectedTimeframe}
              onTimeframeChange={onTimeframeChange}
            />
          </div>
        )}
      </div>

      {/* 3. Streamlined Vertical Activity Feed Header & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono-numeric">
              Cardiovascular Telemetry Feed ({filteredFeed.length} Readings)
            </h3>
          </div>

          {/* Search and Stage Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search notes, meds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono-numeric"
              />
            </div>

            {/* Stage filter dropdown */}
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono-numeric cursor-pointer"
            >
              <option value="all">All Stages</option>
              <option value="normal">Normal</option>
              <option value="elevated">Elevated</option>
              <option value="stage1">Stage 1</option>
              <option value="stage2">Stage 2</option>
              <option value="crisis">Crisis</option>
              <option value="hypotension">Hypotension</option>
            </select>

            {/* Med filter */}
            <select
              value={filterMed}
              onChange={(e) => setFilterMed(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono-numeric cursor-pointer"
            >
              <option value="all">All Meds</option>
              <option value="taken">✓ Med Taken</option>
              <option value="missed">✗ Med Missed</option>
            </select>
          </div>
        </div>

        {/* 4. Streamlined Vertical Feed Items */}
        <div className="space-y-3">
          {filteredFeed.length === 0 ? (
            <div className="glass-panel rounded-3xl p-10 text-center space-y-2 border-slate-800">
              <Activity className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400 font-mono-numeric">No blood pressure logs matched your filter criteria.</p>
            </div>
          ) : (
            filteredFeed.map((reading) => {
              const classification = classifyAHA(reading.systolic, reading.diastolic);
              const isHighlighted = highlightedReadingId === reading.id;
              const dateObj = new Date(reading.timestamp);
              const formattedDate = dateObj.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              const formattedTime = dateObj.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={reading.id}
                  id={`feed-item-${reading.id}`}
                  className={`glass-panel rounded-2xl p-4 sm:p-5 border transition-all duration-300 relative overflow-hidden group ${
                    isHighlighted
                      ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_24px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                      : 'border-slate-800/80 hover:border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left Column: Date & Primary Reading Numbers */}
                    <div className="flex items-start sm:items-center gap-4">
                      {/* Arm & Position Pill Icon */}
                      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shrink-0">
                        <span className="text-[10px] font-black uppercase text-slate-400 block font-mono-numeric">
                          {reading.arm.toUpperCase()}
                        </span>
                        <span className="text-[9px] text-slate-500 block capitalize font-mono-numeric">
                          {reading.position}
                        </span>
                      </div>

                      {/* Main Numbers */}
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono-numeric tracking-tight">
                            {reading.systolic}
                            <span className="text-slate-600 font-normal mx-0.5">/</span>
                            {reading.diastolic}
                          </span>
                          <span className="text-xs font-mono-numeric text-slate-400">mmHg</span>
                          <span
                            className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono-numeric border ${classification.badgeClass} ${classification.glowClass}`}
                          >
                            {classification.stageLabel}
                          </span>
                        </div>

                        {/* Timestamp & Pulse */}
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs font-mono-numeric text-slate-400">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {formattedDate} at {formattedTime}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-300">
                            <Heart className="w-3.5 h-3.5 text-amber-400" />
                            {reading.pulse} bpm
                          </span>
                          <span>•</span>
                          <span>
                            MAP: <b className="text-purple-300 font-semibold">{classification.map}</b> mmHg
                          </span>
                          <span>•</span>
                          <span>
                            PP: <b className="text-cyan-300 font-semibold">{classification.pulsePressure}</b> mmHg
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Medication, Notes & Action buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                      {/* Medication tag */}
                      <div className="flex items-center gap-1.5">
                        {reading.medTaken ? (
                          <span
                            title={reading.medNames?.join(', ') || 'Medication taken'}
                            className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono-numeric"
                          >
                            <Pill className="w-3 h-3 text-emerald-400" />
                            {reading.medNames && reading.medNames.length > 0
                              ? reading.medNames[0] + (reading.medNames.length > 1 ? ` +${reading.medNames.length - 1}` : '')
                              : 'Med Taken'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-900 text-slate-500 border border-slate-800 flex items-center gap-1 font-mono-numeric">
                            <Pill className="w-3 h-3 text-slate-600" />
                            No Meds
                          </span>
                        )}
                      </div>

                      {/* Edit & Delete Controls */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditReading(reading)}
                          title="Edit reading"
                          className="p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/40 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this blood pressure reading?')) {
                              onDeleteReading(reading.id);
                            }
                          }}
                          title="Delete reading"
                          className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/60 hover:border-rose-500/40 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes snippet if present */}
                  {reading.notes && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 text-xs text-slate-300 font-mono-numeric flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-xl">
                      <span className="text-slate-500 shrink-0">Note:</span>
                      <span className="italic">"{reading.notes}"</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. Floating Action Button (FAB) for Quick Logging */}
      <button
        id="fab-quick-log"
        onClick={onOpenLogModal}
        aria-label="Quick Log Blood Pressure"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 font-bold text-sm font-mono-numeric shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
        </span>
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span className="tracking-tight">Log Vitals</span>
      </button>
    </div>
  );
};
