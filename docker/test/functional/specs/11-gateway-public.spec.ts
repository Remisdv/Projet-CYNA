// Public endpoints accessible without auth through the gateway
import { get, GATEWAY } from '../helpers/api';

describe('Gateway — Public endpoints', () => {

  const NIL_UUID = '00000000-0000-0000-0000-000000000000';

  describe('GET /api/categories (public categories via bo-api)', () => {
    it('should return 200 with category list without auth', async () => {
      const res = await get(`${GATEWAY}/api/categories`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should return 404 for a non-existent category', async () => {
      const res = await get(`${GATEWAY}/api/categories/${NIL_UUID}`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/products (public products via service-api)', () => {
    it('should return 200 with product list without auth', async () => {
      const res = await get(`${GATEWAY}/api/products`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/products/search', () => {
    it('should return 200 with search results', async () => {
      const res = await get(`${GATEWAY}/api/products/search?q=test`);
      expect(res.status).toBe(200);
    });

    it('should return 200 with empty results for unknown query', async () => {
      const res = await get(`${GATEWAY}/api/products/search?q=xxxxxxxxxnotfound`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 404 for a non-existent product', async () => {
      const res = await get(`${GATEWAY}/api/products/${NIL_UUID}`);
      expect(res.status).toBe(404);
    });
  });

});
