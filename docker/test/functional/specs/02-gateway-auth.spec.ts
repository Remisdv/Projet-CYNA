import { post, GATEWAY } from '../helpers/api';

describe('Gateway — Auth endpoints', () => {

  let refreshToken: string | undefined;

  describe('POST /api/bo/auth/login', () => {
    it('should return 200 with tokens for valid credentials', async () => {
      const res = await post(`${GATEWAY}/api/bo/auth/login`, {
        email: 'admin@cyna.fr',
        password: 'TempPassword123!',
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body).toHaveProperty('access_token');
      expect(body).toHaveProperty('refresh_token');
      expect(body).toHaveProperty('user');
      expect(body.user.email).toBe('admin@cyna.fr');
      refreshToken = body.refresh_token;
    });

    it('should return 401 for invalid password', async () => {
      const res = await post(`${GATEWAY}/api/bo/auth/login`, {
        email: 'admin@cyna.fr',
        password: 'wrong-password',
      });
      expect(res.status).toBe(401);
    });

    it('should return 401 for non-existent user', async () => {
      const res = await post(`${GATEWAY}/api/bo/auth/login`, {
        email: 'nobody@cyna.fr',
        password: 'TempPassword123!',
      });
      expect(res.status).toBe(401);
    });

    it('should return 400 for missing email', async () => {
      const res = await post(`${GATEWAY}/api/bo/auth/login`, {
        password: 'TempPassword123!',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/bo/auth/refresh', () => {
    it('should return 200 with new tokens for valid refresh_token', async () => {
      if (!refreshToken) {
        console.warn('Skipping refresh test: no refresh token from login');
        return;
      }
      const res = await post(`${GATEWAY}/api/bo/auth/refresh`, {
        refresh_token: refreshToken,
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body).toHaveProperty('access_token');
    });

    it('should return 401 for an invalid refresh_token', async () => {
      const res = await post(`${GATEWAY}/api/bo/auth/refresh`, {
        refresh_token: 'this.is.not.a.valid.token',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/bo/auth/logout', () => {
    it('should return 200 on logout', async () => {
      const res = await post(`${GATEWAY}/api/bo/auth/logout`, {});
      expect(res.status).toBe(200);
    });
  });

});
