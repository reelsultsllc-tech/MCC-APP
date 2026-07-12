'use client';

import { TrendingUp, BarChart2 } from 'lucide-react';
import type { ChartView } from './metric-chart';

export type PeriodOption = { label: string; points?: number };

interface ViewToggleProps {
  view: ChartView;
  onChange: (v: ChartView) => void;
  accentColor?: string;
}

export function ViewToggle({ view, onChange, accentColor = '#e04a6e' }: ViewToggleProps) {
  const base = 'pointer-events-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200';
  return (
    <div className="flex gap-1 pointer-events-auto" style={{ background: 'var(--muted, rgba(74,8,32,0.25))', borderRadius: '10px', padding: '3px' }}>
      {(['curve', 'bar'] as ChartView[]).map((v) => {
        const active = view === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={base}
            style={{
              background:  active ? 'var(--card, #1e0e12)' : 'transparent',
              color:       active ? accentColor : 'var(--muted-foreground, rgba(249,208,216,0.5))',
              boxShadow:   active ? '0 1px 4px rgba(0,0,0,0.25)' : 'none',
            }}
          >
            {v === 'curve' ? <TrendingUp className="w-3.5 h-3.5" /> : <BarChart2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{v === 'curve' ? 'Línea' : 'Barras'}</span>
          </button>
        );
      })}
    </div>
  );
}

interface PeriodSelectProps {
  periods: PeriodOption[];
  selected: number;
  onChange: (idx: number) => void;
  accentColor?: string;
}

export function PeriodSelect({ periods, selected, onChange, accentColor = '#e04a6e' }: PeriodSelectProps) {
  return (
    <div className="flex gap-1 pointer-events-auto flex-wrap">
      {periods.map((p, idx) => {
        const active = selected === idx;
        return (
          <button
            key={idx}
            onClick={() => onChange(idx)}
            className="pointer-events-auto px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background:  active ? `${accentColor}22` : 'transparent',
              color:       active ? accentColor : 'var(--muted-foreground, rgba(249,208,216,0.5))',
              border:      `1px solid ${active ? accentColor + '55' : 'transparent'}`,
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
