"use client";

import { useState, useRef, useEffect } from "react";
import { X, AlertCircle, Check } from "lucide-react";
import { PropertyService } from "@/services/properties";
import type { 
  CreatePropertyRequest, 
  PropertyType
} from "@/types/property";
import { 
  CURRENCIES, 
  COMMON_AMENITIES, 
  COMMON_RULES,
  PROPERTY_CONFIGURATION,
  PROPERTY_TYPE_LABELS
} from "@/types/property";

interface AddPropertyModalProps {
  onClose: () => void;
  onSuccess: (property: any) => void;
}

// Form steps
type FormStep = "basic" | "address" | "pricing" | "features" | "review";

export function AddPropertyModal({ onClose, onSuccess }: AddPropertyModalProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>("basic");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<CreatePropertyRequest>({
    title: "",
    description: "",
    type: "apartment",
    address: {
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
    },
    pricing: {
      base_price: 0,
      currency: "USD",
      pricing_type: "nightly",
      security_deposit: 0,
      cleaning_fee: 0,
      service_fee: 0,
    },
    features: {
      bedrooms: 1,
      bathrooms: 1,
      max_guests: 1,
      square_feet: 0,
      amenities: [],
      rules: [],
    },
  });

  const [selectedBedroomOption, setSelectedBedroomOption] = useState<string>("");

  // Close on backdrop click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Update bedroom count when selected bedroom option changes
  useEffect(() => {
    if (selectedBedroomOption) {
      const bedroomCount = parseBedroomOption(selectedBedroomOption);
      updateFormData('features', { bedrooms: bedroomCount });
    }
  }, [selectedBedroomOption]);

  const updateFormData = (section: keyof CreatePropertyRequest, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null 
        ? { ...prev[section] as any, ...data }
        : data
    }));
  };

  const parseBedroomOption = (option: string): number => {
    if (!option) return 1;
    if (option === 'Studio' || option === 'Studio Only') return 0;
    const match = option.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  const validateStep = (step: FormStep): boolean => {
    const stepErrors: string[] = [];

    switch (step) {
      case "basic":
        if (!formData.title.trim()) stepErrors.push("Property title is required");
        if (!formData.description.trim()) stepErrors.push("Description is required");
        if (!formData.type) stepErrors.push("Property type is required");
        
        const config = PROPERTY_CONFIGURATION[formData.type];
        if (config && config.isRequired && config.fieldType !== 'none') {
          if (!selectedBedroomOption) {
            const fieldLabel = config.fieldLabel;
            stepErrors.push(`${fieldLabel} is required`);
          }
        }
        break;
      case "address":
        if (!formData.address.street.trim()) stepErrors.push("Street address is required");
        if (!formData.address.city.trim()) stepErrors.push("City is required");
        if (!formData.address.country.trim()) stepErrors.push("Country is required");
        break;
      case "pricing":
        if (!formData.pricing.base_price || formData.pricing.base_price <= 0) {
          stepErrors.push("Base price must be greater than 0");
        }
        break;
      case "features":
        if (!formData.features.bathrooms || formData.features.bathrooms < 0) {
          stepErrors.push("Bathrooms must be 0 or greater");
        }
        if (!formData.features.max_guests || formData.features.max_guests < 1) {
          stepErrors.push("Max guests must be at least 1");
        }
        break;
    }

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const steps: FormStep[] = ["basic", "address", "pricing", "features", "review"];
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
        setErrors([]);
      }
    }
  };

  const handleBack = () => {
    const steps: FormStep[] = ["basic", "address", "pricing", "features", "review"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
      setErrors([]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors([]);

    try {
      const validation = PropertyService.validatePropertyData(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      const property = await PropertyService.createProperty({
        ...formData,
        badge: 'featured' as any,
        price_unit_label: 'per night'
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess(property);
        onClose();
      }, 2000);
    } catch (error: any) {
      setErrors([error.message || "Failed to create property"]);
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        amenities: prev.features.amenities.includes(amenity)
          ? prev.features.amenities.filter(a => a !== amenity)
          : [...prev.features.amenities, amenity]
      }
    }));
  };

  const toggleRule = (rule: string) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        rules: prev.features.rules.includes(rule)
          ? prev.features.rules.filter(r => r !== rule)
          : [...prev.features.rules, rule]
      }
    }));
  };

  const stepTitles: Record<FormStep, string> = {
    basic: "Basic Information",
    address: "Property Address",
    pricing: "Pricing Details",
    features: "Features & Amenities",
    review: "Review & Submit"
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "basic":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Modern Downtown Apartment"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value as PropertyType;
                  setFormData(prev => ({ ...prev, type: newType }));
                  setSelectedBedroomOption("");
                  const newConfig = PROPERTY_CONFIGURATION[newType];
                  if (newConfig?.defaultValue) {
                    setSelectedBedroomOption(newConfig.defaultValue);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
                <option value="hotel">Hotel</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="cottage">Cottage</option>
                <option value="penthouse">Penthouse</option>
                <option value="loft">Loft</option>
                <option value="other">Other</option>
              </select>
            </div>

            {(() => {
              const config = PROPERTY_CONFIGURATION[formData.type];
              if (!config || config.fieldType === 'none') return null;

              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {config.fieldLabel} {config.isRequired ? '*' : ''}
                  </label>
                  <select
                    value={selectedBedroomOption}
                    onChange={(e) => setSelectedBedroomOption(e.target.value)}
                    disabled={config.isDisabled}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select {config.fieldLabel.toLowerCase()}...</option>
                    {config.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })()}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your property, its unique features, and what makes it special..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>
        );

      case "address":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => updateFormData('address', { street: e.target.value })}
                placeholder="123 Main Street"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => updateFormData('address', { city: e.target.value })}
                  placeholder="New York"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => updateFormData('address', { state: e.target.value })}
                  placeholder="NY"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.address.postal_code}
                  onChange={(e) => updateFormData('address', { postal_code: e.target.value })}
                  placeholder="10001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) => updateFormData('address', { country: e.target.value })}
                  placeholder="United States"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        );

      case "pricing":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price *
                </label>
                <input
                  type="number"
                  value={formData.pricing.base_price}
                  onChange={(e) => updateFormData('pricing', { base_price: parseFloat(e.target.value) || 0 })}
                  placeholder="100"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  value={formData.pricing.currency}
                  onChange={(e) => updateFormData('pricing', { currency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Type *
              </label>
              <select
                value={formData.pricing.pricing_type}
                onChange={(e) => updateFormData('pricing', { pricing_type: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value="nightly">Per Night</option>
                <option value="monthly">Per Month</option>
                <option value="sale">For Sale</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Deposit
                </label>
                <input
                  type="number"
                  value={formData.pricing.security_deposit}
                  onChange={(e) => updateFormData('pricing', { security_deposit: parseFloat(e.target.value) || 0 })}
                  placeholder="200"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cleaning Fee
                </label>
                <input
                  type="number"
                  value={formData.pricing.cleaning_fee}
                  onChange={(e) => updateFormData('pricing', { cleaning_fee: parseFloat(e.target.value) || 0 })}
                  placeholder="50"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Fee
                </label>
                <input
                  type="number"
                  value={formData.pricing.service_fee}
                  onChange={(e) => updateFormData('pricing', { service_fee: parseFloat(e.target.value) || 0 })}
                  placeholder="25"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        );

      case "features":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  value={formData.features.bedrooms}
                  onChange={(e) => updateFormData('features', { bedrooms: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  disabled={formData.type === 'hotel'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  value={formData.features.bathrooms}
                  onChange={(e) => updateFormData('features', { bathrooms: parseInt(e.target.value) || 0 })}
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Guests *
                </label>
                <input
                  type="number"
                  value={formData.features.max_guests}
                  onChange={(e) => updateFormData('features', { max_guests: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Feet
                </label>
                <input
                  type="number"
                  value={formData.features.square_feet}
                  onChange={(e) => updateFormData('features', { square_feet: parseInt(e.target.value) || 0 })}
                  min="0"
                  placeholder="1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities
              </label>
              <div className="grid max-h-40 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-gray-200 p-2 sm:grid-cols-2 lg:grid-cols-3">
                {COMMON_AMENITIES.map(amenity => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.features.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="text-red-500 focus:ring-red-500"
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                House Rules
              </label>
              <div className="grid max-h-40 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-gray-200 p-2 sm:grid-cols-2">
                {COMMON_RULES.map(rule => (
                  <label
                    key={rule}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.features.rules.includes(rule)}
                      onChange={() => toggleRule(rule)}
                      className="text-red-500 focus:ring-red-500"
                    />
                    {rule}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Property Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Title:</span>
                  <span className="ml-2">{formData.title}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Type:</span>
                  <span className="ml-2 capitalize">{formData.type}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Address:</span>
                  <span className="ml-2">
                    {formData.address.street}, {formData.address.city}, {formData.address.country}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Price:</span>
                  <span className="ml-2">
                    {CURRENCIES.find(c => c.code === formData.pricing.currency)?.symbol}
                    {formData.pricing.base_price} / {formData.pricing.pricing_type}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Features:</span>
                  <span className="ml-2">
                    {formData.features.bedrooms} bed, {formData.features.bathrooms} bath, 
                    {formData.features.max_guests} guests
                  </span>
                </div>
              </div>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <Check className="text-green-600" size={20} />
                <div>
                  <p className="font-medium text-green-900">Property created successfully!</p>
                  <p className="text-sm text-green-700">You will be redirected shortly...</p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const steps: FormStep[] = ["basic", "address", "pricing", "features", "review"];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-2 sm:items-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
    >
      <div
        ref={ref}
        className="w-full max-w-[calc(100vw-1rem)] overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
        style={{ animation: "modalIn .2s cubic-bezier(.16,1,.3,1) both" }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

        {/* Header */}
        <div className="relative flex items-center justify-center border-b border-gray-200 px-4 py-4 sm:px-6">
          <button
            onClick={onClose}
            className="absolute left-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>

          <h2 className="text-sm font-semibold text-gray-900">{stepTitles[currentStep]}</h2>

          <div className="absolute right-4 text-sm text-gray-500 sm:right-6">
            {currentStepIndex + 1} / {steps.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  index <= currentStepIndex ? "bg-red-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-4 sm:max-h-[60vh] sm:p-6">
          {errors.length > 0 && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 mt-0.5" size={16} />
                <div>
                  <p className="font-medium text-red-900 text-sm">Please fix the following errors:</p>
                  <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <button
            onClick={currentStep === "basic" ? onClose : handleBack}
            disabled={loading}
            className="w-full rounded-xl px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 sm:w-auto"
          >
            {currentStep === "basic" ? "Cancel" : "Back"}
          </button>

          {currentStep === "review" ? (
            <button
              onClick={handleSubmit}
              disabled={loading || success}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                  </svg>
                  Creating Property...
                </>
              ) : success ? (
                <>
                  <Check size={16} />
                  Created!
                </>
              ) : (
                "Create Property"
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full rounded-xl bg-red-500 px-6 py-3 font-medium text-white transition-colors hover:bg-red-600 sm:w-auto"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
