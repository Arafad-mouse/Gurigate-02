import { MapPin } from "lucide-react"
import type { HostFormData } from "../types"

interface StepLocationProps {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepLocation({ data, onChange }: StepLocationProps) {
  const handleAddressChange = (address: string) => {
    onChange({ streetAddress: address, address: address })
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

      {/* Address Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
          <div className="relative flex items-center">
            <MapPin className="absolute left-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter your address (e.g., Jigjiga Yar, Hargeisa)"
              value={data.streetAddress || data.address || ""}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="w-full py-3 pl-12 pr-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
            />
          </div>
        </div>
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
