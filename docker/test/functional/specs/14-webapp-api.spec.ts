// Direct tests on cyna-webapp-api
import { get, WEBAPP_API } from '../helpers/api';

describe('webapp-api — Endpoints (direct)', () => {

  describe('GET /health', () => {
    it('should return 200 when webapp-api is healthy', async () => {
      const res = await get(`${WEBAPP_API}/health`);
      expect(res.status).toBe(200);
    });

    it('should return 404 for an unknown route', async () => {
      const res = await get(`${WEBAPP_API}/unknown-route`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /promotionnel/active', () => {
    it('should return 200 with active promotional texts', async () => {
      const res = await get(`${WEBAPP_API}/promotionnel/active`);
      expect(res.status).toBe(200);
    });
  });

});
