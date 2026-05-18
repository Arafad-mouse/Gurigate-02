import type { HostFormData } from "../types";
import { cn } from "@/lib/utils";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepBooking({ data, onChange }: Props) {
  const options = [
    {
      id: "approve",
      title: "Approve your first 5 bookings",
      badge: "Recommended",
      desc: "Start by reviewing reservation requests, then switch to Instant Book, so guests can book automatically.",
      icon: (
        <svg className="w-8 h-8 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 3h.008v.008H12V18Zm-3-3h.008v.008H9V15Zm0 3h.008v.008H9V18Zm6-3h.008v.008H15V15Zm0 3h.008v.008H15V18Z" />
        </svg>
      ),
    },
    {
      id: "instant",
      title: "Use Instant Book",
      desc: "Let guests book automatically.",
      icon: (
        <svg className="w-8 h-8 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Heading and subtext with specific Learn More underline */}
      <h1 className="text-[32px] font-bold text-[#222222] mb-2 leading-tight">
        Pick your booking settings
      </h1>
      <p className="text-[#717171] text-lg mb-10">
        You can change this at any time. <span className="underline font-semibold text-[#222222] cursor-pointer">Learn more</span>
      </p>

      <div className="flex flex-col gap-4">
        {options.map((opt) => {
          const isSelected = data.bookingSetting === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ bookingSetting: opt.id })}
              className={cn(
                "flex items-start justify-between p-8 rounded-2xl border transition-all duration-200 text-left",
                isSelected
                  ? "border-black bg-[#F7F7F7] ring-1 ring-black"
                  : "border-[#DDDDDD] bg-white hover:border-black"
              )}
            >
              <div className="flex-1 pr-8">
                <p className="font-bold text-lg text-[#222222] mb-1">{opt.title}</p>
                {opt.badge && (
                  <p className="text-sm font-bold text-[#008A05] mb-2">{opt.badge}</p>
                )}
                <p className="text-[#717171] text-sm leading-relaxed max-w-md">
                  {opt.desc}
                </p>
              </div>
              
              {/* Icon container on the right */}
              <div className="text-[#222222] pt-1">
                {opt.icon}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
