import { NextResponse } from "next/server";
import { puzzleService } from "@/lib/services/puzzleService";

export async function GET() {
  try {
    // Initialize service if not already done
    await puzzleService.initialize();

    const difficultyStats = puzzleService.getDifficultyStats();
    const cacheStats = puzzleService.getCacheStats();

    return NextResponse.json({
      success: true,
      difficultyDistribution: difficultyStats,
      cache: cacheStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to get puzzle stats: ${message}` },
      { status: 500 }
    );
  }
}