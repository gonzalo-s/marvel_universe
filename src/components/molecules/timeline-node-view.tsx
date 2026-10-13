"use client";

import { Html } from "@react-three/drei";
import type { RefObject } from "react";
import { NodeMarker } from "@/components/atoms/node-marker";
import { NodeBody } from "./node-body";
import { useSceneActivity } from "@/hooks/scene-activity";
import { TitleArtwork } from "./title-artwork";
import { storyTime } from "@/lib/timeline";
import { resolveNodeVisuals } from "@/lib/nodeVisuals";
import { titleArtworkScale } from "@/lib/titleLabels";
import { presentation } from "@/lib/presentation";
import type { PositionedNode } from "@/lib/layoutTimeline";

export function TimelineNodeView({
  item,
  selected,
  onSelect,
  zoom,
  portal,
  reducedMotion,
}: {
  item: PositionedNode;
  selected: boolean;
  onSelect: (id: string) => void;
  zoom: number;
  portal: RefObject<HTMLDivElement>;
  reducedMotion: boolean;
}) {
  const { node } = item;
  const { hover } = useSceneActivity();
  const { primary } = resolveNodeVisuals(node);
  const compact = node.kind === "event";
  const scale = Math.min(1, Math.max(0.35, zoom / 0.8)) * (compact ? 0.65 : 1);
  const labelScale = compact ? (selected ? 1 : scale) : titleArtworkScale(zoom);
  return (
    <NodeBody
      item={item}
      selected={selected}
      zoom={zoom}
      reducedMotion={reducedMotion}
    >
      <Html
        portal={portal}
        center
        position={[0, 0, 0.2]}
        zIndexRange={[20, 10]}
      >
        <NodeMarker
          label={`${node.title}. ${storyTime(node)}`}
          selected={selected}
          color={primary}
          scale={scale}
          onClick={() => onSelect(node.id)}
          onHover={(on) => hover(node.id, on)}
        />
      </Html>
      {(selected ||
        (compact ? zoom >= presentation.labels.eventZoom : true)) && (
        <Html
          portal={portal}
          center
          position={[0, 0, 0.2]}
          className="event-label"
          zIndexRange={[5, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`event-label-card ${selected ? "selected" : ""} ${compact ? "compact" : "work-label"}`}
            data-work-label={compact ? undefined : node.id}
            data-label-scale={labelScale}
            style={{
              transform: `translateX(-50%) scale(${labelScale})`,
              transformOrigin: "top center",
              top: compact ? (selected ? 30 : 30 * scale) : 30,
            }}
          >
            <TitleArtwork node={node} />
            <small>{node.position.year}</small>
          </div>
        </Html>
      )}
    </NodeBody>
  );
}
