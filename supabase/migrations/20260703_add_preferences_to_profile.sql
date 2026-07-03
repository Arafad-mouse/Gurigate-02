-- Add preferences columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS language text DEFAULT 'English' CHECK (language IN ('English', 'Somali', 'Arabic')),
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD ($)' CHECK (currency IN ('USD ($)', 'Somaliland Shilling (SLSH)', 'Somali Shilling (SOS)', 'Ethiopian Birr (ETB)')),
ADD COLUMN IF NOT EXISTS timezone text;

-- Add an index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_language ON public.profiles(language);
CREATE INDEX IF NOT EXISTS idx_profiles_currency ON public.profiles(currency);
