import { LlmClient, cosineSimilarity } from '../llm/llmClient';
import { Chunk } from './ingest';

export type ScoredChunk = Chunk & { score: number };

/** A tiny vector database: stores embeddings and returns the most similar chunks */
export class InMemoryVectorStore {
  private readonly items: { chunk: Chunk; vector: number[] }[] = [];

  constructor(private readonly llm: LlmClient) {}

  async add(chunks: Chunk[]): Promise<void> {
    const vectors = await this.llm.embed(chunks.map((c) => c.text));
    chunks.forEach((chunk, i) => this.items.push({ chunk, vector: vectors[i] }));
  }

  async search(query: string, k = 3): Promise<ScoredChunk[]> {
    const [queryVector] = await this.llm.embed([query]);
    return this.items
      .map(({ chunk, vector }) => ({ ...chunk, score: cosineSimilarity(queryVector, vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }

  get size(): number {
    return this.items.length;
  }
}
