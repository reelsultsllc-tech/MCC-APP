'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion'
import { ShieldCheck, CreditCard, TrendingUp, Star, Lock, Zap } from 'lucide-react'
import { sendOtp } from '@/lib/supabase'
import { formatPhone } from '@/lib/utils'
import { cn } from '@/lib/utils'

/* ─── Static data ──────────────────────────────────────────────────────── */

const TESTIMONIALS = [
  { text: 'Eliminaron tres cobros incorrectos en cinco semanas. Mi score subió 92 puntos antes de cerrar mi casa.', name: 'María Kessler', role: 'Propietaria, Austin TX', avatar: 'MK', rating: 5 },
  { text: 'El dashboard hace todo fácil de seguir. El soporte se sintió como un asesor privado, no un call center.', name: 'David Okoro', role: 'Empresario', avatar: 'DO', rating: 5 },
  { text: 'Refinancié mi auto seis semanas después de registrarme. Encontraron errores que otras empresas ignoraron.', name: 'Priya Anand', role: 'Enfermera Practicante', avatar: 'PA', rating: 4 },
]

const FEATURES = [
  'Promedio +127 puntos de aumento en 6 meses',
  '94% de tasa de éxito en disputas',
  'Encriptación bancaria de 256 bits',
]

const SCORE_START = 580
const SCORE_END   = 741

/* ─── Score counter ────────────────────────────────────────────────────── */

function useCounter(end: number, durationMs = 1600, startVal = 0) {
  const [val, setVal] = useState(startVal)
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    const to = setTimeout(() => {
      const t0 = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - t0) / durationMs, 1)
        setVal(Math.round(startVal + (end - startVal) * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, 500)
    return () => clearTimeout(to)
  }, [end, durationMs, startVal])
  return val
}

/* ─── Orbit icon ───────────────────────────────────────────────────────── */

function OrbitIcon({
  icon: Icon,
  radius,
  duration,
  delay = 0,
  reverse = false,
  color = 'rgba(255,255,255,0.65)',
}: {
  icon: React.ElementType
  radius: number
  duration: number
  delay?: number
  reverse?: boolean
  color?: string
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: radius * 2,
        height: radius * 2,
        top: '50%',
        left: '50%',
        marginTop: -radius,
        marginLeft: -radius,
      }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
    >
      {/* Icon sits at 12-o'clock on the orbit ring, counter-rotates to stay upright */}
      <motion.div
        className="absolute flex items-center justify-center rounded-full"
        style={{
          width: 30, height: 30,
          top: 0, left: '50%',
          marginLeft: -15,
          marginTop: -15,
          background: 'rgba(255,255,255,0.09)',
          border: '1px solid rgba(255,255,255,0.16)',
          backdropFilter: 'blur(6px)',
        }}
        animate={{ rotate: reverse ? 360 : -360 }}
        transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
      >
        <Icon size={13} color={color} />
      </motion.div>
    </motion.div>
  )
}

/* ─── BoxReveal ────────────────────────────────────────────────────────── */

function BoxReveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: delay + 0.14, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
      {/* Wipe box slides from left → right revealing content */}
      <motion.div
        className="absolute inset-0 bg-white z-10"
        initial={{ scaleX: 1, originX: '0%' }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 0.36, delay, ease: [0.65, 0, 0.35, 1] }}
      />
    </div>
  )
}

/* ─── Orbit config ─────────────────────────────────────────────────────── */

const ORBIT_ICONS = [
  { icon: CreditCard, radius: 32, duration: 12, delay: 0,   reverse: false, color: 'rgba(255,200,210,0.85)' },
  { icon: ShieldCheck,radius: 32, duration: 12, delay: 6,   reverse: false, color: 'rgba(255,200,210,0.85)' },
  { icon: TrendingUp, radius: 55, duration: 20, delay: 0,   reverse: true,  color: 'rgba(255,180,195,0.65)' },
  { icon: Star,       radius: 55, duration: 20, delay: 10,  reverse: true,  color: 'rgba(255,180,195,0.65)' },
  { icon: Lock,       radius: 76, duration: 30, delay: 0,   reverse: false, color: 'rgba(255,160,180,0.45)' },
  { icon: Zap,        radius: 76, duration: 30, delay: 15,  reverse: false, color: 'rgba(255,160,180,0.45)' },
]

/* ─── Page ─────────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const router = useRouter()

  const [rawDigits, setRawDigits] = useState('')
  const [focused,   setFocused]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const displayPhone = formatPhone(rawDigits)
  const isValid      = rawDigits.length === 10

  // Left panel spotlight
  const leftRef = useRef<HTMLDivElement>(null)
  const [spot,     setSpot]     = useState({ x: 50, y: 50, on: false })
  const [testiIdx, setTestiIdx] = useState(0)

  // Mouse-following gradient on phone input
  const mouseX       = useMotionValue(0)
  const mouseY       = useMotionValue(0)
  const [inputHov, setInputHov] = useState(false)
  const gradientBg   = useMotionTemplate`radial-gradient(${inputHov ? '90px' : '0px'} circle at ${mouseX}px ${mouseY}px, rgba(122,30,44,0.18), transparent 80%)`

  const score  = useCounter(SCORE_END, 1600, SCORE_START)
  const barPct = Math.min(Math.round(((score - SCORE_START) / (SCORE_END - SCORE_START)) * 78), 78)

  useEffect(() => {
    const id = setInterval(() => setTestiIdx(i => (i + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(id)
  }, [])

  const handleSpotMove = useCallback((e: React.MouseEvent) => {
    if (!leftRef.current) return
    const r = leftRef.current.getBoundingClientRect()
    setSpot({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true })
  }, [])

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRawDigits(e.target.value.replace(/\D/g, '').slice(0, 10))
    setError(null)
  }

  function handleInputMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    sessionStorage.setItem('mcc_phone', rawDigits)
    await sendOtp(rawDigits)
    router.push('/otp')
  }

  const testi = TESTIMONIALS[testiIdx]

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-4 gap-3 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #ffffff 0%, #fff0f0 55%, #fddada 100%)' }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full" style={{ background: 'rgba(155,44,44,0.13)', filter: 'blur(55px)' }} />
        <div className="absolute top-1/2 -right-32 w-72 h-72 rounded-full" style={{ background: 'rgba(155,44,44,0.10)', filter: 'blur(55px)' }} />
        <div className="absolute -bottom-24 left-1/3 w-64 h-64 rounded-full" style={{ background: 'rgba(253,163,163,0.18)', filter: 'blur(55px)' }} />
      </div>

      {/* Brand mark — desktop only (mobile has one inside the card) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:flex items-center gap-2.5 select-none"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#7A1E2C,#5C1520)', boxShadow: '0 6px 16px rgba(122,30,44,0.35)' }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <span className="font-lora font-bold text-[17px] text-[#241014]">
          My Credit <span style={{ color: '#7A1E2C' }}>Café</span>
        </span>
      </motion.div>

      {/* Dual-panel card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="w-full max-w-[360px] md:max-w-[780px] grid md:grid-cols-[1fr_1fr] rounded-2xl overflow-hidden border border-red-100/80"
        style={{ boxShadow: '0 24px 48px -12px rgba(155,44,44,0.20)' }}
      >
        {/* ── LEFT: Brand panel ────────────────────────────────────── */}
        <div
          ref={leftRef}
          className="relative hidden md:flex flex-col overflow-hidden"
          style={{ background: 'linear-gradient(145deg,#7A1E2C 0%,#5C1520 55%,#241014 100%)' }}
          onMouseMove={handleSpotMove}
          onMouseLeave={() => setSpot(s => ({ ...s, on: false }))}
        >
          {/* Spotlight */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-[1]"
            style={{ opacity: spot.on ? 1 : 0, background: `radial-gradient(500px circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.11), transparent 60%)` }}
          />
          {/* Dot texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.18] z-[1]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)', backgroundSize: '20px 20px' }}
          />

          {/* ── Orbit zone: own contained section at the top ── */}
          <div className="relative flex-shrink-0 h-[170px] flex items-center justify-center pointer-events-none overflow-hidden">
            {/* Dashed orbit path rings */}
            <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.18 }}>
              {[32, 55, 76].map(r => (
                <circle key={r} cx="50%" cy="50%" r={r} fill="none" stroke="white" strokeWidth="1" strokeDasharray="3 8" />
              ))}
            </svg>
            {/* Center MCC orb */}
            <div className="relative z-10 flex items-center justify-center rounded-full flex-shrink-0"
              style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(255,255,255,0.07)', animationDuration: '2.8s' }} />
            </div>
            {ORBIT_ICONS.map((cfg, i) => (
              <OrbitIcon key={i} {...cfg} />
            ))}
          </div>

          {/* ── Content zone: below orbit ── */}
          <div className="relative z-10 flex flex-col justify-between flex-1 px-5 pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-rose-200/75 bg-white/10 border border-white/15 rounded-full px-2 py-0.5 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
                Portal de Miembros
              </span>
              <h1 className="font-lora text-[1.3rem] leading-[1.15] font-bold text-white mb-1.5">
                Tu score de crédito,<br />reimaginado.
              </h1>
              <p className="text-rose-100/70 text-[10.5px] leading-relaxed">
                Disputas automatizadas, revisión experta y un asesor dedicado — para personas que exigen resultados.
              </p>
              <ul className="mt-2.5 space-y-1">
                {FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 text-[10.5px] text-rose-50/85">
                    <span className="w-3.5 h-3.5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                      <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

          {/* Score card + testimonial */}
          <div className="mt-3">
            <div className="bg-white/12 border border-white/15 rounded-xl p-2.5 mb-3 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-rose-200/60 mb-0.5">Score promedio</p>
                <div className="flex items-end gap-1.5">
                  <span className="font-lora text-xl font-extrabold text-white">{score}</span>
                  <span className="text-[11px] font-bold text-emerald-300 mb-0.5">+161 pts</span>
                </div>
              </div>
              <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden self-center">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-300"
                  initial={{ width: '0%' }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 1.8, ease: 'easeOut', delay: 0.7 }}
                />
              </div>
            </div>

            <div className="border-t border-white/12 pt-3">
              <AnimatePresence mode="wait">
                <motion.div key={testiIdx}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex gap-0.5 mb-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={cn('w-2.5 h-2.5', i < testi.rating ? 'text-rose-300' : 'text-white/15')} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[11px] text-rose-50/80 leading-relaxed mb-2.5">"{testi.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white font-bold text-[9px]">
                      {testi.avatar}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white leading-tight">{testi.name}</div>
                      <div className="text-[9px] text-rose-200/65">{testi.role}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex gap-1.5 mt-2.5">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => setTestiIdx(i)} aria-label={`Testimonio ${i + 1}`}
                    className={cn('h-1 rounded-full transition-all duration-300', i === testiIdx ? 'bg-rose-300 w-4' : 'bg-white/20 w-1')} />
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* ── RIGHT: OTP phone form ─────────────────────────────────── */}
        <div className="relative flex flex-col justify-center p-5 sm:p-6 bg-white">
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'rgba(155,44,44,0.06)', filter: 'blur(35px)' }} />

          {/* Mobile-only brand mark (left panel is hidden on mobile) */}
          <div className="flex md:hidden items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7A1E2C,#5C1520)' }}>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" /><path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="font-lora font-bold text-[15px] text-[#241014]">My Credit <span style={{ color: '#7A1E2C' }}>Café</span></span>
          </div>

          {/* Header with BoxReveal */}
          <div className="mb-4">
            <BoxReveal delay={0.1}>
              <h2 className="font-lora text-[1.3rem] font-bold text-[#241014] mb-1 tracking-tight">
                Bienvenido de vuelta
              </h2>
            </BoxReveal>
            <BoxReveal delay={0.18}>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Ingresa tu número para recibir un código de acceso por SMS.
              </p>
            </BoxReveal>
          </div>

          {/* Phone form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <BoxReveal delay={0.26}>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Número de teléfono
                </label>
                {/* Mouse-following gradient wrapper */}
                <motion.div
                  className="rounded-xl p-[2px] transition-colors duration-300"
                  style={{ background: gradientBg }}
                  onMouseMove={handleInputMouseMove}
                  onMouseEnter={() => setInputHov(true)}
                  onMouseLeave={() => setInputHov(false)}
                >
                  <div className={cn(
                    'flex items-center rounded-[10px] border bg-neutral-50 transition-all overflow-hidden',
                    focused ? 'border-[#7A1E2C] ring-2 ring-[rgba(122,30,44,0.12)]' : 'border-neutral-200',
                    error  ? 'border-red-400 ring-2 ring-red-100' : '',
                  )}>
                    <span className="pl-3.5 pr-3 text-sm font-semibold text-neutral-400 shrink-0 select-none border-r border-neutral-200 py-2.5">
                      +1
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={displayPhone}
                      onChange={handlePhoneChange}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      placeholder="(555) 000-0000"
                      autoFocus
                      className="flex-1 bg-transparent px-3 py-2.5 text-sm font-medium text-[#241014] placeholder:text-neutral-400 focus:outline-none"
                    />
                    <AnimatePresence>
                      {isValid && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          className="pr-3"
                        >
                          <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
                <AnimatePresence>
                  {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs text-red-500 mt-1.5 font-medium" role="alert">
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </BoxReveal>

            <BoxReveal delay={0.34}>
              <motion.button
                type="submit"
                disabled={!isValid || loading}
                whileHover={{ y: isValid ? -1 : 0 }}
                whileTap={{ y: 0 }}
                className="w-full py-3 text-white rounded-xl font-bold text-sm tracking-tight transition-all disabled:opacity-40 disabled:cursor-not-allowed group/btn relative overflow-hidden"
                style={{
                  background:  'linear-gradient(180deg,#9b3545 0%,#7A1E2C 60%,#5C1520 100%)',
                  boxShadow:   isValid ? '0 8px 24px -6px rgba(122,30,44,0.50)' : 'none',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                    Enviando código...
                  </span>
                ) : (
                  <>
                    Continuar →
                    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-rose-300/60 to-transparent" />
                  </>
                )}
              </motion.button>
            </BoxReveal>
          </form>

          <BoxReveal delay={0.4} className="mt-3">
            <p className="text-[11px] text-neutral-400 text-center">
              Te enviaremos un código de 6 dígitos. Sin contraseñas.
            </p>
          </BoxReveal>

          <BoxReveal delay={0.46} className="mt-4">
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[10px] font-semibold text-neutral-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Encriptación bancaria
              </span>
              <span>FCRA · GLB Compliant</span>
            </div>
          </BoxReveal>

          <BoxReveal delay={0.52} className="mt-2.5">
            <p className="text-center text-[11px] text-neutral-400">
              ¿Eres del equipo?{' '}
              <Link href="/team/login" className="font-bold hover:underline" style={{ color: '#7A1E2C' }}>
                Ingresa aquí
              </Link>
            </p>
          </BoxReveal>
        </div>
      </motion.div>

      {/* Trust strip — desktop only */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="hidden md:flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400"
      >
        {[
          { label: '256-bit Encryption', icon: <svg className="w-3 h-3" style={{ color: '#7A1E2C' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-12V7a4 4 0 10-8 0v4h8z" /></svg> },
          { label: 'FCRA Compliant',     icon: <svg className="w-3 h-3" style={{ color: '#7A1E2C' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { label: '12,000+ Miembros',  icon: <svg className="w-3 h-3" style={{ color: '#7A1E2C' }} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg> },
          { label: 'Cancela cuando quieras', icon: <svg className="w-3 h-3" style={{ color: '#7A1E2C' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> },
        ].map(({ icon, label }) => (
          <span key={label} className="flex items-center gap-1">{icon}{label}</span>
        ))}
      </motion.div>
    </div>
  )
}
