// hooks/useQRScanner.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

export function useQRScanner(onScan: (code: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null); // ✅ C'est lui qui a stop()
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    return () => {
      controlsRef.current?.stop(); // ✅ Nettoyage au unmount
    };
  }, []);

  const startScanning = useCallback(async () => {
    if (!videoRef.current || !readerRef.current) return;
    setIsScanning(true);
    setError(null);

    try {
      // decodeFromConstraints retourne un IScannerControls
      controlsRef.current = await readerRef.current.decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current,
        (result, err) => {
          if (result) {
            controlsRef.current?.stop(); // ✅ stop() sur les controls
            controlsRef.current = null;
            setIsScanning(false);
            onScan(result.getText());
          }
        },
      );
    } catch (e) {
      setError("Impossible d'accéder à la caméra");
      setIsScanning(false);
    }
  }, [onScan]);

  const stopScanning = useCallback(() => {
    controlsRef.current?.stop(); // ✅
    controlsRef.current = null;
    setIsScanning(false);
  }, []);

  return { videoRef, startScanning, stopScanning, isScanning, error };
}
