import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, RotateCcw, ScanLine, Trash2, Upload } from 'lucide-react';
import { QUICK_SAMPLES, type QuickSample } from '../data/samples';
import { compressImageFile } from '../utils/imageCompress';
import { BIN_REGISTRY, type BinColor, type WasteScanResult } from '../utils/wasteLogic';
import { WebcamModal } from './WebcamModal';

interface ScannerWorkspaceProps {
  onScanComplete: (result: WasteScanResult) => void;
}

const BIN_BANNER_STYLES: Record<BinColor, string> = {
  green: 'bg-[#ecfdf3] text-[#14532d] border-[#bbf7d0]',
  blue: 'bg-[#eff6ff] text-[#1e3a8a] border-[#bfdbfe]',
  red: 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]',
  yellow: 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]',
};

const BIN_PROGRESS_STYLES: Record<BinColor, string> = {
  green: 'bg-[#15803d]',
  blue: 'bg-[#1d4ed8]',
  red: 'bg-[#dc2626]',
  yellow: 'bg-[#b45309]',
};

export function ScannerWorkspace({ onScanComplete }: ScannerWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>('');
  const [previewAlt, setPreviewAlt] = useState<string>('Selected waste item');
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [uploadedPayload, setUploadedPayload] = useState<{
    base64: string;
    mimeType: string;
  } | null>(null);

  const [status, setStatus] = useState<'empty' | 'loading' | 'result' | 'error'>('empty');
  const [loadingMessage, setLoadingMessage] = useState(
    'Analyzing material composition with Gemini Vision...'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [result, setResult] = useState<WasteScanResult | null>(null);

  const [webcamOpen, setWebcamOpen] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  const stopWebcam = useCallback(() => {
    setWebcamStream((prev) => {
      if (prev) {
        prev.getTracks().forEach((track) => track.stop());
      }
      return null;
    });
    setWebcamOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [webcamStream]);

  const runServerScan = useCallback(
    async (base64: string, mimeType: string) => {
      setStatus('loading');
      setErrorMessage('');
      setLoadingMessage('Inspecting material composition with Gemini Vision...');

      try {
        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        });

        const payload = (await response.json()) as {
          result?: WasteScanResult;
          error?: string;
        };

        if (!response.ok || !payload.result) {
          throw new Error(payload.error || 'Could not classify this waste image.');
        }

        setResult(payload.result);
        setStatus('result');
        onScanComplete(payload.result);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Unexpected network error while scanning.'
        );
        setStatus('error');
      }
    },
    [onScanComplete]
  );

  const handleFileSelected = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please choose a valid image file (JPG, PNG, or WEBP).');
        setStatus('error');
        return;
      }

      try {
        setActiveSampleId(null);
        const compressed = await compressImageFile(file);
        setPreviewUrl(compressed.dataUrl);
        setPreviewName(file.name);
        setPreviewAlt(`Uploaded photo: ${file.name}`);
        setUploadedPayload({ base64: compressed.base64, mimeType: compressed.mimeType });
        await runServerScan(compressed.base64, compressed.mimeType);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to process image.');
        setStatus('error');
      }
    },
    [runServerScan]
  );

  const handleSampleSelect = useCallback(
    async (sample: QuickSample) => {
      setActiveSampleId(sample.id);
      setUploadedPayload(null);
      setPreviewUrl(sample.imageUrl);
      setPreviewName(sample.filename);
      setPreviewAlt(sample.alt);
      setStatus('loading');
      setErrorMessage('');
      setLoadingMessage(`Inspecting sample: ${sample.label}...`);

      await new Promise((resolve) => setTimeout(resolve, 420));
      setResult(sample.result);
      setStatus('result');
      onScanComplete(sample.result);
    },
    [onScanComplete]
  );

  const handleReanalyze = useCallback(async () => {
    if (activeSampleId) {
      const sample = QUICK_SAMPLES.find((s) => s.id === activeSampleId);
      if (sample) {
        await handleSampleSelect(sample);
      }
      return;
    }
    if (uploadedPayload) {
      await runServerScan(uploadedPayload.base64, uploadedPayload.mimeType);
    }
  }, [activeSampleId, handleSampleSelect, runServerScan, uploadedPayload]);

  const handleReset = useCallback(() => {
    setPreviewUrl(null);
    setPreviewName('');
    setActiveSampleId(null);
    setUploadedPayload(null);
    setResult(null);
    setErrorMessage('');
    setStatus('empty');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }, []);

  const handleCameraTrigger = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        setWebcamStream(stream);
        setWebcamOpen(true);
        return;
      } catch {
        // Fallback to native camera file input if webcam permission denied or unavailable
      }
    }
    cameraInputRef.current?.click();
  };

  const handleWebcamCapture = async (dataUrl: string, base64: string) => {
    stopWebcam();
    setActiveSampleId(null);
    setPreviewUrl(dataUrl);
    setPreviewName('camera-capture.jpg');
    setPreviewAlt('Captured photo from camera');
    setUploadedPayload({ base64, mimeType: 'image/jpeg' });
    await runServerScan(base64, 'image/jpeg');
  };

  const activeBin = result ? BIN_REGISTRY[result.binColor] : null;

  return (
    <section id="scanner-section" className="py-6 pb-14">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          {/* Left Panel: Upload, Camera & Quick-Test Samples */}
          <div className="flex flex-col rounded-2xl border border-[#dce3de] bg-white p-6 shadow-xs sm:p-7">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-[#14211a]">AI Waste Scanner</h2>
              <p className="mt-1 text-sm text-[#425449]">
                Drag a photo, browse files, capture with your camera, or pick a quick-test item below.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              aria-label="Browse waste image file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFileSelected(file);
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              aria-label="Capture waste image with device camera"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFileSelected(file);
              }}
            />

            {!previewUrl ? (
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) void handleFileSelected(file);
                }}
                className={`flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-[#15803d] bg-[#ecfdf3]'
                    : 'border-[#b9c6bd] bg-[#f7f9f7]'
                }`}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#15803d] shadow-xs">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-base font-semibold text-[#14211a]">
                  Drop a waste photo here
                </p>
                <p className="mt-1 mb-5 text-sm text-[#64756a]">
                  Supports JPG, PNG, and WEBP images — automatically compressed for fast scans
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-[#15803d] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166534] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803d]"
                  >
                    <Upload className="h-4 w-4" />
                    Browse Image
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCameraTrigger()}
                    className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border border-[#c2cdc5] bg-white px-4 py-2.5 text-sm font-semibold text-[#14211a] transition-colors hover:bg-[#eff3f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803d]"
                  >
                    <Camera className="h-4 w-4" />
                    Use Camera
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#dce3de] bg-[#eff3f0]">
                  <img
                    src={previewUrl}
                    alt={previewAlt}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  {status === 'loading' && (
                    <div className="pointer-events-none absolute inset-0 bg-[#14211a]/10">
                      <div className="animate-scan-laser absolute inset-x-0 top-0 h-1 bg-[#15803d] shadow-[0_0_16px_2px_rgba(21,128,61,0.65)]" />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="max-w-[220px] truncate text-sm text-[#425449]">
                    {previewName}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#c2cdc5] bg-white px-3 py-2 text-xs font-semibold text-[#425449] transition-colors hover:bg-[#eff3f0] hover:text-[#14211a]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleReanalyze()}
                      disabled={status === 'loading'}
                      className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#15803d] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#166534] disabled:opacity-60"
                    >
                      <ScanLine className="h-3.5 w-3.5" />
                      Re-Analyze
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick-Test Sample Chips */}
            <div className="mt-auto border-t border-[#dce3de] pt-5">
              <p className="mb-3 text-xs font-semibold text-[#425449]">
                Quick-test samples (instant verification without uploading)
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_SAMPLES.map((sample) => {
                  const isActive = activeSampleId === sample.id;
                  return (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => void handleSampleSelect(sample)}
                      className={`inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803d] ${
                        isActive
                          ? 'border-[#15803d] bg-[#ecfdf3] text-[#14532d]'
                          : 'border-[#c2cdc5] bg-[#f7f9f7] text-[#14211a] hover:border-[#15803d] hover:bg-[#ecfdf3]'
                      }`}
                    >
                      <img
                        src={sample.imageUrl}
                        alt=""
                        aria-hidden="true"
                        referrerPolicy="no-referrer"
                        className="h-5 w-5 rounded object-cover"
                      />
                      <span>{sample.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Classification Output */}
          <div
            className="flex flex-col rounded-2xl border border-[#dce3de] bg-white p-6 shadow-xs sm:p-7"
            aria-live="polite"
            data-testid="scanner-result-panel"
          >
            {status === 'empty' && (
              <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7f9f7] text-[#64756a]">
                  <Trash2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#14211a]">Ready to segregate</h3>
                <p className="mt-2 max-w-[38ch] text-sm text-[#425449]">
                  Upload a waste photo or click any quick-test sample to view the recommended color-coded dustbin, material breakdown, disposal steps, and CO2 impact.
                </p>
              </div>
            )}

            {status === 'loading' && (
              <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
                <div
                  className="mb-4 h-9 w-9 animate-spin rounded-full border-3 border-[#dce3de] border-t-[#15803d]"
                  aria-hidden="true"
                />
                <h3 className="text-lg font-semibold text-[#14211a]">Analyzing waste item...</h3>
                <p className="mt-1.5 max-w-[36ch] text-sm text-[#425449]">{loadingMessage}</p>
              </div>
            )}

            {status === 'error' && (
              <div
                role="alert"
                className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center"
              >
                <h3 className="text-lg font-semibold text-[#991b1b]">
                  Scan could not be completed
                </h3>
                <p className="mt-2 mb-5 max-w-[42ch] text-sm text-[#7f1d1d]">{errorMessage}</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => void handleReanalyze()}
                    className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-[#15803d] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#166534]"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry Scan
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="cursor-pointer whitespace-nowrap rounded-lg border border-[#c2cdc5] bg-white px-4 py-2 text-sm font-semibold text-[#14211a] transition-colors hover:bg-[#eff3f0]"
                  >
                    Choose Another Image
                  </button>
                </div>
              </div>
            )}

            {status === 'result' && result && activeBin && (
              <div className="flex flex-1 flex-col gap-5">
                {/* Dual-coded Dustbin Banner */}
                <div
                  className={`flex items-center justify-between rounded-xl border px-5 py-4 ${BIN_BANNER_STYLES[result.binColor]}`}
                >
                  <div>
                    <p className="text-xs font-semibold opacity-85">{activeBin.category}</p>
                    <h3 className="mt-0.5 text-xl font-bold">{activeBin.name}</h3>
                  </div>
                  <span className="font-mono-num rounded-md border border-current px-2.5 py-1 text-xs font-semibold">
                    {activeBin.code}
                  </span>
                </div>

                {/* Item & Confidence */}
                <div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#64756a]">Identified Item</p>
                      <h4 className="mt-0.5 text-lg font-bold text-[#14211a]">
                        {result.itemName}
                      </h4>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold text-[#64756a]">Confidence</p>
                      <p className="font-mono-num text-base font-semibold text-[#14211a]">
                        {result.confidence}%
                      </p>
                    </div>
                  </div>
                  <div
                    className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#eff3f0]"
                    aria-hidden="true"
                  >
                    <div
                      className={`h-full transition-all duration-300 ${BIN_PROGRESS_STYLES[result.binColor]}`}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Material & CO2 Grid */}
                <div className="grid grid-cols-1 gap-4 border-y border-[#dce3de] py-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-[#64756a]">Material Composition</p>
                    <p className="mt-1 text-sm font-medium text-[#14211a]">
                      {result.materialComposition}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#64756a]">CO2 Impact Saved</p>
                    <p className="font-mono-num mt-1 text-sm font-semibold text-[#15803d]">
                      +{result.co2SavedKg.toFixed(2)} kg CO2e
                    </p>
                  </div>
                </div>

                {/* Disposal Steps */}
                <div>
                  <p className="text-xs font-semibold text-[#64756a]">Disposal Steps</p>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-[#425449]">
                    {result.disposalSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Environmental Fact */}
                <div className="rounded-xl border border-[#dce3de] bg-[#f7f9f7] px-4 py-3.5">
                  <p className="text-xs font-semibold text-[#64756a]">Environmental Impact Fact</p>
                  <p className="mt-1 text-sm text-[#14211a]">{result.environmentalFact}</p>
                </div>

                <div className="mt-auto text-right text-xs text-[#64756a]">
                  Analyzed via {result.modelUsed}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <WebcamModal
        open={webcamOpen}
        stream={webcamStream}
        onCapture={(dataUrl, base64) => void handleWebcamCapture(dataUrl, base64)}
        onClose={stopWebcam}
      />
    </section>
  );
}
