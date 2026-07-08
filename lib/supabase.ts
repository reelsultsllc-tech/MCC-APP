import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Demo: phone OTP bypassed until Twilio is configured
export async function sendOtp(_phone: string): Promise<{ error: string | null }> {
  return { error: null }
}

export async function verifyOtp(
  _phone: string,
  _token: string
): Promise<{ error: string | null }> {
  return { error: null }
}

// Team: send OTP to email
export async function sendEmailOtp(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOtp({ email })
  return { error: error?.message ?? null }
}

// Team: verify email OTP code
export async function verifyEmailOtp(
  email: string,
  token: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  return { error: error?.message ?? null }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}
