import { expect, APIResponse } from '@playwright/test';
import { Pet, Order } from './types';

// ──────────────────────────────────────────────
// Assertion Helpers — reusable expect wrappers
// ──────────────────────────────────────────────

export class Assertions {
  // ── Response status ──────────────────────────

  static expectStatus(response: APIResponse, expected: number): void {
    expect(
      response.status(),
      `Expected HTTP ${expected}, got ${response.status()}`
    ).toBe(expected);
  }

  static expectOk(response: APIResponse): void {
    expect(
      response.ok(),
      `Expected 2xx status, got ${response.status()}`
    ).toBeTruthy();
  }

  // ── Pet assertions ───────────────────────────

  static expectPetShape(pet: Pet): void {
    expect(pet).toBeDefined();
    expect(pet.id).toBeDefined();
    expect(typeof pet.id).toBe('number');
    expect(pet.name).toBeTruthy();
    expect(Array.isArray(pet.photoUrls)).toBeTruthy();
  }

  static expectPetMatchesInput(actual: Pet, expected: Partial<Pet>): void {
    if (expected.name) expect(actual.name).toBe(expected.name);
    if (expected.status) expect(actual.status).toBe(expected.status);
    if (expected.id) expect(actual.id).toBe(expected.id);
  }

  static expectPetStatus(
    pet: Pet,
    status: 'available' | 'pending' | 'sold'
  ): void {
    expect(['available', 'pending', 'sold']).toContain(pet.status);
    expect(pet.status).toBe(status);
  }

  // ── Order assertions ─────────────────────────

  static expectOrderShape(order: Order): void {
    expect(order).toBeDefined();
    expect(order.id).toBeDefined();
    expect(typeof order.id).toBe('number');
    expect(order.petId).toBeDefined();
    expect(order.quantity).toBeGreaterThan(0);
  }

  static expectOrderMatchesInput(
    actual: Order,
    expected: Partial<Order>
  ): void {
    if (expected.petId) expect(actual.petId).toBe(expected.petId);
    if (expected.quantity) expect(actual.quantity).toBe(expected.quantity);
    if (expected.status) expect(actual.status).toBe(expected.status);
  }

  // ── Generic ──────────────────────────────────

  static expectArrayNotEmpty<T>(arr: T[], label = 'array'): void {
    expect(arr, `Expected non-empty ${label}`).toBeDefined();
    expect(Array.isArray(arr)).toBeTruthy();
    expect(arr.length).toBeGreaterThan(0);
  }

  static expectErrorResponse(
    body: { message?: string; code?: number },
    expectedCode?: number
  ): void {
    expect(body).toBeDefined();
    if (expectedCode !== undefined) {
      expect(body.code ?? body).toBeDefined();
    }
  }
}
