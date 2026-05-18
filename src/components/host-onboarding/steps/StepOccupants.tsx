import type { HostFormData } from "../types";
import { SelectableCard } from "../SelectableCard";

const occupantOptions = [
  { id: "me", label: "Me", icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg> },
  { id: "family", label: "My family", icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg> },
  { id: "guests", label: "Other guests", icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg> },
  { id: "roommates", label: "Roommates", icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg> },
];

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepOccupants({ data, onChange }: Props) {
  const toggle = (id: string) => {
    const updated = data.otherOccupants.includes(id)
      ? data.otherOccupants.filter((o) => o !== id)
      : [...data.otherOccupants, id];
    onChange({ otherOccupants: updated });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-[32px] font-semibold text-[#222222] leading-tight mb-3">
        Who else might be there?
      </h1>
      <p className="text-[#717171] text-lg mb-10 leading-relaxed max-w-2xl">
        Guests need to know whether they'll encounter other people during their stay.
      </p>
      
      {/* Updated Grid for wide rectangular cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {occupantOptions.slice(0, 3).map((opt) => (
          <SelectableCard
            key={opt.id}
            icon={opt.icon}
            label={opt.label}
            selected={data.otherOccupants.includes(opt.id)}
            onClick={() => toggle(opt.id)}
            className="aspect-[1.5/1] flex-col items-start justify-between p-6"
          />
        ))}
      </div>
      
      {/* Separate row for the 4th item to match design layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SelectableCard
            key={occupantOptions[3].id}
            icon={occupantOptions[3].icon}
            label={occupantOptions[3].label}
            selected={data.otherOccupants.includes(occupantOptions[3].id)}
            onClick={() => toggle(occupantOptions[3].id)}
            className="aspect-[1.5/1] flex-col items-start justify-between p-6"
          />
      </div>

      <p className="text-[#717171] text-base mt-12">
        We'll show this information on your listing and in search results.
      </p>
    </div>
  );
}
