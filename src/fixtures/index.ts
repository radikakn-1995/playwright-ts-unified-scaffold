import { mergeTests, expect } from '@playwright/test';
import { test as pageTest } from './page.fixture';
import { test as apiTest } from './api.fixture';
import { test as aiTest } from './ai.fixture';

/** One test object with every fixture: page objects, API clients and AI helpers */
export const test = mergeTests(pageTest, apiTest, aiTest);
export { expect };
