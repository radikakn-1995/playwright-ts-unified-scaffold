import { test, expect } from '../../src/fixtures';
import { loadPolicyChunks } from '../../src/ai/rag/ingest';

// Day 9: RAG test dataset - each question and the document that must be retrieved
const retrievalCases = [
  { question: 'How many leave days can I carry forward?', expectedSource: 'leave-policy.md' },
  { question: 'When do I need a medical certificate?', expectedSource: 'leave-policy.md' },
  { question: 'What are the core working hours?', expectedSource: 'attendance-policy.md' },
  { question: 'Can I work from home three days a week?', expectedSource: 'attendance-policy.md' },
  { question: 'Do I need a receipt for a 300 rupee taxi ride?', expectedSource: 'expense-policy.md' },
  { question: 'Who approves an expense claim of 40,000 rupees?', expectedSource: 'expense-policy.md' },
];

test.describe('RAG pipeline', { tag: '@ai' }, () => {

  test('ingestion loads every document and respects chunk size', async () => {
    const chunks = await loadPolicyChunks(300, 50);
    const sources = new Set(chunks.map((c) => c.source));

    expect([...sources].sort()).toEqual(['attendance-policy.md', 'expense-policy.md', 'leave-policy.md']);
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(300);
    }
  });

  test('retrieval accuracy: the right document is in the top 3', async ({ policyStore }) => {
    let hits = 0;
    for (const { question, expectedSource } of retrievalCases) {
      const results = await policyStore.search(question, 3);
      const found = results.some((r) => r.source === expectedSource);
      if (found) hits++;
      console.log(`${found ? 'HIT ' : 'MISS'} | ${question} -> ${results.map((r) => r.source).join(', ')}`);
    }
    const hitRate = hits / retrievalCases.length;
    test.info().annotations.push({ type: 'retrieval hit rate', description: hitRate.toFixed(2) });

    expect(hitRate).toBeGreaterThanOrEqual(0.8);
  });

  test('context relevance: HR questions score higher than off-topic ones', async ({ policyStore }) => {
    const [hrMatch] = await policyStore.search('How many sick leave days do I get?', 1);
    const [offTopic] = await policyStore.search('What is the capital of France?', 1);

    expect(hrMatch.score).toBeGreaterThan(offTopic.score);
  });

  test('grounding: the answer uses the retrieved policy', async ({ ragAssistant }) => {
    const result = await ragAssistant.ask('How many days of paternity leave do I get?');

    expect(result.contexts.some((c) => c.text.includes('10 working days'))).toBeTruthy();
    expect(result.answer).toContain('10');
  });

  test('no relevant context means no invented answer', async ({ ragAssistant }) => {
    const result = await ragAssistant.ask('What is the company policy on bringing pets to the office?');
    expect(result.answer).toContain("don't know");
  });
});
