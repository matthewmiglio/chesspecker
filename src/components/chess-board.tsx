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
  id: string; // unique per piece
  square: Square;
  type: string;
  color: "w" | "b";
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
  const pieceIdMap = useRef<Map<string, string>>(new Map());
  const [lastPlayerToMove, setLastPlayerToMove] = useState<"w" | "b">("w");

  const boardRef = useRef<HTMLDivElement>(null);

  // Helpers
  const squareToCoords = (square: Square) => {
    const file = square.charCodeAt(0) - "a".charCodeAt(0);
    const rank = 8 - parseInt(square[1]);
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
          id: generateStablePieceId(square, piece),
          square,
          type: piece.type,
          color: piece.color,
        });
      }
    });
    setPieces(newPieces);
  };
  const generateStablePieceId = (square: Square, piece: any): string => {
    const key = `${piece.color}${piece.type}-${square}`;
    if (!pieceIdMap.current.has(key)) {
      pieceIdMap.current.set(key, crypto.randomUUID());
    }
    return pieceIdMap.current.get(key)!;
  };

  useEffect(() => {
    pieceIdMap.current.clear(); // 🔄 clear map on board reset

    const c = new Chess();
    c.load(fen);
    setChess(c);
    setSelected(null);

    const newPieces: PiecePosition[] = [];
    SQUARES.forEach((square) => {
      const piece = c.get(square);
      if (piece) {
        newPieces.push({
          id: generateStablePieceId(square, piece),
          square,
          type: piece.type,
          color: piece.color,
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

    setLastPlayerToMove(chess.turn()); // Cache who's making the move
    if (isCorrect) {
      // Player's move
      chess.move(move);

      // Trigger piece animation visually
      setPieces((prev) =>
        prev
          .filter((p) => p.square !== move.to) // preemptively remove captured piece
          .map((p) =>
            p.square === move.from ? { ...p, square: move.to as Square } : p
          )
      );

      // Delay to allow animation
      setTimeout(() => {
        // Handle computer reply move (optional)
        const replyUci = solution[solvedIndex + 1];
        if (replyUci) {
          const replyMove = {
            from: replyUci.slice(0, 2),
            to: replyUci.slice(2, 4),
            promotion: replyUci.length > 4 ? replyUci.slice(4) : undefined,
          };
          chess.move(replyMove);
        }

        updatePiecePositions(); // refresh from real chess state
      }, 300);
    }

    onMove(moveStr, isCorrect);
    setSelected(null);
  };

  const puzzleIsFinished = solvedIndex >= solution.length - 1;
  const isFlipped = puzzleIsFinished
    ? lastPlayerToMove === "b"
    : chess.turn() === "b";

  const turnText = chess.turn() === "w" ? "White to move" : "Black to move";

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
            const translateX = x * 100;
            const translateY = y * 100;

            return (
              <div
                key={p.id}
                className="absolute w-[12.5%] h-[12.5%] transition-transform duration-300 ease-in-out pointer-events-none"
                style={{
                  transform: `translate(${translateX}%, ${translateY}%)`,
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
