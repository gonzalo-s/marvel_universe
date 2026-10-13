import { timeline } from '@/data/timeline';
import { getTmdbService } from '@/services/tmdb/server';
import { TmdbError } from '@/services/tmdb/client';

/** Only timeline references can be fetched; this is not an open TMDB proxy. */
export async function GET(_request: Request, { params }: { params: Promise<{ nodeId: string }> }) {
  const { nodeId } = await params;
  const node = timeline.nodes.find(item => item.id === nodeId);
  if (!node) return Response.json({ error: 'unknown_node', message: 'Unknown timeline node.' }, { status: 404 });
  const owner = 'tmdb' in node ? node : node.workId ? timeline.nodes.find(item => item.kind === 'work' && item.workId === node.workId && 'tmdb' in item) : undefined;
  if (!owner || !('tmdb' in owner)) return Response.json({ error: 'missing_reference', message: 'No TMDB reference for this node.' }, { status: 404 });
  try {
    const artwork = await getTmdbService().resolve(owner);
    return Response.json(artwork);
  } catch (error) {
    if (error instanceof TmdbError) {
      const status = error.code === 'not_configured' ? 503 : error.code === 'not_found' ? 404 : error.code === 'ambiguous' ? 409 : error.code === 'invalid_request' ? 400 : 502;
      return Response.json({ error: error.code, message: error.message }, { status });
    }
    return Response.json({ error: 'internal_error', message: 'Unable to load TMDB artwork.' }, { status: 500 });
  }
}
