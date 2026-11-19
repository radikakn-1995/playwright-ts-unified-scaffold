import { test, expect } from '../../src/fixtures';
import { generateTestCases } from '../../src/ai/generators/testDataGenerator';

const addEmployeeStory = `As an HR admin, I want to add a new employee in PIM with first name, middle name (optional),
last name and employee ID, so that the employee exists in the system.
First and last name are mandatory, maximum 30 characters each.
Employee ID must be unique, maximum 10 characters.`;

// Day 12: AI drafts test cases; a human reviews them
test('AI drafts test cases for the Add Employee story', { tag: '@ai' }, async ({ llm }) => {
  const cases = await generateTestCases(llm, addEmployeeStory);

  expect(cases.length).toBeGreaterThanOrEqual(5);
  expect(cases.some((c) => c.type === 'negative')).toBeTruthy();
  expect(cases.some((c) => c.type === 'boundary')).toBeTruthy();

  // Saved for a human to review, never run automatically
  await test.info().attach('generated-test-cases', {
    body: JSON.stringify(cases, null, 2),
    contentType: 'application/json',
  });
});
