import { Eye, Puzzle as PuzzleIcon, Repeat as RepeatIcon, RotateCcw, ArrowRight, Search, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import AnimatedBoard from "@/components/puzzles/chess-board";
import { useEffect, useState } from "react";
import { useThemeAccentColor } from "@/lib/hooks/useThemeAccentColor";
import { useTheme } from "next-themes";

type ChessBoardWrapperProps = {
  fen: string;
  solution: string[];
  solvedIndex: number;
  puzzleSession: {
    handleMove: (move: string, isCorrect: boolean) => Promise<void>;
    isSessionActive: boolean;
    handleStartSession: () => Promise<void>;
    setHintUsed: (used: boolean) => void;
    showFeedbackButtons: boolean;
    handleContinueToNext: () => Promise<void>;
    handleRetryPuzzle: () => Promise<void>;
    handleShowReplay: () => Promise<void>;
  };
  highlight: string | null;
  setHighlight: (highlight: string | null) => void;
  playerSide: "w" | "b";
  selectedSetId: number | null;
  setAccuracies: Record<number, { correct: number; incorrect: number }>;
  currentPuzzleIndex: number;
  currentRepeatIndex: number;
  selectedSet: {
    repeats: number;
    size: number;
  };
};

export default function ChessBoardWrapper({
  fen,
  solution,
  solvedIndex,
  puzzleSession,
  highlight,
  setHighlight,
  playerSide,
  selectedSetId,
  setAccuracies,
  currentPuzzleIndex,
  currentRepeatIndex,
  selectedSet,
}: ChessBoardWrapperProps) {
  const themeColor = useThemeAccentColor();
  const { resolvedTheme } = useTheme();
  const [glow, setGlow] = useState(false);
  const [showHintHighlight, setShowHintHighlight] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  useEffect(() => {
    if (selectedSetId && puzzleSession && !puzzleSession.isSessionActive) {
      console.log(
        "[ChessBoardWrapper] selectedSetId ready. Starting session..."
      );
      puzzleSession.handleStartSession();
    }
  }, [selectedSetId, puzzleSession]);

  // Handle smooth popup enter animation
  useEffect(() => {
    if (puzzleSession.showFeedbackButtons) {
      // Small delay before content animation for smooth entry
      const timer = setTimeout(() => {
        setIsAnimatingIn(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Reset animation state when hiding
      setIsAnimatingIn(false);
    }
  }, [puzzleSession.showFeedbackButtons]);

  // Timer for hint button highlighting
  useEffect(() => {
    setShowHintHighlight(false); // Reset highlight state
    
    // Only start timer when puzzle session is active (fully loaded)
    if (!puzzleSession.isSessionActive) {
      return;
    }

    const timer = setTimeout(() => {
      setShowHintHighlight(true);
    }, 7000); // 7 seconds after puzzle loads or user makes a move

    return () => clearTimeout(timer); // Cleanup timer
  }, [puzzleSession.isSessionActive, solvedIndex]); // Reset when puzzle loads or user makes moves

  // Create hint button styling based on theme and highlight state
  const getHintButtonClasses = () => {
    const baseClasses = "flex items-center p-2 transition-all duration-300";
    if (!showHintHighlight) {
      return baseClasses;
    }


    return `${baseClasses} border-2 rounded-md`;
  };

  const getHintButtonStyle = () => {
    if (!showHintHighlight) return {};

    const outlineColor = resolvedTheme === "dark"
      ? "rgb(244, 67, 54)" // red for dark mode
      : "rgb(66, 165, 245)"; // blue for light mode

    return {
      borderColor: outlineColor,
      boxShadow: `0 0 8px ${outlineColor}40` // 40 for opacity
    };
  };

  return (
    <div className="mx-auto ">
      <Card className={`transition-opacity duration-500 ${puzzleSession.showFeedbackButtons ? 'opacity-50' : 'opacity-100'}`}>
        <CardContent className="px-0 mx-auto ">
          <div
            className=" transition-all duration-300"
            onMouseEnter={() => setGlow(true)}
            onMouseLeave={() => setGlow(false)}
            style={{
              boxShadow: glow
                ? `0 0 18px 2px ${themeColor}`
                : `0 0 12px 1px ${themeColor}`,
              padding: "0.0rem",
            }}
          >
            <AnimatedBoard
              fen={fen}
              solution={solution}
              solvedIndex={solvedIndex}
              onMove={puzzleSession.handleMove}
              highlight={highlight}
              isSessionActive={puzzleSession.isSessionActive}
              sideOnBottom={playerSide}
            />
          </div>
        </CardContent>

        <CardFooter className="px-3 py-2 flex justify-center">
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
            {/* Accuracy */}
            <div className="flex items-center gap-1">
              <span className="whitespace-nowrap">Accuracy:</span>
              <span className="font-medium">
                {selectedSetId !== null && setAccuracies[selectedSetId]
                  ? `${Math.round(
                    (setAccuracies[selectedSetId].correct /
                      (setAccuracies[selectedSetId].correct +
                        setAccuracies[selectedSetId].incorrect || 1)) *
                    100
                  )}%`
                  : "N/A"}
              </span>
            </div>

            {/* Puzzle Progress */}
            <div className="flex items-center gap-1">
              <PuzzleIcon className="w-4 h-4" />
              <span>
                {currentPuzzleIndex} / {selectedSet.size}
              </span>
            </div>

            {/* Repeat Progress */}
            <div className="flex items-center gap-1">
              <RepeatIcon className="w-4 h-4" />
              <span>
                {currentRepeatIndex} / {selectedSet.repeats}
              </span>
            </div>

            {/* Hint Button */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                className={getHintButtonClasses()}
                style={getHintButtonStyle()}
                onClick={() => {
                  const move = solution[solvedIndex];
                  if (move) {
                    setHighlight(move.slice(2));
                  } else {
                    setHighlight(null);
                  }
                  puzzleSession.setHintUsed(true);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Hint
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Feedback Buttons Overlay */}
      {puzzleSession.showFeedbackButtons && (
        <div className={`fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-opacity duration-200 ease-out ${puzzleSession.showFeedbackButtons ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-card/70 backdrop-blur-md border border-border rounded-xl p-6 max-w-md mx-4 transform transition-all duration-300 ease-out ${isAnimatingIn ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-8 opacity-0'}`}>
            <div className="space-y-3">
              {/* Continue to Next */}
              <Button
                onClick={puzzleSession.handleContinueToNext}
                className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 py-3"
              >
                <ArrowRight className="h-4 w-4" />
                Continue
              </Button>

              {/* Retry Puzzle */}
              <Button
                onClick={puzzleSession.handleRetryPuzzle}
                variant="outline"
                className="w-full flex items-center justify-center gap-3 py-3"
              >
                <RotateCcw className="h-4 w-4" />
                Retry Puzzle
              </Button>

              {/* Show Replay */}
              <Button
                onClick={puzzleSession.handleShowReplay}
                variant="outline"
                className="w-full flex items-center justify-center gap-3 py-3"
              >
                <Play className="h-4 w-4" />
                Show Replay
              </Button>

              {/* Analyze Puzzle - Disabled */}
              <Button
                disabled
                variant="ghost"
                className="w-full flex items-center justify-center gap-3 py-3 opacity-50 cursor-not-allowed"
              >
                <Search className="h-4 w-4" />
                Analyze Puzzle
              </Button>

              {/* Export - Disabled */}
              <Button
                disabled
                variant="ghost"
                className="w-full flex items-center justify-center gap-3 py-3 opacity-50 cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
