import { get, post, put, del, uid, GATEWAY } from '../helpers/api';
import { createAdminToken } from '../helpers/auth';

describe('Gateway — BO Categories endpoints', () => {

  const adminToken = createAdminToken();
  const NIL_UUID = '00000000-0000-0000-0000-000000000000';
  let createdId: string;

  const testCategory = () => ({
    slug: `test-cat-${uid()}`,
    isActive: true,
    translations: [
      { lang: 'fr', name: `Catégorie test ${uid()}` },
      { lang: 'en', name: `Test category ${uid()}` },
    ],
  });

  beforeAll(async () => {
    const res = await post(`${GATEWAY}/api/bo/categories`, testCategory(), adminToken);
    if (res.ok) {
      const body = await res.json() as any;
      createdId = body.id;
    }
  });

  afterAll(async () => {
    if (createdId) {
      await del(`${GATEWAY}/api/bo/categories/${createdId}`, adminToken);
    }
  });

  describe('GET /api/bo/categories', () => {
    it('should return 200 with a list (public endpoint)', async () => {
      const res = await get(`${GATEWAY}/api/bo/categories`);
      expect(res.status).toBe(200);
    });

    it('should return 200 even without auth token (public)', async () => {
      const res = await get(`${GATEWAY}/api/bo/categories`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/bo/categories/:id', () => {
    it('should return 200 for an existing category', async () => {
      if (!createdId) return;
      const res = await get(`${GATEWAY}/api/bo/categories/${createdId}`);
      expect(res.status).toBe(200);
    });

    it('should return 404 for a non-existent category ID', async () => {
      const res = await get(`${GATEWAY}/api/bo/categories/${NIL_UUID}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/bo/categories', () => {
    let tempId: string;

    afterAll(async () => {
      if (tempId) await del(`${GATEWAY}/api/bo/categories/${tempId}`, adminToken);
    });

    it('should return 201 with valid body and admin token', async () => {
      const res = await post(`${GATEWAY}/api/bo/categories`, testCategory(), adminToken);
      expect(res.status).toBe(201);
      const body = await res.json() as any;
      expect(body).toHaveProperty('id');
      tempId = body.id;
    });

    it('should return 401 without authentication token', async () => {
      const res = await post(`${GATEWAY}/api/bo/categories`, testCategory());
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/bo/categories/:id', () => {
    it('should return 200 when updating an existing category', async () => {
      if (!createdId) return;
      const res = await put(
        `${GATEWAY}/api/bo/categories/${createdId}`,
        { slug: `updated-${uid()}`, isActive: false, translations: [{ lang: 'fr', name: 'Mis à jour' }, { lang: 'en', name: 'Updated' }] },
        adminToken,
      );
      expect(res.status).toBe(200);
    });

    it('should return 401 without authentication token', async () => {
      if (!createdId) return;
      const res = await put(`${GATEWAY}/api/bo/categories/${createdId}`, { slug: 'nope' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/bo/categories/:id', () => {
    let tempId: string;

    beforeAll(async () => {
      const res = await post(`${GATEWAY}/api/bo/categories`, testCategory(), adminToken);
      if (res.ok) {
        const body = await res.json() as any;
        tempId = body.id;
      }
    });

    it('should return 204 when deleting an existing category', async () => {
      if (!tempId) return;
      const res = await del(`${GATEWAY}/api/bo/categories/${tempId}`, adminToken);
      expect(res.status).toBe(204);
      tempId = '';
    });

    it('should return 404 when deleting a non-existent category', async () => {
      const res = await del(`${GATEWAY}/api/bo/categories/${NIL_UUID}`, adminToken);
      expect(res.status).toBe(404);
    });
  });

});
