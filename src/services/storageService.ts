import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import * as Crypto from 'expo-crypto';
import { storage, DEMO_MODE } from '../config/firebase';

export const storageService = {

  // Upload scan image — stored under random UUID, never user ID
  uploadScanImage: async (
    imageUri: string,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    if (!storage) {
      throw new Error('Storage not initialized');
    }

    const uuid = await Crypto.randomUUID();
    const filename = `scans/${uuid}.jpg`;
    const storageRef = ref(storage, filename);

    // Convert URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    return new Promise<string>((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: 'image/jpeg',
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          onProgress?.(progress);
        },
        (error) => reject(error),
        async () => {
          // Return the storage path (not URL) — URL can be regenerated on demand
          resolve(filename);
        }
      );
    });
  },

  // Get a signed download URL for any stored image path
  getImageURL: async (storagePath: string): Promise<string> => {
    if (!storage) {
      return '';
    }
    const storageRef = ref(storage, storagePath);
    return getDownloadURL(storageRef);
  },
};
