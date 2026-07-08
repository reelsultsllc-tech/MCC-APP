'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MccLogo from '@/components/MccLogo'
import ScoreGauge from '@/components/ScoreGauge'
import Toast from '@/components/Toast'
import { ActivityCard, type Goal } from '@/components/ui/activity-card'
import { FinancialScoreCards } from '@/components/ui/financial-score-cards'
import { disputes, scoreHistory, CLIENT } from '@/lib/data'
import { daysAgo, formatDate } from '@/lib/utils'

const ACTIVITY = [
  { id: 1, type: 'new', text: 'Identificamos un nuevo ítem en tu reporte: una deuda ya pagada reportada por LVNV Funding', date: '2026-06-30' },
  { id: 2, type: 'success', text: '¡Buenas noticias! Portfolio Recovery Associates eliminó tu cuenta de cobranza', date: '2026-06-28' },
  { id: 3, type: 'sent', text: 'Enviamos tu carta de disputa a TransUnion sobre tu cuenta con Midland Credit Management', date: '2026-06-18' },
  { id: 4, type: 'wait', text: 'Tu disputa con Capital One entró en espera de respuesta de Equifax', date: '2026-06-15' },
]

const DOCS = [
  { id: 1, name: 'Respuesta de Experian', sub: 'Portfolio Recovery Associates · 28 jun', isNew: true },
  { id: 2, name: 'Carta de disputa', sub: 'Midland Credit Management · 18 jun', isNew: false },
  { id: 3, name: 'Carta de disputa', sub: 'Capital One · 19 may', isNew: false },
  { id: 4, name: 'Carta de disputa', sub: 'Portfolio Recovery Associates · 6 may', isNew: false },
]

const NAV = [
  { id: 'resumen', label: 'Resumen', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
  )},
  { id: 'disputas', label: 'Disputas activas', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5L2 5v4c0 4 3.1 7.4 7 8 3.9-.6 7-4 7-8V5L9 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
  )},
  { id: 'vault', label: 'Vault de documentos', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M2 7h14" stroke="currentColor" strokeWidth="1.5"/><path d="M6 11h.5M9 11h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  )},
  { id: 'actividad', label: 'Actividad', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><polyline points="1,13 5,7 8,10 12,5 17,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { id: 'reportes', label: 'Reportes', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="10" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="7.5" y="6" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="13" y="2" width="3" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
  )},
  { id: 'recomendaciones', label: 'Recomendaciones', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.2 3.2l1.4 1.4M13.4 13.4l1.4 1.4M3.2 14.8l1.4-1.4M13.4 4.6l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
  )},
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
  const map: Record<string, { bg: string; icon: string }> = {
    new:     { bg: '#F5E4E6', icon: '📍' },
    success: { bg: '#E7EFDE', icon: '✅' },
    sent:    { bg: '#F6EFDF', icon: '📨' },
    wait:    { bg: '#EDE7E6', icon: '⏳' },
  }
  const { bg, icon } = map[type] ?? map.wait
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base" style={{ background: bg }}>
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
        const current = stageIdx === stepStage
        const resolved = stageIdx === 3 && i === 2
        let dotBg = '#E7E2E1'
        let dotBorder = '#E7E2E1'
        if (done || resolved) { dotBg = '#4F9A5C'; dotBorder = '#4F9A5C' }
        else if (current) { dotBg = '#7A1E2C'; dotBorder = '#7A1E2C' }
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
  { label: 'Disputas', value: '4', trend: 80 },
  { label: 'Score',    value: '+77', trend: 70 },
  { label: 'Docs',     value: '4',  trend: 60 },
]

const INITIAL_GOALS: Goal[] = [
  { id: '1', title: 'Enviar segunda carta a TransUnion', isCompleted: true },
  { id: '2', title: 'Subir estado de cuenta bancario', isCompleted: false },
  { id: '3', title: 'Agendar revisión de score', isCompleted: false },
]

export default function DashboardPage() {
  const router = useRouter()
  const [activeNav, setActiveNav] = useState('resumen')
  const [toastMsg, setToastMsg] = useState('')
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS)

  useEffect(() => {
    sessionStorage.setItem('mcc_disclosure_done', 'true')
  }, [])

  function flash(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2200)
  }

  const eliminadas = disputes.filter(d => d.result === 'eliminado').length
  const daysSinceUpdate = Math.min(...disputes.map(d => parseInt(daysAgo(d.lastActivity).replace(/\D/g, '') || '0')))

  return (
    <div className="flex min-h-screen bg-[#F7F5F4] font-sans">

      {/* ── SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-52 xl:w-56 bg-white border-r border-[#E7E2E1] shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#E7E2E1]">
          <div className="flex items-center gap-2.5">
            <MccLogo size={34} />
            <span className="font-lora text-base font-medium text-[#241014] leading-tight">My Credit<br/><span className="text-[#7A1E2C]">Café</span></span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeNav === item.id
                  ? 'bg-[#7A1E2C] text-white'
                  : 'text-[#57504E] hover:bg-[#F7F5F4] hover:text-[#241014]'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Plan card */}
        <div className="mx-3 mb-3 p-3.5 rounded-xl bg-[#F5E4E6]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🚀</span>
            <p className="text-sm font-semibold text-[#241014]">Plan Premium</p>
          </div>
          <p className="text-xs text-[#57504E] mb-2 leading-snug">Tienes acceso completo a todas las herramientas.</p>
          <button onClick={() => flash('Beneficios próximamente')} className="text-xs font-semibold text-[#7A1E2C] hover:underline">Ver beneficios →</button>
        </div>

        {/* Support */}
        <div className="mx-3 mb-4 p-3.5 rounded-xl border border-[#E7E2E1]">
          <p className="text-sm font-semibold text-[#241014] mb-0.5">¿Necesitas ayuda?</p>
          <p className="text-xs text-[#57504E] mb-2.5">Estamos aquí para ti.</p>
          <div className="flex -space-x-2 mb-2.5">
            {['#7A1E2C','#4F9A5C','#B8862E'].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ background: c }}>
                {['A','S','M'][i]}
              </div>
            ))}
          </div>
          <button onClick={() => flash('Chat próximamente')} className="w-full py-2 rounded-lg bg-[#241014] text-white text-xs font-semibold hover:bg-[#3a1a1f] transition-colors">
            Chatear con soporte
          </button>
          <p className="text-xs text-[#9C9492] text-center mt-1.5">Respuesta en minutos</p>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-[#E7E2E1] px-6 h-14 flex items-center justify-between shrink-0">
          <h1 className="font-lora text-lg font-medium text-[#241014]">
            Hola, {CLIENT.name} 👋
          </h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-[#57504E] hover:text-[#241014] hover:bg-[#F7F5F4] rounded-lg transition-colors" onClick={() => flash('2 notificaciones')}>
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <path d="M11 2C7.69 2 5 4.69 5 8v5l-2 2v1h16v-1l-2-2V8c0-3.31-2.69-6-6-6z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                <path d="M9 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#7A1E2C] rounded-full text-white text-[9px] font-bold flex items-center justify-center">2</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E7E2E1] hover:bg-[#F7F5F4] transition-colors" onClick={() => flash('Configuración próximamente')}>
              <div className="w-6 h-6 rounded-full bg-[#7A1E2C] flex items-center justify-center text-white text-xs font-bold">MV</div>
              <span className="text-sm text-[#241014] font-medium hidden sm:block">Mi cuenta</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="#57504E" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-5 xl:p-6">

          {/* ── HERO SCORE CARD ── */}
          <div className="rounded-2xl p-6 mb-5 flex flex-col sm:flex-row items-center sm:items-start gap-6" style={{ background: 'linear-gradient(135deg, #5C1520 0%, #7A1E2C 60%, #9B3040 100%)' }}>
            {/* Score */}
            <div className="text-white shrink-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">Tu score de crédito</p>
              <p className="text-7xl font-bold font-lora leading-none mb-1">615</p>
              <p className="text-xl font-medium" style={{ color: '#F4A0A8' }}>Bueno</p>
              <p className="text-xs text-white/50 mt-3">Próxima actualización: 26 jun 2026 ⓘ</p>
            </div>

            {/* Gauge */}
            <div className="shrink-0">
              <svg width="220" height="120" viewBox="0 0 220 120">
                <path d="M20 110 A90 90 0 0 1 200 110" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="16" strokeLinecap="round"/>
                <path d="M20 110 A90 90 0 0 1 200 110" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" strokeLinecap="round" strokeDasharray="283" strokeDashoffset="0"/>
                <path d="M20 110 A90 90 0 0 1 200 110" fill="none" stroke="white" strokeWidth="16" strokeLinecap="round" strokeDasharray="283" strokeDashoffset={283 - 283 * ((615 - 300) / 550)}/>
                <text x="110" y="92" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="system-ui">300</text>
                <text x="110" y="108" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="system-ui">850</text>
              </svg>
            </div>

            {/* Delta */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-green-300 text-lg">↑</span>
                <span className="text-4xl font-bold font-lora" style={{ color: '#6EE7A0' }}>+77</span>
                <div className="ml-1">
                  <p className="text-xs font-bold text-white/80 uppercase tracking-wide">PUNTOS</p>
                  <p className="text-xs text-white/60">desde que comenzamos</p>
                </div>
              </div>
            </div>

            {/* Motivational */}
            <div className="shrink-0 max-w-[200px] bg-white/10 rounded-xl p-4 text-white">
              <p className="text-sm font-bold mb-1.5">⚡ ¡Vas por excelente camino!</p>
              <p className="text-xs text-white/70 leading-snug">Tu dedicación está dando resultados. Seguimos trabajando para llevar tu crédito al siguiente nivel.</p>
            </div>
          </div>

          {/* ── 4 STATS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {[
              { icon: '🛡️', value: disputes.length, label: 'Disputas activas', link: 'Ver detalles' },
              { icon: '📄', value: 4, label: 'Documentos guardados', link: 'Ver vault' },
              { icon: '📈', value: '+77', label: 'Puntos ganados', link: 'Ver historial' },
              { icon: '📅', value: 8, label: 'Días desde última actualización', link: 'Ver calendario' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-[#E7E2E1] p-4 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#F5E4E6] flex items-center justify-center text-lg mb-3">{s.icon}</div>
                <p className="text-3xl font-bold font-lora text-[#241014] mb-0.5">{s.value}</p>
                <p className="text-xs text-[#9C9492] mb-2 leading-tight">{s.label}</p>
                <button className="text-xs font-semibold text-[#7A1E2C] hover:underline" onClick={() => flash(`${s.link} próximamente`)}>{s.link} →</button>
              </div>
            ))}
          </div>

          {/* ── BOTTOM GRID: disputes + activity + vault ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* DISPUTES TABLE */}
            <div className="xl:col-span-1 bg-white rounded-2xl border border-[#E7E2E1] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E7E2E1] flex items-center justify-between">
                <p className="text-sm font-semibold text-[#241014]">Tus disputas activas</p>
                <button className="text-xs font-semibold text-[#7A1E2C] hover:underline" onClick={() => flash('Ver todas próximamente')}>Ver todas →</button>
              </div>
              <div className="divide-y divide-[#F7F5F4]">
                {disputes.map(d => {
                  const pill = getPill(d)
                  const initial = d.creditor.charAt(0).toUpperCase()
                  return (
                    <button
                      key={d.id}
                      onClick={() => router.push(`/disputes/${d.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F7F5F4] transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#241014] flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#241014] truncate">{d.creditor}</p>
                        <p className="text-xs text-[#9C9492] truncate">{d.item}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: pill.bg, color: pill.color }}>
                            {pill.label}
                          </span>
                        </div>
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

            {/* MIDDLE: ACTIVITY + NEXT STEP */}
            <div className="xl:col-span-1 space-y-5">
              {/* Activity */}
              <div className="bg-white rounded-2xl border border-[#E7E2E1] shadow-sm p-5">
                <p className="text-sm font-semibold text-[#241014] mb-4">Actividad reciente esta semana</p>
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
                <button className="mt-4 text-xs font-semibold text-[#7A1E2C] hover:underline" onClick={() => flash('Actividad completa próximamente')}>Ver toda la actividad →</button>
              </div>

              {/* Next step - Advisor card */}
              <div className="bg-white rounded-2xl border border-[#E7E2E1] shadow-sm p-5">
                <p className="text-xs font-semibold text-[#9C9492] uppercase tracking-wide mb-1">Sugerencia de tu asesora</p>
                <p className="text-sm text-[#241014] leading-snug mb-3">
                  Podemos dar seguimiento proactivo a tu disputa con Capital One para acelerar la respuesta de Equifax.
                </p>
                <div className="space-y-1.5 mb-4">
                  {[
                    'Aumenta las probabilidades de respuesta más rápida',
                    'Demuestra seguimiento y perseverancia',
                    'Te mantiene en movimiento hacia tu meta',
                  ].map(b => (
                    <div key={b} className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0"><circle cx="7" cy="7" r="6" fill="#E7EFDE"/><path d="M4 7l2 2 4-3" stroke="#3E6B2E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <p className="text-xs text-[#57504E] leading-snug">{b}</p>
                    </div>
                  ))}
                </div>
                {/* Advisor */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F7F5F4]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B8862E] to-[#7A1E2C] flex items-center justify-center text-white font-bold text-sm shrink-0">AR</div>
                  <div>
                    <p className="text-xs text-[#9C9492]">Tu asesora</p>
                    <p className="text-sm font-semibold text-[#241014]">Andrea Ruiz</p>
                    <p className="text-xs text-[#9C9492]">Especialista en crédito</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[#B8862E] text-xs">★</span>
                      <span className="text-xs font-medium text-[#241014]">4.9</span>
                      <span className="text-xs text-[#9C9492]">(320 reseñas)</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => flash('Solicitud enviada. Andrea te contactará pronto.')}
                  className="w-full py-2.5 rounded-xl bg-[#7A1E2C] text-white text-sm font-semibold hover:bg-[#5C1520] transition-colors"
                >
                  Solicitar seguimiento
                </button>
              </div>
            </div>

            {/* RIGHT: VAULT + MOTIVATIONAL */}
            <div className="xl:col-span-1 space-y-5">
              {/* Vault */}
              <div className="bg-white rounded-2xl border border-[#E7E2E1] shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E7E2E1] flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#241014]">Vault de documentos</p>
                  <button className="text-xs font-semibold text-[#7A1E2C] hover:underline" onClick={() => flash('Ver vault próximamente')}>Ver todos →</button>
                </div>
                <div className="divide-y divide-[#F7F5F4]">
                  {DOCS.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 px-4 py-3">
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
                      <button onClick={() => flash('Descarga próximamente')} className="p-1.5 text-[#9C9492] hover:text-[#241014] transition-colors">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v9M5 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 bg-[#F7F5F4] flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#9C9492" strokeWidth="1.2"/><path d="M7 5v2M7 9v.5" stroke="#9C9492" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <p className="text-xs text-[#9C9492]">Tu información está segura y encriptada.</p>
                </div>
              </div>

              {/* Progress card */}
              <ActivityCard
                metrics={CASE_METRICS}
                dailyGoals={goals}
                onToggleGoal={(id) => setGoals(prev => prev.map(g => g.id === id ? { ...g, isCompleted: !g.isCompleted } : g))}
                onAddGoal={() => flash('Agregar tarea próximamente')}
                onViewDetails={() => flash('Progreso completo próximamente')}
              />
            </div>
          </div>

          {/* ── FINANCIAL SCORE CARDS ── */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[#241014]">Tus scores financieros</p>
              <span className="text-xs text-[#9C9492]">Actualizado hoy</span>
            </div>
            <FinancialScoreCards />
          </div>
        </main>
      </div>

      {toastMsg && <Toast message={toastMsg} onDismiss={() => setToastMsg('')} />}
    </div>
  )
}
