import type { HostFormData } from "../../types";
import { cn } from "@/lib/utils";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

const OPTIONS = ["Retail Shop", "Office", "Restaurant", "Medical Clinic", "Pharmacy", "Warehouse", "Education"];

export function StepBusinessSuitability({ data, onChange }: Props) {
  const toggle = (value: string) => {
    const exists = data.commercialUseTypes.includes(value);
    onChange({
      commercialUseTypes: exists
        ? data.commercialUseTypes.filter((v) => v !== value)
        : [...data.commercialUseTypes, value],
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground mb-2">Business suitability</h1>
      <p className="text-muted-foreground mb-8">Select all business uses this property supports.</p>
      <div className="flex flex-wrap gap-3">
        {OPTIONS.map((opt) => {
          const selected = data.commercialUseTypes.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={cn(
                "px-5 py-3 rounded-full border text-sm font-semibold transition",
                selected ? "border-[#bb1f3a] bg-[#bb1f3a]/10 text-[#bb1f3a]" : "border-border bg-white hover:border-[#bb1f3a]"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
