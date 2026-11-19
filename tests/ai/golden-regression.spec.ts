import fs from 'fs';
import path from 'path';
import { test, expect } from '../../src/fixtures';
import { THRESHOLDS } from '../../src/ai/eval/thresholds';
import { NOT_FOUND } from '../../src/ai/app/hrAssistant';

type GoldenCase = {
  id: string;
  category: 'factual' | 'unanswerable' | 'out-of-scope' | 'adversarial';
  question: string;
  expected: string;
  expectedSource: string | null;
};

// Categories where the correct behaviour is to refuse / say "I don't know".
const REFUSAL_CATEGORIES: GoldenCase['category'][] = ['unanswerable', 'out-of-scope', 'adversarial'];
const isRefusal = (answer: string) =>
  answer.toLowerCase().includes(NOT_FOUND.toLowerCase()) ||
  /decline|can't|cannot|can only|only answer|not able|unable|only help/i.test(answer);

const golden: GoldenCase[] = JSON.parse(
  fs.readFileSync(path.resolve('src/testdata/ai/golden-dataset.json'), 'utf-8'),
);

// Day 11: AI regression suite over the golden dataset
test.describe('Golden dataset regression', { tag: ['@ai', '@golden'] }, () => {
  for (const item of golden) {
    test(`${item.id} [${item.category}] ${item.question}`, async ({ ragAssistant, judge }) => {
      const result = await ragAssistant.ask(item.question);
      const sources = result.contexts.map((c) => c.source);

      if (item.expectedSource) {
        expect.soft(sources, 'retrieval found the right document').toContain(item.expectedSource);
      }

            // Hybrid evaluation: a deterministic check when the expected behaviour is a refusal,
      // the LLM judge for open-ended answers.
      const correctness =
        REFUSAL_CATEGORIES.includes(item.category) && isRefusal(result.answer)
          ? { score: 1, reason: 'Deterministic check: the assistant refused as expected.' }
          : await judge.correctness(item.question, result.answer, item.expected);
      const groundedness = await judge.groundedness(result.answer, result.contexts.map((c) => c.text));

      await test.info().attach('evaluation', {
        body: JSON.stringify({ ...item, answer: result.answer, sources, correctness, groundedness }, null, 2),
        contentType: 'application/json',
      });

      expect(correctness.score, correctness.reason).toBeGreaterThanOrEqual(THRESHOLDS.correctness);
      expect(groundedness.score, groundedness.reason).toBeGreaterThanOrEqual(THRESHOLDS.groundedness);
    });
  }
});
