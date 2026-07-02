import type { HostFormData } from "../../types";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

function NumberField({ label, value, onChange, min = 0, suffix }: { label: string; value: number; onChange: (v: number) => void; min?: number; suffix?: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="relative">
        <input
          type="number"
          min={min}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full rounded-xl border border-border px-4 py-3 bg-background"
        />
        {suffix ? <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span> : null}
      </div>
    </label>
  );
}

export function StepCommercialDetails({ data, onChange }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground mb-2">Commercial property details</h1>
      <p className="text-muted-foreground mb-8">Tell businesses what this space offers.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <NumberField label="Floor Area" suffix="sqm" value={data.commercialFloorArea} onChange={(v) => onChange({ commercialFloorArea: v })} />
        <NumberField label="Number of Floors" value={data.commercialFloors} min={1} onChange={(v) => onChange({ commercialFloors: v })} />
        <NumberField label="Parking Spaces" value={data.commercialParkingSpaces} onChange={(v) => onChange({ commercialParkingSpaces: v })} />
        <NumberField label="Washrooms" value={data.commercialWashrooms} onChange={(v) => onChange({ commercialWashrooms: v })} />
        <NumberField label="Storage Rooms" value={data.commercialStorageRooms} onChange={(v) => onChange({ commercialStorageRooms: v })} />
      </div>
    </div>
  );
}
