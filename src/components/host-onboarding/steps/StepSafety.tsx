import type { HostFormData } from "../types";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepSafety({ data, onChange }: Props) {
  const items = [
    "Exterior security camera present",
    "Noise decibel monitor present",
    "Weapon(s) on the property",
  ];

  const toggle = (item: string) => {
    const updated = data.safetyItems.includes(item)
      ? data.safetyItems.filter((s) => s !== item)
      : [...data.safetyItems, item];
    onChange({ safetyItems: updated });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Title matches the bold font in your image */}
      <h1 className="text-[32px] font-bold text-[#222222] mb-10 leading-tight">
        Share safety details
      </h1>

      <div className="mb-10">
        <h2 className="text-lg font-semibold text-[#222222] mb-6 flex items-center gap-1">
          Does your place have any of these?
          <span className="text-[#717171] text-base cursor-pointer ml-1">ⓘ</span>
        </h2>

        {/* Checkbox list with labels on left and boxes on RIGHT */}
        <div className="flex flex-col space-y-2">
          {items.map((item) => (
            <label 
              key={item} 
              className="flex items-center justify-between py-4 cursor-pointer group"
            >
              <span className="text-base text-[#222222]">{item}</span>
              
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={data.safetyItems.includes(item)} 
                  onChange={() => toggle(item)} 
                />
                {/* Thin-bordered checkbox matches your image */}
                <div className={`
                  w-6 h-6 rounded-md border transition-all flex items-center justify-center
                  ${data.safetyItems.includes(item) 
                    ? "bg-black border-black" 
                    : "border-[#B0B0B0] group-hover:border-black bg-white"
                  }
                `}>
                  {data.safetyItems.includes(item) && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
      
      {/* Thin horizontal line before footer */}
      <hr className="border-[#DDDDDD] mb-10" />

      {/* Footer text with specific spacing and underline links */}
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-lg text-[#222222] mb-2">Important things to know</h3>
          <p className="text-[#222222] text-base leading-normal">
            Security cameras that monitor indoor spaces are not allowed even if they're turned off. All exterior security cameras must be disclosed.
          </p>
        </div>

        <p className="text-[#222222] text-base leading-relaxed">
          Be sure to comply with your <span className="underline cursor-pointer">local laws</span> and review Airbnb's <span className="underline cursor-pointer">anti-discrimination policy</span> and <span className="underline cursor-pointer">guest and Host fees</span>.
        </p>
      </div>
    </div>
  );
}
