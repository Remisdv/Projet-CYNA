import { get, GATEWAY } from '../helpers/api';

describe('Gateway — Health endpoints', () => {

  describe('GET /health', () => {
    it('should return 200 when the gateway is healthy', async () => {
      const res = await get(`${GATEWAY}/health`);
      expect(res.status).toBe(200);
    });

    it('should return 404 for a completely unknown route', async () => {
      const res = await get(`${GATEWAY}/this-route-does-not-exist`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /health/gateway', () => {
    it('should return 200 for gateway self-check', async () => {
      const res = await get(`${GATEWAY}/health/gateway`);
      expect(res.status).toBe(200);
    });

    it('should return 404 for an unknown health sub-route', async () => {
      const res = await get(`${GATEWAY}/health/unknown-service`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /health/bo-api', () => {
    it('should return 200 when bo-api is reachable', async () => {
      const res = await get(`${GATEWAY}/health/bo-api`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /health/service-api', () => {
    it('should return 200 when service-api is reachable', async () => {
      const res = await get(`${GATEWAY}/health/service-api`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /health/webapp-api', () => {
    it('should return 200 when webapp-api is reachable', async () => {
      const res = await get(`${GATEWAY}/health/webapp-api`);
      expect(res.status).toBe(200);
    });
  });

});
