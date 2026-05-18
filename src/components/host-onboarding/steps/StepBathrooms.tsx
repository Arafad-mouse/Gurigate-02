import type { HostFormData } from "../types";
import { StepCounter } from "../StepCounter";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepBathrooms({ data, onChange }: Props) {
  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      {/* Title matches the specific bold weight and size from your image */}
      <h1 className="text-[32px] font-semibold text-[#222222] mb-12 leading-tight">
        What kind of bathrooms are available to guests?
      </h1>

      <div className="flex flex-col">
        {/* Each row has a bottom border and specific padding to match the spacing */}
        <div className="border-b border-[#DDDDDD] py-6">
          <StepCounter
            label="Private and attached"
            description="It's connected to the guest's room and is just for them."
            value={data.privateBathrooms}
            onChange={(v) => onChange({ privateBathrooms: v })}
          />
        </div>
        
        <div className="border-b border-[#DDDDDD] py-6">
          <StepCounter
            label="Dedicated"
            description="It's private, but accessed via a shared space, like a hallway."
            value={data.dedicatedBathrooms}
            onChange={(v) => onChange({ dedicatedBathrooms: v })}
          />
        </div>
        
        <div className="border-b border-[#DDDDDD] py-6">
          <StepCounter
            label="Shared"
            description="It's shared with other people."
            value={data.sharedBathrooms}
            onChange={(v) => onChange({ sharedBathrooms: v })}
          />
        </div>
      </div>
    </div>
  );
}
