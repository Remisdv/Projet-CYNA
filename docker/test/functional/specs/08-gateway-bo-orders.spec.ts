import { get, GATEWAY } from '../helpers/api';
import { createAdminToken } from '../helpers/auth';

describe('Gateway — BO Orders endpoints', () => {

  const adminToken = createAdminToken();
  const NIL_UUID = '00000000-0000-0000-0000-000000000000';

  describe('GET /api/bo/orders', () => {
    it('should return 200 with orders list for admin', async () => {
      const res = await get(`${GATEWAY}/api/bo/orders`, adminToken);
      expect(res.status).toBe(200);
    });

    it('should return 401 without authentication token', async () => {
      const res = await get(`${GATEWAY}/api/bo/orders`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/bo/orders/:id', () => {
    it('should return 404 for a non-existent order ID', async () => {
      const res = await get(`${GATEWAY}/api/bo/orders/${NIL_UUID}`, adminToken);
      expect(res.status).toBe(404);
    });

    it('should return 401 without authentication token', async () => {
      const res = await get(`${GATEWAY}/api/bo/orders/${NIL_UUID}`);
      expect(res.status).toBe(401);
    });
  });

});
