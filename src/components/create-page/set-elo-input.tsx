import { Slider } from "@/components/ui/slider";

type EloTargetInputProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function EloTargetInput({
  value,
  onChange,
}: EloTargetInputProps) {
  return (
    <div className="space-y-3">
      <Slider
        min={200}
        max={2500}
        step={50}
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        className="py-2 [&_[role=slider]]:h-6 [&_[role=slider]]:w-6"
      />

      <p className="text-sm text-muted-foreground">
        Targeting: <span className="font-semibold">{value} ELO</span>
      </p>
    </div>
  );
}
