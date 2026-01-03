import { Eye, Puzzle as PuzzleIcon, Repeat as RepeatIcon, RotateCcw, ArrowRight, Copy, Play, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedBoard from "@/components/puzzles/chess-board";
import PuzzleTimer from "@/components/puzzles/PuzzleTimer";
import { useEffect, useState } from "react";
import { useThemeAccentColor } from "@/lib/hooks/useThemeAccentColor";
import { ChessPeckerPuzzle } from "@/lib/types";
import { useToast } from "@/lib/hooks/useToast";

// Board color themes
export const BOARD_THEMES = [
  { name: "Classic Blue", dark: "#5994EF", light: "#F2F6FA" },
  { name: "Traditional Brown", dark: "#B58863", light: "#F0D9B5" },
  { name: "Forest Green", dark: "#769656", light: "#EEEED2" },
  { name: "Ocean Blue", dark: "#4A90A4", light: "#FFFFFF" },
  { name: "Purple Haze", dark: "#9F7AEA", light: "#E9D5FF" },
  { name: "Sunset Orange", dark: "#F97316", light: "#FED7AA" },
  { name: "Bubblegum Pink", dark: "#EC4899", light: "#FCE7F3" },
  { name: "Neon Cyber", dark: "#10B981", light: "#1F2937" },
  { name: "Lava Red", dark: "#DC2626", light: "#FEE2E2" },
  { name: "Cosmic Purple", dark: "#7C3AED", light: "#1E1B4B" },
] as const;

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
    puzzleStartTime: number | null;
    isTimerRunning: boolean;
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
  puzzleSetName: string;
  resetKey: number;
  boardThemeIndex?: number;
  setBoardThemeIndex?: (index: number) => void;
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
  puzzleSetName,
  resetKey,
  boardThemeIndex = 0,
  setBoardThemeIndex,
}: ChessBoardWrapperProps) {
  const themeColor = useThemeAccentColor();
  const { success, error } = useToast();
  const [showHintHighlight, setShowHintHighlight] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [autoNextPuzzle, setAutoNextPuzzle] = useState(false);
  const [isCopyPressed, setIsCopyPressed] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  // Get current theme colors
  const currentTheme = BOARD_THEMES[boardThemeIndex] || BOARD_THEMES[0];


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

  const handleCopyFen = async () => {
    if (!puzzleIds || puzzleIds.length === 0 || currentPuzzleIndex >= puzzleIds.length) {
      error("No puzzle available to copy");
      return;
    }

    // Get the starting FEN from puzzle data (not current position)
    const startingFen = puzzleSession.currentPuzzleData?.puzzle?.FEN || fen;

    // Trigger pressed animation
    setIsCopyPressed(true);
    setTimeout(() => setIsCopyPressed(false), 150);

    try {
      await navigator.clipboard.writeText(startingFen);
      success("FEN copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy FEN to clipboard:', err);
      error("Failed to copy FEN to clipboard");
    }
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
        <Card className="py-6 flex-1 lg:max-w-[65%]">
          <CardContent className="p-0 mx-auto">
            {/* Puzzle Set Title with Timer */}
            <div className="flex items-center mb-4 px-4">
              <div className="flex-shrink-0">
                <PuzzleTimer
                  startTime={puzzleSession.puzzleStartTime}
                  isRunning={puzzleSession.isTimerRunning}
                />
              </div>
              <div className="flex-1 text-center">
                <h2 className="text-3xl font-bold tracking-tight">{playerSide === "w" ? "White to move" : "Black to move"}</h2>
              </div>
              <div className="flex-shrink-0 w-[60px]"></div>
            </div>
            <AnimatedBoard
              fen={fen}
              solution={solution}
              solvedIndex={solvedIndex}
              onMove={puzzleSession.handleMove}
              highlight={highlight}
              isSessionActive={puzzleSession.isSessionActive}
              sideOnBottom={playerSide}
              currentPuzzleIndex={currentPuzzleIndex}
              resetKey={resetKey}
              darkSquareColor={currentTheme.dark}
              lightSquareColor={currentTheme.light}
            />
          </CardContent>
        </Card>

        {/* Right: Stats & Controls Panel - CARBON Style */}
        <div className="flex-1 lg:max-w-[35%] bg-zinc-900 border-l-4 p-6" style={{ borderColor: themeColor }}>
          <div className="space-y-5">

            {/* Accuracy Stat Card */}
            <div className="bg-zinc-800 border-l-2 p-4" style={{ borderColor: getAccuracyColor() }}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-mono">Accuracy</span>
                <span className="text-3xl font-bold font-mono" style={{ color: getAccuracyColor() }}>
                  {accuracy !== null ? `${accuracy}%` : "N/A"}
                </span>
              </div>
            </div>

            {/* Puzzle Progress Card */}
            <div className="bg-zinc-800 border-l-2 border-blue-500 p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PuzzleIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-mono">Puzzle</span>
                </div>
                <span className="text-2xl font-bold text-blue-400 font-mono">
                  {currentPuzzleIndex} / {selectedSet.size}
                </span>
              </div>
            </div>

            {/* Repeat Progress Card */}
            <div className="bg-zinc-800 border-l-2 border-purple-500 p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <RepeatIcon className="w-4 h-4 text-purple-500" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-mono">Repeat</span>
                </div>
                <span className="text-2xl font-bold text-purple-400 font-mono">
                  {currentRepeatIndex} / {selectedSet.repeats}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-zinc-700" />

            {/* Board Theme Selector */}
            <div className="relative">
              <div className="flex items-center justify-between p-3 bg-zinc-800">
                <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-mono">Board Theme</span>
                <button
                  onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-zinc-600 hover:bg-zinc-700 transition-colors"
                >
                  <Palette className="h-3 w-3 text-zinc-400" />
                  <span className="text-xs text-zinc-300">{currentTheme.name}</span>
                </button>
              </div>

              {/* Dropdown menu */}
              {showThemeDropdown && (
                <div className="absolute right-0 top-full mt-1 w-full bg-zinc-900 border border-zinc-700 z-10 max-h-64 overflow-y-auto">
                  {BOARD_THEMES.map((theme, index) => (
                    <button
                      key={theme.name}
                      onClick={() => {
                        setBoardThemeIndex?.(index);
                        setShowThemeDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800 transition-colors ${
                        index === boardThemeIndex ? 'bg-zinc-800' : ''
                      }`}
                    >
                      <span className="text-xs text-zinc-300">{theme.name}</span>
                      <div className="flex gap-1">
                        <div className="w-5 h-5 border border-zinc-600" style={{ backgroundColor: theme.dark }} />
                        <div className="w-5 h-5 border border-zinc-600" style={{ backgroundColor: theme.light }} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auto Next Puzzle Toggle */}
            <div className="flex items-center justify-between p-3 bg-zinc-800">
              <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-mono">Auto Next</span>
              <button
                onClick={() => {
                  setAutoNextPuzzle(!autoNextPuzzle);
                  puzzleSession.setAutoNextPuzzle(!autoNextPuzzle);
                }}
                className={`w-11 h-6 rounded-none border border-zinc-600 transition-colors ${autoNextPuzzle ? 'bg-emerald-600' : 'bg-zinc-700'}`}
              >
                <span className={`block w-4 h-4 bg-white transform transition-transform ${autoNextPuzzle ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Auto Show Solution Toggle */}
            <div className="flex items-center justify-between p-3 bg-zinc-800">
              <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-mono">Auto Solution</span>
              <button
                onClick={() => setAutoShowSolution(!autoShowSolution)}
                className={`w-11 h-6 rounded-none border border-zinc-600 transition-colors ${autoShowSolution ? 'bg-emerald-600' : 'bg-zinc-700'}`}
              >
                <span className={`block w-4 h-4 bg-white transform transition-transform ${autoShowSolution ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Hint Button */}
            <button
              className="w-full flex items-center justify-center gap-2 p-3 rounded-none border-2 text-white hover:bg-opacity-20 transition-all font-mono text-sm uppercase tracking-wider"
              style={{
                borderColor: showHintHighlight ? 'rgb(244, 67, 54)' : themeColor,
                backgroundColor: showHintHighlight ? 'rgba(244, 67, 54, 0.15)' : `${themeColor}15`,
                boxShadow: showHintHighlight ? '0 0 8px rgba(244, 67, 54, 0.4)' : undefined
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
              <Eye className="h-4 w-4" />
              Show Hint
            </button>

          </div>
        </div>
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

              {/* Copy FEN */}
              <Button
                onClick={handleCopyFen}
                variant="ghost"
                className={`w-full flex items-center justify-center gap-3 py-3 transition-all duration-150 hover:bg-muted/80 hover:scale-[1.02] active:scale-95 active:brightness-75 ${
                  isCopyPressed ? 'scale-95 brightness-75' : ''
                }`}
              >
                <Copy className="h-4 w-4" />
                Copy FEN
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
