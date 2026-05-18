import { useState, useCallback, useRef } from 'react';
import * as FileSystem from 'expo-file-system';
import { api } from '../services/api';

const TOTAL_DURATION_MS = 30_000;

export interface HeartRateResult {
  bpm: number;
  spo2: number;
}

export function useHeartRate() {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<HeartRateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    progressRef.current = null;
    setIsMeasuring(false);
  }, []);

  const startMeasurement = useCallback(async (onRecord: () => Promise<string>) => {
    if (isMeasuring) return;

    setIsMeasuring(true);
    setProgress(0);
    setResult(null);
    setError(null);

    const startTime = Date.now();

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(elapsed / TOTAL_DURATION_MS, 1));
    }, 100);

    try {
      const videoUri = await onRecord();

      const videoBase64 = await FileSystem.readAsStringAsync(videoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await api.post('/ai/heartrate', { video_base64: videoBase64 });
      const data = response.data;

      if (progressRef.current) clearInterval(progressRef.current);
      progressRef.current = null;

      setProgress(1);
      setResult({ bpm: data.bpm, spo2: data.spo2_estimate ?? data.spo2 ?? 0 });
      setIsMeasuring(false);
    } catch (err: any) {
      if (progressRef.current) clearInterval(progressRef.current);
      progressRef.current = null;

      const msg =
        err.response?.data?.message ??
        'Measurement failed. Keep your finger still over the lens and try again.';
      setError(msg);
      setIsMeasuring(false);
    }
  }, [isMeasuring]);

  return { isMeasuring, progress, result, error, startMeasurement, stop };
}
