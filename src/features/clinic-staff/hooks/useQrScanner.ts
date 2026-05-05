import { useEffect, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { Result } from '@zxing/library';

interface UseQrScannerOptions {
  isActive: boolean;
  onScan: (result: string) => void;
  onError?: (error: Error) => void;
}

export function useQrScanner({
  isActive,
  onScan,
  onError,
}: UseQrScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const hasScannedRef = useRef(false);

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    hasScannedRef.current = false;
  }, []);

  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    hasScannedRef.current = false;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    const hints = new Map();
    // Chỉ decode QR Code để nhanh hơn
    hints.set(2 /* DecodeHintType.POSSIBLE_FORMATS */, ['QR_CODE']);

    reader
      .decodeFromVideoDevice(
        undefined, // dùng camera mặc định
        videoRef.current,
        (
          result: Result | undefined,
          error: any,
          controls: IScannerControls
        ) => {
          controlsRef.current = controls;

          if (result && !hasScannedRef.current) {
            hasScannedRef.current = true;
            controls.stop();
            onScan(result.getText());
          }

          if (error) {
            onError?.(error as Error);
          }
        }
      )
      .catch((err: any) => {
        onError?.(err as Error);
      });

    return () => {
      stopScanner();
    };
  }, [isActive, onScan, onError, stopScanner]);

  return { videoRef, stopScanner };
}
