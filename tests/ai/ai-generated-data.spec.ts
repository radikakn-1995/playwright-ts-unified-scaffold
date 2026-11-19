import { test, expect } from '../../src/fixtures';
import { generateEmployees } from '../../src/ai/generators/testDataGenerator';
import { EmployeeCreateSchema } from '../../src/api/schemas/employee.schema';

test.use({ storageState: 'playwright/.auth/admin.json' });

// Day 12: AI creates the data, the API creates the employees, the UI verifies them
test('AI-generated edge-case employees are created by API and shown correctly in PIM',
  { tag: ['@ai', '@e2e'] },
  async ({ llm, employeeApi, pimPage, page }) => {
    const people = await generateEmployees(llm, 4);
    const createdIds: number[] = [];

    try {
      for (const person of people) {
        const employeeId = Date.now().toString().slice(-8);

        // 1. Create through the API (fast)
        const response = await employeeApi.createEmployee({
          firstName: person.firstName,
          lastName: person.lastName,
          employeeId,
        });
        expect(response.ok(), `${person.scenario}: ${await response.text()}`).toBeTruthy();
        const { data } = EmployeeCreateSchema.parse(await response.json());
        createdIds.push(data.empNumber);

        // 2. Verify in the UI (what the user sees)
        await page.goto('/web/index.php/pim/viewEmployeeList');
        await pimPage.enterEmployeeId(employeeId);
        await pimPage.clickSearchbutton();
        await expect(page.locator('.oxd-table-card').first(), person.scenario).toContainText(person.firstName);
      }
    } finally {
      // 3. Clean up through the API, even if a check failed
      if (createdIds.length > 0) await employeeApi.deleteEmployees(createdIds);
    }
  });
