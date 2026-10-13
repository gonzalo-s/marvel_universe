import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { setImmediate } from 'node:timers/promises';
const require = createRequire(import.meta.url);
const { loadArtwork, getCachedArtwork } = require(join(process.env.TIMELINE_CHECK_DIR, 'services/tmdb/artwork-client.js'));

test('timeline and panel share requests, cap concurrent fetches and reuse successful artwork', async () => {
  const original = globalThis.fetch;
  const calls = []; let active = 0, maximum = 0;
  globalThis.fetch = url => new Promise(resolve => {
    active++; maximum = Math.max(maximum, active);
    calls.push({ url, finish: () => { active--; resolve(Response.json({ title: url, logoUrl: null, posterUrl: null })); } });
  });
  try {
    const first = loadArtwork('shared-a');
    assert.equal(loadArtwork('shared-a'), first);
    const rest = ['shared-b','shared-c','shared-d','shared-e','shared-f'].map(loadArtwork);
    assert.equal(calls.length, 4);
    calls.slice(0,4).forEach(call => call.finish()); await setImmediate();
    assert.equal(calls.length, 6);
    calls.slice(4).forEach(call => call.finish());
    await Promise.all([first, ...rest]); await setImmediate();
    assert.equal(maximum, 4);
    assert.ok(getCachedArtwork('shared-a'));
    await loadArtwork('shared-a'); assert.equal(calls.length, 6);
  } finally { globalThis.fetch = original; }
});
test('failed artwork requests can be retried and are not cached as success', async () => {
  const original = globalThis.fetch; let count = 0;
  globalThis.fetch = async () => ++count === 1 ? Response.json({}, { status: 503 }) : Response.json({ title: 'Recovered' });
  try {
    await assert.rejects(loadArtwork('retry-work'), error => error.status === 503); await setImmediate();
    assert.equal(getCachedArtwork('retry-work'), undefined);
    assert.equal((await loadArtwork('retry-work')).title, 'Recovered');
    assert.equal(count, 2);
  } finally { globalThis.fetch = original; }
});
