import React, { useEffect, useState } from 'react';
import {
  Activity,
  Download,
  FileText,
  Database,
  Plus,
  RefreshCw,
  LayoutDashboard,
  Gauge,
  Layers,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { DashboardVariation } from '../types';

interface HeaderProps {
  currentVariation: DashboardVariation;
  onVariationChange: (variation: DashboardVariation) => void;
  onOpenLogModal: () => void;
  onOpenDoctorModal: () => void;
  onOpenBackupModal: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  totalReadingsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentVariation,
  onVariationChange,
  onOpenLogModal,
  onOpenDoctorModal,
  onOpenBackupModal,
  onExportCSV,
  onResetData,
  totalReadingsCount,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isVariationMenuOpen, setIsVariationMenuOpen] = useState<boolean>(false);

  const variations = [
    {
      id: 'command-center' as DashboardVariation,
      name: 'Variation A: Command Center',
      shortName: 'Command Center',
      tag: 'HUD & Top Waveform',
      icon: LayoutDashboard,
      color: 'text-cyan-400',
      activeBorder: 'border-cyan-500/50 bg-cyan-950/50 text-cyan-300',
    },
    {
      id: 'metric-dials' as DashboardVariation,
      name: 'Variation B: Metric Dials',
      shortName: 'Metric Dials',
      tag: 'Glowing MAP Gauges',
      icon: Gauge,
      color: 'text-purple-400',
      activeBorder: 'border-purple-500/50 bg-purple-950/50 text-purple-300',
    },
    {
      id: 'feed-cards' as DashboardVariation,
      name: 'Variation C: Feed & Cards',
      shortName: 'Feed & Cards',
      tag: 'Cards & Mobile FAB',
      icon: Layers,
      color: 'text-emerald-400',
      activeBorder: 'border-emerald-500/50 bg-emerald-950/50 text-emerald-300',
    },
  ];

  const currentOption = variations.find((v) => v.id === currentVariation) || variations[0];
  const CurrentIcon = currentOption.icon;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }) +
          ' ' +
          now.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-30 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl sticky top-0 px-4 sm:px-6 lg:px-8 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Branding & Pulse Indicator */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white font-mono-numeric">
                  PULSE<span className="text-cyan-400">GUARD</span>
                </h1>
                <span className="px-2 py-0.5 text-[9px] uppercase font-semibold tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 rounded-full">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Cardiovascular Telemetry & Medication Studio
              </p>
            </div>
          </div>

          {/* Clock for mobile */}
          <div className="md:hidden text-right font-mono-numeric text-xs text-cyan-300/80 bg-cyan-950/40 px-2 py-1 rounded-lg border border-cyan-500/20">
            {currentTime}
          </div>
        </div>

        {/* Live UI/UX Layout Variation Switcher (Interactive Preview Control) */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-center">
          {/* Segmented Desktop / Dropdown Control */}
          <div className="relative inline-block text-left w-full sm:w-auto">
            <div className="hidden lg:flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
              {variations.map((v) => {
                const Icon = v.icon;
                const isSelected = currentVariation === v.id;
                return (
                  <button
                    key={v.id}
                    id={`btn-variation-${v.id}`}
                    onClick={() => onVariationChange(v.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono-numeric font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? `${v.activeBorder} shadow-[0_0_12px_rgba(6,182,212,0.2)]`
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? v.color : 'text-slate-500'}`} />
                    <span>{v.shortName}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile / Tablet Dropdown Switcher Button */}
            <div className="lg:hidden w-full">
              <button
                id="btn-variation-dropdown-toggle"
                onClick={() => setIsVariationMenuOpen(!isVariationMenuOpen)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs font-mono-numeric text-slate-200 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              >
                <div className="flex items-center gap-2">
                  <CurrentIcon className={`w-4 h-4 ${currentOption.color}`} />
                  <div className="text-left">
                    <span className="font-bold text-white block leading-tight">{currentOption.name}</span>
                    <span className="text-[10px] text-cyan-400 block leading-tight">{currentOption.tag}</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isVariationMenuOpen && (
                <div className="absolute left-0 mt-2 w-full sm:w-72 rounded-2xl bg-slate-950/95 border border-slate-700/80 shadow-[0_12px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl p-2 z-50 animate-in fade-in">
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-500 font-mono-numeric">
                    Select Layout Variation
                  </div>
                  {variations.map((v) => {
                    const Icon = v.icon;
                    const isSelected = currentVariation === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          onVariationChange(v.id);
                          setIsVariationMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-mono-numeric transition-all cursor-pointer ${
                          isSelected
                            ? `${v.activeBorder}`
                            : 'text-slate-300 hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 text-left">
                          <div className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 ${v.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white">{v.name}</div>
                            <div className="text-[10px] text-slate-400">{v.tag}</div>
                          </div>
                        </div>
                        {isSelected && <span className="text-cyan-400 text-xs font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 w-full md:w-auto">
          {/* Export CSV Button */}
          <button
            id="btn-export-csv"
            onClick={onExportCSV}
            title="Download CSV for Doctor"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-cyan-300 border border-slate-700/60 rounded-xl transition-all hover:border-cyan-500/30 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* Doctor Report */}
          <button
            id="btn-doctor-report"
            onClick={onOpenDoctorModal}
            title="Doctor Consultation Summary"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-purple-300 border border-slate-700/60 rounded-xl transition-all hover:border-purple-500/30 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Doctor Report</span>
          </button>

          {/* Backup & Restore */}
          <button
            id="btn-backup-restore"
            onClick={onOpenBackupModal}
            title="Backup & Restore JSON Data"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-cyan-300 border border-slate-700/60 rounded-xl transition-all hover:border-cyan-500/30 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          {/* Reset Demo Data */}
          <button
            id="btn-reset-sample"
            onClick={onResetData}
            title="Reset to sample dataset"
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

