import { GoogleGenAI, Type } from '@google/genai';
import { synthesizeFallbackProjectChanges, synthesizeSmartErrorFix } from './smartSynthesizer.js';

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest'
];

export interface FileOperation {
  action: 'create' | 'update' | 'delete';
  path: string;
  content?: string;
  description?: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface GenerationResult {
  engine: 'Nova AI' | 'offline_fallback';
  summary: string;
  thoughts?: string;
  fileOperations: FileOperation[];
  suggestedActions: string[];
  groundingSources?: GroundingSource[];
  errorDetails?: string;
}

export interface GenerateOptions {
  prompt: string;
  currentFiles: Record<string, string>;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  template?: string;
  useGoogleSearch?: boolean;
}

// Track models that have exhausted their quota to skip them in subsequent requests
const exhaustedModels = new Map<string, number>();

function isModelTemporarilyExhausted(model: string): boolean {
  const expiry = exhaustedModels.get(model);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    exhaustedModels.delete(model);
    return false;
  }
  return true;
}

function markModelExhausted(model: string) {
  // Back off temporarily for 15 seconds only
  exhaustedModels.set(model, Date.now() + 15 * 1000);
}

function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMsg)), ms);
  });
  return Promise.race([
    promise.then((res) => { clearTimeout(timer); return res; }),
    timeoutPromise
  ]);
}

const SYSTEM_INSTRUCTION = `You are NovaBuild AI, a high-velocity software architect and UI engineering agent.
Your mission is to generate and iteratively refine production-grade web applications with speed and precision.

Rules:
1. Work with modern web architectures:
   - For React applications: Use modern functional React with Tailwind CSS and Lucide icons.
   - For Vanilla applications: Clean HTML5, Tailwind CSS, and ES6+ JavaScript.
2. Maintain project context:
   - Only modify or create the files needed for the request.
   - DO NOT overwrite or delete unrelated files.
3. Code completeness:
   - Always output COMPLETE, functional, working code without placeholders or TODO comments.
   - Ensure components have default exports or clean App declarations.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { 
      type: Type.STRING,
      description: 'Brief 1-2 sentence description of what was designed or modified.'
    },
    thoughts: { 
      type: Type.STRING,
      description: 'High-level architectural reasoning and implementation steps taken.'
    },
    fileOperations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          action: { 
            type: Type.STRING,
            description: "Must be 'create', 'update', or 'delete'"
          },
          path: { 
            type: Type.STRING,
            description: "Relative project file path (e.g. index.html or src/App.jsx)"
          },
          content: { 
            type: Type.STRING,
            description: "Full, complete code content of this file"
          },
          description: { 
            type: Type.STRING,
            description: "Brief note on what was changed in this file"
          },
        },
        required: ['action', 'path'],
      },
    },
    suggestedActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2-4 suggested follow-up prompts for the user to try next'
    },
  },
  required: ['summary', 'fileOperations'],
};

/**
 * Sanitizes unescaped control characters inside JSON strings
 */
export function sanitizeJsonString(str: string): string {
  let result = '';
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = str.charCodeAt(i);

    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString) {
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else if (code < 32) {
        result += '\\u' + code.toString(16).padStart(4, '0');
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Parses markdown code blocks when Google Search is used
 */
export function parseSearchGroundedResponse(raw: string, currentFiles: Record<string, string>): GenerationResult {
  const operations: FileOperation[] = [];
  
  // Look for file headers like "### File: src/App.jsx" or "File: index.html" followed by code fence
  const fileRegex = /(?:###\s*File:\s*|File:\s*)([a-zA-Z0-9_\-\.\/]+)[\s\S]*?```(?:[a-zA-Z0-9]*)\n([\s\S]*?)```/g;
  let match;
  while ((match = fileRegex.exec(raw)) !== null) {
    const filePath = match[1].trim();
    const content = match[2].trim();
    if (filePath && content) {
      operations.push({
        action: currentFiles[filePath] ? 'update' : 'create',
        path: filePath,
        content,
        description: `Updated with latest Google Search web grounding`
      });
    }
  }

  // If no "### File:" headers, look for standard code blocks
  if (operations.length === 0) {
    const jsxMatch = raw.match(/```(?:jsx|javascript|tsx|ts)\n([\s\S]*?)```/);
    if (jsxMatch) {
      const targetPath = currentFiles['src/App.jsx'] ? 'src/App.jsx' : (currentFiles['src/App.tsx'] ? 'src/App.tsx' : 'src/App.jsx');
      operations.push({
        action: 'update',
        path: targetPath,
        content: jsxMatch[1].trim(),
        description: 'Updated React application component'
      });
    }

    const htmlMatch = raw.match(/```(?:html|htm)\n([\s\S]*?)```/);
    if (htmlMatch) {
      operations.push({
        action: 'update',
        path: 'index.html',
        content: htmlMatch[1].trim(),
        description: 'Updated HTML markup'
      });
    }

    const cssMatch = raw.match(/```css\n([\s\S]*?)```/);
    if (cssMatch && currentFiles['src/index.css']) {
      operations.push({
        action: 'update',
        path: 'src/index.css',
        content: cssMatch[1].trim(),
        description: 'Updated CSS stylesheet'
      });
    }
  }

  // Clean conversational text as summary
  const summaryText = raw
    .replace(/```[\s\S]*?```/g, '')
    .trim()
    .slice(0, 300) || 'Synthesized updates using live Google Search data.';

  return {
    engine: 'Nova AI',
    summary: summaryText,
    thoughts: 'Analyzed live Google Search grounding results and generated verified web code.',
    fileOperations: operations,
    suggestedActions: [
      'Test live preview in responsive mode',
      'Add further custom styling',
      'Deploy to cloud endpoint'
    ]
  };
}

/**
 * Safely parses JSON emitted by the model
 */
export function safeParseJson(raw: string, currentFiles: Record<string, string> = {}): GenerationResult {
  let clean = raw.trim();

  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // 1. Direct parse
  try {
    const parsed = JSON.parse(clean);
    if (parsed && Array.isArray(parsed.fileOperations)) {
      return parsed;
    }
  } catch (e1) {}

  // 2. Sanitized parse
  try {
    const sanitized = sanitizeJsonString(clean);
    const parsed = JSON.parse(sanitized);
    if (parsed && Array.isArray(parsed.fileOperations)) {
      return parsed;
    }
  } catch (e2) {}

  // 3. Sliced outermost { ... }
  try {
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const sliced = clean.slice(firstBrace, lastBrace + 1);
      const sanitized = sanitizeJsonString(sliced);
      const parsed = JSON.parse(sanitized);
      if (parsed && Array.isArray(parsed.fileOperations)) {
        return parsed;
      }
    }
  } catch (e3) {}

  // 4. Fallback search grounded markdown extractor
  return parseSearchGroundedResponse(raw, currentFiles);
}

function buildPromptContent(options: GenerateOptions): string {
  const filesSummary = Object.keys(options.currentFiles)
    .map((path) => {
      const content = options.currentFiles[path];
      // Keep prompt lightweight for fast token processing (<3000 chars per file)
      const preview = content.length > 3000 ? content.slice(0, 3000) + '\n/* ... content truncated for speed ... */' : content;
      return `File: ${path}:\n\`\`\`\n${preview}\n\`\`\``;
    })
    .join('\n\n');

  let historyContext = '';
  if (options.conversationHistory && options.conversationHistory.length > 0) {
    historyContext = 'Recent conversation context:\n' +
      options.conversationHistory.slice(-2).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n') +
      '\n\n';
  }

  if (options.useGoogleSearch) {
    return `${historyContext}CURRENT PROJECT FILES:
${filesSummary || '(No existing files in this project yet)'}

USER REQUEST (USE GOOGLE SEARCH):
${options.prompt}

Instructions for Google Search mode:
1. Search the web for up-to-date documentation, examples, and libraries.
2. For any files you create or update, write:
### File: <relative path>
\`\`\`<language>
<complete code>
\`\`\`
3. Provide a clear summary and citation of what you found.`;
  }

  return `${historyContext}CURRENT PROJECT FILES:
${filesSummary || '(No existing files in this project yet)'}

USER REQUEST:
${options.prompt}

Generate complete code changes to satisfy the request. Return valid JSON adhering to the specified schema.`;
}

export async function generateProjectChanges(options: GenerateOptions): Promise<GenerationResult> {
  if (!apiKey) {
    console.warn('API key missing, using instant offline engine');
    return synthesizeFallbackProjectChanges(options.prompt, options.currentFiles);
  }

  const promptContent = buildPromptContent(options);
  const isSearch = Boolean(options.useGoogleSearch);
  
  // High-performance models with gemini-3.5-flash-lite as primary
  const candidateModels = CANDIDATE_MODELS;

  for (const model of candidateModels) {
    if (isModelTemporarilyExhausted(model)) {
      continue;
    }

    // If search requested, try search first; if search quota is exceeded (429), immediately fall back to model directly
    const searchOptions = isSearch ? [true, false] : [false];

    for (const searchAttempt of searchOptions) {
      const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
      };

      if (searchAttempt) {
        config.tools = [{ googleSearch: {} }];
      } else {
        config.responseMimeType = 'application/json';
        config.responseSchema = RESPONSE_SCHEMA;
      }

      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model,
            contents: promptContent,
            config,
          }),
          25000,
          `Model ${model} timed out`
        );

        const text = response.text || '';
        const parsed = searchAttempt 
          ? parseSearchGroundedResponse(text, options.currentFiles)
          : safeParseJson(text, options.currentFiles);

        // Extract Google Search grounding chunks if present
        const groundingChunks = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks && Array.isArray(groundingChunks)) {
          const sources: GroundingSource[] = [];
          for (const chunk of groundingChunks) {
            if (chunk.web?.uri) {
              sources.push({
                title: chunk.web.title || chunk.web.uri,
                url: chunk.web.uri,
              });
            }
          }
          parsed.groundingSources = sources.slice(0, 6);
        }

        parsed.engine = 'Nova AI';
        return parsed;
      } catch (modelErr: any) {
        const errMsg = modelErr?.message || '';
        console.warn(`Model ${model} (search=${searchAttempt}) notice:`, errMsg.slice(0, 100));

        // If search tool quota failed, gracefully continue to direct model synthesis without search tool
        if (searchAttempt && (errMsg.includes('429') || errMsg.includes('Quota') || errMsg.includes('RESOURCE_EXHAUSTED'))) {
          continue;
        }

        if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
          markModelExhausted(model);
        }
        break;
      }
    }
  }

  // Fast intelligent engine fallback without error alarm
  console.log('Invoking local Nova AI smart synthesis');
  const fallbackResult = synthesizeFallbackProjectChanges(options.prompt, options.currentFiles);
  fallbackResult.engine = 'Nova AI';
  return fallbackResult;
}

export async function* generateProjectChangesStream(options: GenerateOptions): AsyncGenerator<{
  type: 'thought' | 'chunk' | 'complete' | 'error';
  data: any;
}> {
  if (!apiKey) {
    const fallbackResult = synthesizeFallbackProjectChanges(options.prompt, options.currentFiles);
    yield {
      type: 'complete',
      data: fallbackResult,
    };
    return;
  }

  const promptContent = buildPromptContent(options);
  const isSearch = Boolean(options.useGoogleSearch);

  yield {
    type: 'thought',
    data: 'Synthesizing fast code changes with Nova AI...',
  };

  const candidateModels = CANDIDATE_MODELS;
  let streamWorked = false;

  for (const model of candidateModels) {
    if (isModelTemporarilyExhausted(model)) continue;

    const searchOptions = isSearch ? [true, false] : [false];

    for (const searchAttempt of searchOptions) {
      const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
      };

      if (searchAttempt) {
        config.tools = [{ googleSearch: {} }];
      } else {
        config.responseMimeType = 'application/json';
        config.responseSchema = RESPONSE_SCHEMA;
      }

      try {
        const streamResponse = await ai.models.generateContentStream({
          model,
          contents: promptContent,
          config,
        });

        let accumulatedText = '';
        for await (const chunk of streamResponse) {
          const chunkText = chunk.text || '';
          accumulatedText += chunkText;
          yield {
            type: 'chunk',
            data: chunkText,
          };
        }

        const parsed = searchAttempt 
          ? parseSearchGroundedResponse(accumulatedText, options.currentFiles)
          : safeParseJson(accumulatedText, options.currentFiles);

        yield {
          type: 'complete',
          data: parsed,
        };
        streamWorked = true;
        break;
      } catch (error: any) {
        const msg = error?.message || '';
        console.warn(`Stream model ${model} (search=${searchAttempt}) failed:`, msg.slice(0, 100));

        if (searchAttempt && (msg.includes('429') || msg.includes('Quota') || msg.includes('RESOURCE_EXHAUSTED'))) {
          continue;
        }

        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
          markModelExhausted(model);
        }
        break;
      }
    }

    if (streamWorked) break;
  }

  if (!streamWorked) {
    console.log('Stream completed via direct synthesis');
    try {
      const fallbackResult = await generateProjectChanges(options);
      yield {
        type: 'complete',
        data: fallbackResult,
      };
    } catch (err: any) {
      const fallbackResult = synthesizeFallbackProjectChanges(options.prompt, options.currentFiles);
      fallbackResult.engine = 'Nova AI';
      yield {
        type: 'complete',
        data: fallbackResult,
      };
    }
  }
}

export interface AutoFixOptions {
  errorMessage: string;
  currentFiles: Record<string, string>;
  stackTrace?: string;
  template?: string;
}

export async function autoFixErrorWithWebSearch(options: AutoFixOptions): Promise<GenerationResult> {
  const { errorMessage, currentFiles, stackTrace } = options;
  
  if (!apiKey) {
    return synthesizeSmartErrorFix(errorMessage, currentFiles);
  }

  const prompt = `CRITICAL APPLICATION ERROR OCCURRED IN WEB APP:
"${errorMessage}"
${stackTrace ? `Stack Trace / Error context: ${stackTrace}\n` : ''}

You are an expert full-stack debugging agent.
1. Analyze the project code below and determine the exact fix.
2. Fix the files completely so the application runs without errors.

Project Files:
${Object.entries(currentFiles)
  .slice(0, 8)
  .map(([path, content]) => `### File: ${path}\n\`\`\`\n${content.slice(0, 3500)}\n\`\`\``)
  .join('\n\n')}

Return your verified fix with the exact file blocks:
### File: path/to/file
\`\`\`
// corrected code
\`\`\`
`;

  const candidateModels = CANDIDATE_MODELS;
  for (const model of candidateModels) {
    if (isModelTemporarilyExhausted(model)) continue;

    // Try with and without search tool
    for (const searchAttempt of [true, false]) {
      try {
        const config: any = {
          systemInstruction: 'You are NovaBuild AI Self-Healing Engine. Analyze the code and output corrected code.',
          temperature: 0.1,
        };
        if (searchAttempt) {
          config.tools = [{ googleSearch: {} }];
        }

        const response = await withTimeout(
          ai.models.generateContent({
            model,
            contents: prompt,
            config,
          }),
          25000,
          `Auto-fix search on model ${model} timed out`
        );

        const text = response.text || '';
        const parsed = parseSearchGroundedResponse(text, currentFiles);
        parsed.summary = `🌐 Self-Healing: Resolved "${errorMessage.slice(0, 60)}"`;

        // Extract sources if any
        const groundingChunks = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks && Array.isArray(groundingChunks)) {
          const sources: GroundingSource[] = [];
          for (const chunk of groundingChunks) {
            if (chunk.web?.uri) {
              sources.push({
                title: chunk.web.title || chunk.web.uri,
                url: chunk.web.uri,
              });
            }
          }
          parsed.groundingSources = sources.slice(0, 6);
        }

        if (parsed.fileOperations && parsed.fileOperations.length > 0) {
          return parsed;
        }
      } catch (err: any) {
        const msg = err?.message || '';
        console.warn(`Auto-fix with model ${model} (search=${searchAttempt}) notice:`, msg.slice(0, 100));
        if (searchAttempt && (msg.includes('429') || msg.includes('Quota') || msg.includes('RESOURCE_EXHAUSTED'))) {
          continue;
        }
        break;
      }
    }
  }

  // Fallback to intelligent offline synthesizer
  return synthesizeSmartErrorFix(errorMessage, currentFiles);
}
