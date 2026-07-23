# Preferences Feature Setup Guide

## Overview
The Preferences page has been implemented with support for Language, Currency, and Timezone preferences. This guide walks you through setting it up.

## Step 1: Apply Database Migration

The preferences feature requires new columns in the `profiles` table. You have three options:

### Option A: Using Supabase CLI (Recommended)
```bash
# From the project root directory
supabase migration up
```

### Option B: Using Supabase Web Dashboard
1. Go to your Supabase project dashboard at https://app.supabase.com
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Add preferences columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS language text DEFAULT 'English' CHECK (language IN ('English', 'Somali', 'Arabic')),
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD ($)' CHECK (currency IN ('USD ($)', 'Somaliland Shilling (SLSH)', 'Somali Shilling (SOS)', 'Ethiopian Birr (ETB)')),
ADD COLUMN IF NOT EXISTS timezone text;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_language ON public.profiles(language);
CREATE INDEX IF NOT EXISTS idx_profiles_currency ON public.profiles(currency);
```

5. Click **Run** to execute the query

### Option C: Using pgAdmin (Advanced)
1. Open the Supabase dashboard
2. Click **Databases** → **pgAdmin**
3. Navigate to `public > profiles`
4. Right-click and select **Edit Table**
5. Add the three columns manually

## Step 2: Verify Database Schema

After running the migration, verify the columns were added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('language', 'currency', 'timezone');
```

You should see three rows:
- `language` | text
- `currency` | text
- `timezone` | text

## Step 3: Test the Feature

1. **Navigate to Settings**
   - Go to `/settings/preferences` or click Settings in the navigation

2. **Set Preferences**
   - Select a Language (English, Somali, Arabic)
   - Select a Currency (USD, SLSH, SOS, ETB)
   - Select a Timezone (UTC+0 through UTC+5)
   - Click "Save changes"

3. **Verify Success**
   - You should see "Preferences updated successfully" toast
   - Refresh the page - preferences should persist
   - Sign out and sign back in - preferences should load automatically

## Feature Details

### Supported Values

**Languages:**
- English
- Somali
- Arabic

**Currencies:**
- USD ($)
- Somaliland Shilling (SLSH)
- Somali Shilling (SOS)
- Ethiopian Birr (ETB)

**Timezones:**
- UTC+0
- UTC+1 (West Africa Time)
- UTC+2 (Central Africa Time)
- UTC+3 (East Africa Time)
- UTC+4
- UTC+5

### Auto-Detection

The timezone is auto-detected on first load based on the user's browser settings. The system maps browser timezone names to UTC offsets:

- Africa/Nairobi, Africa/Khartoum → UTC+3
- Africa/Cairo, Africa/Johannesburg → UTC+2
- Africa/Lagos → UTC+1
- Asia/Kolkata → UTC+5
- Asia/Dubai → UTC+4
- Others → UTC+0

## User Experience

### Saving
- Validation prevents invalid selections
- Save button is disabled when no changes are made
- Loading state shows "Saving..." while in progress
- Success toast appears for 3 seconds after save

### Error Handling
- Error toasts display clear messages
- If database migration hasn't been applied, you'll see:
  "Database migration needed. Please contact administrator."
- All errors are logged to browser console

### Persistence
- Preferences are saved per user to the `profiles` table
- Preferences load automatically on login
- Preferences survive page refresh
- Preferences can be changed anytime in the Preferences tab

## Troubleshooting

### "Could not find the 'currency' column"
**Solution:** The database migration hasn't been applied yet. Run the migration using one of the methods above.

### Preferences not saving
**Solution:** Check browser console for errors. Verify:
1. User is authenticated
2. Database columns exist (run verification query from Step 2)
3. Supabase RLS policies allow updates

### Timezone not auto-detecting
**Solution:** The system defaults to UTC+0 if detection fails. Users can manually select their timezone.

## Database Schema Reference

The migration adds these columns to the `profiles` table:

```sql
language text DEFAULT 'English' CHECK (language IN ('English', 'Somali', 'Arabic'))
currency text DEFAULT 'USD ($)' CHECK (currency IN ('USD ($)', 'Somaliland Shilling (SLSH)', 'Somali Shilling (SOS)', 'Ethiopian Birr (ETB)'))
timezone text
```

Constraints ensure only valid values can be stored.

## Future Enhancements

For V2+, consider:
- Implement localization (actually translate UI to selected language)
- Use currency preference in dashboard displays
- Use timezone for all date/time displays
- Add notification preferences
- Add more timezone options
- Add theme preference (dark/light mode)
- Add accessibility preferences

## Files Modified

- `src/pages/manage-property/ProfilePage.tsx` - Added preference functionality
- `supabase/migrations/20260703_add_preferences_to_profile.sql` - Database migration

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify database schema using Step 2
4. Check Supabase logs for database errors
