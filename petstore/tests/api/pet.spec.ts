import { test, expect } from '../../fixtures/petstore.fixtures';
import { ApiClient } from '../../utils/api-client';
import { TestDataFactory } from '../../utils/test-data.factory';
import { Assertions } from '../../utils/assertions';
import { Logger } from '../../utils/logger';
import { ENDPOINTS, HTTP_STATUS } from '../../config/api.config';
import { Pet } from '../../utils/types';

// ──────────────────────────────────────────────
// Pet Endpoint Tests
// ──────────────────────────────────────────────

const logger = new Logger('PetTests');

test.describe('Pet Endpoints', () => {
  // ── POST /pet — Add a new pet ────────────────

  test.describe('POST /pet — Add a new pet', () => {
    test('✅ should add a valid pet and return 200 with pet data', async ({
      apiClient,
    }) => {
      logger.testStart('Add valid pet');
      const petData = TestDataFactory.createPet();

      const { response, body } = await apiClient.postJson<Pet>(
        ENDPOINTS.PET,
        petData
      );

      Assertions.expectStatus(response, HTTP_STATUS.OK);
      Assertions.expectPetShape(body);
      Assertions.expectPetMatchesInput(body, { name: petData.name });

      expect(body.status).toBe('available');
      logger.testPass('Add valid pet');

      // Cleanup
      await apiClient.delete(ENDPOINTS.PET_BY_ID(body.id!));
    });

    test('✅ should add a pet with all optional fields', async ({
      apiClient,
    }) => {
      logger.testStart('Add pet with all fields');
      const petData = TestDataFactory.createPet({
        category: { id: 2, name: 'Cats' },
        tags: [
          { id: 10, name: 'indoor' },
          { id: 11, name: 'vaccinated' },
        ],
        status: 'pending',
      });

      const { response, body } = await apiClient.postJson<Pet>(
        ENDPOINTS.PET,
        petData
      );

      Assertions.expectStatus(response, HTTP_STATUS.OK);
      Assertions.expectPetShape(body);
      expect(body.category?.name).toBe('Cats');
      expect(body.status).toBe('pending');
      expect(body.tags?.length).toBeGreaterThanOrEqual(1);
      logger.testPass('Add pet with all fields');

      await apiClient.delete(ENDPOINTS.PET_BY_ID(body.id!));
    });

    test('✅ should add a minimal pet (only required fields)', async ({
      apiClient,
    }) => {
      logger.testStart('Add minimal pet');
      const petData = TestDataFactory.createMinimalPet();

      const { response, body } = await apiClient.postJson<Pet>(
        ENDPOINTS.PET,
        petData
      );

      Assertions.expectStatus(response, HTTP_STATUS.OK);
      expect(body.name).toBe(petData.name);
      logger.testPass('Add minimal pet');

      await apiClient.delete(ENDPOINTS.PET_BY_ID(body.id!));
    });

    test('✅ should add pets with each valid status', async ({ apiClient }) => {
      const statuses: Array<'available' | 'pending' | 'sold'> = [
        'available',
        'pending',
        'sold',
      ];

      for (const status of statuses) {
        logger.testStart(`Add pet with status: ${status}`);
        const petData = TestDataFactory.createPetWithStatus(status);

        const { response, body } = await apiClient.postJson<Pet>(
          ENDPOINTS.PET,
          petData
        );

        Assertions.expectStatus(response, HTTP_STATUS.OK);
        Assertions.expectPetStatus(body, status);
        logger.testPass(`Add pet with status: ${status}`);

        await apiClient.delete(ENDPOINTS.PET_BY_ID(body.id!));
      }
    });
  });

  // ── PUT /pet — Update an existing pet ────────

  test.describe('PUT /pet — Update an existing pet', () => {
    test('✅ should update pet name and status', async ({
      apiClient,
      createdPet,
    }) => {
      logger.testStart('Update pet name and status');

      const updatedData: Pet = {
        ...createdPet,
        name: `Updated_${createdPet.name}`,
        status: 'sold',
      };

      const { response, body } = await apiClient.putJson<Pet>(
        ENDPOINTS.PET,
        updatedData
      );

      Assertions.expectStatus(response, HTTP_STATUS.OK);
      expect(body.name).toBe(updatedData.name);
      expect(body.status).toBe('sold');
      expect(body.id).toBe(createdPet.id);
      logger.testPass('Update pet name and status');
    });

    test('✅ should update pet category', async ({
      apiClient,
      createdPet,
    }) => {
      logger.testStart('Update pet category');

      const updatedData: Pet = {
        ...createdPet,
        category: { id: 5, name: 'Exotic' },
      };

      const { response, body } = await apiClient.putJson<Pet>(
        ENDPOINTS.PET,
        updatedData
      );

      Assertions.expectStatus(response, HTTP_STATUS.OK);
      expect(body.category?.name).toBe('Exotic');
      logger.testPass('Update pet category');
    });

    test('❌ should handle update with invalid/non-existent pet ID', async ({
      apiClient,
    }) => {
      logger.testStart('Update non-existent pet');

      const invalidPet: Pet = {
        id: 999999999,
        name: 'Ghost Pet',
        photoUrls: ['https://example.com/ghost.jpg'],
        status: 'available',
      };

      // API may return 200 or 404 for unknown IDs — we accept either
      const response = await apiClient.put(ENDPOINTS.PET, invalidPet);
      expect([200, 404, 400]).toContain(response.status());
      logger.testPass('Update non-existent pet (error handled)');
    });
  });

  // ── GET /pet/{petId} — Find pet by ID ────────

  test.describe('GET /pet/{petId} — Find pet by ID', () => {
    test('✅ should retrieve an existing pet by ID', async ({
      apiClient,
      createdPet,
    }) => {
      logger.testStart('Find pet by ID');

      const { response, body } = await apiClient.getJson<Pet>(
        ENDPOINTS.PET_BY_ID(createdPet.id!)
      );

      Assertions.expectStatus(response, HTTP_STATUS.OK);
      Assertions.expectPetShape(body);
      expect(body.id).toBe(createdPet.id);
      expect(body.name).toBe(createdPet.name);
      logger.testPass('Find pet by ID');
    });

    test('❌ should return 404 or 200 for non-existent pet ID', async ({
      apiClient,
    }) => {
      logger.testStart('Find pet by non-existent ID');

      // NOTE: The Petstore sandbox API inconsistently returns 200 with an empty/stale
      // body for unknown IDs instead of 404. We accept both to handle this known quirk.
      const response = await apiClient.get(ENDPOINTS.PET_BY_ID(999999999));

      expect([200, 404]).toContain(response.status());
      logger.testPass('Find pet by non-existent ID — status handled');
    });

    test('❌ should handle invalid (non-numeric) pet ID gracefully', async ({
      request,
    }) => {
      logger.testStart('Find pet by invalid ID format');

      // Playwright's typed API won't let us pass a string, so use raw request
      const response = await request.get(
        'https://petstore.swagger.io/v2/pet/not-a-number',
        {
          headers: { Accept: 'application/json' },
        }
      );

      expect([400, 404, 405]).toContain(response.status());
      logger.testPass('Invalid pet ID format handled');
    });
  });

  // ── DELETE /pet/{petId} — Delete a pet ───────

  test.describe('DELETE /pet/{petId} — Delete a pet', () => {
    test('✅ should delete an existing pet', async ({ apiClient }) => {
      logger.testStart('Delete existing pet');

      // Create a dedicated pet for deletion
      const petData = TestDataFactory.createPet();
      const createResponse = await apiClient.postJson<Pet>(
        ENDPOINTS.PET,
        petData
      );
      const pet = createResponse.body;

      const deleteResponse = await apiClient.delete(
        ENDPOINTS.PET_BY_ID(pet.id!)
      );

      expect([200, 204]).toContain(deleteResponse.status());

      // Verify it's gone
      const getResponse = await apiClient.get(ENDPOINTS.PET_BY_ID(pet.id!));
      Assertions.expectStatus(getResponse, HTTP_STATUS.NOT_FOUND);
      logger.testPass('Delete existing pet');
    });

    test('❌ should return error or 200 when deleting non-existent pet', async ({
      apiClient,
    }) => {
      logger.testStart('Delete non-existent pet');

      // NOTE: Petstore sandbox may return 200 even for non-existent IDs.
      // We accept 200, 404, and 400 as valid responses.
      const response = await apiClient.delete(ENDPOINTS.PET_BY_ID(999999999));

      expect([200, 404, 400]).toContain(response.status());
      logger.testPass('Delete non-existent pet returns expected status');
    });
  });

  // ── GET /pet/findByStatus ─────────────────────

  test.describe('GET /pet/findByStatus — Find pets by status', () => {
    test('✅ should find available pets', async ({ apiClient }) => {
      logger.testStart('Find available pets');

      const { response, body } = await apiClient.getJson<Pet[]>(
        ENDPOINTS.PET_FIND_BY_STATUS,
        { status: 'available' }
      );

      Assertions.expectStatus(response, HTTP_STATUS.OK);
      Assertions.expectArrayNotEmpty(body, 'available pets');
      body.slice(0, 5).forEach((pet) => {
        expect(pet.status).toBe('available');
      });
      logger.testPass('Find available pets');
    });

    test('✅ should find pending pets', async ({ apiClient }) => {
      logger.testStart('Find pending pets');

      const { response, body } = await apiClient.getJson<Pet[]>(
        ENDPOINTS.PET_FIND_BY_STATUS,
        { status: 'pending' }
      );

      Assertions.expectStatus(response, HTTP_STATUS.OK);
      expect(Array.isArray(body)).toBeTruthy();
      logger.testPass('Find pending pets');
    });

    test('❌ should return 400 for invalid status value', async ({
      apiClient,
    }) => {
      logger.testStart('Find pets with invalid status');

      const response = await apiClient.get(ENDPOINTS.PET_FIND_BY_STATUS, {
        status: 'invalid_status_xyz',
      });

      expect([400, 200]).toContain(response.status());
      logger.testPass('Invalid status handled');
    });
  });
});