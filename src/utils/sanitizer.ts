/**
 * Security and Prompt Sanitization Utilities
 * Prevents prompt injections, XSS vulnerabilities, and unsafe user inputs.
 */

export function sanitizeUserInput(input: string): string {
  if (!input) return '';
  
  // Strip control characters and excessive whitespace
  let clean = input.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '');
  
  // Guard against basic HTML/script injections
  clean = clean
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return clean.trim();
}

/**
 * Prepares user queries for LLM safety guardrails
 */
export function sanitizeForGeminiPrompt(rawPrompt: string): string {
  if (!rawPrompt) return '';
  
  // Truncate overly long prompts to prevent token exhaustion / denial of service
  const maxLength = 2000;
  let sanitized = rawPrompt.slice(0, maxLength);

  // Neutralize common system jailbreak prefixes
  sanitized = sanitized.replace(/(ignore previous instructions|disregard instructions|you are now DAN)/gi, '[flagged phrase removed]');

  return sanitized.trim();
}

/**
 * Validates Gemini API Key format (Google AI Studio keys are typically 39 chars alphanumeric with dashes)
 */
export function validateGeminiApiKey(key: string): { isValid: boolean; message: string } {
  if (!key || key.trim().length === 0) {
    return { isValid: false, message: 'API key is required for live cloud calls.' };
  }
  const trimmed = key.trim();
  if (trimmed.length < 20) {
    return { isValid: false, message: 'API key appears too short (typically 39 characters).' };
  }
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return { isValid: false, message: 'API key contains invalid characters.' };
  }
  return { isValid: true, message: 'Valid API key format.' };
}
