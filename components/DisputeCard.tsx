'use client'

import { useRouter } from 'next/navigation'
import { Dispute, bureauAbbr, STAGES } from '@/lib/data'
import { daysAgo } from '@/lib/utils'

interface DisputeCardProps {
  dispute: Dispute
}

function StatusPill({ stageIdx, result }: { stageIdx: number; result: string | null }) {
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
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F7F5F4] text-[#7A1E2C] border border-[#E7E2E1]">
      {STAGES[stageIdx]}
    </span>
  )
}

function BureauBadge({ bureau }: { bureau: Dispute['bureau'] }) {
  const abbr = bureauAbbr[bureau]
  const colors: Record<string, string> = {
    EX: 'bg-blue-50 text-blue-700 border-blue-200',
    EQ: 'bg-purple-50 text-purple-700 border-purple-200',
    TU: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${colors[abbr]}`}
    >
      {abbr}
    </span>
  )
}

function MiniProgress({ stageIdx, result }: { stageIdx: number; result: string | null }) {
  const total = 4
  return (
    <div className="flex items-center gap-1 mt-2">
      {Array.from({ length: total }).map((_, i) => {
        const filled = i <= stageIdx
        const isLast = stageIdx === total - 1
        let bg = 'bg-[#E7E2E1]'
        if (filled && isLast && result === 'eliminado') bg = 'bg-[#4F9A5C]'
        else if (filled && isLast && result === 'verificado') bg = 'bg-[#B8862E]'
        else if (filled) bg = 'bg-[#7A1E2C]'
        return <div key={i} className={`h-1.5 flex-1 rounded-full ${bg}`} />
      })}
    </div>
  )
}

export default function DisputeCard({ dispute }: DisputeCardProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(`/disputes/${dispute.id}`)}
      className="w-full text-left bg-white rounded-xl border border-[#E7E2E1] p-4 shadow-sm active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-[#241014] text-sm truncate">
              {dispute.creditor}
            </span>
            <BureauBadge bureau={dispute.bureau} />
          </div>
          <p className="text-xs text-[#57504E] mt-0.5 truncate">{dispute.item}</p>
        </div>
        <StatusPill stageIdx={dispute.stageIdx} result={dispute.result} />
      </div>

      <MiniProgress stageIdx={dispute.stageIdx} result={dispute.result} />

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-[#9C9492]">{daysAgo(dispute.lastActivity)}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 12L10 8L6 4" stroke="#9C9492" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  )
}
