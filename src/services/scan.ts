import { api } from './api';
import type { ScanResult, Scan } from '../types/scan';

export async function uploadScan(
  imageUri: string,
  bodyArea: string
): Promise<ScanResult> {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'scan.jpg',
  } as never);
  formData.append('body_area', bodyArea);

  const { data } = await api.post<ScanResult>('/scans/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getScanHistory(): Promise<Scan[]> {
  const { data } = await api.get<Scan[]>('/scans');
  return data;
}

export async function getScanById(scanId: string): Promise<Scan> {
  const { data } = await api.get<Scan>(`/scans/${scanId}`);
  return data;
}
