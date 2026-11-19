import fs from 'fs';
import path from 'path';
import { LlmClient } from '../llm/llmClient';

export const NOT_FOUND = "I don't know based on the HR policies.";

export const SYSTEM_PROMPT = `You are the HR Policy Assistant for Acme Corp.
Rules:
1. Answer ONLY using the HR policy text provided.
2. If the answer is not in the policy text, reply exactly: ${NOT_FOUND}
3. Refuse questions that are not about HR policies.
4. Keep answers under 3 sentences and stay polite.`;

export function loadAllPolicies(): string {
  const dir = path.resolve('src/ai/data/policies');
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => fs.readFileSync(path.join(dir, file), 'utf-8'))
    .join('\n\n');
}

/** Day 7 version: the whole policy text goes into every prompt ("context stuffing") */
export class HrAssistant {
  private readonly policies = loadAllPolicies();

  constructor(private readonly llm: LlmClient) {}

  async ask(question: string): Promise<string> {
    const result = await this.llm.chat([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `HR policy text:\n${this.policies}\n\nQuestion: ${question}` },
    ]);
    return result.text;
  }
}
