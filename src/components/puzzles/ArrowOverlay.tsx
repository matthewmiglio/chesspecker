"use client";

import { Square } from "chess.js";
import { squareToCoords } from "@/lib/utils/chessBoardHelpers";

interface ArrowOverlayProps {
  arrows: { from: Square; to: Square }[];
  sideOnBottom: "w" | "b";
}

export default function ArrowOverlay({
  arrows,
  sideOnBottom,
}: ArrowOverlayProps) {
  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      width="100%"
      height="100%"
      viewBox="0 0 8 8"
    >
      {arrows.map((arrow, idx) => {
        const [x1, y1] = squareToCoords(arrow.from, sideOnBottom);
        const [x2, y2] = squareToCoords(arrow.to, sideOnBottom);
        return (
          <line
            key={idx}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="orange"
            strokeWidth="0.2"
            markerEnd="url(#arrowhead)"
            opacity="0.75"
          />
        );
      })}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="0.4"
          markerHeight="0.4"
          refX="0.1"
          refY="0.2"
          orient="auto"
        >
          <polygon points="0,0 0.4,0.2 0,0.4" fill="orange" />
        </marker>
      </defs>
    </svg>
  );
}
