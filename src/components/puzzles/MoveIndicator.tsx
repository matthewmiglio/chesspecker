"use client";

interface MoveIndicatorProps {
  turn: "w" | "b";
}

export default function MoveIndicator({ turn }: MoveIndicatorProps) {
  return (
    <p className=" text-xl text-center tracking-widest">
  {turn === "w" ? "White to move" : "Black to move"}
</p>

  );
}
