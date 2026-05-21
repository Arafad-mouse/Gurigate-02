import { useState } from "react"
import type { HostFormData } from "./types"

// ✅ Step imports
import { StepWelcome } from "./steps/StepWelcome"
import { StepIntro1 } from "./steps/StepIntro1"
import { StepIntro2 } from "./steps/StepIntro2"
import { StepIntro3 } from "./steps/StepIntro3"
import { StepBasics } from "./steps/StepBasics"
import { StepBathrooms } from "./steps/StepBathrooms"
import { StepAmenities } from "./steps/StepAmenities"
import { StepBooking } from "./steps/StepBooking"
import { StepConfirmAddress } from "./steps/StepConfirmAddress"
import { StepLocation } from "./steps/StepLocation"
import { StepHighlights } from "./steps/StepHighlights"
import { StepOccupants } from "./steps/StepOccupants"
import { StepPhotos } from "./steps/StepPhotos"
import { StepPropertyType } from "./steps/StepPropertyType"
import { StepSafety } from "./steps/StepSafety"
import { StepTitle } from "./steps/StepTitle"
import { StepFinalDetails } from "./steps/StepFinalDetails"

interface StepConfig {
  component: React.ComponentType<any>;
  hasProps: boolean;
}

const initialData: HostFormData = {
  propertyType: "",
  address: "",
  streetAddress: "",
  apt: "",
  city: "",
  province: "",
  postalCode: "",
  country: "Somalia - SO",
  showPreciseLocation: false,
  guests: 1,
  bedrooms: 0,
  beds: 1,
  bedroomLock: "",
  privateBathrooms: 0,
  dedicatedBathrooms: 0,
  sharedBathrooms: 0,
  otherOccupants: [],
  amenities: [],
  photos: [],
  title: "",
  highlights: [],
  bookingSetting: "",
  safetyItems: [],
  residentialStreet: "",
  residentialApt: "",
  residentialCity: "",
  residentialProvince: "",
  residentialPostalCode: "",
  residentialCountry: "",
  hostingAsBusiness: "",
}

export default function BecomeHost() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState(initialData)

  const onChange = (updates: Partial<HostFormData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  // ✅ Restored your original step sequence structure
  const steps: StepConfig[] = [
    { component: StepWelcome, hasProps: false },
    { component: StepIntro1, hasProps: false },
    { component: StepPropertyType, hasProps: true },
    { component: StepLocation, hasProps: true },
    { component: StepConfirmAddress, hasProps: true },
    { component: StepBasics, hasProps: true },
    { component: StepBathrooms, hasProps: true },
    { component: StepOccupants, hasProps: true },
    { component: StepIntro2, hasProps: false },
    { component: StepAmenities, hasProps: true },
    { component: StepPhotos, hasProps: true },
    { component: StepTitle, hasProps: true },
    { component: StepHighlights, hasProps: true },
    { component: StepIntro3, hasProps: false },
    { component: StepBooking, hasProps: true },
    { component: StepSafety, hasProps: true },
    { component: StepFinalDetails, hasProps: true },
  ];

  const currentStepConfig = steps[step]
  const CurrentComponent = currentStepConfig.component

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white min-h-[60vh] flex flex-col justify-between mt-10 shadow-sm border border-gray-100 rounded-2xl">
      <div className="flex-1">
        {/* ✅ Conditionally pass down values based on your configuration rules */}
        {currentStepConfig.hasProps ? (
          <CurrentComponent data={data} onChange={onChange} />
        ) : (
          <CurrentComponent />
        )}
      </div>

      <div className="flex justify-between mt-8 border-t border-gray-100 pt-4">
        <button 
          onClick={() => setStep((s) => Math.max(s - 1, 0))}
          className="px-5 py-2 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition"
        >
          Back
        </button>

        <button 
          onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
          className="px-5 py-2 text-sm font-semibold bg-[#BA0036] text-white rounded-xl hover:opacity-90 transition"
        >
          Next
        </button>
      </div>
    </div>
  )
}
