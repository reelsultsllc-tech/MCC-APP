'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { formatPhone } from '@/lib/utils'
import { verifyOtp } from '@/lib/supabase'

const OTP_LENGTH = 4

export default function OtpPage() {
  const router = useRouter()
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resent, setResent] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const storedPhone = sessionStorage.getItem('mcc_phone') ?? ''
    setPhone(storedPhone)
    if (!storedPhone) {
      router.replace('/login')
    }
    // Focus first input
    inputRefs.current[0]?.focus()
  }, [router])

  const verifyCode = useCallback(
    async (code: string) => {
      setLoading(true)
      setError('')

      // Demo mode: any 4-digit code works (Twilio not configured yet)
      await verifyOtp(phone, code)
      const hasSeenDisclosure = sessionStorage.getItem('mcc_disclosure_done')
      router.push(hasSeenDisclosure ? '/dashboard' : '/disclosure')
    },
    [phone, router]
  )

  function handleDigitChange(index: number, value: string) {
    const char = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = char
    setDigits(newDigits)
    setError('')

    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // If last digit filled, auto-verify after 350ms
    if (char && index === OTP_LENGTH - 1) {
      const completeCode = [...newDigits.slice(0, OTP_LENGTH - 1), char].join('')
      if (completeCode.length === OTP_LENGTH) {
        setTimeout(() => verifyCode(completeCode), 350)
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits]
        newDigits[index] = ''
        setDigits(newDigits)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        setDigits(newDigits)
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const newDigits = [...Array(OTP_LENGTH).fill('')]
    pasted.split('').forEach((ch, i) => {
      if (i < OTP_LENGTH) newDigits[i] = ch
    })
    setDigits(newDigits)
    const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[lastFilled]?.focus()
    if (pasted.length === OTP_LENGTH) {
      setTimeout(() => verifyCode(pasted), 350)
    }
  }

  async function handleResend() {
    setResent(true)
    setError('')
    // TODO: resend OTP via Supabase
    setTimeout(() => setResent(false), 3000)
  }

  return (
    <main className="min-h-screen bg-[#F7F5F4] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[430px]">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[#57504E] mb-8 hover:text-[#241014] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Regresar
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-lora text-2xl font-medium text-[#241014] mb-2">
            Verificación
          </h1>
          <p className="text-sm text-[#57504E]">
            Ingresa el código que enviamos a{' '}
            <span className="font-medium text-[#241014]">
              +1 {formatPhone(phone)}
            </span>
          </p>
        </div>

        {/* OTP inputs */}
        <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digits[i]}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className={`
                w-14 h-14 text-center text-xl font-semibold text-[#241014]
                bg-white rounded-xl border-2 transition-colors
                focus:outline-none focus:ring-0
                disabled:opacity-50
                ${digits[i] ? 'border-[#7A1E2C]' : 'border-[#E7E2E1]'}
                ${error ? 'border-red-400' : ''}
              `}
              aria-label={`Dígito ${i + 1}`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-sm text-red-600 mb-4">{error}</p>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center mb-4">
            <svg className="animate-spin w-5 h-5 text-[#7A1E2C]" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {/* Resend */}
        <div className="text-center mt-4">
          <button
            onClick={handleResend}
            disabled={resent || loading}
            className="text-sm text-[#7A1E2C] font-medium hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {resent ? 'Código reenviado' : 'Reenviar código'}
          </button>
        </div>
      </div>
    </main>
  )
}
