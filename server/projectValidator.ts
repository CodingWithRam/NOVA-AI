export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_PROMPT_LENGTH = 10000;
const MAX_TOTAL_FILES = 50;
const MAX_FILE_SIZE_BYTES = 1024 * 512; // 512KB per file
const MAX_PROJECT_TOTAL_BYTES = 1024 * 1024 * 10; // 10MB total

export function validateGenerationRequest(body: any): ValidationResult {
  if (!body) {
    return { valid: false, error: 'Request body is empty.' };
  }

  const { prompt, currentFiles } = body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt is required and must not be empty.' };
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return {
      valid: false,
      error: `Prompt exceeds maximum allowed length of ${MAX_PROMPT_LENGTH} characters.`,
    };
  }

  if (currentFiles && typeof currentFiles !== 'object') {
    return { valid: false, error: 'currentFiles must be an object map of file paths to contents.' };
  }

  if (currentFiles) {
    const fileKeys = Object.keys(currentFiles);
    if (fileKeys.length > MAX_TOTAL_FILES) {
      return {
        valid: false,
        error: `Project exceeds the maximum allowed limit of ${MAX_TOTAL_FILES} files.`,
      };
    }

    let totalBytes = 0;
    for (const filePath of fileKeys) {
      // Validate path security: no path traversal, null bytes, or system files
      if (
        filePath.includes('../') || 
        filePath.includes('..\\') || 
        filePath.startsWith('/') || 
        filePath.startsWith('\\') ||
        filePath.includes('\0') ||
        /^[a-zA-Z]:/.test(filePath) ||
        filePath.startsWith('.env') ||
        filePath.includes('/.env') ||
        filePath.startsWith('.git')
      ) {
        return {
          valid: false,
          error: `Invalid file path: ${filePath}. Relative traversal, drive roots, null bytes, and sensitive files are not permitted.`,
        };
      }

      const content = currentFiles[filePath];
      if (typeof content !== 'string') {
        return { valid: false, error: `Content for file ${filePath} must be a string.` };
      }

      const size = Buffer.byteLength(content, 'utf8');
      if (size > MAX_FILE_SIZE_BYTES) {
        return {
          valid: false,
          error: `File ${filePath} exceeds the maximum per-file limit of 512KB.`,
        };
      }

      totalBytes += size;
    }

    if (totalBytes > MAX_PROJECT_TOTAL_BYTES) {
      return {
        valid: false,
        error: 'Total project size exceeds maximum allowed limit of 10MB.',
      };
    }
  }

  return { valid: true };
}
