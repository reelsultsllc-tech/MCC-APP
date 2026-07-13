'use client';

import { useState, useEffect } from 'react';
import { Route, CheckCircle2, FileText, ExternalLink } from 'lucide-react';

type Theme = 'dark' | 'light';

const STATUSES = [
  { key: 'lead',      label: 'Lead'       },
  { key: 'prospect',  label: 'Prospecto'  },
  { key: 'active',    label: 'Activo'     },
  { key: 'completed', label: 'Completado' },
] as const;

type StatusKey = typeof STATUSES[number]['key'];

interface DocItem { id: string; name: string; uploadDate: string; url: string; }

// Mock — replace with merged data from:
// statusHistory: Zapier/CDM webhook { currentStatus, statusHistory: [{ status, date }] }
// documents: Google Drive signed links { documents: [{ id, uploadDate, url }] }
// 'name' comes from Drive file.name in production; url must be a signed temporary link (PII)
const TIMELINE_DATA = {
  currentStatus: 'active' as StatusKey,
  statusHistory: [
    { status: 'lead'     as StatusKey, date: '2025-12-01' },
    { status: 'prospect' as StatusKey, date: '2025-12-15' },
    { status: 'active'   as StatusKey, date: '2026-01-05' },
  ],
  documents: [
    { id: 'doc_001', name: 'Carta enviada', uploadDate: '2026-06-03', url: '/docs/sample.pdf' },
    { id: 'doc_002', name: 'Carta enviada', uploadDate: '2026-07-01', url: '/docs/sample.pdf' },
  ] as DocItem[],
};

export function StrategyTimeline({ theme }: { theme: Theme }) {
  const [drawn, setDrawn] = useState(false);
  const [tip,   setTip]   = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDrawn(true), 300);
    return () => clearTimeout(id);
  }, []);

  const dark      = theme === 'dark';
  const textCls   = dark ? 'text-white'           : 'text-gray-900';
  const subCls    = dark ? 'text-wine-200/50'     : 'text-wine-800/50';
  const rowBg     = dark ? '#150a0d'              : '#fff8f9';
  const rowBorder = dark ? 'rgba(74,8,32,0.3)'   : '#f0d8dd';
  const lineColor = dark ? '#2a1218'              : '#f0d8dd';

  const currentIdx = STATUSES.findIndex(s => s.key === TIMELINE_DATA.currentStatus);

  const getEntry = (key: string) =>
    TIMELINE_DATA.statusHistory.find(h => h.status === key);

  // Documents that fall within this status period (by upload date vs status transition dates)
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

      {/* Vertical timeline */}
      <div className="flex flex-col">
        {STATUSES.map((s, idx) => {
          const entry     = getEntry(s.key);
          const completed = idx < currentIdx;
          const isActive  = idx === currentIdx;
          const isPending = idx > currentIdx;
          const isLast    = idx === STATUSES.length - 1;
          const nodeDocs  = (completed || isActive) ? getDocsForStatus(s.key, idx) : [];

          return (
            <div key={s.key} className="flex gap-3">

              {/* Left: node + animated connecting line */}
              <div className="flex flex-col items-center" style={{ width: '28px', flexShrink: 0 }}>
                <div className="relative flex items-center justify-center" style={{ width: '28px', height: '28px' }}>
                  {/* Pulsing glow — active node only */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: '#e04a6e', opacity: 0.3, animationDuration: '2s' }} />
                  )}
                  {/* Node circle — hover triggers tooltip */}
                  <button
                    className="w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-500"
                    style={{
                      background:  (completed || isActive) ? '#ab1c42' : (dark ? '#1e0e12' : '#fff8f9'),
                      borderColor: (completed || isActive) ? '#e04a6e' : (dark ? 'rgba(74,8,32,0.4)' : '#f0d8dd'),
                      opacity: isPending ? 0.3 : 1,
                    }}
                    onMouseEnter={() => entry && setTip(s.key)}
                    onMouseLeave={() => setTip(null)}
                  >
                    {completed && <CheckCircle2 size={12} color="white" />}
                    {isActive  && <div className="w-2 h-2 rounded-full bg-white" />}
                  </button>
                </div>

                {/* Vertical line segment — stroke-draw animation, cascaded per segment */}
                {!isLast && (
                  <div className="w-0.5 my-1 origin-top"
                    style={{
                      flex: '1 0 20px',
                      background: completed
                        ? 'linear-gradient(to bottom, #e04a6e, #ab1c4266)'
                        : lineColor,
                      transform: drawn ? 'scaleY(1)' : 'scaleY(0)',
                      transition: `transform 500ms ease-out ${idx * 150}ms`,
                    }} />
                )}
              </div>

              {/* Right: status label + inline documents */}
              <div className={`flex-1 min-w-0 relative ${isLast ? '' : 'pb-4'}`}>

                {/* Tooltip — completed nodes only, 150ms fade */}
                {tip === s.key && entry && (
                  <div className="absolute left-0 z-20 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
                    style={{
                      bottom: 'calc(100% + 2px)',
                      background: dark ? '#2a1218' : '#fff',
                      border: `1px solid ${dark ? 'rgba(171,28,66,0.5)' : '#f0d8dd'}`,
                      color: dark ? '#fff' : '#1a0a0e',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                      transition: 'opacity 150ms ease',
                    }}>
                    {fmtLong(entry.date)}
                  </div>
                )}

                {/* Status header row — vertically centered with node */}
                <div className="flex items-center gap-1.5" style={{ height: '28px' }}>
                  <span className="text-xs font-semibold"
                    style={{
                      color: isPending
                        ? (dark ? 'rgba(249,208,216,0.25)' : '#d0b0bc')
                        : (dark ? 'rgba(249,208,216,0.85)' : '#4a1828'),
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

                {/* Inline documents — appear under completed/active nodes */}
                {nodeDocs.length > 0 && (
                  <div className="mt-1.5 space-y-1.5">
                    {nodeDocs.map(doc => (
                      <div key={doc.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                        style={{ background: rowBg, border: `1px solid ${rowBorder}` }}>
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
