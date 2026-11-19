import OpenAI from 'openai';
import { getEnvironment } from '../../core/config/environment';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type ChatOptions = {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  json?: boolean; // ask the model to reply with JSON only
};

export type ChatResult = {
  text: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
};

/** One place that talks to the LLM. Works with Ollama, OpenAI and Azure OpenAI-compatible servers. */
export class LlmClient {
  private readonly client: OpenAI;
  readonly model: string;
  readonly judgeModel: string;
  private readonly embeddingModel: string;

  constructor() {
    const env = getEnvironment();
    this.client = new OpenAI({ baseURL: env.llmBaseUrl, apiKey: env.llmApiKey });
    this.model = env.llmModel;
    this.judgeModel = env.judgeModel;
    this.embeddingModel = env.embeddingModel;
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    const start = Date.now();
    const response = await this.client.chat.completions.create({
      model: options.model ?? this.model,
      messages,
      temperature: options.temperature ?? 0,
      max_tokens: options.maxTokens,
      response_format: options.json ? { type: 'json_object' } : undefined,
    });
    return {
      text: response.choices[0]?.message?.content ?? '',
      promptTokens: response.usage?.prompt_tokens ?? 0,
      completionTokens: response.usage?.completion_tokens ?? 0,
      latencyMs: Date.now() - start,
    };
  }

  async ask(question: string, options?: ChatOptions): Promise<ChatResult> {
    return this.chat([{ role: 'user', content: question }], options);
  }

  async embed(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({ model: this.embeddingModel, input: texts });
    return response.data.map((item) => item.embedding);
  }
}

/** How similar two embeddings are: 1 = same meaning, 0 = unrelated */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
