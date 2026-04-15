import { get, post, put, del, GATEWAY } from '../helpers/api';
import { createAdminToken } from '../helpers/auth';

describe('Gateway — BO FAQ endpoints', () => {

  const adminToken = createAdminToken();
  const NIL_UUID = '00000000-0000-0000-0000-000000000000';
  let createdId: string;

  beforeAll(async () => {
    const res = await post(
      `${GATEWAY}/api/bo/faqs`,
      { question: 'Question de test ?', answer: 'Réponse de test.', lang: 'fr', order: 99 },
      adminToken,
    );
    if (res.ok) {
      const body = await res.json() as any;
      createdId = body.id;
    }
  });

  afterAll(async () => {
    if (createdId) {
      await del(`${GATEWAY}/api/bo/faqs/${createdId}`, adminToken);
    }
  });

  describe('GET /api/bo/faqs/tree', () => {
    it('should return 200 with faq tree structure (public)', async () => {
      const res = await get(`${GATEWAY}/api/bo/faqs/tree`);
      expect(res.status).toBe(200);
    });

    it('should return 200 with lang filter', async () => {
      const res = await get(`${GATEWAY}/api/bo/faqs/tree?lang=fr`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/bo/faqs/:id', () => {
    it('should return 200 for an existing FAQ', async () => {
      if (!createdId) return;
      const res = await get(`${GATEWAY}/api/bo/faqs/${createdId}`);
      expect(res.status).toBe(200);
    });

    it('should return 404 for a non-existent FAQ', async () => {
      const res = await get(`${GATEWAY}/api/bo/faqs/${NIL_UUID}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/bo/faqs', () => {
    let tempId: string;

    afterAll(async () => {
      if (tempId) await del(`${GATEWAY}/api/bo/faqs/${tempId}`, adminToken);
    });

    it('should return 201 with valid body and admin token', async () => {
      const res = await post(
        `${GATEWAY}/api/bo/faqs`,
        { question: 'Nouvelle question ?', answer: 'Nouvelle réponse.', lang: 'fr', order: 1 },
        adminToken,
      );
      expect(res.status).toBe(201);
      const body = await res.json() as any;
      expect(body).toHaveProperty('id');
      tempId = body.id;
    });

    it('should return 400 when question is missing', async () => {
      const res = await post(
        `${GATEWAY}/api/bo/faqs`,
        { answer: 'Réponse sans question' },
        adminToken,
      );
      expect(res.status).toBe(400);
    });

    it('should return 401 without authentication token', async () => {
      const res = await post(`${GATEWAY}/api/bo/faqs`, { question: 'Non autorisé ?' });
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/bo/faqs/:id', () => {
    it('should return 200 when updating an existing FAQ', async () => {
      if (!createdId) return;
      const res = await put(
        `${GATEWAY}/api/bo/faqs/${createdId}`,
        { question: 'Question modifiée ?', answer: 'Réponse modifiée.', lang: 'fr', order: 5 },
        adminToken,
      );
      expect(res.status).toBe(200);
    });

    it('should return 404 when updating a non-existent FAQ', async () => {
      const res = await put(
        `${GATEWAY}/api/bo/faqs/${NIL_UUID}`,
        { question: 'Ghost ?' },
        adminToken,
      );
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/bo/faqs/:id/reorder', () => {
    it('should return 200 when reordering an existing FAQ', async () => {
      if (!createdId) return;
      const res = await put(`${GATEWAY}/api/bo/faqs/${createdId}/reorder`, { order: 10 }, adminToken);
      expect(res.status).toBe(200);
    });

    it('should return 401 without authentication token', async () => {
      const res = await put(`${GATEWAY}/api/bo/faqs/${NIL_UUID}/reorder`, { order: 10 });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/bo/faqs/:id', () => {
    let tempId: string;

    beforeAll(async () => {
      const res = await post(
        `${GATEWAY}/api/bo/faqs`,
        { question: 'À supprimer ?', lang: 'fr', order: 999 },
        adminToken,
      );
      if (res.ok) {
        const body = await res.json() as any;
        tempId = body.id;
      }
    });

    it('should return 200 when deleting an existing FAQ', async () => {
      if (!tempId) return;
      const res = await del(`${GATEWAY}/api/bo/faqs/${tempId}`, adminToken);
      expect(res.status).toBe(200);
      tempId = '';
    });

    it('should return 404 when deleting a non-existent FAQ', async () => {
      const res = await del(`${GATEWAY}/api/bo/faqs/${NIL_UUID}`, adminToken);
      expect(res.status).toBe(404);
    });
  });

});
