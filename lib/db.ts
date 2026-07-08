import { supabase } from './supabase'
import type { DisputeResult } from './data'

export interface DbClient {
  id: string
  phone: string
  full_name: string
  since_date: string
  first_login_done: boolean
}

export interface DbDispute {
  id: number
  client_id: string
  creditor: string
  item: string
  bureau: string
  stage_idx: number
  result: DisputeResult
  opened_at: string
  last_activity_at: string
  assigned_to: string | null
}

export interface DbTimelineEvent {
  id: number
  dispute_id: number
  event_date: string
  event_text: string
}

export interface DbDocument {
  id: number
  dispute_id: number
  name: string
  doc_date: string
  file_type: string
  size: string | null
  storage_path: string | null
}

export interface DbScorePoint {
  month_label: string
  score: number
  recorded_at: string
}

export interface DbActivityEvent {
  id: number
  event_date: string
  event_time: string | null
  event_text: string
  context: string | null
}

export async function getClientByPhone(phone: string): Promise<DbClient | null> {
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('phone', `+1${phone}`)
    .single()
  return data ?? null
}

export async function markFirstLoginDone(clientId: string): Promise<void> {
  await supabase
    .from('clients')
    .update({ first_login_done: true })
    .eq('id', clientId)
}

export async function getDisputesByClient(clientId: string): Promise<DbDispute[]> {
  const { data } = await supabase
    .from('disputes')
    .select('*')
    .eq('client_id', clientId)
    .order('opened_at', { ascending: true })
  return data ?? []
}

export async function getDisputeWithDetails(disputeId: number) {
  const [{ data: dispute }, { data: timeline }, { data: documents }] = await Promise.all([
    supabase.from('disputes').select('*').eq('id', disputeId).single(),
    supabase.from('dispute_timeline').select('*').eq('dispute_id', disputeId).order('event_date'),
    supabase.from('dispute_documents').select('*').eq('dispute_id', disputeId).order('doc_date'),
  ])
  return { dispute: dispute ?? null, timeline: timeline ?? [], documents: documents ?? [] }
}

export async function getScoreHistory(clientId: string): Promise<DbScorePoint[]> {
  const { data } = await supabase
    .from('score_history')
    .select('month_label, score, recorded_at')
    .eq('client_id', clientId)
    .order('recorded_at', { ascending: true })
  return data ?? []
}

export async function getActivityLog(clientId: string): Promise<DbActivityEvent[]> {
  const { data } = await supabase
    .from('activity_log')
    .select('*')
    .eq('client_id', clientId)
    .order('event_date', { ascending: false })
    .limit(10)
  return data ?? []
}

export async function getAllDisputesForTeam() {
  const { data } = await supabase
    .from('disputes')
    .select('*, clients(full_name)')
    .order('last_activity_at', { ascending: false })
  return data ?? []
}

export async function updateDisputeStage(
  disputeId: number,
  stageIdx: number,
  result: DisputeResult,
  newTimelineText?: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  await supabase
    .from('disputes')
    .update({
      stage_idx: stageIdx,
      result: stageIdx === 3 ? result : null,
      last_activity_at: today,
    })
    .eq('id', disputeId)

  if (newTimelineText) {
    await supabase.from('dispute_timeline').insert({
      dispute_id: disputeId,
      event_date: today,
      event_text: newTimelineText,
    })
  }
}
