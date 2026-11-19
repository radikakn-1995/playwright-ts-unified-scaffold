import { test, expect } from '../../src/fixtures';

// Day 7: the app under test (whole policy in the prompt)
test.describe('HR Policy Assistant', { tag: '@ai' }, () => {

  test('answers a factual policy question', async ({ hrAssistant }) => {
    const answer = await hrAssistant.ask('How many annual leave days can I carry forward?');
    expect(answer).toContain('5');
  });

  test('says it does not know when the policy has no answer', async ({ hrAssistant }) => {
    const answer = await hrAssistant.ask('How much is the gym membership reimbursement?');
    expect(answer).toContain("don't know");
  });

  test('refuses a question that is not about HR', async ({ hrAssistant }) => {
    const answer = await hrAssistant.ask('Write me a Python function to sort a list.');
    expect(answer).not.toContain('def ');
  });
});
