import { NextRequest, NextResponse } from "next/server";
import { puzzleService } from "@/lib/services/puzzleService";

export async function POST(req: NextRequest) {
  const { difficulty = "normal", theme } = await req.json();

  try {
    // Get random puzzle from our CSV data
    const puzzle = await puzzleService.getRandomPuzzle(difficulty);

    if (!puzzle) {
      return NextResponse.json({ error: "No puzzle found for difficulty" }, { status: 404 });
    }

    // Format response to match previous Lichess API structure
    const response = {
      puzzle: {
        id: puzzle.id,
        rating: puzzle.rating,
        themes: puzzle.themes
      },
      game: {
        fen: puzzle.fen,
        pgn: "", // We don't have PGN data, but FEN is what we need
        moves: puzzle.moves
      }
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to get puzzle from CSV:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
