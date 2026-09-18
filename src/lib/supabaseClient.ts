/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const env = (import.meta as any).env || {}
const supabaseUrl = env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum diset. ' +
    'Pastikan sudah ada di file .env.local (lokal) atau Environment Variables (Vercel).'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)