'use client';

import { useState } from 'react';
import { Sliders, TrendingUp, TrendingDown, Zap } from 'lucide-react';

type Theme = 'dark' | 'light';

const ACTIONS = [
  {
    id: 'payDebt',
    label: 'Pagar deuda de tarjeta',
    icon: '💳',
    effect: (v: number) => Math.round((v / 100) * 1.9),
    unit: '$',
    min: 0, max: 5000, step: 50, defaultVal: 1000,
    positive: true,
    formatVal: (v: number) => `$${v.toLocaleString()}`,
  },
  {
    id: 'delayPayment',
    label: 'Atrasar un pago',
    icon: '⏰',
    effect: (v: number) => -Math.round(v * 1.6),
    unit: 'días',
    min: 0, max: 90, step: 5, defaultVal: 30,
    positive: false,
    formatVal: (v: number) => `${v} días`,
  },
  {
    id: 'newCard',
    label: 'Abrir nueva tarjeta',
    icon: '🆕',
    effect: (v: number) => -v * 11,
    unit: 'tarjeta(s)',
    min: 0, max: 3, step: 1, defaultVal: 1,
    positive: false,
    formatVal: (v: number) => `${v} tarjeta${v !== 1 ? 's' : ''}`,
  },
  {
    id: 'closeAccount',
    label: 'Cerrar cuenta antigua',
    icon: '🔒',
    effect: (v: number) => -v * 17,
    unit: 'cuenta(s)',
    min: 0, max: 3, step: 1, defaultVal: 1,
    positive: false,
    formatVal: (v: number) => `${v} cuenta${v !== 1 ? 's' : ''}`,
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
    const defDelta = a.effect(a.defaultVal);
    setSliderVal(a.defaultVal);
    onDeltaChange(defDelta);
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
          <div className={`text-sm font-semibold ${textCls}`}>Simulador What-If</div>
          <div className={`text-xs ${subCls}`}>Simula el impacto en tu score</div>
        </div>
      </div>

      {/* action grid */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {ACTIONS.map(a => (
          <button
            key={a.id}
            onClick={() => handleActionChange(a.id)}
            className="px-3 py-2.5 rounded-xl text-xs font-medium text-left border transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: activeId === a.id ? 'rgba(171,28,66,0.15)' : bg,
              borderColor: activeId === a.id ? '#ab1c42' : border,
              color: activeId === a.id ? '#e04a6e' : (dark ? 'rgba(249,208,216,0.5)' : '#7a3045'),
              boxShadow: activeId === a.id ? '0 0 12px rgba(171,28,66,0.2)' : 'none',
            }}
          >
            <span className="mr-1">{a.icon}</span>{a.label}
          </button>
        ))}
      </div>

      {/* slider */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-xs ${subCls}`}>{action.label}</span>
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
          <span className={`text-xs ${subCls}`}>{action.min === 0 ? (action.unit === '$' ? '$0' : `0 ${action.unit}`) : action.min}</span>
          <span className={`text-xs ${subCls}`}>{action.unit === '$' ? `$${action.max.toLocaleString()}` : `${action.max} ${action.unit}`}</span>
        </div>
      </div>

      {/* result */}
      <div
        className="rounded-xl p-4 flex items-center justify-between border transition-all duration-300"
        style={{
          background: delta > 0 ? 'rgba(34,197,94,0.08)' : delta < 0 ? 'rgba(239,68,68,0.08)' : bg,
          borderColor: delta > 0 ? 'rgba(34,197,94,0.4)' : delta < 0 ? 'rgba(239,68,68,0.4)' : border,
        }}
      >
        <div>
          <div className={`text-xs ${subCls} mb-0.5`}>Score proyectado</div>
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
        <div className="text-right">
          {delta === 0 ? (
            <div className={`text-xs ${subCls} max-w-28 leading-relaxed`}>
              <Zap size={12} className="inline mb-0.5 mr-1" />Mueve el slider
            </div>
          ) : (
            <div
              className="text-xs font-medium max-w-32 leading-relaxed"
              style={{ color: delta > 0 ? '#22c55e' : '#ef4444' }}
            >
              {delta > 0
                ? `Score sube a ${projected} con esta acción`
                : `Score baja a ${projected} con esta acción`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
