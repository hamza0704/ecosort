import { useState } from 'react';
import {
  filterBins,
  type BinColor,
  type BinFilter,
} from '../utils/wasteLogic';

const FILTER_OPTIONS: { id: BinFilter; label: string }[] = [
  { id: 'all', label: 'All Bins' },
  { id: 'green', label: 'Green' },
  { id: 'blue', label: 'Blue' },
  { id: 'red', label: 'Red' },
  { id: 'yellow', label: 'Yellow' },
];

const BIN_HEADER_STYLES: Record<BinColor, string> = {
  green: 'bg-[#ecfdf3] text-[#14532d] border-b border-[#bbf7d0]',
  blue: 'bg-[#eff6ff] text-[#1e3a8a] border-b border-[#bfdbfe]',
  red: 'bg-[#fef2f2] text-[#991b1b] border-b border-[#fecaca]',
  yellow: 'bg-[#fffbeb] text-[#92400e] border-b border-[#fde68a]',
};

export function DustbinGuide() {
  const [activeFilter, setActiveFilter] = useState<BinFilter>('all');
  const visibleBins = filterBins(activeFilter);

  return (
    <section
      id="guide-section"
      className="border-y border-[#dce3de] bg-[#eff3f0] py-14"
    >
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2 className="text-2xl font-bold text-[#14211a]">
              Color-Coded Dustbin Guide
            </h2>
            <p className="mt-1 text-sm text-[#425449]">
              Standard four-stream waste segregation rules with accepted and prohibited items.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter dustbins by color"
            className="inline-flex items-center gap-1 rounded-lg border border-[#dce3de] bg-white p-1"
          >
            {FILTER_OPTIONS.map((option) => {
              const selected = activeFilter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveFilter(option.id)}
                  className={`cursor-pointer whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803d] ${
                    selected
                      ? 'bg-[#14211a] text-white'
                      : 'text-[#425449] hover:text-[#14211a]'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`grid grid-cols-1 gap-5 ${
            visibleBins.length > 1 ? 'lg:grid-cols-2' : 'max-w-2xl'
          }`}
        >
          {visibleBins.map((bin) => (
            <article
              key={bin.id}
              data-testid={`bin-card-${bin.id}`}
              className="overflow-hidden rounded-xl border border-[#dce3de] bg-white shadow-xs"
            >
              <div className={`flex items-center justify-between px-6 py-4 ${BIN_HEADER_STYLES[bin.id]}`}>
                <div>
                  <p className="text-xs font-semibold opacity-85">{bin.category}</p>
                  <h3 className="mt-0.5 text-lg font-bold">{bin.name}</h3>
                </div>
                <span className="font-mono-num rounded-md border border-current px-2.5 py-1 text-xs font-semibold">
                  {bin.code}
                </span>
              </div>

              <div className="p-6">
                <p className="mb-5 text-sm text-[#425449]">{bin.summary}</p>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-xs font-bold text-[#14532d]">
                      Accepted Items
                    </h4>
                    <ul className="list-disc space-y-1.5 pl-4 text-sm text-[#425449]">
                      {bin.accepted.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 text-xs font-bold text-[#991b1b]">
                      Prohibited Items
                    </h4>
                    <ul className="list-disc space-y-1.5 pl-4 text-sm text-[#7f1d1d]">
                      {bin.prohibited.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
