export interface StandaloneFile {
  filename: 'index.html' | 'style.css' | 'script.js';
  language: string;
  content: string;
}

export const STANDALONE_KIT_FILES: StandaloneFile[] = [
  {
    filename: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EcoSort AI — Smart Waste Segregation Scanner</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a href="#scanner-section" class="brand-mark">EcoSort AI</a>
      <nav class="main-nav" aria-label="Primary navigation">
        <a href="#scanner-section" class="nav-link">Scanner</a>
        <a href="#guide-section" class="nav-link">Dustbin Guide</a>
        <a href="#quiz-section" class="nav-link">Sorting Quiz</a>
      </nav>
      <button type="button" id="scroll-to-scanner-btn" class="btn btn-primary btn-sm">Scan Waste</button>
    </div>
  </header>

  <main>
    <section class="hero-section">
      <div class="container hero-inner">
        <div class="hero-copy">
          <h1>Identify any waste item and sort it into the right dustbin.</h1>
          <p class="hero-subtitle">Upload, drag-and-drop, or snap a photo of household garbage. EcoSort AI inspects material composition, assigns the proper color-coded bin, and gives step-by-step disposal instructions.</p>
        </div>
        <aside class="impact-strip" aria-label="Session environmental impact">
          <div class="impact-metric">
            <span class="impact-label">Items Sorted (Session)</span>
            <strong id="items-sorted-count" class="impact-value tabular-nums">0</strong>
          </div>
          <div class="impact-divider" aria-hidden="true"></div>
          <div class="impact-metric">
            <span class="impact-label">Estimated CO2 Saved</span>
            <strong id="co2-saved-count" class="impact-value tabular-nums">0.00 kg</strong>
          </div>
        </aside>
      </div>
    </section>

    <section id="scanner-section" class="section">
      <div class="container">
        <div class="scanner-grid">
          <div class="panel scanner-input-panel">
            <div class="panel-header">
              <h2>AI Waste Scanner</h2>
              <p class="panel-subtext">Drag an image, browse files, or capture directly from your camera.</p>
            </div>
            <input type="file" id="file-input" accept="image/*" hidden />
            <input type="file" id="camera-input" accept="image/*" capture="environment" hidden />

            <div id="drop-zone" class="drop-zone" role="region" aria-label="Waste image upload drop zone" tabindex="0">
              <p class="drop-zone-title">Drop a waste photo here</p>
              <p class="drop-zone-hint">Supports JPG, PNG, and WEBP images</p>
              <div class="upload-actions">
                <button type="button" id="browse-btn" class="btn btn-primary">Browse Image</button>
                <button type="button" id="camera-btn" class="btn btn-secondary">Use Camera</button>
              </div>
            </div>

            <div id="preview-panel" class="preview-panel hidden">
              <div class="preview-frame">
                <img id="preview-img" src="" alt="Selected waste item preview" />
                <div id="scan-laser" class="scan-laser hidden" aria-hidden="true"></div>
              </div>
              <div class="preview-bar">
                <span id="preview-filename" class="preview-filename">image.jpg</span>
                <div class="preview-controls">
                  <button type="button" id="reset-scan-btn" class="btn btn-ghost btn-sm">Clear</button>
                  <button type="button" id="scan-now-btn" class="btn btn-primary btn-sm">Analyze Waste</button>
                </div>
              </div>
            </div>

            <div class="samples-block">
              <div class="samples-header"><span class="samples-label">Quick-test samples (no upload needed)</span></div>
              <div id="sample-chips" class="sample-chips">
                <button type="button" class="sample-chip" data-sample="banana-peel">Banana Peel</button>
                <button type="button" class="sample-chip" data-sample="plastic-bottle">PET Water Bottle</button>
                <button type="button" class="sample-chip" data-sample="surgical-mask">Used Surgical Mask</button>
                <button type="button" class="sample-chip" data-sample="aa-batteries">Old AA Batteries</button>
                <button type="button" class="sample-chip" data-sample="greasy-pizza-box">Greasy Pizza Box</button>
              </div>
            </div>
          </div>

          <div class="panel scanner-result-panel" aria-live="polite">
            <div id="result-empty" class="result-state result-empty">
              <h3>Ready to classify</h3>
              <p>Upload a photo or select any quick-test sample on the left to inspect its material composition, dustbin assignment, and eco-impact.</p>
            </div>
            <div id="result-loading" class="result-state result-loading hidden">
              <div class="spinner" aria-hidden="true"></div>
              <h3>Analyzing waste item...</h3>
              <p id="loading-status" class="loading-status">Inspecting material composition with Gemini Vision...</p>
            </div>
            <div id="result-error" class="result-state result-error hidden" role="alert">
              <h3>Scan could not be completed</h3>
              <p id="error-message" class="error-message"></p>
              <button type="button" id="retry-scan-btn" class="btn btn-primary btn-sm">Retry Scan</button>
            </div>
            <div id="result-card" class="result-card hidden">
              <div id="result-bin-banner" class="result-bin-banner bin-green">
                <div>
                  <span id="result-bin-category" class="bin-category-label">Wet · Organic</span>
                  <h3 id="result-bin-name" class="bin-name-heading">Green Dustbin</h3>
                </div>
                <span id="result-bin-code" class="bin-code-symbol" aria-hidden="true">BIO</span>
              </div>
              <div class="result-headline-row">
                <div>
                  <span class="field-label">Identified Item</span>
                  <h4 id="result-item-name" class="result-item-name">Item Name</h4>
                </div>
                <div class="confidence-block">
                  <span class="field-label">Confidence</span>
                  <span id="result-confidence" class="confidence-number tabular-nums">95%</span>
                </div>
              </div>
              <div class="confidence-track" aria-hidden="true">
                <div id="result-confidence-fill" class="confidence-fill" style="width: 95%;"></div>
              </div>
              <div class="result-meta-grid">
                <div>
                  <span class="field-label">Material Composition</span>
                  <p id="result-material" class="meta-value">—</p>
                </div>
                <div>
                  <span class="field-label">CO2 Impact Saved</span>
                  <p id="result-co2" class="meta-value tabular-nums">—</p>
                </div>
              </div>
              <div>
                <span class="field-label">Disposal Steps</span>
                <ol id="result-steps" class="disposal-steps"></ol>
              </div>
              <div class="impact-fact-box">
                <span class="field-label">Environmental Impact Fact</span>
                <p id="result-fact" class="impact-fact-text"></p>
              </div>
              <div class="result-footer-meta"><span id="result-model-used">Model: Gemini Vision</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="guide-section" class="section section-alt">
      <div class="container">
        <div class="section-header-row">
          <div>
            <h2>Color-Coded Dustbin Guide</h2>
            <p class="section-subtext">Standard four-stream waste segregation rules with accepted and prohibited items.</p>
          </div>
          <div id="bin-filter-tabs" class="filter-tabs" role="tablist" aria-label="Filter dustbins">
            <button type="button" class="filter-tab active" data-filter="all" role="tab" aria-selected="true">All Bins</button>
            <button type="button" class="filter-tab" data-filter="green" role="tab" aria-selected="false">Green</button>
            <button type="button" class="filter-tab" data-filter="blue" role="tab" aria-selected="false">Blue</button>
            <button type="button" class="filter-tab" data-filter="red" role="tab" aria-selected="false">Red</button>
            <button type="button" class="filter-tab" data-filter="yellow" role="tab" aria-selected="false">Yellow</button>
          </div>
        </div>
        <div class="bin-guide-grid" id="bin-guide-grid">
          <article class="bin-card" data-bin="green">
            <div class="bin-card-top bin-green"><span class="bin-card-kicker">Wet · Organic · Biodegradable</span><h3>Green Dustbin</h3></div>
            <div class="bin-card-body">
              <div class="bin-list-group"><h4>Accepted Items</h4><ul class="bin-list accepted"><li>Fruit peels, vegetable scraps, and food leftovers</li><li>Coffee grounds, tea leaves, and eggshells</li><li>Garden trimmings and fallen leaves</li><li>Greasy uncoated paper napkins and pizza boxes</li></ul></div>
              <div class="bin-list-group"><h4>Prohibited Items</h4><ul class="bin-list prohibited"><li>Plastic bags, food wrappers, and foil containers</li><li>Glass, metal cans, or synthetic fibers</li><li>Medical waste, diapers, or chemical liquids</li></ul></div>
            </div>
          </article>
          <article class="bin-card" data-bin="blue">
            <div class="bin-card-top bin-blue"><span class="bin-card-kicker">Dry · Recyclable Materials</span><h3>Blue Dustbin</h3></div>
            <div class="bin-card-body">
              <div class="bin-list-group"><h4>Accepted Items</h4><ul class="bin-list accepted"><li>Rinsed PET plastic bottles and rigid containers</li><li>Clean cardboard boxes, newspapers, and paper</li><li>Empty glass bottles and jars</li><li>Aluminum beverage cans and clean tin cans</li></ul></div>
              <div class="bin-list-group"><h4>Prohibited Items</h4><ul class="bin-list prohibited"><li>Food-stained cardboard or oily paper</li><li>Used tissues, diapers, or sanitary pads</li><li>Batteries, light bulbs, or electronic cables</li></ul></div>
            </div>
          </article>
          <article class="bin-card" data-bin="red">
            <div class="bin-card-top bin-red"><span class="bin-card-kicker">Hazardous · Biomedical Waste</span><h3>Red Dustbin</h3></div>
            <div class="bin-card-body">
              <div class="bin-list-group"><h4>Accepted Items</h4><ul class="bin-list accepted"><li>Used surgical masks, gloves, and soiled bandages</li><li>Syringes and needles (in puncture-proof box)</li><li>Sanitary napkins, diapers, and expired medicines</li><li>Paints, pesticides, and corrosive chemicals</li></ul></div>
              <div class="bin-list-group"><h4>Prohibited Items</h4><ul class="bin-list prohibited"><li>Clean recyclable paper or plastic bottles</li><li>Kitchen vegetable scraps or food waste</li><li>Consumer electronics and intact batteries</li></ul></div>
            </div>
          </article>
          <article class="bin-card" data-bin="yellow">
            <div class="bin-card-top bin-yellow"><span class="bin-card-kicker">E-Waste · Electronic Equipment</span><h3>Yellow / E-Waste Bin</h3></div>
            <div class="bin-card-body">
              <div class="bin-list-group"><h4>Accepted Items</h4><ul class="bin-list accepted"><li>AA/AAA, coin-cell, and lithium-ion batteries</li><li>Broken smartphones, laptops, and circuit boards</li><li>Frayed USB cables, chargers, and power banks</li><li>LED bulbs, CFL tubes, and small appliances</li></ul></div>
              <div class="bin-list-group"><h4>Prohibited Items</h4><ul class="bin-list prohibited"><li>Organic kitchen waste or liquids</li><li>Medical sharps or biohazard items</li><li>General paper or cardboard packaging</li></ul></div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="quiz-section" class="section">
      <div class="container">
        <div class="quiz-container panel">
          <div class="quiz-top-bar">
            <div>
              <h2>Tricky Waste Sorting Mini-Quiz</h2>
              <p class="panel-subtext">Test your instincts on three commonly mis-sorted everyday items.</p>
            </div>
            <div class="quiz-status-meta tabular-nums">
              <span id="quiz-progress">Question 1 of 3</span>
              <span aria-hidden="true">·</span>
              <span id="quiz-score-badge">Score: 0 / 3</span>
            </div>
          </div>
          <div id="quiz-active-area">
            <p id="quiz-question-text" class="quiz-question"></p>
            <div id="quiz-options" class="quiz-options" role="group" aria-label="Dustbin choices"></div>
            <div id="quiz-feedback" class="quiz-feedback hidden" aria-live="polite"></div>
            <div class="quiz-actions"><button type="button" id="quiz-next-btn" class="btn btn-primary hidden">Next Question</button></div>
          </div>
          <div id="quiz-summary" class="quiz-summary hidden">
            <h3 id="quiz-final-score">You scored 3 / 3</h3>
            <p id="quiz-summary-message"></p>
            <button type="button" id="quiz-restart-btn" class="btn btn-primary">Retake Quiz</button>
          </div>
        </div>
      </div>
    </section>
  </main>

  <div id="camera-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="camera-modal-title">
    <div class="modal-card">
      <div class="modal-header">
        <h3 id="camera-modal-title">Capture Waste Photo</h3>
        <button type="button" id="close-camera-btn" class="btn btn-ghost btn-sm">Close</button>
      </div>
      <div class="camera-viewport">
        <video id="camera-video" autoplay playsinline></video>
        <canvas id="camera-canvas" hidden></canvas>
      </div>
      <div class="modal-footer">
        <button type="button" id="capture-photo-btn" class="btn btn-primary">Capture &amp; Preview</button>
      </div>
    </div>
  </div>

  <footer class="site-footer">
    <div class="container footer-inner">
      <span>EcoSort AI — Smart Waste Segregation Assistant</span>
      <span>Green: Organic · Blue: Recyclable · Red: Hazardous · Yellow: E-Waste</span>
    </div>
  </footer>
  <script src="script.js"></script>
</body>
</html>`,
  },
  {
    filename: 'style.css',
    language: 'css',
    content: `:root {
  --bg-canvas: #f7f9f7;
  --bg-alt: #eff3f0;
  --surface: #ffffff;
  --border: #dce3de;
  --border-strong: #c2cdc5;
  --ink-primary: #14211a;
  --ink-secondary: #425449;
  --ink-muted: #64756a;
  --accent: #15803d;
  --accent-hover: #166534;
  --accent-soft: #ecfdf3;
  --bin-green-bg: #ecfdf3; --bin-green-ink: #14532d; --bin-green-border: #bbf7d0;
  --bin-blue-bg: #eff6ff; --bin-blue-ink: #1e3a8a; --bin-blue-border: #bfdbfe;
  --bin-red-bg: #fef2f2; --bin-red-ink: #991b1b; --bin-red-border: #fecaca;
  --bin-yellow-bg: #fffbeb; --bin-yellow-ink: #92400e; --bin-yellow-border: #fde68a;
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;
}
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: "Plus Jakarta Sans", sans-serif; font-size: 15px; line-height: 1.6; color: var(--ink-primary); background: var(--bg-canvas); }
h1, h2, h3, h4, p { margin: 0; }
.tabular-nums { font-family: "IBM Plex Mono", monospace; font-variant-numeric: tabular-nums; }
.hidden { display: none !important; }
.container { width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 24px; }
.site-header { position: sticky; top: 0; z-index: 40; background: rgba(255,255,255,0.94); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); }
.header-inner { height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 32px; }
.brand-mark { font-size: 1.125rem; font-weight: 700; color: var(--ink-primary); text-decoration: none; white-space: nowrap; }
.main-nav { display: flex; align-items: center; gap: 28px; }
.nav-link { font-size: 0.9rem; font-weight: 500; color: var(--ink-secondary); text-decoration: none; white-space: nowrap; }
.nav-link:hover { color: var(--ink-primary); }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit; font-size: 0.9rem; font-weight: 600; padding: 12px 20px; border-radius: var(--radius-sm); border: 1px solid transparent; cursor: pointer; white-space: nowrap; }
.btn-sm { padding: 9px 14px; font-size: 0.84rem; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-secondary { background: var(--surface); color: var(--ink-primary); border-color: var(--border-strong); }
.btn-ghost { background: transparent; color: var(--ink-secondary); }
.hero-section { padding: 48px 0 28px; }
.hero-inner { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }
.hero-copy { max-width: 680px; }
.hero-copy h1 { font-size: clamp(2rem, 3.6vw, 2.85rem); line-height: 1.15; margin-bottom: 14px; }
.hero-subtitle { color: var(--ink-secondary); }
.impact-strip { display: flex; align-items: center; gap: 24px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 24px; }
.impact-metric { display: flex; flex-direction: column; gap: 4px; }
.impact-label { font-size: 0.78rem; color: var(--ink-muted); }
.impact-value { font-size: 1.35rem; color: var(--accent); }
.impact-divider { width: 1px; height: 36px; background: var(--border); }
.section { padding: 24px 0 56px; }
.section-alt { background: var(--bg-alt); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 56px 0; }
.panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; }
.panel-header { margin-bottom: 20px; }
.panel-subtext, .section-subtext { font-size: 0.92rem; color: var(--ink-secondary); }
.scanner-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.scanner-input-panel, .scanner-result-panel { display: flex; flex-direction: column; }
.drop-zone { border: 1.5px dashed var(--border-strong); border-radius: var(--radius-md); background: var(--bg-canvas); padding: 40px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 260px; }
.drop-zone.drag-over { border-color: var(--accent); background: var(--accent-soft); }
.drop-zone-title { font-size: 1.05rem; font-weight: 600; margin-bottom: 4px; }
.drop-zone-hint { font-size: 0.85rem; color: var(--ink-muted); margin-bottom: 20px; }
.upload-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.preview-panel { display: flex; flex-direction: column; gap: 14px; }
.preview-frame { position: relative; aspect-ratio: 4 / 3; border-radius: var(--radius-md); overflow: hidden; background: var(--bg-alt); border: 1px solid var(--border); }
.preview-frame img { width: 100%; height: 100%; object-fit: contain; display: block; }
.scan-laser { position: absolute; left: 0; right: 0; height: 3px; background: var(--accent); animation: laserSweep 1.3s ease-in-out infinite alternate; }
@keyframes laserSweep { from { top: 4%; } to { top: 94%; } }
.preview-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.preview-controls { display: flex; gap: 8px; }
.samples-block { margin-top: auto; padding-top: 22px; border-top: 1px solid var(--border); }
.samples-label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--ink-secondary); margin-bottom: 10px; }
.sample-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.sample-chip { font-family: inherit; font-size: 0.83rem; font-weight: 500; background: var(--bg-canvas); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); padding: 8px 12px; cursor: pointer; }
.sample-chip.active, .sample-chip:hover { background: var(--accent-soft); border-color: var(--accent); color: var(--accent-hover); }
.result-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 36px 20px; gap: 10px; }
.spinner { width: 34px; height: 34px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-message { color: var(--bin-red-ink); }
.result-card { display: flex; flex-direction: column; gap: 18px; }
.result-bin-banner { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-radius: var(--radius-md); border: 1px solid transparent; }
.bin-green { background: var(--bin-green-bg); color: var(--bin-green-ink); border-color: var(--bin-green-border); }
.bin-blue { background: var(--bin-blue-bg); color: var(--bin-blue-ink); border-color: var(--bin-blue-border); }
.bin-red { background: var(--bin-red-bg); color: var(--bin-red-ink); border-color: var(--bin-red-border); }
.bin-yellow { background: var(--bin-yellow-bg); color: var(--bin-yellow-ink); border-color: var(--bin-yellow-border); }
.bin-code-symbol { font-family: "IBM Plex Mono", monospace; font-size: 0.82rem; font-weight: 600; padding: 6px 10px; border-radius: 6px; border: 1px solid currentColor; }
.field-label { display: block; font-size: 0.78rem; font-weight: 600; color: var(--ink-muted); margin-bottom: 4px; }
.result-headline-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
.confidence-track { width: 100%; height: 7px; background: var(--bg-alt); border-radius: 4px; overflow: hidden; }
.confidence-fill { height: 100%; background: var(--accent); }
.result-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 14px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.disposal-steps { margin: 0; padding-left: 20px; color: var(--ink-secondary); }
.impact-fact-box { background: var(--bg-canvas); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px 16px; }
.result-footer-meta { font-size: 0.78rem; color: var(--ink-muted); text-align: right; }
.section-header-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 28px; flex-wrap: wrap; }
.filter-tabs { display: inline-flex; gap: 4px; padding: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); }
.filter-tab { font-family: inherit; font-size: 0.84rem; font-weight: 600; color: var(--ink-secondary); background: transparent; border: none; border-radius: 6px; padding: 7px 14px; cursor: pointer; }
.filter-tab.active { background: var(--ink-primary); color: #fff; }
.bin-guide-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.bin-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
.bin-card-top { padding: 18px 22px; }
.bin-card-body { padding: 20px 22px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.bin-list { margin: 0; padding-left: 16px; font-size: 0.86rem; color: var(--ink-secondary); }
.bin-list.prohibited { color: var(--bin-red-ink); }
.quiz-container { max-width: 820px; margin: 0 auto; }
.quiz-top-bar { display: flex; justify-content: space-between; gap: 16px; padding-bottom: 20px; border-bottom: 1px solid var(--border); margin-bottom: 24px; flex-wrap: wrap; }
.quiz-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 18px 0; }
.quiz-option-btn { font-family: inherit; text-align: left; padding: 14px 16px; background: var(--bg-canvas); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); cursor: pointer; display: flex; flex-direction: column; gap: 2px; }
.quiz-option-btn.correct { background: var(--bin-green-bg); border-color: var(--accent); }
.quiz-option-btn.incorrect { background: var(--bin-red-bg); border-color: #dc2626; }
.quiz-feedback { padding: 14px 16px; border-radius: var(--radius-sm); margin-bottom: 16px; border: 1px solid var(--border); }
.quiz-feedback.correct { background: var(--bin-green-bg); color: var(--bin-green-ink); }
.quiz-feedback.incorrect { background: var(--bin-red-bg); color: var(--bin-red-ink); }
.quiz-actions { display: flex; justify-content: flex-end; }
.quiz-summary { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(20,33,26,0.55); display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-card { width: 100%; max-width: 560px; background: var(--surface); border-radius: var(--radius-lg); overflow: hidden; }
.modal-header, .modal-footer { padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; }
.camera-viewport { background: #111827; aspect-ratio: 4 / 3; }
.camera-viewport video { width: 100%; height: 100%; object-fit: cover; }
.site-footer { border-top: 1px solid var(--border); background: var(--surface); padding: 24px 0; }
.footer-inner { display: flex; justify-content: space-between; gap: 16px; font-size: 0.84rem; color: var(--ink-muted); flex-wrap: wrap; }
@media (max-width: 960px) { .hero-inner { flex-direction: column; align-items: flex-start; } .scanner-grid, .bin-guide-grid { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .main-nav { display: none; } .bin-card-body, .quiz-options, .result-meta-grid { grid-template-columns: 1fr; } }`,
  },
  {
    filename: 'script.js',
    language: 'javascript',
    content: `const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // <-- Paste your Gemini API key here for local VS Code Live Server

const GEMINI_MODELS = ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];
const MAX_RETRIES_PER_MODEL = 2;

const BIN_META = {
  green: { name: "Green Dustbin", category: "Wet · Organic · Biodegradable", code: "BIO", cssClass: "bin-green" },
  blue: { name: "Blue Dustbin", category: "Dry · Recyclable", code: "REC", cssClass: "bin-blue" },
  red: { name: "Red Dustbin", category: "Hazardous · Biomedical", code: "HAZ", cssClass: "bin-red" },
  yellow: { name: "Yellow / E-Waste Bin", category: "Electronic & Battery Waste", code: "EWST", cssClass: "bin-yellow" }
};

function makeSampleSvg(bg, accent, title, subtitle) {
  const svg = \`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" fill="\${bg}"/><rect x="44" y="44" width="552" height="392" rx="18" fill="#ffffff" stroke="\${accent}" stroke-width="2" stroke-opacity="0.35"/><circle cx="320" cy="205" r="70" fill="\${bg}" stroke="\${accent}" stroke-width="4"/><text x="320" y="216" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="28" font-weight="700" fill="\${accent}">\${title.slice(0,3).toUpperCase()}</text><text x="320" y="325" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="26" font-weight="700" fill="#14211a">\${title}</text><text x="320" y="360" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="16" fill="#425449">\${subtitle}</text></svg>\`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

const SAMPLE_ITEMS = {
  "banana-peel": {
    filename: "sample-banana-peel.svg",
    image: makeSampleSvg("#ecfdf3", "#15803d", "Banana Peel", "Quick-Test Sample · Organic Waste"),
    result: { itemName: "Ripe Banana Peel", binColor: "green", materialComposition: "100% biodegradable plant cellulose", confidence: 99, co2SavedKg: 0.18, disposalSteps: ["Remove produce stickers.", "Place directly in the Green Dustbin.", "Avoid wrapping organic waste in plastic."], environmentalFact: "Composting fruit scraps avoids landfill methane and returns humus to soil within weeks.", modelUsed: "Quick-Test Sample" }
  },
  "plastic-bottle": {
    filename: "sample-pet-bottle.svg",
    image: makeSampleSvg("#eff6ff", "#1d4ed8", "PET Water Bottle", "Quick-Test Sample · Recyclable Plastic"),
    result: { itemName: "Clear PET Plastic Water Bottle", binColor: "blue", materialComposition: "PET #1 plastic with HDPE cap", confidence: 97, co2SavedKg: 0.32, disposalSteps: ["Empty and rinse the bottle.", "Flatten to save bin space.", "Place cleanly in the Blue Dustbin."], environmentalFact: "Recycling one PET bottle saves enough energy to power an LED bulb for 18 hours.", modelUsed: "Quick-Test Sample" }
  },
  "surgical-mask": {
    filename: "sample-surgical-mask.svg",
    image: makeSampleSvg("#fef2f2", "#dc2626", "Used Surgical Mask", "Quick-Test Sample · Biomedical Waste"),
    result: { itemName: "Disposable Surgical Face Mask", binColor: "red", materialComposition: "Melt-blown polypropylene & elastic loops", confidence: 98, co2SavedKg: 0.12, disposalSteps: ["Fold inward to contain surface.", "Snip ear loops.", "Wrap and place in the Red Dustbin."], environmentalFact: "Proper red-bin disposal protects sanitation staff from pathogens and prevents microplastics.", modelUsed: "Quick-Test Sample" }
  },
  "aa-batteries": {
    filename: "sample-aa-batteries.svg",
    image: makeSampleSvg("#fffbeb", "#b45309", "Old AA Batteries", "Quick-Test Sample · E-Waste"),
    result: { itemName: "Spent AA Batteries", binColor: "yellow", materialComposition: "Zinc, manganese dioxide, steel, electrolytes", confidence: 96, co2SavedKg: 0.65, disposalSteps: ["Tape over battery terminals.", "Keep dry and out of household bins.", "Drop in the Yellow / E-Waste Bin."], environmentalFact: "Battery recycling reclaims up to 90% of metals and protects groundwater.", modelUsed: "Quick-Test Sample" }
  },
  "greasy-pizza-box": {
    filename: "sample-greasy-pizza-box.svg",
    image: makeSampleSvg("#ecfdf3", "#15803d", "Greasy Pizza Box", "Quick-Test Sample · Soiled Cardboard"),
    result: { itemName: "Oil-Soaked Pizza Box Base", binColor: "green", materialComposition: "Uncoated kraft cardboard with food grease", confidence: 94, co2SavedKg: 0.24, disposalSteps: ["Recycle the clean top lid in the Blue Dustbin.", "Place the greasy bottom in the Green Dustbin.", "Never mix oily cardboard into paper recycling."], environmentalFact: "Food oil ruins recycled paper pulp; composting greasy bases keeps recycling clean.", modelUsed: "Quick-Test Sample" }
  }
};

const QUIZ_QUESTIONS = [
  { question: "1. Where should the grease-stained bottom half of a cardboard pizza box go?", correct: "green", explanation: "Oil contaminates paper pulp. Put the greasy bottom in the Green bin and recycle only the clean top lid in the Blue bin." },
  { question: "2. Where should a used surgical mask and an empty expired medicine blister pack go?", correct: "red", explanation: "Used masks and medical items belong in the Red (Hazardous / Biomedical) dustbin." },
  { question: "3. Where should a frayed USB cable and two dead AA batteries be disposed of?", correct: "yellow", explanation: "Cables and batteries contain recoverable metals and hazardous electrolytes—use the Yellow / E-Waste bin." }
];

const els = {
  scrollToScannerBtn: document.getElementById("scroll-to-scanner-btn"),
  itemsSortedCount: document.getElementById("items-sorted-count"),
  co2SavedCount: document.getElementById("co2-saved-count"),
  dropZone: document.getElementById("drop-zone"),
  fileInput: document.getElementById("file-input"),
  cameraInput: document.getElementById("camera-input"),
  browseBtn: document.getElementById("browse-btn"),
  cameraBtn: document.getElementById("camera-btn"),
  previewPanel: document.getElementById("preview-panel"),
  previewImg: document.getElementById("preview-img"),
  scanLaser: document.getElementById("scan-laser"),
  previewFilename: document.getElementById("preview-filename"),
  scanNowBtn: document.getElementById("scan-now-btn"),
  resetScanBtn: document.getElementById("reset-scan-btn"),
  sampleChips: document.querySelectorAll(".sample-chip"),
  resultEmpty: document.getElementById("result-empty"),
  resultLoading: document.getElementById("result-loading"),
  loadingStatus: document.getElementById("loading-status"),
  resultError: document.getElementById("result-error"),
  errorMessage: document.getElementById("error-message"),
  retryScanBtn: document.getElementById("retry-scan-btn"),
  resultCard: document.getElementById("result-card"),
  resultBinBanner: document.getElementById("result-bin-banner"),
  resultBinCategory: document.getElementById("result-bin-category"),
  resultBinName: document.getElementById("result-bin-name"),
  resultBinCode: document.getElementById("result-bin-code"),
  resultItemName: document.getElementById("result-item-name"),
  resultConfidence: document.getElementById("result-confidence"),
  resultConfidenceFill: document.getElementById("result-confidence-fill"),
  resultMaterial: document.getElementById("result-material"),
  resultCo2: document.getElementById("result-co2"),
  resultSteps: document.getElementById("result-steps"),
  resultFact: document.getElementById("result-fact"),
  resultModelUsed: document.getElementById("result-model-used"),
  filterTabs: document.querySelectorAll(".filter-tab"),
  binCards: document.querySelectorAll(".bin-card"),
  quizProgress: document.getElementById("quiz-progress"),
  quizScoreBadge: document.getElementById("quiz-score-badge"),
  quizActiveArea: document.getElementById("quiz-active-area"),
  quizQuestionText: document.getElementById("quiz-question-text"),
  quizOptions: document.getElementById("quiz-options"),
  quizFeedback: document.getElementById("quiz-feedback"),
  quizNextBtn: document.getElementById("quiz-next-btn"),
  quizSummary: document.getElementById("quiz-summary"),
  quizFinalScore: document.getElementById("quiz-final-score"),
  quizSummaryMessage: document.getElementById("quiz-summary-message"),
  quizRestartBtn: document.getElementById("quiz-restart-btn"),
  cameraModal: document.getElementById("camera-modal"),
  cameraVideo: document.getElementById("camera-video"),
  cameraCanvas: document.getElementById("camera-canvas"),
  capturePhotoBtn: document.getElementById("capture-photo-btn"),
  closeCameraBtn: document.getElementById("close-camera-btn")
};

const state = { itemsSorted: 0, co2SavedKg: 0, currentImageBase64: null, currentMimeType: "image/jpeg", currentSampleKey: null, isScanning: false, webcamStream: null, quizIndex: 0, quizScore: 0, quizAnswered: false };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function setResultView(view) {
  els.resultEmpty.classList.toggle("hidden", view !== "empty");
  els.resultLoading.classList.toggle("hidden", view !== "loading");
  els.resultError.classList.toggle("hidden", view !== "error");
  els.resultCard.classList.toggle("hidden", view !== "result");
  els.scanLaser.classList.toggle("hidden", view !== "loading");
}

function renderScanResult(data) {
  const binInfo = BIN_META[data.binColor] || BIN_META.blue;
  const conf = Math.max(1, Math.min(100, Math.round(Number(data.confidence) || 90)));
  const co2 = Math.max(0.05, Number(data.co2SavedKg) || 0.2);
  els.resultBinBanner.className = "result-bin-banner " + binInfo.cssClass;
  els.resultBinCategory.textContent = binInfo.category;
  els.resultBinName.textContent = binInfo.name;
  els.resultBinCode.textContent = binInfo.code;
  els.resultItemName.textContent = data.itemName || "Waste Item";
  els.resultConfidence.textContent = conf + "%";
  els.resultConfidenceFill.style.width = conf + "%";
  els.resultMaterial.textContent = data.materialComposition || "Mixed material";
  els.resultCo2.textContent = "+" + co2.toFixed(2) + " kg CO2e";
  els.resultSteps.innerHTML = "";
  (data.disposalSteps || ["Place in the indicated dustbin."]).forEach((s) => { const li = document.createElement("li"); li.textContent = s; els.resultSteps.appendChild(li); });
  els.resultFact.textContent = data.environmentalFact || "Proper segregation improves recycling recovery.";
  els.resultModelUsed.textContent = "Analyzed via " + (data.modelUsed || "Gemini Vision");
  state.itemsSorted += 1;
  state.co2SavedKg += co2;
  els.itemsSortedCount.textContent = String(state.itemsSorted);
  els.co2SavedCount.textContent = state.co2SavedKg.toFixed(2) + " kg";
  setResultView("result");
}

async function scanWithFallback(base64Data, mimeType) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    throw new Error('Paste your Gemini API key on line 1 of script.js, or click a quick-test sample chip.');
  }
  const prompt = 'Classify this waste item into ONE bin ("green" organic, "blue" recyclable, "red" hazardous/biomedical, "yellow" e-waste). Return strict JSON: {"itemName":"","binColor":"green|blue|red|yellow","materialComposition":"","confidence":95,"co2SavedKg":0.25,"disposalSteps":["",""],"environmentalFact":""}';
  let lastError = null;
  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        els.loadingStatus.textContent = attempt === 1 ? "Scanning with " + model + "..." : "Retrying " + model + "...";
        const res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${model}:generateContent?key=\${encodeURIComponent(GEMINI_API_KEY)}\`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Data } }] }], generationConfig: { responseMimeType: "application/json" } })
        });
        if (!res.ok) { const e = new Error("HTTP " + res.status); e.status = res.status; throw e; }
        const json = await res.json();
        const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed = JSON.parse(raw.replace(/^[\x60]{3}json\s*/i, "").replace(/[\x60]{3}$/i, "").trim());
        parsed.binColor = String(parsed.binColor || "").toLowerCase().trim();
        parsed.modelUsed = model;
        return parsed;
      } catch (err) {
        lastError = err;
        if ([400, 401, 403].includes(err.status)) throw err;
        if (attempt < MAX_RETRIES_PER_MODEL) await sleep(700 * Math.pow(2, attempt - 1));
      }
    }
  }
  throw new Error("All Gemini models are currently unavailable: " + (lastError?.message || "Unknown error"));
}

async function analyzeCurrentItem() {
  if (state.isScanning) return;
  if (state.currentSampleKey && SAMPLE_ITEMS[state.currentSampleKey]) {
    state.isScanning = true;
    els.loadingStatus.textContent = "Inspecting quick-test sample...";
    setResultView("loading");
    await sleep(500);
    renderScanResult(SAMPLE_ITEMS[state.currentSampleKey].result);
    state.isScanning = false;
    return;
  }
  if (!state.currentImageBase64) return;
  state.isScanning = true;
  setResultView("loading");
  try {
    const result = await scanWithFallback(state.currentImageBase64, state.currentMimeType);
    renderScanResult(result);
  } catch (err) {
    els.errorMessage.textContent = err.message;
    setResultView("error");
  } finally {
    state.isScanning = false;
  }
}

function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.currentSampleKey = null;
    state.currentImageBase64 = String(reader.result).split(",")[1];
    state.currentMimeType = file.type;
    els.previewImg.src = reader.result;
    els.previewFilename.textContent = file.name;
    els.dropZone.classList.add("hidden");
    els.previewPanel.classList.remove("hidden");
    analyzeCurrentItem();
  };
  reader.readAsDataURL(file);
}

function renderQuiz() {
  const q = QUIZ_QUESTIONS[state.quizIndex];
  state.quizAnswered = false;
  els.quizActiveArea.classList.remove("hidden");
  els.quizSummary.classList.add("hidden");
  els.quizProgress.textContent = \`Question \${state.quizIndex + 1} of \${QUIZ_QUESTIONS.length}\`;
  els.quizScoreBadge.textContent = \`Score: \${state.quizScore} / \${QUIZ_QUESTIONS.length}\`;
  els.quizQuestionText.textContent = q.question;
  els.quizFeedback.className = "quiz-feedback hidden";
  els.quizNextBtn.classList.add("hidden");
  els.quizOptions.innerHTML = "";
  ["green", "blue", "red", "yellow"].forEach((bin) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quiz-option-btn";
    btn.innerHTML = \`<strong>\${BIN_META[bin].name}</strong><span>\${BIN_META[bin].category}</span>\`;
    btn.onclick = () => {
      if (state.quizAnswered) return;
      state.quizAnswered = true;
      const ok = bin === q.correct;
      if (ok) state.quizScore += 1;
      els.quizScoreBadge.textContent = \`Score: \${state.quizScore} / \${QUIZ_QUESTIONS.length}\`;
      btn.classList.add(ok ? "correct" : "incorrect");
      els.quizFeedback.className = "quiz-feedback " + (ok ? "correct" : "incorrect");
      els.quizFeedback.textContent = (ok ? "Correct — " : "Not quite — ") + q.explanation;
      els.quizNextBtn.textContent = state.quizIndex < QUIZ_QUESTIONS.length - 1 ? "Next Question" : "View Results";
      els.quizNextBtn.classList.remove("hidden");
    };
    els.quizOptions.appendChild(btn);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  els.scrollToScannerBtn.onclick = () => document.getElementById("scanner-section").scrollIntoView({ behavior: "smooth" });
  els.browseBtn.onclick = () => els.fileInput.click();
  els.cameraBtn.onclick = () => els.cameraInput.click();
  els.fileInput.onchange = (e) => handleFile(e.target.files[0]);
  els.cameraInput.onchange = (e) => handleFile(e.target.files[0]);
  ["dragenter", "dragover"].forEach((ev) => els.dropZone.addEventListener(ev, (e) => { e.preventDefault(); els.dropZone.classList.add("drag-over"); }));
  ["dragleave", "drop"].forEach((ev) => els.dropZone.addEventListener(ev, (e) => { e.preventDefault(); els.dropZone.classList.remove("drag-over"); }));
  els.dropZone.addEventListener("drop", (e) => handleFile(e.dataTransfer.files[0]));
  els.scanNowBtn.onclick = analyzeCurrentItem;
  els.retryScanBtn.onclick = analyzeCurrentItem;
  els.resetScanBtn.onclick = () => { state.currentImageBase64 = null; state.currentSampleKey = null; els.previewPanel.classList.add("hidden"); els.dropZone.classList.remove("hidden"); setResultView("empty"); };
  els.sampleChips.forEach((chip) => {
    chip.onclick = () => {
      const s = SAMPLE_ITEMS[chip.dataset.sample];
      if (!s) return;
      state.currentSampleKey = chip.dataset.sample;
      els.previewImg.src = s.image;
      els.previewFilename.textContent = s.filename;
      els.dropZone.classList.add("hidden");
      els.previewPanel.classList.remove("hidden");
      analyzeCurrentItem();
    };
  });
  els.filterTabs.forEach((tab) => {
    tab.onclick = () => {
      els.filterTabs.forEach((t) => t.classList.toggle("active", t === tab));
      els.binCards.forEach((c) => c.classList.toggle("hidden", tab.dataset.filter !== "all" && c.dataset.bin !== tab.dataset.filter));
    };
  });
  els.quizNextBtn.onclick = () => {
    if (state.quizIndex < QUIZ_QUESTIONS.length - 1) { state.quizIndex += 1; renderQuiz(); }
    else { els.quizActiveArea.classList.add("hidden"); els.quizSummary.classList.remove("hidden"); els.quizFinalScore.textContent = \`You scored \${state.quizScore} / \${QUIZ_QUESTIONS.length}\`; }
  };
  els.quizRestartBtn.onclick = () => { state.quizIndex = 0; state.quizScore = 0; renderQuiz(); };
  setResultView("empty");
  renderQuiz();
});`,
  },
];
