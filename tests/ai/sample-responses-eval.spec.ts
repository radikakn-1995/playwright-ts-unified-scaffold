import fs from 'fs';
import path from 'path';
import { test, expect } from '../../src/fixtures';
import { THRESHOLDS } from '../../src/ai/eval/thresholds';

type Sample = {
  id: string;
  label: 'good' | 'bad';
  defect?: string;
  question: string;
  expected: string;
  context: string;
  response: string;
};

const samples: Sample[] = JSON.parse(
  fs.readFileSync(path.resolve('src/testdata/ai/sample-responses.json'), 'utf-8'),
);

// Day 11 deliverable: automated evaluation of sample (pre-recorded) LLM responses.
// Good responses must pass the thresholds; known-bad responses must be caught.
test.describe('Evaluation of sample LLM responses', { tag: ['@ai', '@golden'] }, () => {
  for (const sample of samples) {
    const title = `${sample.id} [${sample.label}${sample.defect ? `: ${sample.defect}` : ''}]`;

    test(title, async ({ judge }) => {
      const correctness = await judge.correctness(sample.question, sample.response, sample.expected);
      const groundedness = await judge.groundedness(sample.response, [sample.context]);

      test.info().annotations.push(
        { type: 'correctness', description: `${correctness.score} - ${correctness.reason}` },
        { type: 'groundedness', description: `${groundedness.score} - ${groundedness.reason}` },
      );

      const passes =
        correctness.score >= THRESHOLDS.correctness && groundedness.score >= THRESHOLDS.groundedness;

      if (sample.label === 'good') {
        expect(passes, `a good response was rejected: ${correctness.reason} / ${groundedness.reason}`).toBeTruthy();
      } else {
        expect(passes, `a bad response (${sample.defect}) was not caught`).toBeFalsy();
      }
    });
  }
});
