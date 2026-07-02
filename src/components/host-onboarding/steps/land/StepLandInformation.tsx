import type { HostFormData } from "../../types";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepLandInformation({ data, onChange }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground mb-2">Land information</h1>
      <p className="text-muted-foreground mb-8">Provide plot size in your preferred unit.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Plot Size</span>
          <input
            type="number"
            min={0}
            value={data.landSizeValue}
            onChange={(e) => onChange({ landSizeValue: Number(e.target.value) || 0 })}
            className="w-full rounded-xl border border-border px-4 py-3 bg-background"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Unit</span>
          <select
            value={data.landSizeUnit}
            onChange={(e) => onChange({ landSizeUnit: e.target.value as HostFormData["landSizeUnit"] })}
            className="w-full rounded-xl border border-border px-4 py-3 bg-background"
          >
            <option value="sqm">Square Meters</option>
            <option value="acres">Acres</option>
            <option value="hectares">Hectares</option>
          </select>
        </label>
      </div>
    </div>
  );
}
