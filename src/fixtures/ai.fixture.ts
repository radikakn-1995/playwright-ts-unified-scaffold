import { test as base } from '@playwright/test';
import { LlmClient } from '../ai/llm/llmClient';
import { HrAssistant } from '../ai/app/hrAssistant';
import { loadPolicyChunks } from '../ai/rag/ingest';
import { InMemoryVectorStore } from '../ai/rag/vectorStore';
import { RagHrAssistant } from '../ai/rag/ragAssistant';
import { LlmJudge } from '../ai/eval/judge';

type AiTestFixtures = {
  hrAssistant: HrAssistant;
  ragAssistant: RagHrAssistant;
  judge: LlmJudge;
};

type AiWorkerFixtures = {
  llm: LlmClient;
  policyStore: InMemoryVectorStore;
};

export const test = base.extend<AiTestFixtures, AiWorkerFixtures>({
  // Worker-scoped: created once per worker and shared by its tests
  llm: [async ({}, use) => {
    await use(new LlmClient());
  }, { scope: 'worker' }],

  policyStore: [async ({ llm }, use) => {
    const store = new InMemoryVectorStore(llm);
    await store.add(await loadPolicyChunks());
    await use(store);
  }, { scope: 'worker' }],

  // Test-scoped
  hrAssistant: async ({ llm }, use) => {
    await use(new HrAssistant(llm));
  },

  ragAssistant: async ({ llm, policyStore }, use) => {
    await use(new RagHrAssistant(llm, policyStore));
  },

  judge: async ({ llm }, use) => {
    await use(new LlmJudge(llm));
  },
});
