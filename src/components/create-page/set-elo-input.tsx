import { Slider } from "@/components/ui/slider";

type EloTargetInputProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function EloTargetInput({
  value,
  onChange,
}: EloTargetInputProps) {
  // Calculate color based on value (500-2500 range)
  const getSliderColor = (eloValue: number) => {
    const minElo = 500;
    const maxElo = 2500;
    const normalizedValue = (eloValue - minElo) / (maxElo - minElo); // 0 to 1

    // Green to Red transition
    const red = Math.round(255 * normalizedValue);
    const green = Math.round(255 * (1 - normalizedValue));

    return `rgb(${red}, ${green}, 0)`;
  };

  const sliderColor = getSliderColor(value);

  return (
    <div className="space-y-3">
      <div
        style={{
          '--slider-range-bg': sliderColor,
        } as React.CSSProperties & { '--slider-range-bg': string }}
      >
        <Slider
          min={500}
          max={2500}
          step={50}
          value={[value]}
          onValueChange={(vals) => onChange(vals[0])}
          className="py-2 [&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[data-slot=slider-range]]:bg-[var(--slider-range-bg)]"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Targeting: <span className="font-semibold">{value} ELO</span>
      </p>
    </div>
  );
}
