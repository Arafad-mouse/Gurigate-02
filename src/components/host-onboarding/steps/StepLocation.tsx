import { MapPin } from "lucide-react"; // Using lucide-react for the icon

export function StepLocation() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Where's your place located?
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Your address is only shared with guests after they've made a reservation.
        </p>
      </div>

      {/* Map Container */}
      <div className="relative w-full aspect-[4/5] md:aspect-square bg-[#f2eee3] rounded-2xl overflow-hidden border border-border shadow-sm">
        
        {/* Floating Search Input */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] z-10">
          <div className="relative flex items-center">
            <MapPin className="absolute left-5 w-5 h-5 text-foreground" />
            <input
              type="text"
              placeholder="Enter your address"
              className="w-full py-4 pl-14 pr-6 rounded-full bg-white text-foreground shadow-xl border-none focus:ring-2 focus:ring-black transition-all outline-none text-base"
            />
          </div>
        </div>

        {/* Map Placeholder / Visual Elements */}
        <div className="w-full h-full flex items-center justify-center">
          {/* Centered Map Marker */}
          <div className="relative">
            <div className="w-4 h-4 bg-black rounded-full border-2 border-white shadow-md z-10" />
            <div className="absolute -inset-4 bg-black/5 rounded-full animate-pulse" />
          </div>
          
          {/* Placeholder for Map Text/Lines (Styling only) */}
          <div className="absolute inset-0 opacity-40 pointer-events-none border-l border-dashed border-gray-400 left-2/3 h-full" />
        </div>

        {/* Google Logo Placeholder */}
        <div className="absolute bottom-4 left-4">
          <span className="text-sm font-bold text-gray-500/60 tracking-tighter">Google</span>
        </div>
      </div>
    </div>
  );
}
