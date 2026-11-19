import { test, expect } from '../../src/fixtures';
import { LangChainHrAssistant, createChatModel, workingDaysTool } from '../../src/ai/app/langchainAssistant';

// Day 8: prompt templates, chains, memory and tool calling
test.describe('LangChain HR assistant', { tag: '@ai' }, () => {

  test('chain answers from the policy', async () => {
    const assistant = new LangChainHrAssistant();
    const answer = await assistant.ask('How many weeks of maternity leave are there?');
    expect(answer).toContain('26');
  });

  test('memory: a follow-up question uses the earlier message', async () => {
    const assistant = new LangChainHrAssistant();
    await assistant.ask('I am planning to take paternity leave.');
    const answer = await assistant.ask('How many days do I get for it?');
    expect(answer).toContain('10');
  });

  test('the tool calculates working days correctly', async () => {
    // Friday 4 Dec to Tuesday 8 Dec 2026 = Fri, Mon, Tue
    const result = await workingDaysTool.invoke({ startDate: '2026-12-04', endDate: '2026-12-08' });
    expect(result).toBe('3');
  });

  test('the model chooses the tool with the right arguments', async () => {
    const model = createChatModel().bindTools([workingDaysTool]);
    const response = await model.invoke('How many working days are there from 2026-12-04 to 2026-12-08?');

    expect(response.tool_calls?.[0]?.name).toBe('calculate_working_days');
    expect(response.tool_calls?.[0]?.args).toMatchObject({ startDate: '2026-12-04', endDate: '2026-12-08' });
  });
});
