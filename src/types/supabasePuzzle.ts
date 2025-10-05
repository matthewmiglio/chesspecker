export interface ChessPeckerPuzzle {
  PuzzleId: string;
  FEN: string;
  Moves: string[];
  Rating: number;
  RatingDeviation: number;
  Popularity: number;
  NbPlays: number;
  Themes: string[];
  GameUrl: string;
  OpeningTags: string[] | null;
}
