import React, { useState, useEffect, useRef } from 'react';
import { BPReading, DashboardVariation, TimeframeFilter } from './types';
import { detectAnomalies, exportToCSV } from './utils/clinicalCalculations';
import { INITIAL_SAMPLE_READINGS } from './utils/sampleData';
import { Header } from './components/Header';
import { AnomalyBanner } from './components/AnomalyBanner';
import { CommandCenterView } from './components/CommandCenterView';
import { MetricFocusedView } from './components/MetricFocusedView';
import { FeedAndCardsView } from './components/FeedAndCardsView';
import { DataLoggingCard } from './components/DataLoggingCard';
import { DoctorReportModal } from './components/DoctorReportModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'pulseguard_cardio_telemetry_v1';
const VARIATION_STORAGE_KEY = 'pulseguard_dashboard_variation_v1';

export default function App() {
  // Initialize readings from localStorage or sample fallback
  const [readings, setReadings] = useState<BPReading[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
    }
    return INITIAL_SAMPLE_READINGS;
  });

  // Selected Dashboard Layout Variation state
  const [variation, setVariation] = useState<DashboardVariation>(() => {
    try {
      const stored = localStorage.getItem(VARIATION_STORAGE_KEY) as DashboardVariation;
      if (stored && ['command-center', 'metric-dials', 'feed-cards'].includes(stored)) {
        return stored;
      }
    } catch (e) {
      // ignore
    }
    return 'command-center';
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeFilter>('30d');
  const [editingReading, setEditingReading] = useState<BPReading | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [highlightedReadingId, setHighlightedReadingId] = useState<string | null>(null);

  const logTableRef = useRef<HTMLDivElement>(null);
  const logFormRef = useRef<HTMLDivElement>(null);

  // Sync readings to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [readings]);

  // Sync dashboard variation preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(VARIATION_STORAGE_KEY, variation);
    } catch (e) {
      console.error('Failed to save variation preference:', e);
    }
  }, [variation]);

  // Compute anomaly alerts dynamically
  const anomalies = detectAnomalies(readings);

  // Handlers
  const handleSaveReading = (readingData: Omit<BPReading, 'id'>) => {
    if (editingReading) {
      // Update existing
      setReadings((prev) =>
        prev.map((r) =>
          r.id === editingReading.id ? { ...readingData, id: editingReading.id } : r
        )
      );
      setEditingReading(null);
      setIsLogModalOpen(false);
    } else {
      // Create new
      const newReading: BPReading = {
        ...readingData,
        id: 'rd-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      };
      setReadings((prev) => [newReading, ...prev]);
      setIsLogModalOpen(false);

      // Trigger celebratory confetti if reading is optimal normal
      if (readingData.systolic < 120 && readingData.diastolic < 80) {
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#06b6d4', '#10b981', '#a855f7'],
          });
        } catch (err) {
          // ignore
        }
      }
    }
  };

  const handleEditReading = (reading: BPReading) => {
    setEditingReading(reading);
    if (variation === 'feed-cards') {
      setIsLogModalOpen(true);
    } else if (logFormRef.current) {
      logFormRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      setIsLogModalOpen(true);
    }
  };

  const handleDeleteReading = (id: string) => {
    setReadings((prev) => prev.filter((r) => r.id !== id));
    if (editingReading?.id === id) {
      setEditingReading(null);
    }
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(readings);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulseguard-doctor-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreReadings = (newReadings: BPReading[]) => {
    setReadings(newReadings);
  };

  const handleResetToSample = () => {
    setReadings(INITIAL_SAMPLE_READINGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_READINGS));
  };

  const handleSelectReadingFromAlert = (readingId: string) => {
    setHighlightedReadingId(readingId);
    if (logTableRef.current) {
      logTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    // Remove highlight after 4 seconds
    setTimeout(() => {
      setHighlightedReadingId(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Futuristic Ambient Glowing Mesh Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-left Cyan Glow */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[130px] animate-float-ambient" />
        {/* Top-right Purple Glow */}
        <div className="absolute top-20 right-[-100px] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
        {/* Center-bottom Emerald Glow */}
        <div className="absolute -bottom-20 left-1/3 w-[600px] h-[500px] rounded-full bg-emerald-600/8 blur-[140px]" />
        {/* Subtle grid mesh overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Top Telemetry Header with Layout Variation Switcher */}
      <Header
        currentVariation={variation}
        onVariationChange={setVariation}
        onOpenLogModal={() => {
          setEditingReading(null);
          if (variation === 'feed-cards') {
            setIsLogModalOpen(true);
          } else if (logFormRef.current) {
            logFormRef.current.scrollIntoView({ behavior: 'smooth' });
          } else {
            setIsLogModalOpen(true);
          }
        }}
        onOpenDoctorModal={() => setIsDoctorModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onExportCSV={handleExportCSV}
        onResetData={() => {
          if (window.confirm('Reset data to the pre-loaded 30-day cardiovascular dataset?')) {
            handleResetToSample();
          }
        }}
        totalReadingsCount={readings.length}
      />

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Trend Anomaly & Rapid Shift Warning Engine Alert Banner */}
        <AnomalyBanner alerts={anomalies} onSelectReading={handleSelectReadingFromAlert} />

        {/* Dynamic Variation Rendering */}
        {variation === 'command-center' && (
          <CommandCenterView
            readings={readings}
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={setSelectedTimeframe}
            onSaveReading={handleSaveReading}
            editingReading={editingReading}
            onCancelEdit={() => setEditingReading(null)}
            onEditReading={handleEditReading}
            onDeleteReading={handleDeleteReading}
            highlightedReadingId={highlightedReadingId}
            onOpenFullLogModal={() => setIsLogModalOpen(true)}
            logFormRef={logFormRef}
            logTableRef={logTableRef}
          />
        )}

        {variation === 'metric-dials' && (
          <MetricFocusedView
            readings={readings}
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={setSelectedTimeframe}
            onSaveReading={handleSaveReading}
            editingReading={editingReading}
            onCancelEdit={() => setEditingReading(null)}
            onEditReading={handleEditReading}
            onDeleteReading={handleDeleteReading}
            highlightedReadingId={highlightedReadingId}
            logFormRef={logFormRef}
            logTableRef={logTableRef}
          />
        )}

        {variation === 'feed-cards' && (
          <FeedAndCardsView
            readings={readings}
            onOpenLogModal={() => {
              setEditingReading(null);
              setIsLogModalOpen(true);
            }}
            onEditReading={handleEditReading}
            onDeleteReading={handleDeleteReading}
            highlightedReadingId={highlightedReadingId}
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={setSelectedTimeframe}
          />
        )}

        {/* Footer info & clinical disclaimer */}
        <footer className="pt-6 pb-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono-numeric">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-500/80" />
            <span>PulseGuard Vitals Telemetry • Local Offline Engine</span>
          </div>
          <div>
            Data is stored strictly on this device in browser <code className="text-slate-400">localStorage</code>.
          </div>
        </footer>
      </main>

      {/* Quick Record Modal if opened via mobile / CTA / Feed FAB */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl">
            <DataLoggingCard
              onSaveReading={handleSaveReading}
              editingReading={editingReading}
              onCancelEdit={() => {
                setEditingReading(null);
                setIsLogModalOpen(false);
              }}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* Doctor Consultation Report Modal */}
      <DoctorReportModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        readings={readings}
      />

      {/* Backup & Restore Modal */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        readings={readings}
        onRestoreReadings={handleRestoreReadings}
        onResetToSample={handleResetToSample}
      />
    </div>
  );
}

