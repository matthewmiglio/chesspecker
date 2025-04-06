import { useEffect, useRef, useState } from "react";
import { Chess, SQUARES, Square } from "chess.js";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  fen: string;
  solution: string[];
  solvedIndex: number;
  onMove: (move: string, isCorrect: boolean) => void;
  highlight: string | null;
  isSessionActive: boolean;
};

type PiecePosition = {
  square: Square;
  type: string;
  color: "w" | "b";
  key: string;
};

export function ChessBoard({
  fen,
  solution,
  solvedIndex,
  onMove,
  highlight,
  isSessionActive,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [chess, setChess] = useState(() => new Chess(fen));
  const [pieces, setPieces] = useState<PiecePosition[]>([]);

  const boardRef = useRef<HTMLDivElement>(null);

  // Helpers
  const squareToCoords = (square: Square) => {
    const file = square.charCodeAt(0) - "a".charCodeAt(0);
    const rank = parseInt(square[1]) - 1;
    return { x: file, y: rank };
  };

  const getSquareColor = (i: number) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    return (row + col) % 2 === 0 ? "bg-[#eeeed2]" : "bg-[#769656]";
  };

  const getPieceImg = (piece: any) => {
    const color = piece.color === "w" ? "white" : "black";
    const typeMap: Record<string, string> = {
      p: "pawn",
      n: "knight",
      b: "bishop",
      r: "rook",
      q: "queen",
      k: "king",
    };
    return `/piece_images/${color}_${typeMap[piece.type]}.png`;
  };

  const updatePiecePositions = () => {
    const newPieces: PiecePosition[] = [];
    SQUARES.forEach((square) => {
      const piece = chess.get(square);
      if (piece) {
        newPieces.push({
          square,
          type: piece.type,
          color: piece.color,
          key: `${square}-${piece.color}${piece.type}`,
        });
      }
    });
    setPieces(newPieces);
  };

  useEffect(() => {
    const c = new Chess();
    c.load(fen);
    setChess(c);
    setSelected(null);
    const newPieces: PiecePosition[] = [];
    SQUARES.forEach((square) => {
      const piece = c.get(square);
      if (piece) {
        newPieces.push({
          square,
          type: piece.type,
          color: piece.color,
          key: `${square}-${piece.color}${piece.type}`,
        });
      }
    });
    setPieces(newPieces);
  }, [fen]);

  const handleSquareClick = (square: string) => {
    if (!isSessionActive) return;

    const piece = chess.get(square as Square);

    if (!selected) {
      if (piece && piece.color === chess.turn()) setSelected(square);
      return;
    }

    if (selected === square) {
      setSelected(null);
      return;
    }

    const move = { from: selected, to: square, promotion: "q" };
    const moveStr = move.from + move.to;
    const isCorrect = moveStr === solution[solvedIndex];

    if (isCorrect) {
      chess.move(move);
      setChess(new Chess(chess.fen()));
      updatePiecePositions();
    }

    onMove(moveStr, isCorrect);
    setSelected(null);
  };

  const turnText = chess.turn() === "w" ? "White to move" : "Black to move";

  const isFlipped = chess.turn() === "b";

  return (
    <div
      className="w-full max-w-[480px] mx-auto transition-opacity"
      style={{ opacity: isSessionActive ? 1 : 0.5 }}
    >
      <p className="text-center text-muted-foreground mb-2">{turnText}</p>

      <div className={isFlipped ? "rotate-180" : ""}>
        <div
          ref={boardRef}
          className="relative grid grid-cols-8 w-full aspect-square rounded overflow-hidden border border-neutral-400"
        >
          {/* Squares */}
          {[...Array(64)].map((_, i) => {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const square = String.fromCharCode(97 + col) + (8 - row);
            const isSelected = selected === square;
            const isHighlight = highlight === square;

            return (
              <div
                key={square}
                className={cn(
                  "relative w-full h-full aspect-square cursor-pointer",
                  getSquareColor(i),
                  isSelected && "ring-2 ring-yellow-400",
                  isHighlight &&
                    "before:absolute before:inset-0 before:bg-red-500/40"
                )}
                onClick={() => handleSquareClick(square)}
              />
            );
          })}

          {/* Animated Pieces */}
          {pieces.map((p) => {
            const { x, y } = squareToCoords(p.square);
            const left = `${(x / 8) * 100}%`;
            const top = `${((7 - y) / 8) * 100}%`; // invert Y for top-to-bottom board

            return (
              <div
                key={p.key}
                className="absolute transition-all duration-300 ease-in-out pointer-events-none"
                style={{
                  left,
                  top,
                  width: "12.5%",
                  height: "12.5%",
                }}
              >
                <Image
                  src={getPieceImg({ color: p.color, type: p.type })}
                  alt={`${p.color}${p.type}`}
                  fill
                  className={cn(
                    "object-contain select-none",
                    isFlipped && "rotate-180"
                  )}
                  priority
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
