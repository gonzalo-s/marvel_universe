'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent, type MouseEvent } from 'react';
import { resolveGraph } from '@/lib/timeline';
import { horizontalNavigation, MIN_ZOOM, MAX_ZOOM, PIXELS_PER_UNIT } from '@/lib/camera';
import type { TimelineData } from '@/types/timeline';
import { filmFocus } from '@/lib/filmFocus';
import { filterGraph, type NodeFilter } from '@/lib/filterGraph';
import type { Navigation } from '@/types/navigation';

export function useTimelineExplorer(data: TimelineData) {
  const fullGraph = useMemo(() => resolveGraph(data), [data]);
  const [kindFilter, setKindFilter] = useState<NodeFilter>('all');
  const graph = useMemo(() => filterGraph(fullGraph, kindFilter), [fullGraph, kindFilter]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const zoomValue = useRef(1);
  const pendingFocus = useRef<{ targetX: number; targetY: number } | null>(null);
  const [focusRevision, setFocusRevision] = useState(0);
  const [query, setQuery] = useState('');
  const [rowId, setRowId] = useState(data.rows[0].id);
  const [sceneWidth, setSceneWidth] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const scene = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const drag = useRef<{ id: number; x: number; y: number; offset: number; targetY: number } | null>(null);
  const navigation = useRef<Navigation>({ targetX: graph.bounds.minX, targetY: graph.rows.get(rowId)!.y - 1, revision: 0 });
  const scrolling = useMemo(() => horizontalNavigation(graph.bounds, sceneWidth, zoom), [graph, sceneWidth, zoom]);
  const results = [...graph.nodes.values()].map(item => item.node).filter(node => `${node.title} ${node.description ?? ''} ${node.workId ?? ''}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const element = scene.current!;
    const observer = new ResizeObserver(entries => setSceneWidth(entries[0].contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    zoomValue.current = zoom;
    if (!sceneWidth || !scroller.current) return;
    // Preserve the world point at the center while zooming/resizing.
    const focus = pendingFocus.current;
    const offset = initialized.current ? scrolling.offsetAt(focus?.targetX ?? navigation.current.targetX) : 0;
    scroller.current.scrollLeft = offset;
    navigation.current.targetX = scrolling.targetAt(scroller.current.scrollLeft);
    if (focus) navigation.current.targetY = focus.targetY;
    pendingFocus.current = null;
    navigation.current.revision += 1;
    initialized.current = true;
  }, [sceneWidth, scrolling, zoom, focusRevision]);

  useEffect(() => {
    const frame = scene.current!;
    const surface = frame.parentElement!;
    const wheel = (event: WheelEvent) => {
      const inFallback = event.target instanceof Element && event.target.closest('.html-fallback');
      if (inFallback && !event.ctrlKey) return;
      // A non-passive capture listener suppresses native Ctrl+wheel page zoom
      // before either the canvas or browser consumes the gesture.
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? frame.clientWidth : 1;
      if (event.ctrlKey) {
        event.stopPropagation();
        const delta = Math.max(-250, Math.min(250, (event.deltaY || event.deltaX) * unit));
        if (!delta) return;
        const previous = zoomValue.current;
        const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, previous * Math.exp(-delta * 0.0015)));
        if (next === previous) return;
        const rect = frame.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left)) - rect.width / 2;
        const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top)) - rect.height / 2;
        const worldX = navigation.current.targetX + x / (PIXELS_PER_UNIT * previous);
        const worldY = navigation.current.targetY - y / (PIXELS_PER_UNIT * previous);
        navigation.current.targetX = worldX - x / (PIXELS_PER_UNIT * next);
        navigation.current.targetY = Math.max(graph.bounds.minY, Math.min(graph.bounds.maxY, worldY + y / (PIXELS_PER_UNIT * next)));
        zoomValue.current = next;
        setZoom(next);
        return;
      }
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (scroller.current) scroller.current.scrollLeft += delta * unit;
    };
    surface.addEventListener('wheel', wheel, { passive: false, capture: true });
    return () => surface.removeEventListener('wheel', wheel, true);
  }, [graph]);

  function reset() {
    setZoom(1); setSelectedId(null); setQuery('');
    const first = graph.layout.rows.find(({ row }) => graph.layout.nodes.some(item => item.node.position.row === row.id)) ?? graph.layout.rows[0];
    setRowId(first.row.id);
    navigation.current.targetY = first.y - 1;
    const initial = horizontalNavigation(graph.bounds, sceneWidth, 1);
    navigation.current.targetX = initial.targetAt(0);
    navigation.current.revision += 1;
    scroller.current?.scrollTo({ left: 0, behavior: 'instant' });
  }

  function select(id: string) {
    const item = graph.nodes.get(id);
    if (!item) return;
    setSelectedId(id); setRowId(item.node.position.row);
    navigation.current.targetY = graph.rows.get(item.node.position.row)!.y - 1;
    if (scroller.current) {
      scroller.current.scrollLeft = scrolling.offsetAt(item.position[0]);
      navigation.current.targetX = scrolling.targetAt(scroller.current.scrollLeft);
    }
  }

  function focusFilm(id: string) {
    const target = filmFocus(graph, id, scene.current?.clientWidth ?? sceneWidth, scene.current?.clientHeight ?? 600);
    const item = graph.nodes.get(id);
    if (!target || !item) return;
    setSelectedId(id); setRowId(item.node.position.row); setQuery('');
    zoomValue.current = target.zoom;
    pendingFocus.current = { targetX: target.targetX, targetY: target.targetY };
    setFocusRevision(value => value + 1);
    setZoom(target.zoom);
  }

  function selectSearch(event: MouseEvent<HTMLButtonElement>) {
    select(event.currentTarget.value);
    setQuery('');
  }

  function changeRow(id: number) {
    setRowId(id); setSelectedId(null);
    navigation.current.targetY = graph.rows.get(id)!.y - 1;
    const members = graph.layout.nodes.filter(item => item.node.position.row === id);
    const nearest = members.reduce<(typeof members)[number] | undefined>((best, item) =>
      !best || Math.abs(item.position[0] - navigation.current.targetX) < Math.abs(best.position[0] - navigation.current.targetX) ? item : best,
    undefined);
    if (nearest && scroller.current) {
      scroller.current.scrollLeft = scrolling.offsetAt(nearest.position[0]);
      navigation.current.targetX = scrolling.targetAt(scroller.current.scrollLeft);
    }
  }

  function changeKind(kind: NodeFilter) {
    const visible = filterGraph(fullGraph, kind);
    setKindFilter(kind);
    if (selectedId && !visible.nodes.has(selectedId)) setSelectedId(null);
    const scale = PIXELS_PER_UNIT * zoom;
    const inView = visible.layout.nodes.some(item => Math.abs(item.position[0] - navigation.current.targetX) < sceneWidth / (2 * scale) &&
      Math.abs(item.position[1] - navigation.current.targetY) < (scene.current?.clientHeight ?? 0) / (2 * scale));
    // Avoid a blank viewport when the visible kind starts in a later column.
    if (!inView) {
      const rowMembers = visible.layout.nodes.filter(item => item.node.position.row === rowId);
      const candidates = rowMembers.length ? rowMembers : visible.layout.nodes;
      const nearest = candidates.reduce<(typeof visible.layout.nodes)[number] | undefined>((best, item) =>
        !best || Math.abs(item.position[0] - navigation.current.targetX) < Math.abs(best.position[0] - navigation.current.targetX) ? item : best,
      undefined);
      if (nearest) {
        setRowId(nearest.node.position.row);
        navigation.current.targetY = visible.rows.get(nearest.node.position.row)!.y - 1;
        if (scroller.current) {
          scroller.current.scrollLeft = scrolling.offsetAt(nearest.position[0]);
          navigation.current.targetX = scrolling.targetAt(scroller.current.scrollLeft);
        }
      }
    }
  }

  function jumpTo(x: number, y: number) {
    navigation.current.targetY = Math.max(graph.bounds.minY, Math.min(graph.bounds.maxY, y));
    if (scroller.current) {
      scroller.current.scrollLeft = scrolling.offsetAt(x);
      navigation.current.targetX = scrolling.targetAt(scroller.current.scrollLeft);
    }
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target instanceof Element && event.target.closest('button, a, .html-fallback'))) return;
    event.preventDefault();
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, offset: scroller.current?.scrollLeft ?? 0, targetY: navigation.current.targetY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    if (scroller.current) scroller.current.scrollLeft = start.offset + start.x - event.clientX;
    const targetY = start.targetY + (event.clientY - start.y) / (PIXELS_PER_UNIT * zoom);
    navigation.current.targetY = Math.max(graph.bounds.minY, Math.min(graph.bounds.maxY, targetY));
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return { fullGraph, graph, kindFilter, selectedId, zoom, query, rowId, reducedMotion, scene, scroller, navigation, scrolling,
    results, reset, jumpTo, select, focusFilm, selectSearch, changeRow, changeKind, startDrag, moveDrag, endDrag,
    setQuery, closeSelection: () => setSelectedId(null), cancelDrag: () => { drag.current = null; },
    scroll: (offset: number) => { if (!pendingFocus.current) navigation.current.targetX = scrolling.targetAt(offset); } };
}
