/** Worker entry: only the default export may live here (named exports become entrypoints). */
import { handleSync, type Env } from './sync';

const notFound = () => new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: { 'content-type': 'application/json' } });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/api\/sync\/([^/]+)$/);
    if (m) return handleSync(request, env, m[1]);
    if (url.pathname.startsWith('/api/')) return notFound();
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
