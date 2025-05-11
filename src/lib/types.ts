import type { usePuzzleSession } from "@/lib/hooks/usePuzzleSession";

export type ReturnTypeUsePuzzleSession = ReturnType<typeof usePuzzleSession>;

export type TimeSeriesPoint = {
  day: string;
  value: number;
};


// src/lib/types.ts

export type AccuracyData = {
  set_id: string;
  repeat_index: number;
  correct: number;
  incorrect: number;
};

export type UserStats = {
  email: string;
  created_at: string;
  puzzle_starts: number;
  correct_puzzles: number;
  incorrect_puzzles: number;
  set_creates: number;
  hints: number;
};

export type DailyStats = {
  day: string;
  correct_puzzles: number;
  incorrect_puzzles: number;
  puzzle_starts: number;
  set_creates: number;
  puzzle_requests: number;
};

export type SetData = {
  set_id: string;
  name: string;
  email: string;
  elo: number;
  size: number;
  repeats: number;
  create_time: string;
};




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
