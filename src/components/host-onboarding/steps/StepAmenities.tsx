import type { HostFormData } from "../types";
import { SelectableCard } from "../SelectableCard";

const guestFavorites = [
  { id: "wifi", label: "Wifi", icon: "📶" },
  { id: "tv", label: "TV", icon: "📺" },
  { id: "kitchen", label: "Kitchen", icon: "🍳" },
  { id: "washer", label: "Washer", icon: "🧺" },
  { id: "free-parking", label: "Free parking on premises", icon: "🅿️" },
  { id: "paid-parking", label: "Paid parking on premises", icon: "💲" },
  { id: "ac", label: "Air conditioning", icon: "❄️" },
  { id: "workspace", label: "Dedicated workspace", icon: "💻" },
];

const standoutAmenities = [
  { id: "pool", label: "Pool", icon: "🏊" },
  { id: "hot-tub", label: "Hot tub", icon: "♨️" },
  { id: "patio", label: "Patio", icon: "🏖️" },
  { id: "bbq", label: "BBQ grill", icon: "🍖" },
  { id: "outdoor-dining", label: "Outdoor dining area", icon: "🍽️" },
  { id: "fire-pit", label: "Fire pit", icon: "🔥" },
  { id: "pool-table", label: "Pool table", icon: "🎱" },
  { id: "fireplace", label: "Indoor fireplace", icon: "🏠" },
  { id: "piano", label: "Piano", icon: "🎹" },
  { id: "exercise", label: "Exercise equipment", icon: "🏋️" },
  { id: "lake-access", label: "Lake access", icon: "🌊" },
  { id: "beach-access", label: "Beach access", icon: "🏝️" },
  { id: "ski", label: "Ski-in/Ski-out", icon: "⛷️" },
  { id: "outdoor-shower", label: "Outdoor shower", icon: "🚿" },
];

const safetyItems = [
  { id: "smoke-alarm", label: "Smoke alarm", icon: "🔔" },
  { id: "first-aid", label: "First aid kit", icon: "🩹" },
  { id: "fire-extinguisher", label: "Fire extinguisher", icon: "🧯" },
  { id: "co-alarm", label: "Carbon monoxide alarm", icon: "⚠️" },
];

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepAmenities({ data, onChange }: Props) {
  const toggle = (id: string) => {
    const updated = data.amenities.includes(id)
      ? data.amenities.filter((a) => a !== id)
      : [...data.amenities, id];
    onChange({ amenities: updated });
  };

  return (
    <div className="max-w-xl mx-auto px-6">
      <h1 className="text-2xl md:text-[28px] font-extrabold text-foreground mb-1">
        Tell guests what your place has to offer
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        You can add more amenities after you publish your listing.
      </p>

      <Section title="What about these guest favorites?">
        {guestFavorites.map((a) => (
          <SelectableCard key={a.id} icon={<span>{a.icon}</span>} label={a.label} selected={data.amenities.includes(a.id)} onClick={() => toggle(a.id)} />
        ))}
      </Section>

      <Section title="Do you have any standout amenities?">
        {standoutAmenities.map((a) => (
          <SelectableCard key={a.id} icon={<span>{a.icon}</span>} label={a.label} selected={data.amenities.includes(a.id)} onClick={() => toggle(a.id)} />
        ))}
      </Section>

      <Section title="Do you have any of these safety items?">
        {safetyItems.map((a) => (
          <SelectableCard key={a.id} icon={<span>{a.icon}</span>} label={a.label} selected={data.amenities.includes(a.id)} onClick={() => toggle(a.id)} />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="font-medium text-sm text-foreground mb-3">{title}</p>
      <div className="grid grid-cols-3 gap-3">{children}</div>
    </div>
  );
}
