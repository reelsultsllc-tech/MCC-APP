'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MccLogo from '@/components/MccLogo'
import { signInWithPassword } from '@/lib/supabase'

export default function TeamLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isValid = email.trim().length > 0 && password.length >= 1

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError('')

    // TODO: Replace with real Supabase signInWithPassword
    const { error: authError } = await signInWithPassword(email.trim(), password)

    if (authError) {
      setError(authError)
      setLoading(false)
      return
    }

    sessionStorage.setItem('mcc_team_logged_in', 'true')
    router.push('/team/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#241014] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-10">
          <MccLogo size={56} />
          <h1 className="font-lora text-2xl font-medium text-white mt-5 mb-1">
            MCC Team Portal
          </h1>
          <p className="text-sm text-white/50 text-center">
            Acceso exclusivo para el equipo de My Credit Coffee
          </p>
        </div>

        {/* Form */}
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
              placeholder="equipo@mycreditcoffee.com"
              autoComplete="email"
              className="
                w-full px-4 py-3.5 text-sm text-white
                bg-white/10 border border-white/20 rounded-xl
                focus:outline-none focus:border-[#7A1E2C] focus:ring-1 focus:ring-[#7A1E2C]
                placeholder:text-white/30
                transition-colors
              "
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="
                  w-full px-4 pr-12 py-3.5 text-sm text-white
                  bg-white/10 border border-white/20 rounded-xl
                  focus:outline-none focus:border-[#7A1E2C] focus:ring-1 focus:ring-[#7A1E2C]
                  placeholder:text-white/30
                  transition-colors
                "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M1 9s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M3 3l12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M1 9s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

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
                Ingresando...
              </span>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        {/* Back to client portal */}
        <p className="text-center text-xs text-white/30 mt-8">
          <button
            onClick={() => router.push('/login')}
            className="hover:text-white/60 transition-colors"
          >
            ← Portal de clientes
          </button>
        </p>
      </div>
    </main>
  )
}
