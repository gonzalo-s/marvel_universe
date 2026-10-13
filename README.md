# Marvel timeline explorer

Next.js prototype using React Three Fiber and Drei. The supplied slice contains 68 nodes (38 works and 30 events), 78 connections and nine narrative rows. Contains spoilers; it is not a complete or authoritative Marvel chronology.

## Architecture

The UI follows atomic design, with Next.js routes providing the page layer:

| Layer | Location | Responsibility |
| --- | --- | --- |
| Atoms | `src/components/atoms` | Buttons, inputs, images, markers and zoom readouts |
| Molecules | `src/components/molecules` | Labeled controls, artwork states, node views and connections |
| Organisms | `src/components/organisms` | Header, toolbar, graph scene, detail panel, fallback and footer |
| Templates | `src/components/templates` | Explorer composition and layout slots |
| Pages | `src/app` | Route entry points and server API handlers |

Components depend on their own layer or lower layers. ESLint prevents imports from higher layers. Atoms have no data fetching or domain state. `src/hooks` owns navigation and artwork lifecycles without importing UI components; `src/lib`, `src/types`, `src/data` and `src/services` remain shared domain modules. TMDB credentials and its server integration stay behind the API route. The WebGL scene remains dynamically loaded in the browser. Shared visual styles live in `src/app/globals.css`.

Import components directly from their layer rather than through a cross-layer barrel. Add reusable primitives to atoms, group them into molecules, and compose feature sections as organisms. Templates arrange those sections; pages supply route data.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. Use the mouse wheel or horizontal trackpad scrolling to move right/left through the timeline; drag the graph horizontally or vertically with the mouse or touch, or use its native horizontal scrollbar. Vertical dragging is bounded to the graph and uses the current zoom scale. The viewport and panels stay fixed. Node titles are shown with larger markers (blue for works, gold for events). Ctrl+wheel over the map zooms from 10% to 200% around the pointer, suppressing native browser page zoom within the map. The header displays the current zoom percentage. Use the row selector to reach the other narrative tracks; it brings the nearest event in that row into view. Search and select an event to navigate to it without changing zoom. Reset returns to the first track and beginning of the content. The detail panel scrolls independently.

## Edit the graph

Edit `src/data/timeline.ts`. Changes update the graph after rebuild/deployment (or through development hot reload). The file uses `satisfies TimelineData`; `src/types/timeline.ts` defines the single contract.

- Rows have numeric IDs, names and optional descriptions. Sparse row IDs are references, not array indices.
- Optional `tmdb` references hold `mediaType`, an ID, a TV season number, image paths and resolved image URLs. Optional `theme` metadata holds curated primary/accent hex colors.
- Nodes have a required `kind: "work" | "event"`, IDs, titles, optional descriptions/work IDs/release years, logical `{ year, order, row }` positions and outgoing connections.
- `kind` describes the node itself; `workId` identifies its related movie or season. Events can have a `workId`. The Mostrar filter displays works, events or both. Filtering preserves positions and scroll bounds, hides connections unless both endpoints are visible, and applies to search, related nodes and the fallback list.
- Connections refer to target IDs and use `sequence`, `branch` or `transition`. Detailed meaning remains in their labels. No connections are inferred.
- Unique `(year, order)` pairs become evenly spaced columns across all rows. Array order does not affect placement. Events sit eight world units below their narrative row’s work band. Same-cell events stack downward in ID order with at least eight world units between centers and retain their column; columns have twelve world units of spacing, and row spacing expands to contain the largest stack.
- `position.year` is a visual anchor, distinct from the release year. Read descriptions for approximate dates and outside-time contexts such as the TVA.

`layoutTimeline` is the supplied pure helper. `resolveGraph` adds generic display stacking, shared connection routing/styles and padded bounds. `routeConnections` keeps neighboring events on short curves and routes longer connections through distinct angled gutter ports and separated, gently sloped corridors. Overlapping trunks use different lanes and avoid node/title regions. Selecting a node highlights its incoming/outgoing connections and dims the rest. Backward connections, cycles, nested branches and independent rows are allowed. Nodes and connections share one scene group. The camera uses a fixed reading scale, independent of viewport or graph size. Columns are 432 pixels apart at default zoom; the wider overview scales markers down while enlarging and staggering film title artwork. The native scroll extent derives from graph bounds, including route controls and padding; adding nodes extends the content instead of shrinking it.

## Checks

```bash
npm run validate:timeline
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The build runs dataset validation first and fails with actionable field paths. The checker uses the installed TypeScript compiler and a temporary output directory; it adds no runtime dependency or parallel JSON Schema. Tests cover counts, array reordering, data-only additions, sparse/empty rows, shared columns, same-cell stacking, moved endpoints, backward transitions, cycles, invalid references/positions and desktop/mobile scale, scroll distance, center preservation during zoom/resize and navigation limits.

If a sandbox blocks Turbopack's internal local port, production verification can use `npm run build -- --webpack`.

## Limits

Every title is displayed at a readable scale; horizontal scrolling explores the finite dataset as one continuous canvas. Node markers use one DOM layer, without horizontal guide lines. Labels stay below markers and behind their layer. Long connection labels appear in the detail panel and WebGL fallback list. Crossings between routes remain possible, especially in the overview, but long connections no longer share the same diagonal arcs. The simplified model retains one primary work ID per event and keeps approximate dates and additional appearances in descriptions. Structured evidence and machine-readable overlap/causality semantics are outside this runtime contract; the handoff retains provenance for editorial review. No CMS or live timeline-data loading is included.

The scene loads only in the browser and provides an HTML event/connection list if WebGL fails. Reduced-motion preferences disable camera easing. Browser interaction checks cover desktop/mobile, wheel scrolling, Ctrl+wheel zoom, selection and row navigation.


## TMDB service

Copy `.env.example` to `.env.local` and set `TMDB_READ_ACCESS_TOKEN` to your TMDB API Read Access Token. `TMDB_LANGUAGE` defaults to `en-US`. Restart the dev server after changing environment variables. Keep the credential server-side; do not use a `NEXT_PUBLIC_` variable.

`src/services/tmdb/server.ts` exposes `getTmdbService()` for server code. The service uses native fetch, a ten-second request timeout and Next.js caching with daily revalidation. Its framework-free client is in `src/services/tmdb/client.ts` and provides `search`, `details`, `getConfiguration` and `resolve`. Movie and TV references are supported; a TV reference can include a season number (including specials at zero).

Call `GET /api/tmdb/film-event-thunderbolts` or another current timeline node ID. The endpoint resolves the node's own reference, or a linked work's reference via `workId`, and returns public `id`, `mediaType`, title, poster/backdrop paths and URLs, plus a title-logo path and URL when available. It never accepts an arbitrary upstream URL or exposes the API token. Known IDs use details directly. References without IDs use the title and **release year**, not the story anchor. Only a unique exact title/year match is accepted; missing or ambiguous matches require an explicit `tmdb.id` rather than a guessed result. For later TV seasons, search uses the episode year and the resolved series ID.

Image URLs combine TMDB's returned configuration with actual file paths; absent images remain `null`. Season-specific posters fall back to the series poster when unavailable. Failures return structured codes: `not_configured` (503), `unknown_node`/`missing_reference`/`not_found` (404), `ambiguous` (409), `invalid_request` (400), and upstream/invalid-response errors (502). The server catches unexpected errors without exposing internal details.

The timeline uses title-logo artwork for work nodes near the viewport; missing or failed logos fall back to text. Event nodes retain their descriptive text. The selection panel displays the poster and related details. Timeline and panel share an in-flight request/session cache, with at most four artwork requests active at once. Loading/error states do not interrupt event details; retry is available for transient errors. Old selection responses are ignored, successful results are cached for the session, and old images never carry over to a new node. Logos prefer the configured language, then English or untagged artwork. Missing logos keep the text title. SVG logos in the timeline load as external images without passing through the image optimizer. Writing resolved metadata back into the authored dataset remains a separate future step. The timeline does not require an API token to render or build. Tests use mocked HTTP responses; live TMDB calls require the configured token.

References: [TMDB application authentication](https://developer.themoviedb.org/docs/authentication-application), [image URL construction](https://developer.themoviedb.org/docs/image-basics), [movie search](https://developer.themoviedb.org/reference/search-movie), [TV search](https://developer.themoviedb.org/reference/search-tv), [season details](https://developer.themoviedb.org/reference/tv-season-details).


## Scene appearance

The scene uses the Claro appearance with fog density **0.1** and depth **2.8**. The fixed settings live in `src/types/scene-settings.ts`; there is no configurator. Environmental animation is off, with automatic quality selection.

Selecting an event lights its complete existing connection route to its associated work, including intermediate event segments. If no associated work is reachable, the nearest connected work is highlighted. Routes stop at work nodes, respect the current filter and never invent connections. Selection remains highlighted while hovering elsewhere.

The scene uses sphere/rock/torus geometry rather than background billboards. Fog integrates procedural 3D density along camera rays inside ellipsoidal volumes. Six background depth strata, perspective parallax and separate work/event depth bands supply spatial separation. Node and connection endpoints use the same depth function. Low quality reduces mesh populations, fog integration steps, pixel ratio and antialiasing. No external environment assets are needed.

Connections render as continuous 3D lightning bolts with deterministic broad meanders, sharp discharges and branching sparks. All relation types keep their metadata and selection highlights; transition paths use continuous lightning rather than straight dashed segments.

Event-to-work connections follow direct diagonal lightning paths between their vertical bands, without detouring above the movie row.


## Fluid pointer trail

The pointer smoke follows the **Fluid pointer** section in `.plan/AI_UI_DIRECTION.md`. It uses `three-fluid-fx` 0.1.0 with the existing R3F WebGL renderer and postprocessing composer. Blue/violet fluid curls and dissipates in screen space, blending toward the hovered/selected node’s accent. Faster strokes produce thinner ribbons; slow strokes softer wisps. Density is restrained around labels, and the effect never displaces graph geometry or captures navigation events.

Reduced-motion and touch-only devices skip simulation allocation. Quality follows the scene’s automatic tier; idle/hidden simulation work is suspended. The effect owns and disposes its GPU targets and pointer listeners. The dependency’s Three.js type definitions are pinned to the app’s 0.186.0 types through an npm override.

Reference: [official GLSL overlay example](https://github.com/artcodev/three-fluid-fx/blob/main/examples/glsl/minimal/overlay/main.ts), [integration guide](https://three-fluid-fx.artcreativecode.com/tutorials/getting-started/).

Film title artwork stays enabled at all zoom levels and grows up to 35% larger in the overview. Labels stagger into nearby free vertical slots with a twelve-pixel gap; when space is exhausted, selection and hover take priority and colliding titles are temporarily hidden. Film columns are twelve world units apart, and filtering preserves their positions.

Click a film title image (or its text fallback) to select it and fit a view containing the film and up to two neighboring works on the same visible timeline. Focus adapts to the available map width/height and works with Enter/Space; ordinary event selection retains its current zoom.
