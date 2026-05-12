export interface ScanCondition {
  name: string;
  location: string;
  severity: number;       // 0.0–1.0
  confidence: number;     // 0.0–1.0
  doctor_confirmed: boolean;
}

export interface Scan {
  scan_id: string;
  user_id: string;
  image_hash: string;
  skin_tone: number;       // 1–6
  body_area: string;
  conditions_detected: ScanCondition[];
  products_in_use: string[];
  days_since_last_scan: number;
  cycle_day: number | null;
  region: string;
  season: 'harmattan' | 'rainy' | 'dry';
  phone_model: string;
  camera_mp: number;
  model_version: string;
  queued_for_label: boolean;
  created_at: string;
}

export interface ScanResult {
  scan_id: string;
  conditions: ScanCondition[];
  skin_tone: number;
  model_version: string;
  processing_time_ms: number;
}
