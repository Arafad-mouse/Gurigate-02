import type { HostFormData } from "../../types";
import { cn } from "@/lib/utils";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

const DOCS = ["Land Title", "Survey Document", "Ownership Certificate"];

export function StepLandOwnershipDocuments({ data, onChange }: Props) {
  const toggle = (doc: string) => {
    const exists = data.ownershipDocuments.includes(doc);
    onChange({
      ownershipDocuments: exists ? data.ownershipDocuments.filter((d) => d !== doc) : [...data.ownershipDocuments, doc],
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground mb-2">Ownership documents</h1>
      <p className="text-muted-foreground mb-8">Choose documents you can provide for verification.</p>
      <div className="space-y-3">
        {DOCS.map((doc) => {
          const selected = data.ownershipDocuments.includes(doc);
          return (
            <button
              key={doc}
              type="button"
              onClick={() => toggle(doc)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition",
                selected ? "border-[#bb1f3a] bg-[#bb1f3a]/10 text-[#bb1f3a]" : "border-border bg-white hover:border-[#bb1f3a]"
              )}
            >
              {doc}
            </button>
          );
        })}
      </div>
    </div>
  );
}
