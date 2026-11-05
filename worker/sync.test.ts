import { describe, expect, it } from 'vitest';
import { handleSync, MAX_BODY, type Env } from './sync';

function fakeEnv(): Env {
  const m = new Map<string, string>();
  const kv = {
    get: async (k: string) => m.get(k) ?? null,
    put: async (k: string, v: string) => void m.set(k, v),
  };
  return { SYNC: kv as unknown as KVNamespace, ASSETS: {} as Fetcher };
}
const code = 'a'.repeat(32);
const req = (method: string, body?: string) => new Request(`https://x/api/sync/${code}`, { method, body, headers: { 'content-type': 'application/json' } });

describe('worker sync API', () => {
  it('round-trips a progress object', async () => {
    const env = fakeEnv();
    expect((await handleSync(req('GET'), env, code)).status).toBe(404);
    expect((await handleSync(req('PUT', '{"v":1,"courses":{}}'), env, code)).status).toBe(204);
    const res = await handleSync(req('GET'), env, code);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ v: 1, courses: {} });
  });
  it('validates input', async () => {
    const env = fakeEnv();
    expect((await handleSync(req('GET'), env, 'nothex')).status).toBe(400);
    expect((await handleSync(req('PUT', 'not json'), env, code)).status).toBe(400);
    expect((await handleSync(req('PUT', '{"x":1}'), env, code)).status).toBe(400);
    expect((await handleSync(req('PUT', JSON.stringify({ courses: {}, pad: 'x'.repeat(MAX_BODY) })), env, code)).status).toBe(413);
    expect((await handleSync(req('DELETE'), env, code)).status).toBe(405);
  });
});
