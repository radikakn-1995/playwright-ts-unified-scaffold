import { test, expect } from '../../src/fixtures';
import { newEmployee } from '../../src/testdata/employee-data';
import { EmployeeCreateSchema, EmployeeListSchema } from '../../src/api/schemas/employee.schema';
import { getEnvironment } from '../../src/core/config/environment';

test.describe('Employee API', { tag: '@api' }, () => {

  test('GET employees returns a valid list', async ({ employeeApi }) => {
    const response = await employeeApi.listEmployees();

    expect(response.status()).toBe(200);
    const body = EmployeeListSchema.parse(await response.json());
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('create and delete an employee', async ({ employeeApi }) => {
    const employee = newEmployee();

    const created = await employeeApi.createEmployee(employee);
    expect(created.ok(), await created.text()).toBeTruthy();
    const { data } = EmployeeCreateSchema.parse(await created.json());
    expect(data.firstName).toBe(employee.firstName);

    const deleted = await employeeApi.deleteEmployees([data.empNumber]);
    expect(deleted.ok(), await deleted.text()).toBeTruthy();
  });

  test('request without a session is rejected', async ({ playwright }) => {
    const env = getEnvironment();
    const anonymous = await playwright.request.newContext({ baseURL: env.baseUrl });

    const response = await anonymous.get(`${env.apiBaseUrlPath}/pim/employees`);

    expect(response.ok()).toBeFalsy();
    await anonymous.dispose();
  });
});
