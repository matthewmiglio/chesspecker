"use client";

import { useEffect, useState, useMemo } from "react";
import { Chess, Square, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useThemeAccentColor } from "@/lib/hooks/useThemeAccentColor";

import ArrowOverlay from "@/components/puzzles/ArrowOverlay";
import {
  handlePieceDropHelper,
  handleRightMouseDownHelper,
  handleRightMouseUpHelper,
  handleSquareClickHelper,
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
  const themeColor = useThemeAccentColor();
  const [game, setGame] = useState(new Chess(fen));
  const [boardPosition, setBoardPosition] = useState(fen);
  const [isBoardLocked, setIsBoardLocked] = useState(false);
  const [arrows, setArrows] = useState<{ from: Square; to: Square }[]>([]);
  const [arrowStart, setArrowStart] = useState<Square | null>(null);

  // Click-to-move state
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
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
    // Reset click-to-move state when FEN changes
    setSelectedSquare(null);
    setValidMoves([]);
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
      const nextGame = result.nextGame; // <- capture it here safely!

      setTimeout(() => {
        const replyUci = solution[solvedIndex + 1];
        if (replyUci) {
          const replyMove = {
            from: replyUci.slice(0, 2) as Square,
            to: replyUci.slice(2, 4) as Square,
            promotion: replyUci.length > 4 ? replyUci.slice(4) : undefined,
          };
          nextGame.move(replyMove);
        }

        setBoardPosition(nextGame.fen());
        setGame(nextGame);
        setIsBoardLocked(false);
      }, 0);
    }

    return true;
  };

  const handleSquareClick = (square: Square) => {
    const result = handleSquareClickHelper({
      square,
      game,
      selectedSquare,
      validMoves,
      solution,
      solvedIndex,
      isSessionActive,
      isBoardLocked,
    });

    switch (result.action) {
      case "select":
        setSelectedSquare(result.newSelectedSquare!);
        setValidMoves(result.newValidMoves!);
        break;
      case "deselect":
        setSelectedSquare(null);
        setValidMoves([]);
        break;
      case "move":
        setSelectedSquare(null);
        setValidMoves([]);

        if (!result.moveResult?.valid) return;

        if (!result.moveResult.moveWasCorrect) {
          onMove(selectedSquare! + square, false);
          return;
        }

        setIsBoardLocked(true);
        onMove(selectedSquare! + square, true);

        // Add delay for animation BEFORE updating position
        setTimeout(() => {
          if (result.moveResult?.newFen) {
            setBoardPosition(result.moveResult.newFen);
          }

          if (result.moveResult?.nextGame) {
            const nextGame = result.moveResult.nextGame;

            setTimeout(() => {
              const replyUci = solution[solvedIndex + 1];
              if (replyUci) {
                const replyMove = {
                  from: replyUci.slice(0, 2) as Square,
                  to: replyUci.slice(2, 4) as Square,
                  promotion: replyUci.length > 4 ? replyUci.slice(4) : undefined,
                };
                nextGame.move(replyMove);
              }

              setBoardPosition(nextGame.fen());
              setGame(nextGame);
              setIsBoardLocked(false);
            }, 350); // Slightly longer delay for bot move
          } else {
            setIsBoardLocked(false);
          }
        }, 50); // Small delay for user move animation
        break;
      case "none":
      default:
        // Do nothing
        break;
    }
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

  // Create custom square styles for selected square and valid moves
  const customSquareStyles = useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};

    // Add highlight square (existing logic)
    if (highlight) {
      styles[highlight] = { backgroundColor: "rgba(255, 0, 0, 0.4)" };
    }

    // Add selected square highlighting with theme color
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: themeColor,
        opacity: 0.7
      };
    }

    // Add valid move indicators (smooth dots for regular moves, rings for captures)
    validMoves.forEach((move) => {
      if (move.to !== selectedSquare) { // Don't overlap selected square
        const isCapture = move.captured !== undefined || move.flags.includes('c') || move.flags.includes('e');

        if (isCapture) {
          // Capture moves: grey ring around the entire square
          styles[move.to] = {
            boxShadow: `inset 0 0 0 4px rgba(128, 128, 128, 0.8)`,
            borderRadius: '8px',
          };
        } else {
          // Regular moves: small smooth grey circle in center using multiple layered shadows
          styles[move.to] = {
            background: `
              radial-gradient(circle at center,
                rgba(128, 128, 128, 0.8) 0%,
                rgba(128, 128, 128, 0.8) 15%,
                rgba(128, 128, 128, 0.4) 18%,
                transparent 22%)
            `,
            borderRadius: '50%',
          };
        }
      }
    });

    return styles;
  }, [highlight, selectedSquare, validMoves, themeColor]);

  return (
    <div
      className="w-full overflow-x-hidden"
      style={{ opacity: isSessionActive ? 1 : 0.5 }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={handleRightMouseDown}
      onMouseUp={handleRightMouseUp}
    >
      {/* Board container */}
      <div className="relative block mx-auto" style={{ width: boardWidth, height: boardWidth }}>
        <Chessboard
          position={boardPosition}
          onPieceDrop={handlePieceDrop}
          onSquareClick={handleSquareClick}
          animationDuration={300}
          boardOrientation={sideOnBottom === "w" ? "white" : "black"}
          arePiecesDraggable={!isBoardLocked && isSessionActive}
          boardWidth={boardWidth}
          customSquareStyles={customSquareStyles}
        />
      </div>

      <ArrowOverlay arrows={arrows} sideOnBottom={sideOnBottom} />
    </div>
  );
}
