import { useState } from "react"
import type { HostFormData } from "./types"

// ✅ import steps
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

const initialData: HostFormData = {
  propertyType: "",
  address: "", // ✅ Fixed: Added missing required field to match your interface
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

  const steps = [
    StepWelcome,
    StepIntro1,
    StepIntro2,
    StepIntro3,
    StepBasics,
    StepBathrooms,
    StepAmenities,
    StepBooking,
    StepConfirmAddress,
    StepLocation,
    StepHighlights,
    StepOccupants,
    StepPhotos,
    StepPropertyType,
    StepSafety,
    StepTitle,
    StepFinalDetails,
  ]

  const CurrentStep = steps[step]

  return (
    <div>
      <CurrentStep data={data} onChange={onChange} />

      <div className="flex justify-between mt-6 px-6">
        <button onClick={() => setStep((s) => Math.max(s - 1, 0))}>
          Back
        </button>

        <button onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}>
          Next
        </button>
      </div>
    </div>
  )
}
