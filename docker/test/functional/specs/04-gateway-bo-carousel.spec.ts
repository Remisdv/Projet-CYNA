import { get, post, put, del, GATEWAY } from '../helpers/api';
import { createAdminToken } from '../helpers/auth';

describe('Gateway — BO Carousel endpoints', () => {

  const adminToken = createAdminToken();
  const NIL_UUID = '00000000-0000-0000-0000-000000000000';
  let createdId: string;

  beforeAll(async () => {
    const res = await post(
      `${GATEWAY}/api/bo/carousel`,
      { title: 'Test Carousel Item', text: 'Description test', link: 'https://example.com', order: 99 },
      adminToken,
    );
    if (res.ok) {
      const body = await res.json() as any;
      createdId = body.id;
    }
  });

  afterAll(async () => {
    if (createdId) {
      await del(`${GATEWAY}/api/bo/carousel/${createdId}`, adminToken);
    }
  });

  describe('GET /api/bo/carousel', () => {
    it('should return 200 with carousel items list (public)', async () => {
      const res = await get(`${GATEWAY}/api/bo/carousel`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/bo/carousel/:id', () => {
    it('should return 200 for an existing carousel item', async () => {
      if (!createdId) return;
      const res = await get(`${GATEWAY}/api/bo/carousel/${createdId}`);
      expect(res.status).toBe(200);
    });

    it('should return 404 for a non-existent carousel item', async () => {
      const res = await get(`${GATEWAY}/api/bo/carousel/${NIL_UUID}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/bo/carousel', () => {
    let tempId: string;

    afterAll(async () => {
      if (tempId) await del(`${GATEWAY}/api/bo/carousel/${tempId}`, adminToken);
    });

    it('should return 201 with valid body and admin token', async () => {
      const res = await post(
        `${GATEWAY}/api/bo/carousel`,
        { title: 'New Item', text: 'Text', link: 'https://example.com', order: 100 },
        adminToken,
      );
      expect(res.status).toBe(201);
      const body = await res.json() as any;
      expect(body).toHaveProperty('id');
      tempId = body.id;
    });

    it('should return 401 without authentication token', async () => {
      const res = await post(`${GATEWAY}/api/bo/carousel`, { title: 'Unauthorized' });
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/bo/carousel/:id', () => {
    it('should return 200 when updating an existing item', async () => {
      if (!createdId) return;
      const res = await put(
        `${GATEWAY}/api/bo/carousel/${createdId}`,
        { title: 'Updated title', order: 1 },
        adminToken,
      );
      expect(res.status).toBe(200);
    });

    it('should return 404 when updating a non-existent item', async () => {
      const res = await put(
        `${GATEWAY}/api/bo/carousel/${NIL_UUID}`,
        { title: 'Ghost' },
        adminToken,
      );
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/bo/carousel/:id', () => {
    let tempId: string;

    beforeAll(async () => {
      const res = await post(
        `${GATEWAY}/api/bo/carousel`,
        { title: 'To Delete', order: 200 },
        adminToken,
      );
      if (res.ok) {
        const body = await res.json() as any;
        tempId = body.id;
      }
    });

    it('should return 200 when deleting an existing carousel item', async () => {
      if (!tempId) return;
      const res = await del(`${GATEWAY}/api/bo/carousel/${tempId}`, adminToken);
      expect(res.status).toBe(200);
      tempId = '';
    });

    it('should return 404 when deleting a non-existent carousel item', async () => {
      const res = await del(`${GATEWAY}/api/bo/carousel/${NIL_UUID}`, adminToken);
      expect(res.status).toBe(404);
    });
  });

});
