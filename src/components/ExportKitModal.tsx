import { useState } from 'react';
import { Check, Copy, Download, X } from 'lucide-react';
import { STANDALONE_KIT_FILES } from '../data/standaloneKit';

interface ExportKitModalProps {
  open: boolean;
  onClose: () => void;
}

export function ExportKitModal({ open, onClose }: ExportKitModalProps) {
  const [selectedFilename, setSelectedFilename] = useState<'index.html' | 'style.css' | 'script.js'>('index.html');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!open) return null;

  const activeFile =
    STANDALONE_KIT_FILES.find((f) => f.filename === selectedFilename) ?? STANDALONE_KIT_FILES[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopiedFile(activeFile.filename);
      setTimeout(() => setCopiedFile(null), 1800);
    } catch {
      // Clipboard fallback ignored if blocked
    }
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#14211a]/60 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-kit-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#dce3de] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#dce3de] px-6 py-4">
          <div>
            <h3 id="export-kit-title" className="text-lg font-bold text-[#14211a]">
              VS Code Live Server 3-File Kit
            </h3>
            <p className="text-xs text-[#425449]">
              Synchronized index.html, style.css, and script.js ready for local VS Code testing.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close VS Code export kit"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#425449] transition-colors hover:bg-[#eff3f0] hover:text-[#14211a]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce3de] bg-[#f7f9f7] px-6 py-3">
          <div className="inline-flex items-center gap-1 rounded-lg border border-[#dce3de] bg-white p-1" role="tablist">
            {STANDALONE_KIT_FILES.map((file) => {
              const active = file.filename === selectedFilename;
              return (
                <button
                  key={file.filename}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedFilename(file.filename)}
                  className={`font-mono-num cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active ? 'bg-[#14211a] text-white' : 'text-[#425449] hover:text-[#14211a]'
                  }`}
                >
                  {file.filename}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#c2cdc5] bg-white px-3.5 py-2 text-xs font-semibold text-[#14211a] transition-colors hover:bg-[#eff3f0]"
            >
              {copiedFile === activeFile.filename ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#15803d]" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy {activeFile.filename}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleDownload(activeFile.filename, activeFile.content)}
              className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#15803d] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#166534]"
            >
              <Download className="h-3.5 w-3.5" />
              Download File
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#14211a] p-5">
          <pre className="font-mono-num text-xs leading-relaxed text-[#e7efe9]">
            <code>{activeFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
