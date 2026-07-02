import type { HostFormData } from "../../types";
import { cn } from "@/lib/utils";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

const FACILITIES = ["Restaurant", "Pool", "Gym", "Spa", "Conference Hall", "Business Center"];

export function StepHospitalityFacilities({ data, onChange }: Props) {
  const toggle = (item: string) => {
    const exists = data.hospitalityFacilities.includes(item);
    onChange({
      hospitalityFacilities: exists
        ? data.hospitalityFacilities.filter((v) => v !== item)
        : [...data.hospitalityFacilities, item],
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground mb-2">Facilities</h1>
      <p className="text-muted-foreground mb-8">Select on-site facilities available.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {FACILITIES.map((item) => {
          const selected = data.hospitalityFacilities.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className={cn(
                "text-left px-4 py-3 rounded-xl border font-medium transition",
                selected ? "border-[#bb1f3a] bg-[#bb1f3a]/10 text-[#bb1f3a]" : "border-border bg-white hover:border-[#bb1f3a]"
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
