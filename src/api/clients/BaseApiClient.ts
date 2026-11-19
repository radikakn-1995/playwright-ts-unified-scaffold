import { APIRequestContext, APIResponse } from '@playwright/test';
import { getEnvironment } from '../../core/config/environment';

/** Shared HTTP methods for every API client, like BasePage for page objects */
export class BaseApiClient {
  protected readonly apiPath: string;

  constructor(protected readonly request: APIRequestContext) {
    // '/web/index.php/api/v2' from environment.ts
    this.apiPath = getEnvironment().apiBaseUrlPath;
  }

  protected get(path: string, params?: Record<string, string | number>): Promise<APIResponse> {
    return this.request.get(`${this.apiPath}${path}`, { params });
  }

  protected post(path: string, data: unknown): Promise<APIResponse> {
    return this.request.post(`${this.apiPath}${path}`, { data });
  }

  protected put(path: string, data: unknown): Promise<APIResponse> {
    return this.request.put(`${this.apiPath}${path}`, { data });
  }

  protected delete(path: string, data?: unknown): Promise<APIResponse> {
    return this.request.delete(`${this.apiPath}${path}`, { data });
  }
}
