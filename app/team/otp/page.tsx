'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MccLogo from '@/components/MccLogo'
import { verifyEmailOtp } from '@/lib/supabase'

export default function TeamOtpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    const e = sessionStorage.getItem('mcc_team_email')
    if (!e) { router.replace('/team/login'); return }
    setEmail(e)
    refs[0].current?.focus()
  }, [])

  async function verify(code: string) {
    setLoading(true)
    setError('')
    const { error: err } = await verifyEmailOtp(email, code)
    if (err) {
      setError('Código incorrecto. Revisa tu correo.')
      setLoading(false)
      setDigits(['', '', '', '', '', ''])
      refs[0].current?.focus()
      return
    }
    sessionStorage.setItem('mcc_team_logged_in', 'true')
    router.push('/team/dashboard')
  }

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 5) refs[i + 1].current?.focus()
    if (next.every(d => d !== '')) {
      setTimeout(() => verify(next.join('')), 200)
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs[i - 1].current?.focus()
    }
  }

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, '$1•••$2')

  return (
    <main className="min-h-screen bg-[#241014] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <MccLogo size={56} />
          <h1 className="font-lora text-2xl font-medium text-white mt-5 mb-1">
            Revisa tu correo
          </h1>
          <p className="text-sm text-white/50 text-center">
            Enviamos un código de 6 dígitos a<br />
            <span className="text-white/80">{maskedEmail}</span>
          </p>
        </div>

        <div className="flex gap-2 justify-center mb-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className="
                w-12 h-14 text-center text-xl font-semibold text-white
                bg-white/10 border border-white/20 rounded-xl
                focus:outline-none focus:border-[#7A1E2C] focus:ring-1 focus:ring-[#7A1E2C]
                disabled:opacity-50
                transition-colors
              "
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-400 text-center mb-4">{error}</p>}

        {loading && (
          <div className="flex justify-center">
            <svg className="animate-spin w-5 h-5 text-white/50" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        )}

        <p className="text-center text-xs text-white/30 mt-8">
          <button onClick={() => router.push('/team/login')} className="hover:text-white/60 transition-colors">
            ← Cambiar correo
          </button>
        </p>
      </div>
    </main>
  )
}
