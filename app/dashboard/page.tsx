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

// Notifications mock
const NOTIFICATIONS = [
  { id: 1, icon: '📄', text: 'Carta enviada a Experian para Portfolio Recovery', date: '2026-06-28' },
  { id: 2, icon: '✅', text: 'Item eliminado: Portfolio Recovery Associates', date: '2026-06-28' },
  { id: 3, icon: '📬', text: 'Disputa abierta: Capital One — Equifax', date: '2026-05-15' },
]

const DOCUMENTS = [
  { id: 1, name: 'Carta de disputa — Portfolio Recovery', type: 'PDF', date: '2026-06-01' },
  { id: 2, name: 'Carta de disputa — Capital One', type: 'PDF', date: '2026-05-20' },
  { id: 3, name: 'Reporte de crédito inicial', type: 'PDF', date: '2026-05-02' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('resumen')
  const [toastMsg, setToastMsg] = useState('')
  const [showBell, setShowBell] = useState(false)

  useEffect(() => {
    // Guard: must have completed disclosure
    const done = sessionStorage.getItem('mcc_disclosure_done')
    if (!done) {
      // For demo convenience, set it so users can access dashboard directly
      sessionStorage.setItem('mcc_disclosure_done', 'true')
    }
  }, [])

  // Stats
  const totalDisputas = disputes.length
  const cartasEnviadas = disputes.filter((d) => d.stageIdx >= 1).length
  const eliminadas = disputes.filter((d) => d.result === 'eliminado').length

  // Next step: find first dispute in stage 2 (En revisión)
  const nextStepDispute = disputes.find((d) => d.stageIdx === 2 && !d.result)

  function handleSolicitar() {
    setToastMsg('Solicitud de seguimiento enviada')
  }

  return (
    <main className="min-h-screen bg-[#F7F5F4] max-w-[430px] mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E2E1] px-4 pt-10 pb-0 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MccLogo size={32} />
            <span className="font-lora text-sm font-medium text-[#241014]">MCC</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Bell */}
            <button
              onClick={() => setShowBell(!showBell)}
              className="relative p-1.5 text-[#57504E] hover:text-[#241014] transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2C7.69 2 5 4.69 5 8v5l-2 2v1h16v-1l-2-2V8c0-3.31-2.69-6-6-6z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                <path d="M9 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="15" cy="5" r="3.5" fill="#7A1E2C" />
                <text x="15" y="7" textAnchor="middle" fontSize="5" fill="white" fontFamily="system-ui" fontWeight="700">3</text>
              </svg>
            </button>
            {/* Account */}
            <button className="w-8 h-8 rounded-full bg-[#7A1E2C] flex items-center justify-center text-white text-xs font-semibold">
              MV
            </button>
          </div>
        </div>

        {/* Client info */}
        <div className="mb-4">
          <h1 className="font-lora text-xl font-medium text-[#241014]">{CLIENT.name}</h1>
          <p className="text-xs text-[#9C9492]">Cliente desde {CLIENT.memberSince}</p>
        </div>

        {/* Tabs */}
        <nav className="flex border-b border-[#E7E2E1] -mx-4 px-4">
          {(['resumen', 'disputas'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-1 py-3 text-sm font-medium capitalize transition-colors border-b-2
                ${activeTab === tab
                  ? 'border-[#7A1E2C] text-[#7A1E2C]'
                  : 'border-transparent text-[#57504E] hover:text-[#241014]'
                }
              `}
            >
              {tab === 'resumen' ? 'Resumen' : 'Disputas'}
            </button>
          ))}
        </nav>
      </header>

      {/* Notification dropdown */}
      {showBell && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setShowBell(false)} />
          <div className="absolute top-[140px] right-4 z-40 w-72 bg-white rounded-xl border border-[#E7E2E1] shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E7E2E1]">
              <p className="text-sm font-medium text-[#241014]">Notificaciones</p>
            </div>
            {NOTIFICATIONS.map((n) => (
              <div key={n.id} className="px-4 py-3 border-b border-[#F7F5F4] hover:bg-[#F7F5F4] transition-colors">
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5">{n.icon}</span>
                  <div>
                    <p className="text-xs text-[#241014]">{n.text}</p>
                    <p className="text-xs text-[#9C9492] mt-0.5">{daysAgo(n.date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Content */}
      <div className="px-4 py-5 space-y-5">
        {activeTab === 'resumen' ? (
          <>
            {/* Score Gauge card */}
            <div className="bg-white rounded-2xl border border-[#E7E2E1] p-5 shadow-sm">
              <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide mb-3">
                Tu puntaje de crédito
              </p>
              <div className="flex justify-center">
                <ScoreGauge
                  score={615}
                  label="Bueno"
                  delta="+77 puntos desde que empezamos"
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: totalDisputas, label: 'disputas' },
                { value: cartasEnviadas, label: 'cartas enviadas' },
                { value: eliminadas, label: 'eliminada' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl border border-[#E7E2E1] p-3 text-center shadow-sm"
                >
                  <p className="text-2xl font-semibold text-[#241014] font-lora">{stat.value}</p>
                  <p className="text-xs text-[#9C9492] mt-0.5 leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Next step card */}
            {nextStepDispute && (
              <div className="bg-[#7A1E2C] rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-medium text-white/70 uppercase tracking-wide mb-1">
                  Próximo paso
                </p>
                <p className="text-white font-medium text-sm mb-0.5">
                  Estamos esperando respuesta
                </p>
                <p className="text-white/80 text-xs mb-3">
                  {nextStepDispute.creditor}
                </p>
                <button
                  onClick={handleSolicitar}
                  className="w-full py-2.5 rounded-xl bg-white text-[#7A1E2C] text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  Solicitar seguimiento
                </button>
              </div>
            )}

            {/* Score history chart */}
            <div className="bg-white rounded-2xl border border-[#E7E2E1] p-4 shadow-sm">
              <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide mb-3">
                Historial de puntaje
              </p>
              <ScoreChart data={scoreHistory} />
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-2xl border border-[#E7E2E1] p-4 shadow-sm">
              <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide mb-3">
                Actividad reciente
              </p>
              <div className="space-y-3">
                {NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F7F5F4] flex items-center justify-center text-base flex-shrink-0">
                      {n.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#241014] leading-snug">{n.text}</p>
                      <p className="text-xs text-[#9C9492] mt-0.5">{daysAgo(n.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-[#E7E2E1] p-4 shadow-sm">
              <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide mb-3">
                Documentos
              </p>
              <div className="space-y-2">
                {DOCUMENTS.map((doc) => (
                  <button
                    key={doc.id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F7F5F4] transition-colors text-left"
                    onClick={() => setToastMsg('Descarga no disponible en demo')}
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#F7F5F4] border border-[#E7E2E1] flex items-center justify-center flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="3" y="1" width="11" height="15" rx="1.5" stroke="#7A1E2C" strokeWidth="1.3" />
                        <path d="M6 6h6M6 9h6M6 12h4" stroke="#7A1E2C" strokeWidth="1.2" strokeLinecap="round" />
                        <text x="3" y="17.5" fontSize="3.5" fill="#7A1E2C" fontFamily="system-ui" fontWeight="700">PDF</text>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#241014] truncate">{doc.name}</p>
                      <p className="text-xs text-[#9C9492]">{formatDate(doc.date)}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v8M5 8l3 3 3-3" stroke="#9C9492" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Disputes tab */}
            <div className="space-y-3">
              {disputes.map((d) => (
                <DisputeCard key={d.id} dispute={d} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <Toast message={toastMsg} onDismiss={() => setToastMsg('')} />
      )}
    </main>
  )
}
