import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const { createTmdbClient, buildTmdbImageUrl, TmdbError } = require(join(process.env.TIMELINE_CHECK_DIR, 'services/tmdb/client.js'));
const images = { secure_base_url: 'https://image.tmdb.org/t/p/', poster_sizes: ['w500','original'], backdrop_sizes: ['w1280','original'] };
const movie = { id: 42, title: 'Example Movie', original_title: 'Example Movie', release_date: '2011-07-01', poster_path: '/poster.jpg', backdrop_path: '/backdrop.jpg' };
function fixture(handler) {
  const calls = [];
  const fetcher = async (input, init) => {
    const url = new URL(String(input)); calls.push({ url, init });
    const response = await handler(url, init);
    return response instanceof Response ? response : Response.json(response);
  };
  return { client: createTmdbClient({ token: 'private-test-token', fetcher }), calls };
}
const configuration = { images };
const node = { title: 'Example Movie', releaseYear: 2011, tmdb: { mediaType: 'movie' } };

test('unresolved movie searches using release year, sends private bearer header and builds real image URLs', async () => {
  const { client, calls } = fixture(url => url.pathname.endsWith('/configuration') ? configuration : url.pathname.includes('/search/') ? { results: [movie] } : movie);
  const result = await client.resolve(node);
  assert.equal(result.id, 42);
  assert.equal(result.posterUrl, 'https://image.tmdb.org/t/p/w500/poster.jpg');
  assert.equal(result.backdropUrl, 'https://image.tmdb.org/t/p/w1280/backdrop.jpg');
  assert.equal(calls[0].url.searchParams.get('primary_release_year'), '2011');
  assert.equal(calls[0].url.searchParams.get('query'), 'Example Movie');
  for (const call of calls) {
    assert.equal(call.init.headers.Authorization, 'Bearer private-test-token');
    assert.equal(call.url.hostname, 'api.themoviedb.org');
    assert.ok(!call.url.toString().includes('private-test-token'));
  }
});
test('explicit IDs bypass search and configuration is reused within the client', async () => {
  const { client, calls } = fixture(url => url.pathname.endsWith('/configuration') ? configuration : movie);
  const known = { ...node, tmdb: { mediaType: 'movie', id: 42 } };
  await client.resolve(known); await client.resolve(known);
  assert.ok(calls.every(call => !call.url.pathname.includes('/search/')));
  assert.equal(calls.filter(call => call.url.pathname.endsWith('/configuration')).length, 1);
});
test('missing posters/backdrops stay null and do not create invented URLs', async () => {
  const { client } = fixture(url => url.pathname.endsWith('/configuration') ? configuration : { ...movie, poster_path: null, backdrop_path: null });
  const result = await client.resolve({ ...node, tmdb: { mediaType: 'movie', id: 42 } });
  assert.equal(result.posterPath, null); assert.equal(result.posterUrl, null); assert.equal(result.backdropUrl, null);
});
test('missing token and invalid references fail before making requests', async () => {
  assert.throws(() => createTmdbClient({ token: '' }), error => error.code === 'not_configured');
  const { client, calls } = fixture(() => movie);
  for (const ref of [{ mediaType: 'movie', id: -2 }, { mediaType: 'collection', id: 2 }, { mediaType: 'movie', id: 2, season: 1 }])
    await assert.rejects(client.details(ref.mediaType, ref.id, ref.season), error => error.code === 'invalid_request');
  assert.equal(calls.length, 0);
});
test('ambiguous and missing matches are explicit errors instead of taking the first result', async () => {
  for (const [results, code] of [[[], 'not_found'], [[movie, { ...movie, id: 43 }], 'ambiguous'], [[{ ...movie, release_date: '2012-01-01' }], 'not_found']]) {
    const { client } = fixture(() => ({ results }));
    await assert.rejects(client.resolve(node), error => error instanceof TmdbError && error.code === code);
  }
});
test('TV season resolves its own poster, keeps the series backdrop and searches episode year', async () => {
  const series = { id: 88, name: 'Example Show', original_name: 'Example Show', first_air_date: '2021-01-01', poster_path: '/series.jpg', backdrop_path: '/series-bg.jpg' };
  const { client, calls } = fixture(url => url.pathname.includes('/search/') ? { results: [series] } : url.pathname.endsWith('/configuration') ? configuration : url.pathname.includes('/season/') ? { poster_path: '/season.jpg' } : series);
  const result = await client.resolve({ title: 'Example Show', releaseYear: 2023, tmdb: { mediaType: 'tv', season: 2 } });
  assert.equal(result.id, 88); assert.equal(result.season, 2); assert.equal(result.posterPath, '/season.jpg'); assert.equal(result.backdropPath, '/series-bg.jpg');
  assert.equal(calls[0].url.searchParams.get('year'), '2023');
  assert.ok(calls.some(call => call.url.pathname === '/3/tv/88/season/2'));
});
test('upstream 404/429/500 and malformed JSON are sanitized without leaking tokens', async () => {
  for (const status of [404,429,500]) {
    const { client } = fixture(() => Response.json({ secret: 'private-test-token' }, { status }));
    await assert.rejects(client.details('movie', 42), error => error.code === 'upstream' && error.status === status && !error.message.includes('private-test-token'));
  }
  const { client } = fixture(() => new Response('not-json', { status: 200 }));
  await assert.rejects(client.details('movie', 42), error => error.code === 'invalid_response');
  const network = createTmdbClient({ token: 'private-test-token', fetcher: async () => { throw new Error('private-test-token'); } });
  await assert.rejects(network.details('movie', 42), error => error.code === 'upstream' && !error.message.includes('private-test-token'));
});
test('invalid image paths and configuration are rejected and configuration errors can be retried', async () => {
  assert.throws(() => buildTmdbImageUrl(images, '/../../secret', 'poster'), error => error.code === 'invalid_response');
  assert.equal(buildTmdbImageUrl(images, '/poster.jpg', 'poster', 'unsupported'), 'https://image.tmdb.org/t/p/original/poster.jpg');
  let count = 0;
  const { client } = fixture(() => ++count === 1 ? { images: { ...images, secure_base_url: 'http://unsafe.test/' } } : configuration);
  await assert.rejects(client.getConfiguration(), error => error.code === 'invalid_response');
  assert.deepEqual(await client.getConfiguration(), images);
});

test('title logos prefer requested language and quality and use original size for SVG', async () => {
  const { client, calls } = fixture(url => url.pathname.endsWith('/configuration') ? configuration : url.pathname.endsWith('/images') ? { logos: [
    { file_path: '/neutral.png', iso_639_1: null, vote_average: 10 },
    { file_path: '/english.png', iso_639_1: 'en', vote_average: 4 },
    { file_path: '/title.svg', iso_639_1: 'en', vote_average: 9, vote_count: 3 },
    { file_path: '/../../unsafe', iso_639_1: 'en', vote_average: 20 },
  ] } : movie);
  const result = await client.resolve({ ...node, tmdb: { mediaType: 'movie', id: 42 } });
  assert.equal(result.logoPath, '/title.svg');
  assert.equal(result.logoUrl, 'https://image.tmdb.org/t/p/original/title.svg');
  assert.equal(calls.find(call => call.url.pathname.endsWith('/images')).url.searchParams.get('include_image_language'), 'en,null');
});
test('missing logos and optional logo endpoint failures preserve poster artwork', async () => {
  for (const response of [{ logos: [] }, Response.json({}, { status: 500 })]) {
    const { client } = fixture(url => url.pathname.endsWith('/configuration') ? configuration : url.pathname.endsWith('/images') ? response : movie);
    const result = await client.resolve({ ...node, tmdb: { mediaType: 'movie', id: 42 } });
    assert.equal(result.logoUrl, null);
    assert.equal(result.posterUrl, 'https://image.tmdb.org/t/p/w500/poster.jpg');
  }
});
