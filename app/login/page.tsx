'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

/* ─── Static data ─────────────────────────────────────────────────────── */

const TESTIMONIALS = [
  {
    text: 'Eliminaron tres cobros incorrectos en cinco semanas. Mi score subió 92 puntos antes de cerrar la compra de mi casa.',
    name: 'María Kessler',
    role: 'Propietaria, Austin TX',
    avatar: 'MK',
    rating: 5,
  },
  {
    text: 'El dashboard hace que todo sea fácil de seguir. El soporte se sintió como un asesor privado, no un call center.',
    name: 'David Okoro',
    role: 'Empresario',
    avatar: 'DO',
    rating: 5,
  },
  {
    text: 'Refinancié mi auto seis semanas después de registrarme. Encontraron errores que dos otras empresas ignoraron.',
    name: 'Priya Anand',
    role: 'Enfermera Practicante',
    avatar: 'PA',
    rating: 4,
  },
]

const FEATURES = [
  'Promedio +127 puntos de aumento en 6 meses',
  '94% de tasa de éxito en disputas',
  'Encriptación bancaria de 256 bits',
]

const SCORE_START = 580
const SCORE_END = 741
const SCORE_BAR_END = 78 // %

/* ─── Score counter ───────────────────────────────────────────────────── */

function useCounter(end: number, durationMs = 1800, startVal = 0) {
  const [val, setVal] = useState(startVal)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const timeout = setTimeout(() => {
      const t0 = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - t0) / durationMs, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setVal(Math.round(startVal + (end - startVal) * eased))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, 400)
    return () => clearTimeout(timeout)
  }, [end, durationMs, startVal])

  return val
}

/* ─── MCC shield logo ─────────────────────────────────────────────────── */

function MccShield() {
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #7A1E2C 0%, #5C1520 100%)',
        boxShadow: '0 8px 24px rgba(122,30,44,0.4)',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    </div>
  )
}

/* ─── Input helper (focus ring matches brand) ─────────────────────────── */

function BrandInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full py-3 rounded-xl border border-neutral-200 bg-neutral-50',
        'text-[#241014] placeholder:text-neutral-400 font-medium text-sm',
        'focus:outline-none focus:border-[#7A1E2C] focus:ring-2 focus:ring-[rgba(122,30,44,0.15)]',
        'transition-all',
        props.className,
      )}
    />
  )
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const router = useRouter()

  // Auth state
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Left panel
  const leftRef = useRef<HTMLDivElement>(null)
  const [spot, setSpot] = useState({ x: 50, y: 50, on: false })
  const [testiIdx, setTestiIdx] = useState(0)

  const score = useCounter(SCORE_END, 1800, SCORE_START)
  const barPct = Math.round(((score - SCORE_START) / (SCORE_END - SCORE_START)) * SCORE_BAR_END)

  // Testimonial auto-rotate
  useEffect(() => {
    const id = setInterval(() => setTestiIdx(i => (i + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(id)
  }, [])

  const handleSpotMove = useCallback((e: React.MouseEvent) => {
    if (!leftRef.current) return
    const r = leftRef.current.getBoundingClientRect()
    setSpot({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true })
  }, [])

  function switchMode(m: 'signin' | 'signup') {
    setMode(m)
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
        router.push('/dashboard')
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
        if (err) throw err
        setSuccess('Revisa tu correo para confirmar tu cuenta.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Algo salió mal. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const testi = TESTIMONIALS[testiIdx]

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-14 gap-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fff0f0 50%, #ffd9d9 100%)' }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] rounded-full" style={{ background: 'rgba(155,44,44,0.15)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 -right-40 w-[26rem] h-[26rem] rounded-full" style={{ background: 'rgba(155,44,44,0.12)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-32 left-1/3 w-[22rem] h-[22rem] rounded-full" style={{ background: 'rgba(253,163,163,0.22)', filter: 'blur(60px)' }} />
      </div>

      {/* Brand mark */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 select-none"
      >
        <MccShield />
        <div className="leading-tight">
          <span className="font-lora font-bold text-xl text-[#241014]">
            My Credit <span style={{ color: '#7A1E2C' }}>Café</span>
          </span>
        </div>
      </motion.div>

      {/* Main dual-panel card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-full max-w-5xl grid md:grid-cols-2 rounded-[28px] overflow-hidden border border-red-100"
        style={{ boxShadow: '0 40px 80px -20px rgba(155,44,44,0.25)' }}
      >
        {/* ── LEFT: Dark brand panel ─────────────────────────────────── */}
        <div
          ref={leftRef}
          className="relative hidden md:flex flex-col justify-between p-10 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #7A1E2C 0%, #5C1520 50%, #241014 100%)' }}
          onMouseMove={handleSpotMove}
          onMouseLeave={() => setSpot(s => ({ ...s, on: false }))}
        >
          {/* Cursor spotlight */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              opacity: spot.on ? 1 : 0,
              background: `radial-gradient(600px circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.12), transparent 60%)`,
            }}
          />

          {/* Dot-grid texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0)',
              backgroundSize: '22px 22px',
            }}
          />

          {/* Spinning rings */}
          <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
            <motion.svg
              viewBox="0 0 500 500"
              className="absolute w-[130%] h-[130%]"
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            >
              <circle cx="250" cy="250" r="220" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="1" />
              <circle cx="250" cy="250" r="170" fill="none" stroke="white" strokeOpacity="0.14" strokeWidth="1" />
            </motion.svg>
            <motion.svg
              viewBox="0 0 500 500"
              className="absolute w-full h-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
            >
              <circle cx="250" cy="250" r="120" fill="none" stroke="#fecaca" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="6 10" />
            </motion.svg>
          </div>

          {/* Top content */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-rose-200/80 bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
              Portal de Miembros
            </span>

            <h1 className="font-lora text-[2.25rem] leading-[1.1] font-bold text-white mb-4">
              Tu score de crédito,<br />reimaginado.
            </h1>
            <p className="text-rose-100/80 text-sm leading-relaxed max-w-sm">
              Disputas automatizadas, revisión experta y un asesor dedicado — diseñado para personas que exigen resultados.
            </p>

            <ul className="mt-8 space-y-3">
              {FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-rose-50/90">
                  <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom: floating score card + testimonial */}
          <div className="relative z-10 mt-10">
            {/* Floating score card */}
            <motion.div
              className="absolute -top-24 right-0 w-44 bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-4 border border-white/60"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Score de Crédito</p>
              <div className="flex items-end gap-2">
                <span className="font-lora text-3xl font-extrabold text-[#241014]">{score}</span>
                <span className="text-xs font-bold mb-1" style={{ color: '#7A1E2C' }}>+161</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-neutral-100 mt-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #9b2c2c, #7A1E2C)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 2, ease: 'easeOut', delay: 0.6 }}
                />
              </div>
            </motion.div>

            {/* Testimonial */}
            <div className="border-t border-white/15 pt-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testiIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28 }}
                >
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={cn('w-3.5 h-3.5', i < testi.rating ? 'text-rose-300' : 'text-white/20')}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-rose-50/90 leading-relaxed mb-4">"{testi.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white font-bold text-xs">
                      {testi.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{testi.name}</div>
                      <div className="text-xs text-rose-200/70">{testi.role}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div className="flex gap-1.5 mt-4">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestiIdx(i)}
                    aria-label={`Testimonio ${i + 1}`}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      i === testiIdx ? 'bg-rose-300 w-4' : 'bg-white/25 w-1.5',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Auth form ───────────────────────────────────────── */}
        <div className="relative flex flex-col justify-center p-8 sm:p-12 bg-white">
          {/* Corner glows */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'rgba(155,44,44,0.07)', filter: 'blur(40px)' }} />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'rgba(155,44,44,0.07)', filter: 'blur(40px)' }} />

          {/* Tab switcher */}
          <div className="flex items-center gap-1 rounded-full p-1 mb-8 max-w-[280px] border border-red-100 bg-red-50">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={cn(
                  'flex-1 py-2 text-sm font-bold rounded-full transition-all',
                  mode === m ? 'bg-white text-[#7A1E2C] shadow-sm' : 'text-neutral-500 hover:text-[#7A1E2C]',
                )}
              >
                {m === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="mb-7">
            <h2 className="font-lora text-3xl font-bold text-[#241014] mb-1.5 tracking-tight">
              {mode === 'signin' ? 'Bienvenido de vuelta' : 'Empieza tu reparación'}
            </h2>
            <p className="text-neutral-500 text-sm">
              {mode === 'signin'
                ? 'Ingresa para ver el progreso de tus disputas y tu historial.'
                : 'Auditoría gratuita. Sin tarjeta requerida.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name — signup only */}
            <AnimatePresence initial={false}>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <label className="block text-xs font-bold uppercase tracking-wide text-neutral-600 mb-1.5">
                    Nombre completo
                  </label>
                  <BrandInput
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Jordan Álvarez"
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-neutral-600 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <BrandInput
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@ejemplo.com"
                  required
                  autoComplete="email"
                  className="pl-11"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-600">
                  Contraseña
                </label>
                {mode === 'signin' && (
                  <a href="#" className="text-xs font-bold hover:opacity-75 transition-opacity" style={{ color: '#7A1E2C' }}>
                    ¿Olvidaste?
                  </a>
                )}
              </div>
              <div className="relative">
                <BrandInput
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="pl-11 pr-11"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#7A1E2C] transition-colors"
                  aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me — signin only */}
            <AnimatePresence initial={false}>
              {mode === 'signin' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between pt-1"
                >
                  <label className="flex items-center gap-2 text-xs font-semibold text-neutral-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300"
                      style={{ accentColor: '#7A1E2C' }}
                    />
                    Mantenerme conectado
                  </label>
                  <span className="flex items-center gap-1 text-xs font-semibold text-neutral-400">
                    <Lock className="w-3.5 h-3.5" />
                    Encriptado
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feedback */}
            <AnimatePresence>
              {(error || success) && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'text-xs font-medium px-3 py-2 rounded-lg',
                    success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600',
                  )}
                  role="alert"
                >
                  {success ?? error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              className="w-full py-3.5 mt-2 text-white rounded-xl font-black text-[15px] tracking-tight transition-shadow disabled:opacity-60 disabled:pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, #9b3545 0%, #7A1E2C 55%, #5C1520 100%)',
                boxShadow: '0 10px 30px -8px rgba(122,30,44,0.55)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                  {mode === 'signin' ? 'Ingresando...' : 'Creando cuenta...'}
                </span>
              ) : (
                <>{mode === 'signin' ? 'Iniciar sesión' : 'Crear mi cuenta'} →</>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <span className="h-px flex-1 bg-neutral-200" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">o continúa con</span>
            <span className="h-px flex-1 bg-neutral-200" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'Google',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 10.8v3.6h5c-.2 1.2-1.5 3.6-5 3.6-3 0-5.4-2.5-5.4-5.6S9 6.8 12 6.8c1.7 0 2.8.7 3.5 1.3l2.4-2.3C16.4 4.4 14.4 3.5 12 3.5 6.9 3.5 2.8 7.6 2.8 12.4S6.9 21.3 12 21.3c6.9 0 9.3-4.8 9.3-7.3 0-.5 0-.9-.1-1.2H12z" />
                  </svg>
                ),
              },
              {
                label: 'Apple',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-2.02 1.575-3.05 1.49-.12-1.1.46-2.25 1.17-3.03.78-.9 2.15-1.58 3.06-1.54zm2.78 17.02c-.55.86-1.05 1.71-1.9 1.71-.85.02-1.13-.52-2.1-.52-.97 0-1.29.5-2.09.54-.83.03-1.47-.9-2.03-1.75-1.1-1.7-1.94-4.8-.81-6.9.56-1.03 1.56-1.69 2.65-1.7.83-.02 1.62.55 2.13.55.51 0 1.47-.68 2.48-.58.42.02 1.62.17 2.45 1.29-.06.04-1.46.85-1.45 2.52.02 2 1.75 2.66 1.77 2.67-.02.05-.28.94-.9 1.87z" />
                  </svg>
                ),
              },
            ].map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-neutral-200 hover:border-red-200 hover:bg-red-50/40 transition-all text-sm font-bold text-neutral-700"
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Switch */}
          <p className="text-center text-sm font-medium text-neutral-500 mt-7">
            {mode === 'signin' ? '¿No tienes cuenta?' : '¿Ya eres miembro?'}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              className="font-bold hover:underline transition-opacity hover:opacity-75"
              style={{ color: '#7A1E2C' }}
            >
              {mode === 'signin' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>

          {/* Trust footer */}
          <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Encriptación bancaria
            </span>
            <span>FCRA · GLB Compliant</span>
          </div>

          {/* Team link */}
          <p className="text-center text-xs text-neutral-400 mt-4">
            ¿Eres del equipo?{' '}
            <Link href="/team/login" className="font-bold hover:underline" style={{ color: '#7A1E2C' }}>
              Ingresa aquí
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Trust row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400"
      >
        {[
          { icon: <Lock className="w-3.5 h-3.5" style={{ color: '#7A1E2C' }} />, label: '256-bit Encryption' },
          {
            icon: (
              <svg className="w-3.5 h-3.5" style={{ color: '#7A1E2C' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            label: 'FCRA Compliant',
          },
          {
            icon: (
              <svg className="w-3.5 h-3.5" style={{ color: '#7A1E2C' }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
              </svg>
            ),
            label: '12,000+ Miembros',
          },
          {
            icon: (
              <svg className="w-3.5 h-3.5" style={{ color: '#7A1E2C' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ),
            label: 'Cancela cuando quieras',
          },
        ].map(({ icon, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            {icon}
            {label}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
