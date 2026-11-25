import { useEffect, useRef } from 'react';
import { Camera, X } from 'lucide-react';

interface WebcamModalProps {
  open: boolean;
  stream: MediaStream | null;
  onCapture: (dataUrl: string, base64: string) => void;
  onClose: () => void;
}

export function WebcamModal({ open, stream, onCapture, onClose }: WebcamModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (open && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [open, stream]);

  if (!open) return null;

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    const base64 = dataUrl.split(',')[1] ?? '';
    onCapture(dataUrl, base64);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#14211a]/60 p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-heading"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#dce3de] bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-[#dce3de] px-5 py-4">
          <h3 id="camera-modal-heading" className="text-base font-bold text-[#14211a]">
            Capture Waste Photo
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close camera capture dialog"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#425449] transition-colors hover:bg-[#eff3f0] hover:text-[#14211a]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="aspect-[4/3] w-full bg-[#111827]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#dce3de] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer whitespace-nowrap rounded-lg border border-[#c2cdc5] bg-white px-4 py-2 text-sm font-semibold text-[#14211a] transition-colors hover:bg-[#eff3f0]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCapture}
            className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-[#15803d] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#166534]"
          >
            <Camera className="h-4 w-4" />
            Capture &amp; Scan
          </button>
        </div>
      </div>
    </div>
  );
}
