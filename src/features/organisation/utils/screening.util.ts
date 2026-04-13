import { aiCoreClient } from '@/lib/axios';

export type ImageStatus =
  | 'uploading'
  | 'validating'
  | 'ready'
  | 'warning'
  | 'error';

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  eyeSide: 'Left' | 'Right' | 'Both';
  url?: string;
  status: ImageStatus;
  progress: number;
  quality?: 'high' | 'medium' | 'low';
  message?: string;
}

export interface FundusValidationApiResponse {
  is_fundus: boolean;
  confidence: number;
  quality: 'high' | 'medium' | 'low';
  reason: string;
  warnings: string[];
  metrics: Record<string, number>;
}

export async function analyzeImageQuality(file: File): Promise<{
  status: ImageStatus;
  quality?: 'high' | 'medium' | 'low';
  message?: string;
}> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const { data } = await aiCoreClient.post<FundusValidationApiResponse>(
      '/api/v1/diagnosis/validate-fundus',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 15000 }
    );

    if (!data.is_fundus) {
      return {
        status: 'error',
        quality: 'low',
        message: 'Not a clear retinal scan.',
      };
    }

    const warnings = data.warnings ?? [];
    if (warnings.includes('cropped_edges'))
      return {
        status: 'warning',
        quality: 'low',
        message: 'Image appears cropped.',
      };
    if (warnings.includes('blurry'))
      return {
        status: 'warning',
        quality: 'low',
        message: 'Image appears blurry.',
      };
    if (warnings.includes('too_dark'))
      return {
        status: 'warning',
        quality: 'low',
        message: 'Image appears too dark.',
      };
    if (warnings.includes('overexposed'))
      return {
        status: 'warning',
        quality: 'low',
        message: 'Image appears overexposed.',
      };

    return {
      status: 'ready',
      quality: data.quality === 'high' ? 'high' : 'medium',
      message:
        data.quality === 'high'
          ? 'Optimal quality'
          : data.quality === 'medium'
            ? 'Acceptable quality'
            : 'Poor quality',
    };
  } catch {
    return {
      status: 'error',
      quality: 'low',
      message: 'Validation service error.',
    };
  }
}
