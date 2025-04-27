"use client";

import { Square } from "chess.js";

export function getSquareFromMouseEvent(
  e: React.MouseEvent,
  sideOnBottom: "w" | "b"
): Square | null {
  const board = e.currentTarget.querySelector(
    ".chessboard-board"
  ) as HTMLElement;
  if (!board) return null;

  const rect = board.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const squareSize = rect.width / 8;

  const fileIndex = Math.floor(x / squareSize);
  const rankIndex = Math.floor(y / squareSize);

  if (fileIndex < 0 || fileIndex > 7 || rankIndex < 0 || rankIndex > 7) {
    return null;
  }

  const files = sideOnBottom === "w" ? "abcdefgh" : "hgfedcba";
  const ranks = sideOnBottom === "w" ? "87654321" : "12345678";

  return `${files[fileIndex]}${ranks[rankIndex]}` as Square;
}

export function squareToCoords(
  square: Square,
  sideOnBottom: "w" | "b"
): [number, number] {
  const files = sideOnBottom === "w" ? "abcdefgh" : "hgfedcba";
  const ranks = sideOnBottom === "w" ? "87654321" : "12345678";

  const file = square[0];
  const rank = square[1];

  const x = files.indexOf(file);
  const y = ranks.indexOf(rank);

  return [x + 0.5, y + 0.5]; // center of square
}
