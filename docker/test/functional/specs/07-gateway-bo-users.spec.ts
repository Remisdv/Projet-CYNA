import { get, post, put, del, uid, GATEWAY } from '../helpers/api';
import { createAdminToken } from '../helpers/auth';

describe('Gateway — BO Users endpoints', () => {

  const adminToken = createAdminToken();
  const NIL_UUID = '00000000-0000-0000-0000-000000000000';
  let createdId: string;

  beforeAll(async () => {
    const res = await post(
      `${GATEWAY}/api/bo/users`,
      {
        email: `test-user-${uid()}@cyna.fr`,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        status: 'ACTIVE',
      },
      adminToken,
    );
    if (res.ok) {
      const body = await res.json() as any;
      createdId = body.id;
    }
  });

  afterAll(async () => {
    if (createdId) {
      await del(`${GATEWAY}/api/bo/users/${createdId}`, adminToken);
    }
  });

  describe('GET /api/bo/users', () => {
    it('should return 200 with paginated user list for admin', async () => {
      const res = await get(`${GATEWAY}/api/bo/users`, adminToken);
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body).toHaveProperty('items');
      expect(Array.isArray(body.items)).toBe(true);
    });

    it('should return 401 without authentication token', async () => {
      const res = await get(`${GATEWAY}/api/bo/users`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/bo/users/:id', () => {
    it('should return 200 for an existing user', async () => {
      if (!createdId) return;
      const res = await get(`${GATEWAY}/api/bo/users/${createdId}`, adminToken);
      expect(res.status).toBe(200);
    });

    it('should return 404 for a non-existent user', async () => {
      const res = await get(`${GATEWAY}/api/bo/users/${NIL_UUID}`, adminToken);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/bo/users', () => {
    let tempId: string;

    afterAll(async () => {
      if (tempId) await del(`${GATEWAY}/api/bo/users/${tempId}`, adminToken);
    });

    it('should return 201 with valid user data and admin token', async () => {
      const res = await post(
        `${GATEWAY}/api/bo/users`,
        {
          email: `new-user-${uid()}@cyna.fr`,
          firstName: 'New',
          lastName: 'User',
          role: 'USER',
          status: 'ACTIVE',
        },
        adminToken,
      );
      expect(res.status).toBe(201);
      const body = await res.json() as any;
      expect(body).toHaveProperty('id');
      tempId = body.id;
    });

    it('should return 400 when email is missing', async () => {
      const res = await post(
        `${GATEWAY}/api/bo/users`,
        { firstName: 'No', lastName: 'Email', role: 'USER', status: 'ACTIVE' },
        adminToken,
      );
      expect(res.status).toBe(400);
    });

    it('should return 401 without authentication token', async () => {
      const res = await post(`${GATEWAY}/api/bo/users`, {
        email: `test-${uid()}@cyna.fr`,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        status: 'ACTIVE',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/bo/users/:id', () => {
    it('should return 200 when updating an existing user', async () => {
      if (!createdId) return;
      const res = await put(
        `${GATEWAY}/api/bo/users/${createdId}`,
        { firstName: 'Updated', lastName: 'Name' },
        adminToken,
      );
      expect(res.status).toBe(200);
    });

    it('should return 404 when updating a non-existent user', async () => {
      const res = await put(
        `${GATEWAY}/api/bo/users/${NIL_UUID}`,
        { firstName: 'Ghost' },
        adminToken,
      );
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/bo/users/:id/reset-password', () => {
    it('should return 200 when resetting password for an existing user', async () => {
      if (!createdId) return;
      const res = await post(`${GATEWAY}/api/bo/users/${createdId}/reset-password`, {}, adminToken);
      expect(res.status).toBe(200);
    });

    it('should return 404 when resetting password for a non-existent user', async () => {
      const res = await post(`${GATEWAY}/api/bo/users/${NIL_UUID}/reset-password`, {}, adminToken);
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/bo/users/:id', () => {
    let tempId: string;

    beforeAll(async () => {
      const res = await post(
        `${GATEWAY}/api/bo/users`,
        {
          email: `to-delete-${uid()}@cyna.fr`,
          firstName: 'Delete',
          lastName: 'Me',
          role: 'USER',
          status: 'ACTIVE',
        },
        adminToken,
      );
      if (res.ok) {
        const body = await res.json() as any;
        tempId = body.id;
      }
    });

    it('should return 200 when deleting an existing user', async () => {
      if (!tempId) return;
      const res = await del(`${GATEWAY}/api/bo/users/${tempId}`, adminToken);
      expect(res.status).toBe(200);
      tempId = '';
    });

    it('should return 404 when deleting a non-existent user', async () => {
      const res = await del(`${GATEWAY}/api/bo/users/${NIL_UUID}`, adminToken);
      expect(res.status).toBe(404);
    });
  });

});
