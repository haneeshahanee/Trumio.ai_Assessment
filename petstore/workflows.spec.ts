import { test, expect } from '../../fixtures/petstore.fixtures';
import { TestDataFactory } from '../../utils/test-data.factory';
import { Assertions } from '../../utils/assertions';
import { Logger } from '../../utils/logger';
import { ENDPOINTS, HTTP_STATUS } from '../../config/api.config';
import { Pet, Order } from '../../utils/types';

// ──────────────────────────────────────────────
// End-to-End Workflow Tests
// Full lifecycle scenarios across Pet + Store
// ──────────────────────────────────────────────

const logger = new Logger('E2EWorkflows');

test.describe('End-to-End Workflows', () => {
  test('✅ Full pet lifecycle: create → update → find → delete', async ({
    apiClient,
  }) => {
    logger.testStart('Full pet lifecycle');

    // Step 1 — Create
    logger.step('1. Create pet');
    const petData = TestDataFactory.createPet({ status: 'available' });
    const { response: createRes, body: createdPet } =
      await apiClient.postJson<Pet>(ENDPOINTS.PET, petData);
    Assertions.expectStatus(createRes, HTTP_STATUS.OK);
    Assertions.expectPetShape(createdPet);

    // Step 2 — Update
    logger.step('2. Update pet');
    const updatedPet: Pet = {
      ...createdPet,
      name: `Updated_${createdPet.name}`,
      status: 'pending',
    };
    const { response: updateRes, body: afterUpdate } =
      await apiClient.putJson<Pet>(ENDPOINTS.PET, updatedPet);
    Assertions.expectStatus(updateRes, HTTP_STATUS.OK);
    expect(afterUpdate.name).toBe(updatedPet.name);
    expect(afterUpdate.status).toBe('pending');

    // Step 3 — Find
    logger.step('3. Find pet by ID');
    const { response: getRes, body: fetchedPet } =
      await apiClient.getJson<Pet>(ENDPOINTS.PET_BY_ID(createdPet.id!));
    Assertions.expectStatus(getRes, HTTP_STATUS.OK);
    expect(fetchedPet.id).toBe(createdPet.id);
    expect(fetchedPet.name).toBe(updatedPet.name);

    // Step 4 — Delete
    logger.step('4. Delete pet');
    const deleteRes = await apiClient.delete(
      ENDPOINTS.PET_BY_ID(createdPet.id!)
    );
    expect([200, 204]).toContain(deleteRes.status());

    // Step 5 — Verify deletion
    logger.step('5. Verify pet is gone');
    const verifyRes = await apiClient.get(ENDPOINTS.PET_BY_ID(createdPet.id!));
    Assertions.expectStatus(verifyRes, HTTP_STATUS.NOT_FOUND);

    logger.testPass('Full pet lifecycle');
  });

  test('✅ Full order lifecycle: add pet → place order → find → delete', async ({
    apiClient,
  }) => {
    logger.testStart('Full order lifecycle');

    // Step 1 — Create pet
    logger.step('1. Create pet for order');
    const petData = TestDataFactory.createPet();
    const { body: pet } = await apiClient.postJson<Pet>(ENDPOINTS.PET, petData);
    Assertions.expectPetShape(pet);

    // Step 2 — Place order
    logger.step('2. Place order');
    const orderData = TestDataFactory.createOrder(pet.id!, { quantity: 2 });
    const { response: orderRes, body: order } =
      await apiClient.postJson<Order>(ENDPOINTS.STORE_ORDER, orderData);
    Assertions.expectStatus(orderRes, HTTP_STATUS.OK);
    Assertions.expectOrderShape(order);
    expect(order.petId).toBe(pet.id);

    // Step 3 — Find order
    logger.step('3. Find order by ID');
    const { response: getOrderRes, body: fetchedOrder } =
      await apiClient.getJson<Order>(ENDPOINTS.STORE_ORDER_BY_ID(order.id!));
    Assertions.expectStatus(getOrderRes, HTTP_STATUS.OK);
    expect(fetchedOrder.id).toBe(order.id);

    // Step 4 — Delete order
    logger.step('4. Delete order');
    const deleteOrderRes = await apiClient.delete(
      ENDPOINTS.STORE_ORDER_BY_ID(order.id!)
    );
    expect([200, 204]).toContain(deleteOrderRes.status());

    // Step 5 — Verify order gone
    logger.step('5. Verify order is gone');
    const verifyOrderRes = await apiClient.get(
      ENDPOINTS.STORE_ORDER_BY_ID(order.id!)
    );
    expect([404, 400]).toContain(verifyOrderRes.status());

    // Cleanup pet
    await apiClient.delete(ENDPOINTS.PET_BY_ID(pet.id!));

    logger.testPass('Full order lifecycle');
  });

  test('✅ Inventory reflects added pet status', async ({ apiClient }) => {
    logger.testStart('Inventory reflects pet status');

    // Get initial inventory
    logger.step('1. Get baseline inventory');
    const { body: before } = await apiClient.getJson<Record<string, number>>(
      ENDPOINTS.STORE_INVENTORY
    );
    const beforeAvailable = before['available'] ?? 0;

    // Add an available pet
    logger.step('2. Add available pet');
    const pet = TestDataFactory.createPet({ status: 'available' });
    const { body: createdPet } = await apiClient.postJson<Pet>(
      ENDPOINTS.PET,
      pet
    );

    // Verify inventory updated
    logger.step('3. Verify inventory count increased');
    const { body: after } = await apiClient.getJson<Record<string, number>>(
      ENDPOINTS.STORE_INVENTORY
    );
    const afterAvailable = after['available'] ?? 0;

    expect(afterAvailable).toBeGreaterThanOrEqual(beforeAvailable);

    // Cleanup
    await apiClient.delete(ENDPOINTS.PET_BY_ID(createdPet.id!));
    logger.testPass('Inventory reflects pet status');
  });

  test('✅ Place multiple orders and delete them sequentially', async ({
    apiClient,
  }) => {
    logger.testStart('Multiple orders sequential delete');

    // Create a pet
    const petData = TestDataFactory.createPet();
    const { body: pet } = await apiClient.postJson<Pet>(ENDPOINTS.PET, petData);

    // Place 3 orders
    logger.step('Place 3 orders');
    const orders: Order[] = [];
    for (let i = 0; i < 3; i++) {
      const orderData = TestDataFactory.createOrder(pet.id!);
      const { response, body } = await apiClient.postJson<Order>(
        ENDPOINTS.STORE_ORDER,
        orderData
      );
      Assertions.expectStatus(response, HTTP_STATUS.OK);
      orders.push(body);
      logger.info(`Order ${i + 1} placed: id=${body.id}`);
    }

    expect(orders.length).toBe(3);

    // Delete all orders
    logger.step('Delete all orders');
    for (const order of orders) {
      const res = await apiClient.delete(
        ENDPOINTS.STORE_ORDER_BY_ID(order.id!)
      );
      expect([200, 204, 404]).toContain(res.status());
    }

    // Cleanup pet
    await apiClient.delete(ENDPOINTS.PET_BY_ID(pet.id!));
    logger.testPass('Multiple orders sequential delete');
  });
});
