import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceQuizState,
  applyScanToImpact,
  createInitialQuizState,
  filterBins,
  isRetryableHttpStatus,
  normalizeBinColor,
  parseWasteScanPayload,
  QUIZ_QUESTIONS,
  submitQuizAnswer,
} from './wasteLogic';

test('normalizeBinColor maps synonyms and standard names accurately', () => {
  assert.equal(normalizeBinColor('Green Dustbin'), 'green');
  assert.equal(normalizeBinColor('organic compost'), 'green');
  assert.equal(normalizeBinColor('BLUE'), 'blue');
  assert.equal(normalizeBinColor('biomedical hazardous'), 'red');
  assert.equal(normalizeBinColor('E-Waste / Yellow'), 'yellow');
  assert.equal(normalizeBinColor('unknown'), 'blue');
});

test('parseWasteScanPayload strips markdown fences and clamps values', () => {
  const raw = '```json\n{"itemName":"Crushed Soda Can","binColor":"recyclable","materialComposition":"Aluminum","confidence":140,"co2SavedKg":0.456,"disposalSteps":["Rinse can","Place in blue bin"],"environmentalFact":"Recycling aluminum saves 95% energy."}\n```';
  const parsed = parseWasteScanPayload(raw, 'gemini-4-hydrogen');

  assert.equal(parsed.itemName, 'Crushed Soda Can');
  assert.equal(parsed.binColor, 'blue');
  assert.equal(parsed.confidence, 100);
  assert.equal(parsed.co2SavedKg, 0.46);
  assert.deepEqual(parsed.disposalSteps, ['Rinse can', 'Place in blue bin']);
  assert.equal(parsed.modelUsed, 'gemini-4-hydrogen');
});

test('applyScanToImpact increments count and rounds CO2 cleanly', () => {
  let impact = { itemsSorted: 0, co2SavedKg: 0 };
  impact = applyScanToImpact(impact, 0.18);
  impact = applyScanToImpact(impact, 0.32);

  assert.equal(impact.itemsSorted, 2);
  assert.equal(impact.co2SavedKg, 0.5);
});

test('filterBins returns all 4 bins or a single filtered bin', () => {
  assert.equal(filterBins('all').length, 4);
  const redOnly = filterBins('red');
  assert.equal(redOnly.length, 1);
  assert.equal(redOnly[0].id, 'red');
});

test('quiz state machine scores answers and completes cleanly after 3 questions', () => {
  let state = createInitialQuizState();
  assert.equal(QUIZ_QUESTIONS.length, 3);

  // Q1: correct (green)
  state = submitQuizAnswer(state, 'green');
  assert.equal(state.score, 1);
  // Duplicate answer on same question should be ignored
  state = submitQuizAnswer(state, 'green');
  assert.equal(state.score, 1);

  state = advanceQuizState(state);
  assert.equal(state.currentIndex, 1);
  assert.equal(state.selectedBin, null);

  // Q2: incorrect (blue instead of red)
  state = submitQuizAnswer(state, 'blue');
  assert.equal(state.score, 1);
  state = advanceQuizState(state);

  // Q3: correct (yellow)
  state = submitQuizAnswer(state, 'yellow');
  assert.equal(state.score, 2);
  state = advanceQuizState(state);

  assert.equal(state.completed, true);
  assert.equal(state.score, 2);
});

test('isRetryableHttpStatus distinguishes transient overload vs auth failures', () => {
  assert.equal(isRetryableHttpStatus(429), true);
  assert.equal(isRetryableHttpStatus(503), true);
  assert.equal(isRetryableHttpStatus(400), false);
  assert.equal(isRetryableHttpStatus(403), false);
});
