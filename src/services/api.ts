import { Project } from '../types';

export interface HealthStatus {
  status: string;
  service: string;
  hasGeminiKey: boolean;
  timestamp: number;
  model: string;
}

export interface StreamCallbacks {
  onThought?: (thought: string) => void;
  onChunk?: (chunk: string) => void;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export async function checkBackendHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.json();
  } catch (e: any) {
    return {
      status: 'offline',
      service: 'NovaBuild AI Engine',
      hasGeminiKey: false,
      timestamp: Date.now(),
      model: 'gemini-3.8-flash',
    };
  }
}

export async function requestGeneration(
  prompt: string,
  project: Project,
  useGoogleSearch: boolean = false
): Promise<any> {
  const history = (project.messages || [])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-2)
    .map((m) => ({ role: m.role, content: m.content }));

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      currentFiles: project.files,
      conversationHistory: history,
      template: project.template,
      useGoogleSearch,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Generation request failed (${response.status})`);
  }

  return await response.json();
}

export async function requestGenerationStream(
  prompt: string,
  project: Project,
  callbacks: StreamCallbacks,
  useGoogleSearch: boolean = false
): Promise<void> {
  const history = (project.messages || [])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-2)
    .map((m) => ({ role: m.role, content: m.content }));

  const response = await fetch('/api/generate-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      currentFiles: project.files,
      conversationHistory: history,
      template: project.template,
      useGoogleSearch,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Stream request failed with status ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('ReadableStream not supported by browser or response.');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const block of lines) {
      const trimmed = block.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const jsonStr = trimmed.slice(6);
      try {
        const payload = JSON.parse(jsonStr);
        if (payload.type === 'thought' && callbacks.onThought) {
          callbacks.onThought(payload.data);
        } else if (payload.type === 'chunk' && callbacks.onChunk) {
          callbacks.onChunk(payload.data);
        } else if (payload.type === 'complete' && callbacks.onComplete) {
          callbacks.onComplete(payload.data);
        } else if (payload.type === 'error' && callbacks.onError) {
          callbacks.onError(payload.data);
        }
      } catch (e) {
        console.warn('Failed to parse SSE event:', jsonStr);
      }
    }
  }
}

export async function simulateProjectDeploy(project: Project): Promise<any> {
  const res = await fetch('/api/simulate-deploy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: project.id,
      projectName: project.name,
      files: project.files,
    }),
  });

  if (!res.ok) {
    throw new Error(`Deployment check failed: ${res.statusText}`);
  }

  return await res.json();
}
