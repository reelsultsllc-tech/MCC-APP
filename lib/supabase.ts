import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Supabase client — plug in real env vars from .env.local when going live
// ---------------------------------------------------------------------------
// To enable real auth:
//  1. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
//  2. Replace the mock auth functions below with real Supabase calls
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ---------------------------------------------------------------------------
// Mock auth helpers (replace with Supabase calls)
// ---------------------------------------------------------------------------

/**
 * MOCK: Send OTP to phone number.
 * Replace with: supabase.auth.signInWithOtp({ phone })
 */
export async function sendOtp(phone: string): Promise<{ error: string | null }> {
  // TODO: replace with supabase.auth.signInWithOtp({ phone: `+1${phone}` })
  console.log('[mock] sending OTP to', phone)
  return { error: null }
}

/**
 * MOCK: Verify OTP code.
 * Replace with: supabase.auth.verifyOtp({ phone, token, type: 'sms' })
 */
export async function verifyOtp(
  phone: string,
  token: string
): Promise<{ error: string | null }> {
  // TODO: replace with supabase.auth.verifyOtp({ phone: `+1${phone}`, token, type: 'sms' })
  console.log('[mock] verifying OTP', token, 'for phone', phone)
  // Accept any 4-digit code in demo mode
  if (token.length === 4) {
    return { error: null }
  }
  return { error: 'Código inválido' }
}

/**
 * MOCK: Team email/password sign-in.
 * Replace with: supabase.auth.signInWithPassword({ email, password })
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  // TODO: replace with supabase.auth.signInWithPassword({ email, password })
  console.log('[mock] team login', email)
  if (email && password) {
    return { error: null }
  }
  return { error: 'Credenciales inválidas' }
}
