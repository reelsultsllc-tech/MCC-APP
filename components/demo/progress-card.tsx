'use client';

import { TrendingUp, CheckCircle2, Circle, Loader2 } from 'lucide-react';

type Theme = 'dark' | 'light';

interface RoundSnapshot { round: string; date: string; score: number; }
interface Milestone {
  round: string;
  status: 'completed' | 'in_progress' | 'pending';
  label?: string;
  estimatedDate?: string;
}

// Mock — replace with API fetch when backend is ready
const PROGRESS_DATA = {
  scoreAtStart:   680,
  scoreCurrent:   742,
  clientSince:    '2026-01-05',
  roundSnapshots: [
    { round: 'Kickoff', date: '2026-01-05', score: 680 },
    { round: 'Ronda 1', date: '2026-06-03', score: 705 },
    { round: 'Ronda 2', date: '2026-07-01', score: 742 },
  ] as RoundSnapshot[],
  milestones: [
    { round: 'Ronda 1', status: 'completed',  label: '2 items eliminados'         },
    { round: 'Ronda 2', status: 'in_progress', label: 'Carta enviada a Equifax'    },
    { round: 'Ronda 3', status: 'pending',     estimatedDate: '2026-09-01'         },
  ] as Milestone[],
};

export function ProgressCard({ theme }: { theme: Theme }) {
  const { scoreAtStart, scoreCurrent, clientSince, roundSnapshots, milestones } = PROGRESS_DATA;
  const delta  = scoreCurrent - scoreAtStart;
  const dark   = theme === 'dark';
  const textCls = dark ? 'text-white'           : 'text-gray-900';
  const subCls  = dark ? 'text-wine-200/50'     : 'text-wine-800/50';
  const rowBg   = dark ? '#150a0d'              : '#fff8f9';
  const rowBorder = dark ? 'rgba(74,8,32,0.3)' : '#f0d8dd';

  // Mini SVG chart — one point per round snapshot
  const W = 300; const H = 64;
  const scores = roundSnapshots.map(r => r.score);
  const minS   = Math.min(...scores) - 12;
  const maxS   = Math.max(...scores) + 8;
  const pts    = roundSnapshots.map((r, i) => ({
    x: (i / (roundSnapshots.length - 1)) * (W - 20) + 10,
    y: H - 18 - ((r.score - minS) / (maxS - minS)) * (H - 26),
    ...r,
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  const clientDate = new Date(clientSince).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #ab1c4230, #4a082020)' }}>
          <TrendingUp size={15} color="#e04a6e" />
        </div>
        <div>
          <div className={`text-sm font-semibold ${textCls}`}>Tu progreso</div>
          <div className={`text-xs ${subCls}`}>Lo que ya lograste con nosotros</div>
        </div>
      </div>

      {/* Score delta */}
      <div className="rounded-xl p-4 mb-4 border" style={{ background: rowBg, borderColor: rowBorder }}>
        <div className={`text-xs mb-2 ${subCls}`}>Cliente desde {clientDate}</div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-center">
            <div className={`text-[10px] uppercase tracking-wide mb-1 ${subCls}`}>Score inicial</div>
            <div className={`text-2xl font-bold ${textCls}`}>{scoreAtStart}</div>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1 px-2">
            <span className="text-xs font-bold text-green-400">+{delta} pts</span>
            <div className="w-full h-px relative overflow-hidden rounded-full"
              style={{ background: dark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.2)' }}>
              <div className="absolute inset-y-0 left-0 w-full rounded-full"
                style={{ background: 'linear-gradient(90deg, rgba(34,197,94,0.4), #22c55e)' }} />
            </div>
            <TrendingUp size={11} color="#22c55e" />
          </div>
          <div className="text-center">
            <div className={`text-[10px] uppercase tracking-wide mb-1 ${subCls}`}>Score actual</div>
            <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>{scoreCurrent}</div>
          </div>
        </div>
      </div>

      {/* Round chart */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
        style={{ height: '64px', overflow: 'visible' }}>
        <defs>
          <linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#e04a6e" stopOpacity={dark ? '0.45' : '0.25'} />
            <stop offset="100%" stopColor="#e04a6e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#pgGrad)" />
        <path d={linePath} fill="none" stroke="#e04a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#e04a6e"
              style={{ filter: 'drop-shadow(0 0 4px #e04a6eaa)' }} />
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8.5"
              fill={dark ? 'rgba(249,208,216,0.7)' : '#9a5060'} fontFamily="Inter">{p.score}</text>
            <text x={p.x} y={H - 2}
              textAnchor={i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}
              fontSize="7.5" fill={dark ? 'rgba(249,208,216,0.35)' : '#b090a0'} fontFamily="Inter">
              {p.round}
            </text>
          </g>
        ))}
      </svg>

      {/* Milestones */}
      <div className="mt-4 space-y-2.5">
        {milestones.map((m, i) => {
          const done   = m.status === 'completed';
          const active = m.status === 'in_progress';
          const color  = done ? '#22c55e' : active ? '#e04a6e' : (dark ? 'rgba(249,208,216,0.25)' : '#d0b0bc');
          return (
            <div key={i} className="flex items-center gap-2.5">
              {done   && <CheckCircle2 size={14} style={{ color: '#22c55e', flexShrink: 0 }} />}
              {active && (
                <div className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0"
                  style={{ borderColor: '#e04a6e', background: '#ab1c4230', animation: 'pulse 2s infinite' }} />
              )}
              {!done && !active && <Circle size={14} style={{ color, flexShrink: 0 }} />}
              <span className="text-xs font-semibold" style={{ color }}>
                {m.round}
              </span>
              <span className={`text-xs ${subCls}`}>
                {done || active
                  ? `— ${m.label}`
                  : `— estimado ${m.estimatedDate
                      ? new Date(m.estimatedDate).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })
                      : ''}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
