'use client';

import { useState } from 'react';
import { Sparkles, Clock, ChevronRight, CheckCircle, X, CreditCard, CalendarCheck, Search } from 'lucide-react';

type Theme = 'dark' | 'light';

const INSIGHTS = [
  {
    id: 1,
    priority: 'high' as const,
    badge: 'HIGH IMPACT',
    badgeColor: '#ab1c42',
    Icon: CreditCard,
    title: 'Pay down $450 on your credit card before Jul 18',
    message: 'Could increase your score by up to 15 points.',
    pts: '+15',
    deadline: 'Jul 18',
    action: 'Take Action',
  },
  {
    id: 2,
    priority: 'medium' as const,
    badge: 'THIS WEEK',
    badgeColor: '#f59e0b',
    Icon: CalendarCheck,
    title: 'Set up autopay for minimum payments',
    message: 'Avoid late payments and protect your score.',
    pts: '+50',
    deadline: 'Jul 22',
    action: 'Set Up',
  },
  {
    id: 3,
    priority: 'low' as const,
    badge: 'OPPORTUNITY',
    badgeColor: '#3b82f6',
    Icon: Search,
    title: 'Dispute 1 account with outdated information',
    message: 'You have a strong case based on our analysis.',
    pts: '+8',
    deadline: null,
    action: 'Review',
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #ab1c4230, #4a082020)' }}>
            <Sparkles size={15} color="#e04a6e" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-wine-500 animate-ping opacity-75" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-wine-500" />
          </div>
          <div>
            <div className={`text-sm font-semibold ${textCls}`}>AI Insights</div>
            <div className={`text-xs ${subCls}`}>Personalized recommendations for you</div>
          </div>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: '#ab1c4222', color: '#e04a6e' }}>
          {visible.length} new
        </span>
      </div>

      {visible.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle size={32} color="#22c55e" className="mx-auto mb-2 opacity-60" />
          <p className={`text-sm ${subCls}`}>All caught up, Elena!</p>
        </div>
      )}

      <div className="space-y-2.5">
        {visible.map(insight => {
          const isOpen = expanded === insight.id;
          const { Icon } = insight;
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
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${insight.badgeColor}18` }}>
                  <Icon size={14} style={{ color: insight.badgeColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${insight.badgeColor}22`, color: insight.badgeColor }}
                    >
                      {insight.badge}
                    </span>
                  </div>
                  <div className={`text-xs font-semibold leading-snug ${textCls}`}>{insight.title}</div>
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
                        <span className="font-medium">Before {insight.deadline}</span>
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

      {visible.length > 0 && (
        <button className={`mt-3 w-full text-center text-xs font-medium hover:text-wine-400 transition-colors ${subCls}`}>
          View all recommendations →
        </button>
      )}
    </div>
  );
}
