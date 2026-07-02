import type { HostFormData } from "../../types";
import { cn } from "@/lib/utils";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepHospitalityBookingConfig({ data, onChange }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground mb-2">Booking configuration</h1>
      <p className="text-muted-foreground mb-8">Configure booking mode and stay constraints.</p>

      <div className="flex gap-3 mb-6">
        {[
          { id: "instant", label: "Instant Booking" },
          { id: "manual", label: "Manual Approval" },
        ].map((opt) => {
          const selected = data.hospitalityBookingMode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ hospitalityBookingMode: opt.id as HostFormData["hospitalityBookingMode"], hospitalityInstantBooking: opt.id === "instant" })}
              className={cn(
                "px-4 py-3 rounded-xl border text-sm font-semibold transition",
                selected ? "border-[#bb1f3a] bg-[#bb1f3a]/10 text-[#bb1f3a]" : "border-border bg-white"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Minimum Stay (nights)</span>
          <input type="number" min={1} value={data.hospitalityMinStayNights} onChange={(e) => onChange({ hospitalityMinStayNights: Number(e.target.value) || 1 })} className="rounded-xl border border-border px-4 py-3 bg-background" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Maximum Stay (nights)</span>
          <input type="number" min={1} value={data.hospitalityMaxStayNights} onChange={(e) => onChange({ hospitalityMaxStayNights: Number(e.target.value) || 1 })} className="rounded-xl border border-border px-4 py-3 bg-background" />
        </label>
      </div>
    </div>
  );
}
