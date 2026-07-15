'use client';

import { useState, useEffect } from 'react';
import { Route, CheckCircle2, FileText, ExternalLink, Send, Truck, BadgeCheck } from 'lucide-react';

type Theme = 'dark' | 'light';

const STATUSES = [
  { key: 'lead',      label: 'Lead'       },
  { key: 'prospect',  label: 'Prospecto'  },
  { key: 'active',    label: 'Activo'     },
  { key: 'completed', label: 'Completado' },
] as const;

type StatusKey = typeof STATUSES[number]['key'];

// LetterStream tracking contract
// source: 'letterstream_api' = confirmed delivery; null = API not yet active, fallback to uploadDate
interface TrackingInfo {
  status: 'sent' | 'in_transit' | 'delivered';
  sentDate: string;
  inTransitDate?: string;
  deliveredDate?: string;
  signedBy?: string;
  source: 'letterstream_api' | null;
}

interface DocItem {
  id: string;
  name: string;
  uploadDate: string;
  url: string;
  tracking?: TrackingInfo;
}

// Mock — replace with merged data from:
// statusHistory: Zapier/CDM webhook { currentStatus, statusHistory: [{ status, date }] }
// documents: Google Drive signed links + LetterStream tracking API
// LetterStream API activation pending — source: null means fallback to uploadDate
const TIMELINE_DATA = {
  currentStatus: 'active' as StatusKey,
  statusHistory: [
    { status: 'lead'     as StatusKey, date: '2025-12-01' },
    { status: 'prospect' as StatusKey, date: '2025-12-15' },
    { status: 'active'   as StatusKey, date: '2026-01-05' },
  ],
  documents: [
    {
      id: 'doc_001',
      name: 'Carta enviada',
      uploadDate: '2026-06-02',
      url: '/docs/sample.pdf',
      tracking: {
        status: 'delivered' as const,
        sentDate: '2026-06-02',
        inTransitDate: '2026-06-03',
        deliveredDate: '2026-06-05',
        signedBy: 'J. Rodriguez',
        source: 'letterstream_api' as const,
      },
    },
    {
      id: 'doc_002',
      name: 'Carta enviada',
      uploadDate: '2026-07-01',
      url: '/docs/sample.pdf',
      tracking: {
        status: 'sent' as const,
        sentDate: '2026-07-01',
        source: null, // LetterStream API not yet active — using upload date as fallback
      },
    },
  ] as DocItem[],
};

// Node column width: 36px to fit active node at 1.3× (34px) with glow overflow
const COL = 36;

function pendingLine(dark: boolean): string {
  const c = dark ? 'rgba(74,8,32,0.5)' : 'rgba(180,120,140,0.4)';
  return `repeating-linear-gradient(to bottom, ${c} 0px, ${c} 4px, transparent 4px, transparent 10px)`;
}

export function StrategyTimeline({ theme }: { theme: Theme }) {
  const [drawn, setDrawn] = useState(false);
  const [tip,   setTip]   = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDrawn(true), 300);
    return () => clearTimeout(id);
  }, []);

  const dark      = theme === 'dark';
  const textCls   = dark ? 'text-white'         : 'text-gray-900';
  const subCls    = dark ? 'text-wine-200/50'   : 'text-wine-800/50';
  const rowBg     = dark ? '#150a0d'            : '#fff8f9';
  const rowBorder = dark ? 'rgba(74,8,32,0.3)' : '#f0d8dd';

  const currentIdx = STATUSES.findIndex(s => s.key === TIMELINE_DATA.currentStatus);

  const getEntry = (key: string) =>
    TIMELINE_DATA.statusHistory.find(h => h.status === key);

  const getDocsForStatus = (statusKey: string, idx: number): DocItem[] => {
    const entry = getEntry(statusKey);
    if (!entry) return [];
    const start = new Date(entry.date).getTime();
    let end = Infinity;
    for (let i = idx + 1; i < STATUSES.length; i++) {
      const nextEntry = getEntry(STATUSES[i].key);
      if (nextEntry) { end = new Date(nextEntry.date).getTime(); break; }
    }
    return TIMELINE_DATA.documents.filter(doc =>
      new Date(doc.uploadDate).getTime() >= start &&
      new Date(doc.uploadDate).getTime() < end
    );
  };

  const fmtLong  = (d: string) =>
    new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtShort = (d: string) =>
    new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #ab1c4230, #4a082020)' }}>
          <Route size={15} color="#e04a6e" />
        </div>
        <div>
          <div className={`text-sm font-semibold ${textCls}`}>Strategy Plan</div>
          <div className={`text-xs ${subCls}`}>Tu progreso en el programa</div>
        </div>
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: 'rgba(224,74,110,0.15)', color: '#e04a6e' }}>
          EN PROGRESO
        </span>
      </div>

      {/* Horizontal phase strip */}
      <div className="relative mb-6">
        {/* Background line */}
        <div className="absolute inset-x-[10px] top-[10px] h-px"
          style={{ background: dark ? 'rgba(74,8,32,0.4)' : '#f0d8dd' }} />
        {/* Progress line */}
        <div className="absolute top-[10px] left-[10px] h-px transition-all duration-700"
          style={{
            width: currentIdx === 0
              ? '0px'
              : `calc(${(currentIdx / (STATUSES.length - 1) * 100).toFixed(1)}% - ${(currentIdx / (STATUSES.length - 1) * 20).toFixed(1)}px)`,
            background: 'linear-gradient(to right, #7a1838, #e04a6e)',
          }} />
        {/* Dots + labels */}
        <div className="flex justify-between">
          {STATUSES.map((s, idx) => {
            const completed = idx < currentIdx;
            const isActive  = idx === currentIdx;
            const isPending = idx > currentIdx;
            return (
              <div key={s.key} className="flex flex-col items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center border-2 flex-shrink-0"
                  style={{
                    background:  isPending ? (dark ? '#150a0d' : '#fff8f9') : isActive ? '#d42050' : '#ab1c42',
                    borderColor: isPending ? (dark ? 'rgba(74,8,32,0.4)' : '#e0c8d0') : isActive ? '#ff3a66' : '#e04a6e',
                    boxShadow:   isActive ? '0 0 10px rgba(224,74,110,0.45)' : 'none',
                  }}>
                  {completed && <CheckCircle2 size={9} color="white" />}
                  {isActive  && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </div>
                <span className="text-[8px] font-semibold text-center whitespace-nowrap"
                  style={{
                    color: isPending
                      ? (dark ? 'rgba(249,208,216,0.22)' : '#c8a8b8')
                      : isActive ? '#e04a6e'
                      : (dark ? 'rgba(249,208,216,0.6)' : '#7a3050'),
                  }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical timeline */}
      <div className="flex flex-col">
        {STATUSES.map((s, idx) => {
          const entry      = getEntry(s.key);
          const completed  = idx < currentIdx;
          const isActive   = idx === currentIdx;
          const isPending  = idx > currentIdx;
          const isLast     = idx === STATUSES.length - 1;
          const nodeDocs   = (completed || isActive) ? getDocsForStatus(s.key, idx) : [];
          // Segment after this node is "recorrido" only when it connects two completed nodes
          const solidLine  = idx < currentIdx;

          return (
            <div key={s.key} className="flex gap-3">

              {/* ── Node + line column ──────────────────────────────── */}
              <div className="flex flex-col items-center flex-shrink-0" style={{ width: `${COL}px` }}>

                {/* Node container */}
                <div className="relative flex items-center justify-center"
                  style={{ width: `${COL}px`, height: `${COL}px` }}>

                  {/* Active: soft outer halo */}
                  {isActive && (
                    <div className="absolute rounded-full pointer-events-none"
                      style={{ width: '44px', height: '44px', background: 'rgba(224,74,110,0.1)' }} />
                  )}
                  {/* Active: animate-ping ring */}
                  {isActive && (
                    <div className="absolute rounded-full animate-ping pointer-events-none"
                      style={{ width: '34px', height: '34px', background: '#e04a6e', opacity: 0.22, animationDuration: '2s' }} />
                  )}

                  {/* Node circle */}
                  <button
                    className="relative rounded-full flex items-center justify-center border-2 transition-all duration-300"
                    style={{
                      width:       isActive ? '34px' : '26px',
                      height:      isActive ? '34px' : '26px',
                      background:  isPending ? 'transparent' : isActive ? '#d42050' : '#ab1c42',
                      borderColor: isPending
                        ? (dark ? 'rgba(74,8,32,0.3)' : '#e0c8d0')
                        : isActive ? '#ff3a66' : '#e04a6e',
                      boxShadow: isActive ? '0 0 18px rgba(224,74,110,0.55)' : 'none',
                    }}
                    onMouseEnter={() => entry && !isPending && setTip(s.key)}
                    onMouseLeave={() => setTip(null)}
                  >
                    {completed && <CheckCircle2 size={12} color="white" />}
                    {isActive  && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    {/* pending: intentionally empty */}
                  </button>
                </div>

                {/* Connecting line — stroke-draw (scaleY 0→1), 800ms ease-out, cascaded */}
                {!isLast && (
                  <div className="my-1 origin-top"
                    style={{
                      width: '2px',
                      flex: '1 0 20px',
                      background: solidLine
                        ? 'linear-gradient(to bottom, #e04a6e, #ab1c42)'
                        : pendingLine(dark),
                      transform:  drawn ? 'scaleY(1)' : 'scaleY(0)',
                      transition: `transform 800ms ease-out ${idx * 180}ms`,
                    }} />
                )}
              </div>

              {/* ── Label + tooltip + docs ─────────────────────────── */}
              <div className={`flex-1 min-w-0 relative ${isLast ? '' : 'pb-4'}`}>

                {/* Tooltip — hover on completed / active */}
                {tip === s.key && entry && (
                  <div className="absolute left-0 z-20 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none"
                    style={{
                      bottom:    'calc(100% + 4px)',
                      background: dark ? '#2a1218' : '#fff',
                      border:     `1px solid ${dark ? 'rgba(171,28,66,0.5)' : '#f0d8dd'}`,
                      color:      dark ? '#fff' : '#1a0a0e',
                      boxShadow:  '0 4px 14px rgba(0,0,0,0.35)',
                    }}>
                    {fmtLong(entry.date)}
                  </div>
                )}

                {/* Status label row — height matches node column */}
                <div className="flex items-center gap-1.5" style={{ height: `${COL}px` }}>
                  <span className="font-semibold"
                    style={{
                      fontSize: isActive ? '13px' : '12px',
                      color: isPending
                        ? (dark ? 'rgba(249,208,216,0.2)' : '#c8a8b8')
                        : isActive
                          ? (dark ? 'rgba(249,208,216,0.95)' : '#2a0e18')
                          : (dark ? 'rgba(249,208,216,0.7)'  : '#5a1830'),
                    }}>
                    {s.label}
                  </span>
                  {entry && (
                    <span className="text-[10px]"
                      style={{ color: dark ? 'rgba(249,208,216,0.35)' : '#b090a0' }}>
                      {isActive ? `— desde ${fmtShort(entry.date)}` : `— ${fmtShort(entry.date)}`}
                    </span>
                  )}
                  {isActive && (
                    <span className="ml-auto text-[9px] font-bold" style={{ color: '#e04a6e' }}>ahora</span>
                  )}
                </div>

                {/* Inline documents with LetterStream tracking status */}
                {nodeDocs.length > 0 && (
                  <div className="mt-1.5 space-y-2">
                    {nodeDocs.map(doc => (
                      <DocRow key={doc.id} doc={doc} fmtShort={fmtShort}
                        rowBg={rowBg} rowBorder={rowBorder} subCls={subCls} dark={dark} />
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

// Document row: file header + LetterStream tracking status line
function DocRow({ doc, fmtShort, rowBg, rowBorder, subCls, dark }: {
  doc: DocItem;
  fmtShort: (d: string) => string;
  rowBg: string; rowBorder: string; subCls: string; dark: boolean;
}) {
  const t = doc.tracking;

  type TrackLine = { Icon: React.ElementType; color: string; label: string };

  const trackLine = (): TrackLine => {
    if (!t || !t.source) {
      // LetterStream API not active — show sent date only
      const fallbackColor = dark ? 'rgba(249,208,216,0.35)' : '#9a7080';
      return { Icon: Send, color: fallbackColor, label: `Enviada — ${fmtShort(t?.sentDate ?? doc.uploadDate)}` };
    }
    if (t.status === 'delivered' && t.deliveredDate) {
      return {
        Icon: BadgeCheck,
        color: '#22c55e',
        label: `Entregada ${fmtShort(t.deliveredDate)}${t.signedBy ? ` · Firmado: ${t.signedBy}` : ''}`,
      };
    }
    if (t.status === 'in_transit') {
      return { Icon: Truck, color: '#f59e0b', label: `En tránsito — ${fmtShort(t.inTransitDate ?? t.sentDate)}` };
    }
    return { Icon: Send, color: dark ? 'rgba(249,208,216,0.35)' : '#9a7080', label: `Enviada — ${fmtShort(t.sentDate)}` };
  };

  const { Icon: TIcon, color: tColor, label: tLabel } = trackLine();

  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: rowBg, borderColor: rowBorder }}>
      <div className="flex items-center gap-2 px-2.5 py-1.5">
        <FileText size={11} style={{ color: '#e04a6e', flexShrink: 0 }} />
        <span className={`text-[10px] flex-1 min-w-0 truncate ${subCls}`}>
          {doc.name} — {fmtShort(doc.uploadDate)}
        </span>
        <a href={doc.url} target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-0.5 text-[10px] font-semibold hover:opacity-75 transition-opacity"
          style={{ color: '#e04a6e' }}>
          Ver <ExternalLink size={9} />
        </a>
      </div>
      {/* Tracking status */}
      <div className="flex items-center gap-1.5 px-2.5 pb-1.5 border-t"
        style={{ borderColor: dark ? 'rgba(74,8,32,0.2)' : '#f0e8ec' }}>
        <TIcon size={9} style={{ color: tColor, flexShrink: 0 }} />
        <span className="text-[9px] font-medium" style={{ color: tColor }}>{tLabel}</span>
      </div>
    </div>
  );
}
