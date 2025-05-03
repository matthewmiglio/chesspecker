"use client";

import type React from "react";



type PuzzleSetCreationProgressProps = {
  puzzleProgress: number;
  accuracyProgress: number;
};

export default function PuzzleSetCreationProgress({
  puzzleProgress,
  accuracyProgress,
}: PuzzleSetCreationProgressProps) {
  return (
    <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="w-md max-w-[90%] p-6 bg-white rounded-xl shadow-lg space-y-6">
        <h2 className="text-xl font-semibold text-center">
          Creating Puzzle Set...
        </h2>

        <div>
          <p className="text-sm font-medium">Generating Puzzles</p>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${puzzleProgress}%` }}
            />
          </div>
          <p className="text-right text-xs mt-1">{puzzleProgress}%</p>
        </div>

        <div>
          <p className="text-sm font-medium">Creating Accuracy Rows</p>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${accuracyProgress}%` }}
            />
          </div>
          <p className="text-right text-xs mt-1">{accuracyProgress}%</p>
        </div>
      </div>
    </div>
  );
}
