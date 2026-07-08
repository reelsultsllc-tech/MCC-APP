'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MccLogo from '@/components/MccLogo'
import { formatPhone } from '@/lib/utils'
import { sendOtp } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [rawDigits, setRawDigits] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const displayPhone = formatPhone(rawDigits)
  const isValid = rawDigits.length === 10

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    setRawDigits(digits)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError('')

    sessionStorage.setItem('mcc_phone', rawDigits)
    // sendOtp requires Twilio — skip for now, any 4-digit code works on OTP screen
    await sendOtp(rawDigits)
    router.push('/otp')
  }

  return (
    <main className="min-h-screen bg-[#F7F5F4] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[430px]">
        {/* Logo + branding */}
        <div className="flex flex-col items-center mb-10">
          <MccLogo size={72} />
          <h1 className="font-lora text-[28px] font-medium text-[#241014] mt-4 mb-1">
            My Credit Coffee
          </h1>
          <p className="text-sm text-[#57504E] text-center">
            Tu portal de reparación de crédito
          </p>
        </div>

        {/* Phone form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#241014] mb-2">
              Número de teléfono
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="text-[#9C9492] text-sm">+1</span>
              </div>
              <input
                id="phone"
                type="text"
                inputMode="numeric"
                value={displayPhone}
                onChange={handlePhoneChange}
                placeholder="(555) 000-0000"
                className="
                  w-full pl-12 pr-4 py-3.5 text-base text-[#241014]
                  bg-white border border-[#E7E2E1] rounded-xl
                  focus:outline-none focus:border-[#7A1E2C] focus:ring-1 focus:ring-[#7A1E2C]
                  placeholder:text-[#9C9492]
                  transition-colors
                "
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="
              w-full py-3.5 rounded-xl font-medium text-base text-white
              bg-[#7A1E2C] hover:bg-[#5C1520] active:bg-[#5C1520]
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors duration-150
            "
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Enviando...
              </span>
            ) : (
              'Continuar'
            )}
          </button>
        </form>

        {/* Team link */}
        <p className="text-center text-sm text-[#57504E] mt-8">
          <Link
            href="/team/login"
            className="text-[#7A1E2C] font-medium hover:underline"
          >
            ¿Eres del equipo? Ingresa aquí
          </Link>
        </p>
      </div>
    </main>
  )
}
