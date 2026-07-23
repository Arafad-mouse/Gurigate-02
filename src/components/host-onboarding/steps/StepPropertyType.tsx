import type { HostFormData } from "../types";
import { SelectableCard } from "../SelectableCard";

type PropertyTypeEntry = { id: string; label: string; icon: React.ReactNode };

const HOUSE_ICON    = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V8.25l-9-6.75-9 6.75V21h4.5" /></svg>;
const APT_ICON      = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>;
const VILLA_ICON    = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2 21h20M3 21V8l9-6 9 6v13M9 21v-6h6v6" /></svg>;
const STUDIO_ICON   = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="18" height="18" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18M9 21V9" /></svg>;
const DUPLEX_ICON   = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 12h18M4 12V6l8-4 8 4v6M4 21v-9m16 9v-9" /></svg>;
const PENTHOUSE_ICON= <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M4 21V5l8-3 8 3v16M10 21v-5h4v5" /></svg>;
const ROOM_ICON     = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="7" width="20" height="13" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 0-4 0v2" /></svg>;
const SHARED_ICON   = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 20c0-3.3 2.7-6 6-6h8c3.3 0 6 2.7 6 6" /></svg>;
const GUEST_ICON    = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
const OFFICE_ICON   = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="7" width="20" height="14" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M12 12v4m-2-2h4" /></svg>;
const SHOP_ICON     = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" /></svg>;
const WAREHOUSE_ICON= <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4M3 7v13h18V7M3 7h18M9 21V12h6v9" /></svg>;
const RESTAURANT_ICON=<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2 0-4 1.5-4 4v8h8v-8c0-2.5-2-4-4-4ZM8 8V4m8 4V4M12 4v4" /></svg>;
const HOTEL_ICON    = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>;
const RESORT_ICON   = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V9l7-6 7 6v12M9 21v-5h6v5" /></svg>;
const HOSTEL_ICON   = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2 21h20M4 21V8l8-6 8 6v13M10 21v-4h4v4M8 12h.01M16 12h.01" /></svg>;
const LODGE_ICON    = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 21h16M5 21V12c0-3.5 3-7 7-7s7 3.5 7 7v9M10 21v-4h4v4" /></svg>;
const LAND_ICON     = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V12l3-3m4 12V6l3-9 3 9v15M8 9h.01M16 6h.01" /></svg>;
const FARM_ICON     = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 0L8 9h8l-4-4ZM4 21h16M6 21V13l6-4 6 4v8" /></svg>;

const TYPES_BY_CATEGORY: Record<string, PropertyTypeEntry[]> = {
  commercial: [
    { id: "office_building",    label: "Office Building",      icon: OFFICE_ICON },
    { id: "commercial_complex", label: "Commercial Complex",  icon: OFFICE_ICON },
    { id: "shopping_mall",      label: "Shopping Mall",        icon: SHOP_ICON },
    { id: "retail_shop",        label: "Retail Shop",          icon: SHOP_ICON },
    { id: "warehouse",          label: "Warehouse",            icon: WAREHOUSE_ICON },
    { id: "hotel",              label: "Hotel",                icon: HOTEL_ICON },
    { id: "restaurant",         label: "Restaurant",           icon: RESTAURANT_ICON },
    { id: "mixed_use_building", label: "Mixed Use Building",   icon: OFFICE_ICON },
    { id: "industrial_building", label: "Industrial Building",  icon: WAREHOUSE_ICON },
    { id: "business_center",    label: "Business Center",      icon: OFFICE_ICON },
  ],
};

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepPropertyType({ data, onChange }: Props) {
  const types = TYPES_BY_CATEGORY[data.propertyCategory] ?? TYPES_BY_CATEGORY.commercial;

  const handleSelect = (id: string) => {
    onChange({ propertyTypes: [id] });
  };

  return (
    <div className="max-w-xl mx-auto px-6">
      <h1 className="text-2xl md:text-[28px] font-extrabold text-foreground mb-2">
        Which of these best describes your place?
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Choose one type — you can always edit this later.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {types.map((type) => (
          <SelectableCard
            key={type.id}
            icon={type.icon}
            label={type.label}
            selected={data.propertyTypes.includes(type.id)}
            onClick={() => handleSelect(type.id)}
          />
        ))}
      </div>
    </div>
  );
}
