import type { TimelineData } from '../types/timeline';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Checks structure and cross references; does not verify historical/canon truth. */
export function validateTimeline(data: unknown): ValidationResult {
  const errors: string[] = [];
  const object = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
  const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
  const integer = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value);
  const nonnegative = (value: unknown) => integer(value) && value >= 0;
  const error = (path: string, message: string) => errors.push(`${path}: ${message}`);
  const keys = (value: Record<string, unknown>, allowed: string[], path: string) => {
    for (const key of Object.keys(value)) if (!allowed.includes(key)) error(`${path}.${key}`, 'unknown field');
  };
  if (!object(data)) return { valid: false, errors: ['data: expected an object'] };
  keys(data, ['rows', 'nodes'], 'data');
  if (!Array.isArray(data.rows) || data.rows.length === 0) error('rows', 'expected a nonempty array');
  if (!Array.isArray(data.nodes)) error('nodes', 'expected an array');
  if (!Array.isArray(data.rows) || !Array.isArray(data.nodes)) return { valid: false, errors };
  const rowIds = new Set<number>();
  const nodeIds = new Set<string>();
  data.rows.forEach((row: unknown, i: number) => {
    const path = `rows[${i}]`;
    if (!object(row)) { error(path, 'expected an object'); return; }
    keys(row, ['id', 'name', 'description'], path);
    if (!nonnegative(row.id)) error(`${path}.id`, 'expected a nonnegative safe integer');
    else if (rowIds.has(row.id as number)) error(`${path}.id`, 'duplicate row ID');
    else rowIds.add(row.id as number);
    if (!text(row.name)) error(`${path}.name`, 'expected a nonempty string');
    if (row.description !== undefined && typeof row.description !== 'string') error(`${path}.description`, 'expected a string');
  });
  data.nodes.forEach((node: unknown, i: number) => {
    const path = `nodes[${i}]`;
    if (!object(node)) { error(path, 'expected an object'); return; }
    keys(node, ['id', 'kind', 'title', 'description', 'workId', 'releaseYear', 'storyPeriod', 'position', 'connections', 'tmdb', 'theme'], path);
    if (!text(node.id)) error(`${path}.id`, 'expected a nonempty string');
    else if (nodeIds.has(node.id as string)) error(`${path}.id`, 'duplicate node ID');
    else nodeIds.add(node.id as string);
    if (node.kind !== 'work' && node.kind !== 'event') error(`${path}.kind`, 'expected work or event');
    if (!text(node.title)) error(`${path}.title`, 'expected a nonempty string');
    if (node.description !== undefined && typeof node.description !== 'string') error(`${path}.description`, 'expected a string');
    if (node.workId !== undefined && !text(node.workId)) error(`${path}.workId`, 'expected a nonempty string');
    if (node.releaseYear !== undefined && !integer(node.releaseYear)) error(`${path}.releaseYear`, 'expected a safe integer');
    if (node.storyPeriod !== undefined && (typeof node.storyPeriod !== 'string' || !node.storyPeriod.trim())) error(`${path}.storyPeriod`, 'expected a non-empty string');
    if (node.tmdb !== undefined) {
      if (!object(node.tmdb)) error(`${path}.tmdb`, 'expected an object');
      else {
        const tmdb = node.tmdb;
        keys(tmdb, ['mediaType', 'id', 'season', 'posterPath', 'backdropPath', 'posterUrl', 'backdropUrl', 'logoPath', 'logoUrl'], `${path}.tmdb`);
        if (tmdb.mediaType !== 'movie' && tmdb.mediaType !== 'tv') error(`${path}.tmdb.mediaType`, 'expected movie or tv');
        if (tmdb.id !== undefined && (!integer(tmdb.id) || tmdb.id <= 0)) error(`${path}.tmdb.id`, 'expected a positive safe integer');
        if (tmdb.season !== undefined && (!nonnegative(tmdb.season) || tmdb.mediaType !== 'tv')) error(`${path}.tmdb.season`, 'expected a nonnegative TV season number');
        for (const field of ['posterPath', 'backdropPath', 'logoPath']) {
          const value = tmdb[field];
          if (value !== undefined && value !== null && (typeof value !== 'string' || !/^\/[A-Za-z0-9_.-]+$/.test(value) || value.includes('..')))
            error(`${path}.tmdb.${field}`, 'expected a TMDB image file path or null');
        }
        for (const field of ['posterUrl', 'backdropUrl', 'logoUrl']) {
          const value = tmdb[field];
          if (value !== undefined && value !== null) {
            try {
              const url = new URL(value as string);
              if (typeof value !== 'string' || url.protocol !== 'https:' || url.hostname !== 'image.tmdb.org' || !url.pathname.startsWith('/t/p/') || url.username || url.password || url.search || url.hash) throw new Error();
            } catch { error(`${path}.tmdb.${field}`, 'expected an HTTPS TMDB image URL or null'); }
          }
        }
      }
    }
    if (node.theme !== undefined) {
      if (!object(node.theme)) error(`${path}.theme`, 'expected an object');
      else {
        keys(node.theme, ['primary', 'accent'], `${path}.theme`);
        for (const field of ['primary', 'accent'])
          if (typeof node.theme[field] !== 'string' || !/^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(node.theme[field] as string))
            error(`${path}.theme.${field}`, 'expected a hex color');
      }
    }
    if (!object(node.position)) error(`${path}.position`, 'expected an object');
    else {
      keys(node.position, ['year', 'order', 'row'], `${path}.position`);
      if (!integer(node.position.year)) error(`${path}.position.year`, 'expected a safe integer');
      if (!nonnegative(node.position.order)) error(`${path}.position.order`, 'expected a nonnegative safe integer');
      if (!nonnegative(node.position.row)) error(`${path}.position.row`, 'expected a nonnegative safe integer');
      else if (!rowIds.has(node.position.row as number)) error(`${path}.position.row`, 'unknown row ID');
    }
    if (!Array.isArray(node.connections)) error(`${path}.connections`, 'expected an array');
    else node.connections.forEach((connection: unknown, j: number) => {
      const cp = `${path}.connections[${j}]`;
      if (!object(connection)) { error(cp, 'expected an object'); return; }
      keys(connection, ['targetId', 'type', 'label'], cp);
      if (!text(connection.targetId)) error(`${cp}.targetId`, 'expected a nonempty string');
      if (!['sequence', 'branch', 'transition'].includes(connection.type as string)) error(`${cp}.type`, 'unknown connection type');
      if (connection.label !== undefined && typeof connection.label !== 'string') error(`${cp}.label`, 'expected a string');
    });
  });
  data.nodes.forEach((node: unknown, i: number) => {
    if (!object(node) || !Array.isArray(node.connections)) return;
    node.connections.forEach((connection: unknown, j: number) => {
      if (object(connection) && text(connection.targetId) && !nodeIds.has(connection.targetId as string))
        error(`nodes[${i}].connections[${j}].targetId`, 'unknown node ID');
    });
  });
  return { valid: errors.length === 0, errors };
}

export function assertTimeline(data: unknown): asserts data is TimelineData {
  const result = validateTimeline(data);
  if (!result.valid) throw new Error(`Invalid timeline data:\n${result.errors.join('\n')}`);
}
