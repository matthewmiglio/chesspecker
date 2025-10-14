/**
 * Puzzle themes with over 10,000 puzzles in the database.
 * These are the canonical theme strings used throughout the application.
 */
export const PUZZLE_THEMES_OVER_10K = [
  "endgame",
  "middlegame",
  "crushing",
  "mate",
  "mateIn1",
  "mateIn2",
  "fork",
  "sacrifice",
  "pin",
  "rookEndgame",
  "discoveredAttack",
  "opening",
  "deflection",
  "quietMove",
  "attraction",
  "pawnEndgame",
  "hangingPiece",
  "mateIn3",
  "backRankMate",
  "promotion",
  "skewer",
] as const;

export type PuzzleTheme = typeof PUZZLE_THEMES_OVER_10K[number];

/**
 * Map of lowercase theme names to canonical theme strings for case-insensitive matching.
 */
const THEME_NORMALIZATION_MAP = PUZZLE_THEMES_OVER_10K.reduce((acc, theme) => {
  acc[theme.toLowerCase()] = theme;
  return acc;
}, {} as Record<string, string>);

/**
 * Normalizes a theme string to its canonical form (case-insensitive).
 * Returns undefined if the theme is not in the allowed list.
 */
export function normalizeTheme(theme: string): string | undefined {
  return THEME_NORMALIZATION_MAP[theme.toLowerCase()];
}

/**
 * Validates and normalizes an array of theme strings.
 * Returns only valid, normalized themes (duplicates removed).
 */
export function validateThemes(themes: string[]): string[] {
  const normalized = new Set<string>();

  for (const theme of themes) {
    const normalizedTheme = normalizeTheme(theme);
    if (normalizedTheme) {
      normalized.add(normalizedTheme);
    }
  }

  return Array.from(normalized);
}

/**
 * Human-readable display names for themes (optional, for UI).
 */
export const THEME_DISPLAY_NAMES: Record<string, string> = {
  endgame: "Endgame",
  middlegame: "Middlegame",
  crushing: "Crushing",
  mate: "Mate",
  mateIn1: "Mate in 1",
  mateIn2: "Mate in 2",
  mateIn3: "Mate in 3",
  fork: "Fork",
  sacrifice: "Sacrifice",
  pin: "Pin",
  rookEndgame: "Rook Endgame",
  discoveredAttack: "Discovered Attack",
  opening: "Opening",
  deflection: "Deflection",
  quietMove: "Quiet Move",
  attraction: "Attraction",
  pawnEndgame: "Pawn Endgame",
  hangingPiece: "Hanging Piece",
  backRankMate: "Back Rank Mate",
  promotion: "Promotion",
  skewer: "Skewer",
};
