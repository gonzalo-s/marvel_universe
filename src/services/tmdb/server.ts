import 'server-only';
import { createTmdbClient } from './client';

/** Keep credentials in server environment variables, never NEXT_PUBLIC_*. */
export function getTmdbService() {
  return createTmdbClient({
    token: process.env.TMDB_READ_ACCESS_TOKEN ?? '',
    language: process.env.TMDB_LANGUAGE ?? 'en-US',
    fetcher: (input, init) => fetch(input, { ...init, next: { revalidate: 86400 } }),
  });
}
