import React, { useState, useEffect } from 'react';
import { Plus, Check, Pill, Clock, Activity, Heart, Info, Sparkles, X, ChevronDown } from 'lucide-react';
import { BPReading, ArmPosition, BodyPosition } from '../types';
import { classifyAHA } from '../utils/clinicalCalculations';
import { DEFAULT_PRESET_MEDICATIONS } from '../utils/sampleData';

interface DataLoggingCardProps {
  onSaveReading: (reading: Omit<BPReading, 'id'>) => void;
  editingReading?: BPReading | null;
  onCancelEdit?: () => void;
  isModal?: boolean;
}

export const DataLoggingCard: React.FC<DataLoggingCardProps> = ({
  onSaveReading,
  editingReading,
  onCancelEdit,
  isModal = false,
}) => {
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [pulse, setPulse] = useState<number>(72);
  const [timestamp, setTimestamp] = useState<string>('');
  const [arm, setArm] = useState<ArmPosition>('left');
  const [position, setPosition] = useState<BodyPosition>('sitting');
  const [medTaken, setMedTaken] = useState<boolean>(true);
  const [selectedMeds, setSelectedMeds] = useState<string[]>(['Lisinopril 10mg']);
  const [customMedInput, setCustomMedInput] = useState<string>('');
  const [availableMeds, setAvailableMeds] = useState<string[]>(DEFAULT_PRESET_MEDICATIONS);
  const [notes, setNotes] = useState<string>('');
  const [savedToast, setSavedToast] = useState<boolean>(false);

  // Initialize or update fields when editing
  useEffect(() => {
    if (editingReading) {
      setSystolic(editingReading.systolic);
      setDiastolic(editingReading.diastolic);
      setPulse(editingReading.pulse);
      setTimestamp(formatDatetimeForInput(new Date(editingReading.timestamp)));
      setArm(editingReading.arm);
      setPosition(editingReading.position);
      setMedTaken(editingReading.medTaken);
      setSelectedMeds(editingReading.medNames || []);
      setNotes(editingReading.notes || '');
    } else {
      setTimestamp(formatDatetimeForInput(new Date()));
    }
  }, [editingReading]);

  function formatDatetimeForInput(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const liveClassification = classifyAHA(systolic, diastolic);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (systolic < 50 || systolic > 300 || diastolic < 30 || diastolic > 200 || pulse < 30 || pulse > 250) {
      return;
    }

    const isoTimestamp = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

    onSaveReading({
      timestamp: isoTimestamp,
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      pulse: Number(pulse),
      arm,
      position,
      medTaken,
      medNames: medTaken ? selectedMeds : [],
      notes: notes.trim(),
    });

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);

    if (!editingReading) {
      // Reset some fields for next entry
      setTimestamp(formatDatetimeForInput(new Date()));
      setNotes('');
    }
  };

  const toggleMed = (med: string) => {
    if (selectedMeds.includes(med)) {
      setSelectedMeds(selectedMeds.filter((m) => m !== med));
    } else {
      setSelectedMeds([...selectedMeds, med]);
    }
  };

  const addCustomMed = () => {
    if (customMedInput.trim()) {
      const newMed = customMedInput.trim();
      if (!availableMeds.includes(newMed)) {
        setAvailableMeds([...availableMeds, newMed]);
      }
      if (!selectedMeds.includes(newMed)) {
        setSelectedMeds([...selectedMeds, newMed]);
      }
      setCustomMedInput('');
    }
  };

  // Quick adjustment steppers
  const adjustValue = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    delta: number,
    min: number,
    max: number
  ) => {
    setter((prev) => Math.min(max, Math.max(min, prev + delta)));
  };

  return (
    <div
      className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-300 ${
        isModal
          ? 'bg-slate-900/95 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)]'
          : 'glass-panel border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
      }`}
    >
      {/* Background ambient corner glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Header with Title and Edit Mode Status */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              {editingReading ? 'Edit Blood Pressure Reading' : 'Log Blood Pressure & Vitals'}
              {editingReading && (
                <span className="px-2 py-0.5 text-[10px] font-mono-numeric font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md">
                  EDITING MODE
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Real-time American Heart Association telemetry calculation
            </p>
          </div>
        </div>

        {editingReading && onCancelEdit && (
          <button
            onClick={onCancelEdit}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Primary Triple Inputs: Systolic / Diastolic / Pulse */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Systolic */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-cyan-500/25 relative group focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="input-sys" className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Systolic
              </label>
              <span className="text-[10px] text-slate-400 font-mono-numeric">mmHg (Top)</span>
            </div>
            <div className="flex items-center justify-between">
              <input
                id="input-sys"
                type="number"
                min="50"
                max="260"
                value={systolic}
                onChange={(e) => setSystolic(Number(e.target.value))}
                className="w-24 text-3xl font-extrabold font-mono-numeric text-white bg-transparent border-none focus:outline-none p-0 tracking-tight"
                required
              />
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => adjustValue(setSystolic, 1, 50, 260)}
                  className="px-2 py-0.5 text-xs font-bold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-800/60 rounded border border-cyan-500/30 cursor-pointer"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => adjustValue(setSystolic, -1, 50, 260)}
                  className="px-2 py-0.5 text-xs font-bold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-800/60 rounded border border-cyan-500/30 cursor-pointer"
                >
                  -
                </button>
              </div>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">Target: &lt; 120 mmHg</div>
          </div>

          {/* Diastolic */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-purple-500/25 relative group focus-within:border-purple-400 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="input-dia" className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Diastolic
              </label>
              <span className="text-[10px] text-slate-400 font-mono-numeric">mmHg (Bottom)</span>
            </div>
            <div className="flex items-center justify-between">
              <input
                id="input-dia"
                type="number"
                min="30"
                max="180"
                value={diastolic}
                onChange={(e) => setDiastolic(Number(e.target.value))}
                className="w-24 text-3xl font-extrabold font-mono-numeric text-white bg-transparent border-none focus:outline-none p-0 tracking-tight"
                required
              />
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => adjustValue(setDiastolic, 1, 30, 180)}
                  className="px-2 py-0.5 text-xs font-bold text-purple-300 bg-purple-950/80 hover:bg-purple-800/60 rounded border border-purple-500/30 cursor-pointer"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => adjustValue(setDiastolic, -1, 30, 180)}
                  className="px-2 py-0.5 text-xs font-bold text-purple-300 bg-purple-950/80 hover:bg-purple-800/60 rounded border border-purple-500/30 cursor-pointer"
                >
                  -
                </button>
              </div>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">Target: &lt; 80 mmHg</div>
          </div>

          {/* Pulse */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-amber-500/25 relative group focus-within:border-amber-400 focus-within:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="input-pulse" className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-amber-400" /> Pulse
              </label>
              <span className="text-[10px] text-slate-400 font-mono-numeric">BPM</span>
            </div>
            <div className="flex items-center justify-between">
              <input
                id="input-pulse"
                type="number"
                min="35"
                max="220"
                value={pulse}
                onChange={(e) => setPulse(Number(e.target.value))}
                className="w-24 text-3xl font-extrabold font-mono-numeric text-white bg-transparent border-none focus:outline-none p-0 tracking-tight"
                required
              />
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => adjustValue(setPulse, 1, 35, 220)}
                  className="px-2 py-0.5 text-xs font-bold text-amber-300 bg-amber-950/80 hover:bg-amber-800/60 rounded border border-amber-500/30 cursor-pointer"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => adjustValue(setPulse, -1, 35, 220)}
                  className="px-2 py-0.5 text-xs font-bold text-amber-300 bg-amber-950/80 hover:bg-amber-800/60 rounded border border-amber-500/30 cursor-pointer"
                >
                  -
                </button>
              </div>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">Resting: 60 - 100 BPM</div>
          </div>
        </div>

        {/* Real-Time AHA Classification & Clinical Engine Preview */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            liveClassification.stage === 'crisis'
              ? 'bg-rose-950/40 border-rose-500/60 animate-pulse-crimson'
              : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-400 uppercase font-mono-numeric font-medium">AHA Classification:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${liveClassification.badgeClass} ${liveClassification.glowClass}`}
              >
                {liveClassification.stageLabel}
              </span>
            </div>

            {/* Calculated Clinical Metrics */}
            <div className="flex items-center gap-4 text-xs font-mono-numeric">
              <div className="flex items-center gap-1.5" title="Pulse Pressure = Systolic - Diastolic (Target: 40-60 mmHg)">
                <span className="text-slate-400">Pulse Pressure:</span>
                <span className="font-bold text-cyan-300">{liveClassification.pulsePressure} mmHg</span>
              </div>
              <div className="flex items-center gap-1.5" title="Mean Arterial Pressure = Diastolic + 1/3*(Systolic - Diastolic) (Target: 70-100 mmHg)">
                <span className="text-slate-400">MAP:</span>
                <span className="font-bold text-purple-300">{liveClassification.map} mmHg</span>
              </div>
            </div>
          </div>

          <div className="mt-2.5 flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
            <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-slate-200">{liveClassification.description}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{liveClassification.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Measurement Context & Date/Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Date & Time */}
          <div className="space-y-1.5">
            <label htmlFor="input-timestamp" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Date & Time
            </label>
            <input
              id="input-timestamp"
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono-numeric text-slate-200 focus:text-white"
              required
            />
          </div>

          {/* Arm Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Measurement Arm</label>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800">
              <button
                type="button"
                onClick={() => setArm('left')}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  arm === 'left'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Left Arm
              </button>
              <button
                type="button"
                onClick={() => setArm('right')}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  arm === 'right'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Right Arm
              </button>
            </div>
          </div>

          {/* Body Position */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Body Posture</label>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-950/70 border border-slate-800">
              {(['sitting', 'standing', 'lying'] as BodyPosition[]).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(pos)}
                  className={`py-1.5 text-[11px] font-medium rounded-lg capitalize transition-all cursor-pointer ${
                    position === pos
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Medication Tracking Section */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Medication Adherence
                </h4>
                <p className="text-[11px] text-slate-400">
                  Record whether scheduled BP prescriptions were taken
                </p>
              </div>
            </div>

            {/* Quick Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={medTaken}
                onChange={(e) => setMedTaken(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 peer-checked:shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
              <span className="ml-2 text-xs font-mono-numeric font-bold text-cyan-300">
                {medTaken ? 'TAKEN' : 'MISSED / NONE'}
              </span>
            </label>
          </div>

          {/* Active Medication Pill Tags */}
          {medTaken && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="text-[11px] text-slate-400">Select active medications for this entry:</div>
              <div className="flex flex-wrap gap-1.5">
                {availableMeds.map((med) => {
                  const isSelected = selectedMeds.includes(med);
                  return (
                    <button
                      key={med}
                      type="button"
                      onClick={() => toggleMed(med)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                          : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                      {med}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Med Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add another medication (e.g., Valsartan 80mg)..."
                  value={customMedInput}
                  onChange={(e) => setCustomMedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomMed();
                    }
                  }}
                  className="glass-input flex-1 px-3 py-1.5 rounded-xl text-xs text-slate-200 placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={addCustomMed}
                  className="px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 rounded-xl transition cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Optional Notes */}
        <div className="space-y-1.5">
          <label htmlFor="input-notes" className="text-xs font-medium text-slate-300">
            Clinical Notes & Observations (Optional)
          </label>
          <input
            id="input-notes"
            type="text"
            placeholder="e.g., Fasting morning reading, felt slightly stressed, drank 2 coffees..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="glass-input w-full px-3.5 py-2 rounded-xl text-xs text-slate-200 placeholder:text-slate-500"
          />
        </div>

        {/* Action Button & Confirmation Toast */}
        <div className="flex items-center justify-between pt-2">
          {savedToast ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 animate-pulse">
              <Check className="w-4 h-4" /> Reading securely saved to database!
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">
              Persisted instantly in local browser storage
            </span>
          )}

          <div className="flex items-center gap-2.5">
            {editingReading && onCancelEdit && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-700 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              id="btn-save-reading"
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all transform hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{editingReading ? 'Update Reading' : 'Save Reading'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
