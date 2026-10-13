import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

// Compile only pure data/helpers with the project's installed TypeScript.
// No runtime dependency or alternate schema is needed.
const directory = mkdtempSync(join(tmpdir(), 'marvel-timeline-'));
try {
  const compiled = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc',
    '--outDir', directory, '--module', 'commonjs', '--target', 'es2020',
    '--strict', '--skipLibCheck', 'src/data/timeline.ts', 'src/lib/timeline.ts', 'src/lib/camera.ts', 'src/lib/filterGraph.ts', 'src/lib/selectionConnections.ts', 'src/services/tmdb/client.ts', 'src/services/tmdb/artwork-client.ts'], { stdio: 'inherit' });
  if (compiled.status !== 0) process.exitCode = compiled.status ?? 1;
  else {
    const require = createRequire(import.meta.url);
    const { timeline } = require(join(directory, 'data/timeline.js'));
    const { assertTimeline } = require(join(directory, 'lib/validateTimeline.js'));
    assertTimeline(timeline);
    console.log(`Valid timeline: ${timeline.nodes.length} nodes, ${timeline.nodes.reduce((n, node) => n + node.connections.length, 0)} connections, ${timeline.rows.length} rows`);
    if (process.argv.includes('--test')) {
      const result = spawnSync(process.execPath, ['--test', '--test-isolation=none', 'tests/timeline.test.mjs', 'tests/camera.test.mjs', 'tests/tmdb.test.mjs', 'tests/artwork-client.test.mjs'], {
        stdio: 'inherit', env: { ...process.env, TIMELINE_CHECK_DIR: directory },
      });
      process.exitCode = result.status ?? 1;
    }
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
