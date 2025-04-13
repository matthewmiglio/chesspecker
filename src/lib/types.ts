export interface User {
  user_id: number;
  email: string;
  pass: string;
  username?: string;
  created?: string;
}

export type AccuracyRecord = {
  correct: number;
  incorrect: number;
};

export type RepeatAccuracy = {
  repeat: number;
  correct: number;
  incorrect: number;
};

export type PuzzleSet = {
  set_id: number;
  name: string;
  user_id: string;
  elo: number;
  size: number;
  repeats: number;
  puzzle_ids: string[];
  repeat_index: number;
  puzzle_index: number;
};

export type PuzzleData = {
  puzzle: Puzzle;
  game: Game;
};

export type Puzzle = {
  id: string;
  initialPly: number;
  solution: string[];
  set_id: number;
  repeat_index: number;
  puzzle_index: number;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Game = {
  pgn: string;
};
