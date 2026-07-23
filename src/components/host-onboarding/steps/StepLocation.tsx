import { useState, useEffect, useRef, useCallback } from "react"
import { MapPin } from "lucide-react"
import type { HostFormData } from "../types"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icon in Leaflet
// @ts-expect-error - Leaflet type definition issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Default location: Hargeisa, Somaliland
const DEFAULT_LOCATION = { lat: 9.56, lng: 44.06 }

interface StepLocationProps {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepLocation({ data, onChange }: StepLocationProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const debounceTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map centered on Somaliland
    const map = L.map(mapRef.current).setView([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng], 13)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    // Add marker
    const marker = L.marker([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]).addTo(map)
    markerRef.current = marker

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Geocode address and update map (debounced)
  const geocodeAddress = useCallback(async (address: string) => {
    if (!address.trim() || !mapInstanceRef.current) return

    setIsLoading(true)
    try {
      // Use Nominatim (OpenStreetMap) geocoding API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Somalia')}&limit=1`
      )
      const results = await response.json()

      if (results && results.length > 0) {
        const { lat, lon, display_name } = results[0]
        const newLocation = { lat: parseFloat(lat), lng: parseFloat(lon) }

        // Update map view
        mapInstanceRef.current.setView([newLocation.lat, newLocation.lng], 15)

        // Update marker position
        if (markerRef.current) {
          markerRef.current.setLatLng([newLocation.lat, newLocation.lng])
        }

        // Auto-fill city if available
        const parts = display_name.split(', ')
        if (parts.length > 1) {
          const city = parts[parts.length - 3] || parts[0]
          onChange({ city })
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onChange])

  // Handle address input with debouncing
  const handleAddressChange = (address: string) => {
    // Immediate form update
    onChange({ streetAddress: address, address: address })

    // Debounce geocoding
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      geocodeAddress(address)
    }, 500) // 500ms debounce delay
  }

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
      <div className="relative w-full aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden border border-border shadow-sm">
        
        {/* Floating Search Input */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] z-[1000]">
          <div className="relative flex items-center">
            <MapPin className="absolute left-5 w-5 h-5 text-foreground" />
            <input
              type="text"
              placeholder="Enter your address (e.g., Jigjiga Yar, Hargeisa)"
              value={data.streetAddress || data.address || ""}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="w-full py-4 pl-14 pr-6 rounded-full bg-white text-foreground shadow-xl border-none focus:ring-2 focus:ring-black transition-all outline-none text-base"
            />
            {isLoading && (
              <div className="absolute right-4 w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
            )}
          </div>
        </div>

        {/* Real Map */}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Location Details Form */}
      <div className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apt/Suite (optional)</label>
            <input
              type="text"
              placeholder="Apt, suite, etc."
              value={data.apt || ""}
              onChange={(e) => onChange({ apt: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              placeholder="City"
              value={data.city || ""}
              onChange={(e) => onChange({ city: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Province/State</label>
            <input
              type="text"
              placeholder="Province or state"
              value={data.province || ""}
              onChange={(e) => onChange({ province: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <input
              type="text"
              placeholder="Postal code"
              value={data.postalCode || ""}
              onChange={(e) => onChange({ postalCode: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <select
            title="Country selection"
            value={data.country || "Somalia - SO"}
            onChange={(e) => onChange({ country: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
          >
            <option value="Somalia - SO">Somalia</option>
            <option value="Kenya - KE">Kenya</option>
            <option value="Ethiopia - ET">Ethiopia</option>
            <option value="Djibouti - DJ">Djibouti</option>
            <option value="United States - US">United States</option>
            <option value="United Kingdom - GB">United Kingdom</option>
            <option value="Canada - CA">Canada</option>
            <option value="Australia - AU">Australia</option>
            <option value="United Arab Emirates - AE">United Arab Emirates</option>
            <option value="Saudi Arabia - SA">Saudi Arabia</option>
          </select>
        </div>
      </div>
    </div>
  );
}
