import { APIRequestContext, APIResponse } from '@playwright/test';
import { API_CONFIG } from '../config/api.config';
import { Logger } from './logger';

// ──────────────────────────────────────────────
// API Client — wraps Playwright's request context
// with logging and error handling
// ──────────────────────────────────────────────

export class ApiClient {
  private readonly baseUrl: string;
  private readonly logger: Logger;

  constructor(
    private readonly request: APIRequestContext,
    logContext = 'ApiClient'
  ) {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.logger = new Logger(logContext);
  }

  // ── Private helpers ──────────────────────────

  private url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private defaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      api_key: API_CONFIG.API_KEY,
    };
  }

  private async logResponse(
    method: string,
    path: string,
    response: APIResponse
  ): Promise<void> {
    const status = response.status();
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    this.logger.info(`${method} ${path} → ${status}`, { body });
  }

  // ── Public HTTP methods ──────────────────────

  async get(
    path: string,
    params?: Record<string, string | string[]>
  ): Promise<APIResponse> {
    this.logger.info(`GET ${path}`, { params });
    const response = await this.request.get(this.url(path), {
      headers: this.defaultHeaders(),
      params,
    });
    await this.logResponse('GET', path, response);
    return response;
  }

  async post(path: string, data: unknown): Promise<APIResponse> {
    this.logger.info(`POST ${path}`, { data });
    const response = await this.request.post(this.url(path), {
      headers: this.defaultHeaders(),
      data,
    });
    await this.logResponse('POST', path, response);
    return response;
  }

  async put(path: string, data: unknown): Promise<APIResponse> {
    this.logger.info(`PUT ${path}`, { data });
    const response = await this.request.put(this.url(path), {
      headers: this.defaultHeaders(),
      data,
    });
    await this.logResponse('PUT', path, response);
    return response;
  }

  async delete(path: string): Promise<APIResponse> {
    this.logger.info(`DELETE ${path}`);
    const response = await this.request.delete(this.url(path), {
      headers: this.defaultHeaders(),
    });
    await this.logResponse('DELETE', path, response);
    return response;
  }

  // ── JSON helpers ─────────────────────────────

  async getJson<T>(
    path: string,
    params?: Record<string, string | string[]>
  ): Promise<{ response: APIResponse; body: T }> {
    const response = await this.get(path, params);
    const body = (await response.json()) as T;
    return { response, body };
  }

  async postJson<T>(
    path: string,
    data: unknown
  ): Promise<{ response: APIResponse; body: T }> {
    const response = await this.post(path, data);
    const body = (await response.json()) as T;
    return { response, body };
  }

  async putJson<T>(
    path: string,
    data: unknown
  ): Promise<{ response: APIResponse; body: T }> {
    const response = await this.put(path, data);
    const body = (await response.json()) as T;
    return { response, body };
  }
}
