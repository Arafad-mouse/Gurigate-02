import type { HostFormData } from "../types";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepTitle({ data, onChange }: Props) {
  const MAX_CHARS = 50;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Title matches the bold, left-aligned font in your image */}
      <h1 className="text-[32px] font-bold text-[#222222] mb-3 leading-tight">
        Now, let's give your house a title
      </h1>
      
      {/* Description subtext */}
      <p className="text-[#717171] text-lg mb-8">
        Short titles work best. Have fun with it—you can always change it later.
      </p>

      <div className="flex flex-col">
        {/* Textarea with the specific thin border and rounded-xl corners */}
        <textarea
          value={data.title}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) onChange({ title: e.target.value });
          }}
          className="w-full h-48 border border-[#B0B0B0] rounded-xl p-4 text-lg text-[#222222] bg-white outline-none focus:border-black transition-colors resize-none"
          placeholder=""
        />
        
        {/* Character Counter positioned at the bottom-left as per image */}
        <div className="mt-2 text-sm font-bold text-[#222222]">
          {data.title.length}/{MAX_CHARS}
        </div>
      </div>
    </div>
  );
}
