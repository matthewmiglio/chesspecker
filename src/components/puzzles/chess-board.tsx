"use client";

import { useEffect, useState } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";

import MoveIndicator from "@/components/puzzles/MoveIndicator";
import ArrowOverlay from "@/components/puzzles/ArrowOverlay";
import {
  getSquareFromMouseEvent,
  handlePieceDropHelper,
  handleRightMouseDownHelper,
  handleRightMouseUpHelper,
} from "@/lib/utils/chessBoardHelpers";

interface Props {
  fen: string;
  solution: string[];
  solvedIndex: number;
  onMove: (move: string, isCorrect: boolean) => void;
  highlight: string | null;
  isSessionActive: boolean;
  sideOnBottom: "w" | "b";
}

export default function AnimatedBoard({
  fen,
  solution,
  solvedIndex,
  onMove,
  highlight,
  isSessionActive,
  sideOnBottom,
}: Props) {
  const [game, setGame] = useState(new Chess(fen));
  const [boardPosition, setBoardPosition] = useState(fen);
  const [isBoardLocked, setIsBoardLocked] = useState(false);
  const [arrows, setArrows] = useState<{ from: Square; to: Square }[]>([]);
  const [arrowStart, setArrowStart] = useState<Square | null>(null);
  const [boardWidth, setBoardWidth] = useState(() => {
    if (typeof window !== "undefined") {
      const factor = window.innerWidth > 600 ? 0.7 : 1;
      return Math.min(window.innerWidth, window.innerHeight) * factor;
    }
    return 300;
  });

  useEffect(() => {
    const updateBoardSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const factor = width > 600 ? 0.7 : 1;
      setBoardWidth(Math.min(width, height) * factor);
    };

    updateBoardSize();
    window.addEventListener("resize", updateBoardSize);
    return () => window.removeEventListener("resize", updateBoardSize);
  }, []);

  useEffect(() => {
    const updated = new Chess();
    updated.load(fen);
    setGame(updated);
    setBoardPosition(fen);
  }, [fen]);

  const handlePieceDrop = (
    sourceSquare: Square,
    targetSquare: Square
  ): boolean => {
    const result = handlePieceDropHelper({
      sourceSquare,
      targetSquare,
      game,
      solution,
      solvedIndex,
      isSessionActive,
      isBoardLocked,
    });

    if (!result.valid) return false;

    if (!result.moveWasCorrect) {
      onMove(sourceSquare + targetSquare, false);
      return false;
    }

    setIsBoardLocked(true);
    onMove(sourceSquare + targetSquare, true);

    if (result.newFen) {
      setBoardPosition(result.newFen);
    }

    if (result.nextGame) {
      setTimeout(() => {
        const replyUci = solution[solvedIndex + 1];
        if (replyUci) {
          const replyMove = {
            from: replyUci.slice(0, 2) as Square,
            to: replyUci.slice(2, 4) as Square,
            promotion: replyUci.length > 4 ? replyUci.slice(4) : undefined,
          };
          result.nextGame.move(replyMove);
        }
        setBoardPosition(result.nextGame.fen());
        setGame(result.nextGame);
        setIsBoardLocked(false);
      }, 0);
    }

    return true;
  };

  const handleRightMouseDown = (e: React.MouseEvent) => {
    const square = handleRightMouseDownHelper(e, sideOnBottom);
    if (square) setArrowStart(square);
  };

  const handleRightMouseUp = (e: React.MouseEvent) => {
    handleRightMouseUpHelper(
      e,
      sideOnBottom,
      arrowStart,
      setArrows,
      setArrowStart
    );
  };

  return (
    <div
      className="w-full"
      style={{ opacity: isSessionActive ? 1 : 0.5 }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={handleRightMouseDown}
      onMouseUp={handleRightMouseUp}
    >
      <MoveIndicator turn={game.turn()} />
      <Chessboard
        position={boardPosition}
        onPieceDrop={handlePieceDrop}
        animationDuration={300}
        boardOrientation={sideOnBottom === "w" ? "white" : "black"}
        arePiecesDraggable={!isBoardLocked && isSessionActive}
        boardWidth={boardWidth}
        customSquareStyles={
          highlight
            ? { [highlight]: { backgroundColor: "rgba(255, 0, 0, 0.4)" } }
            : {}
        }
      />
      <ArrowOverlay arrows={arrows} sideOnBottom={sideOnBottom} />
    </div>
  );
}
