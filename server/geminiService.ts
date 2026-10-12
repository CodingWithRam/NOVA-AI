import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { synthesizeFallbackProjectChanges } from './smartSynthesizer.js';

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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
  summary: string;
  thoughts?: string;
  fileOperations: FileOperation[];
  suggestedActions: string[];
  groundingSources?: GroundingSource[];
}

export interface GenerateOptions {
  prompt: string;
  currentFiles: Record<string, string>;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  template?: string;
  useGoogleSearch?: boolean;
}

const SYSTEM_INSTRUCTION = `You are NovaBuild AI, a high-velocity software architect and UI engineering agent.
Your mission is to generate and iteratively refine production-grade web applications with speed and precision.

Rules & Guidelines:
1. Work with modern web architectures:
   - For React applications: Use modern functional React with Tailwind CSS and Lucide icons.
   - For Vanilla web applications: Modern HTML5, clean CSS3, and ES6+ JavaScript.
2. Maintain project context:
   - When updating an existing project, DO NOT wipe or overwrite unrelated files.
   - Only modify, create, or delete the files needed to satisfy the user's prompt.
3. Code quality:
   - Always output COMPLETE, functional, working code without placeholders or TODO comments.
   - Design clean, responsive, and visually refined interfaces.
4. Output Format:
   Return valid JSON with summary, thoughts, fileOperations, and suggestedActions.
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
      description: '3-4 suggested follow-up prompts for the user to try next'
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
 * Safely parses JSON emitted by the model
 */
export function safeParseJson(raw: string): GenerationResult {
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

  // 4. Fallback if user used Google Search and output is conversational text + code
  const codeBlocks: FileOperation[] = [];
  const htmlMatch = clean.match(/```html([\s\S]*?)```/);
  if (htmlMatch) {
    codeBlocks.push({ action: 'update', path: 'index.html', content: htmlMatch[1].trim() });
  }
  const jsxMatch = clean.match(/```(?:jsx|javascript|tsx|ts)([\s\S]*?)```/);
  if (jsxMatch) {
    codeBlocks.push({ action: 'update', path: 'src/App.jsx', content: jsxMatch[1].trim() });
  }

  if (codeBlocks.length > 0) {
    return {
      summary: clean.slice(0, 180) + '...',
      thoughts: 'Synthesized code from search grounded model response.',
      fileOperations: codeBlocks,
      suggestedActions: ['Test generated features', 'Add extra styling', 'Make responsive'],
    };
  }

  throw new Error('Failed to parse project operations from AI output.');
}

function buildPromptContent(options: GenerateOptions): string {
  const filesSummary = Object.keys(options.currentFiles)
    .map((path) => {
      const content = options.currentFiles[path];
      // Keep prompt lightweight for fast token processing
      const preview = content.length > 4000 ? content.slice(0, 4000) + '\n/* ... truncated for speed ... */' : content;
      return `File: ${path}:\n\`\`\`\n${preview}\n\`\`\``;
    })
    .join('\n\n');

  let historyContext = '';
  if (options.conversationHistory && options.conversationHistory.length > 0) {
    historyContext = 'Recent conversation context:\n' +
      options.conversationHistory.slice(-2).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n') +
      '\n\n';
  }

  return `${historyContext}CURRENT PROJECT FILES:
${filesSummary || '(No existing files in this project yet)'}

USER REQUEST:
${options.prompt}

Generate code changes to fulfill the request. Return valid JSON.`;
}

export async function generateProjectChanges(options: GenerateOptions): Promise<GenerationResult> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please configure it in the platform Secrets.');
  }

  const promptContent = buildPromptContent(options);
  const isSearch = Boolean(options.useGoogleSearch);
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.2,
  };

  if (isSearch) {
    config.tools = [{ googleSearch: {} }];
  } else {
    config.responseMimeType = 'application/json';
    config.responseSchema = RESPONSE_SCHEMA;
  }

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: promptContent,
        config,
      });

      const text = response.text || '';
      const parsed = safeParseJson(text);

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

      return parsed;
    } catch (modelErr: any) {
      console.warn(`Model ${model} failed:`, modelErr?.message?.slice(0, 100));
    }
  }

  // If all models hit quota or error, invoke smart synthesizer fallback
  console.warn('All models exhausted, invoking smart synthesizer fallback');
  const fallbackResult = synthesizeFallbackProjectChanges(options.prompt, options.currentFiles);
  fallbackResult.summary = `${fallbackResult.summary} (⚡ NovaBuild Engine)`;
  return fallbackResult;
}

export async function* generateProjectChangesStream(options: GenerateOptions): AsyncGenerator<{
  type: 'thought' | 'chunk' | 'complete' | 'error';
  data: any;
}> {
  if (!apiKey) {
    yield {
      type: 'error',
      data: 'GEMINI_API_KEY is not configured on the server. Please configure it in the platform Secrets.',
    };
    return;
  }

  const promptContent = buildPromptContent(options);
  const model = 'gemini-3.1-flash-lite';
  const isSearch = Boolean(options.useGoogleSearch);

  yield {
    type: 'thought',
    data: isSearch ? 'Searching Google & synthesizing project code...' : 'Synthesizing fast code changes...',
  };

  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.2,
    thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
  };

  if (isSearch) {
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
    let lastChunkTime = Date.now();

    for await (const chunk of streamResponse) {
      const chunkText = chunk.text || '';
      accumulatedText += chunkText;
      yield {
        type: 'chunk',
        data: chunkText,
      };
      lastChunkTime = Date.now();
    }

    const parsed = safeParseJson(accumulatedText);
    yield {
      type: 'complete',
      data: parsed,
    };
  } catch (error: any) {
    console.warn('Stream failed, falling back to unary generation:', error?.message);
    try {
      const fallbackResult = await generateProjectChanges(options);
      yield {
        type: 'complete',
        data: fallbackResult,
      };
    } catch (fallbackError: any) {
      const fallbackResult = synthesizeFallbackProjectChanges(options.prompt, options.currentFiles);
      fallbackResult.summary = `${fallbackResult.summary} (⚡ NovaBuild Engine)`;
      yield {
        type: 'complete',
        data: fallbackResult,
      };
    }
  }
}
