import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  language?: string;
  email?: string;
}

export default function ProfilePage() {
  const { "*": tab } = useParams();
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [language, setLanguage] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [email, setEmail] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialValues, setInitialValues] = useState({
    firstName: "",
    lastName: "",
    country: "",
    city: "",
    language: "",
    timeZone: "",
    phone: "",
    occupation: "",
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "preferences", label: "Preferences" },
    { id: "notifications", label: "Notifications" },
    { id: "general", label: "General" },
    { id: "integrations", label: "Integrations" },
  ];

  const activeTab = tab || "profile";

  // Track form changes
  useEffect(() => {
    setInitialValues({
      firstName,
      lastName,
      country,
      city,
      language,
      timeZone,
      phone,
      occupation,
      email,
    });
  }, []);

  useEffect(() => {
    const hasChanges = 
      firstName !== initialValues.firstName ||
      lastName !== initialValues.lastName ||
      country !== initialValues.country ||
      city !== initialValues.city ||
      language !== initialValues.language ||
      timeZone !== initialValues.timeZone ||
      phone !== initialValues.phone ||
      occupation !== initialValues.occupation ||
      email !== initialValues.email;
    setHasUnsavedChanges(hasChanges);
  }, [firstName, lastName, country, city, language, timeZone, phone, occupation, email, initialValues]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (/\d/.test(firstName)) {
      newErrors.firstName = "First name cannot contain numbers";
    }

    // Last Name validation
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (/\d/.test(lastName)) {
      newErrors.lastName = "Last name cannot contain numbers";
    }

    // Country validation
    if (!country.trim()) {
      newErrors.country = "Country is required";
    }

    // City validation
    if (!city.trim()) {
      newErrors.city = "City is required";
    } else if (city.length < 2) {
      newErrors.city = "City must be at least 2 characters";
    }

    // Language validation
    if (!language.trim()) {
      newErrors.language = "Language is required";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Computed validation without state updates
  const isFormValid = () => {
    return (
      firstName.trim().length >= 2 &&
      !/\d/.test(firstName) &&
      lastName.trim().length >= 2 &&
      !/\d/.test(lastName) &&
      country.trim() !== "" &&
      city.trim().length >= 2 &&
      language.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
  };

  const handleTabChange = (tabId: string) => {
    navigate(`/settings/${tabId}`);
  };

  const handleDiscard = () => {
    setFirstName(initialValues.firstName || "");
    setLastName(initialValues.lastName || "");
    setCountry(initialValues.country || "");
    setCity(initialValues.city || "");
    setLanguage(initialValues.language || "");
    setTimeZone(initialValues.timeZone || "");
    setPhone(initialValues.phone || "");
    setOccupation(initialValues.occupation || "");
    setEmail(initialValues.email || "");
    setHasUnsavedChanges(false);
    setErrors({});
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    // TODO: Implement API integration
    console.log("Saving changes...");
    setHasUnsavedChanges(false);
    setErrors({});
  };

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "country":
        setCountry(value);
        break;
      case "city":
        setCity(value);
        break;
      case "language":
        setLanguage(value);
        break;
      case "timeZone":
        setTimeZone(value);
        break;
      case "phone":
        setPhone(value);
        break;
      case "occupation":
        setOccupation(value);
        break;
      case "email":
        setEmail(value);
        break;
    }
    // Clear error for this field when user starts typing
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="Profile w-full bg-stone-50 min-h-screen pb-24">
      {/* Main Content */}
      <div className="Container w-full max-w-6xl mx-auto px-6 py-8">
        {/* Page Header with Last Updated and Profile Completion */}
        <div className="Header mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold font-['Manrope'] text-zinc-900 leading-tight">Profile Settings</h1>
              <p className="text-zinc-600 text-base font-normal font-['Manrope'] mt-2">Manage your account information and preferences</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-zinc-500 font-['Manrope']">Last Updated</div>
              <div className="text-sm font-semibold font-['Manrope'] text-zinc-900">3 months ago</div>
              <div className="text-sm text-zinc-500 font-['Manrope'] mt-2">Profile Completion</div>
              <div className="text-sm font-semibold font-['Manrope'] text-rose-700">75%</div>
            </div>
          </div>
        </div>

        {/* Horizontal Tab Navigation - Sticky */}
        <div className="TabNavigation mb-8 border-b border-gray-200 sticky top-0 bg-stone-50 z-10 pt-2">
          <div className="flex gap-2 overflow-x-auto pb-4">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={`/settings/${tab.id}`}
                className={`px-4 py-2 text-sm font-semibold font-['Manrope'] rounded-full whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-rose-700 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Profile Picture Section - Full width matching form */}
        <div className="ProfilePictureSection mb-8 p-6 bg-white rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="size-20 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
              <img className="w-full h-full object-cover" src="https://placehold.co/128x128" alt="Profile" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold font-['Manrope'] text-zinc-900 mb-3">Profile Picture</h3>
              <div className="flex gap-3">
                <button className="px-5 py-2 bg-gradient-to-b from-rose-700 to-rose-600 text-white text-sm font-bold font-['Manrope'] rounded-full shadow-sm hover:shadow-md transition-shadow">
                  Upload New Photo
                </button>
                <button className="px-5 py-2 bg-zinc-100 text-zinc-900 text-sm font-bold font-['Manrope'] rounded-full hover:bg-zinc-200 transition-colors">
                  Remove Photo
                </button>
              </div>
              <p className="text-xs text-zinc-500 font-['Manrope'] mt-2">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>

        {/* Personal Information Form - Two Column Grid */}
        <div className="FormSection mb-8 p-6 bg-white rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold font-['Manrope'] text-zinc-900 mb-6">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Row 1: First Name | Last Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="firstName" className="text-sm font-bold font-['Manrope'] text-zinc-900">
                First Name <span className="text-rose-700">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => handleFieldChange("firstName", e.target.value)}
                placeholder="Enter your first name"
                className={`w-full px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-rose-700 transition-all ${
                  errors.firstName ? "ring-2 ring-red-500" : ""
                }`}
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
              />
              {errors.firstName && (
                <p id="firstName-error" className="text-xs text-red-500 font-['Manrope']" role="alert">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="lastName" className="text-sm font-bold font-['Manrope'] text-zinc-900">
                Last Name <span className="text-rose-700">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => handleFieldChange("lastName", e.target.value)}
                placeholder="Enter your last name"
                className={`w-full px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-rose-700 transition-all ${
                  errors.lastName ? "ring-2 ring-red-500" : ""
                }`}
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
              />
              {errors.lastName && (
                <p id="lastName-error" className="text-xs text-red-500 font-['Manrope']" role="alert">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* Row 2: Country | City */}
            <div className="flex flex-col gap-2">
              <label htmlFor="country" className="text-sm font-bold font-['Manrope'] text-zinc-900">
                Country <span className="text-rose-700">*</span>
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => handleFieldChange("country", e.target.value)}
                className={`w-full px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-rose-700 transition-all ${
                  errors.country ? "ring-2 ring-red-500" : ""
                }`}
                aria-invalid={!!errors.country}
                aria-describedby={errors.country ? "country-error" : undefined}
              >
                <option value="">Select your country</option>
                <option value="Somali">🇸🇴 Somali</option>
                <option value="Kenya">🇰🇪 Kenya</option>
                <option value="Ethiopia">🇪🇹 Ethiopia</option>
              </select>
              {errors.country && (
                <p id="country-error" className="text-xs text-red-500 font-['Manrope']" role="alert">
                  {errors.country}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="city" className="text-sm font-bold font-['Manrope'] text-zinc-900">
                City <span className="text-rose-700">*</span>
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => handleFieldChange("city", e.target.value)}
                placeholder="Enter your city"
                className={`w-full px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-rose-700 transition-all ${
                  errors.city ? "ring-2 ring-red-500" : ""
                }`}
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? "city-error" : undefined}
              />
              {errors.city && (
                <p id="city-error" className="text-xs text-red-500 font-['Manrope']" role="alert">
                  {errors.city}
                </p>
              )}
            </div>

            {/* Row 3: Language | Time Zone */}
            <div className="flex flex-col gap-2">
              <label htmlFor="language" className="text-sm font-bold font-['Manrope'] text-zinc-900">
                Language <span className="text-rose-700">*</span>
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => handleFieldChange("language", e.target.value)}
                className={`w-full px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-rose-700 transition-all ${
                  errors.language ? "ring-2 ring-red-500" : ""
                }`}
                aria-invalid={!!errors.language}
                aria-describedby={errors.language ? "language-error" : undefined}
              >
                <option value="">Select your language</option>
                <option value="English">English</option>
                <option value="Arabic">Arabic</option>
                <option value="Somali">Somali</option>
              </select>
              {errors.language && (
                <p id="language-error" className="text-xs text-red-500 font-['Manrope']" role="alert">
                  {errors.language}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="timeZone" className="text-sm font-bold font-['Manrope'] text-zinc-900">Time Zone</label>
              <select
                id="timeZone"
                value={timeZone}
                onChange={(e) => handleFieldChange("timeZone", e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-rose-700 transition-all"
              >
                <option value="">Select your time zone</option>
                <option value="UTC+3">UTC+3 (East Africa Time)</option>
                <option value="UTC+2">UTC+2 (Central Africa Time)</option>
                <option value="UTC+1">UTC+1 (West Africa Time)</option>
              </select>
            </div>

            {/* Row 4: Phone | Occupation */}
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-sm font-bold font-['Manrope'] text-zinc-900">Phone</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                placeholder="+252 61 234 5678"
                className="w-full px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-rose-700 transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="occupation" className="text-sm font-bold font-['Manrope'] text-zinc-900">Occupation</label>
              <input
                id="occupation"
                type="text"
                value={occupation}
                onChange={(e) => handleFieldChange("occupation", e.target.value)}
                placeholder="Property Manager"
                className="w-full px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-rose-700 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Security Card - Enhanced with 2FA placeholder */}
        <div className="SecuritySection mb-8 p-6 bg-zinc-100 rounded-2xl">
          <h2 className="text-xl font-bold font-['Manrope'] text-zinc-900 mb-6">Security</h2>
          
          {/* Password Section */}
          <div className="mb-6 pb-6 border-b border-gray-300">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold font-['Manrope'] text-zinc-900 mb-1">Password</h3>
                <p className="text-zinc-600 text-sm font-normal font-['Manrope']">Last changed 3 months ago. We recommend updating your password periodically for security.</p>
              </div>
              <button className="px-6 py-3 bg-white text-zinc-900 text-base font-bold font-['Manrope'] rounded-full border border-red-200/20 hover:bg-zinc-50 transition-colors flex-shrink-0">
                Change Password
              </button>
            </div>
          </div>

          {/* Two-Factor Authentication Section */}
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold font-['Manrope'] text-zinc-900 mb-1">Two-Factor Authentication</h3>
                <p className="text-zinc-600 text-sm font-normal font-['Manrope']">Status: <span className="text-rose-700 font-semibold">Disabled</span></p>
                <p className="text-zinc-500 text-xs font-normal font-['Manrope'] mt-1">Add an extra layer of security to your account</p>
              </div>
              <button className="px-6 py-3 bg-white text-zinc-900 text-base font-bold font-['Manrope'] rounded-full border border-red-200/20 hover:bg-zinc-50 transition-colors flex-shrink-0">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="FooterActions pt-6 border-t border-gray-200 flex justify-end items-center gap-4">
          <button className="px-6 py-3 text-zinc-600 text-lg font-bold font-['Manrope'] hover:text-zinc-900 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!isFormValid() || !hasUnsavedChanges}
            className={`px-8 py-3 text-lg font-bold font-['Manrope'] rounded-full shadow-lg transition-shadow ${
              isFormValid() && hasUnsavedChanges
                ? "bg-gradient-to-b from-rose-700 to-rose-600 text-white hover:shadow-xl cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Save changes
          </button>
        </div>
      </div>

      {/* Floating Save Changes Bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="w-full max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-zinc-900 text-base font-semibold font-['Manrope']">You have unsaved changes</span>
            <div className="flex gap-3">
              <button
                onClick={handleDiscard}
                className="px-6 py-2 text-zinc-600 text-base font-bold font-['Manrope'] hover:text-zinc-900 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={!isFormValid()}
                className={`px-6 py-2 text-base font-bold font-['Manrope'] rounded-full shadow-lg transition-shadow ${
                  isFormValid()
                    ? "bg-gradient-to-b from-rose-700 to-rose-600 text-white hover:shadow-xl cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
