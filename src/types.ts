export type AHAStage = 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis' | 'hypotension';

export type ArmPosition = 'left' | 'right';
export type BodyPosition = 'sitting' | 'standing' | 'lying';

export interface BPReading {
  id: string;
  timestamp: string; // ISO 8601 string
  systolic: number;  // mmHg
  diastolic: number; // mmHg
  pulse: number;     // BPM
  arm: ArmPosition;
  position: BodyPosition;
  medTaken: boolean;
  medNames?: string[];
  notes?: string;
}

export type AnomalyType = 'surge' | 'drop' | 'drift' | 'crisis' | 'hypotension';
export type AnomalySeverity = 'info' | 'warning' | 'danger' | 'critical';

export interface AnomalyAlert {
  id: string;
  type: AnomalyType;
  title: string;
  message: string;
  severity: AnomalySeverity;
  readingId: string;
  timestamp: string;
  deltaSys?: number;
  deltaDia?: number;
}

export type TimeframeFilter = '7d' | '30d' | '90d' | 'all';

export interface ClinicalMetrics {
  stage: AHAStage;
  stageLabel: string;
  pulsePressure: number; // SYS - DIA
  map: number;           // Mean Arterial Pressure = DIA + 1/3(SYS - DIA)
  colorClass: string;
  badgeClass: string;
  glowClass: string;
  description: string;
  recommendation: string;
}

export interface MetricSummary {
  count: number;
  avgSys: number;
  avgDia: number;
  avgPulse: number;
  avgMap: number;
  minSys: number;
  maxSys: number;
  minDia: number;
  maxDia: number;
  medAdherenceRate: number; // percentage 0-100
  stageDistribution: Record<AHAStage, number>;
}

export type DashboardVariation = 'command-center' | 'metric-dials' | 'feed-cards';
