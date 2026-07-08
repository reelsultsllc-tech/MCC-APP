'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MccLogo from '@/components/MccLogo'
import { sendEmailOtp } from '@/lib/supabase'

export default function TeamLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isValid = email.trim().includes('@')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError('')

    const { error: otpError } = await sendEmailOtp(email.trim())

    if (otpError) {
      setError(otpError)
      setLoading(false)
      return
    }

    sessionStorage.setItem('mcc_team_email', email.trim())
    router.push('/team/otp')
  }

  return (
    <main className="min-h-screen bg-[#241014] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <MccLogo size={56} />
          <h1 className="font-lora text-2xl font-medium text-white mt-5 mb-1">
            MCC Team Portal
          </h1>
          <p className="text-sm text-white/50 text-center">
            Te enviamos un código a tu correo para ingresar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="reelsults.ads@gmail.com"
              autoComplete="email"
              autoFocus
              className="
                w-full px-4 py-3.5 text-sm text-white
                bg-white/10 border border-white/20 rounded-xl
                focus:outline-none focus:border-[#7A1E2C] focus:ring-1 focus:ring-[#7A1E2C]
                placeholder:text-white/30
                transition-colors
              "
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={!isValid || loading}
            className="
              w-full py-3.5 rounded-xl font-medium text-base text-white mt-2
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
                Enviando código...
              </span>
            ) : (
              'Enviar código'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-white/30 mt-8">
          <button onClick={() => router.push('/login')} className="hover:text-white/60 transition-colors">
            ← Portal de clientes
          </button>
        </p>
      </div>
    </main>
  )
}
