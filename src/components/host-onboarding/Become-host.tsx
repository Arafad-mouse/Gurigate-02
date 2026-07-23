import { useState, useEffect, useCallback } from "react"
import type { HostFormData } from "./types"
import { supabase } from "@/lib/supabase"
import { HostOnboardingService } from "@/services/hostOnboardingService"

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
import { StepPropertyCategory } from "./steps/StepPropertyCategory"
import { StepPropertyType } from "./steps/StepPropertyType"
import { StepSafety } from "./steps/StepSafety"
import { StepTitle } from "./steps/StepTitle"
import { StepFinalDetails } from "./steps/StepFinalDetails"
import { StepCommercialDetails } from "./steps/commercial/StepCommercialDetails"
import { StepBusinessSuitability } from "./steps/commercial/StepBusinessSuitability"
import { StepCommercialLeaseTerms } from "./steps/commercial/StepCommercialLeaseTerms"
import { StepLandBoundary } from "./steps/land/StepLandBoundary"
import { StepLandInformation } from "./steps/land/StepLandInformation"
import { StepLandFeatures } from "./steps/land/StepLandFeatures"
import { StepLandOwnershipDocuments } from "./steps/land/StepLandOwnershipDocuments"
import { StepHospitalityOverview } from "./steps/hospitality/StepHospitalityOverview"
import { StepHospitalityRoomTypes } from "./steps/hospitality/StepHospitalityRoomTypes"
import { StepHospitalityServices } from "./steps/hospitality/StepHospitalityServices"
import { StepHospitalityFacilities } from "./steps/hospitality/StepHospitalityFacilities"
import { StepHospitalityBookingConfig } from "./steps/hospitality/StepHospitalityBookingConfig"

interface StepComponentProps {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

interface StepConfig {
  id: StepId;
  component: React.ComponentType<StepComponentProps>;
  hasProps: boolean;
}

type StepId =
  | 'welcome'
  | 'intro_1'
  | 'property_category'
  | 'property_type'
  | 'location'
  | 'confirm_address'
  | 'basics'
  | 'bathrooms'
  | 'occupants'
  | 'intro_2'
  | 'amenities'
  | 'photos'
  | 'title'
  | 'highlights'
  | 'intro_3'
  | 'booking'
  | 'safety'
  | 'final_details'
  | 'commercial_details'
  | 'commercial_suitability'
  | 'commercial_lease_terms'
  | 'land_boundary'
  | 'land_information'
  | 'land_features'
  | 'land_documents'
  | 'hospitality_overview'
  | 'hospitality_room_types'
  | 'hospitality_services'
  | 'hospitality_facilities'
  | 'hospitality_booking_config';

const initialData: HostFormData = {
  propertyCategory: "",
  propertyTypes: [],
  listingType: "short_stay",
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
  commercialFloorArea: 0,
  commercialFloors: 1,
  commercialParkingSpaces: 0,
  commercialWashrooms: 0,
  commercialStorageRooms: 0,
  commercialUseTypes: [],
  commercialMonthlyRent: 0,
  commercialSecurityDeposit: 0,
  commercialMinimumLeaseMonths: 1,
  commercialServiceCharge: 0,
  landSizeValue: 0,
  landSizeUnit: "sqm",
  landFeatures: [],
  boundaryGeojson: "",
  ownershipDocuments: [],
  hospitalityTotalRooms: 0,
  hospitalityTotalFloors: 1,
  hospitalityMaxGuests: 1,
  hospitalityCheckInTime: "14:00",
  hospitalityCheckOutTime: "11:00",
  hospitalityRoomTypes: [],
  hospitalityServices: [],
  hospitalityFacilities: [],
  hospitalityInstantBooking: false,
  hospitalityBookingMode: "manual",
  hospitalityMinStayNights: 1,
  hospitalityMaxStayNights: 30,
}

const withNoProps = (Component: React.ComponentType) => {
  return function WrappedNoPropsStep(props: StepComponentProps) {
    void props
    return <Component />
  }
}

const COMMON_STEPS: StepConfig[] = [
  { id: 'welcome', component: withNoProps(StepWelcome), hasProps: false },
  { id: 'intro_1', component: withNoProps(StepIntro1), hasProps: false },
  { id: 'property_category', component: StepPropertyCategory, hasProps: true },
  { id: 'property_type', component: StepPropertyType, hasProps: true },
]

const CATEGORY_STEPS: Record<string, StepConfig[]> = {
  residential: [
    { id: 'location', component: StepLocation, hasProps: true },
    { id: 'confirm_address', component: StepConfirmAddress, hasProps: true },
    { id: 'basics', component: StepBasics, hasProps: true },
    { id: 'bathrooms', component: StepBathrooms, hasProps: true },
    { id: 'occupants', component: StepOccupants, hasProps: true },
    { id: 'intro_2', component: withNoProps(StepIntro2), hasProps: false },
    { id: 'amenities', component: StepAmenities, hasProps: true },
    { id: 'photos', component: StepPhotos, hasProps: true },
    { id: 'title', component: StepTitle, hasProps: true },
    { id: 'highlights', component: StepHighlights, hasProps: true },
    { id: 'intro_3', component: withNoProps(StepIntro3), hasProps: false },
    { id: 'booking', component: StepBooking, hasProps: true },
    { id: 'safety', component: StepSafety, hasProps: true },
    { id: 'final_details', component: StepFinalDetails, hasProps: true },
  ],
  commercial: [
    { id: 'location', component: StepLocation, hasProps: true },
    { id: 'commercial_details', component: StepCommercialDetails, hasProps: true },
    { id: 'commercial_suitability', component: StepBusinessSuitability, hasProps: true },
    { id: 'amenities', component: StepAmenities, hasProps: true },
    { id: 'photos', component: StepPhotos, hasProps: true },
    { id: 'title', component: StepTitle, hasProps: true },
    { id: 'commercial_lease_terms', component: StepCommercialLeaseTerms, hasProps: true },
    { id: 'final_details', component: StepFinalDetails, hasProps: true },
  ],
  land: [
    { id: 'land_boundary', component: StepLandBoundary, hasProps: true },
    { id: 'land_information', component: StepLandInformation, hasProps: true },
    { id: 'land_features', component: StepLandFeatures, hasProps: true },
    { id: 'land_documents', component: StepLandOwnershipDocuments, hasProps: true },
    { id: 'photos', component: StepPhotos, hasProps: true },
    { id: 'title', component: StepTitle, hasProps: true },
    { id: 'highlights', component: StepHighlights, hasProps: true },
    { id: 'final_details', component: StepFinalDetails, hasProps: true },
  ],
  hospitality: [
    { id: 'location', component: StepLocation, hasProps: true },
    { id: 'hospitality_overview', component: StepHospitalityOverview, hasProps: true },
    { id: 'hospitality_room_types', component: StepHospitalityRoomTypes, hasProps: true },
    { id: 'hospitality_services', component: StepHospitalityServices, hasProps: true },
    { id: 'hospitality_facilities', component: StepHospitalityFacilities, hasProps: true },
    { id: 'photos', component: StepPhotos, hasProps: true },
    { id: 'title', component: StepTitle, hasProps: true },
    { id: 'highlights', component: StepHighlights, hasProps: true },
    { id: 'hospitality_booking_config', component: StepHospitalityBookingConfig, hasProps: true },
    { id: 'final_details', component: StepFinalDetails, hasProps: true },
  ],
}

const getStepsForCategory = (category: string): StepConfig[] => {
  const flow = CATEGORY_STEPS[category] ?? CATEGORY_STEPS.residential
  return [...COMMON_STEPS, ...flow]
}

export default function BecomeHost() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [draftBanner, setDraftBanner] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState<string | null>(null)
  const steps = getStepsForCategory(data.propertyCategory)
  const currentStepConfig = steps[step]
  const CurrentComponent = currentStepConfig?.component

  useEffect(() => {
    setStep((prev) => Math.min(prev, steps.length - 1))
  }, [steps.length])

  // Check authentication and load any existing draft
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setSubmitError('You must be logged in to become a host. Please log in or sign up to continue.')
        setIsCheckingAuth(false)
        return
      }
      setUserId(user.id)
      const draft = await HostOnboardingService.loadDraft(user.id)
      if (draft && draft.step > 0) {
        setDraftBanner(true)
        setDraftTitle(draft.title ?? null)
        setData((prev) => ({ ...prev, ...draft.data }))
        setStep(draft.step)
      }
      setIsCheckingAuth(false)
    }
    checkAuth()
  }, [])

  const autoSaveDraft = useCallback(async (nextStep: number, currentData: HostFormData) => {
    if (!userId) return
    const title = currentData.title
      ? currentData.title
      : currentData.propertyTypes[0]
        ? `${currentData.propertyTypes[0]} in ${currentData.city || 'Somalia'}`
        : 'Untitled Draft'
    await HostOnboardingService.saveDraft(userId, nextStep, currentData, undefined, title)
  }, [userId])

  const onChange = (updates: Partial<HostFormData>) => {
    setData((prev) => {
      const newData = { ...prev, ...updates }
      return newData
    })
  }

  const validateCurrentStep = (): boolean => {
    const stepId = currentStepConfig?.id

    switch (stepId) {
      case 'property_category':
        if (!data.propertyCategory) {
          setSubmitError('Please select a property category')
          return false
        }
        break
      case 'property_type':
        if (data.propertyTypes.length === 0) {
          setSubmitError('Please select a property type')
          return false
        }
        break
      case 'location':
        if (!data.address || !data.city || !data.province || !data.postalCode) {
          setSubmitError('Please fill in all location fields')
          return false
        }
        break
      case 'basics':
        if (data.bedrooms < 0 || data.beds < 1) {
          setSubmitError('Please provide valid bedroom and bed counts')
          return false
        }
        break
      case 'bathrooms':
        if (data.privateBathrooms < 0 || data.dedicatedBathrooms < 0 || data.sharedBathrooms < 0) {
          setSubmitError('Please provide valid bathroom counts')
          return false
        }
        break
      case 'amenities':
        if (data.amenities.length === 0) {
          setSubmitError('Please select at least one amenity')
          return false
        }
        break
      case 'photos':
        if (data.photos.length < 5) {
          setSubmitError('Please add at least 5 photos')
          return false
        }
        break
      case 'title':
        if (!data.title || data.title.trim().length === 0) {
          setSubmitError('Please provide a property title')
          return false
        }
        break
      case 'highlights':
        if (data.highlights.length === 0) {
          setSubmitError('Please select at least one highlight')
          return false
        }
        break
      case 'booking':
        if (!data.bookingSetting) {
          setSubmitError('Please select a booking setting')
          return false
        }
        break
      case 'commercial_details':
        if (data.commercialFloorArea <= 0 || data.commercialFloors <= 0) {
          setSubmitError('Please provide valid commercial floor area and floors')
          return false
        }
        break
      case 'commercial_suitability':
        if (data.commercialUseTypes.length === 0) {
          setSubmitError('Please select at least one business suitability type')
          return false
        }
        break
      case 'commercial_lease_terms':
        if (data.commercialMonthlyRent <= 0 || data.commercialMinimumLeaseMonths <= 0) {
          setSubmitError('Please provide valid commercial lease terms')
          return false
        }
        break
      case 'land_boundary':
        if (!data.boundaryGeojson.trim()) {
          setSubmitError('Please provide boundary data for the land listing')
          return false
        }
        break
      case 'land_information':
        if (data.landSizeValue <= 0) {
          setSubmitError('Please provide a valid land size')
          return false
        }
        break
      case 'land_features':
        if (data.landFeatures.length === 0) {
          setSubmitError('Please select at least one land feature')
          return false
        }
        break
      case 'land_documents':
        if (data.ownershipDocuments.length === 0) {
          setSubmitError('Please select at least one ownership document')
          return false
        }
        break
      case 'hospitality_overview':
        if (data.hospitalityTotalRooms <= 0 || data.hospitalityTotalFloors <= 0 || data.hospitalityMaxGuests <= 0) {
          setSubmitError('Please provide valid hospitality overview values')
          return false
        }
        break
      case 'hospitality_room_types':
        if (data.hospitalityRoomTypes.length === 0) {
          setSubmitError('Please select at least one room type')
          return false
        }
        break
      case 'hospitality_services':
        if (data.hospitalityServices.length === 0) {
          setSubmitError('Please select at least one hospitality service')
          return false
        }
        break
      case 'hospitality_facilities':
        if (data.hospitalityFacilities.length === 0) {
          setSubmitError('Please select at least one hospitality facility')
          return false
        }
        break
      case 'hospitality_booking_config':
        if (!data.hospitalityBookingMode || data.hospitalityMinStayNights <= 0 || data.hospitalityMaxStayNights <= 0) {
          setSubmitError('Please complete hospitality booking configuration')
          return false
        }
        if (data.hospitalityMinStayNights > data.hospitalityMaxStayNights) {
          setSubmitError('Minimum stay cannot exceed maximum stay')
          return false
        }
        break
      case 'safety':
        if (data.safetyItems.length === 0) {
          setSubmitError('Please select at least one safety item')
          return false
        }
        break
      case 'final_details':
        if (!data.residentialStreet.trim() || !data.residentialCity.trim() || !data.residentialCountry.trim()) {
          setSubmitError('Please fill in your residential address (street, city, and country)')
          return false
        }
        if (!data.hostingAsBusiness) {
          setSubmitError('Please select whether you are hosting as a business')
          return false
        }
        break
    }
    setSubmitError(null)
    return true
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      if (!validateCurrentStep()) {
        return
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setSubmitError('You must be logged in to submit a property')
        return
      }

      await HostOnboardingService.saveProperty(data, user.id)
      setIsSuccess(true)
    } catch (error) {
      console.error('Error submitting property:', error)
      setSubmitError('Failed to submit property. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white min-h-[60vh] flex flex-col justify-between mt-10 mb-[60px] shadow-sm border border-gray-100 rounded-2xl">
      {draftBanner && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <p className="text-sm text-blue-700">
            Draft restored: <strong>{draftTitle || 'Untitled Draft'}</strong> — picking up where you left off.
          </p>
          <button
            type="button"
            onClick={() => setDraftBanner(false)}
            className="text-xs text-blue-500 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}
      {isCheckingAuth ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      ) : (
        <>
          <div className="flex-1">
            {/* ✅ Conditionally pass down values based on your configuration rules */}
            {CurrentComponent ? (
              <CurrentComponent key={`${step}-${JSON.stringify(data)}`} data={data} onChange={onChange} />
            ) : null}
          </div>

          <div className="flex justify-between mt-8 border-t border-gray-100 pt-4">
            <button
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              className="px-5 py-2 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition"
              disabled={isSubmitting || step === 0}
            >
              Back
            </button>

            {isSuccess ? (
              <div className="px-5 py-2 text-sm font-semibold text-green-600">
                Property submitted successfully!
              </div>
            ) : step === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-5 py-2 text-sm font-semibold bg-[#BA0036] text-white rounded-xl hover:opacity-90 transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Property'}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (validateCurrentStep()) {
                    const next = Math.min(step + 1, steps.length - 1)
                    setStep(next)
                    autoSaveDraft(next, data)
                  }
                }}
                className="px-5 py-2 text-sm font-semibold bg-[#BA0036] text-white rounded-xl hover:opacity-90 transition"
              >
                Next
              </button>
            )}
          </div>

          {submitError && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
