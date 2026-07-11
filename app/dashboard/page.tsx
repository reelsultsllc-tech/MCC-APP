'use client';

import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, FileText, BarChart3, Wallet, BookOpen,
  PhoneCall, Settings, Bell, Search, ChevronRight,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  Clock, Zap, Target, ChevronDown, X,
  ArrowUpRight, ArrowDownRight, RefreshCw, Eye, Lock,
  Menu, Sun, Moon, ChevronLeft, Activity,
} from 'lucide-react';
import { CreditCard3D } from '@/components/demo/credit-card-3d';
import { WhatIfSimulator } from '@/components/demo/what-if-simulator';
import { AIInsights } from '@/components/demo/ai-insights';

type Theme = 'dark' | 'light';

const BASE_SCORE = 742;
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview',         id: 'overview' },
  { icon: FileText,         label: 'Disputes',         id: 'disputes', badge: 3 },
  { icon: BarChart3,        label: 'Reports',          id: 'reports' },
  { icon: Wallet,           label: 'Wallet & Billing', id: 'wallet' },
];
const SUPPORT_ITEMS = [
  { icon: BookOpen,  label: 'Documents',     id: 'documents' },
  { icon: PhoneCall, label: 'Advance Calls', id: 'calls' },
  { icon: Settings,  label: 'Settings',      id: 'settings' },
];
const DISPUTES = [
  { id: 1, title: 'New Dispute Resolved',  desc: 'Medic atten - Signarer appointe signatee decline - 1TT pe signing',  time: '2h ago',  status: 'success', pts: '+62' },
  { id: 2, title: 'Medical/rolputee',      desc: 'Medical econore - S1C - Sectinc. Signing signing users 3 ago',       time: '8h ago',  status: 'error',   pts: '-12' },
  { id: 3, title: 'Udtilmute aliee',       desc: 'Create oester.bowl: 329 - You Fin credit monitor...',                 time: '1d ago',  status: 'warning', pts: '+18' },
];
const SCORE_HISTORY = [
  { month: 'Jan', score: 680 }, { month: 'Feb', score: 695 },
  { month: 'Mar', score: 701 }, { month: 'Apr', score: 718 },
  { month: 'May', score: 725 }, { month: 'Jun', score: 742 },
];
const FACTORS = [
  { label: 'Payment History',    value: 98, color: '#22c55e', trend: 'up' },
  { label: 'Credit Utilization', value: 24, color: '#ef4444', trend: 'down' },
  { label: 'Account Age',        value: 72, color: '#f59e0b', trend: 'up' },
  { label: 'Credit Mix',         value: 85, color: '#3b82f6', trend: 'up' },
  { label: 'New Inquiries',      value: 60, color: '#a855f7', trend: 'neutral' },
];

const T = {
  dark: {
    bg: '#0d0507',
    card: 'linear-gradient(135deg, #1e0e12 0%, #150a0d 100%)',
    cardBorder: 'rgba(74,8,32,0.45)',
    skeletonBg: '#2a1218',
    text: 'text-white',
    sub: 'text-wine-200/50',
    inputBg: '#1e0e12', inputBorder: 'rgba(74,8,32,0.55)',
    rowBg: '#150a0d',   rowBorder: 'rgba(74,8,32,0.3)',
    trackBg: '#2a1218',
  },
  light: {
    bg: '#faf4f5',
    card: '#ffffff',
    cardBorder: '#f0d8dd',
    skeletonBg: '#f0d8dd',
    text: 'text-gray-900',
    sub: 'text-wine-800/50',
    inputBg: '#fff0f3', inputBorder: '#f0d0d8',
    rowBg: '#fff8f9',   rowBorder: '#f0d8dd',
    trackBg: '#f5e0e4',
  },
} as const;

// ── SkeletonCard ──────────────────────────────────────────────────────────────
function SkeletonCard({ theme, lines = 4 }: { theme: Theme; lines?: number }) {
  const bg = T[theme].skeletonBg;
  return (
    <div className="p-5 space-y-3">
      <div className="skeleton-line h-4 w-1/3 rounded" style={{ background: bg }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-line rounded" style={{ background: bg, height: '10px', width: `${65 + (i % 3) * 15}%` }} />
      ))}
      <div className="skeleton-line h-8 w-full rounded-xl" style={{ background: bg }} />
    </div>
  );
}

// ── GlowCard ──────────────────────────────────────────────────────────────────
function GlowCard({ children, theme, className = '', delay = 0, loaded }: {
  children: React.ReactNode; theme: Theme; className?: string; delay?: number; loaded: boolean;
}) {
  const t = T[theme];
  return (
    <div
      className={`glow-card rounded-2xl border transition-all duration-700 overflow-hidden ${className} ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ background: t.card, borderColor: t.cardBorder, transitionDelay: `${delay}ms` }}
    >
      <div className="beam" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ── AnimatedCounter ───────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1800 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(target);
  const prevTarget = useRef(target);

  useEffect(() => {
    const from = prevTarget.current;
    prevTarget.current = target;
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(from + (target - from) * e));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return <span>{count}</span>;
}

// ── CreditGauge ───────────────────────────────────────────────────────────────
function CreditGauge({ score, theme }: { score: number; theme: Theme }) {
  const [mounted, setMounted] = useState(false);
  const r = 80; const cx = 100; const cy = 105;
  const startA = -210; const endA = 30; const totalA = endA - startA;
  const circ = (Math.PI * r * totalA) / 180;
  const pct  = (score - 300) / (850 - 300);
  const offset = circ - pct * circ;
  const toXY = (a: number, rad = r) => {
    const rd = ((a - 90) * Math.PI) / 180;
    return { x: cx + rad * Math.cos(rd), y: cy + rad * Math.sin(rd) };
  };
  const s = toXY(startA); const e = toXY(endA);
  const arc = `M ${s.x} ${s.y} A ${r} ${r} 0 1 1 ${e.x} ${e.y}`;
  const needleA = startA + totalA * pct;
  const nRad = ((needleA - 90) * Math.PI) / 180;
  const nx = cx + (r - 12) * Math.cos(nRad);
  const ny = cy + (r - 12) * Math.sin(nRad);
  const trackColor = theme === 'dark' ? '#2a1218' : '#f0d8dd';

  useEffect(() => { const t = setTimeout(() => setMounted(true), 400); return () => clearTimeout(t); }, []);

  return (
    <svg width="200" height="145" viewBox="0 0 200 145">
      <defs>
        <linearGradient id="gG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#dc2626" />
          <stop offset="30%"  stopColor="#f97316" />
          <stop offset="60%"  stopColor="#facc15" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glowSm">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d={arc} fill="none" stroke="url(#gG)" strokeWidth="18" strokeLinecap="round"
        opacity="0.1"
        strokeDasharray={`${circ}`}
        strokeDashoffset={mounted ? offset : circ}
        style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.34,1.4,0.64,1)' }}
      />
      <path d={arc} fill="none" stroke={trackColor} strokeWidth="13" strokeLinecap="round" />
      <path d={arc} fill="none" stroke="url(#gG)" strokeWidth="13" strokeLinecap="round"
        strokeDasharray={`${circ}`}
        strokeDashoffset={mounted ? offset : circ}
        style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.34,1.4,0.64,1)', filter: 'url(#glow)' }}
      />
      {[0, 0.25, 0.5, 0.75, 1].map(p => {
        const a = startA + totalA * p;
        const i = toXY(a, r - 20); const o = toXY(a, r - 9);
        return <line key={p} x1={i.x} y1={i.y} x2={o.x} y2={o.y} stroke={trackColor} strokeWidth="1.5" />;
      })}
      <line x1={cx} y1={cy} x2={mounted ? nx : cx} y2={mounted ? ny : cy}
        stroke={theme === 'dark' ? '#fce7eb' : '#7a1838'} strokeWidth="2.5" strokeLinecap="round"
        style={{ transition: 'x2 1.8s cubic-bezier(0.34,1.4,0.64,1), y2 1.8s cubic-bezier(0.34,1.4,0.64,1)', filter: 'url(#glowSm)' }}
      />
      <circle cx={cx} cy={cy} r="5" fill="#ab1c42" style={{ filter: 'url(#glowSm)' }} />
      <circle cx={cx} cy={cy} r="2.5" fill={theme === 'dark' ? '#fce7eb' : '#fff'} />
      {mounted && (
        <circle cx={nx + Math.cos(nRad) * 12} cy={ny + Math.sin(nRad) * 12}
          r="4" fill="#22c55e"
          style={{ transition: 'cx 1.8s cubic-bezier(0.34,1.4,0.64,1), cy 1.8s cubic-bezier(0.34,1.4,0.64,1)', filter: 'url(#glowSm)' }}
        />
      )}
      <text x="18" y="130" fill={theme === 'dark' ? '#7a1838' : '#f87171'} fontSize="8.5" fontFamily="Inter">300</text>
      <text x="168" y="130" fill="#22c55e" fontSize="8.5" fontFamily="Inter">850</text>
    </svg>
  );
}

// ── FactorBar ─────────────────────────────────────────────────────────────────
function FactorBar({ label, value, color, trend, delay, theme }: {
  label: string; value: number; color: string; trend: string; delay: number; theme: Theme;
}) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 300 + delay); return () => clearTimeout(t); }, [value, delay]);
  const t = T[theme];
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className={`text-xs ${t.sub}`}>{label}</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold ${t.text}`}>{value}%</span>
          {trend === 'up'   && <TrendingUp   size={10} color="#22c55e" />}
          {trend === 'down' && <TrendingDown  size={10} color="#ef4444" />}
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: t.trackBg }}>
        <div className="h-full rounded-full relative overflow-hidden"
          style={{ width: `${w}%`, background: color, transition: 'width 1.1s cubic-bezier(0.34,1.2,0.64,1)', boxShadow: `0 0 8px ${color}88` }}>
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.38),transparent)', backgroundSize: '200% 100%', animation: `shimmer 2.3s infinite ${delay}ms` }} />
        </div>
      </div>
    </div>
  );
}

// ── CompactLevelProgress ─────────────────────────────────────────────────────
const TIERS_COMPACT = [
  { label: 'Poor',      min: 300, max: 579,  color: '#dc2626' },
  { label: 'Fair',      min: 580, max: 669,  color: '#f97316' },
  { label: 'Good',      min: 670, max: 739,  color: '#facc15' },
  { label: 'Very Good', min: 740, max: 799,  color: '#84cc16' },
  { label: 'Excellent', min: 800, max: 850,  color: '#22c55e' },
];
function CompactLevelProgress({ score, theme, loaded }: { score: number; theme: Theme; loaded: boolean }) {
  const [barW, setBarW] = useState(0);
  const current = TIERS_COMPACT.find(t => score >= t.min && score <= t.max) ?? TIERS_COMPACT[0];
  const next    = TIERS_COMPACT[TIERS_COMPACT.findIndex(t => t.label === current.label) + 1] ?? null;
  const pct     = Math.min(100, ((score - current.min) / (current.max - current.min + 1)) * 100);
  useEffect(() => { if (loaded) { const t = setTimeout(() => setBarW(pct), 500); return () => clearTimeout(t); } }, [pct, loaded]);
  const dark = theme === 'dark';
  const trackBg = dark ? '#2a1218' : '#f5e0e4';
  return (
    <div className="mt-2 px-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium" style={{ color: current.color }}>{current.label}</span>
        {next && (
          <span className="text-xs font-semibold" style={{ color: next.color }}>
            {next.min - score} pts → {next.label}
          </span>
        )}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden relative" style={{ background: trackBg }}>
        <div className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
          style={{ width: `${barW}%`, background: `linear-gradient(90deg, ${current.color}99, ${current.color})`, boxShadow: `0 0 8px ${current.color}55` }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.38),transparent)', backgroundSize: '200% 100%', animation: 'shimmer 2.3s infinite' }} />
        </div>
      </div>
    </div>
  );
}

// ── MiniChart ─────────────────────────────────────────────────────────────────
function MiniChart({ theme }: { theme: Theme }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [anim, setAnim]       = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const t = setTimeout(() => setAnim(true), 600); return () => clearTimeout(t); }, []);

  const W = 200; const H = 55;
  const max = Math.max(...SCORE_HISTORY.map(d => d.score));
  const min = Math.min(...SCORE_HISTORY.map(d => d.score)) - 15;
  const pts = SCORE_HISTORY.map((d, i) => ({
    x: (i / (SCORE_HISTORY.length - 1)) * W,
    y: H - ((d.score - min) / (max - min)) * H * 0.85 - 4,
    ...d,
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;

  const dark = theme === 'dark';
  const hpt  = hovered !== null ? pts[hovered] : null;

  return (
    <div ref={containerRef} className="relative">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
        className="overflow-visible" style={{ height: '58px' }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#e04a6e" stopOpacity={dark ? '0.6' : '0.35'} />
            <stop offset="70%"  stopColor="#ab1c42" stopOpacity={dark ? '0.2' : '0.08'} />
            <stop offset="100%" stopColor="#ab1c42" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#ab1c42" />
            <stop offset="100%" stopColor="#e04a6e" />
          </linearGradient>
          <filter id="lGlow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {anim && <path d={area} fill="url(#aG)" />}
        <path d={line} fill="none" stroke="url(#lineG)" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'url(#lGlow)' }} />
        {hovered !== null && hpt && (
          <line x1={hpt.x} y1={0} x2={hpt.x} y2={H}
            stroke={dark ? 'rgba(249,208,216,0.2)' : 'rgba(122,24,56,0.15)'}
            strokeWidth="1" strokeDasharray="3 3" />
        )}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y}
            r={hovered === i ? 5 : (i === pts.length - 1 ? 4 : 3)}
            fill={i === pts.length - 1 || hovered === i ? '#e04a6e' : '#ab1c42'}
            style={{ filter: (i === pts.length - 1 || hovered === i) ? 'url(#lGlow)' : undefined, cursor: 'pointer', transition: 'r 0.15s ease' }}
            onMouseEnter={() => setHovered(i)}
          />
        ))}
      </svg>

      {hovered !== null && hpt && containerRef.current && (() => {
        const rect = containerRef.current!.getBoundingClientRect();
        const svgW = rect.width;
        const xPx = (hpt.x / W) * svgW;
        const yPx = (hpt.y / H) * 58;
        const flip = xPx > svgW * 0.65;
        return (
          <div
            className="absolute pointer-events-none z-20 px-2.5 py-1.5 rounded-lg border text-xs font-semibold shadow-lg"
            style={{
              left: flip ? xPx - 70 : xPx + 10,
              top:  Math.max(0, yPx - 28),
              background: dark ? '#2a1218' : '#fff',
              borderColor: dark ? 'rgba(171,28,66,0.5)' : '#f0d8dd',
              color: dark ? '#fff' : '#1a0a0e',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: '#e04a6e' }}>{hpt.month}</span>
            &nbsp;·&nbsp;{hpt.score}
            <span style={{ color: '#22c55e', marginLeft: 4 }}>
              {hovered > 0 ? `+${hpt.score - pts[hovered - 1].score}` : ''}
            </span>
          </div>
        );
      })()}
    </div>
  );
}

// ── Brand Logo ────────────────────────────────────────────────────────────────
function CoffeeCreditIcon({ size = 32, color = '#dc2626' }: { size?: number; color?: string }) {
  const h = Math.round(size * 0.84);
  return (
    <svg width={size} height={h} viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="30" width="51" height="18" rx="3" stroke={color} strokeWidth="2.2"/>
      <rect x="6.5" y="35.5" width="10" height="7.5" rx="1.5" stroke={color} strokeWidth="1.9"/>
      <line x1="22" y1="38" x2="38" y2="38" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="22" y1="42" x2="32" y2="42" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M9 10 L45 10 L40 30 L14 30 Z" stroke={color} strokeWidth="2.2" strokeLinejoin="round"/>
      <path d="M40 17 Q52 17 52 23 Q52 29 40 29" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 7 Q23 4 21 1" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M31 7 Q33 4 31 1" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function BrandText() {
  return (
    <div className="min-w-0">
      <div className="text-sm font-bold leading-tight tracking-tight">
        <span className="text-white">My Credit </span>
        <span style={{ color: '#e03050' }}>Café</span>
      </div>
      <div className="text-xs tracking-wide" style={{ color: 'rgba(220,150,150,0.45)' }}>
        Better Credit, Better Life.
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, collapsed, setCollapsed, mobileOpen, setMobileOpen }: {
  active: string; setActive: (id: string) => void;
  collapsed: boolean; setCollapsed: (v: boolean) => void;
  mobileOpen: boolean; setMobileOpen: (v: boolean) => void;
}) {
  const sidebarBg = 'linear-gradient(180deg, #2a1218 0%, #150a0d 60%, #0d0507 100%)';

  const NavBtn = ({ item, showLabel }: { item: (typeof NAV_ITEMS)[0]; showLabel: boolean }) => (
    <button
      onClick={() => { setActive(item.id); setMobileOpen(false); }}
      title={collapsed ? item.label : undefined}
      className={`nav-item group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${active === item.id ? 'active text-white' : 'text-wine-200/50 hover:text-white'}`}
      style={active === item.id ? { background: 'rgba(74,30,39,0.7)', borderLeft: '2px solid #ab1c42' } : undefined}
    >
      <item.icon size={16} className="flex-shrink-0" />
      {showLabel && <span className="flex-1 text-left truncate">{item.label}</span>}
      {showLabel && 'badge' in item && item.badge != null && (
        <span className="text-xs px-1.5 py-0.5 rounded-full font-bold text-white" style={{ background: '#ab1c42' }}>{item.badge}</span>
      )}
      {!showLabel && 'badge' in item && item.badge != null && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-wine-600" />
      )}
    </button>
  );

  const Inner = ({ showLabel }: { showLabel: boolean }) => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3.5 border-b border-wine-950/50 flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <CoffeeCreditIcon size={24} color="white" />
          {showLabel && <BrandText />}
        </div>
        {showLabel && (
          <button onClick={() => setCollapsed(true)} className="text-wine-400/40 hover:text-wine-200/70 transition-colors flex-shrink-0">
            <ChevronLeft size={15} />
          </button>
        )}
      </div>
      <nav className="flex-1 px-2 pt-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => <NavBtn key={item.id} item={item} showLabel={showLabel} />)}
        {showLabel && <div className="pt-4 pb-1.5"><span className="text-xs font-semibold uppercase tracking-widest text-wine-800/70 px-3">Support</span></div>}
        {!showLabel && <div className="py-2 border-t border-wine-950/40 my-1" />}
        {SUPPORT_ITEMS.map(item => <NavBtn key={item.id} item={item} showLabel={showLabel} />)}
      </nav>
      {showLabel && (
        <div className="mx-2 mb-3 rounded-xl p-3.5 border border-wine-900/50" style={{ background: 'linear-gradient(135deg,#38171f,#1e0e12)' }}>
          <div className="text-xs text-wine-400/55 uppercase tracking-widest mb-0.5">Membership Tier</div>
          <div className="text-sm font-bold text-white mb-0.5">Concierge Tier</div>
          <div className="text-xs text-wine-300/45 mb-2.5">2 executive overload</div>
          <button className="w-full py-1.5 rounded-lg text-xs font-semibold text-white hover:brightness-110 transition-all"
            style={{ background: 'linear-gradient(135deg,#ab1c42,#7a1838)' }}>Manage Tier</button>
        </div>
      )}
      {!showLabel && (
        <div className="px-2 pb-2">
          <button onClick={() => setCollapsed(false)} className="w-full flex items-center justify-center py-2 rounded-lg text-wine-400/50 hover:text-white transition-colors"
            style={{ background: 'rgba(74,8,32,0.2)' }}><ChevronRight size={15} /></button>
        </div>
      )}
      <div className="px-3 py-3 border-t border-wine-950/50 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#ab1c42,#4a0820)' }}>EM</div>
        {showLabel && (
          <>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">Elara Manchehi</div>
              <div className="text-xs text-wine-400/45">4 months selected</div>
            </div>
            <ChevronDown size={13} className="text-wine-400/35 flex-shrink-0" />
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 border-r border-wine-950/50 transition-all duration-300 ease-in-out overflow-hidden ${collapsed ? 'w-16' : 'w-60'}`}
        style={{ background: sidebarBg }}
      >
        <Inner showLabel={!collapsed} />
      </aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full flex flex-col border-r border-wine-950/50 animate-slide-in-left" style={{ background: sidebarBg }}>
            <Inner showLabel />
          </aside>
        </div>
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeNav, setActiveNav]       = useState('overview');
  const [collapsed, setCollapsed]       = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [theme, setTheme]               = useState<Theme>('dark');
  const [themeLoading, setThemeLoading] = useState(false);
  const [loaded, setLoaded]             = useState(false);
  const [showNotif, setShowNotif]       = useState(false);
  const [searchVal, setSearchVal]       = useState('');
  const [whatIfDelta, setWhatIfDelta]   = useState(0);

  const displayScore = Math.min(850, Math.max(300, BASE_SCORE + whatIfDelta));
  const t = T[theme];

  useEffect(() => { const tid = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(tid); }, []);

  const handleThemeToggle = () => {
    setThemeLoading(true);
    setTimeout(() => { setTheme(prev => prev === 'dark' ? 'light' : 'dark'); setThemeLoading(false); }, 300);
  };

  return (
    <div className="min-h-screen flex" style={{ background: t.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar
        active={activeNav} setActive={setActiveNav}
        collapsed={collapsed} setCollapsed={setCollapsed}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* topbar */}
        <header
          className={`flex items-center gap-3 px-4 sm:px-6 py-3.5 border-b flex-shrink-0 transition-all duration-700 delay-100 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
          style={{ background: 'linear-gradient(90deg,#2a1218 0%,#1e0e12 100%)', borderColor: 'rgba(74,8,32,0.5)' }}
        >
          <button className="lg:hidden text-wine-300/70 hover:text-white transition-colors" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white leading-tight truncate" style={{ fontFamily: 'inherit' }}>Good afternoon, Elena.</h1>
            <p className="text-xs text-wine-300/50 hidden sm:block">Your credit health is looking strong today</p>
          </div>
          <div className="relative hidden md:flex items-center">
            <Search size={13} className="absolute left-3 text-wine-400/40" />
            <input
              value={searchVal} onChange={e => setSearchVal(e.target.value)}
              placeholder="Search disputes, chats..."
              className="text-xs pl-8 pr-3 py-2 rounded-lg outline-none w-44 xl:w-52 text-wine-200/60 placeholder-wine-400/30 border transition-all"
              style={{ background: 'rgba(74,8,32,0.3)', borderColor: 'rgba(74,8,32,0.5)' }}
            />
          </div>
          <button
            onClick={handleThemeToggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
            style={{ background: 'rgba(74,8,32,0.4)', borderColor: 'rgba(74,8,32,0.6)' }}
          >
            {theme === 'dark' ? <Sun size={14} className="text-yellow-300" /> : <Moon size={14} className="text-blue-300" />}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
              style={{ background: 'rgba(74,8,32,0.4)', borderColor: 'rgba(74,8,32,0.6)' }}
            >
              <Bell size={14} className="text-wine-300/70" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-wine-500 animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-wine-400" />
            </button>
            {showNotif && (
              <div
                className="absolute right-0 top-11 w-64 rounded-xl border shadow-2xl z-50 p-4 animate-slide-in-up"
                style={{ background: theme === 'dark' ? '#150a0d' : '#fff', borderColor: t.cardBorder }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-semibold ${t.text}`}>Notifications</span>
                  <button onClick={() => setShowNotif(false)}><X size={13} className="text-wine-400/50" /></button>
                </div>
                {[
                  { text: 'Dispute #3812 resolved', time: '2h ago',  icon: CheckCircle, c: '#22c55e' },
                  { text: 'Score increased +62 pts', time: '1d ago', icon: TrendingUp,  c: '#ab1c42' },
                  { text: 'New report available',    time: '2d ago', icon: FileText,    c: '#f59e0b' },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-t" style={{ borderColor: t.cardBorder }}>
                    <n.icon size={13} color={n.c} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className={`text-xs ${t.text}`}>{n.text}</p>
                      <p className={`text-xs ${t.sub}`}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#ab1c42,#4a0820)' }}>EM</div>
        </header>

        {/* main content */}
        <main className="flex-1 overflow-auto p-4 sm:p-5 xl:p-7 2xl:p-9">
          {themeLoading ? (
            <div className="grid grid-cols-12 gap-4 max-w-screen-2xl mx-auto">
              {[5, 7, 7, 5, 6, 6, 12].map((span, i) => (
                <div key={i} className={`col-span-12 lg:col-span-${span} rounded-2xl border`}
                  style={{ borderColor: t.cardBorder, background: t.card }}>
                  <SkeletonCard theme={theme} lines={3 + (i % 3)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-4 xl:gap-5 2xl:gap-6 max-w-screen-2xl mx-auto">

              {/* Credit Health Score */}
              <GlowCard theme={theme} className="col-span-12 lg:col-span-5" delay={200} loaded={loaded}>
                <div className="p-4 sm:p-5 flex flex-col">
                  <div className="text-center">
                    <div className={`text-xs uppercase tracking-widest mb-1 ${t.sub}`}>Credit Health Score</div>
                    <div className="flex justify-center" style={{ transform: 'scale(0.82)', transformOrigin: 'top center', marginBottom: '-26px' }}>
                      <CreditGauge score={displayScore} theme={theme} />
                    </div>
                    <div className={`text-5xl xl:text-6xl font-bold mt-0 mb-0.5 ${t.text}`}>
                      <AnimatedCounter target={displayScore} />
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      {whatIfDelta >= 0
                        ? <><ArrowUpRight size={13} color="#22c55e" /><span className="text-sm font-semibold text-green-500">+62 pts since January</span></>
                        : <><ArrowDownRight size={13} color="#ef4444" /><span className="text-sm font-semibold text-red-400">What-if simulation active</span></>
                      }
                    </div>
                    <CompactLevelProgress score={displayScore} theme={theme} loaded={loaded} />
                  </div>
                  <div className="flex justify-center mt-4">
                    <CreditCard3D />
                  </div>
                </div>
              </GlowCard>

              {/* Right column */}
              <div className="col-span-12 lg:col-span-7 flex flex-col gap-4 xl:gap-5">
                {/* Quick Action Center */}
                <GlowCard theme={theme} delay={300} loaded={loaded}>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-sm font-semibold ${t.text}`}>Quick Action Center</span>
                      <button className={`text-xs flex items-center gap-1 transition-colors hover:text-wine-500 ${t.sub}`}>View all <ChevronRight size={11} /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                      {[
                        { icon: Zap,        label: 'Disputes',     value: '3',   sub: '2 sponsored',   delta: '+62',     color: '#ab1c42', pct: undefined },
                        { icon: TrendingUp, label: 'Pts Improved', value: '+62', sub: 'Pts this month', delta: undefined, color: '#22c55e', pct: 78 },
                        { icon: Target,     label: 'Active',       value: '78%', sub: 'Achieved',       delta: undefined, color: '#f59e0b', pct: 78 },
                      ].map((item, i) => (
                        <div key={i} className="rounded-xl p-3 sm:p-4 border cursor-pointer transition-all duration-200 hover:scale-[1.03]"
                          style={{ background: t.rowBg, borderColor: t.rowBorder }}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${item.color}22` }}>
                              <item.icon size={14} color={item.color} />
                            </div>
                            {item.delta && <span className="text-xs font-bold" style={{ color: item.color }}>{item.delta}</span>}
                          </div>
                          <div className={`text-lg sm:text-xl font-bold mb-0.5 ${t.text}`}>{item.value}</div>
                          <div className={`text-xs leading-tight ${t.sub}`}>{item.sub}</div>
                          {item.pct !== undefined && (
                            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: t.trackBg }}>
                              <div className="h-full rounded-full relative overflow-hidden"
                                style={{ width: loaded ? `${item.pct}%` : '0%', background: item.color,
                                  transition: `width 1.1s cubic-bezier(0.34,1.2,0.64,1) ${800 + i * 150}ms`,
                                  boxShadow: `0 0 6px ${item.color}88` }}>
                                <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }} />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </GlowCard>

                {/* Score Trend + Factors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-5">
                  <GlowCard theme={theme} delay={400} loaded={loaded}>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-sm font-semibold ${t.text}`}>Score Trend</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-green-500" style={{ background: '#22c55e22' }}>+9.1%</span>
                      </div>
                      <div className="flex items-end gap-2 mb-3">
                        <span className={`text-2xl font-bold ${t.text}`}>{displayScore}</span>
                        <span className="text-xs text-green-500 mb-1 flex items-center gap-0.5 font-medium"><ArrowUpRight size={10} /> 62 pts</span>
                      </div>
                      <MiniChart theme={theme} />
                      <div className="flex justify-between mt-1">
                        {SCORE_HISTORY.map(d => <span key={d.month} className={`text-xs ${t.sub}`}>{d.month}</span>)}
                      </div>
                    </div>
                  </GlowCard>
                  <GlowCard theme={theme} delay={500} loaded={loaded}>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-sm font-semibold ${t.text}`}>Score Factors</span>
                        <Activity size={14} className="text-wine-500/60" />
                      </div>
                      {FACTORS.map((f, i) => <FactorBar key={f.label} {...f} delay={i * 120} theme={theme} />)}
                    </div>
                  </GlowCard>
                </div>
              </div>

              {/* What-If Simulator */}
              <GlowCard theme={theme} className="col-span-12 lg:col-span-6" delay={550} loaded={loaded}>
                <WhatIfSimulator baseScore={BASE_SCORE} onDeltaChange={setWhatIfDelta} theme={theme} />
              </GlowCard>

              {/* AI Insights */}
              <GlowCard theme={theme} className="col-span-12 lg:col-span-6" delay={600} loaded={loaded}>
                <AIInsights theme={theme} />
              </GlowCard>

              {/* Recent Disputes */}
              <GlowCard theme={theme} className="col-span-12 lg:col-span-7" delay={650} loaded={loaded}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-sm font-semibold ${t.text}`}>Recent Disputes</span>
                    <button className={`text-xs flex items-center gap-1 transition-colors hover:text-wine-500 ${t.sub}`}>More <ChevronRight size={11} /></button>
                  </div>
                  <div className="space-y-2.5">
                    {DISPUTES.map((d, i) => {
                      const Icon = d.status === 'success' ? CheckCircle : d.status === 'error' ? AlertCircle : Clock;
                      const c = d.status === 'success' ? '#22c55e' : d.status === 'error' ? '#ef4444' : '#f59e0b';
                      return (
                        <div key={d.id} className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                          style={{ background: t.rowBg, borderColor: t.rowBorder, animationDelay: `${i * 80}ms` }}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${c}22` }}>
                            <Icon size={13} color={c} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-xs font-semibold truncate ${t.text}`}>{d.title}</span>
                              <span className="text-xs font-bold flex-shrink-0" style={{ color: c }}>{d.pts}</span>
                            </div>
                            <p className={`text-xs mt-0.5 leading-relaxed line-clamp-2 ${t.sub}`}>{d.desc}</p>
                            <span className={`text-xs mt-1 block ${t.sub}`}>{d.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button className={`mt-4 w-full py-2.5 rounded-xl border text-xs font-semibold transition-all hover:border-wine-600/50 flex items-center justify-center gap-2 ${t.sub}`}
                    style={{ background: t.rowBg, borderColor: t.rowBorder }}>+ Open new item</button>
                </div>
              </GlowCard>

              {/* Account Summary */}
              <GlowCard theme={theme} className="col-span-12 lg:col-span-5" delay={700} loaded={loaded}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-sm font-semibold ${t.text}`}>Account Summary</span>
                    <div className="flex items-center gap-2">
                      {[RefreshCw, Eye].map((Icon, i) => (
                        <button key={i} className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
                          style={{ background: t.rowBg, borderColor: t.rowBorder }}>
                          <Icon size={11} className="text-wine-500/60" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Total Credit Limit', value: '$48,200', delta: '+$2,500', up: true  },
                      { label: 'Current Balance',    value: '$11,568', delta: '-$820',   up: false },
                      { label: 'Available Credit',   value: '$36,632', delta: '+$3,320', up: true  },
                      { label: 'Utilization Rate',   value: '24.0%',   delta: '-1.7%',   up: true  },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl border transition-all"
                        style={{ background: t.rowBg, borderColor: t.rowBorder }}>
                        <div>
                          <div className={`text-xs ${t.sub}`}>{item.label}</div>
                          <div className={`text-base font-bold mt-0.5 ${t.text}`}>{item.value}</div>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-semibold ${item.up ? 'text-green-500' : 'text-red-500'}`}>
                          {item.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{item.delta}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 rounded-xl flex items-center gap-3 border"
                    style={{ background: theme === 'dark' ? 'linear-gradient(135deg,#2a1218,#1e0e12)' : '#fff5f6', borderColor: t.cardBorder }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#ab1c4222' }}>
                      <Lock size={13} color="#ab1c42" />
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${t.text}`}>Identity Protection Active</div>
                      <div className={`text-xs ${t.sub}`}>Monitoring 3 bureaus 24/7</div>
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </div>
                </div>
              </GlowCard>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
