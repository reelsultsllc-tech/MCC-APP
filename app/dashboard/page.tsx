'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MccLogo from '@/components/MccLogo'
import ScoreGauge from '@/components/ScoreGauge'
import ScoreChart from '@/components/ScoreChart'
import DisputeCard from '@/components/DisputeCard'
import Toast from '@/components/Toast'
import { disputes, scoreHistory, CLIENT, STAGES } from '@/lib/data'
import { daysAgo, formatDate } from '@/lib/utils'

type Tab = 'resumen' | 'disputas'

const ACTIVITY = [
  { id: 1, icon: '✅', text: 'Portfolio Recovery Associates eliminó tu cuenta de cobranza', date: '2026-06-28', context: 'Experian' },
  { id: 2, icon: '📨', text: 'Carta de disputa enviada a TransUnion — Midland Credit Management', date: '2026-06-18', context: 'TransUnion' },
  { id: 3, icon: '⏳', text: 'Disputa con Capital One en espera de respuesta de Equifax', date: '2026-06-15', context: 'Equifax' },
  { id: 4, icon: '📍', text: 'Nuevo ítem identificado: LVNV Funding — deuda ya pagada', date: '2026-06-30', context: 'Equifax' },
]

const DOCUMENTS = [
  { id: 1, name: 'Carta de disputa — Portfolio Recovery', type: 'PDF', date: '2026-05-06' },
  { id: 2, name: 'Respuesta de Experian', type: 'PDF', date: '2026-06-28' },
  { id: 3, name: 'Carta de disputa — Capital One', type: 'PDF', date: '2026-05-19' },
  { id: 4, name: 'Carta de disputa — Midland Credit', type: 'PDF', date: '2026-06-18' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('resumen')
  const [toastMsg, setToastMsg] = useState('')
  const [showBell, setShowBell] = useState(false)

  useEffect(() => {
    sessionStorage.setItem('mcc_disclosure_done', 'true')
  }, [])

  const totalDisputas = disputes.length
  const cartasEnviadas = disputes.filter((d) => d.stageIdx >= 1).length
  const eliminadas = disputes.filter((d) => d.result === 'eliminado').length
  const nextStepDispute = disputes.find((d) => d.stageIdx === 2 && !d.result)

  function flash(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2200)
  }

  const stats = [
    { value: totalDisputas, label: 'disputas totales' },
    { value: cartasEnviadas, label: 'cartas enviadas' },
    { value: eliminadas, label: 'ítems eliminados' },
  ]

  return (
    <div className="min-h-screen bg-[#F7F5F4]">
      {/* ── TOP NAV ── */}
      <header className="bg-white border-b border-[#E7E2E1] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Left: logo + name */}
          <div className="flex items-center gap-3">
            <MccLogo size={30} />
            <span className="font-lora text-base font-medium text-[#241014] hidden sm:block">My Credit Coffee</span>
          </div>

          {/* Center: tabs (desktop only) */}
          <nav className="hidden md:flex items-center gap-1">
            {(['resumen', 'disputas'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#F5E4E6] text-[#7A1E2C]'
                    : 'text-[#57504E] hover:text-[#241014] hover:bg-[#F7F5F4]'
                }`}
              >
                {tab === 'resumen' ? 'Resumen' : 'Disputas'}
              </button>
            ))}
          </nav>

          {/* Right: bell + avatar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowBell(!showBell)}
                className="p-2 rounded-lg text-[#57504E] hover:text-[#241014] hover:bg-[#F7F5F4] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                  <path d="M11 2C7.69 2 5 4.69 5 8v5l-2 2v1h16v-1l-2-2V8c0-3.31-2.69-6-6-6z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                  <path d="M9 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="15" cy="5" r="4" fill="#7A1E2C" />
                  <text x="15" y="7.2" textAnchor="middle" fontSize="5" fill="white" fontFamily="system-ui" fontWeight="700">3</text>
                </svg>
              </button>

              {showBell && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowBell(false)} />
                  <div className="absolute right-0 top-10 z-40 w-80 bg-white rounded-xl border border-[#E7E2E1] shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E7E2E1]">
                      <p className="text-sm font-semibold text-[#241014]">Notificaciones</p>
                    </div>
                    {ACTIVITY.slice(0, 3).map((n) => (
                      <div key={n.id} className="px-4 py-3 border-b border-[#F7F5F4] hover:bg-[#F7F5F4] transition-colors">
                        <div className="flex items-start gap-3">
                          <span className="text-base mt-0.5">{n.icon}</span>
                          <div>
                            <p className="text-xs text-[#241014] leading-snug">{n.text}</p>
                            <p className="text-xs text-[#9C9492] mt-0.5">{daysAgo(n.date)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-[#E7E2E1]">
              <div className="w-8 h-8 rounded-full bg-[#7A1E2C] flex items-center justify-center text-white text-xs font-semibold">
                MV
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-[#241014] leading-none">{CLIENT.name}</p>
                <p className="text-xs text-[#9C9492] mt-0.5">Cliente desde {CLIENT.memberSince}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden border-t border-[#E7E2E1] flex">
          {(['resumen', 'disputas'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-[#7A1E2C] text-[#7A1E2C]'
                  : 'border-transparent text-[#57504E]'
              }`}
            >
              {tab === 'resumen' ? 'Resumen' : 'Disputas'}
            </button>
          ))}
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── DESKTOP: always show both columns ── */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-5">
            {/* Score gauge */}
            <div className="bg-white rounded-2xl border border-[#E7E2E1] p-5 shadow-sm">
              <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide mb-3">Tu puntaje de crédito</p>
              <div className="flex justify-center">
                <ScoreGauge score={615} label="Bueno" delta="+77 puntos desde que empezamos" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-[#E7E2E1] p-3 text-center shadow-sm">
                  <p className="text-2xl font-semibold text-[#241014] font-lora">{s.value}</p>
                  <p className="text-xs text-[#9C9492] mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Next step */}
            {nextStepDispute && (
              <div className="bg-[#7A1E2C] rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-medium text-white/70 uppercase tracking-wide mb-1">Próximo paso</p>
                <p className="text-white font-medium text-sm mb-0.5">Esperando respuesta</p>
                <p className="text-white/80 text-xs mb-3">{nextStepDispute.creditor}</p>
                <button
                  onClick={() => flash('Solicitud enviada. Tu asesora te contactará pronto.')}
                  className="w-full py-2 rounded-xl bg-white text-[#7A1E2C] text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  Solicitar seguimiento
                </button>
              </div>
            )}

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-[#E7E2E1] p-4 shadow-sm">
              <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide mb-3">Documentos</p>
              <div className="space-y-1">
                {DOCUMENTS.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => flash('Descarga no disponible en demo')}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F7F5F4] transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F5E4E6] flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                        <rect x="3" y="1" width="11" height="15" rx="1.5" stroke="#7A1E2C" strokeWidth="1.3" />
                        <path d="M6 6h6M6 9h6M6 12h4" stroke="#7A1E2C" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#241014] truncate font-medium">{doc.name}</p>
                      <p className="text-xs text-[#9C9492]">{formatDate(doc.date)}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v8M5 8l3 3 3-3" stroke="#9C9492" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (span 2) */}
          <div className="col-span-2 space-y-5">
            {/* Score chart */}
            <div className="bg-white rounded-2xl border border-[#E7E2E1] p-5 shadow-sm">
              <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide mb-3">Historial de puntaje</p>
              <ScoreChart data={scoreHistory} />
            </div>

            {/* Disputes */}
            <div className="bg-white rounded-2xl border border-[#E7E2E1] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E7E2E1] flex items-center justify-between">
                <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide">Tus disputas</p>
                <span className="text-xs text-[#7A1E2C] font-medium">{totalDisputas} activas</span>
              </div>
              <div className="divide-y divide-[#F7F5F4]">
                {disputes.map((d) => (
                  <div key={d.id} className="px-5 py-1">
                    <DisputeCard dispute={d} />
                  </div>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div className="bg-white rounded-2xl border border-[#E7E2E1] p-5 shadow-sm">
              <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide mb-4">Actividad reciente</p>
              <div className="space-y-4">
                {ACTIVITY.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((a) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F7F5F4] flex items-center justify-center text-lg flex-shrink-0">
                      {a.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#241014] leading-snug">{a.text}</p>
                      <p className="text-xs text-[#9C9492] mt-0.5">{a.context} · {daysAgo(a.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE: tabbed layout ── */}
        <div className="md:hidden space-y-4">
          {activeTab === 'resumen' ? (
            <>
              <div className="bg-white rounded-2xl border border-[#E7E2E1] p-5 shadow-sm">
                <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide mb-3">Tu puntaje de crédito</p>
                <div className="flex justify-center">
                  <ScoreGauge score={615} label="Bueno" delta="+77 puntos desde que empezamos" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="bg-white rounded-xl border border-[#E7E2E1] p-3 text-center shadow-sm">
                    <p className="text-2xl font-semibold text-[#241014] font-lora">{s.value}</p>
                    <p className="text-xs text-[#9C9492] mt-0.5 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
              {nextStepDispute && (
                <div className="bg-[#7A1E2C] rounded-2xl p-4 shadow-sm">
                  <p className="text-xs font-medium text-white/70 uppercase tracking-wide mb-1">Próximo paso</p>
                  <p className="text-white font-medium text-sm mb-0.5">Esperando respuesta</p>
                  <p className="text-white/80 text-xs mb-3">{nextStepDispute.creditor}</p>
                  <button onClick={() => flash('Solicitud enviada.')} className="w-full py-2 rounded-xl bg-white text-[#7A1E2C] text-sm font-medium">
                    Solicitar seguimiento
                  </button>
                </div>
              )}
              <div className="bg-white rounded-2xl border border-[#E7E2E1] p-4 shadow-sm">
                <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide mb-3">Historial de puntaje</p>
                <ScoreChart data={scoreHistory} />
              </div>
              <div className="bg-white rounded-2xl border border-[#E7E2E1] p-4 shadow-sm">
                <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide mb-3">Actividad reciente</p>
                <div className="space-y-3">
                  {ACTIVITY.map((a) => (
                    <div key={a.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F7F5F4] flex items-center justify-center text-base flex-shrink-0">{a.icon}</div>
                      <div><p className="text-sm text-[#241014] leading-snug">{a.text}</p><p className="text-xs text-[#9C9492] mt-0.5">{daysAgo(a.date)}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {disputes.map((d) => <DisputeCard key={d.id} dispute={d} />)}
            </div>
          )}
        </div>
      </main>

      {toastMsg && <Toast message={toastMsg} onDismiss={() => setToastMsg('')} />}
    </div>
  )
}
