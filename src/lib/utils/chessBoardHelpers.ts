"use client";

import { Chess, Square } from "chess.js";

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

export function handlePieceDropHelper({
  sourceSquare,
  targetSquare,
  game,
  solution,
  solvedIndex,
  isSessionActive,
  isBoardLocked,
}: {
  sourceSquare: Square;
  targetSquare: Square;
  game: Chess;
  solution: string[];
  solvedIndex: number;
  isSessionActive: boolean;
  isBoardLocked: boolean;
}): {
  valid: boolean;
  moveWasCorrect: boolean;
  newFen?: string;
  nextGame?: Chess;
} {
  if (!isSessionActive || isBoardLocked)
    return { valid: false, moveWasCorrect: false };

  const tempGame = new Chess(game.fen());
  try {
    tempGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
  } catch (error) {
    console.warn(
      "[handlePieceDropHelper] Illegal move:",
      { sourceSquare, targetSquare },
      error
    );
    return { valid: false, moveWasCorrect: false };
  }

  const moveStr = sourceSquare + targetSquare;
  const expectedMoveStr = solution[solvedIndex].slice(0, 4);
  const isCorrect = moveStr === expectedMoveStr;

  const nextGame = new Chess(game.fen());
  nextGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });

  return {
    valid: true,
    moveWasCorrect: isCorrect,
    newFen: nextGame.fen(),
    nextGame,
  };
}

export function handleRightMouseDownHelper(
  e: React.MouseEvent,
  sideOnBottom: "w" | "b"
): Square | null {
  if (e.button !== 2) return null;
  return getSquareFromMouseEvent(e, sideOnBottom);
}

export function handleRightMouseUpHelper(
  e: React.MouseEvent,
  sideOnBottom: "w" | "b",
  arrowStart: Square | null,
  setArrows: React.Dispatch<
    React.SetStateAction<{ from: Square; to: Square }[]>
  >,
  setArrowStart: (square: Square | null) => void
) {
  if (e.button !== 2 || !arrowStart) return;
  const square = getSquareFromMouseEvent(e, sideOnBottom);
  if (square && square !== arrowStart) {
    const newArrow = { from: arrowStart, to: square };
    setArrows((prev) =>
      prev.some(
        (arrow) => arrow.from === newArrow.from && arrow.to === newArrow.to
      )
        ? prev.filter(
            (arrow) =>
              !(arrow.from === newArrow.from && arrow.to === newArrow.to)
          )
        : [...prev, newArrow]
    );
  }
  setArrowStart(null);
}
