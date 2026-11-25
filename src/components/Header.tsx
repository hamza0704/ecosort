interface HeaderProps {
  onScanClick: () => void;
  onOpenKit: () => void;
}

export function Header({ onScanClick, onOpenKit }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#dce3de] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-8 px-6">
        <a
          href="#scanner-section"
          className="shrink-0 whitespace-nowrap text-lg font-bold tracking-tight text-[#14211a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803d]"
        >
          EcoSort AI
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          <a
            href="#scanner-section"
            className="shrink-0 whitespace-nowrap border-b-2 border-transparent py-1 text-sm font-medium text-[#425449] transition-colors hover:border-[#15803d] hover:text-[#14211a]"
          >
            Scanner
          </a>
          <a
            href="#guide-section"
            className="shrink-0 whitespace-nowrap border-b-2 border-transparent py-1 text-sm font-medium text-[#425449] transition-colors hover:border-[#15803d] hover:text-[#14211a]"
          >
            Dustbin Guide
          </a>
          <a
            href="#quiz-section"
            className="shrink-0 whitespace-nowrap border-b-2 border-transparent py-1 text-sm font-medium text-[#425449] transition-colors hover:border-[#15803d] hover:text-[#14211a]"
          >
            Sorting Quiz
          </a>
          <button
            type="button"
            onClick={onOpenKit}
            className="shrink-0 cursor-pointer whitespace-nowrap border-b-2 border-transparent py-1 text-sm font-medium text-[#425449] transition-colors hover:border-[#15803d] hover:text-[#14211a]"
          >
            VS Code Kit
          </button>
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onScanClick}
            className="cursor-pointer whitespace-nowrap rounded-lg bg-[#15803d] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#166534] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803d]"
          >
            Scan Waste
          </button>
        </div>
      </div>
    </header>
  );
}
