"use client";

/**
 * Parses a UCI move string (like "e2e4" or "e7e8q") into a move object.
 */
export const parseUCIMove = (uci: string) => ({
  from: uci.slice(0, 2),
  to: uci.slice(2, 4),
  promotion: uci.length > 4 ? uci.slice(4) : undefined,
});

/**
 * Checks if the current puzzle solution has been finished.
 */
export const puzzleIsFinished = (
  solutionLength: number,
  solvedIndex: number
) => {
  const isFinished = solutionLength + 1 === solvedIndex;
  console.log(
    "[puzzleIsFinished] called. solutionLength:",
    solutionLength,
    "solvedIndex:",
    solvedIndex,
    "returning",
    isFinished
  );
  return isFinished;
};

/**
 * Checks if the user has completed all repeats for a set.
 */
export const setIsDone = (
  userSets: { set_id: number; repeats: number }[],
  selectedSetId: number | null,
  currentRepeatIndex: number
) => {
  if (selectedSetId === null) return false;

  const set = userSets.find((s) => s.set_id === selectedSetId);
  if (!set) return false;

  return currentRepeatIndex === set.repeats;
};
