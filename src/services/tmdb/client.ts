import type { TimelineNode, TmdbMediaType, TmdbReference } from '../../types/timeline';

export type TmdbErrorCode = 'not_configured' | 'invalid_request' | 'upstream' | 'invalid_response' | 'not_found' | 'ambiguous';
export class TmdbError extends Error {
  constructor(public readonly code: TmdbErrorCode, message: string, public readonly status?: number) {
    super(message);
    this.name = 'TmdbError';
  }
}
export interface TmdbMedia {
  id: number;
  title: string;
  originalTitle: string;
  releaseDate: string;
  posterPath: string | null;
  backdropPath: string | null;
}
export interface TmdbImages {
  secure_base_url: string;
  poster_sizes: string[];
  backdrop_sizes: string[];
  logo_sizes?: string[];
}
export interface TmdbArtwork extends TmdbReference {
  id: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  logoPath: string | null;
  logoUrl: string | null;
}
const API = 'https://api.themoviedb.org/3/';
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const normalize = (title: string) => title.normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const validId = (id: unknown): id is number => typeof id === 'number' && Number.isSafeInteger(id) && id > 0;

function imagePath(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string' || !/^\/[A-Za-z0-9_.-]+$/.test(value) || value.includes('..')) throw new TmdbError('invalid_response', 'TMDB returned an invalid image path.');
  return value;
}
function parseMedia(value: unknown, type: TmdbMediaType): TmdbMedia {
  if (!object(value) || !validId(value.id) || typeof value[type === 'movie' ? 'title' : 'name'] !== 'string')
    throw new TmdbError('invalid_response', 'TMDB returned invalid media data.');
  return {
    id: value.id, title: value[type === 'movie' ? 'title' : 'name'] as string,
    originalTitle: typeof value[type === 'movie' ? 'original_title' : 'original_name'] === 'string' ? value[type === 'movie' ? 'original_title' : 'original_name'] as string : '',
    releaseDate: typeof value[type === 'movie' ? 'release_date' : 'first_air_date'] === 'string' ? value[type === 'movie' ? 'release_date' : 'first_air_date'] as string : '',
    posterPath: imagePath(value.poster_path), backdropPath: imagePath(value.backdrop_path),
  };
}

/** Uses only image paths returned by TMDB and supported configuration sizes. */
export function buildTmdbImageUrl(images: TmdbImages, path: string | null, kind: 'poster' | 'backdrop' | 'logo', size?: string): string | null {
  if (!path) return null;
  imagePath(path);
  const allowed = kind === 'poster' ? images.poster_sizes : kind === 'backdrop' ? images.backdrop_sizes : images.logo_sizes ?? ['original'];
  const requested = kind === 'logo' && path.endsWith('.svg') ? 'original' : size ?? (kind === 'backdrop' ? 'w1280' : 'w500');
  const chosen = allowed.includes(requested) ? requested : allowed.includes('original') ? 'original' : allowed[0];
  if (!chosen || !/^(?:w\d+|original)$/.test(chosen) || images.secure_base_url !== 'https://image.tmdb.org/t/p/')
    throw new TmdbError('invalid_response', 'TMDB returned invalid image configuration.');
  return `${images.secure_base_url}${chosen}${path}`;
}

/** Framework-free client; instantiate only on the server with a private token. */
export function createTmdbClient({ token, language = 'en-US', fetcher = fetch }: { token: string; language?: string; fetcher?: typeof fetch }) {
  if (!token.trim()) throw new TmdbError('not_configured', 'Set TMDB_READ_ACCESS_TOKEN in .env.local.');
  if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(language)) throw new TmdbError('invalid_request', 'Invalid TMDB language.');
  let configuration: Promise<TmdbImages> | undefined;
  async function request(path: string, params: Record<string, string> = {}): Promise<Record<string, unknown>> {
    const url = new URL(path, API);
    url.search = new URLSearchParams({ language, ...params }).toString();
    let response: Response;
    try {
      response = await fetcher(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
    } catch { throw new TmdbError('upstream', 'TMDB is unavailable.'); }
    if (!response.ok) throw new TmdbError('upstream', `TMDB request failed (${response.status}).`, response.status);
    let data: unknown;
    try { data = await response.json(); } catch { throw new TmdbError('invalid_response', 'TMDB returned invalid JSON.'); }
    if (!object(data)) throw new TmdbError('invalid_response', 'TMDB returned invalid data.');
    return data;
  }
  function checkType(type: TmdbMediaType) {
    if (type !== 'movie' && type !== 'tv') throw new TmdbError('invalid_request', 'Expected movie or tv.');
  }
  async function search(type: TmdbMediaType, title: string, releaseYear?: number): Promise<TmdbMedia[]> {
    checkType(type);
    if (!title.trim()) throw new TmdbError('invalid_request', 'A title is required.');
    const params: Record<string, string> = { query: title, include_adult: 'false' };
    if (releaseYear !== undefined) {
      if (!Number.isInteger(releaseYear) || releaseYear < 1000 || releaseYear > 9999) throw new TmdbError('invalid_request', 'Invalid release year.');
      params[type === 'movie' ? 'primary_release_year' : 'year'] = String(releaseYear);
    }
    const data = await request(`search/${type}`, params);
    if (!Array.isArray(data.results)) throw new TmdbError('invalid_response', 'TMDB returned invalid search results.');
    return data.results.map(item => parseMedia(item, type));
  }
  async function details(type: TmdbMediaType, id: number, season?: number): Promise<TmdbMedia> {
    checkType(type);
    if (!validId(id)) throw new TmdbError('invalid_request', 'Invalid TMDB ID.');
    if (season !== undefined && (type !== 'tv' || !Number.isSafeInteger(season) || season < 0)) throw new TmdbError('invalid_request', 'Invalid TV season.');
    if (season === undefined) return parseMedia(await request(`${type}/${id}`), type);
    const [series, episodeSeason] = await Promise.all([request(`tv/${id}`), request(`tv/${id}/season/${season}`)]);
    const media = parseMedia(series, 'tv');
    return { ...media, posterPath: imagePath(episodeSeason.poster_path) ?? media.posterPath };
  }
  async function logo(type: TmdbMediaType, id: number): Promise<string | null> {
    checkType(type);
    if (!validId(id)) throw new TmdbError('invalid_request', 'Invalid TMDB ID.');
    const locale = language.split('-')[0];
    const data = await request(`${type}/${id}/images`, { include_image_language: [...new Set([locale, 'en', 'null'])].join(',') });
    const candidates = (Array.isArray(data.logos) ? data.logos : []).filter(object).flatMap(item => {
      try {
        const path = imagePath(item.file_path);
        if (!path) return [];
        const lang = typeof item.iso_639_1 === 'string' ? item.iso_639_1 : null;
        return [{ path, rank: lang === locale ? 0 : lang === 'en' ? 1 : lang === null ? 2 : 3,
          score: typeof item.vote_average === 'number' && Number.isFinite(item.vote_average) ? item.vote_average : 0,
          votes: typeof item.vote_count === 'number' && Number.isFinite(item.vote_count) ? item.vote_count : 0 }];
      } catch { return []; }
    });
    candidates.sort((a, b) => a.rank - b.rank || b.score - a.score || b.votes - a.votes || a.path.localeCompare(b.path));
    return candidates[0]?.path ?? null;
  }
  async function getConfiguration(): Promise<TmdbImages> {
    if (!configuration) configuration = request('configuration').then(data => {
      const images = data.images;
      if (!object(images) || images.secure_base_url !== 'https://image.tmdb.org/t/p/' ||
        !Array.isArray(images.poster_sizes) || !Array.isArray(images.backdrop_sizes) ||
        ![...images.poster_sizes, ...images.backdrop_sizes].every(value => typeof value === 'string' && /^(?:w\d+|original)$/.test(value)))
        throw new TmdbError('invalid_response', 'TMDB returned invalid image configuration.');
      return images as unknown as TmdbImages;
    }).catch(error => { configuration = undefined; throw error; });
    return configuration;
  }
  async function resolve(node: Pick<TimelineNode, 'title' | 'releaseYear' | 'tmdb'>): Promise<TmdbArtwork> {
    if (!node.tmdb) throw new TmdbError('invalid_request', 'This node has no TMDB reference.');
    const { mediaType, season } = node.tmdb;
    let id = node.tmdb.id;
    if (id === undefined) {
      const results = await search(mediaType, node.title, node.releaseYear);
      const matches = results.filter(item => (normalize(item.title) === normalize(node.title) || normalize(item.originalTitle) === normalize(node.title)) &&
        (node.releaseYear === undefined || (mediaType === 'tv' && season !== undefined) || item.releaseDate.startsWith(`${node.releaseYear}-`)));
      if (!matches.length) throw new TmdbError('not_found', 'No exact TMDB title and release-year match. Set an explicit tmdb.id.');
      if (matches.length > 1) throw new TmdbError('ambiguous', 'Multiple TMDB matches. Set an explicit tmdb.id.');
      id = matches[0].id;
    }
    const [media, images, logoPath] = await Promise.all([details(mediaType, id, season), getConfiguration(),
      logo(mediaType, id).catch(error => {
        // Optional title artwork must not prevent posters from loading.
        if (error instanceof TmdbError && error.code === 'upstream') return null;
        throw error;
      }),
    ]);
    return { mediaType, id, ...(season !== undefined ? { season } : {}), title: media.title,
      posterPath: media.posterPath, backdropPath: media.backdropPath,
      posterUrl: buildTmdbImageUrl(images, media.posterPath, 'poster'),
      backdropUrl: buildTmdbImageUrl(images, media.backdropPath, 'backdrop'),
      logoPath, logoUrl: buildTmdbImageUrl(images, logoPath, 'logo'),
    };
  }
  return { search, details, logo, getConfiguration, resolve };
}
