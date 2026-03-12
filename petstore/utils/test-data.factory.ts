import { Pet, Order, User, PetStatus } from './types';

// ──────────────────────────────────────────────
// Test Data Factory — generates unique test data
// ──────────────────────────────────────────────

const timestamp = () => Date.now();

export class TestDataFactory {
  /**
   * Generate a unique Pet object.
   */
  static createPet(overrides: Partial<Pet> = {}): Pet {
    const id = timestamp();
    return {
      id,
      name: `TestPet_${id}`,
      photoUrls: ['https://example.com/photo1.jpg'],
      category: { id: 1, name: 'Dogs' },
      tags: [{ id: 1, name: 'friendly' }],
      status: 'available',
      ...overrides,
    };
  }

  /**
   * Generate a minimal Pet (only required fields).
   */
  static createMinimalPet(overrides: Partial<Pet> = {}): Pet {
    return {
      name: `MinPet_${timestamp()}`,
      photoUrls: ['https://example.com/photo.jpg'],
      ...overrides,
    };
  }

  /**
   * Generate a Pet with a specific status.
   */
  static createPetWithStatus(status: PetStatus): Pet {
    return TestDataFactory.createPet({ status });
  }

  /**
   * Generate multiple pets.
   */
  static createMultiplePets(count: number): Pet[] {
    return Array.from({ length: count }, (_, i) =>
      TestDataFactory.createPet({ name: `BulkPet_${i}_${timestamp()}` })
    );
  }

  /**
   * Generate a valid Order object.
   */
  static createOrder(petId: number, overrides: Partial<Order> = {}): Order {
    const id = Math.floor(Math.random() * 9) + 1; // IDs 1–9 are valid
    return {
      id,
      petId,
      quantity: 1,
      shipDate: new Date().toISOString(),
      status: 'placed',
      complete: false,
      ...overrides,
    };
  }

  /**
   * Generate a valid User object.
   */
  static createUser(overrides: Partial<User> = {}): User {
    const id = timestamp();
    return {
      id,
      username: `testuser_${id}`,
      firstName: 'Test',
      lastName: 'User',
      email: `test_${id}@example.com`,
      password: 'TestPass123!',
      phone: '555-0100',
      userStatus: 1,
      ...overrides,
    };
  }

  /**
   * Invalid pet — missing required fields.
   */
  static createInvalidPet(): Record<string, unknown> {
    return {
      category: { id: 999 },
      status: 'unknown_status',
    };
  }

  /**
   * Invalid order — out-of-range ID.
   */
  static createInvalidOrder(): Partial<Order> {
    return {
      id: 9999,
      petId: -1,
      quantity: -5,
      status: 'placed',
    };
  }
}
