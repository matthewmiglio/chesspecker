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
    <form className="" onSubmit={handleCreateSetButton}>
      <CardHeader className="pb-6">
        <CardTitle>Puzzle Set Details</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Set Name */}
        <FancyNameInput value={name} onChange={setName} />

        {/* Repeat Count */}
        <RepeatCountInput value={repeatCount} onChange={setRepeatCount} />


        {/* Set Size Slider */}
        <SetSizeInput value={setSize} onChange={setSetSize} />

        {/* ELO Slider */}
        <EloTargetInput value={difficultySliderValue} onChange={setDifficultySliderValue} />
      </CardContent>

      <CardFooter className="pt-5">
        <Button type="submit" className=" mx-auto ml-auto">
          Create Puzzle Set
        </Button>
      </CardFooter>
    </form>
  );
}
