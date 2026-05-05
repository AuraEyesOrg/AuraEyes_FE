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

type QualityMessageTranslator = (
  key: string,
  fallback: string,
  options?: Record<string, string | number | boolean | null | undefined>
) => string;

export async function analyzeImageQuality(
  file: File,
  translate?: QualityMessageTranslator
): Promise<{
  status: ImageStatus;
  quality?: 'high' | 'medium' | 'low';
  message?: string;
}> {
  const tr = (key: string, fallback: string) =>
    translate ? translate(key, fallback) : fallback;

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
        message: tr(
          'Organisation.screening.quality.notFundus',
          'Not a clear retinal scan.'
        ),
      };
    }

    const warnings = data.warnings ?? [];
    if (warnings.includes('cropped_edges'))
      return {
        status: 'warning',
        quality: 'low',
        message: tr(
          'Organisation.screening.quality.croppedEdges',
          'Image appears cropped.'
        ),
      };
    if (warnings.includes('blurry'))
      return {
        status: 'warning',
        quality: 'low',
        message: tr(
          'Organisation.screening.quality.blurry',
          'Image appears blurry.'
        ),
      };
    if (warnings.includes('too_dark'))
      return {
        status: 'warning',
        quality: 'low',
        message: tr(
          'Organisation.screening.quality.tooDark',
          'Image appears too dark.'
        ),
      };
    if (warnings.includes('overexposed'))
      return {
        status: 'warning',
        quality: 'low',
        message: tr(
          'Organisation.screening.quality.overexposed',
          'Image appears overexposed.'
        ),
      };

    return {
      status: 'ready',
      quality: data.quality === 'high' ? 'high' : 'medium',
      message:
        data.quality === 'high'
          ? tr('Organisation.screening.quality.optimal', 'Optimal quality')
          : data.quality === 'medium'
            ? tr(
                'Organisation.screening.quality.acceptable',
                'Acceptable quality'
              )
            : tr('Organisation.screening.quality.poor', 'Poor quality'),
    };
  } catch {
    return {
      status: 'error',
      quality: 'low',
      message: tr(
        'Organisation.screening.quality.validationServiceError',
        'Validation service error.'
      ),
    };
  }
}
