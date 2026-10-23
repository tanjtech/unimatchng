import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StudentProfileSchema, RecommendationResponseSchema, UniversityDetailSchema, ChatRequestSchema } from './src/lib/schemas/index.ts';
import { callBackboardWithRetry } from './src/lib/backboard/index.ts';
import { buildRecommendationsSystemPrompt, buildRecommendationsUserPrompt, buildDetailSystemPrompt, PROMPT_VERSION } from './src/lib/prompts/index.ts';
import { calculateWeightedScore } from './src/lib/scoring/index.ts';
import { serverCache, createRecommendationsCacheKey, createDetailCacheKey, DEFAULT_TTL_SECONDS } from './src/lib/cache/index.ts';
import { ESTEEMED_NIGERIAN_UNIVERSITIES_FALLBACK } from './src/lib/fallback/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '1mb' }));

// Basic per-IP sliding window rate limiting for AI routes (15 requests per minute)
const rateLimitWindowMs = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const ipRequestHistory = new Map<string, number[]>();

function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const timestamps = (ipRequestHistory.get(ip) || []).filter((time) => now - time < rateLimitWindowMs);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      error: 'Too many requests. Please grant the admissions counsellor a brief moment to review your dossier.',
    });
    return;
  }

  timestamps.push(now);
  ipRequestHistory.set(ip, timestamps);
  next();
}

// 1. Recommendations Route
app.post('/api/recommendations', rateLimiter, async (req: Request, res: Response) => {
  try {
    const { profile, bypassCache } = req.body;
    
    // Validate request body
    const validatedProfile = StudentProfileSchema.parse(profile);
    const cacheKey = createRecommendationsCacheKey(validatedProfile, PROMPT_VERSION);

    // Check server cache if bypass not requested
    if (!bypassCache) {
      const cached = await serverCache.get<unknown>(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          fromCache: true,
          data: cached,
        });
      }
    }

    // Call Backboard AI
    const systemPrompt = buildRecommendationsSystemPrompt();
    const userPrompt = buildRecommendationsUserPrompt(validatedProfile);

    const { data: rawRecommendation } = await callBackboardWithRetry(
      {
        content: userPrompt,
        systemPrompt,
        jsonOutput: true,
        webSearch: false,
      },
      RecommendationResponseSchema
    );

    // Deterministically compute final scores and sort
    const processedUniversities = rawRecommendation.universities.map((uni) => {
      const computedFinalScore = calculateWeightedScore(uni.subScores);
      return {
        ...uni,
        finalScore: computedFinalScore,
      };
    });

    // Re-rank 1 to 10 based on computed score
    processedUniversities.sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
    processedUniversities.forEach((u, index) => {
      u.rank = index + 1;
    });

    const finalResponse = {
      ...rawRecommendation,
      universities: processedUniversities,
    };

    // Store in server cache
    await serverCache.set(cacheKey, finalResponse, DEFAULT_TTL_SECONDS);

    return res.json({
      success: true,
      fromCache: false,
      data: finalResponse,
    });
  } catch (error) {
    console.error('Recommendations processing error:', (error as Error).message);
    return res.status(500).json({
      success: false,
      error: (error as Error).message || 'Unable to generate institutional recommendations at this juncture.',
      fallbackCatalog: ESTEEMED_NIGERIAN_UNIVERSITIES_FALLBACK,
    });
  }
});

// 2. University Detail Route with Web Search enabled
app.post('/api/university/detail', rateLimiter, async (req: Request, res: Response) => {
  try {
    const { slug, name, dreamJob, bypassCache } = req.body;
    if (!slug || !name) {
      return res.status(400).json({ error: 'University name and slug are required.' });
    }

    const cacheKey = createDetailCacheKey(slug, PROMPT_VERSION);

    if (!bypassCache) {
      const cached = await serverCache.get<unknown>(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          fromCache: true,
          data: cached,
        });
      }
    }

    const systemPrompt = buildDetailSystemPrompt(name);
    const userPrompt = `Inquire into the comprehensive undergraduate profile for "${name}" (Nigeria).
Candidate's vocational aspiration: ${dreamJob || 'General Undergraduate Studies'}.
Please verify contemporary post-UTME screening procedures, typical cut-off marks, updated tuition fees (in Naira), hostel situations, and academic faculties.`;

    const { data: detailData, threadId } = await callBackboardWithRetry(
      {
        content: userPrompt,
        systemPrompt,
        jsonOutput: true,
        webSearch: true, // Web search enabled for current figures
      },
      UniversityDetailSchema
    );

    await serverCache.set(cacheKey, detailData, DEFAULT_TTL_SECONDS);

    return res.json({
      success: true,
      fromCache: false,
      threadId,
      data: detailData,
    });
  } catch (error) {
    console.error('University detail processing error:', (error as Error).message);
    return res.status(500).json({
      success: false,
      error: (error as Error).message || 'Unable to retrieve verified archives for this institution.',
    });
  }
});

// 3. Counsellor Chat Route (Maintains session thread)
app.post('/api/counsellor/chat', rateLimiter, async (req: Request, res: Response) => {
  try {
    const validated = ChatRequestSchema.parse(req.body);

    const systemPrompt = `You are "UniMatch Counsellor", an erudite, encouraging and knowledgeable Nigerian university admissions advisor.
You are conversing with an aspiring Nigerian undergraduate regarding university choice, UTME cutoffs, O'level requirements, course prerequisites, and campus life.
Respond in a warm, dignified, and insightful tone. Keep responses helpful, precise, and practical.`;

    const contextualContent = validated.context
      ? `[Institutional Context: ${validated.context}]\nStudent Inquiry: ${validated.message}`
      : validated.message;

    const { data: responseText, threadId } = await callBackboardWithRetry(
      {
        content: contextualContent,
        systemPrompt,
        jsonOutput: false,
        threadId: validated.threadId,
      },
      // When jsonOutput is false, schema accepts string
      {
        parse: (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v)),
      } as any
    );

    return res.json({
      success: true,
      reply: responseText,
      threadId,
    });
  } catch (error) {
    console.error('Counsellor chat error:', (error as Error).message);
    return res.status(500).json({
      success: false,
      error: (error as Error).message || 'The counsellor is attending to another scholar. Please write again shortly.',
    });
  }
});

// 4. System Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    app: 'UniMatch NG',
    promptVersion: PROMPT_VERSION,
    timestamp: new Date().toISOString(),
  });
});

// Setup Vite dev middleware or serve static production build
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UniMatch NG server listening on port ${PORT} [mode: ${isDev ? 'development' : 'production'}]`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot failure:', err);
  process.exit(1);
});
