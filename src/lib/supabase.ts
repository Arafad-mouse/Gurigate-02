import { createClient } from '@supabase/supabase-js'

const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackAnonKey = 'placeholder-anon-key'

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

export const isSupabaseConfigured =
  rawSupabaseUrl.length > 0 &&
  rawSupabaseAnonKey.length > 0 &&
  !rawSupabaseAnonKey.includes('your_supabase_anon_key') &&
  !rawSupabaseAnonKey.includes('placeholder')

export const supabase = createClient(rawSupabaseUrl || fallbackUrl, rawSupabaseAnonKey || fallbackAnonKey)
