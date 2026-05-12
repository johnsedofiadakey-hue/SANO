import { useState, useCallback } from 'react';
import { uploadScan } from '../services/scan';
import { useScanStore } from '../store/scanStore';
import { useDataCollection } from './useDataCollection';
import { useCycleStore } from '../store/cycleStore';
import { useProfileStore } from '../store/profileStore';
import type { ScanResult } from '../types/scan';
import { logger } from '../utils/logger';

export function useScanUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setCurrentResult, setProcessing, scans } = useScanStore();
  const { logScan } = useDataCollection();
  const { currentCycleDay } = useCycleStore();
  const { fitzpatrick } = useProfileStore();

  const upload = useCallback(
    async (imageUri: string, bodyArea: string): Promise<ScanResult | null> => {
      setIsUploading(true);
      setError(null);
      setProcessing(true);

      try {
        const result = await uploadScan(imageUri, bodyArea);
        setCurrentResult(result);

        const lastScan = scans[0];
        const daysSinceLast = lastScan
          ? Math.floor((Date.now() - new Date(lastScan.created_at).getTime()) / 86400000)
          : 0;

        await logScan(imageUri, result);

        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Upload failed';
        setError(msg);
        logger.error('Scan upload failed', e);
        return null;
      } finally {
        setIsUploading(false);
        setProcessing(false);
      }
    },
    [scans, currentCycleDay, fitzpatrick, setCurrentResult, setProcessing, logScan]
  );

  return { upload, isUploading, error };
}
