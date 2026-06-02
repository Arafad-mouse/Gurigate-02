import type { HostFormData } from "../types";
import { SelectableCard } from "../SelectableCard";
import { Wifi, Tv, Utensils, WashingMachine, Car, CircleDollarSign, Snowflake, Laptop, Waves, Sun, Flame, Gamepad2, Music, Dumbbell, MountainSnow, ShowerHead, Bell, HeartPulse, ShieldAlert, AlertTriangle } from "lucide-react";

const guestFavorites = [
  { id: "wifi", label: "Wifi", icon: <Wifi className="w-6 h-6" strokeWidth={1} /> },
  { id: "tv", label: "TV", icon: <Tv className="w-6 h-6" strokeWidth={1} /> },
  { id: "kitchen", label: "Kitchen", icon: <Utensils className="w-6 h-6" strokeWidth={1} /> },
  { id: "washer", label: "Washer", icon: <WashingMachine className="w-6 h-6" strokeWidth={1} /> },
  { id: "free-parking", label: "Free parking on premises", icon: <Car className="w-6 h-6" strokeWidth={1} /> },
  { id: "paid-parking", label: "Paid parking on premises", icon: <CircleDollarSign className="w-6 h-6" strokeWidth={1} /> },
  { id: "ac", label: "Air conditioning", icon: <Snowflake className="w-6 h-6" strokeWidth={1} /> },
  { id: "workspace", label: "Dedicated workspace", icon: <Laptop className="w-6 h-6" strokeWidth={1} /> },
];

const standoutAmenities = [
  { id: "pool", label: "Pool", icon: <Waves className="w-6 h-6" strokeWidth={1} /> },
  { id: "hot-tub", label: "Hot tub", icon: <Waves className="w-6 h-6" strokeWidth={1} /> },
  { id: "patio", label: "Patio", icon: <Sun className="w-6 h-6" strokeWidth={1} /> },
  { id: "bbq", label: "BBQ grill", icon: <Flame className="w-6 h-6" strokeWidth={1} /> },
  { id: "outdoor-dining", label: "Outdoor dining area", icon: <Utensils className="w-6 h-6" strokeWidth={1} /> },
  { id: "fire-pit", label: "Fire pit", icon: <Flame className="w-6 h-6" strokeWidth={1} /> },
  { id: "pool-table", label: "Pool table", icon: <Gamepad2 className="w-6 h-6" strokeWidth={1} /> },
  { id: "fireplace", label: "Indoor fireplace", icon: <Flame className="w-6 h-6" strokeWidth={1} /> },
  { id: "piano", label: "Piano", icon: <Music className="w-6 h-6" strokeWidth={1} /> },
  { id: "exercise", label: "Exercise equipment", icon: <Dumbbell className="w-6 h-6" strokeWidth={1} /> },
  { id: "lake-access", label: "Lake access", icon: <Waves className="w-6 h-6" strokeWidth={1} /> },
  { id: "beach-access", label: "Beach access", icon: <Waves className="w-6 h-6" strokeWidth={1} /> },
  { id: "ski", label: "Ski-in/Ski-out", icon: <MountainSnow className="w-6 h-6" strokeWidth={1} /> },
  { id: "outdoor-shower", label: "Outdoor shower", icon: <ShowerHead className="w-6 h-6" strokeWidth={1} /> },
];

const safetyItems = [
  { id: "smoke-alarm", label: "Smoke alarm", icon: <Bell className="w-6 h-6" strokeWidth={1} /> },
  { id: "first-aid", label: "First aid kit", icon: <HeartPulse className="w-6 h-6" strokeWidth={1} /> },
  { id: "fire-extinguisher", label: "Fire extinguisher", icon: <ShieldAlert className="w-6 h-6" strokeWidth={1} /> },
  { id: "co-alarm", label: "Carbon monoxide alarm", icon: <AlertTriangle className="w-6 h-6" strokeWidth={1} /> },
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
          <SelectableCard key={a.id} icon={a.icon} label={a.label} selected={data.amenities.includes(a.id)} onClick={() => toggle(a.id)} />
        ))}
      </Section>

      <Section title="Do you have any standout amenities?">
        {standoutAmenities.map((a) => (
          <SelectableCard key={a.id} icon={a.icon} label={a.label} selected={data.amenities.includes(a.id)} onClick={() => toggle(a.id)} />
        ))}
      </Section>

      <Section title="Do you have any of these safety items?">
        {safetyItems.map((a) => (
          <SelectableCard key={a.id} icon={a.icon} label={a.label} selected={data.amenities.includes(a.id)} onClick={() => toggle(a.id)} />
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
