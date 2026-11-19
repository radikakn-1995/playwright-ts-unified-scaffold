import dotenvFlow from 'dotenv-flow';

export type Environment = {
  baseUrl: string;
  adminUsername: string;
  adminPassword: string;
  apiBaseUrlPath: string;
  defaultTimeout: number;
  // LLM settings (Day 6). They have defaults, so UI-only runs never fail on them.
  llmBaseUrl: string;
  llmApiKey: string;
  llmModel: string;
  judgeModel: string;
  embeddingModel: string;
};

let cachedEnvironment: Environment | null = null;
let isLoaded = false;

function loadEnvFiles(): void {
  if (isLoaded) return;
  dotenvFlow.config({ default_node_env: 'qa' });
  isLoaded = true;
}

export function getEnvironment(): Environment {
  if (cachedEnvironment) {
    return cachedEnvironment;
  }

  loadEnvFiles();

  cachedEnvironment = {
    baseUrl: getRequired('BASE_URL'),
    adminUsername: getRequired('ADMIN_USERNAME'),
    adminPassword: getRequired('ADMIN_PASSWORD'),
    apiBaseUrlPath: process.env.API_BASE_URL_PATH || '/web/index.php/api/v2',
    defaultTimeout: Number(process.env.DEFAULT_TIMEOUT) || 30000,
    llmBaseUrl: process.env.LLM_BASE_URL || 'http://localhost:11434/v1',
    llmApiKey: process.env.LLM_API_KEY || 'ollama',
    llmModel: process.env.LLM_MODEL || 'llama3.2',
    judgeModel: process.env.JUDGE_MODEL || process.env.LLM_MODEL || 'llama3.2',
    embeddingModel: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
  };

  return cachedEnvironment;
}

function getRequired(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Check your .env.${process.env.NODE_ENV || 'qa'} file, or .env.local overrides.`
    );
  }
  return value;
}
