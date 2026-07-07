// ============================================================
// Mock data — replace these with Supabase queries when ready
// ============================================================

export type Bureau = 'Experian' | 'Equifax' | 'TransUnion'
export type BureauAbbr = 'EX' | 'EQ' | 'TU'

export type DisputeResult = 'eliminado' | 'verificado' | null

export interface Dispute {
  id: number
  creditor: string
  item: string
  bureau: Bureau
  stageIdx: number // 0=Identificado, 1=Enviado, 2=En revisión, 3=Resuelta
  result: DisputeResult
  opened: string
  lastActivity: string
}

export interface ScorePoint {
  m: string
  score: number
}

export interface TeamCase {
  id: number
  clientName: string
  creditor: string
  item: string
  stageIdx: number
  result: DisputeResult
  lastActivity: string
  assignedTo: string
}

export const STAGES = [
  'Identificado',
  'Enviado',
  'En revisión',
  'Resuelta',
]

export const STAGE_LABELS_FULL = [
  'Item identificado',
  'Carta enviada',
  'En espera de respuesta',
  'Resultado',
]

export const bureauAbbr: Record<Bureau, BureauAbbr> = {
  Experian: 'EX',
  Equifax: 'EQ',
  TransUnion: 'TU',
}

export const CLIENT = {
  name: 'Marisol Vega',
  memberSince: 'may 2026',
  phone: 'any',
}

export const disputes: Dispute[] = [
  {
    id: 1,
    creditor: 'Portfolio Recovery Associates',
    item: 'Cuenta de cobranza',
    bureau: 'Experian',
    stageIdx: 3,
    result: 'eliminado',
    opened: '2026-05-02',
    lastActivity: '2026-06-28',
  },
  {
    id: 2,
    creditor: 'Capital One',
    item: 'Pago reportado con retraso',
    bureau: 'Equifax',
    stageIdx: 2,
    result: null,
    opened: '2026-05-15',
    lastActivity: '2026-06-15',
  },
  {
    id: 3,
    creditor: 'Midland Credit Management',
    item: 'Cuenta duplicada',
    bureau: 'TransUnion',
    stageIdx: 1,
    result: null,
    opened: '2026-06-10',
    lastActivity: '2026-06-18',
  },
  {
    id: 4,
    creditor: 'LVNV Funding',
    item: 'Deuda ya pagada reportada como pendiente',
    bureau: 'Equifax',
    stageIdx: 0,
    result: null,
    opened: '2026-06-30',
    lastActivity: '2026-06-30',
  },
]

export const scoreHistory: ScorePoint[] = [
  { m: 'feb', score: 538 },
  { m: 'mar', score: 552 },
  { m: 'abr', score: 561 },
  { m: 'may', score: 578 },
  { m: 'jun', score: 598 },
  { m: 'jul', score: 615 },
]

export const teamCases: TeamCase[] = [
  {
    id: 101,
    clientName: 'Marisol Vega',
    creditor: 'Portfolio Recovery Associates',
    item: 'Cuenta de cobranza',
    stageIdx: 3,
    result: 'eliminado',
    lastActivity: '2026-06-28',
    assignedTo: 'Dana',
  },
  {
    id: 102,
    clientName: 'Marisol Vega',
    creditor: 'Capital One',
    item: 'Pago reportado con retraso',
    stageIdx: 2,
    result: null,
    lastActivity: '2026-06-15',
    assignedTo: 'Dana',
  },
  {
    id: 103,
    clientName: 'Marisol Vega',
    creditor: 'Midland Credit Management',
    item: 'Cuenta duplicada',
    stageIdx: 1,
    result: null,
    lastActivity: '2026-06-18',
    assignedTo: 'Dana',
  },
  {
    id: 104,
    clientName: 'Marisol Vega',
    creditor: 'LVNV Funding',
    item: 'Deuda ya pagada',
    stageIdx: 0,
    result: null,
    lastActivity: '2026-06-30',
    assignedTo: 'Dana',
  },
  {
    id: 105,
    clientName: 'Jonathan Reyes',
    creditor: 'Centro Médico Regional',
    item: 'Cuenta médica en cobranza',
    stageIdx: 1,
    result: null,
    lastActivity: '2026-07-01',
    assignedTo: 'Sam',
  },
  {
    id: 106,
    clientName: 'Jonathan Reyes',
    creditor: 'Bank of America',
    item: 'Línea de crédito cerrada incorrectamente',
    stageIdx: 2,
    result: null,
    lastActivity: '2026-05-10',
    assignedTo: 'Sam',
  },
  {
    id: 107,
    clientName: 'Ana Torres',
    creditor: 'Synchrony Bank',
    item: 'Pago reportado con retraso',
    stageIdx: 0,
    result: null,
    lastActivity: '2026-07-04',
    assignedTo: 'Mike',
  },
  {
    id: 108,
    clientName: 'Ana Torres',
    creditor: 'Discover',
    item: 'Cuenta marcada como fraudulenta',
    stageIdx: 3,
    result: 'verificado',
    lastActivity: '2026-06-25',
    assignedTo: 'Mike',
  },
  {
    id: 109,
    clientName: 'Luis Domínguez',
    creditor: 'Convergent Outsourcing',
    item: 'Cuenta de cobranza',
    stageIdx: 1,
    result: null,
    lastActivity: '2026-06-01',
    assignedTo: 'Dana',
  },
]

// A case is "stalled" if lastActivity is more than 21 days ago and stage is not resolved
export function isStalled(c: TeamCase): boolean {
  if (c.stageIdx === 3) return false
  const last = new Date(c.lastActivity)
  const now = new Date('2026-07-06')
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays > 21
}
