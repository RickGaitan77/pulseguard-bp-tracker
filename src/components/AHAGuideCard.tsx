import React, { useState } from 'react';
import { ShieldCheck, Info, ChevronDown, ChevronUp, Zap, HelpCircle } from 'lucide-react';

export const AHAGuideCard: React.FC = () => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const stages = [
    {
      name: 'Optimal / Normal',
      rangeSys: '< 120',
      rangeDia: 'and < 80',
      colorBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
      guidance: 'Maintain healthy lifestyle, balanced nutrition, and regular activity.',
    },
    {
      name: 'Elevated BP',
      rangeSys: '120 - 129',
      rangeDia: 'and < 80',
      colorBadge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      glow: 'shadow-[0_0_12px_rgba(234,179,8,0.2)]',
      guidance: 'Early warning zone. Reduce sodium intake and engage in aerobic exercise.',
    },
    {
      name: 'Stage 1 Hypertension',
      rangeSys: '130 - 139',
      rangeDia: 'or 80 - 89',
      colorBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      guidance: 'Lifestyle modifications; clinical evaluation for medication management.',
    },
    {
      name: 'Stage 2 Hypertension',
      rangeSys: '≥ 140',
      rangeDia: 'or ≥ 90',
      colorBadge: 'bg-red-500/20 text-red-300 border-red-500/40',
      glow: 'shadow-[0_0_12px_rgba(239,68,68,0.25)]',
      guidance: 'Prescribed anti-hypertensive medication adherence and frequent monitoring.',
    },
    {
      name: 'Hypertensive Crisis',
      rangeSys: '> 180',
      rangeDia: 'and/or > 120',
      colorBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      glow: 'animate-pulse-crimson',
      guidance: 'Critical emergency risk. Rest 5 min & recheck; seek emergency care if persistent.',
    },
    {
      name: 'Hypotension (Low BP)',
      rangeSys: '< 90',
      rangeDia: 'or < 60',
      colorBadge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      glow: 'shadow-[0_0_12px_rgba(56,189,248,0.2)]',
      guidance: 'Ensure hydration and electrolyte balance; check for orthostatic symptoms.',
    },
  ];

  return (
    <div className="glass-panel rounded-3xl p-5 border-slate-800/90 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono-numeric flex items-center gap-2">
              AHA Clinical Guidelines Reference Chart
              <span className="text-[10px] text-cyan-400 normal-case">
                (American Heart Association Standards)
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Interactive cardiovascular stage thresholds & clinical definitions
            </p>
          </div>
        </div>

        <div className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stages.map((stage) => (
              <div
                key={stage.name}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono-numeric border ${stage.colorBadge} ${stage.glow}`}
                  >
                    {stage.name}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 font-mono-numeric text-xs">
                  <span className="text-slate-400">SYS:</span>
                  <span className="font-bold text-white">{stage.rangeSys}</span>
                  <span className="text-slate-500 mx-1">|</span>
                  <span className="text-slate-400">DIA:</span>
                  <span className="font-bold text-white">{stage.rangeDia}</span>
                  <span className="text-[10px] text-slate-500">mmHg</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-normal">{stage.guidance}</p>
              </div>
            ))}
          </div>

          {/* Clinical Formulas info */}
          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono-numeric text-slate-400">
            <div>
              <span className="text-cyan-300 font-semibold">Mean Arterial Pressure (MAP):</span>{' '}
              <span className="text-slate-300">DIA + ⅓(SYS - DIA)</span>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Normal: 70–100 mmHg (organ perfusion pressure)
              </div>
            </div>
            <div>
              <span className="text-purple-300 font-semibold">Pulse Pressure:</span>{' '}
              <span className="text-slate-300">SYS - DIA</span>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Normal: 40–60 mmHg (arterial stiffness biomarker)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
