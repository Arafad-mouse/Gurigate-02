import type { HostFormData } from "../types";
import { cn } from "@/lib/utils";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepFinalDetails({ data, onChange }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Main Header and Subtext */}
      <h1 className="text-[32px] font-bold text-[#222222] mb-2 leading-tight">
        Provide a few final details
      </h1>
      <p className="text-[#717171] text-lg mb-10 leading-relaxed max-w-xl">
        This is required to comply with financial regulations and helps us prevent fraud.
      </p>

      {/* Address Section */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-[#222222] mb-1">What's your residential address?</h2>
        <p className="text-[#717171] text-base mb-6">Guests won't see this information.</p>

        {/* Stacked Input Group exactly like your image */}
        <div className="border border-[#B0B0B0] rounded-xl overflow-hidden">
          {/* Country Select */}
          <div className="relative border-b border-[#DDDDDD] bg-white">
            <select
              value={data.residentialCountry}
              onChange={(e) => onChange({ residentialCountry: e.target.value })}
              className="w-full pt-6 pb-2 px-4 bg-transparent text-base text-[#222222] outline-none appearance-none cursor-pointer"
            >
              <option value="Somalia">Somalia</option>
              <option value="United States">United States</option>
            </select>
            <span className="absolute left-4 top-2 text-[11px] text-[#717171]">Country / region</span>
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#222222] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          
          <InputRow placeholder="Street address" value={data.residentialStreet} onChange={(v) => onChange({ residentialStreet: v })} />
          <InputRow placeholder="Apt, floor, bldg (if applicable)" value={data.residentialApt} onChange={(v) => onChange({ residentialApt: v })} />
          <InputRow placeholder="City / town / village" value={data.residentialCity} onChange={(v) => onChange({ residentialCity: v })} />
          <InputRow placeholder="Province / state / territory (if applicable)" value={data.residentialProvince} onChange={(v) => onChange({ residentialProvince: v })} />
          <InputRow placeholder="Postal code (if applicable)" value={data.residentialPostalCode} onChange={(v) => onChange({ residentialPostalCode: v })} last />
        </div>
      </div>

      <hr className="border-[#F0F0F0] mb-12" />

      {/* Business Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#222222] mb-1">Are you hosting as a business?</h2>
        <p className="text-sm text-[#717171] mb-6">
          This means your business is most likely registered with your state or government.{" "}
          <span className="underline font-semibold text-[#222222] cursor-pointer">Get details</span>
        </p>
        
        {/* Yes/No Buttons side-by-side with rounded-xl corners */}
        <div className="flex gap-4">
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange({ hostingAsBusiness: opt })}
              className={cn(
                "flex-1 py-4 rounded-xl border transition-all duration-200 text-base font-semibold",
                data.hostingAsBusiness === opt
                  ? "border-black bg-[#F7F7F7] ring-1 ring-black"
                  : "border-[#DDDDDD] bg-white hover:border-black"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InputRow({ placeholder, value, onChange, last }: { placeholder: string; value: string; onChange: (v: string) => void; last?: boolean }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full px-4 py-5 bg-white text-base text-[#222222] outline-none placeholder:text-[#717171]",
        !last && "border-b border-[#DDDDDD]"
      )}
    />
  );
}
