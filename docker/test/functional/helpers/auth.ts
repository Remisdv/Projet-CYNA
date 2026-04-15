// JWT token generation for gateway protected endpoint tests
// Uses the same algorithm as cyna-gateway-api/src/common/guard/jwt-auth.guard.ts

import crypto from 'crypto';
import { GATEWAY, post } from './api';

const JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret-change-this';

/**
 * Generates a valid admin JWT token directly (without going through login flow).
 * Uses the same HMAC-SHA256 signing as the gateway's JWT guard.
 */
export function createAdminToken(): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: '00000000-test-0000-0000-000000000001',
      email: 'admin@test.local',
      role: 'ADMIN',
      firstName: 'Test',
      lastName: 'Admin',
      type: 'bo',
      exp: Math.floor(Date.now() / 1000) + 86400,
    }),
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

/**
 * Logs in via gateway and returns access_token (requires seeded users).
 */
export async function loginAsAdmin(): Promise<string | null> {
  try {
    const res = await post(`${GATEWAY}/api/bo/auth/login`, {
      email: 'admin@cyna.fr',
      password: 'TempPassword123!',
    });
    if (!res.ok) return null;
    const json = await res.json() as { access_token: string };
    return json.access_token;
  } catch {
    return null;
  }
}
