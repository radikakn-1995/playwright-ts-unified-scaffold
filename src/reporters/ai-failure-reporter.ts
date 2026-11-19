import fs from 'fs';
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { LlmClient } from '../ai/llm/llmClient';

const stripColours = (text: string) => text.replace(/\u001b\[[0-9;]*m/g, '');

/** Day 13: asks the LLM to classify each failure and suggest a fix. Enable with AI_REPORT=true. */
export default class AiFailureReporter implements Reporter {
  private readonly failures: { title: string; error: string }[] = [];

  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === 'failed' || result.status === 'timedOut') {
      this.failures.push({
        title: test.titlePath().filter(Boolean).join(' > '),
        error: stripColours(result.error?.message ?? 'No error message').slice(0, 3000),
      });
    }
  }

  async onEnd(): Promise<void> {
    if (this.failures.length === 0) return;

    const llm = new LlmClient();
    const sections = ['# AI failure analysis\n'];

    for (const failure of this.failures) {
      try {
        const result = await llm.chat([
          {
            role: 'system',
            content:
              'You are a senior QA engineer analysing Playwright test failures. ' +
              'Classify the failure as one of: LOCATOR, TIMING, TEST_DATA, ENVIRONMENT, PRODUCT_BUG. ' +
              'Then give the most likely cause and one concrete fix. Maximum 5 lines.',
          },
          { role: 'user', content: `Test: ${failure.title}\nError:\n${failure.error}` },
        ]);
        sections.push(`## ${failure.title}\n\n${result.text}\n`);
      } catch (error) {
        sections.push(`## ${failure.title}\n\nAI analysis unavailable: ${(error as Error).message}\n`);
      }
    }

    fs.writeFileSync('ai-failure-report.md', sections.join('\n'));
    console.log(`AI failure analysis for ${this.failures.length} test(s) written to ai-failure-report.md`);
  }
}
