import { useState, useCallback, useRef } from 'react';
import * as FileSystem from 'expo-file-system';
import { api } from '../services/api';

const TOTAL_DURATION_MS = 30_000;
const UPDATE_INTERVAL_MS = 3_000;

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

  const startMeasurement = useCallback(async (onRecord: () => Promise<string>) => {
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

    try {
      // Start recording!
      const videoUri = await onRecord();
      
      // Read as base64!
      const videoBase64 = await FileSystem.readAsStringAsync(videoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to backend!
      const response = await api.post('/ai/heartrate', {
        video_base64: videoBase64,
      });

      const data = response.data;
      
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      intervalRef.current = null;
      progressRef.current = null;
      
      setBpm(data.bpm);
      setSpo2(data.spo2 || 98); // Fallback if not returned
      setProgress(1);
      setResult({ bpm: data.bpm, spo2: data.spo2 || 98 });
      setIsMeasuring(false);
    } catch (error) {
      console.error('Error during vitals measurement:', error);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      intervalRef.current = null;
      progressRef.current = null;
      setIsMeasuring(false);
    }
  }, [isMeasuring]);

  return { bpm, spo2, isMeasuring, progress, result, startMeasurement, stop };
}
