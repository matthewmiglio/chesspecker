export type ChessPeckerSet = {
  set_id: number;
  email: string;
  puzzle_ids: string[];
  elo: number;
  size: number;
  repeats: number;
  name: string;
  repeat_index: number;
  puzzle_index: number;
  create_time: string; // ISO timestamp
};
