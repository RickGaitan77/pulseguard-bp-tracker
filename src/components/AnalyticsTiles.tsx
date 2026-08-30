import React from 'react';
import { Activity, Heart, Zap, Pill, ArrowUp, ArrowDown, Sparkles, PieChart, ShieldCheck } from 'lucide-react';
import { BPReading } from '../types';
import { computeMetrics, filterReadingsByTimeframe } from '../utils/clinicalCalculations';

interface AnalyticsTilesProps {
  readings: BPReading[];
}

export const AnalyticsTiles: React.FC<AnalyticsTilesProps> = ({ readings }) => {
  const metrics7d = computeMetrics(filterReadingsByTimeframe(readings, '7d'));
  const metrics30d = computeMetrics(filterReadingsByTimeframe(readings, '30d'));
  const metricsAll = computeMetrics(readings);

  return (
    <div className="space-y-4">
      {/* 4 Primary Frosted Glass Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Average Systolic */}
        <div className="glass-panel rounded-3xl p-5 border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-cyan-500/10 blur-xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono-numeric">
              Systolic Average
            </span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono-numeric tracking-tight">
              {metrics7d.avgSys || '—'}
            </span>
            <span className="text-xs font-mono-numeric text-slate-400">mmHg (7D)</span>
          </div>

          {/* 30D Delta Comparison */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono-numeric">
            <span className="text-slate-400">30-Day Avg:</span>
            <span className="text-slate-200 font-semibold">{metrics30d.avgSys || '—'} mmHg</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono-numeric text-slate-400">
            <span>Range:</span>
            <span>
              {metricsAll.minSys || 0} - {metricsAll.maxSys || 0} mmHg
            </span>
          </div>
        </div>

        {/* Metric 2: Average Diastolic */}
        <div className="glass-panel rounded-3xl p-5 border-purple-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-purple-500/10 blur-xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono-numeric">
              Diastolic Average
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono-numeric tracking-tight">
              {metrics7d.avgDia || '—'}
            </span>
            <span className="text-xs font-mono-numeric text-slate-400">mmHg (7D)</span>
          </div>

          {/* 30D Delta Comparison */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono-numeric">
            <span className="text-slate-400">30-Day Avg:</span>
            <span className="text-slate-200 font-semibold">{metrics30d.avgDia || '—'} mmHg</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono-numeric text-slate-400">
            <span>Range:</span>
            <span>
              {metricsAll.minDia || 0} - {metricsAll.maxDia || 0} mmHg
            </span>
          </div>
        </div>

        {/* Metric 3: Pulse & MAP Index */}
        <div className="glass-panel rounded-3xl p-5 border-amber-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono-numeric">
              Pulse & MAP Index
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Heart className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono-numeric tracking-tight">
              {metrics7d.avgPulse || '—'}
            </span>
            <span className="text-xs font-mono-numeric text-slate-400">BPM</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono-numeric">
            <span className="text-slate-400">7D Mean Arterial:</span>
            <span className="text-purple-300 font-bold">{metrics7d.avgMap || '—'} mmHg</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono-numeric text-slate-400">
            <span>Pulse Pressure:</span>
            <span className="text-cyan-300 font-semibold">
              {metrics7d.avgSys && metrics7d.avgDia
                ? Math.round((metrics7d.avgSys - metrics7d.avgDia) * 10) / 10
                : '—'}{' '}
              mmHg
            </span>
          </div>
        </div>

        {/* Metric 4: Medication Adherence */}
        <div className="glass-panel rounded-3xl p-5 border-emerald-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-mono-numeric">
              Med Adherence
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Pill className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-300 font-mono-numeric tracking-tight">
              {metrics30d.medAdherenceRate}%
            </span>
            <span className="text-xs font-mono-numeric text-slate-400">30-day window</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800">
            {/* Progress meter bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, metrics30d.medAdherenceRate))}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono-numeric text-slate-400">
              <span>Status:</span>
              <span className={metrics30d.medAdherenceRate >= 80 ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                {metrics30d.medAdherenceRate >= 80 ? 'Consistent' : 'Inconsistent'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AHA Distribution & Stage Breakdown Bar */}
      {metricsAll.count > 0 && (
        <div className="glass-panel rounded-3xl p-5 border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono-numeric">
                AHA Cardiovascular Stage Breakdown ({metricsAll.count} Total Readings)
              </h4>
            </div>
            <div className="text-xs text-slate-400 font-mono-numeric">
              Target goal: &gt;80% Normal Zone
            </div>
          </div>

          {/* Segmented multi-color distribution bar */}
          <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex border border-slate-800">
            {metricsAll.stageDistribution.normal > 0 && (
              <div
                className="h-full bg-emerald-500 transition-all"
                title={`Normal: ${metricsAll.stageDistribution.normal} readings`}
                style={{
                  width: `${(metricsAll.stageDistribution.normal / metricsAll.count) * 100}%`,
                }}
              />
            )}
            {metricsAll.stageDistribution.elevated > 0 && (
              <div
                className="h-full bg-yellow-400 transition-all"
                title={`Elevated: ${metricsAll.stageDistribution.elevated} readings`}
                style={{
                  width: `${(metricsAll.stageDistribution.elevated / metricsAll.count) * 100}%`,
                }}
              />
            )}
            {metricsAll.stageDistribution.stage1 > 0 && (
              <div
                className="h-full bg-amber-500 transition-all"
                title={`Stage 1: ${metricsAll.stageDistribution.stage1} readings`}
                style={{
                  width: `${(metricsAll.stageDistribution.stage1 / metricsAll.count) * 100}%`,
                }}
              />
            )}
            {metricsAll.stageDistribution.stage2 > 0 && (
              <div
                className="h-full bg-red-500 transition-all"
                title={`Stage 2: ${metricsAll.stageDistribution.stage2} readings`}
                style={{
                  width: `${(metricsAll.stageDistribution.stage2 / metricsAll.count) * 100}%`,
                }}
              />
            )}
            {metricsAll.stageDistribution.crisis > 0 && (
              <div
                className="h-full bg-rose-600 animate-pulse transition-all"
                title={`Crisis: ${metricsAll.stageDistribution.crisis} readings`}
                style={{
                  width: `${(metricsAll.stageDistribution.crisis / metricsAll.count) * 100}%`,
                }}
              />
            )}
            {metricsAll.stageDistribution.hypotension > 0 && (
              <div
                className="h-full bg-sky-500 transition-all"
                title={`Hypotension: ${metricsAll.stageDistribution.hypotension} readings`}
                style={{
                  width: `${(metricsAll.stageDistribution.hypotension / metricsAll.count) * 100}%`,
                }}
              />
            )}
          </div>

          {/* Legend Badges */}
          <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono-numeric">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Normal: {metricsAll.stageDistribution.normal} ({Math.round((metricsAll.stageDistribution.normal / metricsAll.count) * 100)}%)
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-950/40 text-yellow-300 border border-yellow-500/30">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Elevated: {metricsAll.stageDistribution.elevated}
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 text-amber-300 border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Stage 1: {metricsAll.stageDistribution.stage1}
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/40 text-red-300 border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-400"></span> Stage 2: {metricsAll.stageDistribution.stage2}
            </span>
            {metricsAll.stageDistribution.crisis > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-500/40 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Crisis: {metricsAll.stageDistribution.crisis}
              </span>
            )}
            {metricsAll.stageDistribution.hypotension > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/40 text-sky-300 border border-sky-500/30">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span> Hypotension: {metricsAll.stageDistribution.hypotension}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
