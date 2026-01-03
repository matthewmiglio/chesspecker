// ALT A: "Noir Elegance" - Deep black with subtle red accents, serif typography
import type React from "react";

import EloTargetInput from "@/components/create-page/set-elo-input";
import SetSizeInput from "@/components/create-page/set-size-input";
import ThemeSelector from "@/components/create-page/theme-selector";
import FancyNameInput from "@/components/create-page/set-name-input";
import RepeatCountInput from "@/components/create-page/repeat-count-input";

type CreateSetFormProps = {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  repeatCount: number;
  setRepeatCount: (value: number) => void;
  setSize: number;
  setSetSize: (value: number) => void;
  difficultySliderValue: number;
  setDifficultySliderValue: (value: number) => void;
  selectedThemes: string[];
  setSelectedThemes: (themes: string[]) => void;
  handleCreateSetButton: (e: React.FormEvent) => void;
  isCreatingSet?: boolean;
  isPremium?: boolean;
  onLockedThemeClick?: () => void;
};

export default function CreateSetFormAltA({
  name,
  setName,
  repeatCount,
  setRepeatCount,
  setSize,
  setSetSize,
  difficultySliderValue,
  setDifficultySliderValue,
  selectedThemes,
  setSelectedThemes,
  handleCreateSetButton,
  isCreatingSet = false,
  isPremium = false,
  onLockedThemeClick,
}: CreateSetFormProps) {
  return (
    <form onSubmit={handleCreateSetButton} className="relative">
      {/* Subtle corner accent */}
      <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-red-500/30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-red-500/30 pointer-events-none" />

      {/* Header */}
      <div className="px-10 pt-12 pb-8">
        <p className="text-red-500/80 text-xs uppercase tracking-[0.3em] mb-3">Curate Your Collection</p>
        <h2 className="text-4xl font-light tracking-tight text-white">
          Create New Set
        </h2>
        <div className="w-16 h-[1px] bg-gradient-to-r from-red-500/60 to-transparent mt-6" />
      </div>

      {/* Content */}
      <div className="px-10 space-y-14">
        {/* Name Input */}
        <div className="space-y-4">
          <FancyNameInput value={name} onChange={setName} />
        </div>

        {/* Repeat Count */}
        <div className="space-y-4">
          <label className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light">
            Repeat Count
          </label>
          <RepeatCountInput value={repeatCount} onChange={setRepeatCount} />
        </div>

        {/* Set Size */}
        <div className="space-y-4">
          <label className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light">
            Set Size
          </label>
          <SetSizeInput value={setSize} onChange={setSetSize} isPremium={isPremium} />
        </div>

        {/* Difficulty */}
        <div className="space-y-4">
          <label className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light">
            Difficulty Rating
          </label>
          <EloTargetInput
            value={difficultySliderValue}
            onChange={setDifficultySliderValue}
          />
        </div>

        {/* Themes */}
        <div className="space-y-4">
          <label className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light">
            Puzzle Themes
          </label>
          <ThemeSelector
            selectedThemes={selectedThemes}
            onChange={setSelectedThemes}
            isPremium={isPremium}
            onLockedThemeClick={onLockedThemeClick}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-10 pt-14 pb-10">
        <button
          type="submit"
          disabled={isCreatingSet}
          className="w-full py-4 bg-transparent border border-red-500/60 text-red-500 uppercase tracking-[0.25em] text-sm font-light hover:bg-red-500/10 hover:border-red-500 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isCreatingSet ? "Crafting..." : "Commission Set"}
        </button>
      </div>
    </form>
  );
}
