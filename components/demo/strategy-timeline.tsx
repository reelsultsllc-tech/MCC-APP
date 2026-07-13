'use client';

import { useState, useEffect } from 'react';
import { Route, CheckCircle2 } from 'lucide-react';

type Theme = 'dark' | 'light';

const STATUSES = [
  { key: 'lead',      label: 'Lead'       },
  { key: 'prospect',  label: 'Prospecto'  },
  { key: 'active',    label: 'Activo'     },
  { key: 'completed', label: 'Completado' },
] as const;

type StatusKey = typeof STATUSES[number]['key'];

// Mock — replace with Zapier webhook data contract:
// { currentStatus, statusHistory: [{ status, date }] }
const TIMELINE_DATA = {
  currentStatus: 'active' as StatusKey,
  statusHistory: [
    { status: 'lead'     as StatusKey, date: '2025-12-01' },
    { status: 'prospect' as StatusKey, date: '2025-12-15' },
    { status: 'active'   as StatusKey, date: '2026-01-05' },
  ],
};

export function StrategyTimeline({ theme }: { theme: Theme }) {
  const [drawn, setDrawn] = useState(false);
  const [tip, setTip]     = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDrawn(true), 400);
    return () => clearTimeout(id);
  }, []);

  const dark      = theme === 'dark';
  const textCls   = dark ? 'text-white'           : 'text-gray-900';
  const subCls    = dark ? 'text-wine-200/50'     : 'text-wine-800/50';
  const rowBg     = dark ? '#150a0d'              : '#fff8f9';
  const rowBorder = dark ? 'rgba(74,8,32,0.3)'   : '#f0d8dd';
  const trackCol  = dark ? '#2a1218'              : '#f0d8dd';

  const currentIdx  = STATUSES.findIndex(s => s.key === TIMELINE_DATA.currentStatus);
  const progressPct = currentIdx / (STATUSES.length - 1);

  const getEntry = (key: string) =>
    TIMELINE_DATA.statusHistory.find(h => h.status === key);

  const fmtLong = (d: string) =>
    new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtShort = (d: string) =>
    new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #ab1c4230, #4a082020)' }}>
          <Route size={15} color="#e04a6e" />
        </div>
        <div>
          <div className={`text-sm font-semibold ${textCls}`}>Strategy Plan</div>
          <div className={`text-xs ${subCls}`}>Tu progreso en el programa</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Track */}
        <div className="absolute h-0.5"
          style={{ top: '15px', left: '16px', right: '16px', background: trackCol }} />

        {/* Animated progress fill — stroke-draw effect */}
        <div className="absolute h-0.5"
          style={{
            top: '15px',
            left: '16px',
            width: drawn ? `calc((100% - 32px) * ${progressPct})` : '0px',
            transition: 'width 800ms ease-out',
            background: 'linear-gradient(90deg, #ab1c42, #e04a6e)',
            boxShadow: '0 0 6px rgba(224,74,110,0.5)',
          }} />

        {/* Nodes */}
        <div className="flex justify-between">
          {STATUSES.map((s, idx) => {
            const entry     = getEntry(s.key);
            const completed = idx < currentIdx;
            const isActive  = idx === currentIdx;
            const isPending = idx > currentIdx;

            return (
              <div key={s.key}
                className="flex flex-col items-center gap-1 relative"
                style={{ width: '32px' }}
                onMouseEnter={() => entry && setTip(s.key)}
                onMouseLeave={() => setTip(null)}>

                {/* Tooltip */}
                {tip === s.key && entry && (
                  <div className="absolute z-20 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
                    style={{
                      bottom: 'calc(100% + 6px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: dark ? '#2a1218' : '#fff',
                      border: `1px solid ${dark ? 'rgba(171,28,66,0.5)' : '#f0d8dd'}`,
                      color: dark ? '#fff' : '#1a0a0e',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}>
                    {fmtLong(entry.date)}
                  </div>
                )}

                {/* Node circle */}
                <div className="relative w-8 h-8 flex items-center justify-center">
                  {/* Pulsing glow ring — active only */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: '#e04a6e', opacity: 0.35, animationDuration: '2s' }} />
                  )}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                    style={{
                      background: (completed || isActive) ? '#ab1c42' : (dark ? '#1e0e12' : '#fff8f9'),
                      borderColor: (completed || isActive) ? '#e04a6e' : (dark ? 'rgba(74,8,32,0.4)' : '#f0d8dd'),
                      opacity: isPending ? 0.3 : 1,
                      transition: 'all 500ms ease-out',
                    }}>
                    {completed && <CheckCircle2 size={13} color="white" />}
                    {isActive  && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Status label */}
                <span className="text-[10px] font-semibold text-center leading-tight mt-0.5"
                  style={{
                    color: isPending
                      ? (dark ? 'rgba(249,208,216,0.25)' : '#d0b0bc')
                      : (dark ? 'rgba(249,208,216,0.75)' : '#6b3045'),
                  }}>
                  {s.label}
                </span>

                {/* Date (completed nodes) */}
                {entry && !isActive && (
                  <span className="text-[9px]"
                    style={{ color: dark ? 'rgba(249,208,216,0.3)' : '#b090a0' }}>
                    {fmtShort(entry.date)}
                  </span>
                )}
                {/* "ahora" badge (active node) */}
                {isActive && (
                  <span className="text-[9px] font-bold" style={{ color: '#e04a6e' }}>
                    ahora
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active status strip */}
      <div className="mt-8 p-3 rounded-xl border flex items-center gap-2.5"
        style={{ background: rowBg, borderColor: rowBorder }}>
        <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
          style={{ background: '#e04a6e' }} />
        <div className="min-w-0 flex-1">
          <span className={`text-xs font-semibold ${textCls}`}>Cliente activo</span>
          {getEntry('active') && (
            <span className={`text-xs ml-1.5 ${subCls}`}>
              desde {fmtLong(getEntry('active')!.date)}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(224,74,110,0.15)', color: '#e04a6e' }}>
          EN PROGRESO
        </span>
      </div>
    </div>
  );
}
