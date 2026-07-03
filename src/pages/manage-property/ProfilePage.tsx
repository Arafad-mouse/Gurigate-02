import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  language?: string;
  email?: string;
}

interface PreferenceErrors {
  language?: string;
  currency?: string;
  timezone?: string;
}

interface ProfilePageProps {
  section?: string;
}

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface AuthMetadata {
  userId: string;
  email: string;
  role: string;
  createdAt: string;
  lastSignIn: string;
}

const SUPPORTED_LANGUAGES = ['English', 'Somali', 'Arabic'];
const SUPPORTED_CURRENCIES = ['USD ($)', 'Somaliland Shilling (SLSH)', 'Somali Shilling (SOS)', 'Ethiopian Birr (ETB)'];
const SUPPORTED_TIMEZONES = ['UTC+0', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5'];

export default function ProfilePage({ section }: ProfilePageProps) {
  const { "*": tab } = useParams();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [language, setLanguage] = useState("");
  const [email, setEmail] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialValues, setInitialValues] = useState({
    firstName: "",
    lastName: "",
    language: "",
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("https://placehold.co/128x128");
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preferences state
  const [prefLanguage, setPrefLanguage] = useState("");
  const [prefCurrency, setPrefCurrency] = useState("");
  const [prefTimeZone, setPrefTimeZone] = useState("");
  const [hasUnsavedPrefChanges, setHasUnsavedPrefChanges] = useState(false);
  const [initialPrefValues, setInitialPrefValues] = useState({
    language: "",
    currency: "",
    timezone: "",
  });
  const [prefErrors, setPrefErrors] = useState<PreferenceErrors>({});
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [authMetadata, setAuthMetadata] = useState<AuthMetadata | null>(null);

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "preferences", label: "Preferences" },
    { id: "notifications", label: "Notifications" },
    { id: "general", label: "General" },
    { id: "integrations", label: "Integrations" },
  ];

  const activeTab = section || tab || "profile";

  // Toast notification helpers
  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Detect timezone on first load
  const detectTimezone = (): string => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Map common timezone names to UTC offsets
      if (tz.includes('Africa/Nairobi') || tz.includes('Africa/Khartoum')) return 'UTC+3';
      if (tz.includes('Africa/Cairo') || tz.includes('Africa/Johannesburg')) return 'UTC+2';
      if (tz.includes('Africa/Lagos')) return 'UTC+1';
      if (tz.includes('Asia/Kolkata')) return 'UTC+5';
      if (tz.includes('Asia/Dubai')) return 'UTC+4';
      return 'UTC+0';
    } catch {
      return 'UTC+0';
    }
  };

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Load auth metadata
        const formatDate = (date: string | null) => {
          if (!date) return 'Never';
          return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        };

        setAuthMetadata({
          userId: user.id,
          email: user.email || '',
          role: 'host', // Default role, will be updated from profile
          createdAt: formatDate(user.created_at),
          lastSignIn: formatDate(user.last_sign_in_at),
        });

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          const errorMsg = error.message || 'Failed to load profile';
          console.error('Error loading profile:', errorMsg);
          showToast(`Error loading profile: ${errorMsg}`, 'error');
          return;
        }

        if (profile) {
          setFirstName(profile.first_name || "");
          setLastName(profile.last_name || "");
          setLanguage(profile.language || "");
          setEmail(profile.email || "");
          if (profile.profile_picture_url) {
            setProfilePictureUrl(profile.profile_picture_url);
          }
          setInitialValues({
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            language: profile.language || "",
            email: profile.email || "",
          });

          const prefLanguage = profile.language || 'English';
          const prefCurrency = profile.currency || 'USD ($)';
          const prefTimeZone = profile.timezone || detectTimezone();

          setPrefLanguage(prefLanguage);
          setPrefCurrency(prefCurrency);
          setPrefTimeZone(prefTimeZone);
          setInitialPrefValues({
            language: prefLanguage,
            currency: prefCurrency,
            timezone: prefTimeZone,
          });

          // Update auth metadata with role from profile
          if (profile.role) {
            setAuthMetadata(prev => prev ? { ...prev, role: profile.role } : null);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error loading profile:', errorMsg);
        showToast(`Error loading profile: ${errorMsg}`, 'error');
      }
    };

    loadUserProfile();
  }, []);

  // Track preference changes
  useEffect(() => {
    const hasChanges =
      prefLanguage !== initialPrefValues.language ||
      prefCurrency !== initialPrefValues.currency ||
      prefTimeZone !== initialPrefValues.timezone;
    setHasUnsavedPrefChanges(hasChanges);
  }, [prefLanguage, prefCurrency, prefTimeZone]);

  // Track form changes
  useEffect(() => {
    const hasChanges =
      firstName !== initialValues.firstName ||
      lastName !== initialValues.lastName ||
      language !== initialValues.language ||
      email !== initialValues.email;
    setHasUnsavedChanges(hasChanges);
  }, [firstName, lastName, language, email]);

  const validatePreferences = (): boolean => {
    const newErrors: PreferenceErrors = {};

    if (!SUPPORTED_LANGUAGES.includes(prefLanguage)) {
      newErrors.language = "Please select a valid language";
    }

    if (!SUPPORTED_CURRENCIES.includes(prefCurrency)) {
      newErrors.currency = "Please select a valid currency";
    }

    if (!SUPPORTED_TIMEZONES.includes(prefTimeZone)) {
      newErrors.timezone = "Please select a valid timezone";
    }

    setPrefErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      language.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
  };

  const handleTabChange = (tabId: string) => {
    navigate(`/settings/${tabId}`);
  };

  const handleDiscardPreferences = () => {
    setPrefLanguage(initialPrefValues.language);
    setPrefCurrency(initialPrefValues.currency);
    setPrefTimeZone(initialPrefValues.timezone);
    setHasUnsavedPrefChanges(false);
    setPrefErrors({});
  };

  const handleSavePreferences = async () => {
    if (!validatePreferences()) {
      showToast("Please fix the errors in your preferences", "error");
      return;
    }

    setIsSavingPrefs(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast("User not authenticated", "error");
        setIsSavingPrefs(false);
        return;
      }

      const updateData: Record<string, string> = {};

      // Build update object with only changed values
      if (prefLanguage !== initialPrefValues.language) {
        updateData.language = prefLanguage;
      }
      if (prefCurrency !== initialPrefValues.currency) {
        updateData.currency = prefCurrency;
      }
      if (prefTimeZone !== initialPrefValues.timezone) {
        updateData.timezone = prefTimeZone;
      }

      // If there are no changes, just return
      if (Object.keys(updateData).length === 0) {
        setHasUnsavedPrefChanges(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        const errorMsg = error.message || 'Failed to save preferences';
        console.error('Error saving preferences:', errorMsg);

        // Check if it's a missing column error
        if (errorMsg.includes('column') || errorMsg.includes('Could not find')) {
          showToast("Database migration needed. Please contact administrator.", "error");
        } else {
          showToast(`Error saving preferences: ${errorMsg}`, "error");
        }
        setIsSavingPrefs(false);
        return;
      }

      setInitialPrefValues({
        language: prefLanguage,
        currency: prefCurrency,
        timezone: prefTimeZone,
      });

      setHasUnsavedPrefChanges(false);
      setPrefErrors({});
      showToast("Preferences updated successfully", "success");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error saving preferences:', errorMsg);
      showToast(`Error saving preferences: ${errorMsg}`, "error");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleDiscard = () => {
    setFirstName(initialValues.firstName || "");
    setLastName(initialValues.lastName || "");
    setLanguage(initialValues.language || "");
    setEmail(initialValues.email || "");
    setHasUnsavedChanges(false);
    setErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('User not authenticated', 'error');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: email,
          language: language,
        })
        .eq('id', user.id);

      if (error) {
        const errorMsg = error.message || 'Failed to save profile';
        console.error('Error saving profile:', errorMsg);
        showToast(`Error saving profile: ${errorMsg}`, 'error');
        return;
      }

      setInitialValues({
        firstName,
        lastName,
        language,
        email,
      });

      console.log("Profile saved successfully");
      setHasUnsavedChanges(false);
      setErrors({});
      showToast('Profile saved successfully', 'success');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error saving profile:', errorMsg);
      showToast(`Error saving profile: ${errorMsg}`, 'error');
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "language":
        setLanguage(value);
        break;
      case "email":
        setEmail(value);
        break;
    }
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleUploadProfilePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    setIsUploadingPicture(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gurigate-uploads')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        const errorMsg = uploadError.message || 'Failed to upload image';
        console.error('Upload error:', errorMsg);
        showToast(`Upload failed: ${errorMsg}`, 'error');
        return;
      }

      const { data } = supabase.storage
        .from('gurigate-uploads')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      setProfilePictureUrl(publicUrl);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ profile_picture_url: publicUrl })
          .eq('id', user.id);

        if (updateError) {
          const errorMsg = updateError.message || 'Failed to save picture';
          console.error('Database update error:', errorMsg);
          showToast(`Error saving picture: ${errorMsg}`, 'error');
          return;
        }
      }
      showToast('Profile picture uploaded successfully', 'success');
      console.log('Profile picture uploaded:', publicUrl);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error uploading profile picture:', errorMsg);
      showToast(`Error uploading picture: ${errorMsg}`, 'error');
    } finally {
      setIsUploadingPicture(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    setIsUploadingPicture(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ profile_picture_url: null })
          .eq('id', user.id);

        if (error) {
          const errorMsg = error.message || 'Failed to remove picture';
          console.error('Error removing profile picture:', errorMsg);
          showToast(`Error removing picture: ${errorMsg}`, 'error');
          return;
        }
      }
      setProfilePictureUrl("https://placehold.co/128x128");
      showToast('Profile picture removed successfully', 'success');
      console.log('Profile picture removed');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error removing profile picture:', errorMsg);
      showToast(`Error removing picture: ${errorMsg}`, 'error');
    } finally {
      setIsUploadingPicture(false);
    }
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

        {/* Conditional Content Rendering Based on Active Tab */}
        {activeTab === "profile" && (
        <>
        {/* Profile Picture Section - Full width matching form */}
        <div className="ProfilePictureSection mb-8 p-6 bg-white rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="size-20 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
              <img className="w-full h-full object-cover" src={profilePictureUrl} alt="Profile" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold font-['Manrope'] text-zinc-900 mb-3">Profile Picture</h3>
              <div className="flex gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadProfilePicture}
                  className="hidden"
                  id="profile-picture-input"
                />
                <button
                  onClick={() => document.getElementById('profile-picture-input')?.click()}
                  disabled={isUploadingPicture}
                  className="px-5 py-2 bg-gradient-to-b from-rose-700 to-rose-600 text-white text-sm font-bold font-['Manrope'] rounded-full shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingPicture ? "Uploading..." : "Upload New Photo"}
                </button>
                <button
                  onClick={handleRemoveProfilePicture}
                  disabled={isUploadingPicture || profilePictureUrl === "https://placehold.co/128x128"}
                  className="px-5 py-2 bg-zinc-100 text-zinc-900 text-sm font-bold font-['Manrope'] rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove Photo
                </button>
              </div>
              <p className="text-xs text-zinc-500 font-['Manrope'] mt-2">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>

        {/* Personal Information Form */}
        <div className="FormSection mb-8 p-6 bg-white rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold font-['Manrope'] text-zinc-900 mb-6">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="flex flex-col gap-2 min-w-0">
              <label htmlFor="firstName" className="text-sm font-bold font-['Manrope'] text-zinc-900">
                First Name <span className="text-rose-700">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => handleFieldChange("firstName", e.target.value)}
                placeholder="Enter your first name"
                className={`w-full px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-rose-700 transition-all text-sm ${
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
            {/* Last Name */}
            <div className="flex flex-col gap-2 min-w-0">
              <label htmlFor="lastName" className="text-sm font-bold font-['Manrope'] text-zinc-900">
                Last Name <span className="text-rose-700">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => handleFieldChange("lastName", e.target.value)}
                placeholder="Enter your last name"
                className={`w-full px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-rose-700 transition-all text-sm ${
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

            {/* Email */}
            <div className="flex flex-col gap-2 min-w-0">
              <label htmlFor="email" className="text-sm font-bold font-['Manrope'] text-zinc-900">
                Email Address <span className="text-rose-700">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-rose-700 transition-all text-sm ${
                  errors.email ? "ring-2 ring-red-500" : ""
                }`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-red-500 font-['Manrope']" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Language */}
            <div className="flex flex-col gap-2 min-w-0">
              <label htmlFor="language" className="text-sm font-bold font-['Manrope'] text-zinc-900">
                Language <span className="text-rose-700">*</span>
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => handleFieldChange("language", e.target.value)}
                className={`w-full px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-rose-700 transition-all text-sm ${
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
        </>
        )}

        {activeTab === "preferences" && (
        <>
        <div className="FormSection mb-8 p-6 bg-white rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold font-['Manrope'] text-zinc-900 mb-6">Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex flex-col gap-2 min-w-0">
              <label htmlFor="pref-language" className="text-sm font-bold font-['Manrope'] text-zinc-900">
                Language <span className="text-rose-700">*</span>
              </label>
              <select
                id="pref-language"
                value={prefLanguage}
                onChange={(e) => {
                  setPrefLanguage(e.target.value);
                  setPrefErrors(prev => ({ ...prev, language: undefined }));
                }}
                className={`w-full px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-rose-700 transition-all text-sm ${
                  prefErrors.language ? "ring-2 ring-red-500" : ""
                }`}
                aria-invalid={!!prefErrors.language}
                aria-describedby={prefErrors.language ? "pref-language-error" : undefined}
              >
                <option value="">Select your language</option>
                <option value="English">English</option>
                <option value="Somali">Somali</option>
                <option value="Arabic">Arabic</option>
              </select>
              {prefErrors.language && (
                <p id="pref-language-error" className="text-xs text-red-500 font-['Manrope']" role="alert">
                  {prefErrors.language}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <label htmlFor="pref-currency" className="text-sm font-bold font-['Manrope'] text-zinc-900">
                Currency <span className="text-rose-700">*</span>
              </label>
              <select
                id="pref-currency"
                value={prefCurrency}
                onChange={(e) => {
                  setPrefCurrency(e.target.value);
                  setPrefErrors(prev => ({ ...prev, currency: undefined }));
                }}
                className={`w-full px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-rose-700 transition-all text-sm ${
                  prefErrors.currency ? "ring-2 ring-red-500" : ""
                }`}
                aria-invalid={!!prefErrors.currency}
                aria-describedby={prefErrors.currency ? "pref-currency-error" : undefined}
              >
                <option value="">Select your currency</option>
                <option value="USD ($)">USD ($)</option>
                <option value="Somaliland Shilling (SLSH)">Somaliland Shilling (SLSH)</option>
                <option value="Somali Shilling (SOS)">Somali Shilling (SOS)</option>
                <option value="Ethiopian Birr (ETB)">Ethiopian Birr (ETB)</option>
              </select>
              {prefErrors.currency && (
                <p id="pref-currency-error" className="text-xs text-red-500 font-['Manrope']" role="alert">
                  {prefErrors.currency}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <label htmlFor="pref-timezone" className="text-sm font-bold font-['Manrope'] text-zinc-900">
                Time Zone <span className="text-rose-700">*</span>
              </label>
              <select
                id="pref-timezone"
                value={prefTimeZone}
                onChange={(e) => {
                  setPrefTimeZone(e.target.value);
                  setPrefErrors(prev => ({ ...prev, timezone: undefined }));
                }}
                className={`w-full px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-rose-700 transition-all text-sm ${
                  prefErrors.timezone ? "ring-2 ring-red-500" : ""
                }`}
                aria-invalid={!!prefErrors.timezone}
                aria-describedby={prefErrors.timezone ? "pref-timezone-error" : undefined}
              >
                <option value="">Select your time zone</option>
                <option value="UTC+0">UTC+0</option>
                <option value="UTC+1">UTC+1 (West Africa Time)</option>
                <option value="UTC+2">UTC+2 (Central Africa Time)</option>
                <option value="UTC+3">UTC+3 (East Africa Time)</option>
                <option value="UTC+4">UTC+4</option>
                <option value="UTC+5">UTC+5</option>
              </select>
              {prefErrors.timezone && (
                <p id="pref-timezone-error" className="text-xs text-red-500 font-['Manrope']" role="alert">
                  {prefErrors.timezone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions for Preferences */}
        <div className="FooterActions pt-6 border-t border-gray-200 flex justify-end items-center gap-4">
          <button
            onClick={handleDiscardPreferences}
            disabled={!hasUnsavedPrefChanges || isSavingPrefs}
            className="px-6 py-3 text-zinc-600 text-lg font-bold font-['Manrope'] hover:text-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSavePreferences}
            disabled={!hasUnsavedPrefChanges || isSavingPrefs}
            className={`px-8 py-3 text-lg font-bold font-['Manrope'] rounded-full shadow-lg transition-shadow ${
              hasUnsavedPrefChanges && !isSavingPrefs
                ? "bg-gradient-to-b from-rose-700 to-rose-600 text-white hover:shadow-xl cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSavingPrefs ? "Saving..." : "Save changes"}
          </button>
        </div>
        </>
        )}

        {activeTab === "notifications" && (
        <div className="FormSection mb-8 p-6 bg-white rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold font-['Manrope'] text-zinc-900 mb-6">Notification Preferences</h2>
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl">🔔</div>
              <h3 className="text-lg font-bold font-['Manrope'] text-zinc-900">Coming Soon</h3>
              <p className="text-sm text-zinc-600 font-['Manrope'] max-w-md">
                Notification preferences will be available once the notification system is fully integrated with GuriGate V1.
              </p>
            </div>
          </div>
        </div>
        )}

        {activeTab === "general" && (
        <div className="FormSection mb-8 p-6 bg-white rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold font-['Manrope'] text-zinc-900 mb-6">Account Information</h2>
          <div className="space-y-6">
            {authMetadata ? (
              <>
                <div className="pb-6 border-b border-gray-200">
                  <label className="text-sm font-bold font-['Manrope'] text-zinc-600">User ID</label>
                  <p className="text-base font-['Manrope'] text-zinc-900 mt-2 break-all font-mono text-sm bg-gray-50 p-3 rounded">{authMetadata.userId}</p>
                </div>
                <div className="pb-6 border-b border-gray-200">
                  <label className="text-sm font-bold font-['Manrope'] text-zinc-600">Email Address</label>
                  <p className="text-base font-['Manrope'] text-zinc-900 mt-2">{authMetadata.email}</p>
                </div>
                <div className="pb-6 border-b border-gray-200">
                  <label className="text-sm font-bold font-['Manrope'] text-zinc-600">Role</label>
                  <p className="text-base font-['Manrope'] text-zinc-900 mt-2 capitalize">{authMetadata.role}</p>
                </div>
                <div className="pb-6 border-b border-gray-200">
                  <label className="text-sm font-bold font-['Manrope'] text-zinc-600">Account Created</label>
                  <p className="text-base font-['Manrope'] text-zinc-900 mt-2">{authMetadata.createdAt}</p>
                </div>
                <div>
                  <label className="text-sm font-bold font-['Manrope'] text-zinc-600">Last Sign In</label>
                  <p className="text-base font-['Manrope'] text-zinc-900 mt-2">{authMetadata.lastSignIn}</p>
                </div>
              </>
            ) : (
              <p className="text-zinc-600 font-['Manrope']">Loading account information...</p>
            )}
          </div>
        </div>
        )}

        {activeTab === "integrations" && (
        <div className="FormSection mb-8 p-6 bg-white rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold font-['Manrope'] text-zinc-900 mb-6">Connected Integrations</h2>
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl">🔗</div>
              <h3 className="text-lg font-bold font-['Manrope'] text-zinc-900">No Integrations Available</h3>
              <p className="text-sm text-zinc-600 font-['Manrope'] max-w-md">
                Integration support will be added in future versions of GuriGate.
              </p>
            </div>
          </div>
        </div>
        )}
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

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-lg shadow-lg font-['Manrope'] font-semibold pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : toast.type === 'error'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
