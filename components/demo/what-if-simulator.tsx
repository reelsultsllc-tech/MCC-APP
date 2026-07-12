'use client';

import { useState } from 'react';
import { Sliders, TrendingUp, TrendingDown, Zap, CreditCard, Clock, PlusCircle, ShieldOff } from 'lucide-react';

type Theme = 'dark' | 'light';

const ACTIONS = [
  {
    id: 'payDebt',
    label: 'Pay Down Debt',
    question: 'How much would you like to pay down?',
    icon: CreditCard,
    color: '#ab1c42',
    effect: (v: number) => Math.round((v / 100) * 1.9),
    unit: '$',
    min: 0, max: 5000, step: 50, defaultVal: 1000,
    positive: true,
    formatVal: (v: number) => `$${v.toLocaleString()}`,
    insight: (v: number, d: number) => `Paying down $${v.toLocaleString()} could increase your score by ${d} points.`,
  },
  {
    id: 'newCard',
    label: 'Add New Card',
    question: 'How many new cards?',
    icon: PlusCircle,
    color: '#f59e0b',
    effect: (v: number) => -v * 11,
    unit: 'card(s)',
    min: 0, max: 3, step: 1, defaultVal: 1,
    positive: false,
    formatVal: (v: number) => `${v} card${v !== 1 ? 's' : ''}`,
    insight: (v: number, d: number) => `Opening ${v} new card${v !== 1 ? 's' : ''} could lower your score by ${Math.abs(d)} points.`,
  },
  {
    id: 'removeInquiry',
    label: 'Remove Inquiry',
    question: 'Inquiries to dispute',
    icon: ShieldOff,
    color: '#22c55e',
    effect: (v: number) => v * 8,
    unit: 'inquiry(ies)',
    min: 0, max: 5, step: 1, defaultVal: 1,
    positive: true,
    formatVal: (v: number) => `${v} inquir${v !== 1 ? 'ies' : 'y'}`,
    insight: (v: number, d: number) => `Removing ${v} inquir${v !== 1 ? 'ies' : 'y'} could improve your score by ${d} points.`,
  },
  {
    id: 'payOnTime',
    label: 'Pay On Time',
    question: 'Months of on-time payments',
    icon: Clock,
    color: '#3b82f6',
    effect: (v: number) => Math.round(v * 2.4),
    unit: 'months',
    min: 0, max: 24, step: 1, defaultVal: 6,
    positive: true,
    formatVal: (v: number) => `${v} month${v !== 1 ? 's' : ''}`,
    insight: (v: number, d: number) => `${v} months of on-time payments could add ${d} points to your score.`,
  },
];

export function WhatIfSimulator({ baseScore, onDeltaChange, theme }: {
  baseScore: number;
  onDeltaChange: (delta: number) => void;
  theme: Theme;
}) {
  const [activeId, setActiveId] = useState(ACTIONS[0].id);
  const [sliderVal, setSliderVal] = useState(ACTIONS[0].defaultVal);

  const action = ACTIONS.find(a => a.id === activeId)!;
  const delta = action.effect(sliderVal);
  const projected = Math.min(850, Math.max(300, baseScore + delta));
  const pct = ((sliderVal - action.min) / (action.max - action.min)) * 100;

  const handleActionChange = (id: string) => {
    const a = ACTIONS.find(x => x.id === id)!;
    setActiveId(id);
    setSliderVal(a.defaultVal);
    onDeltaChange(a.effect(a.defaultVal));
  };

  const handleSlider = (v: number) => {
    setSliderVal(v);
    onDeltaChange(action.effect(v));
  };

  const dark = theme === 'dark';
  const bg = dark ? '#150a0d' : '#fff8f9';
  const border = dark ? 'rgba(74,8,32,0.35)' : '#f0d8dd';
  const textCls = dark ? 'text-white' : 'text-gray-900';
  const subCls = dark ? 'text-wine-200/50' : 'text-wine-800/50';
  const trackBg = dark ? '#2a1218' : '#f5e0e4';

  return (
    <div className="p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ab1c4230, #4a082020)' }}>
          <Sliders size={15} color="#e04a6e" />
        </div>
        <div>
          <div className={`text-sm font-semibold ${textCls}`}>What-If Simulator</div>
          <div className={`text-xs ${subCls}`}>See how actions may impact your score</div>
        </div>
      </div>

      {/* action tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {ACTIONS.map(a => {
          const Icon = a.icon;
          const isActive = activeId === a.id;
          return (
            <button
              key={a.id}
              onClick={() => handleActionChange(a.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: isActive ? 'rgba(171,28,66,0.15)' : bg,
                borderColor: isActive ? '#ab1c42' : border,
                color: isActive ? '#e04a6e' : (dark ? 'rgba(249,208,216,0.5)' : '#7a3045'),
                boxShadow: isActive ? '0 0 12px rgba(171,28,66,0.2)' : 'none',
              }}
            >
              <Icon size={12} />
              {a.label}
            </button>
          );
        })}
      </div>

      {/* slider */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-xs ${subCls}`}>{action.question}</span>
          <span className="text-sm font-bold" style={{ color: '#e04a6e' }}>
            {action.formatVal(sliderVal)}
          </span>
        </div>
        <div className="relative py-1">
          <input
            type="range"
            min={action.min} max={action.max} step={action.step}
            value={sliderVal}
            onChange={e => handleSlider(Number(e.target.value))}
            className="w-full slider-thumb"
            style={{
              height: '6px',
              borderRadius: '9999px',
              outline: 'none',
              cursor: 'pointer',
              background: `linear-gradient(to right, #ab1c42 0%, #e04a6e ${pct}%, ${trackBg} ${pct}%, ${trackBg} 100%)`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className={`text-xs ${subCls}`}>{action.unit === '$' ? '$0' : `0`}</span>
          <span className={`text-xs ${subCls}`}>{action.unit === '$' ? `$${action.max.toLocaleString()}` : `${action.max}`}</span>
        </div>
      </div>

      {/* result */}
      <div
        className="rounded-xl p-4 flex items-start justify-between gap-4 border transition-all duration-300"
        style={{
          background: delta > 0 ? 'rgba(34,197,94,0.08)' : delta < 0 ? 'rgba(239,68,68,0.08)' : bg,
          borderColor: delta > 0 ? 'rgba(34,197,94,0.4)' : delta < 0 ? 'rgba(239,68,68,0.4)' : border,
        }}
      >
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${subCls}`}>Projected Score</div>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${textCls}`}>{projected}</span>
            {delta !== 0 && (
              <span className={`flex items-center gap-0.5 text-sm font-bold ${delta > 0 ? 'text-green-500' : 'text-red-400'}`}>
                {delta > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {delta > 0 ? '+' : ''}{delta} pts
              </span>
            )}
          </div>
        </div>
        <div className="text-right max-w-36">
          {delta === 0 ? (
            <div className={`text-xs ${subCls} leading-relaxed`}>
              <Zap size={12} className="inline mb-0.5 mr-1" />Move the slider
            </div>
          ) : (
            <>
              <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: delta > 0 ? '#22c55e' : '#ef4444' }}>Insight</div>
              <div className="text-xs leading-relaxed" style={{ color: delta > 0 ? '#22c55e' : '#ef4444' }}>
                {action.insight(sliderVal, Math.abs(delta))}
                {delta > 0 && (
                  <button className="block mt-1.5 text-wine-400/70 hover:text-wine-300 transition-colors text-left">
                    Show details →
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
