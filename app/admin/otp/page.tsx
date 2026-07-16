'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { verifyEmailOtp } from '@/lib/supabase'

export default function AdminOtpPage() {
  const router  = useRouter()
  const [email, setEmail]   = useState('')
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null))

  useEffect(() => {
    const e = sessionStorage.getItem('mcc_admin_email')
    if (!e) { router.replace('/admin/login'); return }
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
    sessionStorage.setItem('mcc_admin_session', 'true')
    router.push('/admin')
  }

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 5) refs[i + 1].current?.focus()
    if (next.every(d => d !== '')) setTimeout(() => verify(next.join('')), 200)
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current?.focus()
  }

  const masked = email.replace(/(.{2}).+(@.+)/, '$1•••$2')

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'linear-gradient(160deg,#09030a 0%,#1a0c10 100%)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7A1E2C,#5C1520)', boxShadow: '0 8px 24px rgba(122,30,44,0.4)' }}>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
        </div>

        <h1 className="font-lora text-2xl font-semibold text-white text-center mb-1">Revisa tu correo</h1>
        <p className="text-sm text-center mb-8" style={{ color: 'rgba(249,208,216,0.45)' }}>
          Enviamos el código a <span style={{ color: 'rgba(249,208,216,0.8)' }}>{masked}</span>
        </p>

        <div className="flex gap-2 justify-center mb-5">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={loading}
              className="w-11 h-13 text-center text-xl font-semibold text-white rounded-xl border transition-colors focus:outline-none disabled:opacity-50"
              style={{
                width: 44, height: 52,
                background: 'rgba(255,255,255,0.05)',
                borderColor: d ? 'rgba(224,74,110,0.7)' : 'rgba(122,30,44,0.45)',
              }}
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-400 text-center mb-4">{error}</p>}

        {loading && (
          <div className="flex justify-center">
            <svg className="animate-spin w-5 h-5" style={{ color: 'rgba(249,208,216,0.4)' }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        )}

        <p className="text-center text-xs mt-8" style={{ color: 'rgba(249,208,216,0.25)' }}>
          <button onClick={() => router.push('/admin/login')} className="hover:underline transition-colors">
            ← Cambiar correo
          </button>
        </p>
      </div>
    </main>
  )
}
