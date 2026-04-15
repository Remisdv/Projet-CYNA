// Tests for /api/bo/services (gateway → service-api /api/products)
// Gateway converts camelCase to snake_case automatically

import { get, post, put, del, uid, GATEWAY } from '../helpers/api';
import { createAdminToken } from '../helpers/auth';

describe('Gateway — BO Services endpoints (→ service-api products)', () => {

  const adminToken = createAdminToken();
  const NIL_UUID = '00000000-0000-0000-0000-000000000000';
  let createdId: string;

  const testService = () => ({
    name: `Service test ${uid()}`,
    shortDescription: 'Description courte de test',
    category: 'SOC',
    type: 'service',
    status: 'draft',
    slug: `service-test-${uid()}`,
    monthlyPrice: 99.99,
    periodicity: 'mensuel',
  });

  beforeAll(async () => {
    const res = await post(`${GATEWAY}/api/bo/services`, testService(), adminToken);
    if (res.ok) {
      const body = await res.json() as any;
      createdId = body.id;
    }
  });

  afterAll(async () => {
    if (createdId) {
      await del(`${GATEWAY}/api/bo/services/${createdId}`, adminToken);
    }
  });

  describe('GET /api/bo/services/search', () => {
    it('should return 200 with search results (public)', async () => {
      const res = await get(`${GATEWAY}/api/bo/services/search?q=test`);
      expect(res.status).toBe(200);
    });

    it('should return 200 with empty results for unknown query', async () => {
      const res = await get(`${GATEWAY}/api/bo/services/search?q=xxxxxxxxxnotfound`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/bo/services', () => {
    it('should return 200 with service list for admin', async () => {
      const res = await get(`${GATEWAY}/api/bo/services`, adminToken);
      expect(res.status).toBe(200);
    });

    it('should return 401 without authentication token', async () => {
      const res = await get(`${GATEWAY}/api/bo/services`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/bo/services/:id', () => {
    it('should return 200 for an existing service (public)', async () => {
      if (!createdId) return;
      const res = await get(`${GATEWAY}/api/bo/services/${createdId}`);
      expect(res.status).toBe(200);
    });

    it('should return 404 for a non-existent service', async () => {
      const res = await get(`${GATEWAY}/api/bo/services/${NIL_UUID}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/bo/services', () => {
    let tempId: string;

    afterAll(async () => {
      if (tempId) await del(`${GATEWAY}/api/bo/services/${tempId}`, adminToken);
    });

    it('should return 201 with valid service data and admin token', async () => {
      const res = await post(`${GATEWAY}/api/bo/services`, testService(), adminToken);
      expect(res.status).toBe(201);
      const body = await res.json() as any;
      expect(body).toHaveProperty('id');
      tempId = body.id;
    });

    it('should return 401 without authentication token', async () => {
      const res = await post(`${GATEWAY}/api/bo/services`, testService());
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/bo/services/:id', () => {
    it('should return 200 when updating an existing service', async () => {
      if (!createdId) return;
      const res = await put(
        `${GATEWAY}/api/bo/services/${createdId}`,
        { name: 'Service mis à jour', shortDescription: 'Nouvelle description' },
        adminToken,
      );
      expect(res.status).toBe(200);
    });

    it('should return 404 when updating a non-existent service', async () => {
      const res = await put(
        `${GATEWAY}/api/bo/services/${NIL_UUID}`,
        { name: 'Ghost' },
        adminToken,
      );
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/bo/services/:id/publish', () => {
    it('should return 201 when publishing an existing service', async () => {
      if (!createdId) return;
      const res = await post(`${GATEWAY}/api/bo/services/${createdId}/publish`, {}, adminToken);
      expect(res.status).toBe(201);
    });

    it('should return 401 without authentication token', async () => {
      const res = await post(`${GATEWAY}/api/bo/services/${NIL_UUID}/publish`, {});
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/bo/services/:id/duplicate', () => {
    let duplicatedId: string;

    afterAll(async () => {
      if (duplicatedId) await del(`${GATEWAY}/api/bo/services/${duplicatedId}`, adminToken);
    });

    it('should return 201 when duplicating an existing service', async () => {
      if (!createdId) return;
      const res = await post(`${GATEWAY}/api/bo/services/${createdId}/duplicate`, {}, adminToken);
      expect(res.status).toBe(201);
      const body = await res.json() as any;
      if (body.id) duplicatedId = body.id;
    });

    it('should return 401 without authentication token', async () => {
      const res = await post(`${GATEWAY}/api/bo/services/${NIL_UUID}/duplicate`, {});
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/bo/services/:id', () => {
    let tempId: string;

    beforeAll(async () => {
      const res = await post(`${GATEWAY}/api/bo/services`, testService(), adminToken);
      if (res.ok) {
        const body = await res.json() as any;
        tempId = body.id;
      }
    });

    it('should return 204 when deleting an existing service', async () => {
      if (!tempId) return;
      const res = await del(`${GATEWAY}/api/bo/services/${tempId}`, adminToken);
      expect(res.status).toBe(204);
      tempId = '';
    });

    it('should return 404 when deleting a non-existent service', async () => {
      const res = await del(`${GATEWAY}/api/bo/services/${NIL_UUID}`, adminToken);
      expect(res.status).toBe(404);
    });
  });

});
