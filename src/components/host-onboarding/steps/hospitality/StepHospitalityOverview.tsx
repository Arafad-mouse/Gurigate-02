import type { HostFormData } from "../../types";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepHospitalityOverview({ data, onChange }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground mb-2">Hospitality overview</h1>
      <p className="text-muted-foreground mb-8">Set core operating details for your property.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Total Rooms</span>
          <input type="number" min={1} value={data.hospitalityTotalRooms} onChange={(e) => onChange({ hospitalityTotalRooms: Number(e.target.value) || 0 })} className="rounded-xl border border-border px-4 py-3 bg-background" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Total Floors</span>
          <input type="number" min={1} value={data.hospitalityTotalFloors} onChange={(e) => onChange({ hospitalityTotalFloors: Number(e.target.value) || 1 })} className="rounded-xl border border-border px-4 py-3 bg-background" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Maximum Guests</span>
          <input type="number" min={1} value={data.hospitalityMaxGuests} onChange={(e) => onChange({ hospitalityMaxGuests: Number(e.target.value) || 1 })} className="rounded-xl border border-border px-4 py-3 bg-background" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Check-In Time</span>
          <input type="time" value={data.hospitalityCheckInTime} onChange={(e) => onChange({ hospitalityCheckInTime: e.target.value })} className="rounded-xl border border-border px-4 py-3 bg-background" />
        </label>
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm font-semibold text-foreground">Check-Out Time</span>
          <input type="time" value={data.hospitalityCheckOutTime} onChange={(e) => onChange({ hospitalityCheckOutTime: e.target.value })} className="rounded-xl border border-border px-4 py-3 bg-background md:max-w-xs" />
        </label>
      </div>
    </div>
  );
}
