'use client';

import { useState } from 'react';
import { Sparkles, Clock, ChevronRight, ChevronDown, CheckCircle, X, CreditCard, CalendarCheck, Search } from 'lucide-react';

type Theme = 'dark' | 'light';

// No pts projections — descriptions are factual only (CROA §1679b compliance)
const INSIGHTS = [
  {
    id: 1,
    urgency: 'urgent' as const,
    badge: 'HIGH IMPACT',
    badgeColor: '#ab1c42',
    Icon: CreditCard,
    title: 'Reduce tu saldo ahora',
    description: 'Tu utilización en esta tarjeta está en 84%. Te recomendamos bajarla a $450 o menos antes del 18 de julio.',
    deadline: 'Jul 18',
    action: 'Pagar $450 ahora',
  },
  {
    id: 2,
    urgency: 'this_week' as const,
    badge: 'ESTA SEMANA',
    badgeColor: '#f59e0b',
    Icon: CalendarCheck,
    title: 'Activa autopago mínimo',
    description: 'Evita pagos tardíos futuros activando el autopago del mínimo en tus cuentas revolventes.',
    deadline: 'Jul 22',
    action: 'Activar autopago',
  },
  {
    id: 3,
    urgency: 'opportunity' as const,
    badge: 'OPORTUNIDAD',
    badgeColor: '#3b82f6',
    Icon: Search,
    title: 'Disputa marca antigua',
    description: 'Detectamos una cuenta cerrada hace más de 7 años que sigue apareciendo en tu reporte. Es elegible para disputa por antigüedad.',
    deadline: null,
    action: 'Iniciar disputa',
  },
];

export function AIInsights({ theme }: { theme: Theme }) {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [expanded,  setExpanded]  = useState<number | null>(1);
  const [listOpen,  setListOpen]  = useState(false);

  const visible = INSIGHTS.filter(i => !dismissed.includes(i.id));
  const dark    = theme === 'dark';
  const textCls = dark ? 'text-white'           : 'text-gray-900';
  const subCls  = dark ? 'text-wine-200/50'     : 'text-wine-800/50';
  const rowBg   = dark ? '#150a0d'              : '#fff8f9';
  const rowBorder = dark ? 'rgba(74,8,32,0.3)' : '#f0d8dd';

  return (
    <div className="p-5">
      {/* Header — click to toggle list */}
      <button className="w-full flex items-center gap-2.5 mb-4" onClick={() => setListOpen(o => !o)}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center relative flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #ab1c4230, #4a082020)' }}>
          <Sparkles size={15} color="#e04a6e" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-wine-500 animate-ping opacity-75" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-wine-500" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className={`text-sm font-semibold ${textCls}`}>AI Insights</div>
          <div className={`text-xs ${subCls}`}>Recomendaciones personalizadas para ti</div>
        </div>
        {visible.length > 0 && (
          <span className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
            style={{ background: '#ab1c4222', color: '#e04a6e' }}>
            {visible.length} new
          </span>
        )}
        <ChevronDown
          size={15}
          className="flex-shrink-0 transition-transform duration-200"
          style={{
            color: dark ? 'rgba(249,208,216,0.4)' : 'rgba(122,48,69,0.4)',
            transform: listOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {listOpen && visible.length === 0 && (
        <div className="text-center py-8 animate-slide-in-up">
          <CheckCircle size={32} color="#22c55e" className="mx-auto mb-2 opacity-60" />
          <p className={`text-sm ${subCls}`}>¡Todo al día, Elena!</p>
        </div>
      )}

      {listOpen && (
      <div className="space-y-2.5 animate-slide-in-up">
        {visible.map(insight => {
          const isOpen = expanded === insight.id;
          const { Icon } = insight;
          return (
            <div key={insight.id}
              className="rounded-xl border overflow-hidden transition-all duration-300"
              style={{ background: rowBg, borderColor: rowBorder }}>

              <button
                className="w-full text-left p-3 flex items-start gap-3"
                onClick={() => setExpanded(isOpen ? null : insight.id)}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${insight.badgeColor}18` }}>
                  <Icon size={14} style={{ color: insight.badgeColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded mb-1 inline-block"
                    style={{ background: `${insight.badgeColor}22`, color: insight.badgeColor }}>
                    {insight.badge}
                  </span>
                  <div className={`text-xs font-semibold leading-snug ${textCls}`}>{insight.title}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <ChevronRight size={13} className="transition-transform duration-200"
                    style={{
                      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      color: dark ? 'rgba(249,208,216,0.35)' : '#9a5060',
                    }} />
                  <button
                    onClick={e => { e.stopPropagation(); setDismissed(d => [...d, insight.id]); }}
                    className="p-0.5 rounded hover:bg-red-500/10 transition-colors">
                    <X size={11} className="text-wine-400/40 hover:text-red-400" />
                  </button>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 animate-slide-in-up">
                  <p className={`text-xs leading-relaxed mb-3 ${subCls}`}>{insight.description}</p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {insight.deadline && (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: insight.badgeColor }}>
                        <Clock size={11} />
                        <span className="font-medium">Antes del {insight.deadline}</span>
                      </div>
                    )}
                    <button
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:brightness-110 hover:scale-[1.03]"
                      style={{ background: 'linear-gradient(135deg, #ab1c42, #7a1838)' }}>
                      {insight.action}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {listOpen && visible.length > 0 && (
        <button className={`mt-3 w-full text-center text-xs font-medium hover:text-wine-400 transition-colors ${subCls}`}>
          Ver todas las recomendaciones →
        </button>
      )}
    </div>
  );
}
