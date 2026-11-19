# Playwright TS Unified Scaffold (UI + API + AI)

A unified Playwright + TypeScript test scaffold (UI, API and AI/LLM testing), demonstrated on the OrangeHRM demo site, covering mentorship Days 1-13:

## Setup (first time)

```powershell
npm install
npx playwright install chromium firefox webkit
```

`.env.qa` is included with the public demo-site values. For AI tests, install Ollama from ollama.com, then:

```powershell
ollama pull llama3.2
ollama pull nomic-embed-text
```

## Run

| Command | What it runs |
|---|---|
| `npm run test:api` | API tests (no LLM needed) |
| `npm run test:ui` | UI tests in Chromium |
| `npm run test:ui:all-browsers` | UI tests in Chromium, Firefox, WebKit |
| `npm run test:ai` | AI / LLM / RAG tests (needs Ollama or an API key) |
| `npm run test:golden` | Golden dataset + sample-response evaluation only |
| `npm run test:smoke` | Tests tagged `@smoke` |
| `npm run test:trace` | UI tests with a full trace for every test |
| `npm run test:flaky` | Each UI test 3 times with no retries, to find flaky tests |
| `npm run test:strict` | Fails the run if any test is flaky (passes only on retry) |
| `npm run test:changed` | Only test files changed since the last commit |
| `npm run test:last-failed` | Only the tests that failed last time |
| `npm run report` | Opens the HTML report |
| `npm run eval:prompts` | promptfoo prompt comparison (install once: `npm i -D promptfoo`) |

## Folder structure

```
src/
  core/config/environment.ts   environment variables (.env.qa), incl. LLM settings
  pages/                       page objects (BasePage, LoginPage, DashboardPage, PIMPage)
  fixtures/                    page.fixture, api.fixture, ai.fixture, index (mergeTests)
  api/                         API clients and zod schemas
  ai/                          LLM client, HR assistant, LangChain, RAG, judge, generators, self-healing
  reporters/                   AI failure reporter, AI evaluation/regression reporter
  testdata/                    login scenarios, employee factory, golden dataset, sample responses
tests/
  auth.setup.ts                logs in once, saves the session (storage state)
  loginpage.spec.ts, dashboardPage.spec.ts, pimPage.spec.ts    UI tests
  api/                         API tests
  ai/                          AI tests
.github/workflows/playwright.yml   CI: API -> UI (quality gate), AI nightly
promptfooconfig.yaml               prompt comparison
```

---

# What was added for Days 5-11

## Day 5 - CI/CD and debugging

| Topic | Where | How to use it |
|---|---|---|
| Trace Viewer | `trace: 'on-first-retry'` in `playwright.config.ts`; `npm run test:trace` | Open the HTML report, click a test, click the trace. Or `npx playwright show-trace <trace.zip>` |
| Screenshots / videos | `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'` | Attached to failed tests in the HTML report |
| Reporting | HTML + list reporters; JUnit XML in CI | `npm run report`; `test-results/junit.xml` in CI |
| Flaky test identification | `retries: 1` in CI marks pass-on-retry tests as **flaky**; `npm run test:flaky`; `npm run test:strict` | Investigate any test the report marks "flaky" |
| CI execution | `.github/workflows/playwright.yml` | Runs on push, pull request, nightly, and manually |
| Quality gates | `needs: api` (UI waits for API); `--fail-on-flaky-tests`; AI baseline check | A failing gate blocks the pull request (with branch protection) |

GitHub secrets needed: `BASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` (and for the AI job: `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `EMBEDDING_MODEL`).

## Day 6 - AI fundamentals

| File | Purpose |
|---|---|
| `src/ai/llm/llmClient.ts` | One client for any OpenAI-compatible LLM (Ollama, OpenAI, Azure): chat, tokens, latency, embeddings, cosine similarity |
| `src/fixtures/ai.fixture.ts` | `llm` fixture (worker-scoped) |
| `tests/ai/llm-basics.spec.ts` | Tokens and max-token limit, temperature, consistency, hallucination probe, prompt injection |

## Day 7 - LLM application architecture

| File | Purpose |
|---|---|
| `src/ai/data/policies/*.md` | HR policy documents (the assistant's knowledge; fictional company, known answers) |
| `src/ai/app/hrAssistant.ts` | HR Policy Assistant: system prompt with rules, fixed "I don't know" sentence |
| `tests/ai/hr-assistant.spec.ts` | Factual answer, "I don't know", out-of-scope refusal |

## Day 8 - LLM frameworks (LangChain)

| File | Purpose |
|---|---|
| `src/ai/app/langchainAssistant.ts` | Prompt template, LCEL chain, memory, `calculate_working_days` tool |
| `tests/ai/langchain.spec.ts` | Chain answer, multi-turn memory, tool logic, tool choice and arguments |

## Day 9 - RAG testing

| File | Purpose |
|---|---|
| `src/ai/rag/ingest.ts` | Document ingestion and chunking (size 300, overlap 50) |
| `src/ai/rag/vectorStore.ts` | In-memory vector database: embeddings + cosine similarity search |
| `src/ai/rag/ragAssistant.ts` | Retrieves top 3 chunks, answers only from them, returns sources |
| `tests/ai/rag.spec.ts` | Ingestion completeness, chunk size, retrieval hit rate, context relevance, grounding, "I don't know" |

## Day 10 - LLM evaluation

| File | Purpose |
|---|---|
| `src/ai/eval/judge.ts` | LLM-as-judge: correctness, relevance, groundedness, safety |
| `src/ai/eval/thresholds.ts` | Minimum score per metric |
| `tests/ai/evaluation.spec.ts` | Judge sanity check, correctness, relevance, groundedness, hallucination, toxicity, bias, consistency, robustness |

## Day 11 - AI testing frameworks and regression

| File | Purpose |
|---|---|
| `src/testdata/ai/golden-dataset.json` | 9 reviewed questions across factual, unanswerable, out-of-scope, adversarial |
| `tests/ai/golden-regression.spec.ts` | One scored test per golden case, evidence attached to the report |
| `src/testdata/ai/sample-responses.json` + `tests/ai/sample-responses-eval.spec.ts` | Evaluates pre-recorded good and bad responses: good must pass, bad must be caught |
| `src/reporters/eval-summary-reporter.ts` | Averages scores into `eval-summary.json`; fails the run if a metric drops > 0.05 below `eval-baseline.json` |
| `promptfooconfig.yaml` + `src/ai/prompts/hr-v1.txt`, `hr-v2.txt` | Prompt A/B comparison with promptfoo |

Setting the AI baseline: run `npm run test:ai`, review the results, then `copy eval-summary.json eval-baseline.json` and commit it.

## Also included (Days 4, 12, 13)

- Day 4: API layer (`src/api/`, `tests/api/`), separate projects, tags, environment config, custom reporters
- Day 12: `src/ai/generators/testDataGenerator.ts`, `tests/ai/ai-generated-data.spec.ts`, `tests/ai/ai-test-cases.spec.ts`
- Day 13: `src/reporters/ai-failure-reporter.ts` (`$env:AI_REPORT="true"; npm run test:ui`), `src/ai/healing/selfHealing.ts`, `tests/ai/self-healing.spec.ts`

## Notes

- `tests/pimPage.spec.ts`: change `existingName` to an employee visible in PIM, and check the dropdown option names on the live site.
- OrangeHRM API paths (`/pim/employees`) are from the demo site; confirm them in the browser Network tab (F12) if an API test fails.
- AI tests using `expect.soft` record findings about the model; a soft failure there is a result, not a broken test.
