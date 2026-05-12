import { useState, useCallback, useRef } from 'react';

const TOTAL_DURATION_MS = 30_000;
const UPDATE_INTERVAL_MS = 3_000;
const FINAL_BPM = 74;
const FINAL_SPO2 = 98;

function jitter(base: number, range: number): number {
  return Math.round(base + (Math.random() * 2 - 1) * range);
}

export interface HeartRateResult {
  bpm: number;
  spo2: number;
}

export function useHeartRate() {
  const [bpm, setBpm] = useState<number | null>(null);
  const [spo2, setSpo2] = useState<number | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<HeartRateResult | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    progressRef.current = null;
    timeoutRef.current = null;
    setIsMeasuring(false);
  }, []);

  const startMeasurement = useCallback(() => {
    if (isMeasuring) return;

    setIsMeasuring(true);
    setProgress(0);
    setResult(null);
    setBpm(jitter(70, 4));
    setSpo2(jitter(98, 1));

    const startTime = Date.now();

    // Smooth progress bar (updates 10× per second)
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(elapsed / TOTAL_DURATION_MS, 1));
    }, 100);

    // Live BPM + SpO2 ticks
    intervalRef.current = setInterval(() => {
      setBpm(jitter(70, 4));
      setSpo2(jitter(98, 1));
    }, UPDATE_INTERVAL_MS);

    // Finalise after 30 s
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      intervalRef.current = null;
      progressRef.current = null;
      setBpm(FINAL_BPM);
      setSpo2(FINAL_SPO2);
      setProgress(1);
      setResult({ bpm: FINAL_BPM, spo2: FINAL_SPO2 });
      setIsMeasuring(false);
    }, TOTAL_DURATION_MS);
  }, [isMeasuring]);

  return { bpm, spo2, isMeasuring, progress, result, startMeasurement, stop };
}
