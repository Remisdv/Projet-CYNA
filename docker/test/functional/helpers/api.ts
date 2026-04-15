// HTTP helpers using Node 20 built-in fetch

export const GATEWAY = process.env.GATEWAY_URL ?? 'http://cyna-test-gateway-api:3000';
export const BO_API = process.env.BO_API_URL ?? 'http://cyna-test-bo-api:3000';
export const SERVICE_API = process.env.SERVICE_API_URL ?? 'http://cyna-test-service-api:3000';
export const WEBAPP_API = process.env.WEBAPP_API_URL ?? 'http://cyna-test-webapp-api:3000';

function headers(token?: string): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export async function get(url: string, token?: string): Promise<Response> {
  return fetch(url, { headers: headers(token) });
}

export async function post(url: string, body: unknown, token?: string): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(body),
  });
}

export async function put(url: string, body: unknown, token?: string): Promise<Response> {
  return fetch(url, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(body),
  });
}

export async function patch(url: string, body?: unknown, token?: string): Promise<Response> {
  return fetch(url, {
    method: 'PATCH',
    headers: headers(token),
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function del(url: string, token?: string): Promise<Response> {
  return fetch(url, { method: 'DELETE', headers: headers(token) });
}

export function uid(): string {
  return Date.now().toString(36);
}
