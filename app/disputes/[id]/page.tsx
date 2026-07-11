'use client'

import { useRouter, useParams } from 'next/navigation'
import { disputes, bureauAbbr, STAGE_LABELS_FULL } from '@/lib/data'
import { daysAgo, formatDate } from '@/lib/utils'
import Toast from '@/components/Toast'
import EstimatedResolutionBadge from '@/components/ui/estimated-arrival'
import { useState } from 'react'

function BureauBadge({ bureau }: { bureau: string }) {
  const abbr = bureauAbbr[bureau as keyof typeof bureauAbbr] ?? bureau.slice(0, 2).toUpperCase()
  const colors: Record<string, string> = {
    EX: 'bg-blue-50 text-blue-700 border-blue-200',
    EQ: 'bg-purple-50 text-purple-700 border-purple-200',
    TU: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${colors[abbr] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {abbr}
    </span>
  )
}

function StatusExplainer({ stageIdx, result }: { stageIdx: number; result: string | null }) {
  if (result === 'eliminado') {
    return (
      <div className="bg-[#E7EFDE] rounded-xl p-4">
        <div className="flex items-start gap-2.5">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 mt-0.5">
            <circle cx="10" cy="10" r="9" fill="#4F9A5C" />
            <path d="M6 10.5L8.5 13L14 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-[#3E6B2E]">Item eliminado exitosamente</p>
            <p className="text-xs text-[#6F8F5C] mt-0.5">
              Este item fue removido de tu reporte de crédito. Tu puntaje puede mejorar en las próximas semanas.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (result === 'verificado') {
    return (
      <div className="bg-[#F6EFDF] rounded-xl p-4">
        <div className="flex items-start gap-2.5">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 mt-0.5">
            <circle cx="10" cy="10" r="9" fill="#B8862E" />
            <path d="M10 6v4M10 13.5v.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-[#8A5F1E]">Item verificado por el buró</p>
            <p className="text-xs text-[#B8862E] mt-0.5">
              El buró confirmó que la información es correcta. Podemos explorar otras opciones de disputa.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const explainers = [
    'Hemos identificado este item en tu reporte. Estamos preparando la documentación necesaria.',
    'Hemos enviado la carta de disputa al buró. Ahora esperamos su respuesta oficial.',
    'El buró está revisando tu disputa. Por ley tienen 30 días para responder.',
    'La revisión está completa. Pronto recibirás el resultado final.',
  ]

  return (
    <div className="bg-[#F7F5F4] rounded-xl p-4 border border-[#E7E2E1]">
      <p className="text-sm text-[#57504E] leading-relaxed">{explainers[stageIdx]}</p>
    </div>
  )
}

function StepProgress({ stageIdx, result }: { stageIdx: number; result: string | null }) {
  return (
    <div className="relative">
      {STAGE_LABELS_FULL.map((label, i) => {
        const isCompleted = i < stageIdx
        const isCurrent = i === stageIdx
        const isPending = i > stageIdx

        let circleStyle = 'bg-[#E7E2E1] text-[#9C9492]'
        let textStyle = 'text-[#9C9492]'

        if (isCompleted) {
          circleStyle = 'bg-[#7A1E2C] text-white'
          textStyle = 'text-[#241014]'
        } else if (isCurrent) {
          if (result === 'eliminado') {
            circleStyle = 'bg-[#4F9A5C] text-white'
            textStyle = 'text-[#3E6B2E] font-medium'
          } else if (result === 'verificado') {
            circleStyle = 'bg-[#B8862E] text-white'
            textStyle = 'text-[#8A5F1E] font-medium'
          } else {
            circleStyle = 'bg-[#7A1E2C] text-white ring-4 ring-[#7A1E2C]/20'
            textStyle = 'text-[#7A1E2C] font-medium'
          }
        }

        const isLast = i === STAGE_LABELS_FULL.length - 1

        return (
          <div key={i} className="flex items-start gap-3">
            {/* Left column: circle + line */}
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors ${circleStyle}`}>
                {isCompleted ? (
                  <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                    <path d="M1.5 6L5 9.5L12.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {!isLast && (
                <div className={`w-0.5 h-10 mt-1 ${isCompleted ? 'bg-[#7A1E2C]' : 'bg-[#E7E2E1]'}`} />
              )}
            </div>

            {/* Label */}
            <div className="flex-1 pb-8">
              <p className={`text-sm mt-0.5 ${textStyle}`}>{label}</p>
              {isCurrent && !result && (
                <p className="text-xs text-[#9C9492] mt-0.5">En progreso</p>
              )}
              {isPending && (
                <p className="text-xs text-[#9C9492] mt-0.5">Pendiente</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function DisputeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)
  const [toast, setToast] = useState('')

  const dispute = disputes.find((d) => d.id === id)

  if (!dispute) {
    return (
      <main className="min-h-screen bg-[#F7F5F4] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[#57504E] mb-4">Disputa no encontrada.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#7A1E2C] font-medium text-sm hover:underline"
          >
            Volver al dashboard
          </button>
        </div>
      </main>
    )
  }

  // Estimated resolution: 30 business days from opened date
  const openedMs = new Date(dispute.opened).getTime();
  const estimatedMs = openedMs + 30 * 24 * 60 * 60 * 1000;
  const estimatedDate = new Date(estimatedMs).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
  const bureauMap: Record<string, string> = { EX: 'Buró Experian', EQ: 'Buró Equifax', TU: 'Buró TransUnion' };
  const { bureauAbbr: bAbbr } = { bureauAbbr: { Experian: 'EX', Equifax: 'EQ', TransUnion: 'TU' } as const };
  const bureauKey = (bAbbr as Record<string, string>)[dispute.bureau] ?? 'EX';
  const bureauLabel = bureauMap[bureauKey] ?? dispute.bureau;
  const statusLabel = dispute.result === 'eliminado' ? 'Eliminado' : dispute.result === 'verificado' ? 'Verificado' : 'Activo';

  // Mock timeline
  const timeline = [
    { date: dispute.opened, event: 'Disputa abierta. Item identificado en reporte.' },
    ...(dispute.stageIdx >= 1
      ? [{ date: '2026-05-20', event: 'Carta de disputa enviada al buró.' }]
      : []),
    ...(dispute.stageIdx >= 2
      ? [{ date: '2026-06-01', event: 'Buró confirmó recepción. Revisión en curso.' }]
      : []),
    ...(dispute.stageIdx >= 3 && dispute.result === 'eliminado'
      ? [{ date: dispute.lastActivity, event: 'Resultado: item eliminado del reporte.' }]
      : []),
    ...(dispute.stageIdx >= 3 && dispute.result === 'verificado'
      ? [{ date: dispute.lastActivity, event: 'Resultado: item verificado por el buró.' }]
      : []),
  ]

  const DOCS = dispute.stageIdx >= 1
    ? [{ name: `Carta de disputa — ${dispute.creditor}`, date: '2026-05-20' }]
    : []

  return (
    <main className="min-h-screen bg-[#F7F5F4] max-w-[430px] mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E2E1] px-4 pt-10 pb-4 sticky top-0 z-30">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1 text-sm text-[#57504E] mb-4 hover:text-[#241014] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Mis disputas
        </button>

        <div className="flex items-start gap-2 flex-wrap">
          <h1 className="font-lora text-xl font-medium text-[#241014] flex-1">
            {dispute.creditor}
          </h1>
          <BureauBadge bureau={dispute.bureau} />
        </div>
        <p className="text-sm text-[#57504E] mt-1">{dispute.item}</p>
      </header>

      <div className="px-4 py-5 space-y-5">
        {/* Status explainer */}
        <StatusExplainer stageIdx={dispute.stageIdx} result={dispute.result} />

        {/* Estimated resolution badge — only while dispute is in progress */}
        {!dispute.result && (
          <EstimatedResolutionBadge
            estimatedDate={estimatedDate}
            bureau={bureauLabel}
            status={statusLabel}
          />
        )}

        {/* Progress steps */}
        <div className="bg-white rounded-2xl border border-[#E7E2E1] p-4 shadow-sm">
          <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide mb-4">
            Progreso de disputa
          </p>
          <StepProgress stageIdx={dispute.stageIdx} result={dispute.result} />
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-[#E7E2E1] p-4 shadow-sm">
          <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide mb-4">
            Línea de tiempo
          </p>
          <div className="space-y-4">
            {timeline.map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-[#7A1E2C] mt-1.5 flex-shrink-0" />
                  {i < timeline.length - 1 && (
                    <div className="w-px flex-1 bg-[#E7E2E1] mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-xs text-[#9C9492] mb-0.5">{formatDate(t.date)}</p>
                  <p className="text-sm text-[#241014]">{t.event}</p>
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
          {DOCS.length === 0 ? (
            <p className="text-sm text-[#9C9492]">Aún no hay documentos para esta disputa.</p>
          ) : (
            <div className="space-y-2">
              {DOCS.map((doc, i) => (
                <button
                  key={i}
                  onClick={() => setToast('Descarga no disponible en demo')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F7F5F4] transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#F7F5F4] border border-[#E7E2E1] flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect x="3" y="1" width="11" height="15" rx="1.5" stroke="#7A1E2C" strokeWidth="1.3" />
                      <path d="M6 6h6M6 9h6M6 12h4" stroke="#7A1E2C" strokeWidth="1.2" strokeLinecap="round" />
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
          )}
        </div>

        {/* Request update button */}
        <button
          onClick={() => setToast('Solicitud enviada. Te contactaremos pronto.')}
          className="w-full py-3.5 rounded-xl font-medium text-sm text-white bg-[#7A1E2C] hover:bg-[#5C1520] transition-colors"
        >
          Solicitar actualización
        </button>

        <div className="h-6" />
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast('')} />}
    </main>
  )
}
