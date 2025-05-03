import type React from "react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FancyNameInput from "@/components/create-page/FancyNameInput";

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
  const sliderRef = useRef<HTMLDivElement>(null);

  return (
    <form className="" onSubmit={handleCreateSetButton}>
      <CardHeader className="pb-6">
        <CardTitle>Puzzle Set Details</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Set Name */}
        <FancyNameInput value={name} onChange={setName} />

        {/* Repeat Count */}
        <div className="space-y-1">
          <Label htmlFor="repeat-count" className="text-sm font-medium">
            Repeat Count
          </Label>
          <Input
            id="repeat-count"
            type="number"
            value={repeatCount}
            min={1}
            onChange={(e) => setRepeatCount(Number(e.target.value))}
          />
        </div>

        {/* Set Size Slider */}
        <div className="space-y-1">
          <Label className="text-sm font-medium">Set Size</Label>
          <Slider
            value={[setSize]}
            min={1}
            max={200}
            step={1}
            onValueChange={(value) => setSetSize(value[0])}
          />
          <p className="text-sm text-center text-muted-foreground mt-1">
            {setSize} puzzles
          </p>
        </div>

        {/* ELO Slider */}
        <div className="space-y-1">
          <Label className="text-sm font-medium">ELO Target</Label>
          <div className="relative" ref={sliderRef}>
            <Slider
              value={[difficultySliderValue]}
              min={500}
              max={2900}
              step={50}
              onValueChange={(value) => setDifficultySliderValue(value[0])}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground px-1 pt-1">
            <span>700</span>
            <span>1400</span>
            <span>2000</span>
            <span>2700</span>
          </div>
          <p className="text-sm text-center text-muted-foreground mt-1">
            Targeting:{" "}
            <span className="font-semibold">{difficultySliderValue} ELO</span>
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-5">
        <Button type="submit" className=" mx-auto ml-auto">
          Create Puzzle Set
        </Button>
      </CardFooter>
    </form>
  );
}
