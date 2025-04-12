import { useEffect, useState } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";

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
    console.log("handlePieceDrop()");
    if (!isSessionActive || isBoardLocked) return false;

    const moveStr = sourceSquare + targetSquare;
    const expectedMoveStr = solution[solvedIndex];
    const expectedMoveNoPromotion = expectedMoveStr.slice(0, 4);

    console.log("\tmoveStr", moveStr);
    console.log("\texpectedMoveStr", expectedMoveStr);
    console.log("\expectedMoveNoPromotion", expectedMoveNoPromotion);
    const isCorrect = moveStr === expectedMoveNoPromotion;

    if (!isCorrect) {
      onMove(moveStr, false);
      return false;
    }

    setIsBoardLocked(true);
    onMove(moveStr, true);

    const newGame = new Chess(game.fen());
    newGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    setBoardPosition(newGame.fen());

    setTimeout(() => {
      const replyUci = solution[solvedIndex + 1];

      if (!replyUci) {
        setGame(newGame);
        setIsBoardLocked(false);
        return;
      }

      const replyMove = {
        from: replyUci.slice(0, 2) as Square,
        to: replyUci.slice(2, 4) as Square,
        promotion: replyUci.length > 4 ? replyUci.slice(4) : undefined,
      };

      newGame.move(replyMove);
      setBoardPosition(newGame.fen());

      setTimeout(() => {
        setGame(newGame);
        setIsBoardLocked(false);
      }, 300);
    }, 300);

    return true;
  };

  const orientation = sideOnBottom === "w" ? "white" : "black";

  const [arrowStart, setArrowStart] = useState<Square | null>(null);

  const getSquareFromMouseEvent = (e: React.MouseEvent): Square | null => {
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

    if (fileIndex < 0 || fileIndex > 7 || rankIndex < 0 || rankIndex > 7)
      return null;

    const files = sideOnBottom === "w" ? "abcdefgh" : "hgfedcba";
    const ranks = sideOnBottom === "w" ? "87654321" : "12345678";

    const square = `${files[fileIndex]}${ranks[rankIndex]}` as Square;
    return square;
  };
  const handleRightMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 2) return; // right-click only

    const square = getSquareFromMouseEvent(e);
    if (square) {
      setArrowStart(square);
    }
  };

  const handleRightMouseUp = (e: React.MouseEvent) => {
    if (e.button !== 2 || arrowStart === null) return;

    const square = getSquareFromMouseEvent(e);
    if (square && square !== arrowStart) {
      const newArrow = { from: arrowStart, to: square };

      setArrows((prev) => {
        const exists = prev.some(
          (arrow) => arrow.from === newArrow.from && arrow.to === newArrow.to
        );
        return exists
          ? prev.filter(
              (arrow) =>
                !(arrow.from === newArrow.from && arrow.to === newArrow.to)
            )
          : [...prev, newArrow];
      });
    }

    setArrowStart(null);
  };
  const squareToCoords = (square: Square): [number, number] => {
    const files = sideOnBottom === "w" ? "abcdefgh" : "hgfedcba";
    const ranks = sideOnBottom === "w" ? "87654321" : "12345678";

    const file = square[0];
    const rank = square[1];

    const x = files.indexOf(file);
    const y = ranks.indexOf(rank);

    return [x + 0.5, y + 0.5]; // center of square
  };

  const getScreenWidth = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth;
    }
    return 0; // default value if not in browser
  };
  const getScreenHeight = () => {
    if (typeof window !== "undefined") {
      return window.innerHeight;
    }
    return 0; // default value if not in browser
  };

  let factor = 1;
  if (getScreenWidth() > 600) {
    factor = 0.7;
  }

  const dynamicBoardWidth =
    Math.min(getScreenHeight(), getScreenWidth()) * factor;

  return (
    <div
      className="w-full"
      style={{ opacity: isSessionActive ? 1 : 0.5 }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={handleRightMouseDown}
      onMouseUp={handleRightMouseUp}
    >
      <p className="text-center mb-2">
        {game.turn() === "w" ? "White to move" : "Black to move"}
      </p>
      <Chessboard
        position={boardPosition}
        onPieceDrop={handlePieceDrop}
        animationDuration={300}
        boardOrientation={orientation}
        arePiecesDraggable={!isBoardLocked && isSessionActive}
        boardWidth={dynamicBoardWidth}
        customSquareStyles={
          highlight
            ? { [highlight]: { backgroundColor: "rgba(255, 0, 0, 0.4)" } }
            : {}
        }
      />
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        width="100%"
        height="100%"
        viewBox="0 0 8 8"
      >
        {arrows.map((arrow, idx) => {
          const [x1, y1] = squareToCoords(arrow.from);
          const [x2, y2] = squareToCoords(arrow.to);
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
    </div>
  );
}
