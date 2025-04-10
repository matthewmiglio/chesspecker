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
}

export default function AnimatedBoard({
  fen,
  solution,
  solvedIndex,
  onMove,
  highlight,
  isSessionActive,
}: Props) {
  const [game, setGame] = useState(new Chess(fen));
  const [boardPosition, setBoardPosition] = useState(fen);
  const [isBoardLocked, setIsBoardLocked] = useState(false);

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
    if (!isSessionActive || isBoardLocked) return false;

    const moveStr = sourceSquare + targetSquare;
    const isCorrect = moveStr === solution[solvedIndex];

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

    return true; // <- Important: still return `true` synchronously
  };

  const isFlipped = game.turn() === "b";

  return (
    <div
      className="w-full max-w-[480px] mx-auto transition-opacity"
      style={{ opacity: isSessionActive ? 1 : 0.5 }}
    >
      <p className="text-center text-muted-foreground mb-2">
        {game.turn() === "w" ? "White to move" : "Black to move"}
      </p>
      <Chessboard
        position={boardPosition}
        onPieceDrop={handlePieceDrop}
        animationDuration={300}
        boardOrientation={isFlipped ? "black" : "white"}
        arePiecesDraggable={!isBoardLocked && isSessionActive}
        boardWidth={480}
        customSquareStyles={
          highlight
            ? { [highlight]: { backgroundColor: "rgba(255, 0, 0, 0.4)" } }
            : {}
        }
      />
    </div>
  );
}
