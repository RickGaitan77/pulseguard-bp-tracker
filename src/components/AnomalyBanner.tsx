import React, { useState } from 'react';
import { AlertTriangle, AlertOctagon, TrendingUp, ArrowDownRight, ArrowUpRight, ShieldAlert, X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { AnomalyAlert } from '../types';

interface AnomalyBannerProps {
  alerts: AnomalyAlert[];
  onSelectReading?: (readingId: string) => void;
}

export const AnomalyBanner: React.FC<AnomalyBannerProps> = ({ alerts, onSelectReading }) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  const activeAlerts = alerts.filter((a) => !dismissedIds.includes(a.id));

  if (activeAlerts.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between border-emerald-500/20 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-300">
              Cardiovascular Telemetry Stable
            </h4>
            <p className="text-xs text-slate-400">
              No rapid surges, sudden drops, or upward drift patterns detected in recent measurements.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          Baseline Nominal
        </span>
      </div>
    );
  }

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => [...prev, id]);
  };

  const getAlertConfig = (type: AnomalyAlert['type'], severity: AnomalyAlert['severity']) => {
    switch (type) {
      case 'crisis':
        return {
          icon: AlertOctagon,
          bgClass: 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.25)]',
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          iconColor: 'text-rose-400',
          titleColor: 'text-rose-200',
        };
      case 'surge':
        return {
          icon: ArrowUpRight,
          bgClass: 'bg-amber-950/40 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)]',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          iconColor: 'text-amber-400',
          titleColor: 'text-amber-200',
        };
      case 'drop':
      case 'hypotension':
        return {
          icon: ArrowDownRight,
          bgClass: 'bg-sky-950/40 border-sky-500/40 shadow-[0_0_25px_rgba(56,189,248,0.15)]',
          badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          iconColor: 'text-sky-400',
          titleColor: 'text-sky-200',
        };
      case 'drift':
      default:
        return {
          icon: TrendingUp,
          bgClass: 'bg-orange-950/40 border-orange-500/40 shadow-[0_0_25px_rgba(249,115,22,0.15)]',
          badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          iconColor: 'text-orange-400',
          titleColor: 'text-orange-200',
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono-numeric">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>Real-Time Anomaly & Rapid Shift Intelligence ({activeAlerts.length})</span>
        </div>
        {activeAlerts.length > 1 && (
          <button
            onClick={() => setDismissedIds(alerts.map((a) => a.id))}
            className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            Dismiss all alerts
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activeAlerts.map((alert) => {
          const config = getAlertConfig(alert.type, alert.severity);
          const Icon = config.icon;
          const isExpanded = expandedAlertId === alert.id;

          return (
            <div
              key={alert.id}
              onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
              className={`relative rounded-2xl p-4 backdrop-blur-xl border transition-all cursor-pointer ${config.bgClass} hover:border-opacity-80`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border ${config.badgeClass} mt-0.5`}>
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className={`text-sm font-bold ${config.titleColor}`}>
                        {alert.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono-numeric uppercase font-bold border ${config.badgeClass}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono-numeric">
                      <span>{new Date(alert.timestamp).toLocaleDateString()} at {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {onSelectReading && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectReading(alert.readingId);
                          }}
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                        >
                          View In Log <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDismiss(alert.id, e)}
                  title="Dismiss alert"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
