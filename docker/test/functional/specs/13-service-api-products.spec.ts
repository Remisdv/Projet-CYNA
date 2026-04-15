// Direct tests on cyna-service-api products (no auth guard)
import { get, post, put, del, uid, SERVICE_API } from '../helpers/api';

describe('service-api — Products endpoints (direct)', () => {

  const NIL_UUID = '00000000-0000-0000-0000-000000000000';
  let createdId: string;

  const testProduct = () => ({
    nom: `Produit test ${uid()}`,
    description_courte: 'Description courte',
    categorie: 'SOC',
    type: 'service',
    statut: 'brouillon',
    slug: `produit-test-${uid()}`,
    prix_mensuel: 99,
    periodicite: 'mensuel',
  });

  beforeAll(async () => {
    const res = await post(`${SERVICE_API}/api/products`, testProduct());
    if (res.ok) {
      const body = await res.json() as any;
      createdId = body.id;
    }
  });

  afterAll(async () => {
    if (createdId) {
      await del(`${SERVICE_API}/api/products/${createdId}`);
    }
  });

  describe('GET /api/products', () => {
    it('should return 200 with product list', async () => {
      const res = await get(`${SERVICE_API}/api/products`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/products/search', () => {
    it('should return 200 with search results', async () => {
      const res = await get(`${SERVICE_API}/api/products/search?q=test`);
      expect(res.status).toBe(200);
    });

    it('should return 200 with empty results for unknown term', async () => {
      const res = await get(`${SERVICE_API}/api/products/search?q=xxxxxxxxxnotfound`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 200 for an existing product', async () => {
      if (!createdId) return;
      const res = await get(`${SERVICE_API}/api/products/${createdId}`);
      expect(res.status).toBe(200);
    });

    it('should return 404 for a non-existent product', async () => {
      const res = await get(`${SERVICE_API}/api/products/${NIL_UUID}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/products', () => {
    let tempId: string;

    afterAll(async () => {
      if (tempId) await del(`${SERVICE_API}/api/products/${tempId}`);
    });

    it('should return 201 with valid product data', async () => {
      const res = await post(`${SERVICE_API}/api/products`, testProduct());
      expect(res.status).toBe(201);
      const body = await res.json() as any;
      expect(body).toHaveProperty('id');
      tempId = body.id;
    });

    it('should return 400 when nom is missing', async () => {
      const res = await post(`${SERVICE_API}/api/products`, {
        description_courte: 'Desc',
        categorie: 'SOC',
        type: 'service',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should return 200 when updating an existing product', async () => {
      if (!createdId) return;
      const res = await put(`${SERVICE_API}/api/products/${createdId}`, {
        nom: `Produit mis à jour ${uid()}`,
        description_courte: 'Updated short desc',
      });
      expect(res.status).toBe(200);
    });

    it('should return 404 when updating a non-existent product', async () => {
      const res = await put(`${SERVICE_API}/api/products/${NIL_UUID}`, { nom: 'Ghost' });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/products/:id/publish', () => {
    it('should return 201 when publishing an existing product', async () => {
      if (!createdId) return;
      const res = await post(`${SERVICE_API}/api/products/${createdId}/publish`, {});
      expect(res.status).toBe(201);
    });

    it('should return 404 when publishing a non-existent product', async () => {
      const res = await post(`${SERVICE_API}/api/products/${NIL_UUID}/publish`, {});
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/products/:id/duplicate', () => {
    let duplicatedId: string;

    afterAll(async () => {
      if (duplicatedId) await del(`${SERVICE_API}/api/products/${duplicatedId}`);
    });

    it('should return 201 when duplicating an existing product', async () => {
      if (!createdId) return;
      const res = await post(`${SERVICE_API}/api/products/${createdId}/duplicate`, {});
      expect(res.status).toBe(201);
      const body = await res.json() as any;
      if (body.id) duplicatedId = body.id;
    });

    it('should return 404 when duplicating a non-existent product', async () => {
      const res = await post(`${SERVICE_API}/api/products/${NIL_UUID}/duplicate`, {});
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    let tempId: string;

    beforeAll(async () => {
      const res = await post(`${SERVICE_API}/api/products`, testProduct());
      if (res.ok) {
        const body = await res.json() as any;
        tempId = body.id;
      }
    });

    it('should return 204 when deleting an existing product', async () => {
      if (!tempId) return;
      const res = await del(`${SERVICE_API}/api/products/${tempId}`);
      expect(res.status).toBe(204);
      tempId = '';
    });

    it('should return 404 when deleting a non-existent product', async () => {
      const res = await del(`${SERVICE_API}/api/products/${NIL_UUID}`);
      expect(res.status).toBe(404);
    });
  });

});
