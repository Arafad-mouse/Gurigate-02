import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

// This is the "Named Export" your server is looking for
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
