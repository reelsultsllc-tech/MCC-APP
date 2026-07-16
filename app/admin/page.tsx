'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { teamCases, isStalled, STAGES, DisputeResult } from '@/lib/data'
import { daysAgo } from '@/lib/utils'
import {
  Users, FileText, CreditCard, Settings, LayoutDashboard,
  AlertTriangle, CheckCircle2, Clock, LogOut,
  Search, Bell, BarChart2, ExternalLink, ChevronRight, Star,
  Brain, TrendingUp, TrendingDown, ChevronDown, Sparkles,
} from 'lucide-react'
import { MccLogo, MccLogoIcon } from '@/components/MccLogo'
import AdminProfilePopover from '@/components/AdminProfilePopover'

/* ─── Design tokens ─────────────────────────────────────────────── */

const tk = {
  bg:         '#09030a',
  sidebar:    '#110610',
  card:       'rgba(255,255,255,0.03)',
  cardB:      'rgba(122,30,44,0.35)',
  cardHov:    'rgba(122,30,44,0.10)',
  accent:     '#ab1c42',
  lite:       '#e04a6e',
  text:       'rgba(255,255,255,0.92)',
  muted:      'rgba(249,208,216,0.55)',
  dim:        'rgba(249,208,216,0.28)',
  navAct:     'rgba(171,28,66,0.18)',
  green:      '#a3d080',
  amber:      '#f59e0b',
  red:        '#f87171',
}

/* ─── Mock data ─────────────────────────────────────────────────── */

interface AdminClient {
  id: number; name: string; initials: string; phone: string
  memberSince: string; score: number; scoreDelta: number
  plan: 'Standard' | 'Premier'
  status: 'active' | 'paused' | 'completed'
  disputes: { open: number; resolved: number }
  advisor: string
  paymentStatus: 'current' | 'overdue' | 'paid'
}

const CLIENTS: AdminClient[] = [
  { id:1, name:'Marisol Vega',      initials:'MV', phone:'(555) 100-0001', memberSince:'2026-05-01', score:615, scoreDelta:77,  plan:'Premier',  status:'active',    disputes:{open:3,resolved:1}, advisor:'Dana', paymentStatus:'current' },
  { id:2, name:'Jonathan Reyes',    initials:'JR', phone:'(555) 100-0002', memberSince:'2026-04-15', score:588, scoreDelta:52,  plan:'Standard', status:'active',    disputes:{open:2,resolved:0}, advisor:'Sam',  paymentStatus:'overdue' },
  { id:3, name:'Ana Torres',        initials:'AT', phone:'(555) 100-0003', memberSince:'2026-06-01', score:542, scoreDelta:28,  plan:'Standard', status:'active',    disputes:{open:1,resolved:1}, advisor:'Mike', paymentStatus:'current' },
  { id:4, name:'Luis Domínguez',    initials:'LD', phone:'(555) 100-0004', memberSince:'2026-03-20', score:671, scoreDelta:103, plan:'Premier',  status:'active',    disputes:{open:1,resolved:3}, advisor:'Dana', paymentStatus:'current' },
  { id:5, name:'Carmen Ruiz',       initials:'CR', phone:'(555) 100-0005', memberSince:'2026-02-10', score:714, scoreDelta:145, plan:'Premier',  status:'completed', disputes:{open:0,resolved:5}, advisor:'Sam',  paymentStatus:'paid' },
  { id:6, name:'Roberto Medina',    initials:'RM', phone:'(555) 100-0006', memberSince:'2026-06-15', score:510, scoreDelta:12,  plan:'Standard', status:'active',    disputes:{open:2,resolved:0}, advisor:'Mike', paymentStatus:'current' },
  { id:7, name:'Sandra Gutiérrez',  initials:'SG', phone:'(555) 100-0007', memberSince:'2026-01-05', score:748, scoreDelta:189, plan:'Premier',  status:'completed', disputes:{open:0,resolved:7}, advisor:'Dana', paymentStatus:'paid' },
  { id:8, name:'Miguel Fuentes',    initials:'MF', phone:'(555) 100-0008', memberSince:'2026-05-20', score:561, scoreDelta:38,  plan:'Standard', status:'paused',    disputes:{open:0,resolved:2}, advisor:'Sam',  paymentStatus:'overdue' },
]

const REVENUE = [
  { m:'Feb', v:3200 }, { m:'Mar', v:3800 }, { m:'Abr', v:4200 },
  { m:'May', v:4900 }, { m:'Jun', v:5400 }, { m:'Jul', v:5900 },
]

const ACTIVITY = [
  { id:1, type:'resolved', client:'Marisol Vega',     msg:'Disputa eliminada — Portfolio Recovery',         time:'hace 2h',  icon:'check' },
  { id:2, type:'new',      client:'Roberto Medina',   msg:'Nuevo cliente registrado — Plan Standard',       time:'hace 5h',  icon:'user'  },
  { id:3, type:'overdue',  client:'Jonathan Reyes',   msg:'Pago vencido — contactar cliente',              time:'hace 1d',  icon:'alert' },
  { id:4, type:'score',    client:'Sandra Gutiérrez', msg:'Score alcanzó 748 — meta cumplida',             time:'hace 2d',  icon:'star'  },
  { id:5, type:'stalled',  client:'Luis Domínguez',   msg:'Caso estancado 36d — Convergent Outsourcing',   time:'hace 2d',  icon:'clock' },
]

const PAYMENTS = [
  { id:1, client:'Marisol Vega',     plan:'Premier',  amount:199, date:'2026-07-01', status:'paid'    },
  { id:2, client:'Jonathan Reyes',   plan:'Standard', amount:149, date:'2026-07-05', status:'overdue' },
  { id:3, client:'Ana Torres',       plan:'Standard', amount:149, date:'2026-07-01', status:'paid'    },
  { id:4, client:'Luis Domínguez',   plan:'Premier',  amount:199, date:'2026-07-10', status:'paid'    },
  { id:5, client:'Carmen Ruiz',      plan:'Premier',  amount:199, date:'2026-07-10', status:'paid'    },
  { id:6, client:'Roberto Medina',   plan:'Standard', amount:149, date:'2026-07-15', status:'pending' },
  { id:7, client:'Sandra Gutiérrez', plan:'Premier',  amount:199, date:'2026-07-05', status:'paid'    },
  { id:8, client:'Miguel Fuentes',   plan:'Standard', amount:149, date:'2026-07-20', status:'overdue' },
]

/* ─── Navigation ────────────────────────────────────────────────── */

const NAV = [
  { id:'overview',  label:'Resumen',  Icon:LayoutDashboard },
  { id:'clients',   label:'Clientes', Icon:Users },
  { id:'insights',  label:'IA',       Icon:Brain },
  { id:'disputes',  label:'Disputas', Icon:FileText },
  { id:'payments',  label:'Pagos',    Icon:CreditCard },
  { id:'settings',  label:'Ajustes',  Icon:Settings },
] as const

type Tab = typeof NAV[number]['id']

/* ─── AI Insights data ──────────────────────────────────────────── */

const AI_INSIGHTS = [
  {
    id:1, clientId:2, priority:'urgent' as const,
    client:'Jonathan Reyes',
    category:'Pago vencido',
    insight:'Pago vencido 10 días. Alto riesgo de reporte negativo adicional si no se regulariza esta semana.',
    action:'Llamar al cliente hoy',
    impact:'Previene −40 pts en score',
    impactColor:'#f87171',
  },
  {
    id:2, clientId:1, priority:'high' as const,
    client:'Marisol Vega',
    category:'Disputa estancada',
    insight:'Portfolio Recovery ignoró 2 cartas de validación. Escalamiento al CFPB aumenta tasa de resolución en 73%.',
    action:'Escalar al CFPB',
    impact:'+24 pts estimados al resolver',
    impactColor:'#a3d080',
  },
  {
    id:3, clientId:4, priority:'high' as const,
    client:'Luis Domínguez',
    category:'Caso estancado',
    insight:'Disputa con Convergent Outsourcing lleva 36 días sin movimiento. La ley FDCPA permite demanda por daños estatutarios.',
    action:'Revisar opción legal FDCPA',
    impact:'+15 pts si se elimina',
    impactColor:'#a3d080',
  },
  {
    id:4, clientId:5, priority:'medium' as const,
    client:'Carmen Ruiz',
    category:'Oportunidad de score',
    insight:'Score de 714. A 36 pts de 750, umbral para hipoteca convencional FHA con tasa preferencial.',
    action:'Optimizar utilización de crédito',
    impact:'Meta: 750 en 2-3 meses',
    impactColor:'#60a5fa',
  },
  {
    id:5, clientId:6, priority:'medium' as const,
    client:'Roberto Medina',
    category:'Inicio reciente',
    insight:'Cliente nuevo con score 510. Prioridad: eliminar las 2 colecciones abiertas antes de aplicar nuevas líneas de crédito.',
    action:'Enviar disputas a los 3 bureaus',
    impact:'+30-50 pts estimados',
    impactColor:'#a3d080',
  },
]

const RECOMMENDATIONS = [
  { id:1, title:'Optimizar mezcla de crédito', body:'3 clientes solo tienen tarjetas de crédito. Agregar un préstamo a plazos puede mejorar score promedio +12 pts.', tag:'Portafolio' },
  { id:2, title:'Seguimiento de disputas Q3', body:'6 disputas llevan más de 30 días abiertas. La ley FCRA exige respuesta en 30 días; iniciar escalamiento masivo.', tag:'Urgente' },
  { id:3, title:'Retención de clientes completados', body:'Carmen Ruiz y Sandra Gutiérrez completaron el programa. Ofrecerles plan de mantenimiento antes de que el score decaiga.', tag:'Retención' },
]

/* ─── Micro helpers ─────────────────────────────────────────────── */

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
      style={{ background: 'rgba(122,30,44,0.35)', color: '#f9d0d8' }}>
      {initials}
    </div>
  )
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color, background: bg }}>
      {label}
    </span>
  )
}

/* ─── Overview ──────────────────────────────────────────────────── */

function OverviewSection({ stalledCount }: { stalledCount: number }) {
  const active   = CLIENTS.filter(c => c.status === 'active').length
  const openDis  = teamCases.filter(c => c.stageIdx < 3).length
  const avgDelta = Math.round(CLIENTS.reduce((s, c) => s + c.scoreDelta, 0) / CLIENTS.length)
  const maxRev   = Math.max(...REVENUE.map(r => r.v))
  const stalled  = teamCases.filter(isStalled)

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Clientes activos',  value:active,       sub:'de 8 registrados',          extra:'+2 este mes' },
          { label:'Mejora de score',   value:`+${avgDelta}`, sub:'puntos promedio',          extra:null, color:tk.green },
          { label:'Disputas abiertas', value:openDis,      sub:`${stalledCount} estancadas`, extra:null, color:stalledCount>0?tk.amber:undefined },
          { label:'Ingresos julio',    value:'$5,900',     sub:'↑ 9% vs mes anterior',      extra:'+9%' },
        ].map(k => (
          <motion.div key={k.label} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            className="rounded-2xl border p-4" style={{ background:tk.card, borderColor:tk.cardB }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color:tk.dim }}>{k.label}</p>
            <div className="flex items-end justify-between gap-2">
              <span className="font-lora text-[1.75rem] font-bold leading-none" style={{ color:k.color||tk.text }}>{k.value}</span>
              {k.extra && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full mb-0.5" style={{ background:'rgba(163,208,128,0.15)', color:tk.green }}>
                  {k.extra}
                </span>
              )}
            </div>
            <p className="text-[10.5px] mt-1" style={{ color:tk.muted }}>{k.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        {/* Revenue bars */}
        <div className="rounded-2xl border p-5" style={{ background:tk.card, borderColor:tk.cardB }}>
          <p className="text-sm font-semibold mb-4" style={{ color:tk.text }}>Ingresos mensuales</p>
          <div className="flex items-end gap-2" style={{ height:96 }}>
            {REVENUE.map((r, i) => {
              const isLast = i === REVENUE.length - 1
              return (
                <div key={r.m} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <motion.div className="w-full rounded-t-md"
                    style={{ background: isLast ? 'linear-gradient(to top,#7a1838,#e04a6e)' : 'rgba(122,30,44,0.30)' }}
                    initial={{ height:0, opacity:0 }}
                    animate={{ height:`${Math.round((r.v/maxRev)*88)}%`, opacity:1 }}
                    transition={{ type:'spring', stiffness:260, damping:22, delay:i*0.06 }}
                  />
                  <span className="text-[9px]" style={{ color:tk.dim }}>{r.m}</span>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] mt-2" style={{ color:tk.dim }}>Últimos 6 meses · USD</p>
        </div>

        {/* Activity */}
        <div className="rounded-2xl border p-4" style={{ background:tk.card, borderColor:tk.cardB }}>
          <p className="text-sm font-semibold mb-3" style={{ color:tk.text }}>Actividad reciente</p>
          <div className="space-y-3">
            {ACTIVITY.map(a => (
              <div key={a.id} className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{
                  background: a.type==='resolved'?'rgba(163,208,128,0.15)':a.type==='overdue'||a.type==='stalled'?'rgba(245,158,11,0.12)':'rgba(122,30,44,0.2)',
                }}>
                  {a.icon==='check' && <CheckCircle2 size={11} color={tk.green} />}
                  {a.icon==='alert' && <AlertTriangle size={11} color={tk.amber} />}
                  {a.icon==='clock' && <Clock size={11} color={tk.amber} />}
                  {a.icon==='user'  && <Users size={11} color={tk.lite} />}
                  {a.icon==='star'  && <Star  size={11} color={tk.lite} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium leading-tight" style={{ color:tk.text }}>{a.client}</p>
                  <p className="text-[10px] mt-0.5 leading-tight" style={{ color:tk.muted }}>{a.msg}</p>
                </div>
                <span className="text-[9px] flex-shrink-0" style={{ color:tk.dim }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stalled alert */}
      {stalled.length > 0 && (
        <div className="rounded-2xl border p-4" style={{ background:'rgba(245,158,11,0.05)', borderColor:'rgba(245,158,11,0.28)' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} color={tk.amber} />
            <p className="text-sm font-semibold text-amber-400">{stalled.length} caso{stalled.length>1?'s':''} estancado{stalled.length>1?'s':''} — requieren atención</p>
          </div>
          <div className="space-y-2">
            {stalled.map(c => (
              <div key={c.id} className="flex items-center justify-between text-[11px] py-1.5 border-b last:border-0" style={{ borderColor:'rgba(245,158,11,0.12)' }}>
                <span className="font-medium" style={{ color:tk.text }}>{c.clientName}</span>
                <span style={{ color:tk.muted }}>{c.creditor} · {c.item}</span>
                <span className="font-semibold text-amber-400">{daysAgo(c.lastActivity)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Clients ───────────────────────────────────────────────────── */

function ClientsSection() {
  const [q, setQ] = useState('')
  const filtered = CLIENTS.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.advisor.toLowerCase().includes(q.toLowerCase()))

  const statusStyle = {
    active:    { dot:'#22c55e', text:'#86efac', label:'Activo' },
    paused:    { dot:tk.amber,  text:'#fcd34d', label:'Pausado' },
    completed: { dot:tk.green,  text:tk.green,  label:'Completado' },
  }
  const payStyle = {
    current: { text:'#86efac', label:'Al día' },
    overdue: { text:tk.red,    label:'Vencido' },
    paid:    { text:tk.green,  label:'Pagado' },
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5" style={{ background:tk.card, borderColor:tk.cardB }}>
        <Search size={14} color={tk.dim} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar cliente o asesor..."
          className="flex-1 bg-transparent text-sm outline-none" style={{ color:tk.text }} />
        {q && <button onClick={() => setQ('')} className="text-xs" style={{ color:tk.dim }}>✕</button>}
      </div>

      {/* Chips */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label:`${CLIENTS.filter(c=>c.status==='active').length} activos`,     color:'#86efac' },
          { label:`${CLIENTS.filter(c=>c.paymentStatus==='overdue').length} vencidos`, color:tk.red },
          { label:`${CLIENTS.filter(c=>c.status==='completed').length} completados`, color:tk.green },
        ].map(ch => (
          <span key={ch.label} className="px-2.5 py-1 rounded-full text-[10px] font-semibold border"
            style={{ borderColor:`${ch.color}30`, color:ch.color, background:`${ch.color}10` }}>
            {ch.label}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor:tk.cardB }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background:'rgba(122,30,44,0.12)', borderBottom:`1px solid ${tk.cardB}` }}>
                {['Cliente','Score','Plan','Disputas','Asesor','Pago','Estado',''].map(col => (
                  <th key={col} className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-wider" style={{ color:tk.dim }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const s = statusStyle[c.status]; const p = payStyle[c.paymentStatus]
                return (
                  <motion.tr key={c.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}
                    className="border-b last:border-0 transition-colors cursor-pointer group"
                    style={{ borderColor:tk.cardB }}
                    onMouseEnter={e => (e.currentTarget.style.background=tk.cardHov)}
                    onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={c.initials} />
                        <div>
                          <p className="text-sm font-medium" style={{ color:tk.text }}>{c.name}</p>
                          <p className="text-[10px]" style={{ color:tk.dim }}>{c.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold font-lora" style={{ color:tk.text }}>{c.score}</p>
                      <p className="text-[10px] font-semibold" style={{ color:tk.green }}>+{c.scoreDelta} pts</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={c.plan}
                        color={c.plan==='Premier'?'#d4aa60':tk.muted}
                        bg={c.plan==='Premier'?'rgba(184,134,46,0.18)':'rgba(255,255,255,0.06)'} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm" style={{ color:tk.text }}>{c.disputes.open} abiertas</p>
                      <p className="text-[10px]" style={{ color:tk.dim }}>{c.disputes.resolved} resueltas</p>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color:tk.muted }}>{c.advisor}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold" style={{ color:p.text }}>{p.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background:s.dot }} />
                        <span className="text-xs" style={{ color:s.text }}>{s.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight size={14} color={tk.dim} />
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── Disputes (Kanban) ─────────────────────────────────────────── */

function DisputesSection() {
  const stalledIds = new Set(teamCases.filter(isStalled).map(c => c.id))

  const colStyle = [
    { bg:'rgba(255,255,255,0.03)', accent:'rgba(255,255,255,0.35)' },
    { bg:'rgba(59,130,246,0.07)',  accent:'#60a5fa' },
    { bg:'rgba(245,158,11,0.07)', accent:tk.amber },
    { bg:'rgba(111,143,92,0.08)', accent:tk.green },
  ]

  const resultBadge = (result: DisputeResult) => {
    if (result==='eliminado') return <Badge label="Eliminado" color={tk.green} bg="rgba(111,143,92,0.18)" />
    if (result==='verificado') return <Badge label="Verificado" color="#d4aa60" bg="rgba(184,134,46,0.18)" />
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color:tk.muted }}>
          {teamCases.length} disputas · {stalledIds.size} estancadas
        </p>
        <a href="/team/dashboard" className="flex items-center gap-1 text-xs font-medium" style={{ color:tk.lite }}>
          Panel de equipo <ExternalLink size={11} />
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAGES.map((stage, idx) => {
          const col = colStyle[idx]
          const cases = teamCases.filter(c => c.stageIdx === idx)
          return (
            <div key={stage} className="rounded-2xl border p-3" style={{ background:col.bg, borderColor:tk.cardB }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold" style={{ color:col.accent }}>{stage}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background:'rgba(255,255,255,0.07)', color:tk.muted }}>
                  {cases.length}
                </span>
              </div>
              <div className="space-y-2">
                {cases.length === 0 ? (
                  <p className="text-[10px] text-center py-3" style={{ color:tk.dim }}>Sin casos</p>
                ) : cases.map(c => {
                  const stalled = stalledIds.has(c.id)
                  return (
                    <div key={c.id} className="rounded-xl border p-2.5"
                      style={{ background:'rgba(255,255,255,0.025)', borderColor:stalled?'rgba(245,158,11,0.4)':tk.cardB }}>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <p className="text-[10.5px] font-semibold leading-tight" style={{ color:tk.text }}>{c.clientName}</p>
                        {stalled && <AlertTriangle size={9} color={tk.amber} className="flex-shrink-0 mt-0.5" />}
                      </div>
                      <p className="text-[10px] leading-tight" style={{ color:tk.muted }}>{c.creditor}</p>
                      <p className="text-[9.5px] mt-0.5 leading-tight" style={{ color:tk.dim }}>{c.item}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        {resultBadge(c.result)}
                        <span className="text-[9px]" style={{ color:stalled?tk.amber:tk.dim }}>{daysAgo(c.lastActivity)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── AI Insights ───────────────────────────────────────────────── */

function InsightsSection() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const urgentCount = AI_INSIGHTS.filter(i => i.priority === 'urgent').length

  const priorityStyle = {
    urgent: { color:'#f87171', bg:'rgba(248,113,113,0.12)', label:'Urgente',  border:'rgba(248,113,113,0.35)' },
    high:   { color:tk.amber,  bg:'rgba(245,158,11,0.10)', label:'Alto',      border:'rgba(245,158,11,0.30)' },
    medium: { color:'#60a5fa', bg:'rgba(96,165,250,0.08)', label:'Medio',     border:'rgba(96,165,250,0.25)' },
  }

  return (
    <div className="space-y-6">

      {/* Header banner */}
      <div className="rounded-2xl border p-4 flex items-center gap-3"
        style={{ background:'rgba(171,28,66,0.08)', borderColor:'rgba(171,28,66,0.35)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background:'linear-gradient(135deg,#7A1E2C,#ab1c42)' }}>
          <Sparkles size={16} color="#fff" />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color:tk.text }}>Motor de Inteligencia MCC</p>
          <p className="text-xs" style={{ color:tk.muted }}>
            {urgentCount} alerta{urgentCount!==1?'s':''} urgente{urgentCount!==1?'s':''} · {AI_INSIGHTS.length} recomendaciones activas
          </p>
        </div>
      </div>

      {/* AI Insights — individual alerts */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:tk.dim }}>
          Alertas personalizadas por cliente
        </p>
        <div className="space-y-2">
          {AI_INSIGHTS.map(ins => {
            const s = priorityStyle[ins.priority]
            const open = expanded === ins.id
            return (
              <div key={ins.id} className="rounded-2xl border overflow-hidden transition-all"
                style={{ borderColor: open ? s.border : tk.cardB, background: open ? s.bg : tk.card }}>
                {/* Row */}
                <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  onClick={() => setExpanded(open ? null : ins.id)}>
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: s.bg, border:`1px solid ${s.border}` }}>
                    <Brain size={12} color={s.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color:tk.text }}>{ins.client}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
                        {s.label}
                      </span>
                      <span className="text-[10px]" style={{ color:tk.dim }}>{ins.category}</span>
                    </div>
                    {/* Preview on mobile (collapsed) */}
                    {!open && (
                      <p className="text-[10.5px] mt-0.5 truncate md:hidden" style={{ color:tk.muted }}>{ins.insight}</p>
                    )}
                    {/* Always visible on desktop */}
                    <p className="text-[10.5px] mt-0.5 hidden md:block" style={{ color:tk.muted }}>{ins.insight}</p>
                  </div>
                  <ChevronDown size={14} color={tk.dim}
                    style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.2s', flexShrink:0 }} />
                </button>

                {/* Expanded detail (mobile) / Always visible on desktop */}
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                      exit={{ height:0, opacity:0 }} transition={{ duration:0.18 }}
                      className="md:hidden border-t px-4 py-3" style={{ borderColor:s.border }}>
                      <p className="text-xs mb-3" style={{ color:tk.muted }}>{ins.insight}</p>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold" style={{ color:ins.impactColor }}>{ins.impact}</span>
                        <button className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
                          {ins.action}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action row — always visible on desktop */}
                <div className="hidden md:flex items-center justify-between px-4 pb-3.5 -mt-1">
                  <span className="text-xs font-semibold" style={{ color:ins.impactColor }}>{ins.impact}</span>
                  <button className="text-xs font-bold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                    style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
                    {ins.action}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recomendaciones personalizadas */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:tk.dim }}>
          Recomendaciones personalizadas — Portafolio
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          {RECOMMENDATIONS.map(r => (
            <div key={r.id} className="rounded-2xl border p-4 space-y-2"
              style={{ background:tk.card, borderColor:tk.cardB }}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold leading-tight" style={{ color:tk.text }}>{r.title}</p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background:'rgba(171,28,66,0.18)', color:tk.lite }}>{r.tag}</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color:tk.muted }}>{r.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historial de pagos — expanded desktop / collapsible mobile */}
      <PaymentHistoryBlock />
    </div>
  )
}

/* ─── Payment history (shared block) ───────────────────────────── */

function PaymentHistoryBlock() {
  const [openIds, setOpenIds] = useState<Set<number>>(new Set())
  const collected = PAYMENTS.filter(p => p.status==='paid').reduce((s,p) => s+p.amount, 0)
  const pending   = PAYMENTS.filter(p => p.status!=='paid').reduce((s,p) => s+p.amount, 0)

  const pStyle = {
    paid:    { color:'#86efac', bg:'rgba(134,239,172,0.12)', label:'Pagado' },
    overdue: { color:tk.red,    bg:'rgba(248,113,113,0.12)', label:'Vencido' },
    pending: { color:'#fcd34d', bg:'rgba(252,211,77,0.10)',  label:'Pendiente' },
  } as const

  function toggle(id: number) {
    setOpenIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:tk.dim }}>
        Historial de pagos — Julio 2026
      </p>

      {/* Desktop: full table (always expanded) */}
      <div className="hidden md:block rounded-2xl border overflow-hidden" style={{ borderColor:tk.cardB }}>
        <table className="w-full">
          <thead>
            <tr style={{ background:'rgba(122,30,44,0.12)', borderBottom:`1px solid ${tk.cardB}` }}>
              {['Cliente','Plan','Monto','Fecha de pago','Estado'].map(col => (
                <th key={col} className="text-left px-5 py-3 text-[9px] font-bold uppercase tracking-wider" style={{ color:tk.dim }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAYMENTS.map((p, i) => {
              const s = pStyle[p.status as keyof typeof pStyle]
              return (
                <motion.tr key={p.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}
                  className="border-b last:border-0 transition-colors hover:bg-white/[0.02]" style={{ borderColor:tk.cardB }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ background:'rgba(122,30,44,0.35)', color:'#f9d0d8' }}>
                        {p.client.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <span className="text-sm" style={{ color:tk.text }}>{p.client}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge label={p.plan}
                      color={p.plan==='Premier'?'#d4aa60':tk.muted}
                      bg={p.plan==='Premier'?'rgba(184,134,46,0.18)':'rgba(255,255,255,0.06)'} />
                  </td>
                  <td className="px-5 py-3.5 text-sm font-bold font-lora" style={{ color:tk.text }}>${p.amount}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color:tk.muted }}>{p.date}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color:s.color, background:s.bg }}>{s.label}</span>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: collapsible cards */}
      <div className="md:hidden space-y-2">
        {PAYMENTS.map(p => {
          const s = pStyle[p.status as keyof typeof pStyle]
          const isOpen = openIds.has(p.id)
          return (
            <div key={p.id} className="rounded-2xl border overflow-hidden" style={{ borderColor: isOpen ? 'rgba(122,30,44,0.6)' : tk.cardB, background:tk.card }}>
              <button className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                onClick={() => toggle(p.id)}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background:'rgba(122,30,44,0.35)', color:'#f9d0d8' }}>
                    {p.client.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <span className="text-sm font-medium" style={{ color:tk.text }}>{p.client}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color:s.color, background:s.bg }}>{s.label}</span>
                  <ChevronDown size={13} color={tk.dim} style={{ transform:isOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }} />
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                    exit={{ height:0, opacity:0 }} transition={{ duration:0.18 }}
                    className="border-t px-4 py-3 grid grid-cols-3 gap-3" style={{ borderColor:tk.cardB }}>
                    {[
                      { label:'Plan',  value:p.plan },
                      { label:'Monto', value:`$${p.amount}` },
                      { label:'Fecha', value:p.date },
                    ].map(d => (
                      <div key={d.label}>
                        <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color:tk.dim }}>{d.label}</p>
                        <p className="text-xs font-semibold" style={{ color:tk.text }}>{d.value}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Payments ──────────────────────────────────────────────────── */

function PaymentsSection() {
  const collected = PAYMENTS.filter(p => p.status==='paid').reduce((s,p) => s+p.amount, 0)
  const pending   = PAYMENTS.filter(p => p.status!=='paid').reduce((s,p) => s+p.amount, 0)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Cobrado julio', value:`$${collected.toLocaleString()}`, color:tk.green },
          { label:'Pendiente',     value:`$${pending.toLocaleString()}`,   color:'#fcd34d' },
          { label:'Total mensual', value:`$${(collected+pending).toLocaleString()}`, color:tk.text },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border p-4" style={{ background:tk.card, borderColor:tk.cardB }}>
            <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color:tk.dim }}>{s.label}</p>
            <p className="font-lora text-2xl font-bold" style={{ color:s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <PaymentHistoryBlock />
    </div>
  )
}

/* ─── Settings ──────────────────────────────────────────────────── */

function SettingsSection() {
  const TEAM = [
    { name:'Dana Reyes',  role:'Advisor Senior', cases:4, online:true },
    { name:'Sam Ortiz',   role:'Advisor',        cases:3, online:true },
    { name:'Mike Torres', role:'Advisor',        cases:2, online:false },
  ]
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor:tk.cardB }}>
        <div className="px-4 py-3 border-b" style={{ background:'rgba(122,30,44,0.12)', borderColor:tk.cardB }}>
          <p className="text-sm font-semibold" style={{ color:tk.text }}>Equipo de asesores</p>
        </div>
        {TEAM.map(m => (
          <div key={m.name} className="flex items-center justify-between px-4 py-3.5 border-b last:border-0" style={{ borderColor:tk.cardB }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background:'rgba(122,30,44,0.35)', color:'#f9d0d8' }}>
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                  style={{ background:m.online?'#22c55e':'#6b7280', borderColor:tk.bg }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color:tk.text }}>{m.name}</p>
                <p className="text-[10.5px]" style={{ color:tk.muted }}>{m.role} · {m.cases} casos activos</p>
              </div>
            </div>
            <span className="text-xs" style={{ color:m.online?'#86efac':tk.dim }}>{m.online?'En línea':'Desconectado'}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-5 space-y-3" style={{ background:tk.card, borderColor:tk.cardB }}>
        <p className="text-sm font-semibold mb-1" style={{ color:tk.text }}>Sistema</p>
        {[
          { label:'Admin email',       value:'mycreditcafe2026@gmail.com' },
          { label:'Versión del portal',value:'v2.4.1' },
          { label:'Supabase',          value:'Conectado ✓' },
          { label:'OTP SMS',           value:'Twilio · Activo' },
          { label:'Entorno',           value:'Production' },
        ].map(row => (
          <div key={row.label} className="flex justify-between items-center text-sm pb-2 border-b last:border-0" style={{ borderColor:tk.cardB }}>
            <span style={{ color:tk.muted }}>{row.label}</span>
            <span className="text-xs font-medium" style={{ color:tk.text }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────────────── */

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')

  useEffect(() => {
    if (!sessionStorage.getItem('mcc_admin_session')) router.replace('/admin/login')
  }, [router])

  function logout() {
    sessionStorage.removeItem('mcc_admin_session')
    sessionStorage.removeItem('mcc_admin_email')
    router.push('/admin/login')
  }

  const stalledCount = teamCases.filter(isStalled).length
  const overdueCount = CLIENTS.filter(c => c.paymentStatus === 'overdue').length
  const alertTotal   = stalledCount + overdueCount

  const TITLES: Record<Tab, string> = {
    overview:'Resumen', clients:'Clientes', insights:'IA & Insights', disputes:'Disputas', payments:'Pagos', settings:'Ajustes',
  }

  return (
    <div className="flex min-h-screen" style={{ background:tk.bg }}>

      {/* ── Sidebar desktop ── */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-56 border-r z-30"
        style={{ background:tk.sidebar, borderColor:tk.cardB }}>

        {/* Logo */}
        <div className="px-4 py-5 border-b" style={{ borderColor:tk.cardB }}>
          <MccLogo size="sm" dark={true} />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, Icon }) => {
            const active = tab === id
            const badge  = id==='disputes'?stalledCount : id==='payments'?overdueCount : 0
            return (
              <button key={id} onClick={() => setTab(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
                style={{ background:active?tk.navAct:'transparent', color:active?tk.lite:tk.muted, fontWeight:active?600:400 }}>
                <Icon size={15} />
                <span>{label}</span>
                {badge > 0 && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background:'rgba(245,158,11,0.18)', color:tk.amber }}>{badge}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 py-4 border-t space-y-0.5" style={{ borderColor:tk.cardB }}>
          <a href="/team/dashboard"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            style={{ color:tk.dim }}>
            <ExternalLink size={14} /><span>Portal de Equipo</span>
          </a>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            style={{ color:tk.dim }}
            onMouseEnter={e => (e.currentTarget.style.color=tk.red)}
            onMouseLeave={e => (e.currentTarget.style.color=tk.dim)}>
            <LogOut size={14} /><span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b"
          style={{ background:tk.sidebar, borderColor:tk.cardB }}>
          {/* Left: mobile logo + section title */}
          <div className="flex items-center gap-3">
            <span className="lg:hidden">
              <MccLogoIcon size={24} />
            </span>
            <h1 className="font-lora text-lg font-semibold" style={{ color:tk.text }}>{TITLES[tab]}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={16} color={tk.muted} />
              {alertTotal > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                  style={{ background:'#e04a6e' }}>{alertTotal}</div>
              )}
            </div>
            <AdminProfilePopover onNavigate={(section) => setTab(section as Tab)} />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }}
              transition={{ duration:0.18 }}>
              {tab==='overview'  && <OverviewSection stalledCount={stalledCount} />}
              {tab==='clients'   && <ClientsSection />}
              {tab==='insights'  && <InsightsSection />}
              {tab==='disputes'  && <DisputesSection />}
              {tab==='payments'  && <PaymentsSection />}
              {tab==='settings'  && <SettingsSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom nav mobile ── */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden flex border-t z-20"
        style={{ background:tk.sidebar, borderColor:tk.cardB }}>
        {NAV.map(({ id, label, Icon }) => {
          const active = tab === id
          const badge  = id==='disputes'?stalledCount : id==='payments'?overdueCount : 0
          return (
            <button key={id} onClick={() => setTab(id)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
              style={{ color:active?tk.lite:tk.dim }}>
              <div className="relative">
                <Icon size={17} />
                {badge > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                    style={{ background:tk.amber }}>{badge}</div>
                )}
              </div>
              <span className="text-[9px] font-medium">{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
