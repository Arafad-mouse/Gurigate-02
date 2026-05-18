import type { HostFormData } from "../types";
import { StepCounter } from "../StepCounter"; // Ensure StepCounter matches the UI below

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepBasics({ data, onChange }: Props) {
  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      {/* Title matches the bold, clean font in your image */}
      <h1 className="text-[32px] font-semibold text-[#222222] mb-12">
        Let's start with the basics
      </h1>

      {/* Subtitle */}
      <p className="text-base font-semibold text-[#222222] mb-6">
        How many people can stay here?
      </p>

      {/* Counters with bottom borders only, as seen in image */}
      <div className="flex flex-col mb-12">
        <div className="border-b border-[#DDDDDD] py-4">
          <StepCounter 
            label="Guests" 
            value={data.guests} 
            min={1} 
            onChange={(v) => onChange({ guests: v })} 
          />
        </div>
        <div className="border-b border-[#DDDDDD] py-4">
          <StepCounter 
            label="Bedrooms" 
            value={data.bedrooms} 
            min={0} 
            onChange={(v) => onChange({ bedrooms: v })} 
          />
        </div>
        <div className="border-b border-[#DDDDDD] py-4">
          <StepCounter 
            label="Beds" 
            value={data.beds} 
            min={1} 
            onChange={(v) => onChange({ beds: v })} 
          />
        </div>
      </div>
      
      {/* Radio Section - Icons on the LEFT */}
      <div className="mt-8">
        <p className="text-base font-semibold text-[#222222] mb-6">
          Does every bedroom have a lock?
        </p>
        
        <div className="space-y-6">
          {["Yes", "No"].map((opt) => (
            <label 
              key={opt} 
              className="flex items-center gap-4 cursor-pointer group"
            >
              {/* Custom Radio Button on the Left */}
              <div className="relative flex items-center justify-center">
                <input 
                  type="radio" 
                  name="bedroomLock" 
                  className="sr-only" 
                  checked={data.bedroomLock === opt} 
                  onChange={() => onChange({ bedroomLock: opt })} 
                />
                <div className={`
                  w-6 h-6 rounded-full border transition-all flex items-center justify-center
                  ${data.bedroomLock === opt ? "border-black" : "border-[#B0B0B0] group-hover:border-black"}
                `}>
                  {data.bedroomLock === opt && (
                    <div className="w-3 h-3 rounded-full bg-black" />
                  )}
                </div>
              </div>

              {/* Label text on the Right */}
              <span className="text-base text-[#222222]">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
