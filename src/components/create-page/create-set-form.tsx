import type React from "react";

import EloTargetInput from "@/components/create-page/set-elo-input";
import SetSizeInput from "@/components/create-page/set-size-input";
import ThemeSelector from "@/components/create-page/theme-selector";

import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
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
};

export default function CreateSetForm({
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
}: CreateSetFormProps) {
  return (
    <form onSubmit={handleCreateSetButton}>
      <CardHeader className="pb-8">
        <CardTitle>Create New Set</CardTitle>
      </CardHeader>

      <CardContent className="space-y-10">
        <div className="space-y-4">
          <FancyNameInput value={name} onChange={setName} />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium">
            Repeat Count
          </label>
          <RepeatCountInput value={repeatCount} onChange={setRepeatCount} />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium">
            Set Size
          </label>
          <SetSizeInput value={setSize} onChange={setSetSize} />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium">
            Difficulty (ELO)
          </label>
          <EloTargetInput
            value={difficultySliderValue}
            onChange={setDifficultySliderValue}
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium">
            Themes
          </label>
          <ThemeSelector
            selectedThemes={selectedThemes}
            onChange={setSelectedThemes}
          />
        </div>
      </CardContent>

      <CardFooter className="pt-8">
        <Button type="submit" size="lg" className="w-full">
          Create Puzzle Set
        </Button>
      </CardFooter>
    </form>
  );
}
