'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Phone, ArrowRight } from 'lucide-react'
import { TextLoop } from '@/components/ui/text-loop'
import { cn } from '@/lib/utils'
import { formatPhone } from '@/lib/utils'
import { sendOtp } from '@/lib/supabase'

const BENEFITS = [
  'Monitorea tus disputas en tiempo real',
  'Score de crédito actualizado cada mes',
  'Documentos seguros en tu vault',
  'Asesoría personalizada con tu experta',
  'Notificaciones de cada avance en tu caso',
]

export default function LoginPage() {
  const router = useRouter()
  const [rawDigits, setRawDigits] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)

  const displayPhone = formatPhone(rawDigits)
  const isValid = rawDigits.length === 10

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10])
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10])

  function handleMouseMove(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    setRawDigits(digits)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    sessionStorage.setItem('mcc_phone', rawDigits)
    await sendOtp(rawDigits)
    router.push('/otp')
  }

  return (
    <div className="min-h-screen w-screen bg-[#0d0407] relative overflow-hidden flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7A1E2C]/40 via-[#5C1520]/50 to-[#0d0407]" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Top radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-[#7A1E2C]/20 blur-[80px]" />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-[#9B3040]/15 blur-[60px]"
        animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-[#7A1E2C]/15 blur-[60px]"
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', delay: 1 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm relative z-10 px-4"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative group">
            {/* Traveling light beam */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
              {(['top', 'right', 'bottom', 'left'] as const).map((side, i) => {
                const isHorizontal = side === 'top' || side === 'bottom'
                const animKey = isHorizontal
                  ? (side === 'top' ? 'left' : 'right')
                  : (side === 'right' ? 'top' : 'bottom')
                return (
                  <motion.div
                    key={side}
                    className={cn(
                      'absolute bg-gradient-to-r from-transparent via-white to-transparent opacity-60',
                      isHorizontal ? 'h-[2px] w-[50%]' : 'w-[2px] h-[50%]',
                      side === 'top' && 'top-0 left-0',
                      side === 'right' && 'top-0 right-0 bg-gradient-to-b',
                      side === 'bottom' && 'bottom-0 right-0',
                      side === 'left' && 'bottom-0 left-0 bg-gradient-to-b',
                    )}
                    animate={{
                      [animKey]: ['-50%', '100%'],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    transition={{
                      [animKey]: { duration: 2.5, ease: 'easeInOut' as any, repeat: Infinity, repeatDelay: 1, delay: i * 0.6 },
                      opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror' as any, delay: i * 0.6 },
                    } as any}
                  />
                )
              })}
            </div>

            {/* Glass card */}
            <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                  backgroundImage: 'linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)',
                  backgroundSize: '30px 30px',
                }}
              />

              {/* Header */}
              <div className="text-center space-y-1 mb-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="mx-auto w-11 h-11 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden bg-[#7A1E2C]/30"
                >
                  <span className="text-sm font-bold text-white font-lora">MCC</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold text-white font-lora pt-1"
                >
                  My Credit Coffee
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="h-5 flex items-center justify-center"
                >
                  <TextLoop
                    interval={3}
                    transition={{ duration: 0.35 }}
                    className="text-xs text-white/50 text-center"
                  >
                    {BENEFITS.map(b => (
                      <span key={b} className="block text-center">{b}</span>
                    ))}
                  </TextLoop>
                </motion.div>
              </div>

              {/* Phone form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <div className={cn(
                    'relative flex items-center overflow-hidden rounded-lg bg-white/5 border transition-all',
                    focused ? 'border-white/20 bg-white/10' : 'border-transparent'
                  )}>
                    <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none">
                      <Phone className={cn('w-4 h-4 transition-colors duration-300', focused ? 'text-white' : 'text-white/40')} />
                      <span className={cn('text-sm transition-colors duration-300', focused ? 'text-white/80' : 'text-white/30')}>+1</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={displayPhone}
                      onChange={handlePhoneChange}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      placeholder="(555) 000-0000"
                      autoFocus
                      className="flex h-10 w-full min-w-0 bg-transparent pl-[4.5rem] pr-3 py-1 text-base text-white placeholder:text-white/30 outline-none"
                    />
                  </div>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!isValid || loading}
                  className="w-full relative group/button mt-2"
                >
                  <div className="absolute inset-0 bg-[#7A1E2C]/30 rounded-lg blur-lg opacity-0 group-hover/button:opacity-80 transition-opacity duration-300" />
                  <div className="relative overflow-hidden bg-[#7A1E2C] hover:bg-[#5C1520] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                    {loading ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                      </motion.div>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        Continuar
                        <ArrowRight className="w-3.5 h-3.5 group-hover/button:translate-x-1 transition-transform duration-300" />
                      </span>
                    )}
                  </div>
                </motion.button>

                <motion.p
                  className="text-center text-xs text-white/50 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  ¿Eres del equipo?{' '}
                  <Link href="/team/login" className="text-white/80 hover:text-white font-medium transition-colors underline-offset-2 hover:underline">
                    Ingresa aquí
                  </Link>
                </motion.p>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
