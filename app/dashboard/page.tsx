'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import MccLogo from '@/components/MccLogo'
import Toast from '@/components/Toast'
import { ActivityCard, type Goal } from '@/components/ui/activity-card'
import { FinancialScoreCards } from '@/components/ui/financial-score-cards'
import { LiquidCard, CardContent } from '@/components/ui/liquid-glass-card'
import { AdvisorRevealCard } from '@/components/ui/advisor-reveal-card'
import { BureauSelector } from '@/components/ui/bureau-selector'
import { disputes, CLIENT } from '@/lib/data'
import { daysAgo } from '@/lib/utils'

const ACTIVITY = [
  { id: 1, type: 'new',     text: 'Identificamos un nuevo ítem en tu reporte: una deuda ya pagada reportada por LVNV Funding', date: '2026-06-30' },
  { id: 2, type: 'success', text: '¡Buenas noticias! Portfolio Recovery Associates eliminó tu cuenta de cobranza', date: '2026-06-28' },
  { id: 3, type: 'sent',    text: 'Enviamos tu carta de disputa a TransUnion sobre tu cuenta con Midland Credit Management', date: '2026-06-18' },
  { id: 4, type: 'wait',    text: 'Tu disputa con Capital One entró en espera de respuesta de Equifax', date: '2026-06-15' },
]

const DOCS = [
  { id: 1, name: 'Respuesta de Experian',  sub: 'Portfolio Recovery Associates · 28 jun', isNew: true },
  { id: 2, name: 'Carta de disputa',       sub: 'Midland Credit Management · 18 jun',     isNew: false },
  { id: 3, name: 'Carta de disputa',       sub: 'Capital One · 19 may',                   isNew: false },
  { id: 4, name: 'Carta de disputa',       sub: 'Portfolio Recovery Associates · 6 may',  isNew: false },
]

const NAV = [
  { id: 'resumen',         label: 'Resumen',             icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { id: 'disputas',        label: 'Disputas activas',    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5L2 5v4c0 4 3.1 7.4 7 8 3.9-.6 7-4 7-8V5L9 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> },
  { id: 'vault',           label: 'Vault de documentos', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M2 7h14" stroke="currentColor" strokeWidth="1.5"/><path d="M6 11h.5M9 11h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'actividad',       label: 'Actividad',           icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><polyline points="1,13 5,7 8,10 12,5 17,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: 'reportes',        label: 'Reportes',            icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="10" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="7.5" y="6" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="13" y="2" width="3" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { id: 'recomendaciones', label: 'Recomendaciones',     icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.2 3.2l1.4 1.4M13.4 13.4l1.4 1.4M3.2 14.8l1.4-1.4M13.4 4.6l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/></svg> },
]

const PILL: Record<string, { bg: string; color: string; label: string }> = {
  eliminado:  { bg: '#E7EFDE', color: '#3E6B2E', label: 'Eliminado' },
  verificado: { bg: '#F6EFDF', color: '#8A5F1E', label: 'Verificado' },
  stage0:     { bg: '#EDE7E6', color: '#57504E', label: 'Item identificado' },
  stage1:     { bg: '#F5E4E6', color: '#6B1A26', label: 'Carta enviada' },
  stage2:     { bg: '#FFF3E0', color: '#B8500A', label: 'En espera' },
  stage3:     { bg: '#E7EFDE', color: '#3E6B2E', label: 'Resultado' },
}

function getPill(d: typeof disputes[0]) {
  if (d.stageIdx === 3 && d.result) return PILL[d.result]
  return PILL[`stage${d.stageIdx}`]
}

function ActivityIcon({ type }: { type: string }) {
  const icons = {
    new:     { bg: '#F5E4E6', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="#7A1E2C" strokeWidth="1.4"/><path d="M8 5v3M8 9.5v.5" stroke="#7A1E2C" strokeWidth="1.4" strokeLinecap="round"/></svg> },
    success: { bg: '#E7EFDE', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="#4F9A5C" strokeWidth="1.4"/><path d="M5.5 8l2 2 3-3" stroke="#4F9A5C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    sent:    { bg: '#F6EFDF', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="8.5" rx="1.2" stroke="#B8862E" strokeWidth="1.3"/><path d="M2 5.5l6 4 6-4" stroke="#B8862E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    wait:    { bg: '#EDE7E6', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="#57504E" strokeWidth="1.4"/><path d="M8 5.5v2.8l2 1.2" stroke="#57504E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  }
  const { bg, icon } = icons[type as keyof typeof icons] ?? icons.wait
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
      {icon}
    </div>
  )
}

function DisputeProgress({ stageIdx, result }: { stageIdx: number; result: string | null }) {
  const steps = ['Enviado', 'En revisión', 'Resuelta']
  return (
    <div className="flex items-center gap-1">
      {steps.map((label, i) => {
        const stepStage = i + 1
        const done = stageIdx > stepStage
        const resolved = stageIdx === 3 && i === 2
        let dotBg = '#E7E2E1'; let dotBorder = '#E7E2E1'
        if (done || resolved) { dotBg = '#4F9A5C'; dotBorder = '#4F9A5C' }
        else if (stageIdx === stepStage) { dotBg = '#7A1E2C'; dotBorder = '#7A1E2C' }
        return (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && <div className="w-5 h-px" style={{ background: done ? '#4F9A5C' : '#E7E2E1' }} />}
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-3 h-3 rounded-full flex items-center justify-center" style={{ background: dotBg, border: `2px solid ${dotBorder}` }}>
                {(done || resolved) && <svg width="6" height="6" viewBox="0 0 6 6"><path d="M1 3l1.5 1.5L5 1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className="text-[9px] text-[#9C9492] whitespace-nowrap">{label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const CASE_METRICS = [
  { label: 'Disputas', value: '4',   trend: 80 },
  { label: 'Score',    value: '+77', trend: 70 },
  { label: 'Docs',     value: '4',   trend: 60 },
]

const INITIAL_GOALS: Goal[] = [
  { id: '1', title: 'Enviar segunda carta a TransUnion',  isCompleted: true },
  { id: '2', title: 'Subir estado de cuenta bancario',    isCompleted: false },
  { id: '3', title: 'Agendar revisión de score',          isCompleted: false },
]

function useCountUp(target: number, duration: number, delay = 0) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = Date.now()
      const tick = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        setValue(Math.round((1 - Math.pow(1 - progress, 3)) * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [target, duration, delay])
  return value
}

function QuickStatRow({ icon, value, label, action }: { icon: ReactNode; value: string; label: string; action: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  return (
    <button
      ref={ref}
      onClick={action}
      onMouseMove={e => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[#F7F5F4] transition-colors text-left overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(circle 100px at ${pos.x}px ${pos.y}px, rgba(122,30,44,0.07), transparent)`,
        }}
      />
      <div className="relative z-10 w-8 h-8 rounded-lg bg-[#F5E4E6] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="relative z-10 flex-1 min-w-0">
        <p className="text-sm font-bold font-lora text-[#241014] leading-tight">{value}</p>
        <p className="text-[10px] text-[#9C9492] leading-tight">{label}</p>
      </div>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="relative z-10 text-[#9C9492] shrink-0">
        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </button>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeNav, setActiveNav] = useState('resumen')
  const [toastMsg, setToastMsg] = useState('')
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS)

  const displayScore = useCountUp(615, 1600, 200)
  const displayDelta = useCountUp(77,  1400, 500)

  useEffect(() => { sessionStorage.setItem('mcc_disclosure_done', 'true') }, [])

  function flash(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2200)
  }

  return (
    <div className="flex min-h-screen bg-[#F7F5F4]">

      {/* ══════════════════════════════════
          ZONA 1 — LEFT ANCHOR (260px fixed)
          ══════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-[260px] shrink-0 bg-white border-r border-[#E7E2E1] h-screen sticky top-0">

        {/* Logo — more breathing room */}
        <div className="px-6 py-6 border-b border-[#E7E2E1]">
          <div className="flex items-center gap-3">
            <MccLogo size={36} />
            <span className="font-lora text-base font-medium text-[#241014] leading-tight">
              My Credit<br/><span className="text-[#7A1E2C]">Café</span>
            </span>
          </div>
        </div>

        {/* Navigation — translucent active state */}
        <nav className="flex-1 px-4 py-5 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                activeNav === item.id
                  ? 'text-[#7A1E2C] font-semibold'
                  : 'text-[#57504E] hover:bg-[#F7F5F4] hover:text-[#241014]'
              }`}
              style={activeNav === item.id ? { background: 'rgba(36,16,20,0.06)' } : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Plan Premium — pinned to absolute bottom, SVG icon, no emoji */}
        <div className="px-4 pb-6">
          <div className="p-4 rounded-xl" style={{ background: 'rgba(139,35,50,0.06)', border: '1px solid rgba(139,35,50,0.10)' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L4.5 6H1l3.5 3-1.3 4.5L7 11l3.8 2.5L9.5 9 13 6H9.5L7 1z" fill="#57504E"/>
              </svg>
              <p className="text-sm font-semibold text-[#241014]">Plan Premium</p>
            </div>
            <p className="text-xs text-[#57504E] mb-2.5 leading-snug">Tienes acceso completo a todas las herramientas.</p>
            <button onClick={() => flash('Beneficios próximamente')} className="text-xs font-semibold text-[#7A1E2C] hover:underline">
              Ver beneficios →
            </button>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════
          ZONAS 2+3 — content right of sidebar
          ══════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header — constrained to match content max-width */}
        <header className="bg-white border-b border-[#E7E2E1] shrink-0 sticky top-0 z-20">
          <div className="max-w-[1240px] mx-auto px-6 h-14 flex items-center justify-between">
            <h1 className="font-lora text-lg font-medium text-[#241014]">
              Hola, {CLIENT.name}
            </h1>
            <div className="flex items-center gap-3">
              <button
                className="relative p-2 text-[#57504E] hover:text-[#241014] hover:bg-[#F7F5F4] rounded-lg transition-colors"
                onClick={() => flash('2 notificaciones')}
              >
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                  <path d="M11 2C7.69 2 5 4.69 5 8v5l-2 2v1h16v-1l-2-2V8c0-3.31-2.69-6-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M9 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-[#7A1E2C] rounded-full text-white text-[9px] font-bold grid place-items-center leading-none">2</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E7E2E1] hover:bg-[#F7F5F4] transition-colors"
                onClick={() => flash('Configuración próximamente')}
              >
                <div className="w-6 h-6 rounded-full bg-[#7A1E2C] flex items-center justify-center text-white text-xs font-bold">MV</div>
                <span className="text-sm text-[#241014] font-medium hidden sm:block">Mi cuenta</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="#57504E" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1240px] mx-auto p-5 xl:p-6">
            <div className="flex gap-5 items-start">

              {/* ══════════════════════════════════
                  ZONA 2 — CENTER STAGE (flex-1)
                  ══════════════════════════════════ */}
              <div className="flex-1 min-w-0 space-y-5">

                {/* ── HERO BANNER: 3-column grid ── */}
                <div
                  className="rounded-2xl relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #5C1520 0%, #7A1E2C 55%, #8B2535 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.07) 0%, transparent 60%)' }} />
                  <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)' }} />

                  <div className="relative z-10 p-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">

                    {/* LEFT — Score + label */}
                    <div className="text-white">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-3">Tu score de crédito</p>
                      <p className="text-8xl font-bold font-lora leading-none tracking-tight">{displayScore}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white/90"
                          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
                        >
                          Bueno
                        </span>
                        <p className="text-xs text-white/40">próx. 26 jun 2026</p>
                      </div>
                    </div>

                    {/* CENTER — Arc gauge (visual bridge) */}
                    <div>
                      <svg width="190" height="110" viewBox="0 0 220 130">
                        <path d="M20 110 A90 90 0 0 1 200 110" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="16" strokeLinecap="round"/>
                        <motion.path
                          d="M20 110 A90 90 0 0 1 200 110"
                          fill="none" stroke="white" strokeWidth="16" strokeLinecap="round"
                          strokeDasharray="283"
                          initial={{ strokeDashoffset: 283 }}
                          animate={{ strokeDashoffset: 283 - 283 * ((615 - 300) / 550) }}
                          transition={{ duration: 1.8, ease: [0.25, 1, 0.5, 1], delay: 0.3 }}
                        />
                        <text x="20"  y="127" fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="system-ui" textAnchor="start">300</text>
                        <text x="200" y="127" fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="system-ui" textAnchor="end">850</text>
                      </svg>
                    </div>

                    {/* RIGHT — dark glass chip + mini grid */}
                    <div className="text-white">
                      <div
                        className="rounded-2xl px-4 py-3.5 mb-3"
                        style={{
                          background: 'rgba(0,0,0,0.28)',
                          border: '1px solid rgba(255,255,255,0.10)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <p className="text-[9px] font-semibold text-white/40 uppercase tracking-[0.16em] mb-2">Puntos ganados</p>
                        <p
                          className="font-extrabold leading-none tracking-tighter"
                          style={{ fontSize: '3.25rem', color: '#6EE7A0', textShadow: '0 0 28px rgba(110,231,160,0.45)' }}
                        >
                          +{displayDelta}
                        </p>
                        <p className="text-[10px] text-white/30 mt-1.5">pts desde que comenzamos</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: String(disputes.length), label: 'Disputas' },
                          { value: '3',                     label: 'Meses' },
                        ].map(m => (
                          <div key={m.label} className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)' }}>
                            <p className="text-xl font-bold font-lora text-white leading-none">{m.value}</p>
                            <p className="text-[10px] text-white/50 mt-0.5">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* ── ROADMAP (directly below banner) ── */}
                <LiquidCard className="rounded-2xl py-0 gap-0">
                  <CardContent className="p-6">
                    <p className="text-xs font-semibold text-[#9C9492] uppercase tracking-widest mb-1">Tu plan de reparación</p>
                    <p className="text-base font-semibold font-lora text-[#241014] mb-8">4 pasos hacia un crédito excelente</p>

                    <div className="max-w-[440px] mx-auto relative">
                      <div className="absolute bg-[#E7E2E1] rounded-full" style={{ height: '3px', top: '19px', left: '40px', right: '40px' }} />
                      <motion.div
                        className="absolute bg-[#4F9A5C] rounded-full origin-left"
                        style={{ height: '3px', top: '19px', left: '40px', right: '40px', filter: 'drop-shadow(0 0 4px rgba(79,154,92,0.6))' }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 0.67 }}
                        transition={{ duration: 1.0, delay: 0.4, ease: 'easeOut' }}
                      />
                      <div className="flex justify-between">
                        {([
                          { label: 'Verificación', desc: 'Identidad verificada', status: 'done' },
                          { label: 'Análisis',     desc: 'Reporte revisado',    status: 'done' },
                          { label: 'Disputas',     desc: '4 en proceso',        status: 'active' },
                          { label: 'Optimización', desc: 'Score 750+',          status: 'pending' },
                        ] as const).map((step, i) => (
                          <motion.div
                            key={i}
                            className="flex flex-col items-center text-center w-[80px]"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
                          >
                            <div className="relative mb-2">
                              {step.status === 'active' && (
                                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(122,30,44,0.25)' }} />
                              )}
                              <motion.div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  step.status === 'done'    ? 'bg-[#4F9A5C] border-2 border-[#4F9A5C]' :
                                  step.status === 'active'  ? 'bg-[#7A1E2C] border-4 border-white' :
                                  'bg-white border-2 border-[#D4CCCA] opacity-50'
                                }`}
                                style={
                                  step.status === 'active'  ? { boxShadow: '0 0 15px rgba(122,30,44,0.4)' } :
                                  step.status === 'pending' ? { boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' } : undefined
                                }
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 500, damping: 18 }}
                                whileHover={step.status === 'done' ? { scale: 1.1 } : undefined}
                              >
                                {step.status === 'done'    && <CheckCircle2 size={16} className="text-white" />}
                                {step.status === 'active'  && <div className="w-3 h-3 rounded-full bg-white" />}
                                {step.status === 'pending' && <span className="text-xs font-bold text-[#B8ABA9]">{i + 1}</span>}
                              </motion.div>
                            </div>
                            <p className={`text-[11px] font-semibold leading-tight ${
                              step.status === 'done'    ? 'text-[#4F9A5C]' :
                              step.status === 'active'  ? 'text-[#241014]' : 'text-[#B0A4A2]'
                            }`}>{step.label}</p>
                            <p className={`text-[10px] mt-0.5 leading-tight ${
                              step.status === 'pending' ? 'text-[#C4BEBC]' : 'text-[#9C9492]'
                            }`}>{step.desc}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </LiquidCard>

                {/* ── BUREAU SELECTOR ── */}
                <BureauSelector onSelect={(id) => flash(`Filtrando por ${id}`)} />

                {/* ── DISPUTES TABLE ── */}
                <div className="bg-white rounded-2xl border border-[#E7E2E1] card-lift overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E7E2E1] flex items-center justify-between">
                    <p className="text-sm font-semibold font-lora text-[#241014]">Tus disputas activas</p>
                    <button className="text-xs font-semibold text-[#7A1E2C] hover:underline" onClick={() => flash('Ver todas próximamente')}>Ver todas →</button>
                  </div>
                  <div className="divide-y divide-[#F7F5F4]">
                    {disputes.map(d => {
                      const pill = getPill(d)
                      return (
                        <button
                          key={d.id}
                          onClick={() => router.push(`/disputes/${d.id}`)}
                          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F7F5F4] transition-colors text-left"
                        >
                          <div className="w-9 h-9 rounded-full bg-[#241014] flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {d.creditor.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#241014] truncate">{d.creditor}</p>
                            <p className="text-xs text-[#9C9492] truncate">{d.item}</p>
                            <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: pill.bg, color: pill.color }}>
                              {pill.label}
                            </span>
                          </div>
                          <div className="shrink-0 text-right">
                            <DisputeProgress stageIdx={d.stageIdx} result={d.result} />
                            <p className="text-[10px] text-[#9C9492] mt-1">Actualizado {daysAgo(d.lastActivity)}</p>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-[#9C9492]">
                            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* ── ACTIVITY FEED ── */}
                <div className="bg-white rounded-2xl border border-[#E7E2E1] card-lift p-5">
                  <p className="text-sm font-semibold font-lora text-[#241014] mb-4">Actividad reciente</p>
                  <div className="space-y-3.5">
                    {ACTIVITY.map(a => (
                      <div key={a.id} className="flex items-start gap-3">
                        <ActivityIcon type={a.type} />
                        <div className="flex-1">
                          <p className="text-xs text-[#241014] leading-snug">{a.text}</p>
                          <p className="text-xs text-[#9C9492] mt-0.5">{daysAgo(a.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 text-xs font-semibold text-[#7A1E2C] hover:underline" onClick={() => flash('Actividad completa próximamente')}>
                    Ver toda la actividad →
                  </button>
                </div>

                {/* ── VAULT (full-width now) ── */}
                <div className="bg-white rounded-2xl border border-[#E7E2E1] card-lift overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E7E2E1] flex items-center justify-between">
                    <p className="text-sm font-semibold font-lora text-[#241014]">Vault de documentos</p>
                    <button className="text-xs font-semibold text-[#7A1E2C] hover:underline" onClick={() => flash('Ver vault próximamente')}>Ver todos →</button>
                  </div>
                  <div className="divide-y divide-[#F7F5F4]">
                    {DOCS.map(doc => (
                      <div key={doc.id} className="flex items-center gap-3 px-4 py-3.5">
                        <div className="w-9 h-9 rounded-lg bg-[#F5E4E6] flex items-center justify-center shrink-0">
                          <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><rect x="3" y="1" width="11" height="15" rx="1.5" stroke="#7A1E2C" strokeWidth="1.3"/><path d="M6 6h6M6 9h6M6 12h4" stroke="#7A1E2C" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-[#241014] truncate">{doc.name}</p>
                            {doc.isNew && <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#E7EFDE] text-[#3E6B2E]">Nuevo</span>}
                          </div>
                          <p className="text-xs text-[#9C9492] truncate">{doc.sub}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => flash('Previsualizar próximamente')} className="p-1.5 text-[#9C9492] hover:text-[#241014] transition-colors">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>
                          </button>
                          <button onClick={() => flash('Descarga próximamente')} className="p-1.5 text-[#9C9492] hover:text-[#241014] transition-colors">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v9M5 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 bg-[#F7F5F4] flex items-center gap-2">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#9C9492" strokeWidth="1.2"/><path d="M7 5v2M7 9v.5" stroke="#9C9492" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    <p className="text-xs text-[#9C9492]">Tu información está segura y encriptada.</p>
                  </div>
                </div>

                {/* ── FINANCIAL SCORES ── */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold font-lora text-[#241014]">Tus scores financieros</p>
                    <span className="text-xs text-[#9C9492]">Actualizado hoy</span>
                  </div>
                  <FinancialScoreCards />
                </div>

              </div>{/* end Zone 2 */}

              {/* ══════════════════════════════════
                  ZONA 3 — RIGHT INTELLIGENCE (340px)
                  ══════════════════════════════════ */}
              <div className="hidden xl:flex flex-col gap-4 w-[340px] shrink-0 sticky top-6">

                {/* TOP: Step progress notification */}
                <motion.div
                  className="bg-white rounded-2xl border border-[#E7E2E1] p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F5E4E6] flex items-center justify-center shrink-0">
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                        <path d="M9 1.5L2.5 8.5H7L7 14.5L13.5 7.5H9L9 1.5Z" fill="#7A1E2C" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[#9C9492] uppercase tracking-widest">Progreso actual</p>
                      <p className="text-sm font-semibold text-[#241014] mt-0.5">Estás en el Paso 3 de 4</p>
                      <p className="text-xs text-[#57504E] leading-snug mt-1">Próxima acción: seguimiento a Capital One con Equifax.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-[#E7E2E1] overflow-hidden">
                      <motion.div
                        className="h-full bg-[#7A1E2C] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-[#7A1E2C] shrink-0">75%</span>
                  </div>
                </motion.div>

                {/* MIDDLE: Advisor card */}
                <AdvisorRevealCard
                  name="Andrea Ruiz"
                  role="Especialista en crédito"
                  rating={4.9}
                  reviewCount={320}
                  initials="AR"
                  suggestion="Podemos dar seguimiento proactivo a tu disputa con Capital One para acelerar la respuesta de Equifax."
                  benefits={[
                    'Aumenta la probabilidad de respuesta rápida',
                    'Demuestra seguimiento y perseverancia',
                    'Te mantiene en movimiento hacia tu meta',
                  ]}
                  onAction={() => flash('Solicitud enviada. Andrea te contactará pronto.')}
                />

                {/* BOTTOM: Quick stats — vertical list, single-color SVG icons */}
                <div className="bg-white rounded-2xl border border-[#E7E2E1] p-4">
                  <p className="text-[10px] font-semibold text-[#9C9492] uppercase tracking-widest mb-2">Accesos rápidos</p>
                  <div className="space-y-0.5">
                    <QuickStatRow
                      icon={<svg width="15" height="15" viewBox="0 0 18 18" fill="none"><path d="M9 1.5L2 5v4c0 4 3.1 7.4 7 8 3.9-.6 7-4 7-8V5L9 1.5z" stroke="#7A1E2C" strokeWidth="1.5" strokeLinejoin="round"/></svg>}
                      value={`${disputes.length}`} label="Disputas activas"
                      action={() => flash('Disputas próximamente')}
                    />
                    <QuickStatRow
                      icon={<svg width="15" height="15" viewBox="0 0 18 18" fill="none"><rect x="3" y="2" width="11" height="14" rx="1.5" stroke="#7A1E2C" strokeWidth="1.4"/><path d="M6 6h6M6 9h6M6 12h4" stroke="#7A1E2C" strokeWidth="1.2" strokeLinecap="round"/></svg>}
                      value="4" label="Documentos guardados"
                      action={() => flash('Vault próximamente')}
                    />
                    <QuickStatRow
                      icon={<svg width="15" height="15" viewBox="0 0 18 18" fill="none"><polyline points="2,14 6,8 9,11 13,5 16,8" stroke="#7A1E2C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 5h3v3" stroke="#7A1E2C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      value="+77 pts" label="Ganados en total"
                      action={() => flash('Historial próximamente')}
                    />
                    <QuickStatRow
                      icon={<svg width="15" height="15" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="13" rx="1.5" stroke="#7A1E2C" strokeWidth="1.4"/><path d="M2 7h14M6 3V1M12 3V1" stroke="#7A1E2C" strokeWidth="1.4" strokeLinecap="round"/></svg>}
                      value="8 días" label="Última actualización"
                      action={() => flash('Calendario próximamente')}
                    />
                  </div>
                </div>

                {/* Activity rings + goals */}
                <ActivityCard
                  metrics={CASE_METRICS}
                  dailyGoals={goals}
                  onToggleGoal={(id) => setGoals(prev => prev.map(g => g.id === id ? { ...g, isCompleted: !g.isCompleted } : g))}
                  onAddGoal={() => flash('Agregar tarea próximamente')}
                  onViewDetails={() => flash('Progreso completo próximamente')}
                />

              </div>{/* end Zone 3 */}

            </div>
          </div>
        </div>
      </div>

      {toastMsg && <Toast message={toastMsg} onDismiss={() => setToastMsg('')} />}
    </div>
  )
}
