import { NextRequest, NextResponse } from "next/server";
import { puzzleService } from "@/lib/services/puzzleService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing puzzle ID" }, { status: 400 });
  }

  try {
    console.log(`🎯 API: Getting puzzle by ID: ${id}`);

    // Get full puzzle data from our CSV service
    const puzzle = await puzzleService.getFullPuzzle(id);

    if (!puzzle) {
      console.log(`❌ API: Puzzle ${id} not found`);
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    console.log(`✅ API: Found puzzle ${id}, rating: ${puzzle.rating}`);

    // Format response to match previous Lichess API structure
    const response = {
      puzzle: {
        id: puzzle.id,
        rating: puzzle.rating,
        themes: puzzle.themes,
        solution: puzzle.moves
      },
      game: {
        fen: puzzle.fen,
        pgn: "", // We don't have PGN data in CSV
        moves: puzzle.moves,
        url: puzzle.gameUrl
      }
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("❌ API Error: Failed to fetch puzzle by ID:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch puzzle: ${message}` },
      { status: 500 }
    );
  }
}
