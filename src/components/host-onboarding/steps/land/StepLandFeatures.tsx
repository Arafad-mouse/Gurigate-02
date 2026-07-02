import type { HostFormData } from "../../types";
import { cn } from "@/lib/utils";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

const FEATURES = ["Road Access", "Water Access", "Electricity", "Sewage", "Internet", "Fenced", "Corner Plot"];

export function StepLandFeatures({ data, onChange }: Props) {
  const toggle = (feature: string) => {
    const exists = data.landFeatures.includes(feature);
    onChange({
      landFeatures: exists ? data.landFeatures.filter((f) => f !== feature) : [...data.landFeatures, feature],
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground mb-2">Land features</h1>
      <p className="text-muted-foreground mb-8">Select all utilities and access characteristics.</p>
      <div className="flex flex-wrap gap-3">
        {FEATURES.map((feature) => {
          const selected = data.landFeatures.includes(feature);
          return (
            <button
              key={feature}
              type="button"
              onClick={() => toggle(feature)}
              className={cn(
                "px-5 py-3 rounded-full border text-sm font-semibold transition",
                selected ? "border-[#bb1f3a] bg-[#bb1f3a]/10 text-[#bb1f3a]" : "border-border bg-white hover:border-[#bb1f3a]"
              )}
            >
              {feature}
            </button>
          );
        })}
      </div>
    </div>
  );
}
