import fs from 'fs';
import type { FullResult, Reporter, TestCase } from '@playwright/test/reporter';

const METRICS = ['correctness', 'relevance', 'groundedness', 'safety', 'consistency', 'fairness', 'retrieval hit rate'];
const SUMMARY_FILE = 'eval-summary.json';
const BASELINE_FILE = 'eval-baseline.json';
const ALLOWED_DROP = 0.05;   // a metric may fall by at most 0.05 versus the baseline

type Summary = Record<string, { average: number; count: number }>;

/**
 * Day 11: AI regression reporter.
 * Collects every metric score recorded with test.info().annotations, writes averages to eval-summary.json,
 * and fails the run if any average dropped more than ALLOWED_DROP below eval-baseline.json.
 */
export default class EvalSummaryReporter implements Reporter {
  private readonly scores: Record<string, number[]> = {};

  onTestEnd(test: TestCase): void {
    for (const annotation of test.annotations) {
      if (!METRICS.includes(annotation.type) || !annotation.description) continue;
      const score = parseFloat(annotation.description);   // "0.9 - reason" -> 0.9
      if (!Number.isNaN(score)) (this.scores[annotation.type] ??= []).push(score);
    }
  }

  async onEnd(result: FullResult): Promise<{ status?: FullResult['status'] } | void> {
    const summary: Summary = {};
    for (const [metric, values] of Object.entries(this.scores)) {
      const average = values.reduce((sum, v) => sum + v, 0) / values.length;
      summary[metric] = { average: Number(average.toFixed(3)), count: values.length };
    }
    if (Object.keys(summary).length === 0) return;

    fs.writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2));
    console.log('\nAI evaluation summary:');
    console.table(summary);

    if (!fs.existsSync(BASELINE_FILE)) {
      console.log(`No ${BASELINE_FILE} yet. Review this run, then copy ${SUMMARY_FILE} to ${BASELINE_FILE} to set the baseline.`);
      return;
    }

    const baseline: Summary = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));
    const regressions: string[] = [];
    for (const [metric, current] of Object.entries(summary)) {
      const before = baseline[metric];
      if (before && current.average < before.average - ALLOWED_DROP) {
        regressions.push(`${metric}: ${before.average} -> ${current.average}`);
      }
    }

    if (regressions.length > 0) {
      console.log(`\nAI REGRESSION versus baseline (allowed drop ${ALLOWED_DROP}):\n  ${regressions.join('\n  ')}`);
      return { status: 'failed' };
    }
    console.log('\nNo AI regression versus baseline.');
    return result.status === 'passed' ? undefined : { status: result.status };
  }
}
