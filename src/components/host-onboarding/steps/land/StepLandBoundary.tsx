import type { HostFormData } from "../../types";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepLandBoundary({ data, onChange }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground mb-2">Define land boundary</h1>
      <p className="text-muted-foreground mb-6">Map drawing will be enabled in the next iteration. For now, store boundary metadata as GeoJSON text.</p>

      <div className="rounded-2xl border border-dashed border-border bg-muted/30 h-64 flex items-center justify-center mb-6">
        <p className="text-sm text-muted-foreground text-center px-6">Boundary map placeholder<br />Drop pins / draw polygon UI coming soon.</p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Boundary GeoJSON</span>
        <textarea
          rows={6}
          value={data.boundaryGeojson}
          onChange={(e) => onChange({ boundaryGeojson: e.target.value })}
          placeholder='{"type":"Polygon","coordinates":[...]}'
          className="w-full rounded-xl border border-border px-4 py-3 bg-background"
        />
      </label>
    </div>
  );
}
