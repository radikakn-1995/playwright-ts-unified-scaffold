import { APIResponse } from '@playwright/test';
import { BaseApiClient } from './BaseApiClient';

export type EmployeePayload = {
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId?: string;
};

/** OrangeHRM PIM employee endpoints. Confirm them in the browser Network tab (F12). */
export class EmployeeApiClient extends BaseApiClient {
  listEmployees(limit = 50, offset = 0): Promise<APIResponse> {
    return this.get('/pim/employees', { limit, offset });
  }

  createEmployee(employee: EmployeePayload): Promise<APIResponse> {
    return this.post('/pim/employees', { middleName: '', empPicture: null, ...employee });
  }

  deleteEmployees(empNumbers: number[]): Promise<APIResponse> {
    return this.delete('/pim/employees', { ids: empNumbers });
  }
}
