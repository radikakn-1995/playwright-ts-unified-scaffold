import { LlmClient } from '../llm/llmClient';
import { SYSTEM_PROMPT } from '../app/hrAssistant';
import { InMemoryVectorStore, ScoredChunk } from './vectorStore';

export type RagAnswer = { question: string; answer: string; contexts: ScoredChunk[] };

/** Day 9 version: retrieve the relevant chunks first, then answer from them only */
export class RagHrAssistant {
  constructor(
    private readonly llm: LlmClient,
    private readonly store: InMemoryVectorStore,
    private readonly k = 3,
  ) {}

  async ask(question: string): Promise<RagAnswer> {
    const contexts = await this.store.search(question, this.k);
    const contextText = contexts.map((c, i) => `[${i + 1}] (${c.source})\n${c.text}`).join('\n\n');

    const result = await this.llm.chat([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `HR policy text:\n${contextText}\n\nQuestion: ${question}` },
    ]);
    return { question, answer: result.text, contexts };
  }
}
