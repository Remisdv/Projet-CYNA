// Direct tests on cyna-service-api (no auth guard)
import { get, post, put, del, uid, SERVICE_API } from '../helpers/api';

describe('service-api — Categories endpoints (direct)', () => {

  const NIL_UUID = '00000000-0000-0000-0000-000000000000';
  let createdId: string;

  beforeAll(async () => {
    const res = await post(`${SERVICE_API}/api/categories`, {
      nom: `Catégorie Test ${uid()}`,
      description: 'Description de test',
      slug: `test-category-${uid()}`,
    });
    if (res.ok) {
      const body = await res.json() as any;
      createdId = body.id;
    }
  });

  afterAll(async () => {
    if (createdId) {
      await del(`${SERVICE_API}/api/categories/${createdId}`);
    }
  });

  describe('GET /api/categories', () => {
    it('should return 200 with categories list', async () => {
      const res = await get(`${SERVICE_API}/api/categories`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should return 200 for an existing category', async () => {
      if (!createdId) return;
      const res = await get(`${SERVICE_API}/api/categories/${createdId}`);
      expect(res.status).toBe(200);
    });

    it('should return 404 for a non-existent category', async () => {
      const res = await get(`${SERVICE_API}/api/categories/${NIL_UUID}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/categories', () => {
    let tempId: string;

    afterAll(async () => {
      if (tempId) await del(`${SERVICE_API}/api/categories/${tempId}`);
    });

    it('should return 201 with valid data', async () => {
      const res = await post(`${SERVICE_API}/api/categories`, {
        nom: `New Cat ${uid()}`,
        description: 'Desc',
        slug: `new-cat-${uid()}`,
      });
      expect(res.status).toBe(201);
      const body = await res.json() as any;
      expect(body).toHaveProperty('id');
      tempId = body.id;
    });

    it('should return 400 when nom is missing', async () => {
      const res = await post(`${SERVICE_API}/api/categories`, {
        slug: `no-nom-${uid()}`,
      });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should return 200 when updating an existing category', async () => {
      if (!createdId) return;
      const res = await put(`${SERVICE_API}/api/categories/${createdId}`, {
        nom: `Updated Cat ${uid()}`,
      });
      expect(res.status).toBe(200);
    });

    it('should return 404 when updating a non-existent category', async () => {
      const res = await put(`${SERVICE_API}/api/categories/${NIL_UUID}`, { nom: 'Ghost' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    let tempId: string;

    beforeAll(async () => {
      const res = await post(`${SERVICE_API}/api/categories`, {
        nom: `To Delete ${uid()}`,
        slug: `to-delete-${uid()}`,
      });
      if (res.ok) {
        const body = await res.json() as any;
        tempId = body.id;
      }
    });

    it('should return 200 when deleting an existing category', async () => {
      if (!tempId) return;
      const res = await del(`${SERVICE_API}/api/categories/${tempId}`);
      expect(res.status).toBe(200);
      tempId = '';
    });

    it('should return 404 when deleting a non-existent category', async () => {
      const res = await del(`${SERVICE_API}/api/categories/${NIL_UUID}`);
      expect(res.status).toBe(404);
    });
  });

});
