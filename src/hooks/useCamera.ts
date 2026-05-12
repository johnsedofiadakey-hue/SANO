import { useState, useCallback } from 'react';
import { requestCameraPermission } from '../utils/permissions';
import { logger } from '../utils/logger';

export function useCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const requestPermission = useCallback(async () => {
    const granted = await requestCameraPermission();
    setHasPermission(granted);
    return granted;
  }, []);

  const capture = useCallback(async (cameraRef: React.RefObject<{ takePictureAsync: (options?: Record<string, unknown>) => Promise<{ uri: string }> }>) => {
    if (!cameraRef.current) return null;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85, base64: false });
      setCapturedUri(photo.uri);
      return photo.uri;
    } catch (e) {
      logger.error('Camera capture failed', e);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const clear = useCallback(() => setCapturedUri(null), []);

  return { hasPermission, capturedUri, isCapturing, requestPermission, capture, clear };
}
