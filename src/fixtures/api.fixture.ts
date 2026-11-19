import { test as base, APIRequestContext } from '@playwright/test';
import { getEnvironment } from '../core/config/environment';
import { EmployeeApiClient } from '../api/clients/EmployeeApiClient';

type ApiFixtures = {
  apiContext: APIRequestContext;
  employeeApi: EmployeeApiClient;
};

export const test = base.extend<ApiFixtures>({
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: getEnvironment().baseUrl,
      storageState: 'playwright/.auth/admin.json', // the session saved by tests/auth.setup.ts
    });
    await use(context);
    await context.dispose();
  },

  employeeApi: async ({ apiContext }, use) => {
    await use(new EmployeeApiClient(apiContext));
  },
});
