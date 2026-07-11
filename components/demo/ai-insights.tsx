'use client';

import { useState } from 'react';
import { Sparkles, Clock, ChevronRight, CheckCircle, X } from 'lucide-react';

type Theme = 'dark' | 'light';

const INSIGHTS = [
  {
    id: 1,
    priority: 'high' as const,
    badge: 'URGENTE',
    badgeColor: '#ef4444',
    icon: '💳',
    title: 'Reduce tu saldo ahora',
    message: 'Elena, si reduces el saldo de tu tarjeta en $450 antes del 18 de julio, tu score podría subir +15 pts',
    pts: '+15',
    deadline: '18 jul',
    action: 'Pagar $450 ahora',
    dismissed: false,
  },
  {
    id: 2,
    priority: 'medium' as const,
    badge: 'ESTA SEMANA',
    badgeColor: '#f59e0b',
    icon: '📅',
    title: 'Activa autopago mínimo',
    message: 'Tienes un pago venciendo el 22 de julio. Configurar autopago evitaría -50 pts por mora',
    pts: '+50',
    deadline: '22 jul',
    action: 'Configurar autopago',
    dismissed: false,
  },
  {
    id: 3,
    priority: 'low' as const,
    badge: 'OPORTUNIDAD',
    badgeColor: '#3b82f6',
    icon: '🔍',
    title: 'Disputa marca antigua',
    message: 'Detectamos una consulta de 2021 potencialmente disputable que podría mejorar tu perfil crediticio',
    pts: '+8',
    deadline: null,
    action: 'Ver disputa',
    dismissed: false,
  },
];

export function AIInsights({ theme }: { theme: Theme }) {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [expanded, setExpanded] = useState<number | null>(1);

  const visible = INSIGHTS.filter(i => !dismissed.includes(i.id));
  const dark = theme === 'dark';
  const textCls = dark ? 'text-white' : 'text-gray-900';
  const subCls = dark ? 'text-wine-200/50' : 'text-wine-800/50';
  const rowBg = dark ? '#150a0d' : '#fff8f9';
  const rowBorder = dark ? 'rgba(74,8,32,0.3)' : '#f0d8dd';

  return (
    <div className="p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #ab1c4230, #4a082020)' }}>
          <Sparkles size={15} color="#e04a6e" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-wine-500 animate-ping opacity-75" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-wine-500" />
        </div>
        <div>
          <div className={`text-sm font-semibold ${textCls}`}>AI Insights</div>
          <div className={`text-xs ${subCls}`}>{visible.length} recomendaciones personalizadas</div>
        </div>
      </div>

      {visible.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle size={32} color="#22c55e" className="mx-auto mb-2 opacity-60" />
          <p className={`text-sm ${subCls}`}>Todo al día, Elena!</p>
        </div>
      )}

      <div className="space-y-2.5">
        {visible.map(insight => {
          const isOpen = expanded === insight.id;
          return (
            <div
              key={insight.id}
              className="rounded-xl border overflow-hidden transition-all duration-300"
              style={{ background: rowBg, borderColor: rowBorder }}
            >
              <button
                className="w-full text-left p-3 flex items-start gap-3"
                onClick={() => setExpanded(isOpen ? null : insight.id)}
              >
                <span className="text-lg leading-none mt-0.5 flex-shrink-0">{insight.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${insight.badgeColor}22`, color: insight.badgeColor }}
                    >
                      {insight.badge}
                    </span>
                    <span className="text-xs font-bold" style={{ color: '#22c55e' }}>{insight.pts} pts</span>
                  </div>
                  <div className={`text-xs font-semibold ${textCls}`}>{insight.title}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <ChevronRight
                    size={13}
                    className="transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', color: dark ? 'rgba(249,208,216,0.35)' : '#9a5060' }}
                  />
                  <button
                    onClick={e => { e.stopPropagation(); setDismissed(d => [...d, insight.id]); }}
                    className="p-0.5 rounded hover:bg-red-500/10 transition-colors"
                  >
                    <X size={11} className="text-wine-400/40 hover:text-red-400" />
                  </button>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 animate-slide-in-up">
                  <p className={`text-xs leading-relaxed mb-3 ${subCls}`}>{insight.message}</p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {insight.deadline && (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: insight.badgeColor }}>
                        <Clock size={11} />
                        <span className="font-medium">Antes del {insight.deadline}</span>
                      </div>
                    )}
                    <button
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:brightness-110 hover:scale-[1.03]"
                      style={{ background: 'linear-gradient(135deg, #ab1c42, #7a1838)' }}
                    >
                      {insight.action}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
