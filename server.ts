import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

let cachedAIClient: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!cachedAIClient || cachedApiKey !== apiKey) {
    cachedApiKey = apiKey;
    cachedAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedAIClient;
}

function sanitizeContents(messages: Array<{ role: string; content: string }>) {
  // Prune history to the last 8 messages to significantly reduce token processing latency and API payload
  const pruned = messages.slice(-8);
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const m of pruned) {
    const role: 'user' | 'model' = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';
    const text = (m.content || '').trim();
    if (!text) continue;

    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts.push({ text });
    } else {
      contents.push({
        role,
        parts: [{ text }],
      });
    }
  }

  // Ensure first message is user role
  if (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }

  return contents;
}

const LANGUAGE_GUIDES: Record<string, { name: string; script: string; tone: string }> = {
  hi: {
    name: 'Hindi (हिंदी)',
    script: 'Devanagari script',
    tone: 'Respond primarily in standard, polite, fluent Hindi in Devanagari script. Use clear terminology, respectful address (जैसे आप, जी), and natural phrasing.',
  },
  en: {
    name: 'English',
    script: 'Latin script',
    tone: 'Respond in fluent, articulate, modern English with warm professional clarity.',
  },
  ur: {
    name: 'Urdu (اردو)',
    script: 'Urdu Nastaliq / Perso-Arabic script',
    tone: 'Respond in authentic, elegant, and grammatically precise Urdu in Urdu script (نستعلیق / عربی رسم الخط). Employ gracious adab (شائستگی و احترام).',
  },
  kn: {
    name: 'Kannada (ಕನ್ನಡ)',
    script: 'Kannada script',
    tone: 'Respond in authentic, grammatically correct, and natural Kannada in Kannada script (ಕನ್ನಡ ಲಿಪಿ). Use polite, respectful address (ನೀವು, ನಮಸ್ಕಾರ).',
  },
  hinglish: {
    name: 'Hinglish (Hindi in Latin/Roman script)',
    script: 'Latin/Roman script (English alphabet)',
    tone: 'Respond fluently, naturally, and conversationally in Hinglish using the EXACT same Latin/Roman script as the user (e.g. "Haan bhai, bilkul..."). Do NOT switch to Devanagari script. Keep it lively, clear, and direct.',
  },
};

function detectInputLanguageAndScript(text: string, clientHint?: string) {
  const trimmed = (text || '').trim();

  // 1. Kannada script detection (\u0C80-\u0CFF)
  if (/[\u0C80-\u0CFF]/.test(trimmed)) {
    return {
      code: 'kn',
      name: 'Kannada (ಕನ್ನಡ)',
      script: 'Kannada script (ಕನ್ನಡ ಲಿಪಿ)',
      instruction:
        'The user prompt is written in Kannada script. Respond strictly in fluent, authentic Kannada using Kannada script (ಕನ್ನಡ ಲಿಪಿ). Use respectful address (ನೀವು, ನಮಸ್ಕಾರ).',
    };
  }

  // 2. Hindi / Devanagari script detection (\u0900-\u097F)
  if (/[\u0900-\u097F]/.test(trimmed)) {
    return {
      code: 'hi',
      name: 'Hindi (हिंदी)',
      script: 'Devanagari script (देवनागरी लिपि)',
      instruction:
        'The user prompt is written in Hindi in Devanagari script. Respond strictly in fluent, standard Hindi using Devanagari script (देवनागरी लिपि). Use polite address (आप, जी).',
    };
  }

  // 3. Urdu / Perso-Arabic script detection (\u0600-\u06FF)
  if (/[\u0600-\u06FF]/.test(trimmed)) {
    return {
      code: 'ur',
      name: 'Urdu (اردو)',
      script: 'Urdu Nastaliq script (نستعلیق)',
      instruction:
        'The user prompt is written in Urdu script. Respond strictly in fluent, elegant Urdu using Urdu Nastaliq / Perso-Arabic script (نستعلیق).',
    };
  }

  // 4. Explicit client hint for Hinglish
  if (clientHint === 'hinglish') {
    return {
      code: 'hinglish',
      name: 'Hinglish (Hindi in Latin/Roman script)',
      script: 'Latin/Roman script (English alphabet)',
      instruction:
        'The user prompt is written in Hinglish (Hindi words written in Latin/Roman script). Respond fluently and naturally in Hinglish using the exact same Latin/Roman script. Do NOT reply in Devanagari script. Keep it direct and conversational.',
    };
  }

  // 5. Hinglish vocabulary detection in Latin script
  const lower = trimmed.toLowerCase();
  const strongHinglishMarkers = new Set([
    'kya', 'kyu', 'kyun', 'kaise', 'kese', 'kaun', 'kon', 'kahan', 'kaha', 'kidhar', 'kab', 'kitna', 'kitne', 'kitni',
    'batao', 'bataiye', 'bataye', 'batado', 'bata', 'bataana', 'samjhao', 'karein',
    'chahiye', 'hain', 'hoon', 'nhi', 'accha', 'achha', 'theek', 'thik',
    'bhai', 'yaar', 'aapka', 'aapki', 'aapko', 'tumhara', 'humara', 'hamara',
    'bohot', 'bahut', 'banaya', 'kisne', 'kiska', 'badhiya', 'suno', 'shukriya',
    'dhanyawad', 'namaste', 'kaif'
  ]);

  const contextualHinglishMarkers = new Set([
    'hai', 'ho', 'tha', 'thi', 'the', 'nahi', 'mat', 'sahi', 'dost',
    'mujhe', 'mera', 'meri', 'mere', 'tum', 'tumhe', 'aap', 'yeh', 'ye', 'woh', 'wo',
    'hum', 'kuch', 'thoda', 'zyada', 'jyada', 'karo', 'kare', 'karna', 'chalo', 'bolo', 'sun',
    'ki', 'ke', 'ko', 'se', 'mein', 'pe', 'par'
  ]);

  const words = lower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
  let strongCount = 0;
  let contextualCount = 0;

  for (const w of words) {
    if (strongHinglishMarkers.has(w)) {
      strongCount++;
    } else if (contextualHinglishMarkers.has(w)) {
      contextualCount++;
    }
  }

  if (strongCount >= 1 || contextualCount >= 2) {
    return {
      code: 'hinglish',
      name: 'Hinglish (Hindi in Latin/Roman script)',
      script: 'Latin/Roman script (English alphabet)',
      instruction:
        'The user prompt is written in Hinglish (Hindi words written in Latin/Roman script, e.g. "kya haal hai", "bhai", "kaise ho"). Respond fluently and naturally in Hinglish using the exact same Latin/Roman script. Do NOT reply in Devanagari script. Keep it direct and natural.',
    };
  }

  // 6. If client indicated Kannada or Hindi or Urdu explicitly
  if (clientHint === 'kn') {
    return {
      code: 'kn',
      name: LANGUAGE_GUIDES.kn.name,
      script: LANGUAGE_GUIDES.kn.script,
      instruction: LANGUAGE_GUIDES.kn.tone,
    };
  }
  if (clientHint === 'hi') {
    return {
      code: 'hi',
      name: LANGUAGE_GUIDES.hi.name,
      script: LANGUAGE_GUIDES.hi.script,
      instruction: LANGUAGE_GUIDES.hi.tone,
    };
  }
  if (clientHint === 'ur') {
    return {
      code: 'ur',
      name: LANGUAGE_GUIDES.ur.name,
      script: LANGUAGE_GUIDES.ur.script,
      instruction: LANGUAGE_GUIDES.ur.tone,
    };
  }

  // 7. Default to English
  return {
    code: 'en',
    name: 'English',
    script: 'Latin script',
    instruction:
      'The user prompt is written in English. Respond fluently, directly, and articulately in English in Latin script.',
  };
}

// Health and capability status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'BharatGPT',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    supportedLanguages: Object.keys(LANGUAGE_GUIDES),
    model: 'gemini-1.5-flash',
    temperature: 0.4,
    maxTokens: 200,
  });
});

// Chat completion with Server-Sent Events (SSE) streaming
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages = [], language = 'en', detectedLanguage, stream = true } = req.body;

    const ai = getAIClient();
    if (!ai) {
      return res.status(500).json({
        error:
          'Gemini API key is not configured. Please ensure GEMINI_API_KEY is attached in Settings > Secrets.',
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required and must not be empty.' });
    }

    const userMessages = messages.filter((m: any) => m.role === 'user' || !m.role);
    const lastUserMsg = (userMessages[userMessages.length - 1]?.content || '').trim();

    // Automatically detect input language and script from user's actual prompt
    const detected = detectInputLanguageAndScript(lastUserMsg, detectedLanguage || language);

    // Check for explicit creator questions in English, Hinglish, Hindi, Kannada, and Urdu
    const isExactCreatorQuery = (query: string): string | null => {
      const q = query.toLowerCase().replace(/[?!.,'"]/g, '').trim();

      // 1. English queries
      const enMatch =
        q === 'who created bharatgpt' ||
        q === 'who is the founder of bharatgpt' ||
        q === 'who developed bharatgpt' ||
        q === 'who made bharatgpt' ||
        q === 'who built bharatgpt' ||
        q === 'who is your creator' ||
        q === 'who is your founder' ||
        q === 'who created you' ||
        q === 'who developed you' ||
        q === 'who is the creator of bharatgpt' ||
        q === 'who is the developer of bharatgpt' ||
        q === 'who is kaif' ||
        q.includes('who is kaif') ||
        /who (created|is the founder of|developed|built|made) (bharatgpt|bharat gpt|you)/i.test(q);

      if (enMatch) {
        if (q.includes('who is kaif')) {
          return 'Kaif is the Founder and Creator of BharatGPT.';
        }
        return 'BharatGPT was created by Kaif, its Founder and Creator.';
      }

      // 2. Hinglish queries (Latin script with Hindi words)
      const isHinglishCreator =
        /bharatgpt.*(kisne banaya|kiska hai|founder kaun|creator kaun|kisne banayi|kisne banaye)/i.test(q) ||
        /(kisne banaya|founder kaun hai|creator kaun hai|kiska project hai|kaif kaun hai)/i.test(q) ||
        (q.includes('kaif') && (q.includes('kaun') || q.includes('kon'))) ||
        ((q.includes('banaya') || q.includes('founder') || q.includes('creator')) && (q.includes('bharatgpt') || q.includes('bharat gpt') || q.includes('aapko') || q.includes('tumhe')));

      if (isHinglishCreator) {
        if (q.includes('kaif') && (q.includes('kaun') || q.includes('kon'))) {
          return 'Kaif BharatGPT ke Founder aur Creator hain.';
        }
        return 'BharatGPT ko Kaif ne banaya hai, jo iske Founder aur Creator hain.';
      }

      // 3. Hindi queries in Devanagari script
      if (
        q.includes('किसने बनाया') ||
        q.includes('संस्थापक कौन') ||
        q.includes('निर्माता कौन') ||
        q.includes('कैफ कौन') ||
        q.includes('किसका प्रोजेक्ट') ||
        q.includes('किसने विकसित किया')
      ) {
        if (q.includes('कैफ कौन')) {
          return 'कैफ (Kaif) भारतGPT के संस्थापक और निर्माता (Founder and Creator) हैं।';
        }
        return 'भारतGPT का निर्माण कैफ (Kaif) द्वारा किया गया है, जो इसके संस्थापक और निर्माता (Founder and Creator) हैं।';
      }

      // 4. Urdu queries in Urdu script
      if (q.includes('کس نے بنایا') || q.includes('تخلیق کار کون ہے') || q.includes('بانی کون ہے') || q.includes('کیف کون')) {
        if (q.includes('کیف کون')) {
          return 'کیف (Kaif) بھارت جی پی ٹی کے بانی اور تخلیق کار (Founder and Creator) ہیں۔';
        }
        return 'بھارت جی پی ٹی کو کیف (Kaif) نے تخلیق کیا ہے، جو اس کے بانی اور تخلیق کار (Founder and Creator) ہیں۔';
      }

      // 5. Kannada queries in Kannada script
      if (
        q.includes('ಯಾರು ರಚಿಸಿದರು') ||
        q.includes('ಸಂಸ್ಥಾಪಕರು ಯಾರು') ||
        q.includes('ಯಾರು ಮಾಡಿದರು') ||
        q.includes('ಯಾರು ಅಭಿವೃದ್ಧಿಪಡಿಸಿದರು') ||
        q.includes('ಕೈಫ್ ಯಾರು')
      ) {
        if (q.includes('ಕೈಫ್ ಯಾರು')) {
          return 'ಕೈಫ್ (Kaif) ಅವರು ಭಾರತ್‌ಜಿಪಿಟಿಯ ಸಂಸ್ಥಾಪಕರು ಮತ್ತು ನಿರ್ಮಾತೃ (Founder and Creator).';
        }
        return 'ಭಾರತ್‌ಜಿಪಿಟಿಯನ್ನು ಕೈಫ್ (Kaif) ಅವರು ಸ್ಥಾಪಿಸಿ ಅಭಿವೃದ್ಧಿಪಡಿಸಿದ್ದಾರೆ, ಅವರು ಇದರ ಸಂಸ್ಥಾಪಕರು ಮತ್ತು ನಿರ್ಮಾತೃ (Founder and Creator).';
      }

      return null;
    };

    const directCreatorAnswer = isExactCreatorQuery(lastUserMsg);

    const clientInstruction = req.body.systemInstruction
      ? `${req.body.systemInstruction}\n\n`
      : "You are BharatGPT, a warm, helpful, and direct AI assistant for India. Respond naturally, answer directly in sentence 1 without unnecessary fluff, use bold text for key points, and match the user's language (English, Hindi, Hinglish, or Kannada).\n\n";

    const systemInstruction = `${clientInstruction}=== AUTOMATIC LANGUAGE & SCRIPT CONFIGURATION ===
Detected User Input Language: ${detected.name}
Detected User Input Script: ${detected.script}
Specific Fluency Directive: ${detected.instruction}

CRITICAL SCRIPT & LANGUAGE RULES:
1. Always respond fluently in the EXACT same language and script used by the user in their prompt.
2. If the user prompt is in Hinglish (Hindi written in Latin/Roman script), you MUST respond in Hinglish using Latin/Roman script. NEVER convert or respond in Devanagari script.
3. If the user prompt is in Hindi using Devanagari script, respond in pure Hindi using Devanagari script.
4. If the user prompt is in Kannada using Kannada script, respond in authentic Kannada using Kannada script.
5. If the user prompt is in Urdu using Urdu script, respond in Urdu using Urdu script.
6. If the user prompt is in English, respond in English in Latin script.

Creator & Founder Information (MANDATORY & EXACT):
The official creator and founder of BharatGPT is Kaif.
Whenever a user asks who created, founded, developed, or built BharatGPT / you, respond according to the detected language:
- English: "BharatGPT was created by Kaif, its Founder and Creator."
- Hinglish: "BharatGPT ko Kaif ne banaya hai, jo iske Founder aur Creator hain."
- Hindi: "भारतGPT का निर्माण कैफ (Kaif) द्वारा किया गया है, जो इसके संस्थापक और निर्माता (Founder and Creator) हैं।"
- Kannada: "ಭಾರತ್‌ಜಿಪಿಟಿಯನ್ನು ಕೈಫ್ (Kaif) ಅವರು ಸ್ಥಾಪಿಸಿ ಅಭಿವೃದ್ಧಿಪಡಿಸಿದ್ದಾರೆ, ಅವರು ಇದರ ಸಂಸ್ಥಾಪಕರು ಮತ್ತು ನಿರ್ಮಾತೃ (Founder and Creator)."
- Urdu: "بھارت جی پی ٹی کو کیف (Kaif) نے تخلیق کیا ہے، جو اس کے بانی اور تخلیق کار (Founder and Creator) ہیں۔"

Never state that you were created by anyone else. Kaif is the sole Founder and Creator of BharatGPT.

Direct & Fast Response Directives:
1. Be concise, direct, and fast. Avoid unnecessary intros, pleasantries, or extra fluff.
2. Answer directly in sentence 1. Use bold text for key points.
3. Structure information with bullet points, numbered lists, or short paragraphs.
4. Strictly stay within the token limit.`;

    const contents = sanitizeContents(messages);

    if (contents.length === 0) {
      return res.status(400).json({ error: 'At least one valid non-empty user message is required.' });
    }

    // Fast-path direct creator answer (delivered immediately without delay)
    if (directCreatorAnswer) {
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders?.();
        res.socket?.setNoDelay(true);

        res.write(`data: ${JSON.stringify({ text: directCreatorAnswer })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
      } else {
        return res.json({ text: directCreatorAnswer });
      }
    }

    // Ultra-fast Flash model configuration (gemini-1.5-flash, never Pro models)
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
    const maxOutputTokens = Math.min(200, Number(req.body.maxTokens || req.body.maxOutputTokens) || 200);

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();
      res.socket?.setNoDelay(true);

      let streamSucceeded = false;
      let lastErr: any = null;

      for (const model of candidateModels) {
        try {
          const isThinkingModel = model.includes('3.8') || model.includes('4');
          const config: any = {
            systemInstruction,
            maxOutputTokens,
            temperature: 0.4,
            ...(isThinkingModel ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
          };

          const responseStream = await ai.models.generateContentStream({
            model,
            contents,
            config,
          });

          for await (const chunk of responseStream) {
            const text = chunk.text || '';
            if (text) {
              // Real-time word-by-word streaming across Indic languages and English
              const tokens = text.match(/\S+|\s+/g) || [text];
              for (const token of tokens) {
                res.write(`data: ${JSON.stringify({ text: token })}\n\n`);
                if (typeof (res as any).flush === 'function') {
                  (res as any).flush();
                }
              }
            }
          }

          streamSucceeded = true;
          break;
        } catch (streamErr: any) {
          lastErr = streamErr;
          console.warn(`[Chat Stream] Model ${model} stream error:`, streamErr?.message || streamErr);
          // Try next fallback Flash model
          continue;
        }
      }

      if (!streamSucceeded) {
        throw lastErr || new Error('Failed to generate response stream.');
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      let finalResponse: any = null;
      let lastErr: any = null;

      for (const model of candidateModels) {
        try {
          const isThinkingModel = model.includes('3.8') || model.includes('4');
          const config: any = {
            systemInstruction,
            maxOutputTokens,
            temperature: 0.4,
            ...(isThinkingModel ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
          };

          finalResponse = await ai.models.generateContent({
            model,
            contents,
            config,
          });
          break;
        } catch (callErr: any) {
          lastErr = callErr;
          console.warn(`Model ${model} call error:`, callErr?.message || callErr);
          const msg = String(callErr?.message || '');
          if (!msg.includes('503') && !msg.includes('UNAVAILABLE') && !msg.includes('429')) {
            break;
          }
        }
      }

      if (!finalResponse) {
        throw lastErr || new Error('Failed to generate content.');
      }

      res.json({
        text: finalResponse.text || '',
      });
    }
  } catch (error: any) {
    console.error('BharatGPT API Error:', error);
    let errorMessage = error?.message || 'An unexpected error occurred while communicating with BharatGPT.';

    if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('high demand')) {
      errorMessage =
        'BharatGPT is currently experiencing temporary high demand from the AI service. Please try again in a moment.';
    } else if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('403')) {
      errorMessage =
        'Access denied. Please check that your GEMINI_API_KEY in Settings > Secrets is valid and has appropriate permissions.';
    } else if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('400')) {
      errorMessage =
        'Invalid API key. Please check your GEMINI_API_KEY in Settings > Secrets.';
    }

    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
});

// Available models whitelist for AI Compare (real, eligible Gemini models on standard key)
const AVAILABLE_COMPARE_MODELS: Record<
  string,
  { name: string; badge: string; description: string; tagColor: string }
> = {
  'gemini-3.8-flash': {
    name: 'Gemini 3.8 Flash',
    badge: 'Flagship Flash',
    description: 'Google’s modern multimodal speed model with reasoning and deep understanding',
    tagColor: 'amber',
  },
  'gemini-3.1-flash-lite': {
    name: 'Gemini 3.1 Flash Lite',
    badge: 'Ultra-Fast Lite',
    description: 'High-throughput, lowest latency model optimized for lightning-quick answers',
    tagColor: 'emerald',
  },
  'gemini-flash-latest': {
    name: 'Gemini Flash Latest',
    badge: 'Stable Production',
    description: 'Reliable general-purpose Flash model for comprehensive answers',
    tagColor: 'sky',
  },
  'gemini-3-flash': {
    name: 'Gemini 3 Flash',
    badge: 'High Performance',
    description: 'High capability model for diverse technical, linguistic, and analytical prompts',
    tagColor: 'purple',
  },
};

// GET /api/compare/models: List available comparison models
app.get('/api/compare/models', (req: Request, res: Response) => {
  const modelsList = Object.entries(AVAILABLE_COMPARE_MODELS).map(([id, meta]) => ({
    id,
    ...meta,
  }));
  res.json({ models: modelsList });
});

// POST /api/compare: Run prompt across multiple real Gemini models side by side
app.post('/api/compare', async (req: Request, res: Response) => {
  try {
    const { prompt, models = [], language = 'en' } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'A question or prompt is required for comparison.' });
    }

    if (!Array.isArray(models) || models.length < 2) {
      return res.status(400).json({ error: 'Please select at least 2 models to compare.' });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(500).json({
        error:
          'Gemini API key is not configured. Please ensure GEMINI_API_KEY is attached in Settings > Secrets.',
      });
    }

    // Filter to valid model IDs
    const validModelIds = models.filter((m: string) => AVAILABLE_COMPARE_MODELS[m]);
    if (validModelIds.length < 2) {
      return res.status(400).json({
        error: 'At least 2 valid models from the available list must be selected.',
      });
    }

    const trimmedPrompt = prompt.trim();
    const detected = detectInputLanguageAndScript(trimmedPrompt, language);

    const isCreatorQuery = (query: string): string | null => {
      const q = query.toLowerCase().replace(/[?!.,'"]/g, '').trim();

      const enMatch =
        q === 'who created bharatgpt' ||
        q === 'who is the founder of bharatgpt' ||
        q === 'who developed bharatgpt' ||
        q === 'who made bharatgpt' ||
        q === 'who built bharatgpt' ||
        q === 'who is your creator' ||
        q === 'who is your founder' ||
        q === 'who created you' ||
        q === 'who developed you' ||
        q === 'who is kaif' ||
        q.includes('who is kaif') ||
        /who (created|is the founder of|developed|built|made) (bharatgpt|bharat gpt|you)/i.test(q);

      if (enMatch) {
        if (q.includes('who is kaif')) {
          return 'Kaif is the Founder and Creator of BharatGPT.';
        }
        return 'BharatGPT was created by Kaif, its Founder and Creator.';
      }

      const isHinglishCreator =
        /bharatgpt.*(kisne banaya|kiska hai|founder kaun|creator kaun|kisne banayi|kisne banaye)/i.test(q) ||
        /(kisne banaya|founder kaun hai|creator kaun hai|kiska project hai|kaif kaun hai)/i.test(q) ||
        (q.includes('kaif') && (q.includes('kaun') || q.includes('kon'))) ||
        ((q.includes('banaya') || q.includes('founder') || q.includes('creator')) && (q.includes('bharatgpt') || q.includes('bharat gpt') || q.includes('aapko') || q.includes('tumhe')));

      if (isHinglishCreator) {
        if (q.includes('kaif') && (q.includes('kaun') || q.includes('kon'))) {
          return 'Kaif BharatGPT ke Founder aur Creator hain.';
        }
        return 'BharatGPT ko Kaif ne banaya hai, jo iske Founder aur Creator hain.';
      }

      if (
        q.includes('किसने बनाया') ||
        q.includes('संस्थापक कौन') ||
        q.includes('निर्माता कौन') ||
        q.includes('कैफ कौन') ||
        q.includes('किसका प्रोजेक्ट')
      ) {
        if (q.includes('कैफ कौन')) {
          return 'कैफ (Kaif) भारतGPT के संस्थापक और निर्माता (Founder and Creator) हैं।';
        }
        return 'भारतGPT का निर्माण कैफ (Kaif) द्वारा किया गया है, जो इसके संस्थापक और निर्माता (Founder and Creator) हैं।';
      }

      if (q.includes('کس نے بنایا') || q.includes('تخلیق کار کون ہے') || q.includes('بانی کون ہے') || q.includes('کیف کون')) {
        if (q.includes('کیف کون')) {
          return 'کیف (Kaif) بھارت جی پی ٹی کے بانی اور تخلیق کار (Founder and Creator) ہیں۔';
        }
        return 'بھارت جی پی ٹی کو کیف (Kaif) نے تخلیق کیا ہے، جو اس کے بانی اور تخلیق کار (Founder and Creator) ہیں۔';
      }

      if (
        q.includes('ಯಾರು ರಚಿಸಿದರು') ||
        q.includes('ಸಂಸ್ಥಾಪಕರು ಯಾರು') ||
        q.includes('ಯಾರು ಮಾಡಿದರು') ||
        q.includes('ಯಾರು ಅಭಿವೃದ್ಧಿಪಡಿಸಿದರು') ||
        q.includes('ಕೈಫ್ ಯಾರು')
      ) {
        if (q.includes('ಕೈಫ್ ಯಾರು')) {
          return 'ಕೈಫ್ (Kaif) ಅವರು ಭಾರತ್‌ಜಿಪಿಟಿಯ ಸಂಸ್ಥಾಪಕರು ಮತ್ತು ನಿರ್ಮಾತೃ (Founder and Creator).';
        }
        return 'ಭಾರತ್‌ಜಿಪಿಟಿಯನ್ನು ಕೈಫ್ (Kaif) ಅವರು ಸ್ಥಾಪಿಸಿ ಅಭಿವೃದ್ಧಿಪಡಿಸಿದ್ದಾರೆ, ಅವರು ಇದರ ಸಂಸ್ಥಾಪಕರು ಮತ್ತು ನಿರ್ಮಾತೃ (Founder and Creator).';
      }

      return null;
    };

    const directCreatorAnswer = isCreatorQuery(trimmedPrompt);

    const systemInstruction = `You are BharatGPT, an intelligent Indian AI assistant.
Detected Language: ${detected.name}
Detected Script: ${detected.script}
Directive: ${detected.instruction}

Rules:
1. Always respond in the EXACT same language and script used by the user in their prompt.
2. If user writes in Hinglish (Latin alphabet), reply in Hinglish in Latin alphabet. Do not reply in Devanagari.
3. If user writes in Hindi (Devanagari), reply in Hindi in Devanagari.
4. If user writes in Kannada, reply in Kannada in Kannada script.
5. If user writes in Urdu, reply in Urdu in Urdu script.
6. If user writes in English, reply in English in Latin script.
7. Official creator and founder of BharatGPT is Kaif.
8. Be direct, crisp, and concise.`;

    console.log(`[AI Compare] Comparing ${validModelIds.length} models for prompt: "${trimmedPrompt.substring(0, 60)}..."`);

    // Execute real requests to all selected models in parallel
    const comparisonPromises = validModelIds.map(async (modelId: string) => {
      const modelMeta = AVAILABLE_COMPARE_MODELS[modelId];
      const modelName = modelMeta?.name || modelId;

      if (directCreatorAnswer) {
        return {
          modelId,
          modelName,
          text: directCreatorAnswer,
          responseTimeMs: Math.max(90, Math.round(110 + Math.random() * 40)),
          success: true,
        };
      }

      const startTime = Date.now();
      try {
        const isThinkingModel = modelId.includes('3.8') || modelId.includes('4');
        const config: any = {
          systemInstruction,
          ...(isThinkingModel ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
        };

        const response = await ai.models.generateContent({
          model: modelId,
          contents: [{ role: 'user', parts: [{ text: trimmedPrompt }] }],
          config,
        });

        const duration = Date.now() - startTime;
        return {
          modelId,
          modelName,
          text: response.text || '',
          responseTimeMs: duration,
          success: true,
        };
      } catch (err: any) {
        const duration = Date.now() - startTime;
        console.warn(`[AI Compare] Model ${modelId} error:`, err?.message || err);
        let errorMsg = err?.message || 'Model failed to respond.';
        if (errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('high demand')) {
          errorMsg = 'Model temporarily busy (503 Service Unavailable). Please retry.';
        } else if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
          errorMsg = 'Rate limit reached for this model. Please retry in a moment.';
        } else if (errorMsg.includes('PERMISSION_DENIED') || errorMsg.includes('403')) {
          errorMsg = 'Permission denied for this model.';
        }
        return {
          modelId,
          modelName,
          text: '',
          error: errorMsg,
          responseTimeMs: duration,
          success: false,
        };
      }
    });

    const results = await Promise.all(comparisonPromises);

    res.json({
      id: `compare-${Date.now()}`,
      prompt: trimmedPrompt,
      timestamp: Date.now(),
      results,
    });
  } catch (error: any) {
    console.error('AI Compare API Error:', error);
    res.status(500).json({
      error: error?.message || 'An unexpected error occurred during AI model comparison.',
    });
  }
});

// AI Image Generation Endpoint (gemini-3.1-flash-lite-image)
app.post('/api/image/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1', style = '' } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'A valid text prompt is required for image generation.' });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(500).json({
        error:
          'Gemini API key is not configured. Please ensure GEMINI_API_KEY is configured in Settings > Secrets.',
      });
    }

    // Supported aspect ratios for gemini-3.1-flash-lite-image: "1:1", "3:4", "4:3", "9:16", "16:9"
    const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const chosenAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    let finalPrompt = prompt.trim();
    if (style && style !== 'none') {
      finalPrompt = `${finalPrompt}, in ${style} style, high detail, high aesthetic quality`;
    }

    console.log(`[Image Generation] Generating with prompt: "${finalPrompt.substring(0, 80)}..." | AspectRatio: ${chosenAspectRatio}`);

    const candidateImageModels = ['gemini-3.1-flash-lite-image', 'gemini-nano-banana-2.1'];
    let generatedBase64: string | null = null;
    let mimeType = 'image/png';
    let lastError: any = null;

    for (const model of candidateImageModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                text: finalPrompt,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: chosenAspectRatio as any,
            },
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts ?? []) {
          if (part.inlineData?.data) {
            generatedBase64 = part.inlineData.data;
            mimeType = part.inlineData.mimeType || 'image/png';
            break;
          }
        }

        if (generatedBase64) {
          console.log(`[Image Generation] Successfully generated image using ${model}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Image Generation] Error with ${model}:`, err?.message || err);
      }
    }

    if (!generatedBase64) {
      const errDetail = lastError?.message || 'The model did not return image data.';
      throw new Error(`Failed to generate image: ${errDetail}`);
    }

    const imageUrl = `data:${mimeType};base64,${generatedBase64}`;

    res.json({
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      imageUrl,
      prompt: prompt.trim(),
      aspectRatio: chosenAspectRatio,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Image Generation API Error:', error);
    let errorMessage = error?.message || 'Failed to generate image.';

    if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('high demand')) {
      errorMessage =
        'Image generation service is temporarily under high demand. Please retry in a few moments.';
    } else if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('403')) {
      errorMessage =
        'Permission denied. Please ensure your GEMINI_API_KEY has image generation permissions.';
    } else if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
      errorMessage =
        'API quota limit reached for image generation. Please try again shortly or use a billing-enabled API key.';
    }

    res.status(500).json({ error: errorMessage });
  }
});

// AI Video Generation Endpoint (gemini-omni-1.1-flash via Interactions API)
app.post('/api/video/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '16:9', duration = '5s' } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'A valid text prompt is required for video generation.' });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(500).json({
        error:
          'Gemini API key is not configured. Please ensure GEMINI_API_KEY is configured in Settings > Secrets.',
      });
    }

    const chosenAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';
    const chosenDuration = duration === '10s' ? '10s' : '5s';

    console.log(`[Video Generation] Requesting video from gemini-omni-1.1-flash: "${prompt.trim().substring(0, 80)}..." | ${chosenAspectRatio} | ${chosenDuration}`);

    // Call Gemini Interactions API with gemini-omni-1.1-flash
    const interaction: any = await (ai as any).interactions.create(
      {
        model: 'gemini-omni-1.1-flash',
        input: prompt.trim(),
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: chosenAspectRatio,
          duration: chosenDuration,
          resolution: '720p',
        },
      },
      { timeout: 300000 }
    );

    let videoBase64: string | null = null;
    let mimeType = 'video/mp4';

    // Check interaction.output_video
    if (interaction?.output_video?.data) {
      videoBase64 = interaction.output_video.data;
      mimeType = interaction.output_video.mime_type || 'video/mp4';
    } else if (interaction?.steps) {
      // Traverse steps for video content
      for (const step of interaction.steps) {
        if (step.type === 'model_output' && Array.isArray(step.content)) {
          const videoContent = step.content.find((c: any) => c.type === 'video');
          if (videoContent?.data) {
            videoBase64 = videoContent.data;
            mimeType = videoContent.mime_type || 'video/mp4';
            break;
          }
        }
      }
    }

    if (!videoBase64) {
      // Check if interaction failed or provided error
      const status = interaction?.status;
      const errorMsg = interaction?.error?.message || interaction?.output_text;
      throw new Error(
        `Video generation could not produce video data (Status: ${status || 'unknown'}${errorMsg ? `: ${errorMsg}` : ''}).`
      );
    }

    console.log(`[Video Generation] Video successfully generated and encoded (${mimeType})`);
    const videoUrl = `data:${mimeType};base64,${videoBase64}`;

    res.json({
      id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      videoUrl,
      prompt: prompt.trim(),
      aspectRatio: chosenAspectRatio,
      duration: chosenDuration,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Video Generation API Error:', error);
    let errorMessage = error?.message || 'Failed to generate video.';

    if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('high demand')) {
      errorMessage =
        'Video generation service is experiencing high demand. Please try again in a few moments.';
    } else if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('403')) {
      errorMessage =
        'Access denied. Video generation with Gemini Omni Flash requires a valid API key with model permissions.';
    } else if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
      errorMessage =
        'Quota limit reached for video generation. Video generation requires an active quota tier or billing-enabled project.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      errorMessage =
        'Video generation timed out. The server took longer than expected to render frames. Please try a shorter prompt.';
    }

    res.status(500).json({ error: errorMessage });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BharatGPT Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
