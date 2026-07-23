import type { HostFormData } from "../../types";
import { cn } from "@/lib/utils";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

const ROOM_TYPES = ["Single Room", "Double Room", "Twin Room", "Family Room", "Suite", "Deluxe Suite"];

export function StepHospitalityRoomTypes({ data, onChange }: Props) {
  const toggle = (type: string) => {
    const exists = data.hospitalityRoomTypes.includes(type);
    onChange({
      hospitalityRoomTypes: exists
        ? data.hospitalityRoomTypes.filter((v) => v !== type)
        : [...data.hospitalityRoomTypes, type],
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground mb-2">Room types</h1>
      <p className="text-muted-foreground mb-8">Select room categories available in your property.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ROOM_TYPES.map((type) => {
          const selected = data.hospitalityRoomTypes.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggle(type)}
              className={cn(
                "text-left px-4 py-3 rounded-xl border font-medium transition",
                selected ? "border-[#bb1f3a] bg-[#bb1f3a]/10 text-[#bb1f3a]" : "border-border bg-white hover:border-[#bb1f3a]"
              )}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}
