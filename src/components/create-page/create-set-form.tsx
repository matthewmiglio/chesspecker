import type React from "react";

import EloTargetInput from "@/components/create-page/set-elo-input";
import SetSizeInput from "@/components/create-page/set-size-input";

import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
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
  handleCreateSetButton,
}: CreateSetFormProps) {
  return (
    <form onSubmit={handleCreateSetButton} className="space-y-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Puzzle Set Details</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">

          <FancyNameInput value={name} onChange={setName} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Repeat Count
          </label>
          <RepeatCountInput value={repeatCount} onChange={setRepeatCount} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Set Size
          </label>
          <SetSizeInput value={setSize} onChange={setSetSize} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            ELO Target
          </label>
          <EloTargetInput
            value={difficultySliderValue}
            onChange={setDifficultySliderValue}
          />
        </div>
      </CardContent>

      <CardFooter className="pt-4 justify-end">
        <Button type="submit">Create Puzzle Set</Button>
      </CardFooter>
    </form>
  );
}
