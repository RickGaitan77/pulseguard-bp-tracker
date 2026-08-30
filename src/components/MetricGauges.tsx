import React from 'react';
import { BPReading } from '../types';
import { computeMetrics, filterReadingsByTimeframe, classifyAHA } from '../utils/clinicalCalculations';
import { Activity, Heart, Shield, Pill, ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MetricGaugesProps {
  readings: BPReading[];
  timeframe?: '7d' | '30d' | 'all';
}

interface CircularGaugeProps {
  id: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  optimalMin: number;
  optimalMax: number;
  strokeColor: string;
  glowColor: string;
  gradientId: string;
  gradientStart: string;
  gradientEnd: string;
  subtext: string;
  statusBadge: {
    label: string;
    colorClass: string;
  };
  delta30d?: number;
}

const CircularGauge: React.FC<CircularGaugeProps> = ({
  id,
  label,
  value,
  unit,
  min,
  max,
  optimalMin,
  optimalMax,
  strokeColor,
  glowColor,
  gradientId,
  gradientStart,
  gradientEnd,
  subtext,
  statusBadge,
  delta30d,
}) => {
  const radius = 64;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * 2 * Math.PI;

  // We use a 240-degree arc for a classic speedometer/gauge look
  const arcDegree = 240;
  const arcFraction = arcDegree / 360;
  const totalArcLength = circumference * arcFraction;

  // Percentage within min-max clamped
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = max > min ? (clampedValue - min) / (max - min) : 0;
  const strokeDashoffset = totalArcLength - percentage * totalArcLength;

  return (
    <div
      id={id}
      className="glass-panel rounded-3xl p-5 border-slate-800 hover:border-slate-700/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative flex flex-col items-center justify-between group transition-all"
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-10 group-hover:opacity-20 transition-all pointer-events-none blur-xl"
        style={{ backgroundColor: glowColor }}
      />

      {/* Header Info */}
      <div className="w-full flex items-center justify-between mb-1 z-10">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono-numeric">
          {label}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono-numeric border ${statusBadge.colorClass}`}
        >
          {statusBadge.label}
        </span>
      </div>

      {/* Gauge SVG */}
      <div className="relative w-44 h-44 flex items-center justify-center my-1 z-10">
        <svg
          height={radius * 2 + 10}
          width={radius * 2 + 10}
          className="transform -rotate-[210deg] overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientStart} />
              <stop offset="100%" stopColor={gradientEnd} />
            </linearGradient>
            <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <circle
            stroke="rgba(30, 41, 59, 0.6)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${totalArcLength} ${circumference}`}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius + 5}
            cy={radius + 5}
          />

          {/* Active Progress Arc */}
          <circle
            stroke={`url(#${gradientId})`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${totalArcLength} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.8s ease-in-out',
            }}
            strokeLinecap="round"
            filter={`url(#glow-${gradientId})`}
            r={normalizedRadius}
            cx={radius + 5}
            cy={radius + 5}
          />
        </svg>

        {/* Center Display Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none mt-2">
          <div className="text-3xl font-extrabold text-white font-mono-numeric tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
            {value || '—'}
          </div>
          <div className="text-xs font-mono-numeric text-slate-400 -mt-0.5">{unit}</div>
          <div className="text-[10px] text-slate-500 font-mono-numeric mt-1">
            Target: {optimalMin}-{optimalMax} {unit}
          </div>
        </div>
      </div>

      {/* Footer Details / Comparisons */}
      <div className="w-full pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono-numeric z-10">
        <span className="text-slate-400">{subtext}</span>
        {delta30d !== undefined && (
          <span
            className={`flex items-center gap-0.5 font-semibold ${
              delta30d > 0 ? 'text-amber-400' : delta30d < 0 ? 'text-emerald-400' : 'text-slate-300'
            }`}
          >
            {delta30d > 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : delta30d < 0 ? (
              <ArrowDownRight className="w-3.5 h-3.5" />
            ) : null}
            {delta30d > 0 ? `+${delta30d}` : delta30d} vs 30D
          </span>
        )}
      </div>
    </div>
  );
};

export const MetricGauges: React.FC<MetricGaugesProps> = ({ readings }) => {
  const metrics7d = computeMetrics(filterReadingsByTimeframe(readings, '7d'));
  const metrics30d = computeMetrics(filterReadingsByTimeframe(readings, '30d'));
  const metricsAll = computeMetrics(readings);

  // Latest reading for immediate context
  const latestReading = readings.length > 0 ? readings[0] : null;

  // AHA classification for 7d average
  const classification7d = classifyAHA(metrics7d.avgSys, metrics7d.avgDia);

  // Status for MAP: Normal range is 70 - 100 mmHg
  const getMapStatus = (map: number) => {
    if (map < 70) return { label: 'Low Perfusion', colorClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
    if (map <= 100) return { label: 'Optimal MAP', colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    if (map <= 110) return { label: 'Elevated MAP', colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    return { label: 'High MAP', colorClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
  };

  // Status for Pulse: Normal resting is 60 - 100 bpm
  const getPulseStatus = (pulse: number) => {
    if (pulse < 60) return { label: 'Bradycardia', colorClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
    if (pulse <= 100) return { label: 'Normal Rhythm', colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    return { label: 'Tachycardia', colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
  };

  const sysDelta = metrics7d.avgSys && metrics30d.avgSys ? Math.round((metrics7d.avgSys - metrics30d.avgSys) * 10) / 10 : 0;
  const diaDelta = metrics7d.avgDia && metrics30d.avgDia ? Math.round((metrics7d.avgDia - metrics30d.avgDia) * 10) / 10 : 0;
  const mapDelta = metrics7d.avgMap && metrics30d.avgMap ? Math.round((metrics7d.avgMap - metrics30d.avgMap) * 10) / 10 : 0;

  return (
    <div className="space-y-4">
      {/* 3 Large Circular/Gauge Dials Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dial 1: Systolic Pressure */}
        <CircularGauge
          id="gauge-systolic"
          label="Systolic Pressure (SYS)"
          value={metrics7d.avgSys}
          unit="mmHg"
          min={80}
          max={180}
          optimalMin={90}
          optimalMax={120}
          strokeColor="#06b6d4"
          glowColor="#06b6d4"
          gradientId="grad-sys"
          gradientStart="#06b6d4"
          gradientEnd="#3b82f6"
          subtext="7-Day Moving Avg"
          statusBadge={{
            label: classification7d.stageLabel.replace('Hypertension ', ''),
            colorClass: classification7d.badgeClass,
          }}
          delta30d={sysDelta}
        />

        {/* Dial 2: Mean Arterial Pressure (MAP) - CENTERPIECE */}
        <CircularGauge
          id="gauge-map"
          label="Mean Arterial Pressure (MAP)"
          value={metrics7d.avgMap}
          unit="mmHg"
          min={50}
          max={140}
          optimalMin={70}
          optimalMax={100}
          strokeColor="#10b981"
          glowColor="#10b981"
          gradientId="grad-map"
          gradientStart="#10b981"
          gradientEnd="#06b6d4"
          subtext="Organ Perfusion Index"
          statusBadge={getMapStatus(metrics7d.avgMap)}
          delta30d={mapDelta}
        />

        {/* Dial 3: Diastolic Pressure */}
        <CircularGauge
          id="gauge-diastolic"
          label="Diastolic Pressure (DIA)"
          value={metrics7d.avgDia}
          unit="mmHg"
          min={50}
          max={120}
          optimalMin={60}
          optimalMax={80}
          strokeColor="#c084fc"
          glowColor="#c084fc"
          gradientId="grad-dia"
          gradientStart="#c084fc"
          gradientEnd="#ec4899"
          subtext="7-Day Moving Avg"
          statusBadge={{
            label: classification7d.stageLabel.replace('Hypertension ', ''),
            colorClass: classification7d.badgeClass,
          }}
          delta30d={diaDelta}
        />
      </div>

      {/* Secondary Companion Telemetry Strip: Pulse Gauge & Rx Adherence Ring */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Companion 1: Heart Pulse BPM */}
        <div className="glass-panel rounded-3xl p-4 border-amber-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 font-mono-numeric flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Resting Pulse
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono-numeric">{metrics7d.avgPulse || '—'}</span>
              <span className="text-xs text-slate-400 font-mono-numeric">BPM</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono-numeric">
              Norm: 60-100 bpm
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono-numeric border ${getPulseStatus(metrics7d.avgPulse).colorClass}`}>
            {getPulseStatus(metrics7d.avgPulse).label}
          </span>
        </div>

        {/* Companion 2: Pulse Pressure Indicator */}
        <div className="glass-panel rounded-3xl p-4 border-purple-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 font-mono-numeric flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              Pulse Pressure
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono-numeric">
                {metrics7d.avgSys && metrics7d.avgDia ? Math.round((metrics7d.avgSys - metrics7d.avgDia) * 10) / 10 : '—'}
              </span>
              <span className="text-xs text-slate-400 font-mono-numeric">mmHg</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono-numeric">
              Norm: 40-60 mmHg
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono-numeric border bg-purple-500/20 text-purple-300 border-purple-500/40">
            Arterial Index
          </span>
        </div>

        {/* Companion 3: 30D Medication Compliance */}
        <div className="glass-panel rounded-3xl p-4 border-emerald-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 font-mono-numeric flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-emerald-400" />
              Rx Adherence
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-300 font-mono-numeric">
                {metrics30d.medAdherenceRate}%
              </span>
              <span className="text-xs text-slate-400 font-mono-numeric">30D</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono-numeric">
              Target: &gt;80%
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono-numeric border ${
            metrics30d.medAdherenceRate >= 80
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            {metrics30d.medAdherenceRate >= 80 ? 'Optimal' : 'Needs Review'}
          </span>
        </div>

        {/* Companion 4: Latest Logged Snapshot */}
        <div className="glass-panel rounded-3xl p-4 border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 font-mono-numeric flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Latest Reading
            </span>
            {latestReading ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white font-mono-numeric">
                    {latestReading.systolic}/{latestReading.diastolic}
                  </span>
                  <span className="text-xs text-slate-400 font-mono-numeric">mmHg</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono-numeric truncate max-w-[120px]">
                  {new Date(latestReading.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {latestReading.arm.toUpperCase()} arm
                </div>
              </>
            ) : (
              <span className="text-sm text-slate-400">No logs yet</span>
            )}
          </div>
          {latestReading && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono-numeric border ${classifyAHA(latestReading.systolic, latestReading.diastolic).badgeClass}`}>
              {classifyAHA(latestReading.systolic, latestReading.diastolic).stageLabel.replace('Hypertension ', '')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
