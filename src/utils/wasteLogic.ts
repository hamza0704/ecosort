export type BinColor = 'green' | 'blue' | 'red' | 'yellow';

export type BinFilter = 'all' | BinColor;

export interface BinDefinition {
  id: BinColor;
  name: string;
  shortName: string;
  category: string;
  code: string;
  summary: string;
  accepted: string[];
  prohibited: string[];
}

export interface WasteScanResult {
  itemName: string;
  binColor: BinColor;
  materialComposition: string;
  confidence: number;
  co2SavedKg: number;
  disposalSteps: string[];
  environmentalFact: string;
  modelUsed: string;
}

export interface SessionImpact {
  itemsSorted: number;
  co2SavedKg: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  correctBin: BinColor;
  explanation: string;
}

export interface QuizState {
  currentIndex: number;
  score: number;
  selectedBin: BinColor | null;
  completed: boolean;
}

export const BIN_REGISTRY: Record<BinColor, BinDefinition> = {
  green: {
    id: 'green',
    name: 'Green Dustbin',
    shortName: 'Green',
    category: 'Wet · Organic · Biodegradable',
    code: 'BIO',
    summary: 'Food scraps, plant matter, and uncoated food-soiled paper that composts naturally.',
    accepted: [
      'Fruit peels, vegetable trimmings, and cooked food leftovers',
      'Coffee grounds, loose tea leaves, and crushed eggshells',
      'Garden clippings, dry leaves, and cut flowers',
      'Grease-soaked uncoated pizza boxes and soiled paper napkins',
    ],
    prohibited: [
      'Plastic carry bags, cling wrap, and foil pouches',
      'Glass bottles, metal cans, or synthetic textiles',
      'Diapers, sanitary waste, or chemical liquids',
    ],
  },
  blue: {
    id: 'blue',
    name: 'Blue Dustbin',
    shortName: 'Blue',
    category: 'Dry · Recyclable Materials',
    code: 'REC',
    summary: 'Clean, dry plastics, paper, cardboard, glass, and metals ready for material recovery.',
    accepted: [
      'Empty, rinsed PET plastic bottles, jugs, and rigid tubs',
      'Clean corrugated cardboard, newspapers, and office paper',
      'Empty glass jars and beverage bottles',
      'Aluminum drink cans and rinsed tin food cans',
    ],
    prohibited: [
      'Oil-stained cardboard or food-contaminated paper',
      'Used tissues, face masks, or disposable diapers',
      'Batteries, broken electronics, or tangled cables',
    ],
  },
  red: {
    id: 'red',
    name: 'Red Dustbin',
    shortName: 'Red',
    category: 'Hazardous · Biomedical Waste',
    code: 'HAZ',
    summary: 'Infectious, medical, sanitary, and toxic household chemicals requiring safe containment.',
    accepted: [
      'Used surgical masks, latex gloves, and soiled bandages',
      'Syringes, lancets, and needles sealed in a puncture-proof container',
      'Sanitary napkins, diapers, and expired medicine blister packs',
      'Pesticides, paints, solvents, and corrosive household cleaners',
    ],
    prohibited: [
      'Clean recyclable paper, cardboard, or plastic bottles',
      'Kitchen food scraps or biodegradable garden waste',
      'Consumer electronics and rechargeable devices',
    ],
  },
  yellow: {
    id: 'yellow',
    name: 'Yellow / E-Waste Bin',
    shortName: 'Yellow',
    category: 'Electronic & Battery Waste',
    code: 'EWST',
    summary: 'Discarded batteries, cables, bulbs, and circuit-bearing electronics with recoverable metals.',
    accepted: [
      'AA/AAA alkaline, coin-cell, and lithium-ion batteries',
      'Broken smartphones, tablets, laptops, and circuit boards',
      'Frayed USB cables, wall adapters, earbuds, and power banks',
      'Spent LED bulbs, CFL tubes, and small dead appliances',
    ],
    prohibited: [
      'Wet kitchen waste or liquid containers',
      'Biomedical sharps or sanitary waste',
      'General cardboard shipping cartons',
    ],
  },
};

export const BIN_ORDER: BinColor[] = ['green', 'blue', 'red', 'yellow'];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-pizza',
    question: 'Where should the grease-stained bottom half of a cardboard pizza box go?',
    correctBin: 'green',
    explanation:
      'Oil and melted cheese contaminate paper recycling pulp. Compost the greasy bottom in the Green Dustbin and place only the clean top lid in the Blue Dustbin.',
  },
  {
    id: 'q-mask',
    question:
      'You need to discard a used disposable surgical mask and an empty expired medicine blister strip. Which dustbin is correct?',
    correctBin: 'red',
    explanation:
      'Used masks and medical packaging belong in the Red (Hazardous / Biomedical) Dustbin so sanitation workers are shielded from biohazard exposure.',
  },
  {
    id: 'q-ewaste',
    question:
      'Where should a frayed USB charging cable and two depleted AA batteries be disposed of?',
    correctBin: 'yellow',
    explanation:
      'Cables, batteries, and electronics contain heavy metals and recoverable copper. Always deposit them in the Yellow / E-Waste Bin—never regular trash.',
  },
];

export function normalizeBinColor(raw: unknown): BinColor {
  const value = String(raw ?? '')
    .toLowerCase()
    .trim();

  if (
    value.includes('red') ||
    value.includes('hazard') ||
    value.includes('biomed') ||
    value.includes('medical') ||
    value.includes('sanitary')
  ) {
    return 'red';
  }
  if (
    value.includes('yellow') ||
    value.includes('e-waste') ||
    value.includes('ewaste') ||
    value.includes('electron') ||
    value.includes('battery')
  ) {
    return 'yellow';
  }
  if (
    value.includes('green') ||
    value.includes('organic') ||
    value.includes('wet') ||
    value.includes('compost') ||
    value.includes('biodegrad')
  ) {
    return 'green';
  }
  if (value.includes('blue') || value.includes('recycl') || value.includes('dry')) {
    return 'blue';
  }
  return 'blue';
}

export function stripMarkdownFences(rawText: string): string {
  return rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

export function parseWasteScanPayload(rawText: string, modelUsed: string): WasteScanResult {
  const cleaned = stripMarkdownFences(rawText);
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  const rawConfidence = Number(parsed.confidence);
  const confidence = Number.isFinite(rawConfidence)
    ? Math.max(1, Math.min(100, Math.round(rawConfidence)))
    : 90;

  const rawCo2 = Number(parsed.co2SavedKg);
  const co2SavedKg = Number.isFinite(rawCo2)
    ? Math.max(0.05, Math.min(5, Math.round(rawCo2 * 100) / 100))
    : 0.22;

  const steps = Array.isArray(parsed.disposalSteps)
    ? parsed.disposalSteps
        .map((step) => String(step ?? '').trim())
        .filter((step) => step.length > 0)
    : [];

  return {
    itemName: String(parsed.itemName ?? '').trim() || 'Identified Waste Item',
    binColor: normalizeBinColor(parsed.binColor),
    materialComposition:
      String(parsed.materialComposition ?? '').trim() || 'Mixed household material',
    confidence,
    co2SavedKg,
    disposalSteps:
      steps.length > 0
        ? steps
        : ['Clean or contain the item as needed and place it into the recommended dustbin.'],
    environmentalFact:
      String(parsed.environmentalFact ?? '').trim() ||
      'Proper source segregation increases material recovery and keeps contaminants out of landfills.',
    modelUsed,
  };
}

export function applyScanToImpact(current: SessionImpact, co2DeltaKg: number): SessionImpact {
  const safeDelta = Number.isFinite(co2DeltaKg) && co2DeltaKg > 0 ? co2DeltaKg : 0.2;
  return {
    itemsSorted: current.itemsSorted + 1,
    co2SavedKg: Math.round((current.co2SavedKg + safeDelta) * 100) / 100,
  };
}

export function filterBins(filter: BinFilter): BinDefinition[] {
  if (filter === 'all') {
    return BIN_ORDER.map((id) => BIN_REGISTRY[id]);
  }
  return [BIN_REGISTRY[filter]];
}

export function createInitialQuizState(): QuizState {
  return {
    currentIndex: 0,
    score: 0,
    selectedBin: null,
    completed: false,
  };
}

export function submitQuizAnswer(state: QuizState, choice: BinColor): QuizState {
  if (state.selectedBin !== null || state.completed) {
    return state;
  }
  const currentQuestion = QUIZ_QUESTIONS[state.currentIndex];
  const isCorrect = currentQuestion?.correctBin === choice;
  return {
    ...state,
    selectedBin: choice,
    score: isCorrect ? state.score + 1 : state.score,
  };
}

export function advanceQuizState(state: QuizState): QuizState {
  if (state.selectedBin === null) {
    return state;
  }
  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= QUIZ_QUESTIONS.length) {
    return {
      ...state,
      completed: true,
    };
  }
  return {
    ...state,
    currentIndex: nextIndex,
    selectedBin: null,
  };
}

export function isRetryableHttpStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}
