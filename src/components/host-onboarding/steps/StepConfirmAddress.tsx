import type { HostFormData } from "../types";
import { cn } from "@/lib/utils";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

function FloatingInput({ label, value, onChange, className }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={cn("relative border-b border-border", className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full pt-5 pb-2 px-4 bg-transparent text-base text-foreground outline-none placeholder-transparent"
        id={label}
      />
      <label
        htmlFor={label}
        className="absolute left-4 top-2 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs"
      >
        {label}
      </label>
    </div>
  );
}

export function StepConfirmAddress({ data, onChange }: Props) {
  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <h1 className="text-2xl md:text-[28px] font-semibold text-foreground mb-2">
        Confirm your address
      </h1>
      <p className="text-muted-foreground text-base mb-8">
        Your address is only shared with guests after they've made a reservation.
      </p>

      {/* Address Form Group */}
      <div className="border border-border rounded-xl overflow-hidden mb-10">
        <div className="relative border-b border-border">
          <select
            value={data.country}
            onChange={(e) => onChange({ country: e.target.value })}
            className="w-full pt-5 pb-2 px-4 bg-transparent text-base text-foreground outline-none appearance-none cursor-pointer"
          >
            <option value="Somalia - SO">Somalia - SO</option>
            <option value="United States - US">United States - US</option>
          </select>
          <span className="absolute left-4 top-2 text-[10px] uppercase tracking-wider font-bold text-foreground">Country / region</span>
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
        <FloatingInput label="Street address" value={data.streetAddress} onChange={(v) => onChange({ streetAddress: v })} />
        <FloatingInput label="Apt, floor, bldg (if applicable)" value={data.apt} onChange={(v) => onChange({ apt: v })} />
        <FloatingInput label="City / town / village" value={data.city} onChange={(v) => onChange({ city: v })} />
        <FloatingInput label="Province / state / territory (if applicable)" value={data.province} onChange={(v) => onChange({ province: v })} />
        <FloatingInput label="Postal code (if applicable)" value={data.postalCode} onChange={(v) => onChange({ postalCode: v })} className="border-b-0" />
      </div>

      <hr className="mb-8 border-border" />
      
      {/* Map Toggle Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 pr-4">
          <p className="text-base font-medium text-foreground">Show your home's precise location</p>
          <p className="text-sm text-muted-foreground mt-1 leading-normal">
            Make it clear to guests where your place is located. We'll only share your address after
            they've made a reservation. <span className="underline font-semibold text-foreground cursor-pointer">Learn more</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ showPreciseLocation: !data.showPreciseLocation })}
          className={cn(
            "relative w-[48px] h-[32px] rounded-full transition-colors shrink-0",
            data.showPreciseLocation ? "bg-black" : "bg-[#B0B0B0]"
          )}
        >
          <span
            className={cn(
              "absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform duration-200 shadow-sm",
              data.showPreciseLocation ? "translate-x-4" : "translate-x-0"
            )}
          />
        </button>
      </div>
      
      {/* Map Preview Area */}
      <div className="relative h-[220px] bg-[#f7f7f7] border border-border rounded-xl overflow-hidden flex items-center justify-center">
        {/* Simple grid lines to simulate a map background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} 
        />
        
        {/* Map Label Placeholder (e.g., Street Name) */}
        <div className="absolute top-[40%] left-[20%] text-[10px] text-gray-400 font-bold uppercase rotate-90">150 ST</div>
        
        {/* The Pink House Pin */}
        <div className="relative z-10 w-12 h-12 bg-[#FF385C] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <svg viewBox="0 0 32 32" className="w-6 h-6 text-white fill-current">
            <path d="M16 3.14l-14 12.14 1.32 1.5L5 15.34V28a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V15.34l1.68 1.46 1.32-1.5zM25 27H7V13.61l9-7.8 9 7.8z" />
          </svg>
        </div>

        {/* Floating Text Reference from Image */}
        <div className="absolute bottom-10 right-20 text-[10px] text-gray-400 font-bold text-center leading-tight">
          WARAABA<br/>SALAAN
        </div>
      </div>
    </div>
  );
}
