import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

//hrishikeshprahalad


//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