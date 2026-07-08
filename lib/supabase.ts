import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Send OTP to phone — sms_autoconfirm ON means no Twilio needed yet
export async function sendOtp(phone: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    phone: `+1${phone}`,
  })
  return { error: error?.message ?? null }
}

// Verify OTP — any code works while sms_autoconfirm is ON
export async function verifyOtp(
  phone: string,
  token: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.verifyOtp({
    phone: `+1${phone}`,
    token,
    type: 'sms',
  })
  return { error: error?.message ?? null }
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
