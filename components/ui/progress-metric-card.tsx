'use client';

import { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MetricChart, formatCompact, ACCENTS, type MetricSeries, type MetricAccent, type ChartView } from './metric-chart';
import { ViewToggle, PeriodSelect, type PeriodOption } from './metric-controls';

export interface ProgressMetricCardProps {
  title:          string;
  subtitle?:      string;
  series:         MetricSeries[];
  accent?:        MetricAccent;
  periods?:       PeriodOption[];
  unit?:          string;
  valueFormatter?: (v: number) => string;
  dateFormatter?:  (d: string) => string;
}

const DEFAULT_PERIODS: PeriodOption[] = [
  { label: '3M', points: 3 },
  { label: '6M', points: 6 },
  { label: '1A', points: 12 },
];

export function ProgressMetricCard({
  title,
  subtitle,
  series,
  accent       = 'rose',
  periods      = DEFAULT_PERIODS,
  unit         = '',
  valueFormatter = (v) => formatCompact(v) + (unit ? ` ${unit}` : ''),
  dateFormatter  = (d) => d,
}: ProgressMetricCardProps) {
  const [view,          setView]          = useState<ChartView>('curve');
  const [periodIdx,     setPeriodIdx]     = useState(1);

  const accentTokens = ACCENTS[accent];
  const accentColor  = accentTokens.stroke;

  const slicedSeries = useMemo(() => {
    const pts = periods[periodIdx]?.points;
    if (!pts) return series;
    return series.map(s => ({ ...s, data: s.data.slice(-pts) }));
  }, [series, periods, periodIdx]);

  const primary = slicedSeries[0];
  const latest  = primary?.data.at(-1)?.value  ?? 0;
  const first   = primary?.data.at(0)?.value   ?? 0;
  const delta   = latest - first;
  const pct     = first !== 0 ? (delta / first) * 100 : 0;
  const isPos   = delta >= 0;

  const chartSeries = slicedSeries.map((s, i) => ({
    name:  s.name,
    data:  s.data,
    color: s.accent ? ACCENTS[s.accent].stroke : accentColor,
  }));

  return (
    <div className="flex flex-col h-full p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--foreground, #fff)' }}>{title}</div>
          {subtitle && (
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground, rgba(249,208,216,0.5))' }}>{subtitle}</div>
          )}
        </div>
        <ViewToggle view={view} onChange={setView} accentColor={accentColor} />
      </div>

      {/* Primary metric */}
      <div className="flex items-end gap-2 mb-1">
        <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--foreground, #fff)' }}>
          {valueFormatter(latest)}
        </span>
        <div className={`flex items-center gap-0.5 text-xs font-semibold mb-1 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          <span>{isPos ? '+' : ''}{formatCompact(delta)}{unit ? ` ${unit}` : ''}</span>
        </div>
        <div
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold mb-1"
          style={{ background: isPos ? '#22c55e22' : '#e04a6e22', color: isPos ? '#22c55e' : '#e04a6e' }}
        >
          {isPos ? '+' : ''}{pct.toFixed(1)}%
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0" style={{ height: '90px' }}>
        <MetricChart
          series={chartSeries}
          view={view}
          defaultIndex={Math.max(0, (chartSeries[0]?.data.length ?? 1) - 1)}
          valueFormatter={valueFormatter}
          dateFormatter={dateFormatter}
        />
      </div>

      {/* Period selector */}
      <div className="flex items-center justify-between mt-2">
        <PeriodSelect
          periods={periods}
          selected={periodIdx}
          onChange={setPeriodIdx}
          accentColor={accentColor}
        />
        <span className="text-[10px]" style={{ color: 'var(--muted-foreground, rgba(249,208,216,0.4))' }}>
          {primary?.data.at(0)?.date} – {primary?.data.at(-1)?.date}
        </span>
      </div>
    </div>
  );
}
