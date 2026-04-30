import { useEffect, useRef, useState, useCallback } from 'react';
import { X, QrCode, Zap, ZapOff, Camera, AlertCircle } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface QrScannerModalProps {
  onClose: () => void;
  onScan: (result: string) => void;
}

export default function QrScannerModal({
  onClose,
  onScan,
}: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const hasScannedRef = useRef(false);
  const [torchOn, setTorchOn] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<
    'initializing' | 'scanning' | 'error' | 'success'
  >('initializing');
  const [errorMessage, setErrorMessage] = useState('');
  const [torchSupported, setTorchSupported] = useState(false);

  const playBeep = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    hasScannedRef.current = false;

    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error, controls) => {
          if (!controlsRef.current) {
            controlsRef.current = controls;
            setStatus('scanning');

            // Check torch support & capture stream
            const video = videoRef.current;
            if (video?.srcObject instanceof MediaStream) {
              const stream = video.srcObject as MediaStream;
              setMediaStream(stream);
              const track = stream.getVideoTracks()[0];
              const capabilities = track?.getCapabilities?.() as any;
              setTorchSupported(!!capabilities?.torch);
            }
          }

          if (result && !hasScannedRef.current) {
            hasScannedRef.current = true;
            setStatus('success');
            playBeep();
            controls.stop();
            setTimeout(() => {
              onScan(result.getText());
            }, 300);
          }
        }
      )
      .catch((err: Error) => {
        setStatus('error');
        if (err.name === 'NotAllowedError') {
          setErrorMessage(
            'Quyền truy cập camera bị từ chối. Vui lòng cho phép camera trong cài đặt trình duyệt.'
          );
        } else if (err.name === 'NotFoundError') {
          setErrorMessage('Không tìm thấy camera trên thiết bị này.');
        } else {
          setErrorMessage('Không thể khởi động camera. Vui lòng thử lại.');
        }
      });

    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [onScan, playBeep]);

  const toggleTorch = async () => {
    if (!mediaStream || !torchSupported) return;
    const track = mediaStream.getVideoTracks()[0];
    const newState = !torchOn;
    try {
      await track.applyConstraints({
        advanced: [{ torch: newState } as MediaTrackConstraintSet],
      });
      setTorchOn(newState);
    } catch {
      // torch constraint failed silently
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
        <div
          className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
          style={{
            boxShadow:
              '0 0 0 1px rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0,0,0,0.8)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
                <QrCode className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-none">
                  Scan QR Check-in
                </h3>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      status === 'scanning'
                        ? 'bg-emerald-400 animate-pulse'
                        : status === 'success'
                          ? 'bg-emerald-400'
                          : status === 'error'
                            ? 'bg-rose-400'
                            : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {status === 'initializing' && 'Đang khởi động...'}
                    {status === 'scanning' && 'Sẵn sàng quét'}
                    {status === 'success' && 'Đã nhận diện!'}
                    {status === 'error' && 'Lỗi camera'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {torchSupported && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  title={torchOn ? 'Tắt đèn flash' : 'Bật đèn flash'}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                    torchOn
                      ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {torchOn ? (
                    <Zap className="h-4 w-4" />
                  ) : (
                    <ZapOff className="h-4 w-4" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Camera viewport */}
          <div
            className="relative mx-4 mb-4 overflow-hidden rounded-2xl bg-black"
            style={{ aspectRatio: '1/1' }}
          >
            {/* Video element */}
            <video
              ref={videoRef}
              className={`h-full w-full object-cover transition-opacity duration-500 ${
                status === 'initializing' ? 'opacity-0' : 'opacity-100'
              }`}
              muted
              playsInline
            />

            {/* Loading state overlay */}
            {status === 'initializing' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950">
                <div className="relative">
                  <Camera className="h-12 w-12 text-slate-600" />
                  <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-slate-950 bg-amber-400 animate-pulse" />
                </div>
                <p className="text-xs font-medium text-slate-500">
                  Đang khởi động camera...
                </p>
              </div>
            )}

            {/* Error state overlay */}
            {status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20">
                  <AlertCircle className="h-8 w-8 text-rose-400" />
                </div>
                <p className="text-center text-xs text-slate-400 leading-relaxed">
                  {errorMessage}
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="rounded-xl bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-400 ring-1 ring-rose-500/20 transition hover:bg-rose-500/20"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Success flash overlay */}
            {status === 'success' && (
              <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 animate-pulse">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/30 ring-4 ring-emerald-400/50">
                  <svg
                    className="h-10 w-10 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Scanner visor overlay — only when scanning */}
            {(status === 'scanning' || status === 'initializing') && (
              <div className="pointer-events-none absolute inset-0">
                {/* Dark vignette around visor */}
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <mask id="visor-mask">
                      <rect width="100" height="100" fill="white" />
                      <rect
                        x="15"
                        y="15"
                        width="70"
                        height="70"
                        rx="4"
                        fill="black"
                      />
                    </mask>
                  </defs>
                  <rect
                    width="100"
                    height="100"
                    fill="rgba(0,0,0,0.55)"
                    mask="url(#visor-mask)"
                  />
                </svg>

                {/* Visor border */}
                <div
                  className="absolute border border-white/20 rounded-xl"
                  style={{
                    left: '15%',
                    top: '15%',
                    right: '15%',
                    bottom: '15%',
                  }}
                >
                  {/* Corner accents - top left */}
                  <div className="absolute -left-px -top-px h-10 w-10">
                    <div
                      className="absolute left-0 top-0 h-full w-[3px] rounded-tl-xl bg-emerald-400"
                      style={{ height: '40px' }}
                    />
                    <div
                      className="absolute left-0 top-0 h-[3px] w-full rounded-tl-xl bg-emerald-400"
                      style={{ width: '40px' }}
                    />
                  </div>
                  {/* Corner accents - top right */}
                  <div className="absolute -right-px -top-px h-10 w-10">
                    <div className="absolute right-0 top-0 h-[40px] w-[3px] rounded-tr-xl bg-emerald-400" />
                    <div className="absolute right-0 top-0 h-[3px] w-[40px] rounded-tr-xl bg-emerald-400" />
                  </div>
                  {/* Corner accents - bottom left */}
                  <div className="absolute -left-px -bottom-px h-10 w-10">
                    <div className="absolute bottom-0 left-0 h-[40px] w-[3px] rounded-bl-xl bg-emerald-400" />
                    <div className="absolute bottom-0 left-0 h-[3px] w-[40px] rounded-bl-xl bg-emerald-400" />
                  </div>
                  {/* Corner accents - bottom right */}
                  <div className="absolute -right-px -bottom-px h-10 w-10">
                    <div className="absolute bottom-0 right-0 h-[40px] w-[3px] rounded-br-xl bg-emerald-400" />
                    <div className="absolute bottom-0 right-0 h-[3px] w-[40px] rounded-br-xl bg-emerald-400" />
                  </div>

                  {/* Animated scan line */}
                  {status === 'scanning' && (
                    <div
                      className="absolute inset-x-2 overflow-hidden"
                      style={{ top: 0, bottom: 0 }}
                    >
                      <div className="scan-line absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-90 rounded-full" />
                    </div>
                  )}
                </div>

                {/* Hint label */}
                <div
                  className="absolute inset-x-0 flex justify-center"
                  style={{ top: 'calc(85% + 10px)' }}
                >
                  <span className="rounded-full bg-black/60 px-4 py-1.5 text-[11px] font-semibold text-white/70 backdrop-blur-sm ring-1 ring-white/10">
                    Đặt mã QR vào khung để quét
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 text-center">
            <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">
              Hỗ trợ QR code AURA · Nhận diện tự động
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0%   { top: 2px; opacity: 0; }
          5%   { opacity: 1; }
          45%  { top: calc(100% - 4px); opacity: 1; }
          50%  { top: calc(100% - 4px); opacity: 0; }
          51%  { top: 2px; opacity: 0; }
          100% { top: 2px; opacity: 0; }
        }
        .scan-line {
          animation: scanLine 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}
