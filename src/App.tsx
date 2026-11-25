import { useCallback, useState } from 'react';
import { DustbinGuide } from './components/DustbinGuide';
import { ExportKitModal } from './components/ExportKitModal';
import { Header } from './components/Header';
import { ScannerWorkspace } from './components/ScannerWorkspace';
import { SortingQuiz } from './components/SortingQuiz';
import {
  applyScanToImpact,
  type SessionImpact,
  type WasteScanResult,
} from './utils/wasteLogic';

export default function App() {
  const [impact, setImpact] = useState<SessionImpact>({
    itemsSorted: 0,
    co2SavedKg: 0,
  });
  const [kitOpen, setKitOpen] = useState(false);

  const handleScanComplete = useCallback((scanResult: WasteScanResult) => {
    setImpact((prev) => applyScanToImpact(prev, scanResult.co2SavedKg));
  }, []);

  const scrollToScanner = () => {
    document.getElementById('scanner-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-[#14211a]">
      <Header onScanClick={scrollToScanner} onOpenKit={() => setKitOpen(true)} />

      <main>
        {/* Hero & Live Session Eco-Impact Counter */}
        <section className="pt-11 pb-6">
          <div className="mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-7 px-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold leading-tight text-[#14211a] sm:text-[2.6rem] sm:leading-[1.15]">
                Identify any waste item and sort it into the right dustbin.
              </h1>
              <p className="mt-3.5 max-w-[60ch] text-base text-[#425449]">
                Upload, drag-and-drop, or snap a photo of household garbage. EcoSort AI identifies its material composition, assigns the proper color-coded bin, and gives step-by-step disposal instructions.
              </p>
            </div>

            <aside
              aria-label="Session environmental impact"
              className="flex w-full shrink-0 items-center justify-between gap-6 rounded-xl border border-[#dce3de] bg-white px-6 py-4 shadow-xs sm:w-auto sm:justify-start"
            >
              <div className="flex flex-col">
                <span className="text-xs text-[#64756a]">Items Sorted (Session)</span>
                <strong
                  data-testid="items-sorted-count"
                  className="font-mono-num mt-0.5 text-2xl font-semibold text-[#15803d]"
                >
                  {impact.itemsSorted}
                </strong>
              </div>

              <div className="h-9 w-px bg-[#dce3de]" aria-hidden="true" />

              <div className="flex flex-col">
                <span className="text-xs text-[#64756a]">Estimated CO2 Saved</span>
                <strong
                  data-testid="co2-saved-count"
                  className="font-mono-num mt-0.5 text-2xl font-semibold text-[#15803d]"
                >
                  {impact.co2SavedKg.toFixed(2)} kg
                </strong>
              </div>
            </aside>
          </div>
        </section>

        <ScannerWorkspace onScanComplete={handleScanComplete} />
        <DustbinGuide />
        <SortingQuiz />
      </main>

      <footer className="border-t border-[#dce3de] bg-white py-6">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-6 text-xs text-[#64756a]">
          <span>EcoSort AI — Smart Waste Segregation Assistant</span>
          <div className="flex flex-wrap items-center gap-3">
            <span>Green: Organic · Blue: Recyclable · Red: Hazardous · Yellow: E-Waste</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setKitOpen(true)}
              className="cursor-pointer font-semibold text-[#15803d] underline-offset-2 hover:underline"
            >
              Download VS Code 3-File Kit
            </button>
          </div>
        </div>
      </footer>

      <ExportKitModal open={kitOpen} onClose={() => setKitOpen(false)} />
    </div>
  );
}
