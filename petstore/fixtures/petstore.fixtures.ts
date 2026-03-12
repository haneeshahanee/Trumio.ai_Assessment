import { test as base, APIRequestContext } from '@playwright/test';
import { ApiClient } from '../utils/api-client';
import { TestDataFactory } from '../utils/test-data.factory';
import { Pet, Order } from '../utils/types';
import { ENDPOINTS } from '../config/api.config';
import { Logger } from '../utils/logger';

// ──────────────────────────────────────────────
// Custom Fixtures — extend Playwright's base test
// ──────────────────────────────────────────────

interface PetstoreFixtures {
  apiClient: ApiClient;
  createdPet: Pet;
  createdOrder: Order;
}

export const test = base.extend<PetstoreFixtures>({
  // Shared API client
  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request, 'Fixture');
    await use(client);
  },

  // Pre-created pet available in tests that need it
  createdPet: async ({ request }, use) => {
    const logger = new Logger('PetFixture');
    const client = new ApiClient(request, 'PetFixture');
    const petData = TestDataFactory.createPet();

    logger.step('Creating pet fixture');
    const response = await client.post(ENDPOINTS.PET, petData);
    const pet = (await response.json()) as Pet;
    logger.info(`Pet fixture created: id=${pet.id}`);

    await use(pet);

    // Teardown: delete the pet after the test
    try {
      await client.delete(ENDPOINTS.PET_BY_ID(pet.id!));
      logger.info(`Pet fixture cleaned up: id=${pet.id}`);
    } catch (e) {
      logger.warn(`Pet cleanup failed (may already be deleted): ${e}`);
    }
  },

  // Pre-created order available in tests that need it
  createdOrder: async ({ request }, use) => {
    const logger = new Logger('OrderFixture');
    const client = new ApiClient(request, 'OrderFixture');

    // First create a pet to order
    const petData = TestDataFactory.createPet();
    const petResponse = await client.post(ENDPOINTS.PET, petData);
    const pet = (await petResponse.json()) as Pet;

    const orderData = TestDataFactory.createOrder(pet.id!);
    logger.step('Creating order fixture');
    const orderResponse = await client.post(ENDPOINTS.STORE_ORDER, orderData);
    const order = (await orderResponse.json()) as Order;
    logger.info(`Order fixture created: id=${order.id}`);

    await use(order);

    // Teardown
    try {
      await client.delete(ENDPOINTS.STORE_ORDER_BY_ID(order.id!));
      await client.delete(ENDPOINTS.PET_BY_ID(pet.id!));
      logger.info('Order + pet fixture cleaned up');
    } catch (e) {
      logger.warn(`Fixture cleanup failed: ${e}`);
    }
  },
});

export { expect } from '@playwright/test';
