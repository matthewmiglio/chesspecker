// src/components/chess-board.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  fen: string;
  solution: string[];
  solvedIndex: number;
  onMove: (move: string) => void;
  highlight: string | null;
  isSessionActive: boolean;
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
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = new Chess();
    c.load(fen);
    setChess(c);
    setSelected(null);
  }, [fen]);

  const getSquareColor = (i: number) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    return (row + col) % 2 === 0 ? "bg-[#eeeed2]" : "bg-[#769656]";
  };

  const getPieceImg = (piece: any) => {
    const color = piece.color === "w" ? "white" : "black";
    const typeMap: Record<string, string> = {
      p: "pawn", n: "knight", b: "bishop",
      r: "rook", q: "queen", k: "king",
    };
    return `/piece_images/${color}_${typeMap[piece.type]}.png`;
  };

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

    if (moveStr === solution[solvedIndex]) {
      chess.move(move);
      onMove(moveStr);
      setChess(new Chess(chess.fen()));
    } else {
      alert("❌ Incorrect move. Try again.");
    }


    setSelected(null);
  };

  const turnText = chess.turn() === "w" ? "White to move" : "Black to move";

  return (
    <div className="w-full max-w-[480px] mx-auto transition-opacity" style={{ opacity: isSessionActive ? 1 : 0.5 }}>
      <p className="text-center text-muted-foreground mb-2">{turnText}</p>
      <div
        ref={boardRef}
        className="grid grid-cols-8 w-full aspect-square rounded overflow-hidden border border-neutral-400"
      >
        {/* Render bottom-up, left-right to match white's perspective */}
        {[...Array(8)].map((_, rowIdx) => {
          const row = 7 - rowIdx; // flip row
          return [...Array(8)].map((_, col) => {
            const square = String.fromCharCode(97 + col) + (row + 1);
            const piece = chess.get(square as Square);
            const i = row * 8 + col;
            const isSelected = selected === square;
            const isHighlight = highlight === square;

            return (
              <div
                key={square}
                className={cn(
                  "relative w-full h-full aspect-square cursor-pointer",
                  getSquareColor(i),
                  isSelected && "ring-2 ring-yellow-400",
                  isHighlight && "before:absolute before:inset-0 before:bg-red-500/40"
                )}
                onClick={() => handleSquareClick(square)}
              >
                {piece && (
                  <Image
                    src={getPieceImg(piece)}
                    alt={`${piece.color}${piece.type}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 480px"
                    className="object-contain select-none pointer-events-none"
                    priority
                  />

                )}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}
