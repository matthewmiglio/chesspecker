import { Eye, Puzzle as PuzzleIcon, Repeat as RepeatIcon, RotateCcw, ArrowRight, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import AnimatedBoard from "@/components/puzzles/chess-board";
import { useEffect, useState } from "react";
import { useThemeAccentColor } from "@/lib/hooks/useThemeAccentColor";
import { ChessPeckerPuzzle } from "@/lib/types";

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
    handleManualShowSolution: () => Promise<void>;
    currentPuzzleData: { puzzle: ChessPeckerPuzzle } | null;
    setAutoNextPuzzle: (value: boolean) => void;
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
  autoShowSolution: boolean;
  setAutoShowSolution: (value: boolean) => void;
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
  autoShowSolution,
  setAutoShowSolution,
}: ChessBoardWrapperProps) {
  const themeColor = useThemeAccentColor();
  const [showHintHighlight, setShowHintHighlight] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [autoNextPuzzle, setAutoNextPuzzle] = useState(false);

  useEffect(() => {
    if (selectedSetId && puzzleSession && !puzzleSession.isSessionActive) {
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

    // Always use red color for dark mode
    const outlineColor = "rgb(244, 67, 54)";

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

    // Get the starting FEN from puzzle data (not current position)
    const startingFen = puzzleSession.currentPuzzleData?.puzzle?.FEN || fen;

    // Create a blob with the starting FEN data
    const blob = new Blob([startingFen], { type: 'text/plain' });
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

  // Calculate accuracy percentage and color
  const accuracy = selectedSetId !== null && setAccuracies[selectedSetId]
    ? Math.round(
      (setAccuracies[selectedSetId].correct /
        (setAccuracies[selectedSetId].correct +
          setAccuracies[selectedSetId].incorrect || 1)) *
      100
    )
    : null;

  const getAccuracyColor = () => {
    if (accuracy === null) return 'rgb(156, 163, 175)'; // gray
    if (accuracy >= 80) return 'rgb(34, 197, 94)'; // green
    if (accuracy >= 60) return 'rgb(234, 179, 8)'; // yellow
    return 'rgb(239, 68, 68)'; // red
  };

  return (
    <div className="mx-auto">
      {/* Side-by-side layout: Board | Stats */}
      <div className={`flex flex-col lg:flex-row gap-6 transition-opacity duration-500 ${puzzleSession.showFeedbackButtons ? 'opacity-50' : 'opacity-100'}`}>

        {/* Left: Chess Board */}
        <Card className="py-10 flex-1 lg:max-w-[65%]">
          <CardContent className="p-0 mx-auto">
            <AnimatedBoard
              fen={fen}
              solution={solution}
              solvedIndex={solvedIndex}
              onMove={puzzleSession.handleMove}
              highlight={highlight}
              isSessionActive={puzzleSession.isSessionActive}
              sideOnBottom={playerSide}
              currentPuzzleIndex={currentPuzzleIndex}
            />
          </CardContent>
        </Card>

        {/* Right: Stats & Controls Panel */}
        <Card className="flex-1 lg:max-w-[35%] p-6">
          <div className="space-y-6">

            {/* Accuracy Stat Card */}
            <div
              className="p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg"
              style={{
                borderColor: getAccuracyColor(),
                backgroundColor: `${getAccuracyColor()}15`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Accuracy</span>
                <div
                  className="text-3xl font-bold"
                  style={{ color: getAccuracyColor() }}
                >
                  {accuracy !== null ? `${accuracy}%` : "N/A"}
                </div>
              </div>
            </div>

            {/* Puzzle Progress Card */}
            <div
              className="p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg"
              style={{
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PuzzleIcon className="w-5 h-5" style={{ color: 'rgb(59, 130, 246)' }} />
                  <span className="text-sm text-muted-foreground">Puzzle</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: 'rgb(59, 130, 246)' }}>
                  {currentPuzzleIndex} / {selectedSet.size}
                </div>
              </div>
            </div>

            {/* Repeat Progress Card */}
            <div
              className="p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg"
              style={{
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RepeatIcon className="w-5 h-5" style={{ color: 'rgb(168, 85, 247)' }} />
                  <span className="text-sm text-muted-foreground">Repeat</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: 'rgb(168, 85, 247)' }}>
                  {currentRepeatIndex} / {selectedSet.repeats}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border"></div>

            {/* Auto Next Puzzle Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Auto Next</span>
              <button
                onClick={() => {
                  setAutoNextPuzzle(!autoNextPuzzle);
                  puzzleSession.setAutoNextPuzzle(!autoNextPuzzle);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                style={{
                  backgroundColor: autoNextPuzzle ? themeColor : 'rgb(156, 163, 175)',
                  boxShadow: autoNextPuzzle ? `0 0 8px ${themeColor}60` : undefined
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                    autoNextPuzzle ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Auto Show Solution Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Auto Solution</span>
              <button
                onClick={() => setAutoShowSolution(!autoShowSolution)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                style={{
                  backgroundColor: autoShowSolution ? themeColor : 'rgb(156, 163, 175)',
                  boxShadow: autoShowSolution ? `0 0 8px ${themeColor}60` : undefined
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                    autoShowSolution ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Hint Button */}
            <Button
              variant="outline"
              className={`w-full ${getHintButtonClasses()}`}
              style={{
                ...getHintButtonStyle(),
                borderWidth: '2px',
              }}
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
              <Eye className="h-5 w-5 mr-2" />
              <span className="font-semibold">Show Hint</span>
            </Button>

          </div>
        </Card>
      </div>

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

              {/* Show/Replay Solution Button */}
              <Button
                onClick={autoShowSolution ? puzzleSession.handleShowReplay : puzzleSession.handleManualShowSolution}
                variant="outline"
                className="w-full flex items-center justify-center gap-3 py-3"
              >
                <Play className="h-4 w-4" />
                {autoShowSolution ? "Replay Solution" : "Show Solution"}
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
