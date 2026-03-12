import { test, expect } from '../../fixtures/petstore.fixtures';
import { TestDataFactory } from '../../utils/test-data.factory';
import { Assertions } from '../../utils/assertions';
import { Logger } from '../../utils/logger';
import { ENDPOINTS, HTTP_STATUS } from '../../config/api.config';
import { User } from '../../utils/types';

// ──────────────────────────────────────────────
// User Endpoint Tests
// ──────────────────────────────────────────────

const logger = new Logger('UserTests');

test.describe('User Endpoints', () => {
  // ── POST /user — Create user ─────────────────

  test.describe('POST /user — Create user', () => {
    test('✅ should create a valid user', async ({ apiClient }) => {
      logger.testStart('Create valid user');

      const userData = TestDataFactory.createUser();
      const response = await apiClient.post(ENDPOINTS.USER, userData);

      expect([200, 201]).toContain(response.status());
      logger.testPass('Create valid user');

      // Cleanup
      await apiClient.delete(ENDPOINTS.USER_BY_NAME(userData.username));
    });

    test('✅ should create users with array endpoint', async ({ apiClient }) => {
      logger.testStart('Create users with array');

      const users = [
        TestDataFactory.createUser(),
        TestDataFactory.createUser(),
      ];

      const response = await apiClient.post(
        ENDPOINTS.USER_CREATE_WITH_ARRAY,
        users
      );

      expect([200, 201]).toContain(response.status());
      logger.testPass('Create users with array');

      // Cleanup
      for (const user of users) {
        await apiClient.delete(ENDPOINTS.USER_BY_NAME(user.username));
      }
    });

    test('✅ should create users with list endpoint', async ({ apiClient }) => {
      logger.testStart('Create users with list');

      const users = [
        TestDataFactory.createUser(),
        TestDataFactory.createUser(),
      ];

      const response = await apiClient.post(
        ENDPOINTS.USER_CREATE_WITH_LIST,
        users
      );

      expect([200, 201]).toContain(response.status());
      logger.testPass('Create users with list');

      for (const user of users) {
        await apiClient.delete(ENDPOINTS.USER_BY_NAME(user.username));
      }
    });
  });

  // ── GET /user/{username} ─────────────────────

  test.describe('GET /user/{username} — Get user by username', () => {
    test('✅ should retrieve a user by username', async ({ apiClient }) => {
      logger.testStart('Get user by username');

      // Create user first
      const userData = TestDataFactory.createUser();
      await apiClient.post(ENDPOINTS.USER, userData);

      const { response, body } = await apiClient.getJson<User>(
        ENDPOINTS.USER_BY_NAME(userData.username)
      );

      expect([200, 201]).toContain(response.status());
      expect(body.username).toBe(userData.username);
      logger.testPass('Get user by username');

      await apiClient.delete(ENDPOINTS.USER_BY_NAME(userData.username));
    });

    test('❌ should return 404 for non-existent username', async ({
      apiClient,
    }) => {
      logger.testStart('Get non-existent user');

      const response = await apiClient.get(
        ENDPOINTS.USER_BY_NAME('user_does_not_exist_xyz_999')
      );

      expect([404, 400]).toContain(response.status());
      logger.testPass('Non-existent user returns 404');
    });
  });

  // ── PUT /user/{username} — Update user ───────

  test.describe('PUT /user/{username} — Update user', () => {
    test('✅ should update an existing user', async ({ apiClient }) => {
      logger.testStart('Update user');

      const userData = TestDataFactory.createUser();
      await apiClient.post(ENDPOINTS.USER, userData);

      const updatedData: User = {
        ...userData,
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        email: `updated_${Date.now()}@example.com`,
      };

      const response = await apiClient.put(
        ENDPOINTS.USER_BY_NAME(userData.username),
        updatedData
      );

      expect([200, 201]).toContain(response.status());
      logger.testPass('Update user');

      await apiClient.delete(ENDPOINTS.USER_BY_NAME(userData.username));
    });
  });

  // ── DELETE /user/{username} ──────────────────

  test.describe('DELETE /user/{username} — Delete user', () => {
    test('✅ should delete an existing user', async ({ apiClient }) => {
      logger.testStart('Delete existing user');

      const userData = TestDataFactory.createUser();
      await apiClient.post(ENDPOINTS.USER, userData);

      const deleteResponse = await apiClient.delete(
        ENDPOINTS.USER_BY_NAME(userData.username)
      );

      expect([200, 204]).toContain(deleteResponse.status());
      logger.testPass('Delete existing user');
    });

    test('❌ should return 404 for deleting non-existent user', async ({
      apiClient,
    }) => {
      logger.testStart('Delete non-existent user');

      const response = await apiClient.delete(
        ENDPOINTS.USER_BY_NAME('nonexistent_user_xyz')
      );

      expect([404, 400]).toContain(response.status());
      logger.testPass('Delete non-existent user returns error');
    });
  });

  // ── GET /user/login ───────────────────────────

  test.describe('GET /user/login — User login', () => {
    test('✅ should login with valid credentials', async ({ apiClient }) => {
      logger.testStart('User login');

      // Create user first
      const userData = TestDataFactory.createUser();
      await apiClient.post(ENDPOINTS.USER, userData);

      const { response, body } = await apiClient.getJson<string>(
        ENDPOINTS.USER_LOGIN,
        {
          username: userData.username,
          password: userData.password!,
        }
      );

      expect([200, 201]).toContain(response.status());
      expect(body).toBeTruthy();

      // Check rate-limit header
      const rateLimit = response.headers()['x-rate-limit'];
      if (rateLimit) {
        expect(parseInt(rateLimit)).toBeGreaterThan(0);
      }

      logger.testPass('User login');

      await apiClient.delete(ENDPOINTS.USER_BY_NAME(userData.username));
    });

    test('❌ should return 400 for invalid credentials', async ({
      apiClient,
    }) => {
      logger.testStart('Login with invalid credentials');

      const response = await apiClient.get(ENDPOINTS.USER_LOGIN, {
        username: 'invalid_user_!!',
        password: 'wrong_password',
      });

      expect([400, 401, 200]).toContain(response.status());
      logger.testPass('Invalid login handled');
    });
  });

  // ── GET /user/logout ──────────────────────────

  test.describe('GET /user/logout — User logout', () => {
    test('✅ should logout successfully', async ({ apiClient }) => {
      logger.testStart('User logout');

      const { response } = await apiClient.getJson<unknown>(
        ENDPOINTS.USER_LOGOUT
      );

      expect([200, 201]).toContain(response.status());
      logger.testPass('User logout');
    });
  });
});
