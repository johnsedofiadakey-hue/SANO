export type HealthEventType =
  | 'heart_rate'
  | 'spo2'
  | 'blood_pressure'
  | 'sleep'
  | 'stress'
  | 'temperature'
  | 'weight';

export interface HealthEvent {
  id: string;
  user_id: string;
  type: HealthEventType;
  value: Record<string, number | string>;
  device: string;
  confidence: number;
  created_at: string;
}

export type CyclePhase = 'period' | 'follicular' | 'ovulation' | 'luteal';

export interface CycleLog {
  id: string;
  user_id: string;
  period_start: string;
  period_end?: string;
  symptoms: string[];
  cycle_day: number;
  phase: CyclePhase;
  created_at: string;
}

export type Symptom =
  | 'cramps'
  | 'bloating'
  | 'headache'
  | 'fatigue'
  | 'mood_swings'
  | 'breakouts'
  | 'clear_skin'
  | 'oily_skin'
  | 'dry_skin';
