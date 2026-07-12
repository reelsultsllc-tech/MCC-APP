'use client';

import { useRef, useState } from 'react';

export type SeriesPoint  = { value: number; date: string };
export type MetricSeries = { name: string; data: SeriesPoint[]; accent?: MetricAccent };
export type MetricAccent = 'emerald' | 'rose' | 'neutral' | 'blue' | 'amber';
export type ChartView    = 'curve' | 'bar';
export type ChartSeries  = { name: string; data: SeriesPoint[]; color: string };

export const ACCENTS: Record<MetricAccent, { stroke: string; fill: string; text: string }> = {
  emerald: { stroke: '#22c55e', fill: 'rgba(34,197,94,0.14)',  text: '#22c55e' },
  rose:    { stroke: '#e04a6e', fill: 'rgba(224,74,110,0.14)', text: '#e04a6e' },
  neutral: { stroke: '#71717a', fill: 'rgba(113,113,122,0.1)', text: '#71717a' },
  blue:    { stroke: '#3b82f6', fill: 'rgba(59,130,246,0.14)', text: '#3b82f6' },
  amber:   { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.14)', text: '#f59e0b' },
};

export const SERIES_COLORS = ['#e04a6e', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7'];

export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (abs >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(Math.round(n));
}

// Catmull-Rom → cubic bezier smooth curve
function catmullRom(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

const VB_W = 500;
const VB_H = 160;
const PAD  = { t: 22, r: 10, b: 22, l: 10 };

interface MetricChartProps {
  series: ChartSeries[];
  view: ChartView;
  defaultIndex: number;
  valueFormatter: (v: number) => string;
  dateFormatter: (d: string) => string;
}

export function MetricChart({ series, view, defaultIndex, valueFormatter, dateFormatter }: MetricChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const primary = series[0];
  if (!primary || primary.data.length < 2) return null;

  const n   = primary.data.length;
  const cW  = VB_W - PAD.l - PAD.r;
  const cH  = VB_H - PAD.t  - PAD.b;

  const allVals = series.flatMap(s => s.data.map(d => d.value));
  const minV    = Math.min(...allVals);
  const maxV    = Math.max(...allVals);
  const range   = maxV - minV || 1;

  const toX = (i: number) => PAD.l + (i / (n - 1)) * cW;
  const toY = (v: number) => PAD.t + (1 - (v - minV) / range) * cH;

  const activeIdx = hovered ?? defaultIndex;
  const hoverPt   = primary.data[activeIdx];
  const hoverX    = toX(activeIdx);
  const flipRight = activeIdx > n * 0.6;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    setHovered(Math.max(0, Math.min(n - 1, Math.round(xRatio * (n - 1)))));
  };

  return (
    <div className="relative h-full w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="h-full w-full"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          {series.map((s, si) => (
            <linearGradient key={si} id={`mcg${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={s.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* hover guide */}
        <line
          x1={hoverX} y1={PAD.t} x2={hoverX} y2={VB_H - PAD.b}
          stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3 3"
        />

        {series.map((s, si) => {
          const pts = s.data.map((d, i) => ({ x: toX(i), y: toY(d.value) }));

          if (view === 'bar') {
            const bw = Math.max(4, (cW / n) * 0.5);
            return (
              <g key={si}>
                {pts.map((p, i) => (
                  <rect key={i}
                    x={p.x - bw / 2} y={p.y}
                    width={bw} height={VB_H - PAD.b - p.y}
                    fill={i === activeIdx ? s.color : s.color + '55'}
                    rx="3"
                    style={{ transition: 'fill 0.15s' }}
                  />
                ))}
              </g>
            );
          }

          const linePath = catmullRom(pts);
          const areaPath = `${linePath} L ${pts[n-1].x} ${VB_H - PAD.b} L ${pts[0].x} ${VB_H - PAD.b} Z`;

          return (
            <g key={si}>
              <path d={areaPath} fill={`url(#mcg${si})`} />
              <path d={linePath} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              {pts.map((p, i) => {
                const show = i === activeIdx || i === n - 1;
                return show ? (
                  <circle key={i} cx={p.x} cy={p.y}
                    r={i === activeIdx ? 5 : 3.5}
                    fill={s.color}
                    style={{ filter: i === activeIdx ? `drop-shadow(0 0 5px ${s.color}aa)` : 'none' }}
                  />
                ) : null;
              })}
            </g>
          );
        })}
      </svg>

      {/* tooltip */}
      {hoverPt && (
        <div
          className="pointer-events-none absolute top-2 z-20 rounded-lg border px-2.5 py-1.5 text-[11px] shadow-md"
          style={{
            ...(flipRight
              ? { right: `${(1 - hoverX / VB_W) * 100}%`, transform: 'translateX(6px)' }
              : { left:  `${(hoverX / VB_W) * 100}%`,     transform: 'translateX(-50%)' }),
            background:   'var(--card,  #fff)',
            borderColor:  'var(--border, #e5e7eb)',
            color:        'var(--foreground, #111)',
            whiteSpace:   'nowrap',
          }}
        >
          <div style={{ color: 'var(--muted-foreground, #888)', fontSize: '10px' }}>
            {dateFormatter(hoverPt.date)}
          </div>
          <div className="font-bold" style={{ color: series[0]?.color }}>
            {valueFormatter(hoverPt.value)}
          </div>
        </div>
      )}
    </div>
  );
}
