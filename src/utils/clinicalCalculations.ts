import { AHAStage, AnomalyAlert, BPReading, ClinicalMetrics, MetricSummary } from '../types';

/**
 * Calculates Pulse Pressure: Systolic - Diastolic (mmHg)
 * Normal range: 40-60 mmHg
 */
export function calculatePulsePressure(systolic: number, diastolic: number): number {
  return Math.round((systolic - diastolic) * 10) / 10;
}

/**
 * Calculates Mean Arterial Pressure (MAP): DIA + 1/3*(SYS - DIA)
 * Normal range: 70 - 100 mmHg
 */
export function calculateMAP(systolic: number, diastolic: number): number {
  const map = diastolic + (systolic - diastolic) / 3;
  return Math.round(map * 10) / 10;
}

/**
 * Classifies blood pressure according to American Heart Association (AHA) guidelines + Hypotension
 */
export function classifyAHA(systolic: number, diastolic: number): ClinicalMetrics {
  const pulsePressure = calculatePulsePressure(systolic, diastolic);
  const map = calculateMAP(systolic, diastolic);

  // Hypertensive Crisis: > 180 and/or > 120
  if (systolic > 180 || diastolic > 120) {
    return {
      stage: 'crisis',
      stageLabel: 'Hypertensive Crisis',
      pulsePressure,
      map,
      colorClass: 'text-rose-400',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      glowClass: 'animate-pulse-crimson',
      description: 'Critical cardiovascular emergency risk. Immediate medical attention recommended if persistent.',
      recommendation: 'Rest for 5 minutes and re-test. If still >180/>120, contact emergency medical services or your physician immediately.',
    };
  }

  // Hypotension: < 90 or < 60
  if (systolic < 90 || diastolic < 60) {
    return {
      stage: 'hypotension',
      stageLabel: 'Hypotension (Low BP)',
      pulsePressure,
      map,
      colorClass: 'text-sky-400',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      glowClass: 'shadow-[0_0_15px_rgba(56,189,248,0.3)]',
      description: 'Blood pressure is below standard clinical baseline. Check for dizziness, fatigue, or dehydration.',
      recommendation: 'Stay hydrated, avoid sudden standing postures, and report to your doctor if symptoms occur.',
    };
  }

  // Stage 2: >= 140 or >= 90
  if (systolic >= 140 || diastolic >= 90) {
    return {
      stage: 'stage2',
      stageLabel: 'Hypertension Stage 2',
      pulsePressure,
      map,
      colorClass: 'text-red-400',
      badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
      glowClass: 'shadow-[0_0_15px_rgba(239,68,68,0.35)]',
      description: 'Significantly elevated pressure requiring active lifestyle modification and medication review.',
      recommendation: 'Adhere strictly to prescribed medications. Maintain sodium restriction and log morning/evening readings.',
    };
  }

  // Stage 1: 130-139 or 80-89
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      stage: 'stage1',
      stageLabel: 'Hypertension Stage 1',
      pulsePressure,
      map,
      colorClass: 'text-amber-400',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      glowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      description: 'Moderate pressure elevation. Early intervention through nutrition and cardio habits recommended.',
      recommendation: 'Evaluate stress levels, physical activity, and dietary sodium. Monitor trend over consecutive days.',
    };
  }

  // Elevated: 120-129 and < 80
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      stage: 'elevated',
      stageLabel: 'Elevated BP',
      pulsePressure,
      map,
      colorClass: 'text-yellow-300',
      badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      glowClass: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]',
      description: 'Systolic is slightly elevated while diastolic remains normal. Early warning threshold.',
      recommendation: 'Focus on heart-healthy habits, stress reduction, and consistent sleep hygiene to prevent progression.',
    };
  }

  // Normal: < 120 and < 80
  return {
    stage: 'normal',
    stageLabel: 'Optimal / Normal',
    pulsePressure,
    map,
    colorClass: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    description: 'Optimal cardiovascular parameters within the American Heart Association target zone.',
    recommendation: 'Excellent maintenance! Continue regular physical activity, balanced diet, and steady routine.',
  };
}

/**
 * Evaluates readings for trend anomalies, rapid shifts, upward drift, and crisis alerts
 */
export function detectAnomalies(readings: BPReading[]): AnomalyAlert[] {
  if (!readings || readings.length === 0) return [];

  // Sort chronological (oldest to newest)
  const sorted = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const alerts: AnomalyAlert[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = i > 0 ? sorted[i - 1] : null;

    // 1. Hypertensive Crisis Alert
    if (current.systolic > 180 || current.diastolic > 120) {
      alerts.push({
        id: `crisis-${current.id}`,
        type: 'crisis',
        title: 'CRITICAL: Hypertensive Crisis Detected',
        message: `Reading on ${new Date(current.timestamp).toLocaleDateString()} reached ${current.systolic}/${current.diastolic} mmHg. Exceeds clinical safety threshold.`,
        severity: 'critical',
        readingId: current.id,
        timestamp: current.timestamp,
        deltaSys: prev ? current.systolic - prev.systolic : undefined,
      });
    }

    // 2. Hypotension Alert
    if (current.systolic < 90 || current.diastolic < 60) {
      alerts.push({
        id: `hypo-${current.id}`,
        type: 'hypotension',
        title: 'Hypotension Warning (< 90/60 mmHg)',
        message: `Low pressure recorded (${current.systolic}/${current.diastolic} mmHg). Ensure adequate hydration and monitor for orthostatic lightheadedness.`,
        severity: 'warning',
        readingId: current.id,
        timestamp: current.timestamp,
      });
    }

    if (prev) {
      const timeDiffHours =
        (new Date(current.timestamp).getTime() - new Date(prev.timestamp).getTime()) /
        (1000 * 60 * 60);

      const deltaSys = current.systolic - prev.systolic;
      const deltaDia = current.diastolic - prev.diastolic;

      // Only check rapid shifts within a reasonable timeframe (e.g. 72 hours)
      if (timeDiffHours <= 72) {
        // 3. Rapid Surge: Sys >= 20 or Dia >= 10
        if (deltaSys >= 20 || deltaDia >= 10) {
          alerts.push({
            id: `surge-${current.id}`,
            type: 'surge',
            title: 'Rapid Systolic/Diastolic Surge',
            message: `Blood pressure spiked by +${deltaSys} mmHg SYS / +${deltaDia} mmHg DIA compared to previous reading (${prev.systolic}/${prev.diastolic} → ${current.systolic}/${current.diastolic}).`,
            severity: deltaSys >= 30 ? 'danger' : 'warning',
            readingId: current.id,
            timestamp: current.timestamp,
            deltaSys,
            deltaDia,
          });
        }

        // 4. Rapid Drop: Sys drops >= 20
        if (deltaSys <= -20) {
          alerts.push({
            id: `drop-${current.id}`,
            type: 'drop',
            title: 'Rapid Pressure Drop Detected',
            message: `Systolic dropped sharply by ${Math.abs(deltaSys)} mmHg (${prev.systolic} → ${current.systolic} mmHg). Watch for fatigue, dizziness, or medication interaction.`,
            severity: 'warning',
            readingId: current.id,
            timestamp: current.timestamp,
            deltaSys,
          });
        }
      }
    }

    // 5. Upward Drift: 3 or more consecutive readings showing escalating trend
    if (i >= 2) {
      const r0 = sorted[i - 2];
      const r1 = sorted[i - 1];
      const r2 = sorted[i];

      const isConsecutiveSysUp = r2.systolic > r1.systolic && r1.systolic > r0.systolic;
      const isConsecutiveDiaUp = r2.diastolic > r1.diastolic && r1.diastolic > r0.diastolic;

      if ((isConsecutiveSysUp || isConsecutiveDiaUp) && r2.systolic >= 130) {
        alerts.push({
          id: `drift-${current.id}`,
          type: 'drift',
          title: 'Escalating Upward Drift Pattern',
          message: `3 consecutive measurements show a progressive climb (${r0.systolic}/${r0.diastolic} → ${r1.systolic}/${r1.diastolic} → ${r2.systolic}/${r2.diastolic}). Consider reviewing sodium, stress, or medication timing.`,
          severity: 'warning',
          readingId: current.id,
          timestamp: current.timestamp,
        });
      }
    }
  }

  // Return most recent alerts first, de-duplicate by reading ID & type
  return alerts.reverse();
}

/**
 * Computes moving averages, extrema, adherence rate, and stage breakdown
 */
export function computeMetrics(readings: BPReading[]): MetricSummary {
  if (readings.length === 0) {
    return {
      count: 0,
      avgSys: 0,
      avgDia: 0,
      avgPulse: 0,
      avgMap: 0,
      minSys: 0,
      maxSys: 0,
      minDia: 0,
      maxDia: 0,
      medAdherenceRate: 0,
      stageDistribution: {
        normal: 0,
        elevated: 0,
        stage1: 0,
        stage2: 0,
        crisis: 0,
        hypotension: 0,
      },
    };
  }

  const count = readings.length;
  let totalSys = 0;
  let totalDia = 0;
  let totalPulse = 0;
  let totalMap = 0;
  let medTakenCount = 0;

  let minSys = Infinity;
  let maxSys = -Infinity;
  let minDia = Infinity;
  let maxDia = -Infinity;

  const stageDistribution: Record<AHAStage, number> = {
    normal: 0,
    elevated: 0,
    stage1: 0,
    stage2: 0,
    crisis: 0,
    hypotension: 0,
  };

  for (const r of readings) {
    totalSys += r.systolic;
    totalDia += r.diastolic;
    totalPulse += r.pulse;
    totalMap += calculateMAP(r.systolic, r.diastolic);

    if (r.medTaken) medTakenCount++;

    if (r.systolic < minSys) minSys = r.systolic;
    if (r.systolic > maxSys) maxSys = r.systolic;
    if (r.diastolic < minDia) minDia = r.diastolic;
    if (r.diastolic > maxDia) maxDia = r.diastolic;

    const classification = classifyAHA(r.systolic, r.diastolic);
    stageDistribution[classification.stage] = (stageDistribution[classification.stage] || 0) + 1;
  }

  return {
    count,
    avgSys: Math.round((totalSys / count) * 10) / 10,
    avgDia: Math.round((totalDia / count) * 10) / 10,
    avgPulse: Math.round((totalPulse / count) * 10) / 10,
    avgMap: Math.round((totalMap / count) * 10) / 10,
    minSys: minSys === Infinity ? 0 : minSys,
    maxSys: maxSys === -Infinity ? 0 : maxSys,
    minDia: minDia === Infinity ? 0 : minDia,
    maxDia: maxDia === -Infinity ? 0 : maxDia,
    medAdherenceRate: Math.round((medTakenCount / count) * 100),
    stageDistribution,
  };
}

/**
 * Filters readings based on timeframe
 */
export function filterReadingsByTimeframe(
  readings: BPReading[],
  timeframe: '7d' | '30d' | '90d' | 'all'
): BPReading[] {
  if (timeframe === 'all') return readings;

  const now = new Date().getTime();
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const cutoff = now - days * 24 * 60 * 60 * 1000;

  return readings.filter((r) => new Date(r.timestamp).getTime() >= cutoff);
}

/**
 * Generates CSV string suitable for export to doctors/physicians
 */
export function exportToCSV(readings: BPReading[]): string {
  const headers = [
    'Date & Time',
    'Systolic (mmHg)',
    'Diastolic (mmHg)',
    'Pulse (BPM)',
    'MAP (mmHg)',
    'Pulse Pressure (mmHg)',
    'AHA Stage',
    'Arm',
    'Position',
    'Medication Taken',
    'Medications',
    'Notes',
  ];

  const rows = readings.map((r) => {
    const metrics = classifyAHA(r.systolic, r.diastolic);
    const dateFormatted = new Date(r.timestamp).toLocaleString();
    const meds = (r.medNames || []).join('; ');
    const safeNotes = (r.notes || '').replace(/"/g, '""');

    return [
      `"${dateFormatted}"`,
      r.systolic,
      r.diastolic,
      r.pulse,
      metrics.map,
      metrics.pulsePressure,
      `"${metrics.stageLabel}"`,
      r.arm.toUpperCase(),
      r.position.toUpperCase(),
      r.medTaken ? 'YES' : 'NO',
      `"${meds}"`,
      `"${safeNotes}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
