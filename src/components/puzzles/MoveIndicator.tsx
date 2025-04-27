"use client";

interface MoveIndicatorProps {
  turn: "w" | "b";
}

export default function MoveIndicator({ turn }: MoveIndicatorProps) {
  return (
    <p className="text-center mb-2">
      {turn === "w" ? "White to move" : "Black to move"}
    </p>
  );
}
