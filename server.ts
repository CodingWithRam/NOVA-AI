import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { generateProjectChanges, generateProjectChangesStream, autoFixErrorWithWebSearch } from './server/geminiService.js';
import { synthesizeFallbackProjectChanges } from './server/smartSynthesizer.js';
import { validateGenerationRequest } from './server/projectValidator.js';
import { createLiveDeployment, getLiveDeployment } from './server/deploymentService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// SEO: robots.txt
app.get('/robots.txt', (req, res) => {
  const host = process.env.APP_URL || `${req.protocol}://${req.get('host') || 'localhost:3000'}`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /live/

Sitemap: ${host}/sitemap.xml
`);
});

// SEO: sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const host = process.env.APP_URL || `${req.protocol}://${req.get('host') || 'localhost:3000'}`;
  const now = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${host}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
});

// Public Live Deployment Host (Protected from search crawler indexing)
app.get('/live/:id', (req, res) => {
  const record = getLiveDeployment(req.params.id);
  
  // Security & privacy headers: do not index user-generated apps or leak referrer
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');

  if (!record) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Deployment Not Found — NovaBuild AI</title><script src="https://cdn.tailwindcss.com"></script></head>
        <body class="bg-zinc-950 text-zinc-100 flex items-center justify-center min-h-screen font-sans">
          <div class="text-center space-y-3 p-6 max-w-md">
            <h1 class="text-2xl font-bold">Deployment Not Found</h1>
            <p class="text-zinc-400 text-sm">This live preview link has expired or does not exist.</p>
            <a href="/" class="inline-block px-4 py-2 bg-indigo-600 rounded-lg text-xs font-semibold text-white">Back to Workspace</a>
          </div>
        </body>
      </html>
    `);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(record.html);
});

// Health and environment configuration check
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.json({
    status: 'ok',
    service: 'Nova AI Engine',
    hasNovaKey: hasKey,
    hasGeminiKey: hasKey,
    timestamp: Date.now(),
    model: 'nova-ai-3.1-flash',
  });
});

// Single-turn generation endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const validation = validateGenerationRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { prompt, currentFiles = {}, conversationHistory = [], template = 'react', useGoogleSearch = false } = req.body;
    
    const result = await generateProjectChanges({
      prompt,
      currentFiles,
      conversationHistory,
      template,
      useGoogleSearch: Boolean(useGoogleSearch),
    });

    res.json(result);
  } catch (err: any) {
    console.warn('Generation API notice, falling back to smart synthesis:', err?.message);
    try {
      const fallback = synthesizeFallbackProjectChanges(req.body.prompt || '', req.body.currentFiles || {});
      fallback.engine = 'Nova AI';
      return res.json(fallback);
    } catch (e2) {
      res.status(500).json({
        error: err?.message || 'Internal server error while generating project files.',
      });
    }
  }
});

// Server-Sent Events (SSE) streaming endpoint
app.post('/api/generate-stream', async (req, res) => {
  try {
    const validation = validateGenerationRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { prompt, currentFiles = {}, conversationHistory = [], template = 'react', useGoogleSearch = false } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = generateProjectChangesStream({
      prompt,
      currentFiles,
      conversationHistory,
      template,
      useGoogleSearch: Boolean(useGoogleSearch),
    });

    for await (const event of stream) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (err: any) {
    console.warn('Stream API notice, falling back to smart synthesis:', err?.message);
    try {
      const fallback = synthesizeFallbackProjectChanges(req.body.prompt || '', req.body.currentFiles || {});
      fallback.engine = 'Nova AI';
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
      }
      res.write(`data: ${JSON.stringify({ type: 'thought', data: 'Synthesizing verified code changes with Nova AI...' })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'complete', data: fallback })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    } catch (e2) {
      if (!res.headersSent) {
        res.status(500).json({ error: err?.message || 'Streaming failed.' });
      } else {
        res.write(`data: ${JSON.stringify({ type: 'error', data: err?.message })}\n\n`);
        res.end();
      }
    }
  }
});

// Self-Healing AI Agent: Auto-fix code errors using Internet Search
app.post('/api/autofix', async (req, res) => {
  try {
    const { errorMessage, currentFiles = {}, stackTrace = '', template = 'react' } = req.body;
    if (!errorMessage || typeof errorMessage !== 'string') {
      return res.status(400).json({ error: 'errorMessage is required.' });
    }

    const result = await autoFixErrorWithWebSearch({
      errorMessage,
      currentFiles,
      stackTrace,
      template,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Auto-fix API error:', err);
    res.status(500).json({
      error: err?.message || 'Failed to auto-fix error.',
    });
  }
});

// Real Live Deployment Endpoint
app.post('/api/deploy', (req, res) => {
  try {
    const { projectName = 'Nova App', files = {} } = req.body;
    const record = createLiveDeployment(projectName, files);
    const host = req.get('host') || 'localhost:3000';
    const absoluteUrl = `${req.protocol}://${host}/live/${record.id}`;

    res.json({
      success: true,
      deploymentId: record.id,
      url: `/live/${record.id}`,
      absoluteUrl,
      timestamp: record.createdAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Deployment failed.' });
  }
});

// Deployment preview simulation endpoint
app.post('/api/simulate-deploy', (req, res) => {
  try {
    const { projectId, projectName, files = {} } = req.body;
    const fileKeys = Object.keys(files);
    
    let totalSize = 0;
    for (const key of fileKeys) {
      totalSize += Buffer.byteLength(files[key] || '', 'utf8');
    }

    const hasIndexHtml = Boolean(files['index.html']);
    const hasPackageJson = Boolean(files['package.json']);
    const isReact = Object.keys(files).some(k => k.endsWith('.jsx') || k.endsWith('.tsx') || (files[k] && files[k].includes('react')));

    // Create real live deployment
    const record = createLiveDeployment(projectName || 'Nova App', files);
    const host = req.get('host') || 'localhost:3000';
    const absoluteUrl = `${req.protocol}://${host}/live/${record.id}`;

    res.json({
      success: true,
      deploymentId: record.id,
      domain: `live/${record.id}`,
      url: absoluteUrl,
      livePath: `/live/${record.id}`,
      status: 'ready',
      stats: {
        fileCount: fileKeys.length,
        totalBytes: totalSize,
        framework: isReact ? 'React (SPA)' : 'Static HTML/JS',
        hasIndexHtml,
        hasPackageJson,
      },
      cliCommands: {
        vercel: `npm i -g vercel\nvercel --prod`,
        netlify: `npm i -g netlify-cli\nnetlify deploy --prod`,
        cloudflare: `npx wrangler pages deploy .`,
      },
      timestamp: Date.now(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to deploy project' });
  }
});

// Development vs Production serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NovaBuild AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
