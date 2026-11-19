import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getEnvironment } from '../../core/config/environment';
import { SYSTEM_PROMPT, loadAllPolicies } from './hrAssistant';

/** The chat model, pointed at Ollama or OpenAI from your .env */
export function createChatModel(temperature = 0): ChatOpenAI {
  const env = getEnvironment();
  return new ChatOpenAI({
    model: env.llmModel,
    temperature,
    apiKey: env.llmApiKey,
    configuration: { baseURL: env.llmBaseUrl },
  });
}

/** Day 8 version: prompt template + chain + memory */
export class LangChainHrAssistant {
  private readonly history: BaseMessage[] = [];
  private readonly policies = loadAllPolicies();

  // 1. Prompt template with placeholders
  private readonly prompt = ChatPromptTemplate.fromMessages([
    ['system', `${SYSTEM_PROMPT}\n\nHR policy text:\n{policies}`],
    new MessagesPlaceholder('history'),
    ['human', '{question}'],
  ]);

  // 2. Chain: prompt -> model -> plain text
  private readonly chain = this.prompt.pipe(createChatModel()).pipe(new StringOutputParser());

  async ask(question: string): Promise<string> {
    const answer = await this.chain.invoke({
      policies: this.policies,
      history: this.history,
      question,
    });
    // 3. Memory: keep this exchange for the next question
    this.history.push(new HumanMessage(question), new AIMessage(answer));
    return answer;
  }
}

/** A tool the model can call: counts Monday-Friday days between two dates (inclusive) */
export const workingDaysTool = tool(
  async ({ startDate, endDate }) => {
    let count = 0;
    const day = new Date(startDate);
    const end = new Date(endDate);
    while (day <= end) {
      const weekday = day.getUTCDay();
      if (weekday !== 0 && weekday !== 6) count++;
      day.setUTCDate(day.getUTCDate() + 1);
    }
    return String(count);
  },
  {
    name: 'calculate_working_days',
    description: 'Counts working days (Monday to Friday) between two dates, inclusive. Dates are YYYY-MM-DD.',
    schema: z.object({
      startDate: z.string().describe('Start date, YYYY-MM-DD'),
      endDate: z.string().describe('End date, YYYY-MM-DD'),
    }),
  },
);
