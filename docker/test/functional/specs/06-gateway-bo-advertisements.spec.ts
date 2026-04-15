import { get, post, put, patch, del, GATEWAY } from '../helpers/api';
import { createAdminToken } from '../helpers/auth';

describe('Gateway — BO Advertisements (TextePromotionnel) endpoints', () => {

  const adminToken = createAdminToken();
  const NIL_UUID = '00000000-0000-0000-0000-000000000000';
  let createdId: string;

  beforeAll(async () => {
    const res = await post(
      `${GATEWAY}/api/bo/advertisements`,
      { textFr: 'Offre spéciale test', textEn: 'Special test offer' },
      adminToken,
    );
    if (res.ok) {
      const body = await res.json() as any;
      createdId = body.id;
    }
  });

  afterAll(async () => {
    if (createdId) {
      await del(`${GATEWAY}/api/bo/advertisements/${createdId}`, adminToken);
    }
  });

  describe('GET /api/bo/advertisements', () => {
    it('should return 200 with the list of advertisements (public)', async () => {
      const res = await get(`${GATEWAY}/api/bo/advertisements`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/bo/advertisements/active', () => {
    it('should return 200 with active advertisements (public)', async () => {
      const res = await get(`${GATEWAY}/api/bo/advertisements/active`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/bo/advertisements/:id', () => {
    it('should return 200 for an existing advertisement', async () => {
      if (!createdId) return;
      const res = await get(`${GATEWAY}/api/bo/advertisements/${createdId}`);
      expect(res.status).toBe(200);
    });

    it('should return 404 for a non-existent advertisement', async () => {
      const res = await get(`${GATEWAY}/api/bo/advertisements/${NIL_UUID}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/bo/advertisements', () => {
    let tempId: string;

    afterAll(async () => {
      if (tempId) await del(`${GATEWAY}/api/bo/advertisements/${tempId}`, adminToken);
    });

    it('should return 201 with valid body and admin token', async () => {
      const res = await post(
        `${GATEWAY}/api/bo/advertisements`,
        { textFr: 'Promotion FR', textEn: 'Promotion EN' },
        adminToken,
      );
      expect(res.status).toBe(201);
      const body = await res.json() as any;
      expect(body).toHaveProperty('id');
      tempId = body.id;
    });

    it('should return 401 without authentication token', async () => {
      const res = await post(`${GATEWAY}/api/bo/advertisements`, {
        textFr: 'Non autorisé',
        textEn: 'Unauthorized',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/bo/advertisements/:id', () => {
    it('should return 200 when updating an existing advertisement', async () => {
      if (!createdId) return;
      const res = await put(
        `${GATEWAY}/api/bo/advertisements/${createdId}`,
        { textFr: 'Offre mise à jour', textEn: 'Updated offer' },
        adminToken,
      );
      expect(res.status).toBe(200);
    });

    it('should return 404 when updating a non-existent advertisement', async () => {
      const res = await put(
        `${GATEWAY}/api/bo/advertisements/${NIL_UUID}`,
        { textFr: 'Ghost', textEn: 'Ghost' },
        adminToken,
      );
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/bo/advertisements/:id/activate', () => {
    it('should return 200 when toggling activation of an existing advertisement', async () => {
      if (!createdId) return;
      const res = await patch(`${GATEWAY}/api/bo/advertisements/${createdId}/activate`, undefined, adminToken);
      expect(res.status).toBe(200);
    });

    it('should return 401 without authentication token', async () => {
      const res = await patch(`${GATEWAY}/api/bo/advertisements/${NIL_UUID}/activate`);
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/bo/advertisements/:id', () => {
    let tempId: string;

    beforeAll(async () => {
      const res = await post(
        `${GATEWAY}/api/bo/advertisements`,
        { textFr: 'À supprimer', textEn: 'To delete' },
        adminToken,
      );
      if (res.ok) {
        const body = await res.json() as any;
        tempId = body.id;
      }
    });

    it('should return 200 when deleting an existing advertisement', async () => {
      if (!tempId) return;
      const res = await del(`${GATEWAY}/api/bo/advertisements/${tempId}`, adminToken);
      expect(res.status).toBe(200);
      tempId = '';
    });

    it('should return 404 when deleting a non-existent advertisement', async () => {
      const res = await del(`${GATEWAY}/api/bo/advertisements/${NIL_UUID}`, adminToken);
      expect(res.status).toBe(404);
    });
  });

});
