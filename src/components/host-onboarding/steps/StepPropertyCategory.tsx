import type { HostFormData } from "../types";
import { cn } from "@/lib/utils";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

const CATEGORIES = [
  {
    id: "residential",
    label: "Residential",
    description: "Homes, apartments, rooms & villas",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    id: "commercial",
    label: "Commercial",
    description: "Offices, shops & restaurants",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    id: "land",
    label: "Land",
    description: "Residential, commercial & farm plots",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-4h6v4" />
        <path d="M12 7v4" />
      </svg>
    ),
  },
  {
    id: "hospitality",
    label: "Hospitality",
    description: "Hotels, resorts & lodges",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M2 20h20" />
        <path d="M4 20V8l8-6 8 6v12" />
        <rect x="9" y="13" width="6" height="7" />
        <path d="M9 9h.01M15 9h.01" />
      </svg>
    ),
  },
] as const;

export function StepPropertyCategory({ data, onChange }: Props) {
  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-[32px] font-semibold text-[#222222] mb-3 leading-tight">
        Which best describes your property?
      </h1>
      <p className="text-[#717171] text-base mb-8">
        Choose a category to help guests find exactly what they're looking for.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map(({ id, label, description, icon }) => {
          const selected = data.propertyCategory === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() =>
                onChange({
                  propertyCategory: id,
                  propertyTypes: [],
                })
              }
              className={cn(
                "flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all",
                selected
                  ? "border-[#bb1f3a] bg-[#bb1f3a]/10 ring-2 ring-[#bb1f3a]"
                  : "border-[#DDDDDD] bg-white hover:border-[#bb1f3a] hover:bg-muted/40"
              )}
            >
              <span className={cn("text-[#222222]", selected && "text-[#bb1f3a]")}>
                {icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-[#222222]">{label}</p>
                <p className="text-xs text-[#717171] mt-0.5 leading-snug">{description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
