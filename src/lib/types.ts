export interface User {
  user_id: number;
  email: string;
  pass: string;
  username?: string;
  created?: string;
}
// types.ts

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
  difficulties: string[];
  size: number;
  repeats: number;
  puzzle_ids: string[];
  repeat_index: number;
  puzzle_index: number;
  created_at?: string;
  updated_at?: string;
};
