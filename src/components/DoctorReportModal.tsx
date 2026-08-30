import React, { useState, useMemo } from 'react';
import { X, Printer, Copy, Check, FileText, Download, Activity, Heart, Pill, AlertTriangle } from 'lucide-react';
import { BPReading, TimeframeFilter } from '../types';
import { computeMetrics, classifyAHA, filterReadingsByTimeframe, detectAnomalies } from '../utils/clinicalCalculations';

interface DoctorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  readings: BPReading[];
}

export const DoctorReportModal: React.FC<DoctorReportModalProps> = ({
  isOpen,
  onClose,
  readings,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('30d');
  const [copied, setCopied] = useState<boolean>(false);
  const [patientName, setPatientName] = useState<string>('Patient Telemetry Record');

  const filteredReadings = useMemo(() => {
    return filterReadingsByTimeframe(readings, timeframe);
  }, [readings, timeframe]);

  const metrics = useMemo(() => computeMetrics(filteredReadings), [filteredReadings]);
  const anomalies = useMemo(() => detectAnomalies(filteredReadings), [filteredReadings]);

  // Split morning (4am - 12pm) vs evening (12pm - 4am) readings
  const { morningAvg, eveningAvg } = useMemo(() => {
    const morning = filteredReadings.filter((r) => {
      const h = new Date(r.timestamp).getHours();
      return h >= 4 && h < 12;
    });
    const evening = filteredReadings.filter((r) => {
      const h = new Date(r.timestamp).getHours();
      return h < 4 || h >= 12;
    });

    const mMetrics = computeMetrics(morning);
    const eMetrics = computeMetrics(evening);

    return {
      morningAvg: mMetrics,
      eveningAvg: eMetrics,
    };
  }, [filteredReadings]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textSummary = `
=========================================
PULSEGUARD - CARDIOVASCULAR CLINICAL SUMMARY
Generated: ${new Date().toLocaleDateString()}
Report Timeframe: ${timeframe.toUpperCase()} (${filteredReadings.length} Total Readings)
=========================================

1. OVERALL AVERAGES:
- Blood Pressure: ${metrics.avgSys} / ${metrics.avgDia} mmHg
- Pulse: ${metrics.avgPulse} BPM
- Mean Arterial Pressure (MAP): ${metrics.avgMap} mmHg
- Pulse Pressure: ${Math.round((metrics.avgSys - metrics.avgDia) * 10) / 10} mmHg
- Range: SYS ${metrics.minSys}-${metrics.maxSys} mmHg | DIA ${metrics.minDia}-${metrics.maxDia} mmHg

2. DIURNAL / CIRCADIAN BREAKDOWN:
- Morning Average (AM): ${morningAvg.avgSys || 'N/A'} / ${morningAvg.avgDia || 'N/A'} mmHg (${morningAvg.count} logs)
- Evening Average (PM): ${eveningAvg.avgSys || 'N/A'} / ${eveningAvg.avgDia || 'N/A'} mmHg (${eveningAvg.count} logs)

3. MEDICATION ADHERENCE:
- Adherence Rate: ${metrics.medAdherenceRate}%
- Active Prescriptions Recorded: Lisinopril 10mg, Amlodipine 5mg

4. AHA DISTRIBUTION:
- Normal (<120/<80): ${metrics.stageDistribution.normal}
- Elevated (120-129/<80): ${metrics.stageDistribution.elevated}
- Stage 1 (130-139/80-89): ${metrics.stageDistribution.stage1}
- Stage 2 (>=140/>=90): ${metrics.stageDistribution.stage2}
- Hypertensive Crisis (>180/>120): ${metrics.stageDistribution.crisis}
- Hypotension (<90/<60): ${metrics.stageDistribution.hypotension}

5. ANOMALY / SURGE EVENTS: ${anomalies.length} detected
${anomalies.slice(0, 3).map((a) => `- ${new Date(a.timestamp).toLocaleDateString()}: ${a.title} - ${a.message}`).join('\n')}
=========================================
`.trim();

    navigator.clipboard.writeText(textSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6">
        {/* Header with Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Physician Consultation Summary Report
              </h2>
              <p className="text-xs text-slate-400">
                AHA-compliant clinical vitals report formatted for medical review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-xl transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 rounded-xl transition shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeframe Selector for Report */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs font-mono-numeric">
          <span className="text-slate-400">Report Window:</span>
          <div className="flex items-center gap-1.5">
            {(['7d', '30d', '90d', 'all'] as TimeframeFilter[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg uppercase font-semibold transition cursor-pointer ${
                  timeframe === tf
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf === 'all' ? 'All Time' : tf}
              </button>
            ))}
          </div>
        </div>

        {/* Printable Report Paper Layout */}
        <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-200 space-y-6 font-mono-numeric text-xs leading-relaxed">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-wider">
                PULSEGUARD TELEMETRY RECORD
              </div>
              <div className="text-[11px] text-slate-400">
                Generated: {new Date().toLocaleString()}
              </div>
            </div>
            <div className="text-right sm:text-right">
              <div className="text-cyan-300 font-semibold">Total Logs: {filteredReadings.length}</div>
              <div className="text-[11px] text-slate-400">Timeframe: {timeframe.toUpperCase()}</div>
            </div>
          </div>

          {/* Core Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Average BP</div>
              <div className="text-xl font-bold text-cyan-300">
                {metrics.avgSys} / {metrics.avgDia}
              </div>
              <div className="text-[10px] text-slate-500">mmHg</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Avg Pulse Rate</div>
              <div className="text-xl font-bold text-amber-300">{metrics.avgPulse}</div>
              <div className="text-[10px] text-slate-500">BPM</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Mean Arterial (MAP)</div>
              <div className="text-xl font-bold text-purple-300">{metrics.avgMap}</div>
              <div className="text-[10px] text-slate-500">mmHg (Target: 70-100)</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Med Adherence</div>
              <div className="text-xl font-bold text-emerald-300">{metrics.medAdherenceRate}%</div>
              <div className="text-[10px] text-slate-500">Recorded Doses</div>
            </div>
          </div>

          {/* Diurnal Breakdown (Morning vs Evening) */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Circadian / Diurnal Pressure Analysis
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-400 font-semibold mb-1">Morning Average (AM):</div>
                <div className="text-lg font-bold text-cyan-300">
                  {morningAvg.avgSys || '—'} / {morningAvg.avgDia || '—'}{' '}
                  <span className="text-xs text-slate-400 font-normal">mmHg</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {morningAvg.count} readings recorded between 4:00 AM - 12:00 PM
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-400 font-semibold mb-1">Evening Average (PM):</div>
                <div className="text-lg font-bold text-purple-300">
                  {eveningAvg.avgSys || '—'} / {eveningAvg.avgDia || '—'}{' '}
                  <span className="text-xs text-slate-400 font-normal">mmHg</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {eveningAvg.count} readings recorded between 12:00 PM - 4:00 AM
                </div>
              </div>
            </div>
          </div>

          {/* AHA Breakdown */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              AHA Stage Distribution Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="text-emerald-300">Optimal / Normal: {metrics.stageDistribution.normal}</div>
              <div className="text-yellow-300">Elevated BP: {metrics.stageDistribution.elevated}</div>
              <div className="text-amber-300">Stage 1 HTN: {metrics.stageDistribution.stage1}</div>
              <div className="text-red-300">Stage 2 HTN: {metrics.stageDistribution.stage2}</div>
              <div className="text-rose-400">Crisis Spikes: {metrics.stageDistribution.crisis}</div>
              <div className="text-sky-300">Hypotension: {metrics.stageDistribution.hypotension}</div>
            </div>
          </div>

          {/* Clinical Anomaly Events if any */}
          {anomalies.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2">
              <h4 className="font-bold text-rose-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Detected Trend Shift Events ({anomalies.length})
              </h4>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {anomalies.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-start gap-2">
                    <span className="text-rose-400">•</span>
                    <span>
                      <strong className="text-white">{new Date(a.timestamp).toLocaleDateString()}:</strong> {a.message}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800 text-center">
            Report generated automatically via PulseGuard Local Telemetry. Not a substitute for formal diagnosis.
          </div>
        </div>
      </div>
    </div>
  );
};
