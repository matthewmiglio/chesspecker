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
  puzzleIds: string[];
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
  puzzleIds,
}: ChessBoardWrapperProps) {
  const themeColor = useThemeAccentColor();
  const { resolvedTheme } = useTheme();
  const [glow, setGlow] = useState(false);
  const [showHintHighlight, setShowHintHighlight] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [autoNextPuzzle, setAutoNextPuzzle] = useState(false);

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

  // Auto-advance to next puzzle when auto mode is enabled
  useEffect(() => {
    if (autoNextPuzzle && puzzleSession.showFeedbackButtons) {
      const timer = setTimeout(() => {
        puzzleSession.handleContinueToNext();
      }, 1000); // 1 second delay before auto-advancing

      return () => clearTimeout(timer);
    }
  }, [autoNextPuzzle, puzzleSession, puzzleSession.showFeedbackButtons, puzzleSession.handleContinueToNext]);

  // Timer for hint button highlighting
  useEffect(() => {
    setShowHintHighlight(false); // Reset highlight state

    // Only start timer when session is active AND we have a loaded puzzle
    if (!puzzleSession.isSessionActive || !fen) {
      return;
    }

    const timer = setTimeout(() => {
      setShowHintHighlight(true);
    }, 7000); // 7 seconds after puzzle loads

    return () => clearTimeout(timer); // Cleanup timer
  }, [puzzleSession.isSessionActive, fen]); // Reset only when puzzle loads, not when user makes moves

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

  const handleExportPuzzle = () => {
    if (!puzzleIds || puzzleIds.length === 0 || currentPuzzleIndex >= puzzleIds.length) {
      return;
    }

    const currentPuzzleId = puzzleIds[currentPuzzleIndex];
    const filename = `chesspecker_${currentPuzzleId}.fen`;

    // Create a blob with the FEN data
    const blob = new Blob([fen], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create a temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Trigger the download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

            {/* Auto Next Puzzle Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Auto Next</span>
              <button
                onClick={() => setAutoNextPuzzle(!autoNextPuzzle)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  autoNextPuzzle
                    ? 'bg-primary focus:ring-primary'
                    : 'bg-muted focus:ring-muted'
                }`}
                style={{
                  backgroundColor: autoNextPuzzle ? themeColor : undefined,
                  boxShadow: autoNextPuzzle ? `0 0 6px ${themeColor}40` : undefined
                }}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                    autoNextPuzzle ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
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

      {/* Auto Next Indicator */}
      {puzzleSession.showFeedbackButtons && autoNextPuzzle && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-card/90 backdrop-blur-md border border-border rounded-xl p-4 max-w-sm mx-4 text-center">
            <div className="flex items-center justify-center gap-2 text-primary">
              <ArrowRight className="h-5 w-5 animate-pulse" />
              <span className="font-medium">Auto advancing...</span>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Buttons Overlay */}
      {puzzleSession.showFeedbackButtons && !autoNextPuzzle && (
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
                Replay Solution
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

              {/* Export */}
              <Button
                onClick={handleExportPuzzle}
                variant="ghost"
                className="w-full flex items-center justify-center gap-3 py-3"
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
