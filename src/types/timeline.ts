export type NodeKind = 'work' | 'event';

export type ConnectionType = 'sequence' | 'branch' | 'transition';

export interface Connection {
  targetId: string;
  type: ConnectionType;
  label?: string;
}

/** Logical grid position. year is a visual anchor, not always a factual date. */
export interface Position {
  year: number;
  order: number;
  row: number;
}

export type TmdbMediaType = 'movie' | 'tv';

/** Optional editorial reference; IDs and image fields may be populated later. */
export interface TmdbReference {
  mediaType: TmdbMediaType;
  id?: number;
  /** TV season number; zero denotes specials. */
  season?: number;
  posterPath?: string | null;
  backdropPath?: string | null;
  logoPath?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  logoUrl?: string | null;
}

export interface NodeTheme {
  primary: string;
  accent: string;
}

export interface TimelineNode {
  id: string;
  /** Classifies this node independently of its related workId. */
  kind: NodeKind;
  title: string;
  description?: string;
  workId?: string;
  releaseYear?: number;
  /** Displayed story period; ranges/approximations need not equal the layout anchor. */
  storyPeriod?: string;
  tmdb?: TmdbReference;
  theme?: NodeTheme;
  position: Position;
  connections: Connection[];
}

/** One logical narrative track; not necessarily a separate universe. */
export interface TimelineRow {
  id: number;
  name: string;
  description?: string;
}

export interface TimelineData {
  rows: TimelineRow[];
  nodes: TimelineNode[];
}
