import React, { useState } from 'react';
import { BPReading, TimeframeFilter } from '../types';
import { MetricGauges } from './MetricGauges';
import { DualLineChart } from './DualLineChart';
import { AnalyticsTiles } from './AnalyticsTiles';
import { DataLoggingCard } from './DataLoggingCard';
import { LogTable } from './LogTable';
import { AHAGuideCard } from './AHAGuideCard';
import { Activity, ChevronDown, ChevronUp, PieChart, Sparkles, Sliders } from 'lucide-react';

interface MetricFocusedViewProps {
  readings: BPReading[];
  selectedTimeframe: TimeframeFilter;
  onTimeframeChange: (tf: TimeframeFilter) => void;
  onSaveReading: (reading: Omit<BPReading, 'id'>) => void;
  editingReading: BPReading | null;
  onCancelEdit: () => void;
  onEditReading: (reading: BPReading) => void;
  onDeleteReading: (id: string) => void;
  highlightedReadingId?: string | null;
  logFormRef: React.RefObject<HTMLDivElement>;
  logTableRef: React.RefObject<HTMLDivElement>;
}

export const MetricFocusedView: React.FC<MetricFocusedViewProps> = ({
  readings,
  selectedTimeframe,
  onTimeframeChange,
  onSaveReading,
  editingReading,
  onCancelEdit,
  onEditReading,
  onDeleteReading,
  highlightedReadingId,
  logFormRef,
  logTableRef,
}) => {
  const [isChartExpanded, setIsChartExpanded] = useState<boolean>(true);

  return (
    <div className="space-y-6">
      {/* 1. Large Glowing Circular Gauge Dials for SYS, MAP, and DIA */}
      <section id="metric-gauges-section" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono-numeric">
              Cardiovascular Biometric Gauges & Perfusion Indexes
            </h3>
          </div>
          <span className="text-[11px] text-cyan-400 font-mono-numeric">
            7-Day Moving Baseline Telemetry
          </span>
        </div>

        <MetricGauges readings={readings} />
      </section>

      {/* 2. Expandable Trend Chart Section Below the Dials */}
      <section className="glass-panel rounded-3xl p-5 border-slate-800/90 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <button
          onClick={() => setIsChartExpanded(!isChartExpanded)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono-numeric flex items-center gap-2">
                Cardiovascular Trend Timeline Chart
                <span className="text-[10px] text-purple-400 normal-case">
                  ({selectedTimeframe.toUpperCase()} Waveform)
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Detailed systolic/diastolic dual-line timeline with clinical target zones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-numeric text-purple-300 hidden sm:inline">
              {isChartExpanded ? 'Collapse Timeline' : 'Expand Timeline'}
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
      </section>

      {/* 3. Analytics Distribution & Range Summaries */}
      <section>
        <AnalyticsTiles readings={readings} />
      </section>

      {/* 4. Side-by-Side: Data Logging Card & History Table */}
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
