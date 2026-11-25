import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { isRetryableHttpStatus, parseWasteScanPayload } from './src/utils/wasteLogic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const FALLBACK_MODELS = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'] as const;
const MAX_RETRIES_PER_MODEL = 2;

const WASTE_SCAN_SYSTEM_INSTRUCTION = `You are EcoSort AI, a municipal waste segregation specialist.
Classify the primary waste item shown in the image into exactly ONE standard dustbin:
- "green": Wet / Organic / Biodegradable (food scraps, fruit peels, garden trimmings, grease-stained uncoated paper or pizza boxes)
- "blue": Dry / Recyclable (empty clean plastic bottles/containers, clean paper/cardboard, glass bottles/jars, aluminum/tin cans)
- "red": Hazardous / Biomedical (used surgical masks, syringes, bandages, sanitary waste, diapers, expired medicines, paints, solvents, household chemicals)
- "yellow": E-Waste (batteries, broken phones, USB cables, chargers, circuit boards, LED/CFL bulbs, small electronic devices)

Provide accurate material composition, a calibrated 0-100 confidence score, realistic estimated CO2 saved in kg (0.05 to 2.50), 3 clear actionable disposal steps, and 1 concise environmental impact fact.`;

const WASTE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    itemName: {
      type: Type.STRING,
      description: 'Specific everyday name of the waste item in the photo.',
    },
    binColor: {
      type: Type.STRING,
      description: 'Must be one of: green, blue, red, yellow.',
    },
    materialComposition: {
      type: Type.STRING,
      description: 'Concise breakdown of the item material composition.',
    },
    confidence: {
      type: Type.INTEGER,
      description: 'Classification confidence percentage from 1 to 100.',
    },
    co2SavedKg: {
      type: Type.NUMBER,
      description: 'Estimated CO2e saved in kilograms when properly segregated (0.05 to 2.5).',
    },
    disposalSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2 to 4 concise step-by-step disposal instructions.',
    },
    environmentalFact: {
      type: Type.STRING,
      description: 'One concise, accurate environmental impact fact relevant to this item.',
    },
  },
  required: [
    'itemName',
    'binColor',
    'materialComposition',
    'confidence',
    'co2SavedKg',
    'disposalSteps',
    'environmentalFact',
  ],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractStatusCode(error: unknown): number {
  if (!error || typeof error !== 'object') return 500;
  const candidate = error as { status?: number; code?: number; message?: string };
  if (typeof candidate.status === 'number') return candidate.status;
  if (typeof candidate.code === 'number') return candidate.code;
  const msg = String(candidate.message ?? '');
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) return 429;
  if (msg.includes('403') || msg.includes('PERMISSION_DENIED')) return 403;
  if (msg.includes('400') || msg.includes('API_KEY_INVALID')) return 400;
  if (msg.includes('503') || msg.includes('UNAVAILABLE')) return 503;
  return 500;
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/scan', async (req, res) => {
    const { imageBase64, mimeType } = req.body as {
      imageBase64?: string;
      mimeType?: string;
    };

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ error: 'Please provide a valid base64-encoded image.' });
      return;
    }

    const safeMime =
      typeof mimeType === 'string' && mimeType.startsWith('image/') ? mimeType : 'image/jpeg';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured in Settings > Secrets. Add your key or test with the quick-test sample items.',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let lastStatus = 500;
    let lastMessage = 'Unable to classify the image right now.';

    for (const model of FALLBACK_MODELS) {
      for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: safeMime,
                    data: imageBase64,
                  },
                },
                {
                  text: 'Inspect this waste item and return its segregation classification as JSON.',
                },
              ],
            },
            config: {
              systemInstruction: WASTE_SCAN_SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              responseSchema: WASTE_RESPONSE_SCHEMA,
            },
          });

          const text = response.text;
          if (!text) {
            throw new Error('Empty response returned by Gemini Vision.');
          }

          const result = parseWasteScanPayload(text, model);
          res.json({ result });
          return;
        } catch (err) {
          lastStatus = extractStatusCode(err);
          lastMessage = err instanceof Error ? err.message : 'Unexpected Gemini API error.';

          // Fail fast on auth/bad request errors rather than hammering fallback models
          if (lastStatus === 400 || lastStatus === 401 || lastStatus === 403) {
            res.status(lastStatus).json({
              error:
                'Gemini API rejected the request. Please verify your API key in Settings > Secrets.',
              details: lastMessage,
            });
            return;
          }

          if (isRetryableHttpStatus(lastStatus) && attempt < MAX_RETRIES_PER_MODEL) {
            await sleep(600 * Math.pow(2, attempt - 1));
          }
        }
      }
    }

    res.status(lastStatus >= 400 ? lastStatus : 503).json({
      error:
        lastStatus === 429
          ? 'Gemini Vision is currently experiencing high demand (rate limit). Please retry in a few seconds.'
          : 'All Gemini Vision models are temporarily unavailable. Please try again shortly.',
      details: lastMessage,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EcoSort AI server running on http://localhost:${PORT}`);
  });
}

createServer();
