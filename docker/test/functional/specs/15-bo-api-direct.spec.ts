// Direct tests on cyna-bo-api (no auth guard on this service)
import { get, post, put, del, uid, BO_API } from '../helpers/api';

describe('bo-api — Health & direct endpoints', () => {

  describe('GET /api/bo/health', () => {
    it('should return 200 when bo-api is healthy', async () => {
      const res = await get(`${BO_API}/api/bo/health`);
      expect(res.status).toBe(200);
    });

    it('should return 404 for an unknown route', async () => {
      const res = await get(`${BO_API}/api/bo/unknown-route`);
      expect(res.status).toBe(404);
    });
  });

  describe('bo-api — Users (direct, no auth guard)', () => {
    const NIL_UUID = '00000000-0000-0000-0000-000000000000';
    let createdId: string;

    beforeAll(async () => {
      const res = await post(`${BO_API}/api/bo/users`, {
        email: `direct-test-${uid()}@cyna.fr`,
        firstName: 'Direct',
        lastName: 'Test',
        role: 'USER',
        status: 'ACTIVE',
      });
      if (res.ok) {
        const body = await res.json() as any;
        createdId = body.id;
      }
    });

    afterAll(async () => {
      if (createdId) await del(`${BO_API}/api/bo/users/${createdId}`);
    });

    it('GET /api/bo/users should return 200 with user list', async () => {
      const res = await get(`${BO_API}/api/bo/users`);
      expect(res.status).toBe(200);
    });

    it('GET /api/bo/users/:id should return 200 for an existing user', async () => {
      if (!createdId) return;
      const res = await get(`${BO_API}/api/bo/users/${createdId}`);
      expect(res.status).toBe(200);
    });

    it('GET /api/bo/users/:id should return 404 for a non-existent user', async () => {
      const res = await get(`${BO_API}/api/bo/users/${NIL_UUID}`);
      expect(res.status).toBe(404);
    });

    it('PUT /api/bo/users/:id should return 200 when updating a user', async () => {
      if (!createdId) return;
      const res = await put(`${BO_API}/api/bo/users/${createdId}`, { firstName: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('DELETE /api/bo/users/:id should return 404 for a non-existent user', async () => {
      const res = await del(`${BO_API}/api/bo/users/${NIL_UUID}`);
      expect(res.status).toBe(404);
    });
  });

  describe('bo-api — Auth (direct)', () => {
    it('POST /api/bo/auth/login should return 200 for valid credentials', async () => {
      const res = await post(`${BO_API}/api/bo/auth/login`, {
        email: 'admin@cyna.fr',
        password: 'TempPassword123!',
      });
      expect(res.status).toBe(200);
    });

    it('POST /api/bo/auth/login should return 401 for invalid credentials', async () => {
      const res = await post(`${BO_API}/api/bo/auth/login`, {
        email: 'admin@cyna.fr',
        password: 'wrong-password',
      });
      expect(res.status).toBe(401);
    });
  });

});
