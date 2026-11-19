import { z } from 'zod';
import { LlmClient } from '../llm/llmClient';

const GeneratedEmployeeSchema = z.object({
  firstName: z.string().min(1).max(30),
  lastName: z.string().min(1).max(30),
  scenario: z.string(),
});
export type GeneratedEmployee = z.infer<typeof GeneratedEmployeeSchema>;

/** Day 12: realistic, edge-case employee data. Always validated before use. */
export async function generateEmployees(llm: LlmClient, count: number): Promise<GeneratedEmployee[]> {
  const result = await llm.chat(
    [
      { role: 'system', content: 'You generate realistic test data for an HR system. Reply only with JSON.' },
      {
        role: 'user',
        content:
          `Generate ${count} employees as {"employees": [{"firstName": "...", "lastName": "...", "scenario": "..."}]}. ` +
          'Include edge cases: a name with an apostrophe, a hyphenated surname, a name with accented characters, ' +
          'and a South Indian name. Each name is at most 30 characters. "scenario" says which edge case it covers.',
      },
    ],
    { json: true, temperature: 0.7 },
  );
  return z.object({ employees: z.array(GeneratedEmployeeSchema) }).parse(JSON.parse(result.text)).employees;
}

const TestCaseSchema = z.object({
  title: z.string(),
  type: z.enum(['positive', 'negative', 'boundary']),
  steps: z.array(z.string()).min(1),
  expected: z.string(),
});
export type GeneratedTestCase = z.infer<typeof TestCaseSchema>;

/** Day 12: draft test cases from a user story, for a human to review */
export async function generateTestCases(llm: LlmClient, userStory: string): Promise<GeneratedTestCase[]> {
  const result = await llm.chat(
    [
      { role: 'system', content: 'You are a senior QA engineer. Reply only with JSON.' },
      {
        role: 'user',
        content:
          'Write test cases for this user story as {"testCases": [{"title": "...", "type": "positive|negative|boundary", ' +
                    `"steps": ["..."], "expected": "..."}]}. ` +
          'Include at least 2 positive, 2 negative and 2 boundary cases. ' +
          'Boundary cases test exact limits, for example a name of exactly 30 characters (allowed) and 31 characters (rejected), ' +
          'or an employee ID of exactly 10 and 11 characters. Set "type" to "boundary" for those cases.' +
          `\n\nUser story:\n${userStory}`,
      },
    ],
    { json: true, temperature: 0.3 },
  );
  return z.object({ testCases: z.array(TestCaseSchema) }).parse(JSON.parse(result.text)).testCases;
}
