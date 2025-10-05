"use client";

import { Chess, Square, Move } from "chess.js";

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

  if (solvedIndex >= solution.length)
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

  const isCheckmate = tempGame.isCheckmate();
  const matchesOriginalSolution = moveStr === expectedMoveStr;
  const isCorrect = isCheckmate || matchesOriginalSolution;

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

// Click-to-move helper functions
export function getValidMovesForSquare(game: Chess, square: Square): Move[] {
  try {
    return game.moves({ square, verbose: true });
  } catch (error) {
    console.warn("[getValidMovesForSquare] Error getting moves for", square, error);
    return [];
  }
}

export function isSquareOccupiedByCurrentPlayer(game: Chess, square: Square): boolean {
  const piece = game.get(square);
  return piece !== null && piece !== undefined && piece.color === game.turn();
}

export function handleSquareClickHelper({
  square,
  game,
  selectedSquare,
  validMoves,
  solution,
  solvedIndex,
  isSessionActive,
  isBoardLocked,
}: {
  square: Square;
  game: Chess;
  selectedSquare: Square | null;
  validMoves: Move[];
  solution: string[];
  solvedIndex: number;
  isSessionActive: boolean;
  isBoardLocked: boolean;
}): {
  action: "select" | "deselect" | "move" | "none";
  newSelectedSquare?: Square | null;
  newValidMoves?: Move[];
  moveResult?: {
    valid: boolean;
    moveWasCorrect: boolean;
    newFen?: string;
    nextGame?: Chess;
  };
} {
  if (!isSessionActive || isBoardLocked) {
    return { action: "none" };
  }

  // If no square is currently selected
  if (!selectedSquare) {
    // Check if clicked square has a piece belonging to current player
    if (isSquareOccupiedByCurrentPlayer(game, square)) {
      const moves = getValidMovesForSquare(game, square);
      return {
        action: "select",
        newSelectedSquare: square,
        newValidMoves: moves,
      };
    }
    return { action: "none" };
  }

  // If clicking the same square, deselect
  if (selectedSquare === square) {
    return {
      action: "deselect",
      newSelectedSquare: null,
      newValidMoves: [],
    };
  }

  // Check if clicked square is a valid move destination
  const targetMove = validMoves.find(move => move.to === square);
  if (targetMove) {
    // Execute the move using existing logic
    const moveResult = handlePieceDropHelper({
      sourceSquare: selectedSquare,
      targetSquare: square,
      game,
      solution,
      solvedIndex,
      isSessionActive,
      isBoardLocked,
    });

    return {
      action: "move",
      newSelectedSquare: null,
      newValidMoves: [],
      moveResult,
    };
  }

  // If clicking another piece of the same color, switch selection
  if (isSquareOccupiedByCurrentPlayer(game, square)) {
    const moves = getValidMovesForSquare(game, square);
    return {
      action: "select",
      newSelectedSquare: square,
      newValidMoves: moves,
    };
  }

  // Otherwise, deselect
  return {
    action: "deselect",
    newSelectedSquare: null,
    newValidMoves: [],
  };
}
