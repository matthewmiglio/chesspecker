"use client";

import type React from "react";
import { useState, useEffect } from "react";

type PuzzleSetCreationProgressProps = {
  puzzleProgress: number;
  accuracyProgress: number;
};

export default function PuzzleSetCreationProgress({
  puzzleProgress,
  accuracyProgress,
}: PuzzleSetCreationProgressProps) {
  const [startTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [puzzlePhaseComplete, setPuzzlePhaseComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (puzzleProgress >= 100 && !puzzlePhaseComplete) {
      setPuzzlePhaseComplete(true);
    }
  }, [puzzleProgress, puzzlePhaseComplete]);

  const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentStep = () => {
    if (puzzleProgress < 100) {
      return {
        step: 1,
        title: "Generating Puzzles",
        description: "Fetching tactical puzzles from database...",
        substep: puzzleProgress < 25 ? "Initializing puzzle generation..." :
                puzzleProgress < 50 ? "Collecting puzzles from API..." :
                puzzleProgress < 75 ? "Balancing difficulty distribution..." :
                "Finalizing puzzle selection...",
        icon: "🧩"
      };
    } else if (accuracyProgress < 100) {
      return {
        step: 2,
        title: "Setting Up Accuracy Tracking",
        description: "Creating accuracy rows for each repeat cycle...",
        substep: accuracyProgress < 25 ? "Preparing accuracy database..." :
                accuracyProgress < 50 ? "Creating tracking entries..." :
                accuracyProgress < 75 ? "Initializing progress counters..." :
                "Finalizing accuracy setup...",
        icon: "🎯"
      };
    } else {
      return {
        step: 3,
        title: "Completing Setup",
        description: "Finalizing puzzle set creation...",
        substep: "Almost done!",
        icon: "✅"
      };
    }
  };

  const currentStep = getCurrentStep();

  // Calculate estimated completion time
  const totalProgress = (puzzleProgress + accuracyProgress) / 2;
  const estimatedTotalTime = totalProgress > 0 ? (elapsedSeconds / totalProgress) * 100 : 0;
  const estimatedRemainingTime = Math.max(0, estimatedTotalTime - elapsedSeconds);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-primary/10">
       

        {/* Current Step Information */}
        <div className="mb-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="text-primary">{currentStep.icon}</span>
            {currentStep.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-1">
            {currentStep.description}
          </p>
          <p className="text-xs text-muted-foreground italic">
            {currentStep.substep}
          </p>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                ${step < currentStep.step ? 'bg-green-500 text-white' :
                  step === currentStep.step ? 'bg-primary text-primary-foreground animate-pulse' :
                  'bg-muted text-muted-foreground'}
              `}>
                {step < currentStep.step ? '✓' : step}
              </div>
              <span className="text-xs mt-1 text-center">
                {step === 1 ? 'Puzzles' : step === 2 ? 'Tracking' : 'Complete'}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Bars */}
        <div className="space-y-6">
          {/* Puzzle Generation Progress */}
          <div className={puzzlePhaseComplete ? 'opacity-50' : ''}>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-foreground">Generating Puzzles</p>
              <div className="flex items-center gap-2">
                {puzzlePhaseComplete && <span className="text-green-500 text-xs">✓</span>}
                <span className="text-xs text-muted-foreground">{puzzleProgress}%</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  puzzlePhaseComplete ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${puzzleProgress}%` }}
              >
                <div className="h-full bg-gradient-to-r from-transparent to-white/20 animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Accuracy Setup Progress */}
          <div className={accuracyProgress === 0 ? 'opacity-50' : ''}>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-foreground">Setting Up Tracking</p>
              <div className="flex items-center gap-2">
                {accuracyProgress >= 100 && <span className="text-green-500 text-xs">✓</span>}
                <span className="text-xs text-muted-foreground">{accuracyProgress}%</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  accuracyProgress >= 100 ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ width: `${accuracyProgress}%` }}
              >
                <div className="h-full bg-gradient-to-r from-transparent to-white/20 animate-shimmer" />
              </div>
            </div>
          </div>
        </div>

        {/* Time and Progress Information */}
        <div className="mt-8 pt-6 border-t border-border space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Elapsed Time:</span>
            <span className="font-mono text-foreground">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          {totalProgress > 5 && estimatedRemainingTime > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Est. Remaining:</span>
              <span className="font-mono text-foreground">
                {formatTime(Math.floor(estimatedRemainingTime))}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress:</span>
            <span className="font-bold text-foreground">
              {totalProgress.toFixed(1)}%
            </span>
          </div>

          {/* Performance indicator */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/70 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              System running optimally
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
}
