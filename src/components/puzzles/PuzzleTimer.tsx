"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

type PuzzleTimerProps = {
  startTime: number | null;
  isRunning: boolean;
};

export default function PuzzleTimer({ startTime, isRunning }: PuzzleTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!startTime) {
      return;
    }

    // Calculate initial elapsed time
    const updateElapsedTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(elapsed);
    };

    // Update immediately when timer starts or startTime changes
    updateElapsedTime();

    // Only set up interval if timer is running
    if (isRunning) {
      const interval = setInterval(updateElapsedTime, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, isRunning]);

  // Reset to 0 only when startTime changes (new puzzle)
  useEffect(() => {
    setElapsedSeconds(0);
  }, [startTime]);

  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span className="text-sm font-medium">{elapsedSeconds}s</span>
    </div>
  );
}
