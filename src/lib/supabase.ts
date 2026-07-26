import { createBrowserClient } from '@supabase/ssr'

const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackAnonKey = 'placeholder-anon-key'

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

export const isSupabaseConfigured =
  rawSupabaseUrl.length > 0 &&
  rawSupabaseAnonKey.length > 0 &&
  !rawSupabaseAnonKey.includes('your_supabase_anon_key') &&
  !rawSupabaseAnonKey.includes('placeholder')

let _client: ReturnType<typeof createBrowserClient> | null = null

export const supabase = _client ?? (_client = createBrowserClient(
  rawSupabaseUrl || fallbackUrl,
  rawSupabaseAnonKey || fallbackAnonKey,
))
