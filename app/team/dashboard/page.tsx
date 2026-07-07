'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { teamCases, isStalled, STAGES, TeamCase, DisputeResult } from '@/lib/data'
import { daysAgo } from '@/lib/utils'
import Toast from '@/components/Toast'
import MccLogo from '@/components/MccLogo'

type FilterKey = 'todos' | 'identificado' | 'enviado' | 'revision' | 'resultado' | 'estancados'

const FILTER_LABELS: { key: FilterKey; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'identificado', label: 'Item identificado' },
  { key: 'enviado', label: 'Carta enviada' },
  { key: 'revision', label: 'En espera' },
  { key: 'resultado', label: 'Resultado' },
  { key: 'estancados', label: 'Estancados' },
]

function stageMatchesFilter(stageIdx: number, filter: FilterKey, stalled: boolean): boolean {
  if (filter === 'todos') return true
  if (filter === 'estancados') return stalled
  const map: Record<FilterKey, number> = {
    todos: -1,
    identificado: 0,
    enviado: 1,
    revision: 2,
    resultado: 3,
    estancados: -1,
  }
  return stageIdx === map[filter]
}

function StageBadge({ stageIdx, result }: { stageIdx: number; result: DisputeResult }) {
  if (result === 'eliminado') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E7EFDE] text-[#3E6B2E]">
        Eliminado
      </span>
    )
  }
  if (result === 'verificado') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F6EFDF] text-[#8A5F1E]">
        Verificado
      </span>
    )
  }
  const colors = [
    'bg-[#F7F5F4] text-[#57504E] border border-[#E7E2E1]',
    'bg-blue-50 text-blue-700',
    'bg-amber-50 text-amber-700',
    'bg-[#F7F5F4] text-[#57504E] border border-[#E7E2E1]',
  ]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[stageIdx]}`}>
      {STAGES[stageIdx]}
    </span>
  )
}

interface UpdateModalProps {
  caseItem: TeamCase
  onClose: () => void
  onSave: (id: number, stageIdx: number, result: DisputeResult) => void
}

function UpdateModal({ caseItem, onClose, onSave }: UpdateModalProps) {
  const [selectedStage, setSelectedStage] = useState(caseItem.stageIdx)
  const [selectedResult, setSelectedResult] = useState<DisputeResult>(caseItem.result)

  function handleSave() {
    onSave(caseItem.id, selectedStage, selectedResult)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E2E1]">
          <div>
            <h3 className="font-lora text-base font-medium text-[#241014]">
              Actualizar caso
            </h3>
            <p className="text-xs text-[#57504E] mt-0.5">
              {caseItem.clientName} · {caseItem.creditor}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#9C9492] hover:text-[#241014] transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M6 6L16 16M16 6L6 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Stage selector */}
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide mb-3">
            Etapa
          </p>
          <div className="space-y-2">
            {STAGES.map((stage, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedStage(i)
                  if (i !== 3) setSelectedResult(null)
                }}
                className={`
                  w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-colors
                  ${selectedStage === i
                    ? 'border-[#7A1E2C] bg-[#7A1E2C]/5'
                    : 'border-[#E7E2E1] hover:border-[#7A1E2C]/40'
                  }
                `}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                  ${selectedStage === i ? 'border-[#7A1E2C]' : 'border-[#E7E2E1]'}`}
                >
                  {selectedStage === i && (
                    <div className="w-2 h-2 rounded-full bg-[#7A1E2C]" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${selectedStage === i ? 'text-[#7A1E2C]' : 'text-[#241014]'}`}>
                    {stage}
                  </p>
                  <p className="text-xs text-[#9C9492]">
                    {['Item encontrado en reporte', 'Carta enviada al buró', 'Esperando respuesta del buró', 'Proceso completado'][i]}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Result selector (only when stage 3) */}
          {selectedStage === 3 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-[#9C9492] uppercase tracking-wide mb-3">
                Resultado
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedResult('eliminado')}
                  className={`
                    p-3 rounded-xl border text-left transition-colors
                    ${selectedResult === 'eliminado'
                      ? 'border-[#4F9A5C] bg-[#E7EFDE]'
                      : 'border-[#E7E2E1] hover:border-[#4F9A5C]/40'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors
                      ${selectedResult === 'eliminado' ? 'border-[#4F9A5C]' : 'border-[#E7E2E1]'}`}
                    >
                      {selectedResult === 'eliminado' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4F9A5C]" />
                      )}
                    </div>
                    <span className={`text-xs font-semibold ${selectedResult === 'eliminado' ? 'text-[#3E6B2E]' : 'text-[#241014]'}`}>
                      Eliminado
                    </span>
                  </div>
                  <p className="text-xs text-[#57504E]">Item removido del reporte</p>
                </button>

                <button
                  onClick={() => setSelectedResult('verificado')}
                  className={`
                    p-3 rounded-xl border text-left transition-colors
                    ${selectedResult === 'verificado'
                      ? 'border-[#B8862E] bg-[#F6EFDF]'
                      : 'border-[#E7E2E1] hover:border-[#B8862E]/40'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors
                      ${selectedResult === 'verificado' ? 'border-[#B8862E]' : 'border-[#E7E2E1]'}`}
                    >
                      {selectedResult === 'verificado' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#B8862E]" />
                      )}
                    </div>
                    <span className={`text-xs font-semibold ${selectedResult === 'verificado' ? 'text-[#8A5F1E]' : 'text-[#241014]'}`}>
                      Verificado
                    </span>
                  </div>
                  <p className="text-xs text-[#57504E]">Buró confirmó la info</p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={handleSave}
            disabled={selectedStage === 3 && !selectedResult}
            className="
              w-full py-3.5 rounded-xl font-medium text-sm text-white
              bg-[#7A1E2C] hover:bg-[#5C1520] transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TeamDashboardPage() {
  const router = useRouter()
  const [cases, setCases] = useState<TeamCase[]>(teamCases)
  const [filter, setFilter] = useState<FilterKey>('todos')
  const [editingCase, setEditingCase] = useState<TeamCase | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('mcc_team_logged_in')
    if (!loggedIn) {
      router.replace('/team/login')
    }
  }, [router])

  const stalledIds = new Set(cases.filter(isStalled).map((c) => c.id))

  const filtered = cases.filter((c) => {
    const stalled = stalledIds.has(c.id)
    return stageMatchesFilter(c.stageIdx, filter, stalled)
  })

  const totalCases = cases.length
  const stalledCount = cases.filter((c) => stalledIds.has(c.id)).length

  function handleUpdate(id: number, stageIdx: number, result: DisputeResult) {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stageIdx, result, lastActivity: '2026-07-06' } : c))
    )
    setToast('Caso actualizado correctamente')
  }

  function handleLogout() {
    sessionStorage.removeItem('mcc_team_logged_in')
    router.push('/team/login')
  }

  return (
    <main className="min-h-screen bg-[#F7F5F4]">
      {/* Top header */}
      <header className="bg-[#241014] px-6 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MccLogo size={36} />
            <div>
              <p className="font-lora text-base font-medium text-white">MCC Team Portal</p>
              <p className="text-xs text-white/40">Panel de gestión de casos</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Salir
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total de casos', value: totalCases, sub: 'en proceso' },
            { label: 'Estancados', value: stalledCount, sub: '> 21 días sin actividad', warn: stalledCount > 0 },
            { label: 'En revisión', value: cases.filter((c) => c.stageIdx === 2).length, sub: 'esperando respuesta' },
            { label: 'Completados', value: cases.filter((c) => c.stageIdx === 3).length, sub: 'con resultado' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-white rounded-2xl border p-4 shadow-sm ${stat.warn ? 'border-amber-300' : 'border-[#E7E2E1]'}`}
            >
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold text-[#241014] font-lora">{stat.value}</p>
                {stat.warn && stat.value > 0 && (
                  <span className="text-amber-500 text-lg">⚠</span>
                )}
              </div>
              <p className="text-xs font-medium text-[#241014] mt-0.5">{stat.label}</p>
              <p className="text-xs text-[#9C9492]">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap mb-5">
          {FILTER_LABELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`
                px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors
                ${filter === key
                  ? 'bg-[#241014] text-white'
                  : 'bg-white text-[#57504E] border border-[#E7E2E1] hover:border-[#241014] hover:text-[#241014]'
                }
                ${key === 'estancados' && stalledCount > 0 ? 'ring-2 ring-amber-300 ring-offset-1' : ''}
              `}
            >
              {label}
              {key === 'estancados' && stalledCount > 0 && (
                <span className="ml-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-xs">
                  {stalledCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-2xl border border-[#E7E2E1] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E7E2E1] bg-[#F7F5F4]">
                {['Cliente', 'Acreedor / Item', 'Etapa', 'Asignado', 'Última actividad', ''].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-[#9C9492] uppercase tracking-wide">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#9C9492]">
                    No hay casos para este filtro.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const stalled = stalledIds.has(c.id)
                  return (
                    <tr
                      key={c.id}
                      className={`border-b border-[#E7E2E1] last:border-0 hover:bg-[#F7F5F4]/50 transition-colors ${stalled ? 'bg-[#FBF7EF]' : ''}`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {stalled && <span className="text-amber-500" title="Estancado">⚠</span>}
                          <div>
                            <p className="text-sm font-medium text-[#241014]">{c.clientName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-[#241014] font-medium">{c.creditor}</p>
                        <p className="text-xs text-[#9C9492]">{c.item}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <StageBadge stageIdx={c.stageIdx} result={c.result} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-[#57504E]">{c.assignedTo}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-sm ${stalled ? 'text-amber-600 font-medium' : 'text-[#57504E]'}`}>
                          {daysAgo(c.lastActivity)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setEditingCase(c)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#7A1E2C]/10 text-[#7A1E2C] hover:bg-[#7A1E2C]/20 transition-colors"
                        >
                          Actualizar
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E7E2E1] p-6 text-center">
              <p className="text-sm text-[#9C9492]">No hay casos para este filtro.</p>
            </div>
          ) : (
            filtered.map((c) => {
              const stalled = stalledIds.has(c.id)
              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-2xl border p-4 shadow-sm ${stalled ? 'border-amber-300 bg-[#FBF7EF]' : 'border-[#E7E2E1]'}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {stalled && <span className="text-amber-500 text-sm">⚠</span>}
                        <p className="text-sm font-semibold text-[#241014]">{c.clientName}</p>
                      </div>
                      <p className="text-xs text-[#57504E]">{c.creditor}</p>
                      <p className="text-xs text-[#9C9492]">{c.item}</p>
                    </div>
                    <StageBadge stageIdx={c.stageIdx} result={c.result} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#9C9492]">
                        {c.assignedTo} · {daysAgo(c.lastActivity)}
                      </span>
                    </div>
                    <button
                      onClick={() => setEditingCase(c)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#7A1E2C]/10 text-[#7A1E2C] hover:bg-[#7A1E2C]/20 transition-colors"
                    >
                      Actualizar
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Update modal */}
      {editingCase && (
        <UpdateModal
          caseItem={editingCase}
          onClose={() => setEditingCase(null)}
          onSave={handleUpdate}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast('')} />}
    </main>
  )
}
