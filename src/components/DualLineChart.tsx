import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { BPReading, TimeframeFilter } from '../types';
import { classifyAHA, filterReadingsByTimeframe } from '../utils/clinicalCalculations';
import { Calendar, Eye, Heart, Pill, Sparkles, TrendingUp } from 'lucide-react';

Chart.register(...registerables);

interface DualLineChartProps {
  readings: BPReading[];
  selectedTimeframe: TimeframeFilter;
  onTimeframeChange: (tf: TimeframeFilter) => void;
  onSelectReading?: (reading: BPReading) => void;
}

export const DualLineChart: React.FC<DualLineChartProps> = ({
  readings,
  selectedTimeframe,
  onTimeframeChange,
  onSelectReading,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [showPulse, setShowPulse] = useState<boolean>(true);

  // Filter and sort readings chronologically (oldest to newest for timeline)
  const filteredReadings = [...filterReadingsByTimeframe(readings, selectedTimeframe)].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy previous chart instance before re-creating
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    if (filteredReadings.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Gradient for Systolic (Cyan)
    const cyanGradient = ctx.createLinearGradient(0, 0, 0, 300);
    cyanGradient.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
    cyanGradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    // Gradient for Diastolic (Purple)
    const purpleGradient = ctx.createLinearGradient(0, 0, 0, 300);
    purpleGradient.addColorStop(0, 'rgba(192, 132, 252, 0.25)');
    purpleGradient.addColorStop(1, 'rgba(192, 132, 252, 0.0)');

    const labels = filteredReadings.map((r) => {
      const d = new Date(r.timestamp);
      if (selectedTimeframe === '7d') {
        return (
          d.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' }) +
          ' ' +
          d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
      }
      return (
        d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
        ' ' +
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    });

    const datasets: any[] = [
      {
        label: 'Systolic (mmHg)',
        data: filteredReadings.map((r) => r.systolic),
        borderColor: '#06b6d4',
        backgroundColor: cyanGradient,
        borderWidth: 3,
        pointBackgroundColor: filteredReadings.map((r) => {
          const stage = classifyAHA(r.systolic, r.diastolic).stage;
          if (stage === 'crisis') return '#f43f5e';
          if (stage === 'stage2') return '#ef4444';
          if (stage === 'stage1') return '#f59e0b';
          if (stage === 'elevated') return '#eab308';
          return '#06b6d4';
        }),
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.35,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Diastolic (mmHg)',
        data: filteredReadings.map((r) => r.diastolic),
        borderColor: '#c084fc',
        backgroundColor: purpleGradient,
        borderWidth: 3,
        pointBackgroundColor: '#c084fc',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.35,
        fill: true,
        yAxisID: 'y',
      },
    ];

    if (showPulse) {
      datasets.push({
        label: 'Pulse (BPM)',
        data: filteredReadings.map((r) => r.pulse),
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        borderWidth: 1.8,
        borderDash: [4, 4],
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 1.5,
        pointRadius: 3.5,
        pointHoverRadius: 6,
        tension: 0.3,
        yAxisID: 'yPulse',
      });
    }

    const scales: any = {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: 'JetBrains Mono',
            size: 10,
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        position: 'left',
        min: 40,
        max: 200,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: 'JetBrains Mono',
            size: 11,
          },
          stepSize: 20,
          callback: (value: any) => `${value} mmHg`,
        },
      },
    };

    if (showPulse) {
      scales.yPulse = {
        position: 'right',
        min: 40,
        max: 160,
        grid: {
          display: false,
        },
        ticks: {
          color: '#f59e0b',
          font: {
            family: 'JetBrains Mono',
            size: 10,
          },
          stepSize: 20,
          callback: (value: any) => `${value} bpm`,
        },
      };
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            titleColor: '#38bdf8',
            bodyColor: '#f1f5f9',
            borderColor: 'rgba(56, 189, 248, 0.3)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12,
            titleFont: {
              family: 'Plus Jakarta Sans',
              size: 13,
              weight: 'bold',
            },
            bodyFont: {
              family: 'JetBrains Mono',
              size: 12,
            },
            callbacks: {
              afterTitle: (items) => {
                const index = items[0].dataIndex;
                const reading = filteredReadings[index];
                if (!reading) return '';
                const classification = classifyAHA(reading.systolic, reading.diastolic);
                return `AHA Status: ${classification.stageLabel}`;
              },
              afterBody: (items) => {
                const index = items[0].dataIndex;
                const reading = filteredReadings[index];
                if (!reading) return [];
                const lines = [
                  `MAP: ${Math.round((reading.diastolic + (reading.systolic - reading.diastolic) / 3) * 10) / 10} mmHg`,
                  `Pulse Pressure: ${reading.systolic - reading.diastolic} mmHg`,
                  `Arm: ${reading.arm.toUpperCase()} (${reading.position})`,
                  `Medication: ${reading.medTaken ? '✓ Taken' : '✗ Not taken'}`,
                ];
                if (reading.notes) {
                  lines.push(`Notes: "${reading.notes.slice(0, 35)}${reading.notes.length > 35 ? '...' : ''}"`);
                }
                return lines;
              },
            },
          },
        },
        scales,
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [filteredReadings, showPulse, selectedTimeframe]);

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-4">
      {/* Top Bar: Title, Controls, Timeframe Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Dual-Line Cardiovascular Trending Timeline
              </h3>
              <p className="text-xs text-slate-400">
                Continuous Systolic & Diastolic dynamics plotted with clinical target bands
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800">
            {(['7d', '30d', '90d', 'all'] as TimeframeFilter[]).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-3 py-1 text-xs font-mono-numeric font-semibold rounded-lg uppercase transition-all cursor-pointer ${
                  selectedTimeframe === tf
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf === 'all' ? 'All Time' : tf.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Pulse Overlay Toggle */}
          <button
            onClick={() => setShowPulse(!showPulse)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
              showPulse
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Pulse BPM</span>
          </button>
        </div>
      </div>

      {/* Visual Chart Legend & Target Zone Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          {/* Systolic indicator */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
            <span className="font-mono-numeric text-slate-200 font-bold">Systolic (mmHg)</span>
          </div>

          {/* Diastolic indicator */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]"></span>
            <span className="font-mono-numeric text-slate-200 font-bold">Diastolic (mmHg)</span>
          </div>

          {/* Pulse indicator */}
          {showPulse && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></span>
              <span className="font-mono-numeric text-slate-300">Pulse (BPM)</span>
            </div>
          )}
        </div>

        {/* Clinical target note */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono-numeric text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Optimal Target Baseline: 80 - 120 mmHg</span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative h-72 sm:h-80 w-full pt-2">
        {filteredReadings.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Calendar className="w-8 h-8 text-slate-500" />
            <p className="text-sm font-medium">No readings found for selected timeframe.</p>
            <p className="text-xs text-slate-500">Record a new blood pressure measurement to see timeline.</p>
          </div>
        ) : (
          <canvas ref={canvasRef} className="w-full h-full" />
        )}
      </div>

      {/* Bottom Insights Footer */}
      {filteredReadings.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono-numeric">
          <span>{filteredReadings.length} data points logged in this window</span>
          <span className="text-cyan-400/80">Hover/tap points for complete cardiovascular breakdown</span>
        </div>
      )}
    </div>
  );
};

