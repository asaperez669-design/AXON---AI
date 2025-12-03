/**
 * OpenAI Configuration Loader
 * Attempts to load API credentials from multiple sources
 */

interface OpenAIConfig {
  apiKey: string | null;
  baseURL: string | null;
}

/**
 * Load OpenAI configuration from environment or GenSpark config
 * Priority: 1) Cloudflare env vars, 2) Process env vars, 3) Default GenSpark values
 */
export function getOpenAIConfig(env: any): OpenAIConfig {
  // Try to get from Cloudflare Worker environment bindings
  const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = env.OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1';
  
  return {
    apiKey: apiKey || null,
    baseURL: baseURL || null
  };
}
