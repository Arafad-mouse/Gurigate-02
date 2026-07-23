import type { HostFormData } from "../../types";
import { cn } from "@/lib/utils";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

const SERVICES = ["24/7 Reception", "Room Service", "Laundry", "Housekeeping", "Airport Pickup"];

export function StepHospitalityServices({ data, onChange }: Props) {
  const toggle = (item: string) => {
    const exists = data.hospitalityServices.includes(item);
    onChange({
      hospitalityServices: exists
        ? data.hospitalityServices.filter((v) => v !== item)
        : [...data.hospitalityServices, item],
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground mb-2">Services</h1>
      <p className="text-muted-foreground mb-8">Select operational services offered to guests.</p>
      <div className="flex flex-wrap gap-3">
        {SERVICES.map((item) => {
          const selected = data.hospitalityServices.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className={cn(
                "px-5 py-3 rounded-full border text-sm font-semibold transition",
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
