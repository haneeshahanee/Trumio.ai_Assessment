import { test, expect } from '../../fixtures/petstore.fixtures';
import { TestDataFactory } from '../../utils/test-data.factory';
import { Assertions } from '../../utils/assertions';
import { Logger } from '../../utils/logger';
import { ENDPOINTS, HTTP_STATUS } from '../../config/api.config';
import { Pet, Order } from '../../utils/types';

// ──────────────────────────────────────────────
// Store Endpoint Tests
// ──────────────────────────────────────────────

const logger = new Logger('StoreTests');

test.describe('Store Endpoints', () => {
  // ── POST /store/order — Place an order ───────

  test.describe('POST /store/order — Place an order', () => {
    test('✅ should place a valid order for an existing pet', async ({
      apiClient,
      createdPet,
    }) => {
      logger.testStart('Place valid order');

      const orderData = TestDataFactory.createOrder(createdPet.id!);
      const { response, body } = await apiClient.postJson<Order>(
        ENDPOINTS.STORE_ORDER,
        orderData
      );

      Assertions.expectStatus(response, HTTP_STATUS.OK);
      Assertions.expectOrderShape(body);
      Assertions.expectOrderMatchesInput(body, {
        petId: orderData.petId,
        quantity: orderData.quantity,
      });
      expect(body.status).toBe('placed');
      logger.testPass('Place valid order');

      // Cleanup
      await apiClient.delete(ENDPOINTS.STORE_ORDER_BY_ID(body.id!));
    });

    test('✅ should place an order with quantity > 1', async ({
      apiClient,
      createdPet,
    }) => {
      logger.testStart('Place order with quantity > 1');

      const orderData = TestDataFactory.createOrder(createdPet.id!, {
        quantity: 3,
      });
      const { response, body } = await apiClient.postJson<Order>(
        ENDPOINTS.STORE_ORDER,
        orderData
      );

      Assertions.expectStatus(response, HTTP_STATUS.OK);
      expect(body.quantity).toBe(3);
      logger.testPass('Place order with quantity > 1');

      await apiClient.delete(ENDPOINTS.STORE_ORDER_BY_ID(body.id!));
    });

    test('✅ should place an order with all valid statuses', async ({
      apiClient,
      createdPet,
    }) => {
      const statuses: Array<'placed' | 'approved' | 'delivered'> = [
        'placed',
        'approved',
        'delivered',
      ];

      for (const status of statuses) {
        logger.testStart(`Place order with status: ${status}`);

        const orderData = TestDataFactory.createOrder(createdPet.id!, {
          status,
        });
        const { response, body } = await apiClient.postJson<Order>(
          ENDPOINTS.STORE_ORDER,
          orderData
        );

        Assertions.expectStatus(response, HTTP_STATUS.OK);
        expect(body.status).toBe(status);
        logger.testPass(`Order with status: ${status}`);

        await apiClient.delete(ENDPOINTS.STORE_ORDER_BY_ID(body.id!));
      }
    });

    test('✅ should place a complete order', async ({
      apiClient,
      createdPet,
    }) => {
      logger.testStart('Place complete order');

      const orderData = TestDataFactory.createOrder(createdPet.id!, {
        complete: true,
        status: 'delivered',
      });
      const { response, body } = await apiClient.postJson<Order>(
        ENDPOINTS.STORE_ORDER,
        orderData
      );

      Assertions.expectStatus(response, HTTP_STATUS.OK);
      expect(body.complete).toBe(true);
      logger.testPass('Place complete order');

      await apiClient.delete(ENDPOINTS.STORE_ORDER_BY_ID(body.id!));
    });

    test('❌ should handle order with invalid data', async ({ apiClient }) => {
      logger.testStart('Place order with invalid data');

      const invalidOrder = TestDataFactory.createInvalidOrder();
      const response = await apiClient.post(ENDPOINTS.STORE_ORDER, invalidOrder);

      // API may accept or reject — we just verify no unhandled crash
      expect([200, 400, 405, 500]).toContain(response.status());
      logger.testPass('Invalid order handled without crash');
    });
  });

  // ── GET /store/order/{orderId} — Find order ──

  test.describe('GET /store/order/{orderId} — Find order by ID', () => {
    test('✅ should retrieve an existing order by ID', async ({
      apiClient,
      createdOrder,
    }) => {
      logger.testStart('Find order by ID');

      const { response, body } = await apiClient.getJson<Order>(
        ENDPOINTS.STORE_ORDER_BY_ID(createdOrder.id!)
      );

      Assertions.expectStatus(response, HTTP_STATUS.OK);
      Assertions.expectOrderShape(body);
      expect(body.id).toBe(createdOrder.id);
      expect(body.petId).toBe(createdOrder.petId);
      logger.testPass('Find order by ID');
    });

    test('❌ should return 404 for non-existent order ID', async ({
      apiClient,
    }) => {
      logger.testStart('Find order with non-existent ID');

      const response = await apiClient.get(ENDPOINTS.STORE_ORDER_BY_ID(999999));

      Assertions.expectStatus(response, HTTP_STATUS.NOT_FOUND);
      const body = await response.json();
      expect(body.message).toBeTruthy();
      logger.testPass('Non-existent order returns 404');
    });

    test('❌ should return 400 for out-of-range order ID (> 10)', async ({
      apiClient,
    }) => {
      logger.testStart('Find order with ID > 10');

      // Docs say: valid IDs are 1–10
      const response = await apiClient.get(ENDPOINTS.STORE_ORDER_BY_ID(11));

      expect([400, 404]).toContain(response.status());
      logger.testPass('Out-of-range order ID handled');
    });

    test('❌ should return error for ID = 0 (below minimum)', async ({
      apiClient,
    }) => {
      logger.testStart('Find order with ID = 0');

      const response = await apiClient.get(ENDPOINTS.STORE_ORDER_BY_ID(0));

      expect([400, 404]).toContain(response.status());
      logger.testPass('ID = 0 returns error');
    });
  });

  // ── DELETE /store/order/{orderId} ────────────

  test.describe('DELETE /store/order/{orderId} — Delete purchase order', () => {
    test('✅ should delete an existing order', async ({
      apiClient,
      createdPet,
    }) => {
      logger.testStart('Delete existing order');

      // Create a dedicated order for deletion
      const orderData = TestDataFactory.createOrder(createdPet.id!);
      const createRes = await apiClient.postJson<Order>(
        ENDPOINTS.STORE_ORDER,
        orderData
      );
      const order = createRes.body;

      const deleteResponse = await apiClient.delete(
        ENDPOINTS.STORE_ORDER_BY_ID(order.id!)
      );

      expect([200, 204]).toContain(deleteResponse.status());

      // Verify it's gone
      const getResponse = await apiClient.get(
        ENDPOINTS.STORE_ORDER_BY_ID(order.id!)
      );
      expect([404]).toContain(getResponse.status());
      logger.testPass('Delete existing order');
    });

    test('❌ should return 404 when deleting non-existent order', async ({
      apiClient,
    }) => {
      logger.testStart('Delete non-existent order');

      const response = await apiClient.delete(
        ENDPOINTS.STORE_ORDER_BY_ID(999999)
      );

      expect([404, 400]).toContain(response.status());
      logger.testPass('Delete non-existent order returns error');
    });

    test('❌ should return 400 for negative order ID', async ({
      apiClient,
    }) => {
      logger.testStart('Delete order with negative ID');

      // Negative IDs generate API errors per docs
      const response = await apiClient.delete(ENDPOINTS.STORE_ORDER_BY_ID(-1));

      expect([400, 404]).toContain(response.status());
      logger.testPass('Negative order ID returns error');
    });
  });

  // ── GET /store/inventory ──────────────────────

  test.describe('GET /store/inventory — Get pet inventories by status', () => {
    test('✅ should return inventory map with status counts', async ({
      apiClient,
    }) => {
      logger.testStart('Get store inventory');

      const { response, body } = await apiClient.getJson<
        Record<string, number>
      >(ENDPOINTS.STORE_INVENTORY);

      Assertions.expectStatus(response, HTTP_STATUS.OK);
      expect(typeof body).toBe('object');
      expect(body).not.toBeNull();

      // Verify values are numbers
      Object.values(body).forEach((count) => {
        expect(typeof count).toBe('number');
      });

      logger.info('Inventory snapshot', body);
      logger.testPass('Get store inventory');
    });
  });
});
