import { get, GATEWAY } from '../helpers/api';
import { createAdminToken } from '../helpers/auth';

describe('Gateway — BO Stats endpoints', () => {

  const adminToken = createAdminToken();

  describe('GET /api/bo/stats/dashboard', () => {
    it('should return 200 with dashboard stats for admin', async () => {
      const res = await get(`${GATEWAY}/api/bo/stats/dashboard`, adminToken);
      expect(res.status).toBe(200);
    });

    it('should return 401 without authentication token', async () => {
      const res = await get(`${GATEWAY}/api/bo/stats/dashboard`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/bo/stats/commercial', () => {
    it('should return 200 with commercial stats for admin', async () => {
      const res = await get(`${GATEWAY}/api/bo/stats/commercial`, adminToken);
      expect(res.status).toBe(200);
    });

    it('should return 401 without authentication token', async () => {
      const res = await get(`${GATEWAY}/api/bo/stats/commercial`);
      expect(res.status).toBe(401);
    });
  });

});
